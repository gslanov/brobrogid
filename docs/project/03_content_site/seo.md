---
title: brobrogid.ru — SEO Implementation
type: reference
audience: seo, dev
owner: brobrogid-site-agent
last_updated: 2026-04-07
---

# SEO Implementation

## Что это

Конкретная реализация SEO на `brobrogid.ru`: какие компоненты эмитят какие meta-теги, какие JSON-LD schemas используются для каких типов страниц, как работает sitemap, robots, canonical, hreflang. Стратегические решения (ключи, кластеры, antipattern контент) — в `../07_seo/`.

## Главные SEO-компоненты

| Компонент | Где | Что делает |
|---|---|---|
| `BaseLayout.astro` | `src/layouts/` | HTML skeleton, lang="ru", Google Fonts preconnect, default ogImage, forwards type/canonical/noindex props в SEO |
| `SEO.astro` | `src/components/seo/` | Все meta-теги: title, description, canonical, OG (8 тегов), Twitter Card, robots/googlebot/yandex (если noindex) |
| `JsonLd.astro` | `src/components/seo/` | Wrapper `<script type="application/ld+json" set:html={JSON.stringify(data)}>` |
| `Breadcrumbs.astro` | `src/components/` | Визуальные хлебные крошки + JSON-LD BreadcrumbList с current page как последний ListItem |

Каждый layout (POILayout, TourLayout, GuideLayout, BlogLayout, LandingLayout, CategoryLayout, RegionLayout) **обязан** дёрнуть BaseLayout с минимальным набором: title, description. И инжектировать **минимум одну тематическую schema**.

## JSON-LD schemas

В `src/components/seo/schemas/` лежат:

| Schema | Когда используется | Notes |
|---|---|---|
| `BreadcrumbList.astro` | Каждая страница (через `<Breadcrumbs>`) | Sprint 4 фикс: текущая страница включена как последний ListItem |
| `Article.astro` | Контентные landing pages (LandingLayout) | Sprint 1 |
| `BlogPosting.astro` | Блог-статьи (BlogLayout) | author = Organization "BROBROGID" (НЕ Person — Sprint 4 audit fix) |
| `FAQPage.astro` | Через `<FAQ items={...}>` если есть FAQ | Sprint 4 audit fix: добавлено в блог через `data.faqItems` frontmatter |
| `TouristAttraction.astro` | POILayout для mesta POI | Sprint 2. После Reviews Sprint принимает `aggregateRating` + `review[]` props |
| `Restaurant.astro` | POILayout если POI category=food | То же что TouristAttraction но `@type=Restaurant` (FoodEstablishment) |
| `LocalBusiness.astro` | Не подключён нигде | Создан как зарезервированный для будущей админки |
| `Person.astro` | GuideLayout для гидов | jobTitle="Tour Guide", worksFor=Organization |
| `TouristTrip.astro` | TourLayout для туров | itinerary из `tour.route[]`, offers если price>0 |
| `WebSite.astro` | `src/pages/index.astro` (главная) | Sprint 4 audit fix: даёт sitelinks в Google |
| `Organization.astro` | `src/pages/index.astro` | Sprint 4 audit fix: name, url, logo, contactPoint email |

## Meta tags

`SEO.astro` всегда эмитит:
- `<title>` — из props
- `<meta name="description">` — из props
- `<link rel="canonical">` — auto из `Astro.url.pathname` + `PUBLIC_SITE_URL`, или из `canonical` prop
- `<meta property="og:type">` — `website` (default) или `article` (для блога, Sprint 4 fix)
- `<meta property="og:site_name" content="Brobrogid">`
- `<meta property="og:locale" content="ru_RU">`
- `<meta property="og:title">`, `<meta property="og:description">`, `<meta property="og:url">`, `<meta property="og:image">`
- `<meta property="og:image:width" content="1200">`, `<meta property="og:image:height" content="630">`, `<meta property="og:image:alt">` (Sprint 4 audit fix)
- `<meta name="twitter:card" content="summary_large_image">`, twitter:title, twitter:description, twitter:image

Если `noindex={true}` (или `SITE_UNDER_CONSTRUCTION` глобально):
- `<meta name="robots" content="noindex, nofollow">`
- `<meta name="googlebot" content="noindex, nofollow">`
- `<meta name="yandex" content="noindex, nofollow">`

(Тройной защиты от индексации — defense-in-depth, см. `noindex` секцию ниже.)

## og:image — fallback и truncation

- **Дефолтный** `/og-default.jpg` (1200×630, 190 KB) — фото гор Кавказа из Unsplash. Лежит в `public/og-default.jpg`. Используется когда страница не указывает свой `ogImage`.
- **БлогLayout** теперь forwarding `ogImage={data.image}` (Sprint 4 fix — раньше блог-посты получали default).
- **TourLayout** обрезает `description` до **152 chars raw text** для meta description (HTML entity encoding инфлирует длину, нужен запас от 160 char Google SERP cutoff). Sprint 4 audit fix.
- **og:image:alt** — берётся из `imageAlt` prop, fallback на `title`.

## Sitemap

`@astrojs/sitemap` integration в `astro.config.mjs`:

```js
sitemap({
  filter: (page) => !page.includes('/preview-a/') && !page.includes('/preview-b/'),
  serialize(item) {
    item.lastmod = new Date().toISOString();
    if (item.url === 'https://brobrogid.ru/') item.priority = 1.0;
    else if (/\/(blog|tury-ekskursii|gidy)\//.test(item.url)) item.priority = 0.8;
    else item.priority = 0.6;
    item.changefreq = 'monthly';
    return item;
  },
}),
```

Output: `dist/sitemap-index.xml` + `dist/sitemap-0.xml`. Содержит **246 URL** (252 страницы build minus 6 preview/duplicates).

## robots.txt — dynamic endpoint

`src/pages/robots.txt.ts`:
```ts
import type { APIRoute } from 'astro';
import { SITE_UNDER_CONSTRUCTION } from '@/data/site';

export const GET: APIRoute = () => {
  const body = SITE_UNDER_CONSTRUCTION
    ? `User-agent: *\nDisallow: /\n`
    : `User-agent: *\nAllow: /\n\nSitemap: https://brobrogid.ru/sitemap-index.xml\n`;
  return new Response(body, {
    status: 200,
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
};
```

Это **гарантирует синхронизацию** robots.txt с константой `SITE_UNDER_CONSTRUCTION`. Раньше был статический файл — Sprint 4 audit нашёл что они могли расходиться. Теперь меняешь одну константу — после `npm run build` весь сайт согласован.

## Defense-in-depth noindex

Пока сайт не запущен, noindex стоит **в трёх местах одновременно**:

1. **Astro meta tags** — `BaseLayout` форсит `noindex = SITE_UNDER_CONSTRUCTION || pageNoindex`. SEO компонент эмитит 3 тега (`robots`, `googlebot`, `yandex`).
2. **nginx X-Robots-Tag header** — в `/etc/nginx/snippets/brobrogid-security-headers.conf` строка `add_header X-Robots-Tag "noindex, nofollow" always;`. Подключается в каждый location (потому что nginx не наследует add_header через location, см. `../08_infrastructure/nginx.md`).
3. **robots.txt** — `Disallow: /` через dynamic endpoint выше.

Чтобы открыть индексацию — нужно:
1. `src/data/site.ts`: `SITE_UNDER_CONSTRUCTION = false`
2. Удалить строку `add_header X-Robots-Tag` из nginx snippet + scp + nginx reload
3. `npm run build && bash scripts/deploy.sh --confirm`

`scripts/deploy.sh` имеет preflight который **abort'ит** деплой если есть рассинхрон между константой и `dist/robots.txt` или `dist/index.html`. Это защита от accidental partial release.

См. [`../07_seo/launch_procedure.md`](../07_seo/launch_procedure.md).

## hreflang

**Не реализован.** Сайт пока только на русском. Когда добавим EN-версию — добавим `<link rel="alternate" hreflang="ru" hreflang="en" hreflang="x-default">` в SEO компонент. Структура полей в БД (`name: { ru, en }`, `description: { full: { ru, en } }`) уже мультиязычная — данные есть.

## Cache headers (через nginx)

В каждом location nginx применяет:
- `/_astro/*` — `Cache-Control: max-age=31536000, public, immutable` (1 year, hashed bundles безопасны для permanent cache)
- Шрифты `(woff2|woff|ttf|eot)` — `1y immutable`
- Картинки/CSS/JS не в `/_astro/` — `30d immutable`
- HTML clean URLs (`/`) — `max-age=0, must-revalidate` (контент изменения должны пробрасываться сразу после deploy)
- `robots.txt`, `sitemap-*.xml` — `max-age=3600` (короткий кеш для обновлений после смены индексации)

## Внутренняя перелинковка

Стратегия: каждая страница ссылается на 3-5 связанных. Конкретные cross-sprint links добавляются по карте из брифа Sprint 3 секция 17 (Sprint 1 → Sprint 3 reverse links). Sprint 4 включил content-only edits в 12 страниц Sprint 1/2 для добавления ссылок на новые туры/маршруты/блюда.

Динамические `/mesta/[category]/[slug]/` имеют секцию "Похожие места" из БД через `getRelatedPOIs()`. Sprint 4 audit fix: фильтр сейчас включает `isPoiPublishable + mapPoiToMestaUrlParams != null`, чтобы не рендерить ссылки на не-сгенерированные страницы (раньше давало 11+ битых).

## Audit history

- **Trevozhniy + Dotoshniy review** (Sprint 4 финальный): 10 BLOCKERS + ~17 IMPORTANT — все закрыты. Подробности в `../06_security/audit_history.md` и `../03_content_site/sprints.md`.
- **Sample 30 страниц / 706 internal links / 0 broken** — после Sprint 4 фиксов.

## Related

- [`../07_seo/`](../07_seo/) — стратегические SEO документы (keyword research, sensitive topics, launch procedure)
- [`../07_seo/launch_procedure.md`](../07_seo/launch_procedure.md) — пошаговая процедура снятия noindex
- [`components.md`](components.md) — каталог SEO components
- [`data_flow.md`](data_flow.md) — где meta-теги эмитятся в build pipeline
- [`../08_infrastructure/nginx.md`](../08_infrastructure/nginx.md) — security headers и cache config
