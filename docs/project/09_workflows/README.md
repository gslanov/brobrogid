---
title: Workflows — section index
type: overview
audience: all-agents
owner: archimag
last_updated: 2026-04-07
stub: true
---

# 09_workflows — как делать типовые действия

Runbooks для повторяющихся задач.

## Файлы

- `deploy.md` — **stub** — full deploy pipeline (PWA + content site + DB migrations)
- `adding_content.md` — **stub** — как добавить новый POI, тур, гида, отзыв
- `opening_indexing.md` — указатель на `../07_seo/launch_procedure.md` (единственное место)
- `rollback.md` — **stub** — откат миграций, deployments, nginx конфигов
- `agent_coordination.md` — **stub** — как координировать работу между archimag и новым агентом
- `common_tasks.md` — **stub** — мелочи (обновить bot token, перезапустить сервис, посмотреть логи)

## Pattern для runbook

Каждый runbook следует template в `../CONTRIBUTING.md`:

1. **When to do this** — триггер
2. **Prerequisites** — нужный доступ и знания
3. **Steps** — пошагово с точными командами и ожидаемым output
4. **Verification** — как убедиться что успех
5. **Rollback** — что делать если сломалось
6. **Troubleshooting** — типовые ошибки и их фиксы

## Quick references

### Deploy app.brobrogid.ru

```bash
cd /home/cosmo/SOFT/COSMO/BROBROGID
./deploy.sh
# vite build → prerender → sitemap → rsync → nginx reload
```

### Deploy brobrogid.ru (новый агент)

```bash
# В сессии нового агента, local path /home/cosmo/SOFT/COSMO/BROBROGID_SITE/
cd /home/cosmo/SOFT/COSMO/BROBROGID_SITE
npm run build
bash scripts/deploy.sh --confirm
```

### Apply DB migration

```bash
# Test locally first via SSH tunnel (see 02_database/connections.md)
# Then:
rsync migration.sql root@selectel:/opt/supabase/migrations/
ssh selectel 'docker exec -i brobrogid-postgres psql -U postgres -d brobrogid -v ON_ERROR_STOP=1 < /opt/supabase/migrations/NNNN_name.sql'
```

### Reload PostgREST schema cache (after DDL)

```bash
ssh selectel "docker exec brobrogid-postgres psql -U postgres -d brobrogid -c \"NOTIFY pgrst, 'reload schema';\""
# Or full restart:
ssh selectel "cd /opt/supabase && docker compose restart postgrest"
```

### Force backup

```bash
ssh selectel "/usr/local/bin/brobrogid-backup.sh"
```

### Check services status

```bash
ssh selectel "cd /opt/supabase && docker compose ps"
ssh selectel "systemctl status nginx"
```

### Tail logs

```bash
ssh selectel "docker logs brobrogid-postgres --tail 50 -f"
ssh selectel "docker logs brobrogid-postgrest --tail 50 -f"
ssh selectel "docker logs brobrogid-gotrue --tail 50 -f"
ssh selectel "tail -f /var/log/nginx/brobrogid-site-access.log"
```

## Related

- `../07_seo/launch_procedure.md` — полный launch runbook
- `../02_database/README.md` — Supabase ops
- `../08_infrastructure/` — server config
