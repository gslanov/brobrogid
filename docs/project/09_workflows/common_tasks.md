---
title: Common tasks — частые операции
type: runbook
audience: archimag, dev, ops
owner: archimag
last_updated: 2026-04-07
---

# Частые задачи — быстрые рецепты

## Подключиться к БД

```bash
ssh -i ~/.ssh/id_ed25519_selectel root@87.228.33.68 \
  "docker exec -it brobrogid-postgres psql -U postgres -d brobrogid"
```

Полнее: `../02_database/connections.md`.

## Посмотреть количество записей

```bash
ssh selectel "docker exec brobrogid-postgres psql -U postgres -d brobrogid -c \"
  SELECT 'pois' as t, count(*) FROM pois UNION ALL
  SELECT 'tours', count(*) FROM tours UNION ALL
  SELECT 'guides', count(*) FROM guides UNION ALL
  SELECT 'reviews', count(*) FROM reviews UNION ALL
  SELECT 'menu_items', count(*) FROM menu_items UNION ALL
  SELECT 'tour_bookings', count(*) FROM tour_bookings;
\""
```

## Сделать backup прямо сейчас

```bash
ssh selectel "/opt/supabase/scripts/backup.sh"
ssh selectel "ls -lh /opt/supabase/backups/ | tail -3"
```

## Проверить SSL сроки

```bash
ssh selectel "certbot certificates"
```

## Reload PostgREST schema

После DDL изменений:
```bash
ssh selectel "docker exec brobrogid-postgres psql -U postgres -d brobrogid -c \"NOTIFY pgrst, 'reload schema';\""
```

## Деплой только Astro / только PWA

```bash
(cd /home/cosmo/SOFT/COSMO/BROMARKET && ./deploy.sh)
(cd /home/cosmo/SOFT/COSMO/BROBROGID && ./deploy.sh)
```

## Получить admin JWT

```bash
TOKEN=$(curl -s -X POST 'https://api.brobrogid.ru/auth/v1/token?grant_type=password' \
  -H 'Content-Type: application/json' \
  -d '{"email":"admin@brobrogid.ru","password":"<see ADMIN_CREDENTIALS.md>"}' \
  | jq -r .access_token)
echo $TOKEN
```

## Anon GET через PostgREST

```bash
ANON="<from .agent/ADMIN_CREDENTIALS.md>"
curl "https://api.brobrogid.ru/rest/v1/pois?limit=5&select=id,slug,name" \
  -H "apikey: $ANON" | jq
```

## Перезапустить Supabase стек

```bash
ssh selectel "cd /opt/supabase && docker compose restart"
```

Полный restart (с downtime ~5 секунд):
```bash
ssh selectel "cd /opt/supabase && docker compose down && docker compose up -d"
```

## Rebuild только prerender (без vite build)

Иногда полезно если только данные изменились:
```bash
cd /home/cosmo/SOFT/COSMO/BROBROGID
npx tsx scripts/prerender.ts
rsync -avz --delete dist/ -e "ssh -i ~/.ssh/id_ed25519_selectel" \
  root@87.228.33.68:/var/www/brobrogid-app/
```

## Очистить старые backups вручную

```bash
ssh selectel "find /opt/supabase/backups/ -name 'brobrogid-*.dump.gz' -mtime +14 -delete"
```

## Найти POI по части slug

```bash
ssh selectel "docker exec brobrogid-postgres psql -U postgres -d brobrogid -c \"
  SELECT id, slug, slug_legacy, name->>'ru' as name_ru
  FROM pois
  WHERE slug ILIKE '%ущел%' OR slug_legacy ILIKE '%gorge%';
\""
```

## Посмотреть последние tour_bookings

```bash
ssh selectel "docker exec brobrogid-postgres psql -U postgres -d brobrogid -c \"
  SELECT id, customer_name, customer_phone, status, created_at
  FROM tour_bookings
  ORDER BY created_at DESC
  LIMIT 10;
\""
```

## Изменить пароль admin user

```bash
# Через GoTrue admin API (требует service_role JWT)
SERVICE_KEY="<from .agent/ADMIN_CREDENTIALS.md>"
USER_ID="<get via auth.users>"

curl -X PUT "https://api.brobrogid.ru/auth/v1/admin/users/$USER_ID" \
  -H "apikey: $SERVICE_KEY" \
  -H "Authorization: Bearer $SERVICE_KEY" \
  -H "Content-Type: application/json" \
  -d '{"password":"new-password"}'
```

## Related

- `../02_database/connections.md` — все способы подключения
- `deploy.md`, `rollback.md`
- `../08_infrastructure/monitoring.md`
- `adding_content.md`
