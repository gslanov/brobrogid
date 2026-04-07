---
title: Domain types — обзор
type: reference
audience: archimag, dev
owner: archimag
last_updated: 2026-04-07
---

# Доменные типы BROBROGID

TypeScript типы живут в `src/data/types.ts` и зеркалируют структуру таблиц Supabase (см. `../02_database/schema.md`).

## Сущности

| Тип | Файл | Таблица БД |
|---|---|---|
| `POI` | `poi.md` | `public.pois` |
| `Tour` | `tour.md` | `public.tours` |
| `Guide` | `guide.md` | `public.guides` |
| `Review` | `review.md` | `public.reviews` |
| `MenuItem` | `menu_item.md` | `public.menu_items` |
| `EmergencyContact` | `emergency.md` | `public.emergency_contacts` |
| `TransportRoute` | `transport.md` | `public.transport_routes` |
| `TourBooking` | (см. 02_database) | `public.tour_bookings` |
| `Collection` | (см. 04_pwa_app) | `public.collections` |
| `Order` | (см. 04_pwa_app) | `public.orders` |

## Общие типы

| Тип | Файл |
|---|---|
| `LocalizedText` | `localized_text.md` |
| `Location` | `location.md` |

## Relations

```
POI ─┬─ has many MenuItem (если category=food)
     ├─ has many Review (target_type='poi')
     └─ referenced by Order

Tour ─┬─ belongs to Guide
      ├─ has many Review (target_type='tour')
      └─ has many TourBooking

Guide ─┬─ has many Tour
       └─ has many Review (target_type='guide')

Review — polymorphic (target_type + target_id)
```

## Конвенции

- **id** — string (slugged human-readable, e.g., `poi-001` или `visadon-cyf`)
- **slug** — string, русская транслитерация, unique
- **slug_legacy** — string?, старый английский slug для 301
- **created_at, updated_at** — ISO timestamp
- **LocalizedText** — `{ ru: string; en: string }`
- **Location** — `{ lat: number; lng: number; address?: LocalizedText }`

## Related

- `../02_database/schema.md` — SQL schema
- `../04_pwa_app/data_flow.md` — как типы попадают в IDB/Zustand
