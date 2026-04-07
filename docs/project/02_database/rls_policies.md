---
title: RLS Policies — Row Level Security
type: reference
audience: archimag, security, dev
owner: archimag
last_updated: 2026-04-07
---

# Row Level Security детально

## Принципы

1. **Default deny** — RLS включён на всех `public` таблицах. Без явного policy никто (кроме `service_role`) не имеет доступа.
2. **Public read для контента** — POI, tours, guides, reviews, menu_items, emergency, transport читаемы для anon.
3. **Admin write** — изменения через JWT с `app_metadata.role = 'admin'`, проверяется helper `is_admin()`.
4. **Owner-only для user data** — collections, orders, user_prefs только владельцу через `current_user_id()`.
5. **service_role bypasses RLS** — для server-side скриптов и backups.

## Helper functions

### `public.is_admin()`

Проверяет является ли текущий запрос admin'ским. Читает JWT claims из `request.jwt.claims` (PostgREST его устанавливает).

```sql
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE plpgsql
STABLE
AS $$
BEGIN
  RETURN COALESCE(
    -- GoTrue кладёт role в app_metadata
    current_setting('request.jwt.claims', true)::jsonb -> 'app_metadata' ->> 'role' = 'admin',
    -- Fallback: role на верхнем уровне (для service_role JWT)
    current_setting('request.jwt.claims', true)::jsonb ->> 'role' = 'admin',
    false
  );
EXCEPTION WHEN OTHERS THEN
  RETURN false;
END;
$$;
```

**История:** в 0008 была изначальная версия которая читала только верхний уровень `role`. Но GoTrue выдаёт JWT с `role: authenticated` на верхнем уровне и `app_metadata.role: admin` для админов. Старая версия всегда возвращала false для админов. Фикс в `0009_fix_is_admin_and_grants.sql`.

**Edge case:** если `request.jwt.claims` не установлен (например при прямом подключении psql) — возвращает `false`. Это правильно: psql от postgres role и так bypasses RLS.

### `public.current_user_id()`

Извлекает `user_id` из JWT для owner-only проверок.

```sql
CREATE OR REPLACE FUNCTION public.current_user_id()
RETURNS uuid
LANGUAGE plpgsql
STABLE
AS $$
BEGIN
  RETURN NULLIF(
    current_setting('request.jwt.claims', true)::jsonb ->> 'sub',
    ''
  )::uuid;
EXCEPTION WHEN OTHERS THEN
  RETURN NULL;
END;
$$;
```

`sub` claim в JWT содержит UUID пользователя из `auth.users.id`. Используется в политиках типа `WHERE user_id = current_user_id()`.

## Политики по таблицам

### Контентные таблицы (public read, admin write)

**Pattern для всех 7 таблиц** (`pois`, `menu_items`, `guides`, `tours`, `reviews`, `emergency_contacts`, `transport_routes`):

```sql
ALTER TABLE public.<table> ENABLE ROW LEVEL SECURITY;

-- Anon и authenticated могут читать всё
CREATE POLICY <table>_public_read ON public.<table>
  FOR SELECT
  TO anon, authenticated
  USING (true);

-- Admin может писать (требуется JWT с role=admin)
CREATE POLICY <table>_admin_write ON public.<table>
  FOR ALL
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());
```

**Что это значит:**

- **anon** (без логина) — может SELECT, не может INSERT/UPDATE/DELETE
- **authenticated** (любой залогиненный) — может SELECT, для INSERT/UPDATE/DELETE проверяется `is_admin()`
- **admin** (JWT с `app_metadata.role=admin`) — полный CRUD доступ
- **service_role** — bypass RLS, полный доступ

**GRANTs (отдельно от RLS):**

PostgreSQL имеет два уровня контроля доступа:
1. **GRANT** на уровне таблицы — есть ли роль право выполнять operation вообще
2. **RLS policy** — какие строки роль видит / может изменять

Для writes нужны оба: GRANT INSERT/UPDATE/DELETE + RLS policy WITH CHECK true. Если только GRANT без policy → 0 строк. Если только policy без GRANT → permission denied.

В `0009_fix_is_admin_and_grants.sql`:

```sql
GRANT INSERT, UPDATE, DELETE ON public.pois TO authenticated;
GRANT INSERT, UPDATE, DELETE ON public.menu_items TO authenticated;
-- ... все 7 таблиц
```

### `tour_bookings` — особая security модель

Это таблица куда anonymous пользователи **могут писать** (через форму на сайте). Защищена особо.

**RLS:**

```sql
ALTER TABLE public.tour_bookings ENABLE ROW LEVEL SECURITY;

-- Anon может INSERT (для формы)
CREATE POLICY tour_bookings_anon_insert ON public.tour_bookings
  FOR INSERT
  TO anon
  WITH CHECK (true);  -- любая запись разрешена (защита через CHECK constraints + triggers)

-- Admin читает все заявки
CREATE POLICY tour_bookings_admin_read ON public.tour_bookings
  FOR SELECT
  TO authenticated
  USING (public.is_admin());

-- Admin обновляет (только status, остальное защищено column-level GRANT)
CREATE POLICY tour_bookings_admin_update ON public.tour_bookings
  FOR UPDATE
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());
```

**Column-level GRANTs (0011, 0012):**

```sql
-- Anon может INSERT только в безопасные колонки
GRANT INSERT (
  tour_id, guide_id, customer_name, customer_phone,
  customer_email, preferred_date, group_size, comment,
  honeypot, source
) ON public.tour_bookings TO anon;

-- Anon НЕ может писать ip_address, user_agent, status, id, created_at
-- (они проставляются server-side через DEFAULT и triggers)

-- Admin может UPDATE только status (защита от laundering)
REVOKE UPDATE ON public.tour_bookings FROM authenticated;
GRANT UPDATE (status) ON public.tour_bookings TO authenticated;

-- Anon и admin не имеют DELETE — заявки никогда не удаляются
REVOKE DELETE ON public.tour_bookings FROM anon, authenticated;
```

Это создаёт **4-layer защиту**:

1. **GRANT** — anon может только INSERT перечисленные колонки
2. **RLS policy** — anon insert разрешён, admin read/update требует `is_admin()`
3. **CHECK constraints** — длины полей, формат email/phone, regex против XSS
4. **Triggers** — rate limit, honeypot soft-fail, immutable fields, snapshot

См. полный разбор в `triggers_and_functions.md` и `06_security/booking_form_defenses.md` (stub).

### User data (`collections`, `orders`, `user_prefs`)

**Owner-only access:**

```sql
ALTER TABLE public.collections ENABLE ROW LEVEL SECURITY;

CREATE POLICY collections_owner ON public.collections
  FOR ALL
  TO authenticated
  USING (user_id = public.current_user_id() OR public.is_admin())
  WITH CHECK (user_id = public.current_user_id() OR public.is_admin());
```

Аналогично для `orders` и `user_prefs`.

**Что это даёт:**
- Залогиненный пользователь видит только свои коллекции/заказы
- Admin видит всё (для модерации)
- Anon ничего не видит и не пишет

**Текущее использование:** минимальное. Эти таблицы — placeholder. Реальные user data сейчас в IDB на клиенте `app.brobrogid.ru`. Pool 4 переведёт на эту схему.

## Тестирование RLS

### Через psql с SET ROLE

```sql
-- В psql от postgres
BEGIN;
SET LOCAL ROLE authenticated;
SELECT * FROM tour_bookings LIMIT 1;
-- Должно: ERROR: permission denied (нет JWT, is_admin() = false)
ROLLBACK;
```

### Через PostgREST (полный flow)

```bash
ANON="<anon JWT>"

# Anon SELECT — должно работать
curl "https://api.brobrogid.ru/rest/v1/pois?limit=1" -H "apikey: $ANON"
# → 200 OK с данными

# Anon INSERT — должно блокироваться
curl -X POST "https://api.brobrogid.ru/rest/v1/pois" \
  -H "apikey: $ANON" \
  -H "Content-Type: application/json" \
  -d '{"id":"hack","slug":"hack","name":{"ru":"hack","en":"hack"},...}'
# → 401 permission denied

# Admin login → JWT
TOKEN=$(curl -X POST "https://api.brobrogid.ru/auth/v1/token?grant_type=password" \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@brobrogid.ru","password":"..."}' | jq -r .access_token)

# Admin INSERT — должно работать
curl -X POST "https://api.brobrogid.ru/rest/v1/pois" \
  -H "apikey: $ANON" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Prefer: return=minimal" \
  -d '{...}'
# → 201 Created
```

### Что ARCHITECT тестировал

Для `tour_bookings`:

1. Anon SELECT → 401 (нет policy для SELECT) ✅
2. Anon INSERT с валидными данными → 201 ✅
3. Anon INSERT с XSS попыткой (`<script>` в name) → 400 (CHECK violation) ✅
4. Anon INSERT с заполненным `honeypot` → 201 + status='spam' (soft-fail) ✅
5. Anon UPDATE → 401 (DELETE/UPDATE revoked) ✅
6. Anon с `ip_address` в body → 401 (column-level GRANT) ✅
7. Admin SELECT → 200 ✅
8. Admin UPDATE status → 200 ✅
9. Admin UPDATE customer_phone → "permission denied" (column-level GRANT) ✅
10. postgres UPDATE created_at → "created_at is immutable" (trigger) ✅
11. Rate limit: 4-я заявка с того же phone → 400 generic error ✅

Все защиты работают как задумано.

## Известные ограничения

1. **`reviews` нет user_id** — все отзывы read-only для всех. Когда пользователи будут оставлять свои отзывы (Pool 4+), нужен `user_id` + owner-only RLS для INSERT.

2. **`tour_bookings.status` workflow** — admin может менять на любое значение из enum, нет state machine (например, нельзя из 'completed' обратно в 'new'). Можно добавить trigger если станет проблемой.

3. **`auth.users` доступ** — PostgREST не публикует `auth` schema. Для управления пользователями — через GoTrue admin API (требует service_role JWT) или прямо через psql.

4. **Polymorphic reviews нет ON DELETE handling** — если удалить POI, его reviews остаются с битым `target_id`. Нужен trigger BEFORE DELETE на pois/tours/guides который чистит соответствующие reviews. **Не реализовано**, потому что сейчас удалений не происходит.

## Аудит RLS

Чтобы убедиться что RLS включён везде где нужно:

```sql
SELECT
  schemaname,
  tablename,
  rowsecurity AS rls_enabled,
  forcerowsecurity AS rls_forced
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY tablename;
```

Все таблицы должны быть `rls_enabled = t`.

```sql
-- Проверить policies
SELECT schemaname, tablename, policyname, cmd, roles, qual, with_check
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;
```

Каждая таблица должна иметь хотя бы одну policy.

## Related

- `migrations.md` — где какая policy создана (0008, 0009, 0010, 0011, 0012)
- `triggers_and_functions.md` — триггеры которые работают вместе с RLS
- `schema.md` — структура таблиц
- `../06_security/README.md` — общий security overview
- `../06_security/booking_form_defenses.md` (stub) — детали защиты tour_bookings
