---
title: Guide — туристический гид
type: reference
audience: archimag, dev, content
owner: archimag
last_updated: 2026-04-07
---

# Guide

Профиль гида (человек, который проводит туры).

## TypeScript

```ts
interface Guide {
  id: string
  slug: string
  slug_legacy?: string
  name: LocalizedText           // имя
  bio: LocalizedText            // биография
  avatar?: string               // photo URL
  photos?: string[]
  languages: ('ru' | 'en' | 'os' | 'de' | 'fr')[]
  experience_years?: number
  specialties?: LocalizedText[]  // 'горные туры', 'история', ...
  certifications?: LocalizedText[]
  contacts?: {
    phone?: string
    email?: string
    telegram?: string
    whatsapp?: string
    instagram?: string
  }
  rating?: number
  reviews_count?: number
  tours_count?: number          // computed
  created_at: string
  updated_at: string
}
```

## Бизнес-правила

1. **slug unique**
2. У одного гида может быть много туров (1-to-many через `tours.guide_id`)
3. `languages[]` — массив ISO кодов, минимум один
4. `bio` — основной текст на странице гида (300-1000 символов рекомендовано)

## Where used

- **brobrogid.ru**: `/tours/guide/[slug]`
- **PWA**: `/tours/guide/:slug`
- **Admin**: `/admin/guides` CRUD
- На странице тура (`tour.guide_id`) — карточка гида

## Total

8 гидов (на 2026-04).

## Related

- `tour.md` — туры гида
- `review.md` — отзывы (target_type='guide')
