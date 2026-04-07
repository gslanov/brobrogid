---
title: api.brobrogid.ru — Supabase API
type: reference
audience: all-agents
owner: archimag
last_updated: 2026-04-07
---

# api.brobrogid.ru

Publicly accessible endpoint для Supabase self-hosted стека.

## Endpoints

| URL | Что |
|---|---|
| `https://api.brobrogid.ru/` | Info JSON (`{"service":"brobrogid-api",...}`) |
| `https://api.brobrogid.ru/health` | `{"status":"ok"}` |
| `https://api.brobrogid.ru/rest/v1/*` | PostgREST REST API (по таблицам) |
| `https://api.brobrogid.ru/auth/v1/*` | GoTrue authentication |

## Полная документация

См. `../02_database/` — там детали про:
- `README.md` — обзор Supabase стека
- `schema.md` — все таблицы и поля
- `migrations.md` — история миграций
- `rls_policies.md` — Row Level Security
- `triggers_and_functions.md` — PL/pgSQL логика
- `connections.md` — как подключиться
- `backup_restore.md` — backup operations

## Почему вынесено в отдельный раздел `02_database/`

Потому что это не просто "endpoint" — это целый стек с логикой, security, миграциями. Заслуживает отдельной иерархии документов.

Текущий файл — просто short-pointer на правильное место.

## TL;DR для future agents

- API работает на Selectel VPS `87.228.33.68`
- Docker Compose в `/opt/supabase/`
- 3 сервиса: postgres, postgrest, gotrue
- SSL через certbot
- Rate limits в nginx
- Backup daily 3:00 UTC
- Защищён 12 security fixes (SENTINEL + ARCHITECT audit rounds)

Для SEO crawlers: здесь ничего нет что должно индексироваться — API отдаёт JSON, не HTML.
