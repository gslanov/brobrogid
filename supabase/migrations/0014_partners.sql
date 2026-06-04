-- BROBROGID — Партнёрский кабинет (partners)
--
-- АДДИТИВНАЯ, идемпотентная миграция. Ничего существующего НЕ удаляет и НЕ меняет:
--   * не трогает public_read / admin_write политики из 0008/0009
--   * не трогает anon_insert / admin_* политики tour_bookings из 0010-0012
--   * только ДОБАВЛЯЕТ: таблицу partners, колонки owner_id, функцию is_partner(),
--     новые partner_* политики и grants.
--
-- Модель ролей:
--   * admin    — app_metadata.role = 'admin'   (см. is_admin(), 0009)
--   * partner  — app_metadata.role = 'partner'  (новая роль, см. is_partner() ниже)
--   * partner видит/правит ТОЛЬКО свои сущности (owner_id = current_user_id()).
--   * INSERT/DELETE на guides/pois/tours партнёру НЕ даётся — контент заводит админ
--     (модерация). Партнёр только редактирует уже привязанные к нему строки.
--
-- ВАЖНО по типам: guides.id / tours.id — TEXT (не uuid). owner_id ссылается на
-- auth.users(id) (uuid). tour_bookings.tour_id / guide_id — TEXT.

-- ============================================================================
-- 1. Таблица partners
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.partners (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  type        TEXT NOT NULL CHECK (type IN ('guide', 'lodging')),
  name        TEXT NOT NULL,
  contacts    JSONB NOT NULL DEFAULT '{}'::JSONB,
  status      TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('pending', 'active', 'suspended')),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_partners_user_id ON public.partners (user_id);
CREATE INDEX IF NOT EXISTS idx_partners_type ON public.partners (type);
CREATE INDEX IF NOT EXISTS idx_partners_status ON public.partners (status);

ALTER TABLE public.partners ENABLE ROW LEVEL SECURITY;

COMMENT ON TABLE public.partners IS
  'Партнёры кабинета (гиды/жильё). user_id = auth.users(id) с app_metadata.role=partner.';

-- ============================================================================
-- 2. owner_id на guides / pois / tours (аддитивно, nullable)
-- ============================================================================

ALTER TABLE public.guides ADD COLUMN IF NOT EXISTS owner_id UUID REFERENCES auth.users(id) ON DELETE SET NULL;
ALTER TABLE public.pois   ADD COLUMN IF NOT EXISTS owner_id UUID REFERENCES auth.users(id) ON DELETE SET NULL;
ALTER TABLE public.tours  ADD COLUMN IF NOT EXISTS owner_id UUID REFERENCES auth.users(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_guides_owner_id ON public.guides (owner_id);
CREATE INDEX IF NOT EXISTS idx_pois_owner_id   ON public.pois (owner_id);
CREATE INDEX IF NOT EXISTS idx_tours_owner_id  ON public.tours (owner_id);

COMMENT ON COLUMN public.guides.owner_id IS 'Партнёр-владелец (auth.users.id). NULL = нет партнёра, управляет только админ.';
COMMENT ON COLUMN public.pois.owner_id   IS 'Партнёр-владелец (auth.users.id). NULL = нет партнёра, управляет только админ.';
COMMENT ON COLUMN public.tours.owner_id  IS 'Партнёр-владелец (auth.users.id). NULL = нет партнёра, управляет только админ.';

-- ============================================================================
-- 3. Хелпер is_partner() — зеркало is_admin() (0009), но role='partner'
-- ============================================================================

CREATE OR REPLACE FUNCTION public.is_partner()
RETURNS boolean AS $$
BEGIN
  RETURN COALESCE(
    current_setting('request.jwt.claims', true)::jsonb -> 'app_metadata' ->> 'role' = 'partner',
    current_setting('request.jwt.claims', true)::jsonb ->> 'role' = 'partner',
    false
  );
EXCEPTION WHEN OTHERS THEN
  RETURN false;
END;
$$ LANGUAGE plpgsql STABLE;

COMMENT ON FUNCTION public.is_partner() IS
  'true если JWT.app_metadata.role = partner. Зеркало is_admin() из 0009.';

-- ============================================================================
-- 4. RLS — partners (владелец видит/правит свою строку, админ — всё)
-- ============================================================================

-- SELECT: владелец своей строки + админ
DROP POLICY IF EXISTS partners_owner_select ON public.partners;
CREATE POLICY partners_owner_select ON public.partners
  FOR SELECT TO authenticated
  USING (user_id = public.current_user_id() OR public.is_admin());

-- UPDATE: владелец правит свою строку (не может сменить user_id — WITH CHECK), админ — всё
DROP POLICY IF EXISTS partners_owner_update ON public.partners;
CREATE POLICY partners_owner_update ON public.partners
  FOR UPDATE TO authenticated
  USING (user_id = public.current_user_id() OR public.is_admin())
  WITH CHECK (user_id = public.current_user_id() OR public.is_admin());

-- INSERT/DELETE партнёру не даём — записи заводит админ (через service_role при провижининге).
DROP POLICY IF EXISTS partners_admin_write ON public.partners;
CREATE POLICY partners_admin_write ON public.partners
  FOR ALL TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- ============================================================================
-- 5. RLS — guides/pois/tours: ТОЛЬКО ДОБАВЛЯЕМ partner_select / partner_update.
--    Существующие *_public_read (anon+authenticated SELECT true) и *_admin_write
--    (FOR ALL is_admin) НЕ трогаем.
--
--    Внимание: public_read уже даёт партнёру SELECT всех строк (USING true) — это
--    ожидаемо для публичного портала. Отдельный partner_select добавлен явно ради
--    читаемости/будущего ужесточения; политики SELECT объединяются по OR, поэтому
--    он не ограничивает и не ломает существующее поведение.
-- ============================================================================

-- guides
DROP POLICY IF EXISTS guides_partner_select ON public.guides;
CREATE POLICY guides_partner_select ON public.guides
  FOR SELECT TO authenticated
  USING (public.is_partner() AND owner_id = public.current_user_id());

DROP POLICY IF EXISTS guides_partner_update ON public.guides;
CREATE POLICY guides_partner_update ON public.guides
  FOR UPDATE TO authenticated
  USING (public.is_partner() AND owner_id = public.current_user_id())
  WITH CHECK (public.is_partner() AND owner_id = public.current_user_id());

-- pois
DROP POLICY IF EXISTS pois_partner_select ON public.pois;
CREATE POLICY pois_partner_select ON public.pois
  FOR SELECT TO authenticated
  USING (public.is_partner() AND owner_id = public.current_user_id());

DROP POLICY IF EXISTS pois_partner_update ON public.pois;
CREATE POLICY pois_partner_update ON public.pois
  FOR UPDATE TO authenticated
  USING (public.is_partner() AND owner_id = public.current_user_id())
  WITH CHECK (public.is_partner() AND owner_id = public.current_user_id());

-- tours
DROP POLICY IF EXISTS tours_partner_select ON public.tours;
CREATE POLICY tours_partner_select ON public.tours
  FOR SELECT TO authenticated
  USING (public.is_partner() AND owner_id = public.current_user_id());

DROP POLICY IF EXISTS tours_partner_update ON public.tours;
CREATE POLICY tours_partner_update ON public.tours
  FOR UPDATE TO authenticated
  USING (public.is_partner() AND owner_id = public.current_user_id())
  WITH CHECK (public.is_partner() AND owner_id = public.current_user_id());

-- ============================================================================
-- 6. RLS — tour_bookings: партнёр видит/обновляет заявки на свои туры/как свой гид.
--    Существующие tour_bookings_anon_insert / tour_bookings_admin_read /
--    tour_bookings_admin_update НЕ трогаем.
--
--    Owner определяется по tours.owner_id (тур партнёра) ИЛИ guides.owner_id
--    (партнёр-гид). UPDATE на уровне колонок уже ограничен до status
--    (GRANT UPDATE (status), 0012) + trigger booking_immutable_fields — партнёр,
--    как и админ, может менять только status. RLS здесь скейлит только строки.
-- ============================================================================

DROP POLICY IF EXISTS tour_bookings_partner_select ON public.tour_bookings;
CREATE POLICY tour_bookings_partner_select ON public.tour_bookings
  FOR SELECT TO authenticated
  USING (
    public.is_partner() AND (
      EXISTS (
        SELECT 1 FROM public.tours t
        WHERE t.id = tour_bookings.tour_id
          AND t.owner_id = public.current_user_id()
      )
      OR EXISTS (
        SELECT 1 FROM public.guides g
        WHERE g.id = tour_bookings.guide_id
          AND g.owner_id = public.current_user_id()
      )
    )
  );

DROP POLICY IF EXISTS tour_bookings_partner_update ON public.tour_bookings;
CREATE POLICY tour_bookings_partner_update ON public.tour_bookings
  FOR UPDATE TO authenticated
  USING (
    public.is_partner() AND (
      EXISTS (
        SELECT 1 FROM public.tours t
        WHERE t.id = tour_bookings.tour_id
          AND t.owner_id = public.current_user_id()
      )
      OR EXISTS (
        SELECT 1 FROM public.guides g
        WHERE g.id = tour_bookings.guide_id
          AND g.owner_id = public.current_user_id()
      )
    )
  )
  WITH CHECK (
    public.is_partner() AND (
      EXISTS (
        SELECT 1 FROM public.tours t
        WHERE t.id = tour_bookings.tour_id
          AND t.owner_id = public.current_user_id()
      )
      OR EXISTS (
        SELECT 1 FROM public.guides g
        WHERE g.id = tour_bookings.guide_id
          AND g.owner_id = public.current_user_id()
      )
    )
  );

-- ============================================================================
-- 7. Grants
-- ============================================================================

-- partners: authenticated работает через RLS (видит/правит свою строку).
-- service_role — полный доступ (провижининг новых партнёров админ-скриптом).
GRANT SELECT, UPDATE ON public.partners TO authenticated;
GRANT ALL ON public.partners TO service_role;

-- guides/pois/tours: SELECT уже выдан anon+authenticated (0002/0004),
-- UPDATE уже выдан authenticated (0009). Новых table-level grant не требуется —
-- RLS-политик partner_* достаточно. (INSERT/DELETE партнёру намеренно не выдаём.)

-- tour_bookings: authenticated уже имеет SELECT + UPDATE(status) (0010/0012).
-- Дополнительных grant не нужно — RLS даёт partner доступ к своим строкам.

-- ============================================================================
-- Конец 0014_partners.sql — повторный запуск безопасен (IF NOT EXISTS / DROP ... IF EXISTS).
-- ============================================================================
