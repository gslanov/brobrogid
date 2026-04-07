---
title: Database — Supabase self-hosted
type: overview
audience: archimag, security, dev
owner: archimag
last_updated: 2026-04-07
---

# Supabase Database

## TL;DR

- **Что:** self-hosted Supabase на Selectel VPS
- **Где:** `/opt/supabase/` на сервере `87.228.33.68`, публично через `https://api.brobrogid.ru`
- **Стек:** PostgreSQL 16 + PostgREST 12 + GoTrue 2
- **Оркестрация:** Docker Compose (`/opt/supabase/docker-compose.yml`)
- **Ресурсы:** ~60 MB RAM (Postgres 42 MB + PostgREST 7 MB + GoTrue 7 MB + Docker overhead)
- **Secrets:** `/opt/supabase/.env` (на сервере, не в git)
- **Backup:** cron daily 3:00 UTC → `/opt/supabase/backups/`, retention 7 days

## Почему self-hosted

Альтернативы:
- **Supabase Cloud** — бесплатный tier: 500 MB БД, 2 GB трафика, 50 MAU. Проект быстро вырастет за эти лимиты.
- **Hosted PostgreSQL** (DigitalOcean, Render) — требует отдельно настраивать auth, REST API, RLS policies. Больше работы.
- **PocketBase** — проще, меньше ресурсов (~30 MB RAM), но SQLite (не для продакшена с масштабом), меньше SDK поддержки.
- **Custom Node backend + Postgres** — максимальный контроль, максимум работы.

Выбран **Minimal Supabase self-hosted** — оптимальный баланс:

1. **Полный контроль** над данными (русские законы о хранении персданных)
2. **Бесплатно** (деньги только за VPS)
3. **Тот же SDK** что в Supabase Cloud — миграция туда и обратно тривиальна
4. **Промышленный PostgreSQL** с индексами, триггерами, полнотекстовым поиском
5. **Готовое Row Level Security** для гранулярного контроля доступа
6. **Готовый Auth** (GoTrue) с JWT, email/password, потенциально OAuth
7. **Мгновенный пинг** от brobrogid.ru и app.brobrogid.ru (в том же дата-центре)

## Что упрощено по сравнению с полным Supabase

- ❌ **Studio** (web UI для БД) — используем pgAdmin / TablePlus / psql вместо
- ❌ **Realtime** (WebSocket подписки) — не нужен для путеводителя
- ❌ **Storage** (файловое хранилище) — используем nginx + статика
- ❌ **Edge Functions** — не нужны для SSG сайта
- ❌ **Image Proxy** — делаем ресайз при build через sharp
- ❌ **Kong API Gateway** — заменён на nginx
- ❌ **Meta** (API для схемы) — pgAdmin вместо

Оставлены только **3 обязательных компонента:** Postgres + PostgREST + GoTrue.

## Структура директории `/opt/supabase/` на сервере

```
/opt/supabase/
├── docker-compose.yml          # Оркестрация 3 сервисов
├── .env                        # Секреты (пароли, JWT secret)
├── migrations/                 # SQL миграции (копия из git)
│   ├── 0001_init.sql
│   ├── 0002_pois.sql
│   ├── 0003_menu_items.sql
│   ├── 0004_guides_tours.sql
│   ├── 0005_reviews.sql
│   ├── 0006_emergency_transport.sql
│   ├── 0007_users_collections_orders.sql
│   ├── 0008_rls_policies.sql
│   ├── 0009_fix_is_admin_and_grants.sql
│   ├── 0010_tour_bookings.sql
│   ├── 0011_tour_bookings_hardening.sql
│   ├── 0012_tour_bookings_audit_hardening.sql
│   └── 0013_russian_slugs.sql
├── postgres-data/              # PostgreSQL data volume (persistent)
├── backups/                    # pg_dump gzip, cron
├── nginx-api.conf              # Nginx reverse proxy config (source)
├── backup.sh                   # Daily backup script
└── seed/                       # Import scripts
    └── import.ts
```

## Высокоуровневые компоненты

### PostgreSQL 16

- База `brobrogid`
- Порт 5432 **слушает только 127.0.0.1** — никогда не выставлен наружу
- Доступ только через Docker network или SSH tunnel (`ssh -L 15432:127.0.0.1:5432`)
- Volume: `/opt/supabase/postgres-data/` на хосте

**Роли:**
- `postgres` — суперпользователь, для миграций и backups
- `anon` — публичный readonly (используется PostgREST для неавторизованных запросов)
- `authenticated` — залогиненный пользователь (базовый уровень после login)
- `service_role` — bypasses RLS, для server-side скриптов
- `authenticator` — техническая роль которую PostgREST использует для подключения
- `supabase_auth_admin` — owner `auth` schema, для GoTrue

**Схемы:**
- `public` — основные таблицы проекта (pois, tours, etc.)
- `auth` — схема GoTrue (users, sessions, refresh_tokens, etc.)

### PostgREST 12

- Автоматический REST API из схемы PostgreSQL
- Порт 3000 слушает на 127.0.0.1
- Публичный доступ через nginx `https://api.brobrogid.ru/rest/v1/*`
- Использует JWT для определения роли (`role` claim в JWT)
- Публикует только `public` схему

**Конфиг в docker-compose.yml:**
```yaml
PGRST_DB_URI: postgres://authenticator:${AUTHENTICATOR_PASSWORD}@postgres:5432/brobrogid
PGRST_DB_SCHEMAS: public
PGRST_DB_ANON_ROLE: anon
PGRST_JWT_SECRET: ${JWT_SECRET}
PGRST_DB_MAX_ROWS: 1000
PGRST_DB_POOL: 10
PGRST_OPENAPI_MODE: disabled
```

### GoTrue 2

- Auth сервис: signup, login, refresh tokens, password reset, email confirmation
- Порт 9999 на 127.0.0.1
- Публичный доступ через `https://api.brobrogid.ru/auth/v1/*`
- Использует схему `auth` (таблицы `users`, `refresh_tokens`, `sessions`, etc.)
- Выдаёт JWT подписанный тем же `JWT_SECRET` что PostgREST валидирует

**Конфиг:**
```yaml
GOTRUE_DISABLE_SIGNUP: "true"  # Публичная регистрация запрещена
GOTRUE_EXTERNAL_EMAIL_ENABLED: "true"  # email+password login разрешён
GOTRUE_JWT_ADMIN_ROLES: admin
GOTRUE_SITE_URL: https://brobrogid.ru
```

**Admin пользователь:**
- Email: `admin@brobrogid.ru`
- Password: см. `.agent/ADMIN_CREDENTIALS.md` (gitignored)
- User ID: `7496d7bc-9b57-4fb2-af2e-c0817fe9eab9`
- Role claim (в `app_metadata.role`): `admin`

## Nginx reverse proxy

Конфиг: `/etc/nginx/sites-available/api-brobrogid`

**Endpoints:**
- `https://api.brobrogid.ru/` — info JSON
- `https://api.brobrogid.ru/health` — `{"status":"ok"}`
- `https://api.brobrogid.ru/rest/v1/*` → `http://127.0.0.1:3000/` (PostgREST)
- `https://api.brobrogid.ru/auth/v1/*` → `http://127.0.0.1:9999/` (GoTrue)

**Безопасность:**
- SSL (Let's Encrypt)
- HSTS, X-Content-Type-Options, X-Frame-Options, Referrer-Policy
- `server_tokens off`
- CORS для `brobrogid.ru`, `app.brobrogid.ru`, `localhost:*`
- Rate limits:
  - Default `/rest/v1/` + `/auth/v1/`: 30 req/s, burst 60 / 20
  - `/rest/v1/tour_bookings` (отдельно): 5 req/min burst 2 → HTTP 429
- Gzip on

## Backup стратегия

См. `backup_restore.md` для деталей. Кратко:

- **Автоматически:** cron `0 3 * * * /usr/local/bin/brobrogid-backup.sh`
- **Формат:** `pg_dump --clean --if-exists | gzip`
- **Локация:** `/opt/supabase/backups/brobrogid_YYYYMMDD_HHMMSS.sql.gz`
- **Размер:** ~110 KB (текущий объём данных)
- **Retention:** 7 дней (`find ... -mtime +7 -delete`)
- **Восстановление:** `gunzip -c backup.sql.gz | docker exec -i brobrogid-postgres psql -U postgres -d brobrogid`

## Точки отказа и их митигация

| Сбой | Последствия | Митигация |
|---|---|---|
| Crash postgres container | API вниз | Docker `restart: unless-stopped` автоматически поднимает |
| PostgREST не видит новую таблицу | API 404 | `NOTIFY pgrst, 'reload schema'` или restart контейнера |
| GoTrue migrations падают | Auth вниз | Проверить `supabase_auth_admin` пароль в `/opt/supabase/.env` vs в роли postgres |
| Диск заполнен | БД не пишет | cron cleanup бэкапов, мониторить `df -h /` |
| SSL expired | HTTPS ломается | certbot auto-renew (дважды в день cron) |
| OOM (postgres ест > 1 GB) | Crash | swap 4 GB должен хватить, `mem_limit: 1g` в compose |
| Плохой SQL в миграции | Data corruption | Всегда backup перед migration, testing в dry run |
| Забытый RLS policy | Data leak | Тесты через curl от роли anon |
| SECURITY DEFINER в плохих руках | Privilege escalation | COMMENT-предупреждение в `0012`, периодический audit |

## Как подключиться для отладки

### Через SSH tunnel (рекомендуется для скриптов)

```bash
# Открыть туннель в фоне
ssh -i /home/cosmo/.ssh/id_ed25519_selectel -f -N \
  -L 15432:127.0.0.1:5432 root@87.228.33.68

# Подключиться
PGPASSWORD=$(grep POSTGRES_PASSWORD supabase/.env | cut -d= -f2) \
  psql -h 127.0.0.1 -p 15432 -U postgres -d brobrogid

# Или через Node/Python клиент
DB_URL="postgres://postgres:PASS@127.0.0.1:15432/brobrogid" node script.js

# Закрыть туннель
pkill -f "15432:127.0.0.1:5432"
```

### Напрямую через docker exec (быстро для single queries)

```bash
ssh -i /home/cosmo/.ssh/id_ed25519_selectel root@87.228.33.68 \
  "docker exec brobrogid-postgres psql -U postgres -d brobrogid -c 'SELECT count(*) FROM pois;'"
```

### Через публичный API (для тестирования RLS)

```bash
ANON="<key из .agent/ADMIN_CREDENTIALS.md>"
curl "https://api.brobrogid.ru/rest/v1/pois?limit=5" -H "apikey: $ANON"
```

## Operational runbook — типовые действия

См. `../09_workflows/` для пошаговых инструкций:

- `deploy.md` — применить новую миграцию
- `rollback.md` — откатить миграцию
- `adding_content.md` — добавить новый POI/тур/гида

## Related

- `schema.md` — все таблицы и поля
- `migrations.md` — история миграций
- `rls_policies.md` — Row Level Security детали
- `triggers_and_functions.md` — PL/pgSQL логика
- `connections.md` — как подключиться
- `backup_restore.md` — backup operations
- `../06_security/README.md` — security posture
- `../08_infrastructure/docker_compose.md` — полный docker-compose разбор
