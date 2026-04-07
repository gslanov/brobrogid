---
title: brobrogid.ru — Components Catalog
type: reference
audience: dev
owner: brobrogid-site-agent
last_updated: 2026-04-07
---

# Components Catalog

## Что это

Каталог всех `.astro` компонентов и layouts с назначением. Цель — чтобы новый агент мог быстро найти нужный component по задаче, не grep'ая весь репо.

## Layouts (`src/layouts/`)

Layouts — top-level wrapper'ы которые обёртывают всю страницу. Каждый extends `BaseLayout` через композицию.

| Layout | Зачем | Где используется |
|---|---|---|
| `BaseLayout.astro` | HTML skeleton: `<html lang="ru">`, `<head>`, viewport, favicon, Google Fonts preconnect/preload (Inter+Manrope), GSC/Yandex verification placeholders. Принимает: `title`, `description`, `canonical?`, `ogImage?`, `ogImageAlt?`, `noindex?`, `preloadFont?`, `heroImage?`, `type?`. Форсит `noindex = SITE_UNDER_CONSTRUCTION || pageNoindex`. | Все остальные layouts через композицию |
| `RegionLayout.astro` | extends BaseLayout. Добавляет Header/Nav/Breadcrumbs/Footer. Принимает `region: Region` + все props BaseLayout. | LandingLayout, POILayout, TourLayout, GuideLayout |
| `LandingLayout.astro` | Для контентных landing pages (Sprint 1, маршруты, кухня, справочник, статичные категории туров). Принимает: title/description/keyword/breadcrumbs/heroImage/heroImageAlt/publishedAt/updatedAt/faqItems[]/ctaItems[]/preloadFont. Slot для основного контента в `prose` контейнере. Auto-injects Article JSON-LD. | Большинство контентных страниц |
| `CategoryLayout.astro` | Для индексов категорий (`/mesta/ushchelya/`). Принимает: region/title/description/breadcrumbs/intro/pois[]/faqItems. Hero (короче чем landing), intro paragraph, сетка POICard, FAQ, footer-CTA. BreadcrumbList JSON-LD. | 8 mesta index страниц |
| `POILayout.astro` | Полная детальная страница POI. Hero photo (с `fetchpriority="high"`+`width/height` Sprint 4 fix), H1+RatingBadge, Lead, meta-strip (адрес/телефон/часы), default slot для основного контента, PhotoGallery, **ReviewsWidget**, RelatedPOIs, FAQ, footer CTA. Auto JSON-LD: TouristAttraction (или Restaurant если food) + AggregateRating от ReviewsWidget + BreadcrumbList. | `/mesta/[category]/[slug]/`, `/vladikavkaz/{oteli,restorany,shopping,nightlife}/[slug]/` |
| `TourLayout.astro` | Полная детальная страница тура. Hero, H1+RatingBadge, meta-strip (цена/длительность/тип/группа), Lead, default slot, GuideCard (если гид), RouteMap, **BookingForm + BookingButton (WhatsApp fallback)**, FAQ, RelatedTours, footer CTA. Auto JSON-LD: TouristTrip + Offer (если price>0) + AggregateRating если есть real reviews. | `/tury-ekskursii/[slug]/` + 13 fully-written shadowing |
| `GuideLayout.astro` | Полная страница гида. Photo, name, rating, languages, specializations, bio, **ReviewsWidget** для отзывов о гиде, "Туры этого гида" сетка, BookingButton, FAQ. Auto JSON-LD: Person + worksFor=Organization + AggregateRating. | `/gidy/[slug]/` + 8 fully-written shadowing |
| `BlogLayout.astro` | Блог-статья из MDX. extends BaseLayout (НЕ RegionLayout — блог region-agnostic). Принимает `post: CollectionEntry<'blog'>` + breadcrumbs. Hero image (с `fetchpriority="high"` 1200×630, Sprint 4), title, date+author, prose контент через `<Content />`, FAQ из `data.faqItems`, **Related posts** (Sprint 4 fix), footer CTA. Auto JSON-LD: BlogPosting (author Organization, dateModified из frontmatter). | `/blog/[...slug]/` |

## SEO components (`src/components/seo/`)

| Файл | Что |
|---|---|
| `SEO.astro` | Главный мета-эмиттер (title/desc/canonical/OG/Twitter/noindex). См. [`seo.md`](seo.md) для полного списка тегов. |
| `JsonLd.astro` | Wrapper `<script type="application/ld+json" set:html={JSON.stringify(data)}>` |
| `schemas/Article.astro` | Article schema для landing pages |
| `schemas/BlogPosting.astro` | BlogPosting (author Organization, publisher, dateModified) |
| `schemas/BreadcrumbList.astro` | BreadcrumbList с itemListElement |
| `schemas/FAQPage.astro` | FAQPage с mainEntity |
| `schemas/TouristAttraction.astro` | TouristAttraction (geo, address, image) — принимает aggregateRating + review[] для Reviews Sprint |
| `schemas/Restaurant.astro` | Restaurant/FoodEstablishment — то же что TouristAttraction но другой @type |
| `schemas/TouristTrip.astro` | TouristTrip с itinerary, offers, provider |
| `schemas/Person.astro` | Person с jobTitle, worksFor, knowsLanguage |
| `schemas/LocalBusiness.astro` | Зарезервирован, не подключён нигде |
| `schemas/WebSite.astro` | Главная brobrogid.ru — даёт sitelinks в Google |
| `schemas/Organization.astro` | Главная — name, url, logo, contactPoint |

## Content components (`src/components/content/`)

Reusable building blocks для страниц:

| Файл | Что |
|---|---|
| `POICard.astro` | Карточка POI (compact/default/featured variants). URL через `poiMestaUrl(poi)` или `href` prop. Используется в RelatedPOIs, mesta indexes, главной vladikavkaz |
| `TourCard.astro` | Карточка тура — название, фото, цена, длительность, ссылка |
| `GuideCard.astro` | Карточка гида — фото, имя, рейтинг, языки, специализации |
| `BlogCard.astro` | Карточка блог-поста для index |
| `RelatedPOIs.astro` | Сетка POI карточек "Похожие места". Sprint 4 fix: фильтрует через `isPoiPublishable + mapPoiToMestaUrlParams != null` |
| `RelatedTours.astro` | Сетка туров |
| `RatingBadge.astro` | Компактный бейдж "★ 4.9 (133)". Если rating null — не рендерит. |
| `Hours.astro` | Таблица часов работы из `poi.hours` |
| `PhotoGallery.astro` | Сетка фото с lazy loading |
| `FAQ.astro` | Семантичный `<details>` список + auto FAQPage JSON-LD |
| `RouteMap.astro` | Статическая карта маршрута тура: список точек + ссылка "Открыть на Яндекс.Картах" |
| `BookingForm.astro` | Vanilla JS форма бронирования. Direct fetch к PostgREST с `Prefer: return=minimal`. Honeypot, валидация, error handling. См. [`../06_security/booking_form_defenses.md`](../06_security/booking_form_defenses.md) |
| `BookingButton.astro` | WhatsApp wa.me deep link с pre-filled message. Production phone `+79099377297`. |
| `CTA.astro` | Кнопка-ссылка (primary/secondary/ghost) |
| `CTAGroup.astro` | Массив CTA |

## Reviews components (`src/components/reviews/`)

Sprint Reviews Widget:

| Файл | Что |
|---|---|
| `ReviewsWidget.astro` | Wrapper. Принимает `targetType: 'poi'\|'tour'\|'guide'`, `targetId: string`. Дёргает `getReviewsForTarget()` (cached). Рендерит header с aggregate, grid из всех отзывов (первые 6 видимы, остальные `display:none`), кнопка "Показать все". Inline `<script>` для toggle |
| `ReviewCard.astro` | Одна карточка: avatar (img или initials), имя+AI badge, дата, звёзды, текст с "Читать дальше" toggle. **`{review.text}` escaped**, не `set:html` |
| `StarRating.astro` | 5 unicode звёзд с half-star support |
| `helpers.ts` | `formatRelativeDate` (Intl.RelativeTimeFormat ru), `getInitialAvatar`, `isAllowedAvatarUrl` (domain whitelist), `pluralize`, `truncateText` |

## Layout components (`src/components/layout/`)

| Файл | Что |
|---|---|
| `Header.astro` | Главное меню сайта |
| `Footer.astro` | Подвал с навигационными ссылками + email `hello@brobrogid.ru` + ссылки на /o-nas/ /privacy/ |
| `Nav.astro` | Inline navigation component (используется в Header) |

## Top-level components

| Файл | Что |
|---|---|
| `Breadcrumbs.astro` | Визуальные хлебные крошки + JSON-LD BreadcrumbList. Sprint 2 fix: текущая страница включена как последний ListItem. Принимает `items: { label, href? }[]` |
| `Pagination.astro` | Готовая компонента, не используется (15 блог-постов помещаются на одной странице) |

## Lib (`src/lib/`)

Не компоненты, но важно знать:

| Файл | Что |
|---|---|
| `supabase.ts` | Build-time client (BUILD-TIME ONLY warning в header) |
| `i18n.ts` | `localize(text, 'ru')` — извлекает локализованную строку из `{ ru, en }` JSONB |
| `imageUrl.ts` | `imageUrl(path)` — префиксит относительные пути `https://app.brobrogid.ru` |
| `types.ts` | TypeScript типы: POI, Tour, Guide, Review, MenuItem, LocalizedText, Region |
| `queries/pois.ts` | getAllPOIs, getPOIBySlug (с slug_legacy fallback Sprint 6), getPOIsByCategory, getRelatedPOIs, getTopRatedPOIs, getVladikavkazPOIs |
| `queries/tours.ts` | getAllTours, getTourBySlug, getToursByGuide, getRelatedTours, etc. |
| `queries/guides.ts` | getAllGuides, getGuideBySlug, getGuideById |
| `queries/reviews.ts` | **`getAllReviews()` cached singleton**, getReviewsForTarget, calculateAggregateRating |
| `queries/menu.ts` | getMenuItemsForPOI |

## Utils (`src/utils/`)

Чистые функции (без БД):

| Файл | Что |
|---|---|
| `poi-url.ts` | `mapPoiToMestaUrlParams`, `isInVladikavkaz`, `isPoiPublishable`, `isVladikavkazRestaurant`, `isVladikavkazHotel`, `poiMestaUrl` |
| `tour-publishable.ts` | `isTourPublishable`, `getSafeRoute` |
| `guide-publishable.ts` | `isGuidePublishable` |

## Data (`src/data/`)

| Файл | Что |
|---|---|
| `site.ts` | `SITE_UNDER_CONSTRUCTION = true` константа. Контролирует defense-in-depth noindex. **Если меняешь — также обнови nginx snippet и сделай deploy**, иначе preflight в `scripts/deploy.sh` aborted |
| `regions.ts` | `REGIONS` конфиг (сейчас только Ossetia), `FUTURE_REGIONS`, `getRegion(slug)` |

## Pages (`src/pages/`)

Полная структура — в [`routing.md`](routing.md). Здесь важные:

- `index.astro` — главная brobrogid.ru с WebSite + Organization JSON-LD
- `o-nas.astro` — О нас
- `privacy.astro` — Политика конфиденциальности (ФЗ-152)
- `404.astro` — brand-styled 404 (ловится через nginx error_page)
- `robots.txt.ts` — dynamic endpoint
- `preview-a/index.astro`, `preview-b/index.astro` — homepage variants под noindex, исключены из sitemap

## Related

- [`routing.md`](routing.md) — где какой layout подключается
- [`data_flow.md`](data_flow.md) — как components получают data
- [`seo.md`](seo.md) — какие schemas инжектятся
- [`stack.md`](stack.md) — версии зависимостей
