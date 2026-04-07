---
title: Sitemap — STUB FOR SEO AGENT
type: stub
audience: seo-agent
owner: archimag (taskwriter)
last_updated: 2026-04-07
status: empty
priority: 5
estimated_time: 30 min
---

# 🟢 ЗАДАЧА ДЛЯ SEO АГЕНТА — sitemap.md

> Заглушка с заданием.

## Что нужно сделать

Описать как генерируется и обновляется sitemap.xml на `brobrogid.ru`.

## Источники

1. **Live sitemap:**
   ```bash
   curl -sk https://brobrogid.ru/sitemap-index.xml
   curl -sk https://brobrogid.ru/sitemap-0.xml | head -50
   ```

2. **`@astrojs/sitemap`** конфиг в новом сайте — `astro.config.mjs` (попроси brobrogid-site agent показать)

3. **Текущий статус:** 246 URL в sitemap-0.xml после Sprint 6

## Что должно быть в документе

```markdown
---
title: Sitemap — генерация и обновление
type: reference
audience: seo, brobrogid-site-agent
owner: <твой агент>
last_updated: 2026-04-07
---

# Sitemap

## TL;DR

Sitemap генерируется автоматически через `@astrojs/sitemap` integration в Astro при `npm run build`. Находится в `https://brobrogid.ru/sitemap-index.xml` (index) → `sitemap-0.xml` (single chunk, ~246 URL).

## Структура

- `sitemap-index.xml` — индексный файл со ссылками на под-sitemaps
- `sitemap-0.xml` — основной sitemap с URL страниц

Astro делит sitemap на чанки автоматически (50K URL на файл), сейчас у нас один файл.

## Что попадает в sitemap

- Все статические страницы (`/`, `/ossetia/`, хабы)
- Все динамические POI (через `getStaticPaths()`)
- Все туры
- Все гиды
- Все блог-посты
- Категории-индексы

## Что НЕ попадает

- Страницы с `noindex` мета-тегом
- preview / dev paths
- API endpoints (это другой домен)
- 404 страницы
- redirect targets (только цели, не legacy URL)

## Конфиг @astrojs/sitemap

В `astro.config.mjs` (из brobrogid-site репо):

\`\`\`js
import sitemap from '@astrojs/sitemap'

export default defineConfig({
  site: 'https://brobrogid.ru',
  integrations: [
    sitemap({
      // filter, customPages, etc.
    })
  ]
})
\`\`\`

(Попроси brobrogid-site agent подтвердить точный конфиг.)

## Lastmod / Priority / Changefreq

Какие значения проставляются и почему. Стандартный @astrojs/sitemap проставляет автоматически.

Если кастомные — описать.

## Когда обновляется

При каждом `npm run build` + deploy. То есть:
- Когда новый агент пересобирает сайт
- Автоматизации (cron auto-rebuild) сейчас НЕТ

## Связь с robots.txt

Sitemap URL указан в `robots.txt`:

\`\`\`
Sitemap: https://brobrogid.ru/sitemap-index.xml
\`\`\`

## Связь с Search Console

После открытия индексации (см. `launch_procedure.md`) sitemap нужно подать в:
- Google Search Console → Sitemaps → `sitemap-index.xml`
- Yandex Webmaster → Файлы Sitemap → то же

## Текущий статус

- 246 URL (после Sprint 6)
- Все русские slugs
- Под noindex (Google не будет crawl-ить, но файл доступен по URL)

## Open issues

Если есть — список.

## Related

- `robots_and_noindex.md`
- `launch_procedure.md`
- `url_structure.md`
```

## Правила

1. Curl реальный sitemap, посчитай URL — не "примерно 246", а точно
2. Если найдёшь lastmod или другие поля — задокументируй формат
3. ~500-1000 слов

## После

Стандартно.
