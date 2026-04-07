---
title: Review — полиморфные отзывы
type: reference
audience: archimag, dev, content
owner: archimag
last_updated: 2026-04-07
---

# Review

Отзыв на POI / Tour / Guide (полиморфная модель).

## TypeScript

```ts
interface Review {
  id: string
  target_type: 'poi' | 'tour' | 'guide'
  target_id: string             // FK без constraint (полиморфизм)
  author_name: string
  author_avatar?: string
  rating: number                // 1-5
  text: LocalizedText
  photos?: string[]
  source?: 'manual' | 'google' | 'yandex' | 'tripadvisor'
  source_url?: string
  created_at: string
  updated_at: string
}
```

## Полиморфизм

`target_type` + `target_id` вместо отдельных FK. Это даёт гибкость, но не позволяет PostgreSQL enforced FK constraint.

**Composite index** `by-target` (target_type, target_id) — для быстрого `WHERE target_type='poi' AND target_id='...'`.

## БД

См. `../02_database/schema.md` — таблица `reviews`.

```sql
CREATE INDEX reviews_by_target_idx ON public.reviews (target_type, target_id);
```

## Бизнес-правила

1. `rating` ∈ [1, 5]
2. `text` ≤ 2000 символов на каждый язык
3. **Нет user_id** — отзывы сейчас не привязаны к auth users (импортированы / ручные). Pool 4+ добавит `user_id` для UGC.
4. Удаление parent (POI/Tour/Guide) **не удаляет** связанные отзывы автоматически — нужен ручной trigger BEFORE DELETE (не реализован, см. `../02_database/rls_policies.md` → известные ограничения).

## Источники

- `source='manual'` — внесённые админом
- `source='google'` — импортированные из Google Reviews (через скрипт)
- `source='yandex'` — Yandex
- `source='tripadvisor'` — TripAdvisor

## Where used

- **brobrogid.ru**: ReviewsWidget на страницах POI/Tour/Guide
- **PWA**: ReviewsList на детальных страницах
- **Admin**: `/admin/reviews` CRUD с cascading select для target_type

## Total

499 отзывов (на 2026-04).

## Aggregation

`rating` на parent (poi/tour/guide) — denormalized. Сейчас обновляется вручную через скрипт. Будущий trigger AFTER INSERT/UPDATE/DELETE на reviews мог бы пересчитывать автоматически (не реализован).

## Related

- `poi.md`, `tour.md`, `guide.md` — parent сущности
- `../02_database/rls_policies.md` — read-only для всех
