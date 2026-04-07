---
title: Database Schema Reference
type: reference
audience: dev, security, archimag
owner: archimag
last_updated: 2026-04-07
---

# Полная схема БД

Источник истины: `supabase/migrations/*.sql` в `gslanov/brobrogid` репо. Этот документ — human-readable reference.

## Enums

```sql
poi_category      = 'attractions'|'food'|'accommodation'|'nature'|'culture'
                    |'shopping'|'nightlife'|'transport'|'activities'|'practical'
cuisine_type      = 'national'|'european'|'mixed'
tour_type         = 'walking'|'driving'|'mixed'
tour_status       = 'recruiting'|'full'|'completed'
review_target_type = 'poi'|'tour'|'guide'
emergency_type    = 'police'|'ambulance'|'fire'|'hospital'|'trauma'|'pharmacy'
transport_type    = 'bus'|'marshrutka'|'trolleybus'
order_status      = 'cart'|'pending'|'paid'|'confirmed'
subscription_tier = 'free'|'premium'
subscription_plan = '1week'|'2weeks'|'3weeks'
```

## Таблицы

### public.pois (119 записей)

Точки интереса — сердце проекта. Каждая POI это место на карте с названием, описанием, фото, координатами.

| Column | Type | Nullable | Default | Notes |
|---|---|---|---|---|
| `id` | TEXT | NO | — | Primary key. Формат `poi-NNN` |
| `slug` | TEXT | NO | — | UNIQUE. Русская транслитерация после Sprint 6 |
| `slug_legacy` | TEXT | YES | — | Английский slug для 301 редиректов |
| `name` | JSONB | NO | — | LocalizedText `{ ru, en }` |
| `category` | poi_category | NO | — | См. enum выше |
| `subcategory` | TEXT | NO | `''` | Свободный текст ("Ущелье", "Водопад") |
| `cuisine_type` | cuisine_type | YES | — | Только для food |
| `location` | JSONB | NO | — | `{ lat, lng, address: { ru, en } }` |
| `description` | JSONB | NO | — | `{ short, medium, full }` — каждое LocalizedText |
| `photos` | TEXT[] | NO | `{}` | Массив путей `/images/pois/xxx.jpg` |
| `rating` | NUMERIC(3,2) | NO | `0` | CHECK 0-5 |
| `review_count` | INTEGER | NO | `0` | CHECK ≥ 0 |
| `hours` | JSONB | YES | — | `{ mon, tue, wed, thu, fri, sat, sun }` |
| `phone` | TEXT | YES | — | — |
| `website` | TEXT | YES | — | URL |
| `price_level` | SMALLINT | YES | — | CHECK 1-4 |
| `tags` | TEXT[] | NO | `{}` | Свободные теги |
| `is_chain` | BOOLEAN | NO | `false` | Сеть |
| `subscription_tier` | subscription_tier | NO | `'free'` | Для premium контента (не используется сейчас) |
| `visit_count` | INTEGER | NO | `0` | — |
| `has_menu` | BOOLEAN | NO | `false` | Есть menu_items |
| `has_delivery` | BOOLEAN | NO | `false` | Доставка еды |
| `external_order_url` | TEXT | YES | — | Ссылка на внешний сервис заказа |
| `created_at` | TIMESTAMPTZ | NO | `now()` | — |
| `updated_at` | TIMESTAMPTZ | NO | `now()` | Trigger-driven |

**Индексы:**
- `idx_pois_slug` — UNIQUE
- `idx_pois_category`
- `idx_pois_subcategory`
- `idx_pois_subscription_tier`
- `idx_pois_rating` (DESC)
- `idx_pois_visit_count` (DESC)
- `idx_pois_tags` GIN
- `idx_pois_has_menu` WHERE has_menu=true (partial)
- `idx_pois_name_ru_trgm` GIN (полнотекстовый на name->>'ru')
- `idx_pois_name_en_trgm` GIN
- `idx_pois_slug_legacy` WHERE slug_legacy IS NOT NULL AND != slug

**RLS:**
- anon/authenticated: SELECT (public read)
- authenticated + `is_admin()`: INSERT/UPDATE/DELETE

**Triggers:**
- `pois_set_updated_at` — BEFORE UPDATE

### public.menu_items (275 записей)

Пункты меню ресторанов. FK → pois (cascade delete).

| Column | Type | Nullable | Default | Notes |
|---|---|---|---|---|
| `id` | TEXT | NO | — | PK |
| `poi_id` | TEXT | NO | — | FK pois(id) ON DELETE CASCADE |
| `name` | JSONB | NO | — | LocalizedText |
| `description` | JSONB | NO | — | LocalizedText |
| `price` | NUMERIC(10,2) | NO | — | CHECK ≥ 0 |
| `currency` | TEXT | NO | `'RUB'` | — |
| `category` | TEXT | NO | `''` | Menu section ("Осетинские пироги") |
| `photo` | TEXT | YES | — | URL |
| `is_popular` | BOOLEAN | NO | `false` | — |
| `tags` | TEXT[] | NO | `{}` | — |
| `created_at` | TIMESTAMPTZ | NO | `now()` | — |
| `updated_at` | TIMESTAMPTZ | NO | `now()` | — |

Индексы: `by_poi`, `category`, `is_popular` (partial).
RLS: public read, admin write.

### public.guides (8 записей)

Профили гидов.

| Column | Type | Notes |
|---|---|---|
| `id` | TEXT | PK |
| `slug` | TEXT | UNIQUE |
| `name` | JSONB | LocalizedText |
| `bio` | JSONB | LocalizedText |
| `photo` | TEXT | URL |
| `languages` | TEXT[] | `['ru','en','os','de']` |
| `rating` | NUMERIC(3,2) | 0-5 |
| `review_count` | INTEGER | — |
| `tour_count` | INTEGER | — |
| `specializations` | TEXT[] | `['История','Горы','Гастрономия']` |

RLS: public read, admin write.

### public.tours (20 записей)

Туры с привязкой к гидам.

| Column | Type | Notes |
|---|---|---|
| `id` | TEXT | PK |
| `slug` | TEXT | UNIQUE |
| `name` | JSONB | LocalizedText |
| `description` | JSONB | LocalizedText |
| `guide_id` | TEXT | FK guides(id) ON DELETE RESTRICT (после 0012 был SET NULL → ❗ но это для bookings, не для tours) |
| `price` | NUMERIC(10,2) | RUB |
| `duration` | TEXT | Human-readable ("8-10 hours") |
| `type` | tour_type | walking/driving/mixed |
| `max_group_size` | INTEGER | — |
| `current_group_size` | INTEGER | — |
| `status` | tour_status | recruiting/full/completed |
| `dates` | TEXT[] | ISO dates |
| `meeting_point` | JSONB | Location |
| `route` | JSONB | Array<{lat,lng}> — может быть NULL (важно!) |
| `rating` | NUMERIC(3,2) | — |
| `review_count` | INTEGER | — |
| `photos` | TEXT[] | — |
| `category` | TEXT | "day_trip", "hiking", "multi_day" |

RLS: public read, admin write.

### public.reviews (499 записей)

Отзывы. **Полиморфные** — attach к POI, туру или гиду через `target_type` + `target_id`. Нет классического FK — нужна ручная проверка целостности при удалении parent.

| Column | Type | Notes |
|---|---|---|
| `id` | TEXT | PK |
| `target_type` | review_target_type | Discriminator: poi/tour/guide |
| `target_id` | TEXT | ID в соответствующей таблице |
| `author_name` | TEXT | — |
| `author_avatar` | TEXT | URL (whitelist в client side) |
| `rating` | NUMERIC(3,2) | 0-5 (БД не enforceит 1-5!) |
| `text` | TEXT | Plain text (НЕ локализован) |
| `date` | TIMESTAMPTZ | — |
| `is_generated` | BOOLEAN | true = AI, false = реальный. **Только реальные идут в JSON-LD.** |

Индексы:
- `by_target` — составной `(target_type, target_id)`
- `by_date` — DESC
- `by_rating` — DESC
- `by_generated`

RLS: public read, admin write.

### public.emergency_contacts (22 записи)

Экстренные службы. Импортированы из иерархического JSON через нормализацию в seed.ts (см. `04_pwa_app/data_flow.md`).

| Column | Type | Notes |
|---|---|---|
| `id` | TEXT | PK |
| `type` | emergency_type | police/ambulance/fire/hospital/trauma/pharmacy |
| `name` | JSONB | LocalizedText |
| `phone` | TEXT | — |
| `location` | JSONB | Location (может быть empty для general emergency numbers) |
| `is_24h` | BOOLEAN | Работает 24/7 |

RLS: public read, admin write.

### public.transport_routes (9 записей)

Маршруты общественного транспорта.

| Column | Type | Notes |
|---|---|---|
| `id` | TEXT | PK |
| `number` | TEXT | Route number |
| `name` | JSONB | LocalizedText |
| `type` | transport_type | bus/marshrutka/trolleybus |
| `stops` | JSONB | Array<{ name: LocalizedText, location: {lat, lng} }> |
| `schedule` | JSONB | `{ weekday, weekend }` или NULL |
| `color` | TEXT | hex `#3B82F6` |

RLS: public read, admin write.

### public.collections (пользовательские избранные)

Коллекции POI (типа "Избранное"). Пока используется только в `app.brobrogid.ru` через IndexedDB, не персистится в БД для реальных пользователей (нет пользователей кроме admin).

| Column | Type | Notes |
|---|---|---|
| `id` | TEXT | PK |
| `user_id` | UUID | FK auth.users (nullable сейчас) |
| `name` | TEXT | — |
| `poi_ids` | TEXT[] | Массив POI ID |

RLS: owner-only + admin.

### public.orders (заказы еды)

Placeholder для будущих онлайн-заказов. Сейчас только в IDB app.brobrogid.ru.

| Column | Type | Notes |
|---|---|---|
| `id` | TEXT | PK |
| `user_id` | UUID | FK auth.users |
| `poi_id` | TEXT | FK pois(id) |
| `items` | JSONB | Array<OrderItem> |
| `total` | NUMERIC(10,2) | — |
| `status` | order_status | cart/pending/paid/confirmed |
| `payment_method` | TEXT | `'sbp'` |
| `comment` | TEXT | — |

RLS: owner-only + admin.

### public.user_prefs

Настройки пользователя (язык, visited POIs, подписка).

| Column | Type | Notes |
|---|---|---|
| `user_id` | UUID | PK (FK auth.users) |
| `language` | TEXT | 'ru' / 'en' |
| `visited_pois` | TEXT[] | — |
| `subscription` | JSONB | `{ plan, price, startDate, endDate, features }` |

RLS: owner-only + admin.

### public.tour_bookings (заявки на туры)

Создано в Sprint 3, hardened в Sprint 3.5 (migrations 0010, 0011, 0012). Принимает заявки с формы на `brobrogid.ru`.

| Column | Type | Nullable | Default | Notes |
|---|---|---|---|---|
| `id` | UUID | NO | `gen_random_uuid()` | PK |
| `tour_id` | TEXT | YES | — | FK tours(id) ON DELETE RESTRICT |
| `guide_id` | TEXT | YES | — | FK guides(id) ON DELETE RESTRICT |
| `tour_id_snapshot` | TEXT | YES | — | Неизменяемый snapshot (trigger) для audit trail |
| `guide_id_snapshot` | TEXT | YES | — | Аналогично |
| `customer_name` | TEXT | NO | — | CHECK 2-100, блокирует `[<>]` |
| `customer_phone` | TEXT | NO | — | CHECK 5-30, regex `^[+\d\s()\-]+$` |
| `customer_email` | TEXT | YES | — | CHECK regex email |
| `preferred_date` | DATE | YES | — | CHECK не в прошлом |
| `group_size` | INTEGER | NO | `1` | CHECK 1-50 |
| `comment` | TEXT | YES | — | CHECK ≤ 2000, блокирует `[<>]` |
| `honeypot` | TEXT | YES | — | **Всегда должно быть пустым**. Если заполнено — soft-fail в trigger, status='spam' |
| `source` | TEXT | NO | `'website'` | — |
| `status` | TEXT | NO | `'new'` | CHECK new/contacted/confirmed/completed/cancelled/spam |
| `ip_address` | INET | YES | `inet_client_addr()` | **НЕ writable anon'ом** (column-level GRANT) |
| `user_agent` | TEXT | YES | — | — |
| `created_at` | TIMESTAMPTZ | NO | `now()` | **Immutable** (trigger) |
| `updated_at` | TIMESTAMPTZ | NO | `now()` | Обновляется триггером |

**Column-level GRANTs (0011, 0012):**
- anon INSERT на: tour_id, guide_id, customer_name, customer_phone, customer_email, preferred_date, group_size, comment, honeypot, source
- **НЕ** может писать: id, ip_address, user_agent, status, created_at, updated_at
- authenticated + admin UPDATE: **только status** (остальное блокируется `immutable_fields` trigger)

**Triggers:**
- `booking_snapshot_ids` — BEFORE INSERT: копирует tour_id/guide_id в _snapshot колонки
- `booking_honeypot_softfail` — BEFORE INSERT: если honeypot ≠ '', status='spam'
- `booking_rate_limit` — BEFORE INSERT: advisory lock + global cap 30/min + per-IP 5/h + per-phone 3/h
- `booking_immutable_fields` — BEFORE UPDATE: блокирует изменения всего кроме status
- `tour_bookings_set_updated_at` — BEFORE UPDATE: обновляет updated_at

См. `triggers_and_functions.md` для полного описания логики.

## Auth schema (GoTrue)

Не описываем детально — это стандартная Supabase Auth схема. Ключевые таблицы:

- `auth.users` — все пользователи
- `auth.sessions` — активные сессии
- `auth.refresh_tokens` — refresh токены
- `auth.identities` — внешние провайдеры (email/OAuth)
- `auth.audit_log_entries` — лог действий

Сейчас один пользователь: `admin@brobrogid.ru` с `app_metadata.role = 'admin'`.

## Related

- `migrations.md` — история миграций
- `rls_policies.md` — детальные правила RLS
- `triggers_and_functions.md` — функции и триггеры
- `../05_data_model/` — бизнес-смысл каждой сущности
