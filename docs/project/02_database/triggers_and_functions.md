---
title: Triggers and Functions — серверная логика БД
type: reference
audience: archimag, security, dev
owner: archimag
last_updated: 2026-04-07
---

# Триггеры и функции PostgreSQL

Вся защита `tour_bookings` от спама/laundering реализована на уровне БД — клиент не может её обойти. См. также `rls_policies.md` (RLS работает поверх триггеров).

## Helper functions

### `public.is_admin()` и `public.current_user_id()`

Описаны в `rls_policies.md`. Используются в RLS policies, но вызываются и из триггеров когда нужно различить admin/anon контекст.

### `public.set_updated_at()`

Универсальный триггер для авто-обновления `updated_at`:

```sql
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;
```

Навешан на все таблицы с `updated_at` колонкой через `BEFORE UPDATE`.

## tour_bookings: 4 триггера защиты

### 1. `tour_bookings_rate_limit` (BEFORE INSERT)

**Цель:** не более 3 заявок с одного телефона за 24 часа.

```sql
CREATE OR REPLACE FUNCTION public.check_booking_rate_limit()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER  -- ⚠️ нужно чтобы читать tour_bookings от anon
SET search_path = public, pg_temp
AS $$
DECLARE
  recent_count int;
BEGIN
  -- Защита от TOCTOU: advisory lock на phone
  PERFORM pg_advisory_xact_lock(hashtext(NEW.customer_phone));

  SELECT count(*) INTO recent_count
  FROM public.tour_bookings
  WHERE customer_phone = NEW.customer_phone
    AND created_at > now() - interval '24 hours';

  IF recent_count >= 3 THEN
    -- Generic error чтобы не раскрывать механизм
    RAISE EXCEPTION 'Booking submission failed';
  END IF;

  RETURN NEW;
END;
$$;

COMMENT ON FUNCTION public.check_booking_rate_limit() IS
  'SECURITY DEFINER — runs as owner to SELECT tour_bookings as anon. DO NOT add INSERT/UPDATE here.';
```

**Почему SECURITY DEFINER:** anon не имеет SELECT на `tour_bookings`. Без `DEFINER` функция упала бы при попытке прочитать count. С `DEFINER` она выполняется от owner (postgres) и может читать.

**Почему advisory lock:** без него два параллельных INSERT могли бы прочитать `count = 2` каждый, оба пройти проверку, и записать → 4 заявки. Lock сериализует проверки по `phone`.

### 2. `tour_bookings_honeypot` (BEFORE INSERT)

**Цель:** soft-fail на ботов которые заполняют скрытое поле.

```sql
CREATE OR REPLACE FUNCTION public.check_booking_honeypot()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  IF NEW.honeypot IS NOT NULL AND NEW.honeypot <> '' THEN
    -- НЕ raise — пускаем но помечаем как spam
    NEW.status = 'spam';
  END IF;
  RETURN NEW;
END;
$$;
```

**Почему soft-fail:** если возвращать ошибку — бот узнает что honeypot его палит и обойдёт. Тихо принимаем + status='spam' → бот думает что прошёл, админ видит флаг и игнорит.

### 3. `tour_bookings_immutable_fields` (BEFORE UPDATE)

**Цель:** запретить менять `created_at`, `id`, `customer_phone`, `customer_email` после создания (защита от laundering — превращения старой заявки в новую).

```sql
CREATE OR REPLACE FUNCTION public.tour_bookings_check_immutable()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  IF NEW.id IS DISTINCT FROM OLD.id THEN
    RAISE EXCEPTION 'id is immutable';
  END IF;
  IF NEW.created_at IS DISTINCT FROM OLD.created_at THEN
    RAISE EXCEPTION 'created_at is immutable';
  END IF;
  IF NEW.customer_phone IS DISTINCT FROM OLD.customer_phone THEN
    RAISE EXCEPTION 'customer_phone is immutable';
  END IF;
  IF NEW.customer_email IS DISTINCT FROM OLD.customer_email THEN
    RAISE EXCEPTION 'customer_email is immutable';
  END IF;
  RETURN NEW;
END;
$$;
```

**Работает даже от postgres** (триггеры применяются ко всем кроме REPLICA), что подтверждено в тестах ARCHITECT.

### 4. `tour_bookings_snapshot` (BEFORE INSERT)

**Цель:** заморозить snapshot тура/гида в момент бронирования (на случай если через месяц цена изменится).

```sql
CREATE OR REPLACE FUNCTION public.tour_bookings_snapshot()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  -- Snapshot tour data
  IF NEW.tour_id IS NOT NULL THEN
    SELECT jsonb_build_object(
      'name', name,
      'price', price,
      'duration', duration
    ) INTO NEW.tour_snapshot
    FROM public.tours WHERE id = NEW.tour_id;
  END IF;

  -- Snapshot guide data
  IF NEW.guide_id IS NOT NULL THEN
    SELECT jsonb_build_object(
      'name', name,
      'rating', rating
    ) INTO NEW.guide_snapshot
    FROM public.guides WHERE id = NEW.guide_id;
  END IF;

  -- Server-side stamping
  NEW.created_at = now();
  NEW.status = COALESCE(NEW.status, 'new');

  RETURN NEW;
END;
$$;
```

## Триггеры на других таблицах

### `pois`, `tours`, `guides`, `reviews` — set_updated_at

Везде стандартный паттерн:

```sql
CREATE TRIGGER <table>_updated_at
BEFORE UPDATE ON public.<table>
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
```

### `reviews` — пересчёт rating на parent

**НЕ реализовано.** Потенциальный trigger AFTER INSERT/UPDATE/DELETE на reviews который пересчитывает avg rating на pois/tours/guides. Сейчас rating хранится статично и обновляется вручную через скрипт.

## CHECK constraints (не триггеры, но связаны)

На `tour_bookings`:

```sql
ALTER TABLE public.tour_bookings
  ADD CONSTRAINT name_length CHECK (char_length(customer_name) BETWEEN 2 AND 100),
  ADD CONSTRAINT name_no_xss CHECK (customer_name !~ '<[^>]*>'),
  ADD CONSTRAINT phone_format CHECK (customer_phone ~ '^\+?[0-9\s\-\(\)]{7,20}$'),
  ADD CONSTRAINT email_format CHECK (customer_email ~ '^[^@\s]+@[^@\s]+\.[^@\s]+$'),
  ADD CONSTRAINT comment_length CHECK (char_length(coalesce(comment, '')) <= 1000),
  ADD CONSTRAINT group_size_range CHECK (group_size BETWEEN 1 AND 50),
  ADD CONSTRAINT future_date CHECK (preferred_date >= current_date);
```

CHECK работают **до** триггеров. Любое нарушение → INSERT не доходит до триггеров вообще.

## Аудит триггеров

```sql
SELECT
  event_object_table AS table_name,
  trigger_name,
  action_timing,
  event_manipulation,
  action_statement
FROM information_schema.triggers
WHERE trigger_schema = 'public'
ORDER BY event_object_table, trigger_name;
```

```sql
-- Все SECURITY DEFINER функции (требуют аудита)
SELECT n.nspname, p.proname, p.prosecdef
FROM pg_proc p
JOIN pg_namespace n ON n.oid = p.pronamespace
WHERE n.nspname = 'public' AND p.prosecdef = true;
```

## Related

- `rls_policies.md` — RLS работает поверх триггеров
- `migrations.md` — где триггеры созданы (0010, 0011, 0012)
- `../06_security/booking_form_defenses.md` (stub) — полный security разбор формы
