---
title: Meta Strategy — STUB FOR SEO AGENT
type: stub
audience: seo-agent
owner: archimag (taskwriter)
last_updated: 2026-04-07
status: empty
priority: 3
estimated_time: 1-2 hours
---

# 🟡 ЗАДАЧА ДЛЯ SEO АГЕНТА — meta_strategy.md

> Это файл-заглушка с заданием. Прочитай, выполни, замени содержимое.

## Что нужно сделать

Документировать **полную мета-стратегию для всех типов страниц** на `brobrogid.ru`. Кто-то должен иметь возможность открыть этот файл и понять, как формируется title/description/OG для любой новой страницы которую он добавит.

## Источники данных

1. **Реальные мета-теги на проде:**
   ```bash
   curl -sk https://brobrogid.ru/ossetia/mesta/ushchelya/tseyskoe-uschele/ | grep -E '<title>|name="description"|property="og:|name="twitter:'
   ```
   Запусти на 5-7 разных типах страниц (главная, POI, тур, гид, блог-пост, lендинг, хаб).

2. **Astro компонент SEO** в новом сайте — `src/components/seo/SEO.astro` или похожий (попроси brobrogid-site agent показать). Там логика generation.

3. **`/home/cosmo/SOFT/COSMO/BROMARKET/SEO/SEO_AUDIT_brobrogid.md`** — у внешнего аудита были рекомендации по мета-тегам.

4. **`BRIEFING_sprint{1,2,3}.md`** — в брифингах были per-page title/description формулы.

## Структура документа

```markdown
---
title: Meta Strategy — title, description, OG, Twitter
type: reference
audience: seo, content, brobrogid-site-agent
owner: <твой агент>
last_updated: 2026-04-07
---

# Meta Strategy

## TL;DR

3-4 предложения: какие мета-теги используются, формула для title, ключевая идея.

## Title formulas

Для каждого типа страницы — формула с примером:

| Тип страницы | Формула | Пример | Длина |
|---|---|---|---|
| Главная | `{site_name} — {tagline}` | `BROBROGID — Гид по Северной Осетии` | 35-45 |
| Регион hub | `Гид по {region} — BROBROGID` | `Гид по Осетии — BROBROGID` | 30-40 |
| POI (природа) | `{poi.name.ru} — {category} в {region}` | `Цейское ущелье — Природа Северной Осетии` | 40-55 |
| POI (ресторан) | `{poi.name.ru} — Ресторан во Владикавказе` | `Man&Гал — Ресторан во Владикавказе` | 30-50 |
| Тур | `{tour.name.ru} — Тур по Осетии` | `Куртатинское ущелье: главные места — Тур по Осетии` | 40-60 |
| Гид | `{guide.name.ru} — Гид по Осетии` | `Алан Дзуцев — Гид по Осетии` | 30-40 |
| Landing page | `{primary_keyword} — Гид BROBROGID` | `Осетинские пироги — Гид BROBROGID` | 40-50 |
| Блог-пост | `{post.title} — Блог BROBROGID` | `Что привезти из Осетии — Блог BROBROGID` | 40-60 |

**Длина:** 30-60 символов оптимально (Google показывает ~50-60). Обрезается ~580 пикселей.

**Принципы:**
- Главное ключевое слово в начале
- Бренд BROBROGID в конце
- Никакого "click bait"
- Каждая страница имеет уникальный title

## Description formulas

Аналогично — таблица с формулами и примерами.

| Тип страницы | Формула | Пример |
|---|---|---|
| Главная | <формула> | <пример> |
| ... | ... | ... |

**Длина:** 140-160 символов (Google показывает ~150-160). Обрезается ~920 пикселей.

**Принципы:**
- Включает primary keyword + 1-2 secondary
- Описывает ценность для пользователя ("узнайте", "сравните", "посмотрите")
- Заканчивается логично, не обрезанной фразой
- Уникален для каждой страницы

## Open Graph

Какие OG теги ставятся:

- `og:title` — обычно совпадает с `<title>`
- `og:description` — совпадает с meta description
- `og:image` — что используется (одна на сайт vs per-page)
  - Для POI: hero фото POI
  - Для туров: фото маршрута
  - Для блога: featured image
  - Fallback: общий OG image сайта (`/og-default.jpg`)
- `og:url` — canonical URL
- `og:type` — `website` для главной, `article` для блога, `profile` для гида
- `og:locale` — `ru_RU`
- `og:site_name` — `BROBROGID`

## Twitter Card

- `twitter:card` — `summary_large_image` всегда
- `twitter:title`, `twitter:description`, `twitter:image` — копируют OG
- `twitter:site` — `@brobrogid` (если есть аккаунт, иначе пропустить)

## Canonical

Каждая страница имеет `<link rel="canonical" href="https://brobrogid.ru/...">`.

Особые случаи:
- 301-редиректы (legacy slugs) → canonical указывает на новый URL
- Pagination — canonical на первую страницу или self-canonical (зависит от стратегии)

## Reusable component

В Astro используется `<SEO>` компонент (или похожий). Опиши его API:

```astro
<SEO
  title="..."
  description="..."
  image="..."
  url="..."
  type="website"
/>
```

Где находится в коде, какие props принимает.

## Текущее состояние на проде

После curl'а реальных страниц — что фактически выдаётся. Если есть несоответствия с задуманной формулой — отметь как issues.

## Open issues

Список найденных проблем (если есть). Например:
- "На странице /ossetia/mesta/ushchelya/ нет уникального description, дублирует главную раздела"
- "OG image для блога не задан, используется fallback везде"

## Related

- Cross-references на keyword_research.md, json_ld_strategy.md, ../03_content_site/seo.md
```

## Конкретные правила

1. **Используй curl** чтобы посмотреть реальные мета-теги, не выдумывай
2. **Все числа символов** — реальные подсчёты, не "около 60"
3. **Каждый формула** — с примером из реального названия в БД
4. **Не предлагай менять формулы** без явной согласования — документируй существующие, выноси issues если есть
5. **1500-2000 слов** итог

## После завершения

1. Удали блок "ЗАДАЧА"
2. Замени frontmatter
3. Обнови TASKS.md и README.md
4. Сообщи archimag
