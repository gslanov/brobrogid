---
title: Docker Compose — Supabase stack
type: reference
audience: archimag, ops
owner: archimag
last_updated: 2026-04-07
---

# Docker Compose на сервере

## Расположение

```
/opt/supabase/
├── docker-compose.yml
├── .env                        # secrets (gitignored)
├── volumes/
│   ├── postgres/data/         # PostgreSQL persistent data
│   └── ...
├── backups/                    # daily pg_dump
└── scripts/
    ├── backup.sh
    └── ...
```

## Контейнеры

| Контейнер | Образ | Port | Назначение |
|---|---|---|---|
| `brobrogid-postgres` | `postgres:16-alpine` | 127.0.0.1:5432 | PostgreSQL |
| `brobrogid-postgrest` | `postgrest/postgrest:v12` | 127.0.0.1:3000 | REST API |
| `brobrogid-gotrue` | `supabase/gotrue:v2` | 127.0.0.1:9999 | Auth |

Все слушают только loopback. Внешний доступ — через nginx (см. `nginx.md`).

## docker-compose.yml (выдержка)

```yaml
version: '3.8'

services:
  postgres:
    container_name: brobrogid-postgres
    image: postgres:16-alpine
    restart: unless-stopped
    ports:
      - "127.0.0.1:5432:5432"
    environment:
      POSTGRES_DB: brobrogid
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD}
    volumes:
      - ./volumes/postgres/data:/var/lib/postgresql/data
      - ./volumes/postgres/init:/docker-entrypoint-initdb.d
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres"]
      interval: 10s
    command:
      - postgres
      - -c
      - max_connections=100
      - -c
      - shared_buffers=256MB

  postgrest:
    container_name: brobrogid-postgrest
    image: postgrest/postgrest:v12.0.2
    restart: unless-stopped
    ports:
      - "127.0.0.1:3000:3000"
    depends_on:
      postgres:
        condition: service_healthy
    environment:
      PGRST_DB_URI: postgres://authenticator:${AUTHENTICATOR_PASSWORD}@postgres:5432/brobrogid
      PGRST_DB_SCHEMAS: public
      PGRST_DB_ANON_ROLE: anon
      PGRST_JWT_SECRET: ${JWT_SECRET}
      PGRST_DB_POOL: 10

  gotrue:
    container_name: brobrogid-gotrue
    image: supabase/gotrue:v2.158.1
    restart: unless-stopped
    ports:
      - "127.0.0.1:9999:9999"
    depends_on:
      postgres:
        condition: service_healthy
    environment:
      GOTRUE_DB_DRIVER: postgres
      GOTRUE_DB_DATABASE_URL: postgres://supabase_auth_admin:${AUTH_ADMIN_PASSWORD}@postgres:5432/brobrogid?search_path=auth
      GOTRUE_JWT_SECRET: ${JWT_SECRET}
      GOTRUE_JWT_EXP: 3600
      GOTRUE_SITE_URL: https://app.brobrogid.ru
      GOTRUE_DISABLE_SIGNUP: "true"   # ⚠️ только админ создаёт users

networks:
  default:
    name: supabase_default
```

## Команды

```bash
ssh selectel
cd /opt/supabase

docker compose ps                        # статус
docker compose logs -f postgrest         # логи
docker compose restart                   # restart всех
docker compose restart postgrest         # один сервис
docker compose down && docker compose up -d  # full restart
docker compose pull && docker compose up -d  # update images
```

## Volumes

`./volumes/postgres/data` — persistent storage PostgreSQL. **Не удалять**, иначе потеря всех данных. Размер ~100-200 MB на 2026-04.

Backup volumes — через `pg_dump` (см. `../02_database/backup_restore.md`), не через копирование `volumes/`.

## Обновление образов

```bash
# Перед upgrade — backup!
ssh selectel "/opt/supabase/scripts/backup.sh"

# Pin версии в docker-compose.yml — менять явно
ssh selectel "cd /opt/supabase && docker compose pull && docker compose up -d"

# Verify
ssh selectel "docker compose ps && curl -s https://api.brobrogid.ru/rest/v1/ | head"
```

## Resource usage

| Контейнер | RAM | CPU |
|---|---|---|
| postgres | ~300-500 MB | <5% idle |
| postgrest | ~50 MB | <1% |
| gotrue | ~30 MB | <1% |

VPS: 4 GB RAM, 2 vCPU — много запаса.

## Related

- `../02_database/connections.md` — доступ к контейнерам
- `../02_database/backup_restore.md` — backups
- `nginx.md` — reverse proxy
- `monitoring.md` — health checks
