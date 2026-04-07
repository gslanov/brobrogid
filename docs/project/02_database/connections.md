---
title: Database Connections — как подключиться
type: runbook
audience: archimag, dev
owner: archimag
last_updated: 2026-04-07
---

# Подключения к Supabase

## Endpoints

| Что | URL / Address | Доступ |
|---|---|---|
| **PostgreSQL** | `127.0.0.1:5432` (внутри Docker network) | Только внутри VPS |
| **PostgreSQL (через SSH tunnel)** | `127.0.0.1:15432` (после открытия) | Через SSH ключ |
| **PostgREST** | `127.0.0.1:3000` (внутри VPS) | Только внутри |
| **PostgREST (public)** | `https://api.brobrogid.ru/rest/v1/*` | HTTPS, через nginx |
| **GoTrue** | `127.0.0.1:9999` (внутри VPS) | Только внутри |
| **GoTrue (public)** | `https://api.brobrogid.ru/auth/v1/*` | HTTPS, через nginx |

## Способы подключения

### Способ 1: Прямой psql через docker exec (быстро для one-off запросов)

```bash
ssh -i /home/cosmo/.ssh/id_ed25519_selectel root@87.228.33.68 \
  "docker exec brobrogid-postgres psql -U postgres -d brobrogid -c 'SELECT count(*) FROM pois;'"
```

**Когда использовать:** для quick queries, проверок состояния, ручных правок (CREATE/UPDATE).

**Плюсы:** не нужны локальные клиенты, работает откуда угодно.

**Минусы:** quoting hell с heredoc, сложно для multi-line запросов.

### Способ 2: Heredoc для multi-line SQL

```bash
ssh -i ~/.ssh/id_ed25519_selectel root@87.228.33.68 'docker exec -i brobrogid-postgres psql -U postgres -d brobrogid <<SQL
SELECT
  category,
  count(*) as cnt
FROM pois
GROUP BY category
ORDER BY cnt DESC;
SQL'
```

**Важно:** используй single quotes вокруг heredoc (`'docker exec ... <<SQL`) чтобы bash не интерполировал `$` переменные внутри SQL.

### Способ 3: SSH tunnel + локальный psql

```bash
# Открыть туннель в фоне
ssh -i ~/.ssh/id_ed25519_selectel -f -N \
  -L 15432:127.0.0.1:5432 root@87.228.33.68

# Подключиться через локальный psql
PGPASSWORD=$(grep POSTGRES_PASSWORD supabase/.env | cut -d= -f2) \
  psql -h 127.0.0.1 -p 15432 -U postgres -d brobrogid

# В конце — закрыть туннель
pkill -f "ssh.*15432:127.0.0.1:5432"
```

**Когда:** для интерактивных сессий, GUI клиентов (TablePlus, DBeaver, pgAdmin).

**GUI клиент конфигурация:**
- Host: `127.0.0.1`
- Port: `15432` (или какой выбрал в туннеле)
- Database: `brobrogid`
- User: `postgres`
- Password: см. `supabase/.env` → `POSTGRES_PASSWORD`

### Способ 4: Node.js через SSH tunnel

Используется в скриптах `supabase/seed/import.ts` и `supabase/scripts/slug_migration_dry_run.ts`:

```typescript
import { Client } from 'pg'

const client = new Client({
  connectionString: process.env.DB_URL
})
await client.connect()

const { rows } = await client.query('SELECT * FROM pois LIMIT 10')
await client.end()
```

Запуск:

```bash
ssh -i ~/.ssh/id_ed25519_selectel -f -N -L 15432:127.0.0.1:5432 root@87.228.33.68
sleep 2
DB_URL="postgres://postgres:$(grep POSTGRES_PASSWORD supabase/.env | cut -d= -f2)@127.0.0.1:15432/brobrogid" \
  npx tsx supabase/scripts/slug_migration_dry_run.ts
pkill -f "15432:127.0.0.1:5432"
```

### Способ 5: PostgREST через публичный API

Для read-only запросов с anon правами:

```bash
ANON_KEY="<из .agent/ADMIN_CREDENTIALS.md>"

curl "https://api.brobrogid.ru/rest/v1/pois?limit=5&select=id,slug,name" \
  -H "apikey: $ANON_KEY"
```

**Подробности про PostgREST API:**

- **Базовый URL:** `https://api.brobrogid.ru/rest/v1/`
- **Аутентификация:** `apikey` header или `Authorization: Bearer <jwt>`
- **Фильтры:** `?column=eq.value`, `?column=gte.10`, `?column=ilike.*pattern*`
- **Селекты:** `?select=col1,col2,relation(*)`
- **Сортировка:** `?order=column.desc`
- **Лимит/offset:** `?limit=10&offset=20`
- **Embedding:** `?select=*,reviews(*)` — joins
- **Count:** `Prefer: count=exact` header

**Примеры:**

```bash
# Все POI категории food
curl "https://api.brobrogid.ru/rest/v1/pois?category=eq.food&select=id,slug,name->ru"

# POI с полнотекстовым поиском
curl "https://api.brobrogid.ru/rest/v1/pois?name->>ru=ilike.*ущелье*"

# Топ-10 по рейтингу
curl "https://api.brobrogid.ru/rest/v1/pois?order=rating.desc&limit=10"

# С embedding (joins)
curl "https://api.brobrogid.ru/rest/v1/tours?select=*,guides(name)"
```

### Способ 6: Через GoTrue (для auth операций)

Логин:

```bash
curl -X POST 'https://api.brobrogid.ru/auth/v1/token?grant_type=password' \
  -H 'Content-Type: application/json' \
  -d '{
    "email": "admin@brobrogid.ru",
    "password": "<see ADMIN_CREDENTIALS.md>"
  }'
```

Возвращает `access_token` (JWT) с `app_metadata.role = "admin"`. Использовать для admin запросов:

```bash
TOKEN="<access_token>"

curl -X POST "https://api.brobrogid.ru/rest/v1/pois" \
  -H "apikey: $ANON_KEY" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -H "Prefer: return=minimal" \
  -d '{
    "id": "poi-test",
    "slug": "test",
    "name": {"ru": "Тест", "en": "Test"},
    ...
  }'
```

## Роли PostgreSQL и их назначение

| Роль | Назначение | Пароль |
|---|---|---|
| `postgres` | Суперпользователь | `POSTGRES_PASSWORD` в .env |
| `anon` | Публичный readonly через PostgREST | Не имеет пароля (NOLOGIN), используется через JWT |
| `authenticated` | Залогиненный юзер (после login через GoTrue) | Через JWT |
| `service_role` | Bypasses RLS, для серверных скриптов | Через JWT (в .agent/ADMIN_CREDENTIALS.md) |
| `authenticator` | Техническая роль для PostgREST подключения | `AUTHENTICATOR_PASSWORD` в .env |
| `supabase_auth_admin` | Owner `auth` schema, для GoTrue | `AUTH_ADMIN_PASSWORD` в .env |

PostgREST подключается к БД как `authenticator`, затем `SET ROLE` к нужной роли (anon/authenticated) на основе JWT.

## Где живут пароли

**На сервере:** `/opt/supabase/.env` (НЕ в git)
**Локально:** `/home/cosmo/SOFT/COSMO/BROBROGID/supabase/.env` (в `.gitignore`)
**Backup:** `.agent/ADMIN_CREDENTIALS.md` в репо BROBROGID (gitignored через `.agent/`)

**Содержимое .env:**

```
POSTGRES_PASSWORD=<32 hex chars>
AUTHENTICATOR_PASSWORD=<32 hex chars>
AUTH_ADMIN_PASSWORD=<32 hex chars>
JWT_SECRET=<64 hex chars>
```

## JWT секреты

Все JWT (anon, service_role, admin user) подписаны общим `JWT_SECRET` (HS256). Этот же secret использует:
- PostgREST для валидации JWT
- GoTrue для подписи токенов

**Anon JWT** (постоянный, expire 2090):

```
{
  "role": "anon",
  "iss": "brobrogid",
  "iat": 1775470275,
  "exp": 2090830275
}
```

**Service role JWT** (постоянный):

```
{
  "role": "service_role",
  "iss": "brobrogid",
  "iat": 1775470275,
  "exp": 2090830275
}
```

Полные значения в `.agent/ADMIN_CREDENTIALS.md`.

## Connection pool

PostgREST использует connection pool к Postgres:

```yaml
PGRST_DB_POOL: 10  # max 10 connections
```

При нагрузке выше 10 одновременных запросов — queueing.

PostgreSQL `max_connections = 100` (в docker-compose.yml). Запас 90 connections для прямых клиентов (psql, миграции).

## Network topology

```
[Internet]
    │
    │ HTTPS 443
    ▼
[Selectel VPS 87.228.33.68 — nginx]
    │
    │ HTTP loopback (127.0.0.1)
    ▼
[Docker network — supabase_default]
    │
    ├── 127.0.0.1:5432 → postgres:5432 (PostgreSQL)
    ├── 127.0.0.1:3000 → postgrest:3000 (PostgREST)
    └── 127.0.0.1:9999 → gotrue:9999 (GoTrue)
```

PostgreSQL **не** выставлен на 0.0.0.0 — только loopback. Для прямого доступа извне — SSH tunnel обязателен.

## Troubleshooting

### "permission denied for table X"

Причина: anon роль пытается сделать что-то для чего нет GRANT.

Фикс: проверь GRANTs в миграции, добавь column-level GRANT если нужно (см. `0011_tour_bookings_hardening.sql` как пример).

### "could not find a relationship between X and Y"

Причина: PostgREST не нашёл FK для embedding `?select=*,Y(*)`.

Фикс:
1. Проверь что FK существует: `\d X` в psql
2. Если FK нет (как в polymorphic reviews) — embedding не сработает, делай отдельные запросы
3. Если FK есть, но PostgREST не видит — `NOTIFY pgrst, 'reload schema'` или restart контейнера

### "schema must be one of the following: public"

Причина: запрос к таблице не из `public` schema (например `auth.users`).

Фикс: PostgREST публикует только `PGRST_DB_SCHEMAS=public`. Auth таблицы не доступны через PostgREST намеренно (защита).

### Connection timeout

Причина: контейнер не запущен или Docker network проблема.

Фикс:
```bash
ssh selectel "cd /opt/supabase && docker compose ps"
ssh selectel "cd /opt/supabase && docker compose restart"
```

### "FATAL: too many connections"

Причина: pool заполнен.

Фикс:
```bash
# Посмотреть активные соединения
ssh selectel "docker exec brobrogid-postgres psql -U postgres -d brobrogid -c 'SELECT count(*) FROM pg_stat_activity;'"

# Прибить idle соединения
ssh selectel "docker exec brobrogid-postgres psql -U postgres -d brobrogid -c \"
  SELECT pg_terminate_backend(pid)
  FROM pg_stat_activity
  WHERE state = 'idle' AND query_start < now() - interval '1 hour';
\""
```

### PostgREST schema cache stale

Симптом: добавил новую таблицу, PostgREST возвращает 404 на её endpoint.

Фикс:
```bash
ssh selectel "docker exec brobrogid-postgres psql -U postgres -d brobrogid -c \"NOTIFY pgrst, 'reload schema';\""
# Или полный restart
ssh selectel "cd /opt/supabase && docker compose restart postgrest"
```

### GoTrue migrations failing

Симптом: GoTrue контейнер в loop "Restarting".

Причина: не совпадает пароль `supabase_auth_admin` между .env и БД ролью.

Фикс:
```bash
ssh selectel "docker logs brobrogid-gotrue --tail 20"
# Если "password authentication failed" — переустановить пароль:
ssh selectel "docker exec brobrogid-postgres psql -U postgres -d brobrogid -c \"
  ALTER ROLE supabase_auth_admin WITH LOGIN PASSWORD 'NEW_PASSWORD_FROM_ENV';
\""
ssh selectel "cd /opt/supabase && docker compose restart gotrue"
```

## Health checks

```bash
# PostgreSQL
ssh selectel "docker exec brobrogid-postgres pg_isready -U postgres"

# PostgREST
curl -sI https://api.brobrogid.ru/rest/v1/ | grep HTTP

# GoTrue
curl -s https://api.brobrogid.ru/auth/v1/health

# Полный API health
curl https://api.brobrogid.ru/health
```

## Related

- `schema.md` — структура БД
- `migrations.md` — история изменений
- `backup_restore.md` — операции резервного копирования
- `../06_security/secrets_management.md` (stub) — где хранятся ключи
- `/opt/supabase/.env` (на сервере) — реальные значения
- `.agent/ADMIN_CREDENTIALS.md` (gitignored) — backup паролей и JWT
