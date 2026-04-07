---
title: Rollback — что делать когда сломалось
type: runbook
audience: archimag, dev, ops
owner: archimag
last_updated: 2026-04-07
---

# Rollback процедуры

## Триаж

Сначала **определи что сломано**:

```bash
# 3 endpoint
for d in brobrogid.ru app.brobrogid.ru api.brobrogid.ru; do
  echo -n "$d: "
  curl -sI https://$d/ 2>&1 | head -1
done

# Логи
ssh selectel "tail -50 /var/log/nginx/error.log"
ssh selectel "docker compose -f /opt/supabase/docker-compose.yml ps"
```

## Сценарий 1: brobrogid.ru сломан после деплоя

```bash
# Восстановить предыдущую версию из локального backup
cd /home/cosmo/SOFT/COSMO/BROMARKET
ls dist.backup-*  # выбрать последний рабочий

rsync -avz --delete dist.backup-YYYYMMDD-HHMM/ \
  -e "ssh -i ~/.ssh/id_ed25519_selectel" \
  root@87.228.33.68:/var/www/brobrogid/

ssh selectel "nginx -s reload"
```

Если нет локального backup → `git checkout <previous-commit>` → `./deploy.sh`.

## Сценарий 2: app.brobrogid.ru сломан после деплоя

То же самое, но `/var/www/brobrogid-app/` и `BROBROGID/dist.backup-*`.

Если SW кэшировал поломанные chunks у пользователей → деплой kill switch SW (см. `../04_pwa_app/pwa.md`).

## Сценарий 3: PostgreSQL испорчен после миграции

```bash
ssh selectel
cd /opt/supabase
ls backups/  # последний дневной dump

# Restore процедура — см. ../02_database/backup_restore.md
gunzip -k backups/brobrogid-YYYY-MM-DD.dump.gz
docker exec brobrogid-postgres psql -U postgres -c "DROP DATABASE brobrogid;"
docker exec brobrogid-postgres psql -U postgres -c "CREATE DATABASE brobrogid;"
docker cp backups/brobrogid-YYYY-MM-DD.dump brobrogid-postgres:/tmp/
docker exec brobrogid-postgres pg_restore -U postgres -d brobrogid \
  --no-owner --no-privileges /tmp/brobrogid-YYYY-MM-DD.dump

docker compose restart postgrest
```

⚠️ Восстановление = потеря всего что добавлено после dump. Убедись что это последний вариант.

## Сценарий 4: Откат миграции БД

Каждая миграция в `supabase/migrations/` имеет соответствующий rollback в `migrations.md`. Не все миграции trivially откатываемы — иногда проще restore из dump.

См. `../02_database/migrations.md` → секция rollback для каждой миграции.

## Сценарий 5: nginx config сломан

```bash
ssh selectel "nginx -t"  # покажет ошибку конкретно
ssh selectel "nginx -t && nginx -s reload"

# Если совсем плохо
ssh selectel "cp /etc/nginx/sites-available/<broken>.conf.bak /etc/nginx/sites-available/<broken>"
ssh selectel "nginx -t && nginx -s reload"
```

**Правило:** перед правкой конфига — `cp file file.bak`.

## Сценарий 6: Docker контейнер в restart loop

```bash
ssh selectel "docker logs brobrogid-<service> --tail 50"
# Прочитай ошибку

# Часто причина — несовпадение паролей в .env vs БД
# Фикс описан в ../02_database/connections.md → troubleshooting "GoTrue migrations failing"
```

## Сценарий 7: Открыта индексация но не должна была

```bash
# Атомарно вернуть 4-layer noindex (см. 07_seo/launch_procedure.md → секция Rollback)
# Кратко:
# 1. Откатить SITE_UNDER_CONSTRUCTION = true
# 2. robots.txt → Disallow: /
# 3. nginx add_header X-Robots-Tag вернуть
# 4. Деплой обоих сайтов
# 5. Запросить Google deindex через GSC URL Removal Tool
```

См. `../07_seo/launch_procedure.md` → Rollback.

## Принципы

1. **Backup перед каждым деплоем** — `cp -r dist dist.backup-$(date +%Y%m%d-%H%M)`
2. **Backup перед каждой миграцией БД** — `backup.sh`
3. **Backup перед каждой правкой nginx** — `cp file file.bak`
4. **Не паникуй** — большинство проблем фиксятся за 5 минут восстановлением

## Related

- `../02_database/backup_restore.md`
- `../04_pwa_app/deploy.md`, `../03_content_site/deploy.md`
- `../08_infrastructure/monitoring.md`
- `../07_seo/launch_procedure.md`
