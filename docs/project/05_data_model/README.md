---
title: Data Model — section index
type: overview
audience: all-agents
owner: archimag
last_updated: 2026-04-07
stub: true
---

# 05_data_model — общая модель данных

Эта секция описывает **бизнес-смысл** сущностей проекта. Для **технической** схемы БД см. `../02_database/schema.md`.

## Зачем отдельно

`schema.md` отвечает на вопрос *"какие колонки у таблицы pois"*.

Эта секция отвечает на *"что значит POI в контексте проекта, как его выбрать из реальной жизни, что в description.short vs medium vs full, когда использовать has_menu, как category связана с subcategory"*.

## Файлы (все stubs)

- `types.md` — **stub** — TypeScript types overview. Где определены (`src/data/types/index.ts`), как используются в обоих сайтах.
- `poi.md` — **stub** — бизнес-модель POI. 10 категорий, subcategory, что куда класть, критерии качества данных.
- `tour.md` — **stub** — структура тура, связь с гидом, маршрут, статусы
- `guide.md` — **stub** — профиль гида, языки, специализации
- `review.md` — **stub** — полиморфные ссылки, AI vs real, критерии для JSON-LD
- `menu_item.md` — **stub** — связь с POI (has_menu), категории меню
- `emergency.md` — **stub** — 6 типов, hierarchical import, 24h флаг
- `transport.md` — **stub** — маршруты, stops, schedule
- `localized_text.md` — **stub** — `{ ru, en }` pattern — где используется, fallback правила
- `location.md` — **stub** — lat/lng/address, BBOX Vladikavkaz для location-aware routing

## Что должно быть в каждом файле

Template структура:

```markdown
# <Entity name>

## Что это

Бизнес-описание. Для чего существует.

## Структура данных

Ссылка на schema.md + key decisions.

## Бизнес-правила

- Какие значения валидны, какие нет
- Что означают поля в context домена
- Связи с другими сущностями

## Критерии качества

- Что должно быть заполнено для публикации
- Минимальный контент
- Что триггерит "publishable" флаг

## Гайдлайны для контент-писателей

- Как выбирать значения полей
- Примеры хороших и плохих записей

## Связи с UI

- Где сущность рендерится в brobrogid.ru и app.brobrogid.ru
- Какие компоненты её потребляют

## Related

- `../02_database/schema.md#<entity>` — техническая схема
- `../03_content_site/components.md` — UI компоненты
```

## Related

- `../02_database/schema.md` — полная SQL схема всех таблиц
- `src/data/types/index.ts` (в BROBROGID репо) — TypeScript определения
