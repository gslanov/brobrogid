---
title: LocalizedText — двуязычный текст
type: reference
audience: archimag, dev, content
owner: archimag
last_updated: 2026-04-07
---

# LocalizedText

Базовый тип для двуязычного контента (ru/en).

## Тип

```ts
type LocalizedText = {
  ru: string
  en: string
}
```

## Использование

Применяется ко всем human-readable полям:
- `POI.name`, `POI.description.short`, `POI.description.full`
- `Tour.name`, `Tour.description`, `Tour.included[]`
- `Guide.name`, `Guide.bio`, `Guide.specialties[]`
- `MenuItem.name`, `MenuItem.description`
- `Review.text`
- `EmergencyContact.name`, `EmergencyContact.notes`

## БД

Хранится как `JSONB`:

```sql
name jsonb NOT NULL  -- {"ru": "Цейское ущелье", "en": "Tsey Gorge"}
```

PostgREST умеет фильтровать:
```
?name->>ru=ilike.*ущелье*
?name->ru=eq.Цей
```

## Helper

```ts
import { useLanguage } from '@/i18n'

function POITitle({ poi }: { poi: POI }) {
  const lang = useLanguage()  // 'ru' | 'en'
  return <h1>{poi.name[lang]}</h1>
}
```

Безопаснее через `localizedText()`:
```ts
function localizedText(
  text: LocalizedText | string | undefined,
  lang: 'ru' | 'en'
): string {
  if (!text) return ''
  if (typeof text === 'string') return text
  return text[lang] || text.ru || ''
}
```

Защищает от случаев когда `en` пустой → fallback на `ru`.

## Бизнес-правила

1. **`ru` обязателен**, `en` опционален (но желателен)
2. Длины: для `name` — до 200, для `description.short` — до 160, для `description.full` — без жёсткого лимита
3. **НЕ хранить HTML** — только plain text. Markdown допустим в `description.full`.
4. CHECK constraints (для `tour_bookings`) гарантируют отсутствие XSS-патернов

## Расширение на другие языки

Добавить язык — изменить тип:
```ts
type LocalizedText = {
  ru: string
  en: string
  os?: string  // осетинский
}
```

JSONB позволяет добавлять ключи без миграции таблиц. Но `useLanguage` и UI должны обработать новый язык.

## Related

- `../04_pwa_app/i18n.md` — UI i18n
- `types.md` — обзор всех типов
