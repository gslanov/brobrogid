---
title: brobrogid.ru — Data Flow
type: reference
audience: dev
owner: brobrogid-site-agent
last_updated: 2026-04-07
---

# Data Flow

## Что это

Как данные текут из Supabase в финальный HTML, который попадает на сервер. Понимание этого критично потому что **всё происходит на этапе `npm run build`**, не в браузере и не в момент запроса. После deploy nginx отдаёт статические HTML файлы — БД даже не трогается.

Исключение: одна страница (booking форма) делает client-side `fetch()` к PostgREST в момент submit. Это единственный runtime API call в проекте.

## High-level картина

```
┌────────────────────┐    build-time     ┌────────────┐    SSG     ┌──────────┐
│ Supabase           │  ◄──────────────  │ Astro      │  ──────►   │ dist/    │
│ (api.brobrogid.ru) │   HTTP / supabase │ getStatic  │  static    │ HTML+JSON│
│                    │   -js client      │ Paths()    │  files     │ -LD+CSS  │
└────────────────────┘                   └────────────┘            └──────────┘
                                                                         │
                                                                         │ rsync
                                                                         ▼
                                                                  ┌──────────────┐
                                                                  │ Selectel VPS │
                                                                  │ /var/www/    │
                                                                  │ brobrogid-   │
                                                                  │ site/        │
                                                                  └──────────────┘
                                                                         │
                                                                         │ nginx
                                                                         ▼
                                                                  ┌──────────────┐
                                                                  │  brobrogid.ru│
                                                                  │   browser    │
                                                                  └──────────────┘
```

## Ключевые модули

### `src/lib/supabase.ts`

Build-time Supabase client. Создаётся через `createClient(PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY)` с опцией `auth.persistSession: false` (нам не нужны сессии — мы только читаем).

**Header-комментарий гарантирует что файл НЕ попадает в browser bundle.** Используется только из:
- Frontmatter `.astro` файлов (`getStaticPaths`, `Astro.props` evaluation)
- `.ts` хелперов в `src/lib/queries/`

Никогда из `<script>` тегов или client-side islands.

```ts
// src/lib/supabase.ts
// BUILD-TIME ONLY. NEVER use service_role here. NEVER import this from a client island.
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.PUBLIC_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.PUBLIC_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: { persistSession: false, autoRefreshToken: false },
});
```

### `src/lib/queries/`

Файлы с типизированными query функциями. Каждый файл — одна сущность:
- `pois.ts` — `getAllPOIs()`, `getPOIBySlug()` (с slug_legacy fallback), `getPOIsByCategory()`, `getRelatedPOIs()`, `getTopRatedPOIs()`, `getVladikavkazPOIs()`
- `tours.ts` — `getAllTours()`, `getTourBySlug()`, `getToursByGuide()`, `getToursByCategory()`, `getToursByType()`, `getRelatedTours()`
- `guides.ts` — `getAllGuides()`, `getGuideBySlug()`, `getGuideById()`
- `reviews.ts` — **`getAllReviews()` cached singleton**, `getReviewsForTarget()`, `calculateAggregateRating()`
- `menu.ts` — `getMenuItemsForPOI()`

**Singleton cache** в `reviews.ts`:

```ts
let allReviewsCache: Review[] | null = null;
let inFlightPromise: Promise<Review[]> | null = null;

export async function getAllReviews(): Promise<Review[]> {
  if (allReviewsCache !== null) return allReviewsCache;
  if (inFlightPromise) return inFlightPromise;
  inFlightPromise = (async () => {
    const { data, error } = await supabase.from('reviews').select('*').order('date', { ascending: false });
    if (error) throw new Error(`Failed to load reviews: ${error.message}`)
    allReviewsCache = data ?? [];
    inFlightPromise = null;
    return allReviewsCache;
  })();
  return inFlightPromise;
}
```

Это **критично**: 252 страницы, у каждой может быть `<ReviewsWidget>`. Без cache получаем 252 запроса к Supabase, при флапающем self-hosted PostgREST билд падает. С cache — **один** запрос за весь build.

`getRelatedPOIs()` тоже выиграл бы от такого паттерна, но текущая реализация делает отдельный запрос с `eq('category', currentPoi.category)` — это компромисс между числом запросов и размером передаваемых данных.

### `src/utils/poi-url.ts`

Чистые функции (без БД), которые принимают POI и возвращают URL params:
- `mapPoiToMestaUrlParams(poi)` — `{ category, slug }` или `null`
- `isInVladikavkaz(poi)` — true если координаты в bbox
- `isPoiPublishable(poi)` — slug + photos + description.full.ru ≥ 80c + rating ≥ 4.0
- `isVladikavkazRestaurant(poi)`, `isVladikavkazHotel(poi)` — composite фильтры
- `poiMestaUrl(poi)` — full URL для использования в `href`

## Конкретный пример: POI detail page

Допустим Astro билдит `/ossetia/mesta/ushchelya/tseyskoe-uschele/`.

### Шаг 1 — `getStaticPaths()` строит список маршрутов

```ts
// src/pages/ossetia/mesta/[category]/[slug].astro
export async function getStaticPaths() {
  const pois = await getAllPOIs();      // 1 запрос → 119 POI
  const out = [];
  for (const p of pois) {
    if (!isPoiPublishable(p)) continue; // фильтр quality
    const m = mapPoiToMestaUrlParams(p);
    if (!m) continue;                    // skip food/accommodation/etc
    out.push({ params: { category: m.category, slug: m.slug }, props: { poi: p } });
  }
  return out;
}
```

Astro вызывает `getStaticPaths()` **один раз**. Получает массив `~30+` объектов вида `{ params, props }`.

### Шаг 2 — для каждого params Astro рендерит шаблон

```ts
const { poi } = Astro.props;
const region = getRegion('ossetia')!;
const nameRu = localize(poi.name, 'ru');

const related = (await getRelatedPOIs(poi, 12))
  .filter((p) => p.id !== poi.id)
  .filter((p) => isPoiPublishable(p) && mapPoiToMestaUrlParams(p) !== null)
  .slice(0, 4);

const breadcrumbs = [
  { label: 'Главная', href: '/' },
  { label: 'Северная Осетия', href: '/ossetia/' },
  { label: 'Места', href: '/ossetia/mesta/' },
  { label: CATEGORY_LABELS[m.category], href: `/ossetia/mesta/${m.category}/` },
  { label: nameRu },
];
```

`getRelatedPOIs()` делает запрос к Supabase для каждой страницы. Это `~30+` запросов на весь mesta tree. Filter `isPoiPublishable + mapPoiToMestaUrlParams != null` — Sprint 4 audit fix чтобы не рендерить ссылки на не-сгенерированные POI.

### Шаг 3 — POILayout инжектирует JSON-LD

```astro
<POILayout region={region} poi={poi} breadcrumbs={breadcrumbs} relatedPOIs={related} faqItems={[...]}>
  <p>{poi.description?.medium?.ru}</p>
  ...
</POILayout>
```

POILayout (`src/layouts/POILayout.astro`) внутри:
- Hero photo через `imageUrl(poi.photos[0])` — префикс `https://app.brobrogid.ru` если относительный путь
- Auto JSON-LD: `TouristAttraction` (или `Restaurant` если category=food) через `<TouristAttractionSchema>` компонент
- BreadcrumbList JSON-LD через `<Breadcrumbs>` компонент
- `<ReviewsWidget targetType="poi" targetId={poi.id}>` — внутри компонент дёргает `getReviewsForTarget('poi', poi.id)` → cached `getAllReviews()` (один раз для всего билда)
- FAQ через `<FAQ items={faqItems}>` → инжектит FAQPage JSON-LD

### Шаг 4 — Astro выдаёт HTML

В `dist/ossetia/mesta/ushchelya/tseyskoe-uschele/index.html` лежит финальный HTML с:
- Полным контентом
- Несколькими `<script type="application/ld+json">` блоками
- Hero фото с `fetchpriority="high"` и `width/height` (Sprint 4 audit fix)
- Reviews widget HTML (включая 6 видимых + остальные с `class="review-hidden"`)

### Шаг 5 — `npm run build` финализирует

После всех `getStaticPaths` Astro собирает:
- `dist/sitemap-0.xml` через `@astrojs/sitemap` — все страницы с lastmod/priority/changefreq
- `dist/robots.txt` через `src/pages/robots.txt.ts` endpoint — генерится из `SITE_UNDER_CONSTRUCTION` константы
- `dist/_astro/*.css` — Tailwind compiled (обычно один файл)

### Шаг 6 — `bash scripts/deploy.sh --confirm` rsync на сервер

Препflight checks:
1. `dist/` существует
2. SSH key permissions = 600
3. Remote directory `/var/www/brobrogid-site/` существует
4. Нет `.env*` файлов в `dist/`
5. **`SITE_UNDER_CONSTRUCTION` синхронизирован** с `dist/robots.txt` (Disallow если true) И с `dist/index.html` (noindex meta если true). Если рассинхрон — abort.

После всех проверок: `rsync -avz --delete dist/ root@87.228.33.68:/var/www/brobrogid-site/`.

## Картинки

Поле `photos[]` в БД хранит относительные пути типа `/images/pois/midagrabin-waterfalls_gp.jpg`. Реальные файлы лежат на `app.brobrogid.ru/images/pois/`.

`src/lib/imageUrl.ts`:
```ts
const BASE = import.meta.env.PUBLIC_IMAGE_BASE_URL ?? '';
export function imageUrl(path: string | null | undefined): string {
  if (!path) return '';
  if (path.startsWith('http')) return path;
  return `${BASE}${path}`;
}
```

`PUBLIC_IMAGE_BASE_URL=https://app.brobrogid.ru` в `.env`. Astro `astro.config.mjs` имеет `image.domains: ['app.brobrogid.ru']` чтобы Astro `<Image>` мог обрабатывать remote images.

В `<img>` тегах часто используется обычный `<img loading="lazy">` без оптимизации (proxy через app.brobrogid.ru). Hero на детальных страницах получает `fetchpriority="high"` и явные `width`/`height` для CLS = 0 (Sprint 4 audit fix).

## Booking form — единственное исключение из build-time

`src/components/content/BookingForm.astro` — vanilla JS forma с inline `<script>`. При submit делает:

```js
const res = await fetch(ENDPOINT, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    apikey: SUPABASE_ANON_KEY,
    Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
    Prefer: 'return=minimal',  // КРИТИЧНО: anon не имеет SELECT
  },
  body: JSON.stringify({...}),
});
```

`Prefer: return=minimal` — критично потому что anon role в RLS имеет только INSERT, без SELECT. Если бы по-умолчанию `return=representation` — PostgREST попробовал бы вернуть вставленную строку и получил 401.

См. [`../06_security/booking_form_defenses.md`](../06_security/booking_form_defenses.md) для полной защиты (honeypot, CHECK, rate limit, RLS).

## Reviews widget — single cached fetch

`<ReviewsWidget targetType="..." targetId="...">` на 252 страницах. Если бы каждая делала отдельный fetch — 252 HTTP roundtrips. Решение — singleton cache в `getAllReviews()` (см. выше).

При первой странице которая дёргает `getReviewsForTarget` — выполняется один SQL `SELECT * FROM reviews ORDER BY date DESC` (~50 KB JSON для 499 строк), кэшируется в module-level переменной. Все последующие 251 страниц фильтруют этот массив локально через `.filter(r => r.target_type === t && r.target_id === id)`.

## Reactivity?

**Нет.** Сайт перестраивается полностью на каждый deploy. Если новый POI добавлен в Supabase — пользователь его не увидит до следующего `npm run build` + rsync.

Это осознанное решение для контент-сайта где данные обновляются ~раз в день/неделю. Альтернативы (ISR, SSR с HTTP cache, periodic rebuilds через cron) — overhead который не оправдан текущим темпом изменений.

## Related

- [`routing.md`](routing.md) — какие именно `getStaticPaths` живут в каких файлах
- [`components.md`](components.md) — какие компоненты рендерятся
- [`seo.md`](seo.md) — что инжектится в head
- [`../02_database/schema.md`](../02_database/schema.md) — структура читаемых таблиц
- [`../06_security/booking_form_defenses.md`](../06_security/booking_form_defenses.md) — runtime fetch исключение
