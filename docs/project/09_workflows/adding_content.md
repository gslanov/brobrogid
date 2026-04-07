---
title: Adding content — POI / Tour / Guide / Review
type: runbook
audience: archimag, content, dev
owner: archimag
last_updated: 2026-04-07
---

# Добавить контент

## Пути добавления

Сейчас есть **три** способа (от лучшего к худшему):

1. **Через Supabase напрямую (psql)** — для bulk add, scripted import
2. **Через Admin panel** — UI, но изменения только локально в IDB (см. `../04_pwa_app/admin_panel.md`) ❌ не попадает на сервер
3. **Через прямую правку JSON** в `public/content/*.json` + commit → deploy ❌ не попадает в Supabase

**Канонический способ сейчас:** №1 (psql) + потом регенерация JSON snapshot для PWA.

После Pool 4: Admin panel станет канонической, изменения сразу в Supabase, оба сайта видят.

## Добавить POI через psql

```bash
ssh -i ~/.ssh/id_ed25519_selectel root@87.228.33.68 'docker exec -i brobrogid-postgres psql -U postgres -d brobrogid <<SQL
INSERT INTO public.pois (id, slug, name, description, category, location, photos, created_at, updated_at)
VALUES (
  'poi-cei-ushelye',
  'cejskoe-ushele',
  '{"ru":"Цейское ущелье","en":"Tsey Gorge"}',
  '{"short":{"ru":"...","en":"..."},"full":{"ru":"...","en":"..."}}',
  'nature',
  '{"lat":42.7833,"lng":43.9167,"address":{"ru":"...","en":"..."}}',
  ARRAY['https://...'],
  now(),
  now()
);
SQL'
```

После INSERT:

1. Регенерировать JSON для PWA:
   ```bash
   cd /home/cosmo/SOFT/COSMO/BROBROGID
   python3 scripts/export_json.py  # или аналог
   git add public/content/pois.json
   git commit -m "content: add POI Цейское ущелье"
   ```

2. Reload PostgREST schema (если новая таблица — для INSERT не нужно):
   ```bash
   ssh selectel "docker exec brobrogid-postgres psql -U postgres -d brobrogid -c \"NOTIFY pgrst, 'reload schema';\""
   ```

3. Деплой обоих сайтов:
   ```bash
   ./deploy.sh  # PWA
   (cd ../BROMARKET && ./deploy.sh)  # Astro
   ```

## Bulk import через JSON

Скрипт `supabase/seed/import.ts` (требует SSH tunnel):

```bash
ssh -i ~/.ssh/id_ed25519_selectel -f -N -L 15432:127.0.0.1:5432 root@87.228.33.68
DB_URL="postgres://postgres:$(grep POSTGRES_PASSWORD supabase/.env | cut -d= -f2)@127.0.0.1:15432/brobrogid" \
  npx tsx supabase/seed/import.ts public/content/pois.json
pkill -f "15432:127.0.0.1:5432"
```

## Чек-лист нового POI

- [ ] Уникальный `slug` (русская транслитерация)
- [ ] `name.ru` обязательно, `name.en` желательно
- [ ] `description.short.ru` ≤160 символов
- [ ] `description.full.ru` 300-1000 символов
- [ ] `category` из enum
- [ ] `location.lat`, `location.lng` валидны
- [ ] `location.address.ru` указан
- [ ] `photos[]` минимум 1 URL (для OG image)
- [ ] Если ресторан → `hasMenu`, `cuisine`
- [ ] Сразу после add: `updated_at = now()`

## Добавить меню к ресторану

1. POI должен иметь `hasMenu=true`
2. INSERT в `menu_items` с `poi_id` указывающим на этот POI
3. Bulk add — через JSON import (см. выше)

## Добавить отзыв

```sql
INSERT INTO public.reviews (id, target_type, target_id, author_name, rating, text, source, created_at, updated_at)
VALUES (
  'review-' || gen_random_uuid()::text,
  'poi',
  'poi-cei-ushelye',
  'Иван Иванов',
  5,
  '{"ru":"Прекрасное место","en":"Beautiful place"}',
  'manual',
  now(),
  now()
);
```

## Related

- `../05_data_model/poi.md`, `tour.md`, `guide.md`, `review.md`, `menu_item.md`
- `../02_database/connections.md`
- `../04_pwa_app/admin_panel.md`
- `deploy.md`
