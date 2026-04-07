---
title: POI — Point of Interest
type: reference
audience: archimag, dev, content
owner: archimag
last_updated: 2026-04-07
---

# POI (Point of Interest)

Главная сущность контента — место которое можно посетить.

## TypeScript

```ts
interface POI {
  id: string                    // 'poi-001' или slug
  slug: string                  // русская транслитерация
  slug_legacy?: string          // старый английский slug
  name: LocalizedText
  description: {
    short: LocalizedText
    full?: LocalizedText
  }
  category: 'nature' | 'culture' | 'food' | 'activities' | 'shopping' | 'accommodation'
  subcategory?: string          // 'mountain', 'museum', 'restaurant', ...
  location: Location
  photos: string[]              // URLs
  hours?: WorkingHours          // Mon-Sun
  contacts?: {
    phone?: string
    email?: string
    website?: string
    instagram?: string
    telegram?: string
  }
  price_range?: '$' | '$$' | '$$$'
  rating?: number               // 0-5
  tags?: string[]
  hasMenu?: boolean             // true → /poi/{slug}/menu route
  cuisine?: string[]            // только для food
  features?: string[]           // 'wifi', 'parking', 'wheelchair_accessible', ...
  created_at: string
  updated_at: string
}
```

## БД представление

См. `../02_database/schema.md` — таблица `pois`. Большинство полей JSONB (`name`, `description`, `location`, `hours`, `contacts`).

## Категории

| category | Описание | Кол-во |
|---|---|---|
| `nature` | Горы, ущелья, водопады, заповедники | ~30 |
| `culture` | Музеи, храмы, памятники | ~25 |
| `food` | Рестораны, кафе, бары | ~30 |
| `activities` | Туристические активности (рафтинг, верховая езда, ...) | ~15 |
| `shopping` | Магазины, рынки | ~10 |
| `accommodation` | Отели, гостевые дома | ~10 |

Total: 119 (на 2026-04).

## Бизнес-правила

1. **slug unique** в таблице `pois`
2. `category=food` → может иметь `hasMenu=true` → menu_items связаны через `poi_id`
3. `photos[]` — первое фото используется как cover (Open Graph image)
4. `description.short` (≤160 символов) — для meta description
5. `description.full` — для основного текста на странице POI
6. Удаление POI каскадно НЕ удаляет связанные `menu_items`/`reviews` (полиморфные FK без ON DELETE)

## Where used

- **brobrogid.ru** (Astro): `/places/[slug]`, главная, категорийные страницы
- **app.brobrogid.ru** (PWA): `/poi/:slug`, ExplorePage, MapPage, SearchPage
- **Admin panel**: `/admin/pois` CRUD

## Source of truth

Таблица `public.pois` в Supabase.
- Astro читает напрямую через `@supabase/supabase-js`
- PWA читает через JSON snapshot `public/content/pois.json` (legacy, Pool 4 переведёт)

## Related

- `../02_database/schema.md` — SQL
- `menu_item.md` — связанная сущность
- `review.md` — отзывы (polymorphic)
- `localized_text.md`, `location.md` — общие типы
