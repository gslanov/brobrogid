---
title: Monitoring & health checks
type: runbook
audience: archimag, ops
owner: archimag
last_updated: 2026-04-07
---

# Мониторинг

⚠️ Полноценного мониторинга **нет** (no Grafana, no Prometheus, no UptimeRobot). Используются ручные health checks. Это known gap, см. `../06_security/known_issues.md`.

## Quick health check (one-liner)

```bash
ssh selectel "free -h | head -2; df -h /; uptime; docker compose -f /opt/supabase/docker-compose.yml ps"
```

## Endpoint checks

```bash
# brobrogid.ru
curl -sI https://brobrogid.ru/ | head -1

# app.brobrogid.ru
curl -sI https://app.brobrogid.ru/ | head -1

# api PostgREST
curl -sI https://api.brobrogid.ru/rest/v1/ | head -1

# api GoTrue
curl -s https://api.brobrogid.ru/auth/v1/health
```

Все должны вернуть HTTP 200 / `{"version":...}`.

## Postgres health

```bash
ssh selectel "docker exec brobrogid-postgres pg_isready -U postgres"
ssh selectel "docker exec brobrogid-postgres psql -U postgres -d brobrogid -c 'SELECT count(*) FROM pois;'"
```

## Логи

| Сервис | Команда |
|---|---|
| nginx errors | `tail -f /var/log/nginx/error.log` |
| nginx access | `tail -f /var/log/nginx/access.log` |
| postgres | `docker logs brobrogid-postgres --tail 100` |
| postgrest | `docker logs brobrogid-postgrest --tail 100` |
| gotrue | `docker logs brobrogid-gotrue --tail 100` |
| backup | `tail -50 /var/log/brobrogid-backup.log` |

## Алерты (нет)

Сейчас алертов нет. Статус мониторится при ручном заходе или после жалобы пользователя. Для production-grade — нужны:

1. **UptimeRobot / BetterUptime** — 5min checks на 3 endpoint, email алерт
2. **Disk space** — алерт при <20%
3. **Failed backups** — алерт если `backup.sh` exit != 0
4. **SSL expiry** — certbot уже шлёт email за 20 дней

**Минимально:** настроить UptimeRobot бесплатно (50 monitors) на 3 endpoint.

## Smoke test после деплоя

```bash
# 1. Все 3 домена отвечают 200
for d in brobrogid.ru app.brobrogid.ru api.brobrogid.ru; do
  echo -n "$d: "
  curl -sI https://$d/ | head -1
done

# 2. PostgREST отдаёт данные
curl -s "https://api.brobrogid.ru/rest/v1/pois?limit=1&select=id" \
  -H "apikey: $ANON" | jq

# 3. Sitemap есть
curl -sI https://app.brobrogid.ru/sitemap.xml | head -1
```

## Related

- `../09_workflows/rollback.md` — что делать когда сломалось
- `../06_security/known_issues.md` — отсутствие мониторинга как gap
