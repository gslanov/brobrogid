---
title: SEO в app.brobrogid.ru — meta, JSON-LD
type: reference
audience: archimag, dev, seo
owner: archimag
last_updated: 2026-04-07
---

# SEO техническая реализация

⚠️ Сайт под `noindex` (4-layer защита). Эта документация — про техническую инфраструктуру SEO которая активируется после launch. См. `../07_seo/launch_procedure.md`.

## Stack

- `react-helmet-async` — управление `<head>`
- Custom `<SEO>` компонент — meta + OG + Twitter + canonical + hreflang
- Custom `<JsonLd>` компонент — structured data
- Prerender (`scripts/prerender.ts`) — встраивает HTML на сервер

## SEO компонент

`src/shared/ui/SEO.tsx`:

```tsx
interface SEOProps {
  title: string
  description: string
  image?: string
  url?: string
  type?: 'website' | 'article' | 'place'
  noindex?: boolean
}
```

Рендерит через `<Helmet>`:
- `<title>`
- `<meta name="description">`
- OG: `og:title/description/image/url/type/locale`
- Twitter: `twitter:card="summary_large_image"` + поля
- `<link rel="canonical" href={url}>`
- `<link rel="alternate" hreflang="ru/en">`
- При `noindex={true}` → `<meta name="robots" content="noindex,nofollow">`

## JsonLd компонент

```tsx
<JsonLd data={{
  '@context': 'https://schema.org',
  '@type': 'TouristAttraction',
  name: poi.name.ru,
  ...
}} />
```

Один скрипт `application/ld+json` через Helmet. Multiple `<JsonLd>` дают multiple scripts.

## Per-page стратегия

| Page | type | JSON-LD |
|---|---|---|
| Home | website | WebSite + Organization + SearchAction |
| POI nature/culture | place | TouristAttraction |
| POI food | place | FoodEstablishment |
| Tour detail | article | TouristTrip + Offer |
| Guide detail | article | Person (jobTitle: Tour Guide) |
| Menu | place | FoodEstablishment + hasMenu |
| Tours list | website | ItemList |
| Map/Search/Emergency | website | — |
| Subscription | website | noindex: true |

## noindex switch

Сейчас глобально:
```tsx
// в SEO компоненте
const SITE_UNDER_CONSTRUCTION = true
const finalNoindex = noindex || SITE_UNDER_CONSTRUCTION
```

Снимается во время launch (см. `../07_seo/launch_procedure.md`). Это **третий** layer защиты (после nginx header + robots.txt).

## hreflang

Для каждой страницы:
```html
<link rel="alternate" hreflang="ru" href="https://app.brobrogid.ru/poi/slug">
<link rel="alternate" hreflang="en" href="https://app.brobrogid.ru/en/poi/slug">
<link rel="alternate" hreflang="x-default" href="https://app.brobrogid.ru/poi/slug">
```

⚠️ EN URL пока не существуют (нет `/en/*` маршрутов). hreflang зарезервирован на будущее.

## sitemap.xml

Генерируется `scripts/generate-sitemap.ts` после prerender. ~145 URL с priorities. См. `prerender.md`.

## robots.txt

`public/robots.txt`:
```
User-agent: *
Disallow: /

Sitemap: https://app.brobrogid.ru/sitemap.xml
```

⚠️ Сейчас `Disallow: /` глобально — снимется при launch.

## Open Graph image

Дефолтный `/og-default.jpg` — 1200×630 с логотипом BROBROGID. Per-page:
- POI → `poi.photos[0]` если есть, иначе default
- Tour → `tour.cover` если есть
- Guide → `guide.avatar` если есть

## Verify (после launch)

```bash
curl https://app.brobrogid.ru/poi/visadon-cyf | grep -oP '<meta[^>]+>' | head
curl https://app.brobrogid.ru/poi/visadon-cyf | grep -oP 'application/ld\+json[^<]+' | head
```

Google Rich Results Test: https://search.google.com/test/rich-results

## Related

- `prerender.md` — как HTML попадает на сервер
- `../07_seo/launch_procedure.md` — runbook опубликации
- `../07_seo/json_ld_strategy.md` — стратегия structured data (заполняется SEO агентом)
- `../07_seo/meta_strategy.md` — meta-tags стратегия
