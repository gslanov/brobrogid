---
title: Database Migrations History
type: reference
audience: archimag, security, dev
owner: archimag
last_updated: 2026-04-07
---

# Migrations history

Все миграции находятся в `supabase/migrations/` (в репо `gslanov/brobrogid`). Применяются последовательно по имени файла.

## Полный список

| # | Файл | Что делает | Зависимости | Дата |
|---|---|---|---|---|
| 0001 | `init.sql` | Extensions, roles, schemas, custom enums, set_updated_at() function | — | 2026-04-06 |
| 0002 | `pois.sql` | Таблица `pois` + индексы | 0001 | 2026-04-06 |
| 0003 | `menu_items.sql` | Таблица `menu_items` (FK на pois) | 0002 | 2026-04-06 |
| 0004 | `guides_tours.sql` | Таблицы `guides` + `tours` (FK guide_id) | 0001 | 2026-04-06 |
| 0005 | `reviews.sql` | Полиморфная таблица `reviews` | 0002, 0004 | 2026-04-06 |
| 0006 | `emergency_transport.sql` | `emergency_contacts` + `transport_routes` | 0001 | 2026-04-06 |
| 0007 | `users_collections_orders.sql` | `collections`, `orders`, `user_prefs` | 0002 | 2026-04-06 |
| 0008 | `rls_policies.sql` | Включает RLS на всех таблицах + политики + helper functions `is_admin()`, `current_user_id()` | 0002-0007 | 2026-04-06 |
| 0009 | `fix_is_admin_and_grants.sql` | Фикс `is_admin()` чтобы читать из `app_metadata.role` (GoTrue кладёт там) + GRANT INSERT/UPDATE/DELETE для `authenticated` роли | 0008 | 2026-04-06 |
| 0010 | `tour_bookings.sql` | Таблица `tour_bookings` для заявок с формы (anon INSERT через RLS) | 0004, 0008 | 2026-04-07 |
| 0011 | `tour_bookings_hardening.sql` | Security round 1: column-level GRANT, CHECK constraints, advisory locks, generic errors | 0010 | 2026-04-07 |
| 0012 | `tour_bookings_audit_hardening.sql` | Security round 2: ON DELETE RESTRICT, snapshot fields, immutable trigger, honeypot soft-fail | 0010, 0011 | 2026-04-07 |
| 0013 | `russian_slugs.sql` | Sprint 6: 101 POI English → Russian transliteration, slug_legacy column | 0002 | 2026-04-07 |

## Как применяются

**Идемпотентность:** все миграции написаны через `IF NOT EXISTS`, `CREATE OR REPLACE`, `DROP ... IF EXISTS`. Можно безопасно повторять.

**Последовательность:** ничем не enforced, нужно применять в порядке номеров. Если применить 0008 до 0007 — упадёт (нет таблиц для RLS).

**Применение на production:**

```bash
# 1. Backup ОБЯЗАТЕЛЕН
ssh selectel "/usr/local/bin/brobrogid-backup.sh"

# 2. Скопировать миграцию на сервер
rsync -avz -e "ssh -i ~/.ssh/id_ed25519_selectel" \
  supabase/migrations/NNNN_name.sql \
  root@87.228.33.68:/opt/supabase/migrations/

# 3. Применить
ssh -i ~/.ssh/id_ed25519_selectel root@87.228.33.68 \
  'docker exec -i brobrogid-postgres psql -U postgres -d brobrogid -v ON_ERROR_STOP=1 < /opt/supabase/migrations/NNNN_name.sql'

# 4. Если меняли DDL (новая колонка, новая таблица) — reload PostgREST cache
ssh selectel \
  "docker exec brobrogid-postgres psql -U postgres -d brobrogid -c \"NOTIFY pgrst, 'reload schema';\""
# Или полный restart:
ssh selectel "cd /opt/supabase && docker compose restart postgrest"

# 5. Verify
ssh selectel \
  "docker exec brobrogid-postgres psql -U postgres -d brobrogid -c \"\\d+ public.<table>\""
```

## Детальный разбор каждой миграции

### 0001_init.sql

**Цель:** заложить базу — расширения PG, custom roles, типы.

**Что создаёт:**

1. **Extensions:**
   - `uuid-ossp` — для `gen_random_uuid()` (используется в tour_bookings)
   - `pgcrypto` — крипто функции
   - `pg_trgm` — full-text search через trigram (для ILIKE индексов)

2. **Roles** (PostgreSQL roles, не приложение):
   - `anon` — публичный readonly
   - `authenticated` — залогиненный пользователь
   - `service_role` — admin, bypasses RLS
   - `authenticator` — техническая роль для PostgREST подключения

3. **Custom enum types** (PostgreSQL ENUM):
   - `poi_category` — 10 values (attractions, food, accommodation, ...)
   - `cuisine_type` — 3 values
   - `tour_type`, `tour_status`
   - `review_target_type` — для полиморфных reviews
   - `emergency_type` — 6 values
   - `transport_type` — 3 values
   - `order_status`, `subscription_tier`, `subscription_plan`

4. **Helper function:**
   ```sql
   CREATE OR REPLACE FUNCTION public.set_updated_at()
   RETURNS TRIGGER AS $$
   BEGIN NEW.updated_at = now(); RETURN NEW; END;
   $$ LANGUAGE plpgsql;
   ```
   Используется в триггерах всех таблиц с `updated_at`.

### 0002_pois.sql

**Цель:** создать главную таблицу `pois` (точки интереса).

**Особенности:**

- 25 полей, см. `schema.md`
- 9 индексов включая GIN на tags + полнотекстовый по name->>'ru' и name->>'en' через `gin_trgm_ops`
- CHECK constraints на rating (0-5), price_level (1-4), counts (>=0)
- Trigger `pois_set_updated_at` BEFORE UPDATE
- GRANT SELECT для anon и authenticated (read public)

### 0003_menu_items.sql

**Цель:** меню ресторанов.

- FK `poi_id` → pois с `ON DELETE CASCADE`
- Если ресторан удаляется — все его меню удаляются автоматически
- Индексы по `poi_id`, `category`, `is_popular` (partial)

### 0004_guides_tours.sql

**Цель:** гиды и туры.

- `guides` без FK
- `tours` имеет `guide_id` FK → guides
- Изначально было `ON DELETE SET NULL` для tours.guide_id, потом ARCHITECT нашёл что это плохо — изменено на `ON DELETE RESTRICT` в 0012 (но только для tour_bookings, для tours.guide_id оставлено SET NULL — нужно проверить)

### 0005_reviews.sql

**Цель:** отзывы (полиморфные).

**Особенность:** **нет FK** — `target_id` ссылается на разные таблицы в зависимости от `target_type`. Целостность не enforced на уровне БД, нужна ручная проверка при удалении parent.

- Composite индекс `by_target` на `(target_type, target_id)` — критичен для производительности
- Индексы по `date DESC`, `rating DESC`, `is_generated`

### 0006_emergency_transport.sql

**Цель:** экстренные службы и транспорт.

- Простые таблицы без FK
- JSONB для `name` (LocalizedText) и `location`
- `transport_routes.stops` — JSONB array of `{ name: LocalizedText, location: { lat, lng } }`

### 0007_users_collections_orders.sql

**Цель:** placeholder таблицы для пользовательских данных.

- `collections` — избранное (пока в IDB на клиенте)
- `orders` — корзина / заказы (placeholder)
- `user_prefs` — настройки

Используются мало, готовы для будущего.

### 0008_rls_policies.sql

**Цель:** Row Level Security на всех таблицах.

**Принципы:**
- `pois`, `menu_items`, `tours`, `guides`, `reviews`, `emergency_contacts`, `transport_routes` — public read для anon
- Write только для admin (через JWT role check)
- `collections`, `orders`, `user_prefs` — owner-only через `user_id = current_user_id()`

**Helper functions:**
- `is_admin()` — читает JWT claims
- `current_user_id()` — извлекает `sub` из JWT

**Initial bug:** `is_admin()` читал `role` с верхнего уровня JWT. Но GoTrue кладёт админ роль в `app_metadata.role`. Фикс в 0009.

### 0009_fix_is_admin_and_grants.sql

**Цель:** фикс 0008 + grants для writes.

```sql
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean AS $$
BEGIN
  RETURN COALESCE(
    current_setting('request.jwt.claims', true)::jsonb -> 'app_metadata' ->> 'role' = 'admin',
    current_setting('request.jwt.claims', true)::jsonb ->> 'role' = 'admin',
    false
  );
EXCEPTION WHEN OTHERS THEN
  RETURN false;
END;
$$ LANGUAGE plpgsql STABLE;
```

Также:
```sql
GRANT INSERT, UPDATE, DELETE ON public.pois TO authenticated;
GRANT INSERT, UPDATE, DELETE ON public.menu_items TO authenticated;
-- ... остальные таблицы
```

После этой миграции admin (с JWT с `app_metadata.role = admin`) может писать в БД через REST API.

### 0010_tour_bookings.sql

**Цель:** таблица для заявок на туры с формы на brobrogid.ru.

**Базовый design:**
- Anon может INSERT через RLS
- Admin читает через `is_admin()`
- CHECK constraints на длины полей
- `honeypot` field для обнаружения ботов
- Initial rate-limit trigger (потом усилен в 0011)

**Это была первая миграция которую SENTINEL и ARCHITECT прошли с аудитом.** Нашли 11 проблем — закрыто в 0011 + 0012.

### 0011_tour_bookings_hardening.sql (Security round 1)

**Цель:** закрыть 5 SENTINEL findings + 2 ARCHITECT critical.

**Changes:**

1. **Column-level GRANT** вместо table-level:
   ```sql
   REVOKE INSERT ON public.tour_bookings FROM anon;
   GRANT INSERT (tour_id, guide_id, customer_name, customer_phone,
                 customer_email, preferred_date, group_size, comment,
                 honeypot, source) ON public.tour_bookings TO anon;
   ```
   Anon больше не может писать `ip_address`, `user_agent`, `status`, `id`, `created_at`.

2. **`ip_address` DEFAULT inet_client_addr()** — серверный фиксит, anon не может подделать.

3. **CHECK constraints на XSS:**
   ```sql
   ADD CONSTRAINT tour_bookings_customer_name_check CHECK (
     length(customer_name) BETWEEN 2 AND 100
     AND customer_name !~ '[<>]'
   );
   ```
   Блокирует angle brackets — defense-in-depth против XSS если admin UI забудет escape.

4. **Phone format constraint:**
   ```sql
   CHECK (customer_phone ~ '^[+\d\s()\-]+$')
   ```

5. **Hardened rate limit trigger** с advisory locks:
   ```sql
   PERFORM pg_advisory_xact_lock(hashtext(NEW.customer_phone));
   PERFORM pg_advisory_xact_lock(hashtext(host(client_ip)));
   ```
   Сериализует параллельные insert'ы по одному телефону/IP — защита от TOCTOU race.

6. **Global cap 30/min:** защита от unbounded DoS через random телефонов.

7. **Per-IP cap 5/час:** в дополнение к nginx rate limit.

8. **Generic error messages:** "Too many requests" вместо "too many bookings from this phone" (anti-enumeration).

### 0012_tour_bookings_audit_hardening.sql (Security round 2)

**Цель:** закрыть 4 ARCHITECT round-2 findings.

**Changes:**

1. **ON DELETE RESTRICT** на FK к tours/guides — нельзя удалить parent если есть booking. Защита от заметания audit trail.

2. **Snapshot columns** `tour_id_snapshot`, `guide_id_snapshot` + BEFORE INSERT trigger который копирует FK значения. Survives even CASCADE/TRUNCATE.

3. **Column-level UPDATE GRANT** для admin:
   ```sql
   REVOKE UPDATE ON public.tour_bookings FROM authenticated;
   GRANT UPDATE (status) ON public.tour_bookings TO authenticated;
   ```
   Admin может обновить только `status`. Customer data immutable.

4. **`tour_bookings_immutable_fields` trigger** — defense-in-depth:
   ```sql
   IF NEW.created_at IS DISTINCT FROM OLD.created_at THEN
     RAISE EXCEPTION 'created_at is immutable';
   END IF;
   ```
   Блокирует UPDATE даже от postgres role.

5. **Honeypot soft-fail** — DROP CHECK constraint, заменён trigger:
   ```sql
   IF NEW.honeypot IS NOT NULL AND NEW.honeypot != '' THEN
     NEW.status := 'spam';
   END IF;
   ```
   Бот получает HTTP 201 (думает что прошло), запись в БД помечена как spam. Не адаптируется.

6. **SECURITY DEFINER warning** — добавлен COMMENT с предупреждением для будущих агентов не добавлять INSERT/UPDATE/DELETE логику в `check_booking_rate_limit()`.

### 0013_russian_slugs.sql (Sprint 6)

**Цель:** перевести 101 POI с английских slugs на русскую транслитерацию.

**Шаги:**

1. `ALTER TABLE pois ADD COLUMN slug_legacy TEXT` — сохранить старые slugs
2. `UPDATE pois SET slug_legacy = slug WHERE slug_legacy IS NULL` — backfill
3. 101 `UPDATE pois SET slug = '<new>' WHERE id = '<id>'` — каждый POI отдельно
4. `CREATE INDEX idx_pois_slug_legacy` — для редиректов lookup performance

**Источник:** `supabase/scripts/slug_migration_dry_run.ts` сгенерировал список из 101 транслитерации, dry-run проверка показала 0 конфликтов.

**После migration:**
- 78 nginx 301 redirects добавлены (старый URL → новый)
- `getPOIBySlug` функция в новом агенте получила fallback по slug_legacy

## Как тестировать миграции локально

Перед применением на проде:

```bash
# 1. Открыть SSH tunnel к Postgres
ssh -i ~/.ssh/id_ed25519_selectel -f -N -L 15432:127.0.0.1:5432 root@87.228.33.68

# 2. Подключиться через psql
PGPASSWORD=$(grep POSTGRES_PASSWORD supabase/.env | cut -d= -f2) \
  psql -h 127.0.0.1 -p 15432 -U postgres -d brobrogid

# 3. Применить миграцию в transaction (чтобы откатить):
BEGIN;
\i supabase/migrations/NNNN_name.sql;
-- Проверить
SELECT * FROM pois LIMIT 5;
ROLLBACK;  -- или COMMIT если всё ОК
```

**Альтернатива:** dry-run скрипт типа `slug_migration_dry_run.ts` — генерирует SQL без применения.

## Rollback strategy

Каждая миграция имеет inline комментарий с rollback SQL. Например в 0013:

```sql
-- Rollback: UPDATE pois SET slug = slug_legacy WHERE slug_legacy != slug;
--           ALTER TABLE pois DROP COLUMN slug_legacy;
```

Полный rollback процесс — см. `../09_workflows/rollback.md` (stub).

Для критичных миграций (0010-0013) backup перед применением обязателен.

## Что НЕ закоммичено в миграции

- **Initial seed data** — POI/tours/guides пришли через `seed/import.ts` Node script, не SQL
- **Auth schema** — создаётся GoTrue автоматически при первом запуске контейнера
- **Roles** — `anon`, `authenticated`, `service_role`, `authenticator`, `supabase_auth_admin` создаются в 0001 + вручную через ALTER ROLE при настройке (см. `connections.md`)

## Future migrations

Что может быть в будущих 0014+:

- Pool 4: миграция auth схемы для админов
- Реальные пользовательские отзывы (insert RLS для authenticated)
- Bookings улучшения (статусы workflow, history)
- Telegram bot integration (новая таблица notifications)
- Multi-region поддержка (region_id в pois?)

## Related

- `schema.md` — текущая структура таблиц
- `rls_policies.md` — детали RLS (stub)
- `triggers_and_functions.md` — все триггеры (stub)
- `backup_restore.md` — backup operations (stub)
- `../06_security/` — почему миграции 0011, 0012 такие
- `../10_history/timeline.md` — когда что произошло
