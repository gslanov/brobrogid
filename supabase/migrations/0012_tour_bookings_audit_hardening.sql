-- BROBROGID — Round 2 hardening for tour_bookings
-- Addresses ARCHITECT findings (error.md, 2nd pass):
--
-- 4. [ВЫСОКО] ON DELETE SET NULL — заметание следов через удаление тура
-- 5. [СРЕДНЕ] Admin UPDATE без whitelist — status laundering
-- 6. [СРЕДНЕ] Honeypot падает с явной ошибкой → бот адаптируется
-- 3. [ВЫСОКО] SECURITY DEFINER privesc risk — усилить документацию + GUARD комментарий

-- ============================================================================
-- FIX 4: ON DELETE SET NULL → ON DELETE RESTRICT
-- Запрещает удаление тура/гида пока есть привязанные заявки.
-- Если admin хочет удалить тур — обязан сначала разобрать его заявки
-- (выставить status='cancelled' или удалить вручную). Аудит-след сохраняется.
-- ============================================================================

ALTER TABLE public.tour_bookings
  DROP CONSTRAINT IF EXISTS tour_bookings_tour_id_fkey;

ALTER TABLE public.tour_bookings
  ADD CONSTRAINT tour_bookings_tour_id_fkey
  FOREIGN KEY (tour_id) REFERENCES public.tours(id)
  ON DELETE RESTRICT;

ALTER TABLE public.tour_bookings
  DROP CONSTRAINT IF EXISTS tour_bookings_guide_id_fkey;

ALTER TABLE public.tour_bookings
  ADD CONSTRAINT tour_bookings_guide_id_fkey
  FOREIGN KEY (guide_id) REFERENCES public.guides(id)
  ON DELETE RESTRICT;

-- Дополнительно: snapshot-поля для случая если RESTRICT когда-нибудь обойдут
-- (например через CASCADE на родительской таблице или manual TRUNCATE).
-- Trigger ниже копирует id в snapshot при INSERT — снимок неубиваем.
ALTER TABLE public.tour_bookings
  ADD COLUMN IF NOT EXISTS tour_id_snapshot TEXT,
  ADD COLUMN IF NOT EXISTS guide_id_snapshot TEXT;

CREATE OR REPLACE FUNCTION public.tour_bookings_snapshot_ids()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  -- Снимок tour_id/guide_id на момент INSERT — нельзя стереть удалением тура
  NEW.tour_id_snapshot := NEW.tour_id;
  NEW.guide_id_snapshot := NEW.guide_id;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS booking_snapshot_ids ON public.tour_bookings;
CREATE TRIGGER booking_snapshot_ids
  BEFORE INSERT ON public.tour_bookings
  FOR EACH ROW
  EXECUTE FUNCTION public.tour_bookings_snapshot_ids();

-- ============================================================================
-- FIX 5: Admin UPDATE column whitelist — only status, never customer data
-- Защита от status laundering: admin не может переписать phone/ip/created_at
-- ============================================================================

REVOKE UPDATE ON public.tour_bookings FROM authenticated;
GRANT UPDATE (status) ON public.tour_bookings TO authenticated;

-- Policy остаётся та же (USING is_admin), но теперь GRANT ограничивает columns
-- Проверим что policy всё ещё in place
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'tour_bookings'
      AND policyname = 'tour_bookings_admin_update'
  ) THEN
    CREATE POLICY tour_bookings_admin_update ON public.tour_bookings
      FOR UPDATE
      TO authenticated
      USING (public.is_admin())
      WITH CHECK (public.is_admin());
  END IF;
END $$;

-- Также блокируем UPDATE create_at/updated_at через trigger (defense-in-depth)
CREATE OR REPLACE FUNCTION public.tour_bookings_immutable_fields()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  -- Эти поля никогда не должны меняться после INSERT
  IF NEW.created_at IS DISTINCT FROM OLD.created_at THEN
    RAISE EXCEPTION 'created_at is immutable';
  END IF;
  IF NEW.id IS DISTINCT FROM OLD.id THEN
    RAISE EXCEPTION 'id is immutable';
  END IF;
  IF NEW.customer_phone IS DISTINCT FROM OLD.customer_phone THEN
    RAISE EXCEPTION 'customer_phone is immutable';
  END IF;
  IF NEW.customer_email IS DISTINCT FROM OLD.customer_email THEN
    RAISE EXCEPTION 'customer_email is immutable';
  END IF;
  IF NEW.customer_name IS DISTINCT FROM OLD.customer_name THEN
    RAISE EXCEPTION 'customer_name is immutable';
  END IF;
  IF NEW.tour_id IS DISTINCT FROM OLD.tour_id THEN
    RAISE EXCEPTION 'tour_id is immutable';
  END IF;
  IF NEW.tour_id_snapshot IS DISTINCT FROM OLD.tour_id_snapshot THEN
    RAISE EXCEPTION 'tour_id_snapshot is immutable';
  END IF;
  IF NEW.guide_id_snapshot IS DISTINCT FROM OLD.guide_id_snapshot THEN
    RAISE EXCEPTION 'guide_id_snapshot is immutable';
  END IF;
  IF NEW.ip_address IS DISTINCT FROM OLD.ip_address THEN
    RAISE EXCEPTION 'ip_address is immutable';
  END IF;
  IF NEW.honeypot IS DISTINCT FROM OLD.honeypot THEN
    RAISE EXCEPTION 'honeypot is immutable';
  END IF;
  -- updated_at автоматически обновляется существующим триггером — это OK
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS booking_immutable_fields ON public.tour_bookings;
CREATE TRIGGER booking_immutable_fields
  BEFORE UPDATE ON public.tour_bookings
  FOR EACH ROW
  EXECUTE FUNCTION public.tour_bookings_immutable_fields();

-- ============================================================================
-- FIX 6: Honeypot soft-fail — silently mark as spam instead of hard error
-- Бот не получает обратной связи "honeypot detected" → не адаптируется.
-- Запись успешно создаётся (HTTP 201), но status='spam', админ её увидит.
-- ============================================================================

-- Удаляем CHECK constraint
ALTER TABLE public.tour_bookings
  DROP CONSTRAINT IF EXISTS tour_bookings_honeypot_check;

-- Перенесём логику honeypot в существующий rate-limit trigger
-- Но сначала — отдельный pre-trigger который ставит status='spam' и пропускает
CREATE OR REPLACE FUNCTION public.tour_bookings_honeypot_softfail()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  -- Если honeypot заполнен — это бот. Молча принимаем, но помечаем.
  IF NEW.honeypot IS NOT NULL AND NEW.honeypot != '' THEN
    NEW.status := 'spam';
    -- Также обнуляем чувствительные поля чтобы не хранить мусор от ботов
    -- (но оставляем phone/ip для аналитики паттернов спама)
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS booking_honeypot_softfail ON public.tour_bookings;
CREATE TRIGGER booking_honeypot_softfail
  BEFORE INSERT ON public.tour_bookings
  FOR EACH ROW
  EXECUTE FUNCTION public.tour_bookings_honeypot_softfail();

-- ============================================================================
-- FIX 3 reinforcement: SECURITY DEFINER warning + lockdown
-- ============================================================================

COMMENT ON FUNCTION public.check_booking_rate_limit() IS
  E'⚠️ SECURITY DEFINER FUNCTION ⚠️\n'
  '\n'
  'Runs as postgres role, BYPASSING RLS for internal SELECT.\n'
  'Owner: postgres. Granted EXECUTE to: anon, authenticated.\n'
  '\n'
  'CRITICAL: при изменении этой функции в будущих миграциях,\n'
  'НИКОГДА не добавлять INSERT/UPDATE/DELETE на другие таблицы.\n'
  'Только SELECT из public.tour_bookings.\n'
  '\n'
  'Иначе anon роль получит косвенный write-доступ в обход RLS\n'
  'через триггер. Это privilege escalation vector.\n'
  '\n'
  'search_path жёстко зафиксирован — нельзя сократить даже временно.\n'
  '\n'
  'Если нужна доп. логика (audit log, alerts) — выноси в SEPARATE\n'
  'функцию с SECURITY INVOKER, вызываемую из admin tools, не из триггера.';

-- Также добавим documentation comment на сами триггеры для будущих агентов
COMMENT ON TRIGGER booking_snapshot_ids ON public.tour_bookings IS
  'Снимает tour_id/guide_id в snapshot-поля при INSERT. Нужно для аудита, '
  'если родительская запись будет удалена в обход RESTRICT (например через TRUNCATE).';

COMMENT ON TRIGGER booking_immutable_fields ON public.tour_bookings IS
  'Запрещает UPDATE на customer_*, tour_id, ip_address, honeypot, created_at. '
  'Defense-in-depth поверх column-level GRANT — admin может UPDATE только status.';

COMMENT ON TRIGGER booking_honeypot_softfail ON public.tour_bookings IS
  'Soft-fail honeypot: вместо ошибки молча ставит status=spam. '
  'Бот не получает feedback "honeypot detected" и не адаптируется.';

-- ============================================================================
-- Cleanup: документируем что 0012 закрывает
-- ============================================================================

COMMENT ON COLUMN public.tour_bookings.tour_id_snapshot IS
  'Snapshot tour_id at INSERT time. Survives FK CASCADE/SET NULL. Audit trail.';
COMMENT ON COLUMN public.tour_bookings.guide_id_snapshot IS
  'Snapshot guide_id at INSERT time. Survives FK CASCADE/SET NULL. Audit trail.';
