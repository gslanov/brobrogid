---
title: Backup & Restore — резервное копирование Supabase
type: runbook
audience: archimag, ops
owner: archimag
last_updated: 2026-04-07
---

# Backup и восстановление

## Что бэкапится

PostgreSQL база `brobrogid` целиком — включая `public`, `auth`, `storage` schemas. Это единственный source of truth.

**НЕ бэкапится:**
- `public/content/*.json` в репо (это derived snapshot, восстанавливается из БД)
- `dist/` (build artifact)
- Docker volumes для PostgREST/GoTrue (stateless, restart восстанавливает)

## Daily pg_dump (cron)

На сервере `87.228.33.68` cron запускает `/opt/supabase/scripts/backup.sh` каждый день в 03:00 MSK:

```bash
#!/bin/bash
set -e
DATE=$(date +%Y-%m-%d)
BACKUP_DIR=/opt/supabase/backups
mkdir -p "$BACKUP_DIR"

docker exec brobrogid-postgres pg_dump -U postgres -Fc brobrogid \
  > "$BACKUP_DIR/brobrogid-$DATE.dump"

gzip "$BACKUP_DIR/brobrogid-$DATE.dump"

# Ротация: оставить последние 14 дней
find "$BACKUP_DIR" -name "brobrogid-*.dump.gz" -mtime +14 -delete
```

Crontab:
```
0 3 * * * /opt/supabase/scripts/backup.sh >> /var/log/brobrogid-backup.log 2>&1
```

**Формат:** custom format (`-Fc`) — для `pg_restore` с возможностью parallel restore и selective table restore.

**Размер:** ~3-5 MB сжатый (на 2026-04).

## Скачать бэкап локально

```bash
ssh -i ~/.ssh/id_ed25519_selectel root@87.228.33.68 \
  "ls -lh /opt/supabase/backups/"

scp -i ~/.ssh/id_ed25519_selectel \
  root@87.228.33.68:/opt/supabase/backups/brobrogid-2026-04-06.dump.gz \
  ./local-backups/
```

## Restore

### На том же сервере (rollback)

```bash
ssh selectel
cd /opt/supabase

# Скопировать дамп в контейнер
gunzip -k backups/brobrogid-2026-04-06.dump.gz
docker cp backups/brobrogid-2026-04-06.dump brobrogid-postgres:/tmp/

# Drop + recreate (⚠️ destructive)
docker exec brobrogid-postgres psql -U postgres -c "DROP DATABASE brobrogid;"
docker exec brobrogid-postgres psql -U postgres -c "CREATE DATABASE brobrogid;"

# Restore
docker exec brobrogid-postgres pg_restore -U postgres -d brobrogid \
  --no-owner --no-privileges /tmp/brobrogid-2026-04-06.dump

# Reload PostgREST
docker compose restart postgrest
```

⚠️ **Перед restore:** сделать свежий dump текущего состояния на случай если restore окажется неверным.

### На новой машине (DR)

1. Поднять Supabase docker-compose stack из репо `supabase/`
2. Дождаться `postgres` healthy
3. `docker exec brobrogid-postgres psql -U postgres -c "CREATE DATABASE brobrogid;"`
4. `pg_restore` как выше
5. Установить пароли ролей из `.env` (роли пересоздаются дампом, но пароли могут не совпасть):
   ```sql
   ALTER ROLE authenticator WITH LOGIN PASSWORD '<from .env>';
   ALTER ROLE supabase_auth_admin WITH LOGIN PASSWORD '<from .env>';
   ```
6. Restart всего стека: `docker compose restart`
7. `NOTIFY pgrst, 'reload schema'`

## Selective restore (одна таблица)

```bash
# Список объектов в дампе
docker exec brobrogid-postgres pg_restore -l /tmp/brobrogid-2026-04-06.dump > /tmp/toc.list

# Отредактировать toc.list — оставить только нужные строки (TABLE DATA public pois ...)
# Применить
docker exec brobrogid-postgres pg_restore -U postgres -d brobrogid \
  -L /tmp/toc.list /tmp/brobrogid-2026-04-06.dump
```

## Verify backup

После каждого dump:
```bash
docker exec brobrogid-postgres pg_restore --list /tmp/dump.dump | head
# Должно быть много строк "TABLE DATA public ..."
```

Раз в месяц — test restore на отдельный временный database:
```sql
CREATE DATABASE brobrogid_test;
\c brobrogid_test
-- pg_restore туда
SELECT count(*) FROM pois;  -- должно совпадать с prod
DROP DATABASE brobrogid_test;
```

## Что НЕ покрыто

1. **Off-site backups** — дампы лежат только на том же VPS. При полной потере сервера — данные потеряются. **TODO:** rsync на отдельную машину или S3.
2. **Point-in-time recovery (PITR)** — нет WAL archiving. Можно восстановить только на момент последнего dump (потеря до 24 часов).
3. **Logical replication** — нет реплики. Single point of failure.

Это известные ограничения. См. `../06_security/known_issues.md`.

## Related

- `connections.md` — как подключиться к БД
- `migrations.md` — как откатить миграцию (часто проще dump+restore чем rollback миграции)
- `../08_infrastructure/cron_jobs.md` — все cron на сервере
