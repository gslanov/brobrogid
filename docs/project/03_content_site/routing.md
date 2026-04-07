---
title: brobrogid.ru — Routing
type: reference
audience: dev
owner: brobrogid-site-agent
last_updated: 2026-04-07
---

# Routing

## Что это

URL-структура `brobrogid.ru` и механизмы Astro которые её создают. Сайт мульти-региональный (`/ossetia/...`, в будущем `/kbr/`, `/dagestan/` и т.д.), URL — статические `.astro` файлы и динамические `[slug].astro` через `getStaticPaths()`.

## Корневая структура

```
/                                    ← главная brobrogid.ru
/o-nas/                              ← О нас
/privacy/                            ← Политика конфиденциальности (ФЗ-152)
/404                                 ← brand-styled 404 (ловится через nginx error_page)
/preview-a/                          ← homepage variant (под noindex, исключён из sitemap)
/preview-b/                          ← homepage variant (под noindex, исключён из sitemap)
/robots.txt                          ← dynamic endpoint (из SITE_UNDER_CONSTRUCTION)
/sitemap-index.xml                   ← @astrojs/sitemap auto
/sitemap-0.xml                       ← 246 URL

/ossetia/                            ← главная региона
├── kak-dobratsya/
│   ├── (index)                      ← хаб транспорта
│   ├── iz-moskvy/
│   │   ├── (index)                  ← подхаб
│   │   ├── na-samolete/             ← Sprint 1 landing (kw 3079)
│   │   └── na-poezde/               ← Sprint 1 landing (kw 913)
│   └── aeroport-vladikavkaz/        ← Sprint 1 landing (kw 513)
├── vladikavkaz/
│   ├── (index)                      ← главный хаб города
│   ├── chto-posmotret/              ← Sprint 1 (kw 374)
│   ├── pogoda/                      ← Sprint 1 (kw 1185)
│   │   ├── na-nedelyu/
│   │   ├── na-10-dney/
│   │   ├── na-mesyats/
│   │   └── po-mesyatsam/
│   ├── teatry/, parki/, muzei/, hramy/, dostoprimechatelnosti/
│   ├── za-1-den/, za-3-dnya/
│   ├── istoriya-goroda/, rayony/
│   ├── oteli/
│   │   ├── (index)                  ← каталог
│   │   ├── [slug].astro             ← dynamic shell для thin POI
│   │   └── otel-imperial.astro      ← static shadowing для fully-written (Sprint 6 русский slug)
│   ├── restorany/, shopping/, nightlife/  ← аналогично
├── mesta/
│   ├── (index)                      ← каталог категорий
│   ├── ushchelya/, vodopady/, gory-i-vershiny/, goroda-sela/,
│   │   istoricheskie-mesta/, prirodnye/, gornolyzhnye-kurorty/  ← category indexes
│   └── [category]/[slug].astro      ← dynamic POI detail (single route)
│       │ generates ~30+ POI pages
│       │ переопределяется shadowing файлами для top POI
├── kuhnya/
│   ├── (index)                      ← хаб кухни
│   ├── osetinskie-pirogi/           ← Sprint 1 (kw 6958)
│   │   └── pirogovye-moskvy/        ← Sprint 1 funnel (kw ~15-20K)
│   ├── blyuda/{dzykka,fydzhyn,lyvzha,sladosti}
│   ├── napitki/{araka, index}
│   └── osetinskiy-syr/, restorany-osetinskoy-kuhni/
├── tury-ekskursii/
│   ├── (index)                      ← хаб туров
│   ├── iz-moskvy/, iz-sankt-peterburga/, odnodnevnye/, vyhodnogo-dnya/,
│   │   mnogodnevnye/, avtorskie/, gruppovye/, individualnye/, dzhip-tury/,
│   │   peshehodnye/                 ← 11 категорий-фильтров (статические)
│   ├── [slug].astro                 ← dynamic shell для всех 20 туров
│   └── kurtatinsky-gorge-...astro   ← static shadowing для fully-written
├── gidy/
│   ├── (index)                      ← каталог
│   ├── [slug].astro                 ← dynamic shell
│   └── alan-dzutsev.astro, ...      ← 8 fully-written guide pages
├── marshruty/
│   ├── (index)
│   ├── avto/{osetia-za-1-den,osetia-za-3-dnya,...}
│   ├── peshie-treki/, dzhip-marshruty/
│   └── tematicheskie/{istoricheskiy,gastronomicheskiy,prirodnyy}
├── pogoda-i-sezony/
│   ├── (index)
│   ├── kogda-luchshe-ehat/, zimoy/, letom/, osenyu/, vesnoy/, klimat/, chto-vzyat-s-soboy/
│   └── po-mesyatsam/
│       ├── (index)
│       └── yanvar/, fevral/, ..., dekabr/  ← 12 monthly pages
├── otdykh-i-prozhivanie/
│   ├── (index)
│   ├── oteli/
│   │   ├── (index)                  ← хаб локаций (Sprint 4 audit fix)
│   │   ├── vladikavkaz/             ← canonical-redirect stub → /vladikavkaz/oteli/
│   │   ├── fiagdon/, tsey/, karmadon/
│   ├── bazy-otdykha/, glempingi/, sanatorii/, gostevye-doma/
├── ob-osetii/
│   ├── (index)
│   ├── geografiya/, goroda-i-rayony/
│   ├── istoriya/{index, drevnyaya-alaniya, srednie-veka, sovremennost}
│   ├── kultura-i-tradicii/, yazyk-osetinskiy/, narod-osetiny/, simvolika/
├── blog/
│   ├── (index)                      ← листинг с pagination (готов, не задействован)
│   └── [...slug].astro              ← dynamic из content collection (15 MDX)
├── karta/                           ← статика, Yandex Maps embed + POI list
└── pogoda/, etc.
```

## Static vs dynamic routing

Astro генерирует HTML двумя способами:

### 1. Static `.astro` файлы

Каждый файл в `src/pages/` без квадратных скобок становится одним маршрутом. Имя файла = последний segment URL. `index.astro` = корень директории.

Используется для:
- **Контентных landing pages** (Sprint 1, маршруты, кухня, справочник, блог-статьи через MDX)
- **Хабов и каталогов** (`/ossetia/index.astro`, `/vladikavkaz/index.astro`)
- **Категорий-фильтров туров** (`tury-ekskursii/iz-moskvy.astro`)
- **Static shadowing для fully-written POI** — перекрывает динамический `[slug].astro` с тем же именем (см. ниже)

### 2. Dynamic `[slug].astro` через `getStaticPaths()`

Файлы вида `[slug].astro` или `[category]/[slug].astro` определяют **шаблон**. `getStaticPaths()` экспорт говорит Astro какие конкретные значения генерировать.

```typescript
// src/pages/ossetia/mesta/[category]/[slug].astro
export async function getStaticPaths() {
  const pois = await getAllPOIs();  // ОДИН Supabase query
  const out = [];
  for (const p of pois) {
    if (!isPoiPublishable(p)) continue;
    const m = mapPoiToMestaUrlParams(p);
    if (!m) continue;
    out.push({ params: { category: m.category, slug: m.slug }, props: { poi: p } });
  }
  return out;
}
```

Это создаёт URL вида `/ossetia/mesta/ushchelya/tseyskoe-uschele/`, `/mesta/vodopady/midagrabinskie-vodopady/` и т.д. Категория определяется через `mapPoiToMestaUrlParams` (NAME-pattern + subcategory + location BBOX, см. `src/utils/poi-url.ts`).

Используется для:
- **POI** — `/mesta/[category]/[slug]/`
- **Туры** — `/tury-ekskursii/[slug]/`
- **Гиды** — `/gidy/[slug]/`
- **Vladikavkaz oteli/restorany/shopping/nightlife** — `/vladikavkaz/{type}/[slug]/`
- **Блог** — `/blog/[...slug]/` через `getCollection('blog')`

## Static shadowing pattern

Если в той же папке что и `[slug].astro` есть статический файл, например `tseyskoe-uschele.astro` — он **перекрывает** dynamic для этого slug. Astro использует static, не вызывает dynamic.

Это даёт паттерн **fully-written + thin shells**:
- Динамический `[slug].astro` рендерит ВСЕ publishable POI с базовым контентом из БД (краткое description, фото, карта, FAQ generic).
- Для **топ POI** мы создаём отдельный `<slug>.astro` файл с длинным человеческим контентом (1500-2500 слов): подробные секции "История", "Как добраться", "Когда лучше посетить", "Что взять с собой", "Гид".
- Все остальные POI рендерятся как thin shells через dynamic.

После Sprint 6 (EN→RU slug migration) все shadowing файлы переименованы под новые русские slugs:
- `tsey-gorge.astro` → `tseyskoe-uschele.astro`
- `dargavs--city-of-the-dead.astro` → `dargavs-gorod-myortvyh.astro`
- `imperial-hotel.astro` → `otel-imperial.astro`
- ... (41 файл всего)

В каждом обновлён `getPOIBySlug('new-slug')`. Plus защита: `getPOIBySlug` теперь делает fallback lookup по `slug_legacy` в БД (см. `src/lib/queries/pois.ts`), так что если hand-written файл разойдётся с БД — POI всё равно найдётся.

## Multi-region архитектура

URL префиксированы регионом с первого дня (`/ossetia/...`). Это сделано **папками статически**, не через `[region]` параметр. Причина — IDE-friendly навигация, явные пути в коде, простота debug.

Когда добавится КБР — создаётся `src/pages/kbr/...` папка. Регионы определены в `src/data/regions.ts`:

```typescript
export const REGIONS: Region[] = [
  { slug: 'ossetia', name: { ru: 'Северная Осетия', en: 'North Ossetia' }, emoji: '🏔️', hubUrl: '/ossetia/' },
];
export const FUTURE_REGIONS = ['kbr', 'dagestan', 'chechnya', 'ingushetia', 'kchr'] as const;
```

Layouts и SEO компоненты читают `region` из props, breadcrumbs строятся из `region.name.ru`.

## Slug → URL mapping для POI

Для POI используется `mapPoiToMestaUrlParams()` (`src/utils/poi-url.ts`) — критическая функция:

```
POI → category (URL prefix) → slug
```

Логика категории:
1. **NAME-pattern matching** (наиболее специфично) — regex по `name.ru`: `ущель`, `водопад`, `ледник`, `крепост`, `монастыр`, `термал`, `село`, и т.д.
2. **Subcategory exact match** — английские БД значения (`village`, `springs`, `history`, `religion`, `memorial`, `monument`, `viewpoint`, `city`)
3. **`category` enum fallback** — `nature` → `prirodnye`, `culture` → `istoricheskie-mesta`, `activities` → `gornolyzhnye-kurorty`, `attractions` → `istoricheskie-mesta`
4. **`null`** для food/accommodation/shopping/nightlife/practical (они идут в Vladikavkaz tree через отдельные filters `isVladikavkazRestaurant`, `isVladikavkazHotel`)

Location BBOX для Vladikavkaz: `lat 42.95-43.10, lng 44.55-44.75`. POI внутри bbox с `category=food` отсекаются от `/mesta/` и попадают в `/vladikavkaz/restorany/`.

## Связанные понятия

- `getStaticPaths()` для туров фильтрует через `isTourPublishable()` (slug + price>0 + description.ru ≥ 100c)
- `getStaticPaths()` для гидов через `isGuidePublishable()` (slug + photo + bio.ru ≥ 100c)
- Dynamic POI [slug].astro поддерживает Sprint 4 фикс: related POIs filter использует `isPoiPublishable + mapPoiToMestaUrlParams != null` (раньше пропускал — давал битые ссылки)

## Related

- [`data_flow.md`](data_flow.md) — что происходит внутри `getStaticPaths()` (cached fetch, filter, map)
- [`components.md`](components.md) — какой layout рендерит каждый page type
- [`sprints.md`](sprints.md) — когда какие routes были добавлены
- [`../02_database/schema.md`](../02_database/schema.md) — поля POI/tour/guide
