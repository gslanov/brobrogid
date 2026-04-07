---
title: JSON-LD Strategy — STUB FOR SEO AGENT
type: stub
audience: seo-agent
owner: archimag (taskwriter)
last_updated: 2026-04-07
status: empty
priority: 4
estimated_time: 2-3 hours
---

# 🟡 ЗАДАЧА ДЛЯ SEO АГЕНТА — json_ld_strategy.md

> Это файл-заглушка с заданием.

## Что нужно сделать

Документировать **JSON-LD structured data стратегию**: какие schema.org типы используются на каких страницах, какие поля заполняются, как обрабатываются edge cases (AI-отзывы, missing data, AggregateRating с 0 реальных).

## Источники данных

1. **Реальные JSON-LD на проде:**
   ```bash
   curl -sk https://brobrogid.ru/ossetia/mesta/ushchelya/tseyskoe-uschele/ | \
     python3 -c "import sys, re; html=sys.stdin.read(); print(*re.findall(r'<script type=\"application/ld\\+json\">(.*?)</script>', html, re.S), sep='\n---\n')"
   ```
   Прогони на 5-7 разных типах страниц.

2. **`BRIEFING_sprint3.md`** — там есть templates для TouristTrip, Person, BlogPosting

3. **`BRIEFING_reviews_widget.md`** — там логика AggregateRating filtering

4. **Google Rich Results Test** для валидации:
   `https://search.google.com/test/rich-results?url=https://brobrogid.ru/...` (но сайт под noindex, может не работать)

## Структура документа

```markdown
---
title: JSON-LD Strategy
type: reference
audience: seo, brobrogid-site-agent
owner: <твой агент>
last_updated: 2026-04-07
---

# JSON-LD Structured Data Strategy

## Принципы

3-5 принципов:
- Никогда не врать (AI отзывы не помечаем как Review)
- Минимизировать риск manual action санкций Google
- Использовать widely supported schema.org types
- Валидировать через Google Rich Results Test
- Не дублировать данные (один JSON-LD на сущность, не несколько копий)

## Типы по типам страниц

| Тип страницы | Schema.org типы | Примечания |
|---|---|---|
| Главная (/) | WebSite + Organization | + SearchAction внутри WebSite |
| Регион (/ossetia/) | TouristDestination + BreadcrumbList | — |
| POI природа | TouristAttraction + BreadcrumbList | + AggregateRating если есть real reviews |
| POI ресторан (food) | FoodEstablishment + BreadcrumbList | + Menu если has_menu, + AggregateRating |
| POI отель (accommodation) | LodgingBusiness + BreadcrumbList | + AggregateRating |
| Тур | TouristTrip + Offer + BreadcrumbList | + Person (provider) для guide |
| Гид | Person + BreadcrumbList | + worksFor (Organization) + AggregateRating |
| Маршрут | TouristTrip + ItemList (places) | — |
| Блог-пост | BlogPosting (или Article) + BreadcrumbList | + Person/Organization (author) |
| Категория-индекс | CollectionPage + ItemList + BreadcrumbList | — |
| FAQ блок (на любой странице) | FAQPage | inlined в страницу |
| Кухня (хаб) | WebPage + ItemList | — |

## Конкретные примеры

Для каждого важного типа — реальный JSON из текущего сайта (через curl) с комментариями:

### TouristAttraction (POI природа)

\`\`\`json
{
  "@context": "https://schema.org",
  "@type": "TouristAttraction",
  "name": "Цейское ущелье",
  ...
}
\`\`\`

Объяснение: какие поля обязательные, какие optional, откуда берутся данные (Supabase column).

### FoodEstablishment

То же.

### TouristTrip

То же. Особое внимание на `route` (массив координат, может быть NULL — `(tour.route ?? [])`), `offers` (только если status=recruiting и price > 0), `provider` (Person если есть guide_id).

### Person (Guide)

То же.

### BlogPosting

То же.

### BreadcrumbList

Универсальный — на любой странице.

## Обработка AI-генерированных отзывов

**КРИТИЧЕСКОЕ ПРАВИЛО:** отзывы с `is_generated=true` НЕ ИДУТ в JSON-LD AggregateRating и review[].

Google в обновлениях 2024 года ввёл санкции за fake reviews. Манипуляция Rich Results через AI отзывы — manual action risk.

Логика:
1. `getAllReviews()` → возвращает все отзывы из БД
2. Для UI — показываются все, с бейджем "AI"
3. Для JSON-LD — фильтр `reviews.filter(r => !r.is_generated)`
4. Если real reviews count > 0 — emit AggregateRating + первые N отзывов
5. Если 0 — НЕ emit-ить AggregateRating вообще (ничего не лучше чем фейк)

Сейчас: все 499 отзывов с `is_generated=true` → AggregateRating нигде не появляется (что корректно).

## Обработка missing data

Принципы для null/undefined полей:
- Не emit-ить поле вообще (НЕ ставить `null` или пустую строку)
- Использовать `undefined` filter или conditional spread
- Проверять обязательные поля перед emit-ом всего блока
- Optional chaining: `poi.description?.short?.ru ?? ''`

## Worst-case scenarios

Что если:
- POI без `photos` — `image` поле не emit (или fallback на /og-default.jpg)
- POI без `description.full.ru` — используй `description.medium.ru` или `description.short.ru`
- Tour без `guide_id` — `provider` не emit
- Tour без `route` — `itinerary` не emit (используй `safeRoute = (tour.route ?? [])`)
- Guide без `bio.ru` — НЕ публиковать страницу (filter в `getStaticPaths()`)
- Review с `rating: 0` — фильтровать (rating должен быть 1-5 для AggregateRating)

## Валидация

Как валидировать перед deploy:

1. Google Rich Results Test (когда индексация откроется)
2. Schema Markup Validator: `https://validator.schema.org/`
3. Manual JSON.parse в console — должно быть валидно
4. Curl страницу + grep `application/ld+json` — должны быть все ожидаемые блоки

## Текущее состояние на проде (curl audit)

Что фактически отдаётся сейчас. Список Schema.org типов которые встречаются на текущих 246 URL.

Пример (реальный, из curl):
- `Article`
- `BreadcrumbList`
- `FAQPage`
- `Organization`
- `WebPage`
- `TouristAttraction`
- `Person`
- `PostalAddress`
- `GeoCoordinates`
- ...

Что НЕ встречается, но должно бы:
- `AggregateRating` — потому что нет real reviews (корректно)
- ...

## Open issues

- Если AggregateRating не появляется на ни одной странице — это normal сейчас, но при первых real reviews его нужно начать emit-ить
- ...

## Related

- Cross-references на meta_strategy.md, ../03_content_site/seo.md, ../06_security/content_security.md
```

## Правила

1. **Реальные curl** — всегда смотри что в HTML, не угадывай
2. **Минимум 5 типов страниц** — главная, POI, тур, гид, блог
3. **Reference на schema.org docs** где уместно
4. **Проверка валидности** через Rich Results Test когда будет возможно
5. **2000-3000 слов** итог — это центральный документ для SEO

## После завершения

Стандартно: удали "ЗАДАЧА", обнови frontmatter, обнови TASKS.md, README.md, сообщи archimag.
