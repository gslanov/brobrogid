---
title: Server resources — VPS specs
type: reference
audience: archimag, ops
owner: archimag
last_updated: 2026-04-07
---

# Selectel VPS

## Текущая конфигурация

| Параметр | Значение |
|---|---|
| Provider | Selectel |
| IP | `87.228.33.68` |
| Hostname | `brobrogid-prod` |
| OS | Ubuntu 22.04 LTS |
| CPU | 2 vCPU |
| RAM | 4 GB |
| Disk | 40 GB SSD |
| Bandwidth | unlimited (fair use) |
| Region | RU (для соответствия 152-ФЗ) |

## Доступ

```bash
ssh -i ~/.ssh/id_ed25519_selectel root@87.228.33.68
```

Selectel панель: см. `LSeEdCpXLLOce4Oj30XijRwpa_566008` в env (пользовательские заметки).

## Что крутится

| Что | RAM | Disk |
|---|---|---|
| nginx | ~30 MB | ~50 MB binary + logs |
| Docker (postgres+postgrest+gotrue) | ~600 MB | ~500 MB images + 200 MB data |
| `/var/www/brobrogid/` (Astro) | — | ~50 MB |
| `/var/www/brobrogid-app/` (PWA) | — | ~80 MB |
| `/opt/supabase/backups/` | — | ~50 MB (14 дней × ~3 MB) |
| systemd, base OS | ~500 MB | ~5 GB |

**Free:** ~3 GB RAM, ~30 GB disk. Большой запас.

## Мониторинг ресурсов

```bash
ssh selectel "free -h && df -h && uptime"
ssh selectel "docker stats --no-stream"
```

## Когда апгрейдить

Триггеры для апгрейда (не сейчас):
- RAM > 80% устойчиво → upgrade до 8 GB
- Disk > 80% → +20 GB или чистка backups/images
- CPU load > 70% устойчиво → +2 vCPU

После Pool 4 нагрузка вырастет (PWA читает Supabase напрямую) — следить.

## Backup VPS

Selectel предоставляет snapshot-ы (платная опция). Сейчас НЕ настроено. Полагаемся на:
1. Daily pg_dump (см. `../02_database/backup_restore.md`)
2. Git репозиторий (код)
3. `.env` хранится в `.agent/ADMIN_CREDENTIALS.md` (gitignored backup)

## DNS

| Запись | Тип | Значение |
|---|---|---|
| `brobrogid.ru` | A | `87.228.33.68` |
| `www.brobrogid.ru` | A | `87.228.33.68` |
| `app.brobrogid.ru` | A | `87.228.33.68` |
| `api.brobrogid.ru` | A | `87.228.33.68` |

DNS управляется через Selectel панель. TTL 3600.

## Firewall

`ufw` включён:
```
22/tcp ALLOW (SSH)
80/tcp ALLOW (HTTP, redirect to HTTPS)
443/tcp ALLOW (HTTPS)
```

PostgreSQL (5432), PostgREST (3000), GoTrue (9999) — слушают только loopback, в firewall не открыты.

## Related

- `nginx.md`
- `docker_compose.md`
- `monitoring.md`
