---
title: Cron jobs на сервере
type: reference
audience: archimag, ops
owner: archimag
last_updated: 2026-04-07
---

# Cron jobs на 87.228.33.68

## Активные задачи

| Время (MSK) | Команда | Что делает |
|---|---|---|
| `0 3 * * *` | `/opt/supabase/scripts/backup.sh` | Daily pg_dump → `/opt/supabase/backups/` |
| `*/12 * * * *` | `certbot renew --quiet` (через systemd timer) | SSL renewal check |

## Просмотр

```bash
ssh selectel "crontab -l"
ssh selectel "systemctl list-timers"
```

## backup.sh

См. `../02_database/backup_restore.md`. Daily pg_dump с ротацией 14 дней.

## Логи

```
/var/log/brobrogid-backup.log     # backup.sh output
/var/log/letsencrypt/             # certbot
```

```bash
ssh selectel "tail -50 /var/log/brobrogid-backup.log"
```

## Что НЕ автоматизировано

- **JSON snapshot регенерация** для PWA — ручной процесс (Pool 4 уберёт необходимость)
- **Astro rebuild** — ручной деплой
- **PWA rebuild** — ручной деплой
- **Off-site backup** — нет (TODO)

## Добавить новую задачу

```bash
ssh selectel "crontab -e"
# Добавить строку, сохранить
ssh selectel "crontab -l"  # verify
```

Логировать обязательно:
```cron
0 3 * * * /opt/supabase/scripts/backup.sh >> /var/log/brobrogid-backup.log 2>&1
```

## Related

- `../02_database/backup_restore.md`
- `ssl.md` — certbot
- `monitoring.md`
