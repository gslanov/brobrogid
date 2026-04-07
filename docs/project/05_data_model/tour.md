---
title: Tour — туристический тур
type: reference
audience: archimag, dev, content
owner: archimag
last_updated: 2026-04-07
---

# Tour

Туристический маршрут с гидом.

## TypeScript

```ts
interface Tour {
  id: string
  slug: string
  slug_legacy?: string
  name: LocalizedText
  description: LocalizedText
  guide_id: string              // FK → guides.id
  type: 'walking' | 'driving' | 'mixed' | 'horseback' | 'rafting'
  difficulty: 'easy' | 'medium' | 'hard'
  duration: {
    hours?: number
    days?: number
  }
  price: {
    amount: number
    currency: 'RUB'
    per: 'person' | 'group'
  }
  group_size: { min: number; max: number }
  route: { lat: number; lng: number; name?: LocalizedText }[]   // массив точек
  cover?: string                // photo URL
  photos?: string[]
  included?: LocalizedText[]    // что включено
  not_included?: LocalizedText[]
  available_dates?: string[]    // ISO dates
  rating?: number
  reviews_count?: number
  created_at: string
  updated_at: string
}
```

## Бизнес-правила

1. **`guide_id` FK** на `guides` — один тур у одного гида
2. `route[]` — JSON массив координат для отрисовки маршрута на карте
3. `available_dates[]` — конкретные даты, не диапазон. UI показывает календарь.
4. `price.per='group'` → цена за всю группу, `'person'` → за человека
5. Удаление гида **не должно** удалять туры (FK без ON DELETE CASCADE)

## Связь с TourBooking

Заявки на туры → `tour_bookings` (отдельная защищённая таблица). При INSERT bookings триггер делает snapshot `tour.{name, price, duration}` в `tour_bookings.tour_snapshot` (см. `../02_database/triggers_and_functions.md`).

## Where used

- **brobrogid.ru**: `/tours/[slug]`, `/tours`, главная (топ туры)
- **PWA**: `/tours/:slug`, ToursPage
- **Admin**: `/admin/tours` CRUD

## Total

20 туров (на 2026-04).

## Related

- `guide.md` — связанный гид
- `review.md` — отзывы (target_type='tour')
- `../02_database/schema.md` — таблица tours
