---
title: brobrogid.ru — Sprint Timeline
type: reference
audience: all-agents
owner: brobrogid-site-agent
last_updated: 2026-04-07
---

# Sprint Timeline

## Что это

Хронология всего что было добавлено на `brobrogid.ru` per sprint. Полезно для агентов которые хотят понять "почему это так работает" — ответ обычно "это было решено в Sprint X из-за Y". Каждая запись содержит контекст, что добавлено, известные пробелы.

## Sprint 1 — Hot landing pages (2026-04-06)

**Бриф:** `/home/cosmo/SOFT/COSMO/BROMARKET/BRIEFING_for_new_agent.md`
**Цель:** 7 landing pages для самых горячих ключей семантики (~13K точной частотности на страницу).

### Что добавлено

| URL | Keyword | Частотность |
|---|---|---|
| `/ossetia/kak-dobratsya/iz-moskvy/na-samolete/` | москва владикавказ авиабилеты | **3079** |
| `/ossetia/kak-dobratsya/iz-moskvy/na-poezde/` | поезд москва владикавказ | 913 |
| `/ossetia/kak-dobratsya/aeroport-vladikavkaz/` | аэропорт владикавказ | 513 |
| `/ossetia/kuhnya/osetinskie-pirogi/` | осетинские пироги | **6958** |
| `/ossetia/kuhnya/osetinskie-pirogi/pirogovye-moskvy/` | осетинские пироги москва доставка | **~15-20K** |
| `/ossetia/vladikavkaz/pogoda/` | погода во владикавказе | 1185 |
| `/ossetia/vladikavkaz/chto-posmotret/` | владикавказ что посмотреть | 374 |

Плюс 6 хабов-заглушек (`/`, `/ossetia/`, `/ossetia/kak-dobratsya/`, `/ossetia/kak-dobratsya/iz-moskvy/`, `/ossetia/kuhnya/`, `/ossetia/vladikavkaz/`) — 13 HTML на проде.

### Что было создано

- Astro skeleton: package.json (Astro 5.18), tsconfig strict, tailwind config с цветами/шрифтами
- 8 JSON-LD schemas (BreadcrumbList, Article, FAQPage, TouristAttraction, Restaurant, TouristTrip, Person, LocalBusiness)
- BaseLayout, RegionLayout, LandingLayout, POILayout (заглушка)
- Header/Footer/Nav/SEO/JsonLd/Breadcrumbs компоненты
- Data layer: supabase client + types (LocalizedText, POI без `Json` дженерика) + i18n + imageUrl + regions
- `scripts/deploy.sh` с preflight checks (SSH key 600, target dir exists, .env detection)
- `astro.config.mjs` с `site: process.env.PUBLIC_SITE_URL`
- `.gitignore` extended (`.env.*`, `!.env.example`, `.claude/`, `.agent/`)

### Trevozhniy + Dotoshniy review (Sprint 1)

- TouristTrip + Person schemas missing → добавлены
- Cache headers + preload missing → добавлены в брифинг для следующих sprint'ов
- Word count fix: pogoda 1291 → 1628, chto-posmotret 1444 → 1638
- BreadcrumbList не включал текущую страницу → fix в Breadcrumbs.astro

### Live verification (после Sprint 1)
- 13 HTML страниц
- Build чистый, 0 errors
- Sample URLs все 200
- Открыт PRIVATE репо `gslanov/brobrogid-site`

## Sprint 2 — Vladikavkaz hub + Mesta + Pogoda (2026-04-06)

**Бриф:** `/home/cosmo/SOFT/COSMO/BROMARKET/BRIEFING_sprint2.md`
**Цель:** ~50-60 страниц ядра путеводителя. Динамика из Supabase впервые.

### Block A — Vladikavkaz hub (60 страниц)

- Главная Vladikavkaz переписана с заглушки 370 слов → 1569 слов (10-link меню, 6 топ POI карточек)
- 4 каталога: oteli (1464), restorany (1282), shopping (1148), nightlife (1096)
- 9 контентных страниц: teatry, parki, muzei, hramy, dostoprimechatelnosti, za-1-den, za-3-dnya, istoriya-goroda, rayony
- 4 расширения погоды: na-nedelyu, na-10-dney, na-mesyats, po-mesyatsam
- **40 динамических [slug] детальных страниц POI**: 6 oteli + 22 restorany (10 fully-written + 12 thin shells) + 8 shopping + 4 nightlife. Все через `getStaticPaths()` + filter `isVladikavkazHotel`/`isVladikavkazRestaurant`. Static shadowing для top POI.

### Block B — Mesta + dynamic POI (~57 страниц)

- `/mesta/` хаб + 7 категория-индексов (ushchelya, vodopady, gory-i-vershiny, goroda-sela, istoricheskie-mesta, prirodnye, gornolyzhnye-kurorty)
- Один dynamic `[category]/[slug].astro` генерит ~30+ POI страниц через `getStaticPaths()` + `mapPoiToMestaUrlParams()`
- 11 fully-written shadowing для топ-POI

### Block C — Pogoda i sezony (21 страница)

- 8 overview: index, kogda-luchshe-ehat, zimoy/letom/osenyu/vesnoy, klimat, chto-vzyat-s-soboy
- 12 monthly: yanvar..dekabr с реальными климатическими данными (meteorf.ru attribution)
- po-mesyatsam aggregator

### Step 0 — DB audit findings (важно)

Перед написанием кода был сделан audit `.agent/db-audit-sprint2.md`:
- **Subcategory НЕ содержит "ущелье/водопад/гора"** в БД — это `nature/history/religion/...`. Маппинг через `subcategory.includes()` промахнётся → нужно NAME-pattern matching по имени POI
- `description.full.ru < 100c` у всех знаковых мест → порог снижен с 100 до 80
- Vladikavkaz BBOX (lat 42.95-43.10, lng 44.55-44.75) разделяет food/accommodation между Vladikavkaz tree и mesta tree

### Step 1 — Infrastructure created

- `src/utils/poi-url.ts` — критическая функция `mapPoiToMestaUrlParams` (NAME-pattern + SUBCAT_MAP + location BBOX + category fallback)
- `src/lib/queries/pois.ts` — добавлены `getRelatedPOIs`, `getVladikavkazPOIs`
- `astro.config.mjs` — `image.domains: ['app.brobrogid.ru']`
- `POILayout.astro` переписан полностью (hero, lead, gallery, related, FAQ, footer-CTA)
- `CategoryLayout.astro` создан

### Live (после Sprint 2)
- 150 HTML страниц на проде
- Sitemap 150 URL
- Build 7-8 sec, dist ~3.6 MB

### Известные проблемы (TODO Sprint 4)
- Word count ниже spec на 50% страниц
- BreadcrumbList дублировался (POILayout + Breadcrumbs оба эмитили) → fix
- preview-a/preview-b исключены из sitemap

## Sprint 3 — Long tail (2026-04-06)

**Бриф:** `/home/cosmo/SOFT/COSMO/BROMARKET/BRIEFING_sprint3.md`
**Цель:** ~80-100 страниц длинного хвоста — туры, гиды, маршруты, кухня, справочник, блог.

### Step 0 — DB audit Sprint 3

- 20 туров — все publishable, route есть, guide_id есть
- 8 гидов — все publishable, у каждого 2-3 reviews
- 6 accommodation вне Vladikavkaz: Цей×2, Фиагдон, Даргавс, Дзинага, Хидикус
- guide-004 Мадина без туров

### Step 1 — Infrastructure

- TourLayout, GuideLayout, BlogLayout
- query helpers (getToursByCategory/Type, getRelatedTours, getGuideById)
- isTourPublishable + isGuidePublishable utils
- BlogPosting JSON-LD schema
- RouteMap, BookingButton (placeholder phone), RelatedTours, BlogCard, Pagination components
- Content collection `blog` (`src/content.config.ts`) с zod schema

### Block A — Tours/guides/accommodation (~52 страницы)

- A1: `/tury-ekskursii/` хаб + 11 категорий-фильтров (12)
- A2: 20 динамических tour pages (7 fully-written + 13 thin shells через `[slug].astro`)
- A3: `/gidy/` хаб + 8 fully-written guide pages
- A4: `/otdykh-i-prozhivanie/` 9 страниц (oteli/{vladikavkaz, fiagdon (kw 479), tsey, karmadon}, бazy-otdykha, glempingi, sanatorii (kw 147), gostevye-doma)

### Block B — /marshruty/ (12 страниц)

Главная + 4 категории + 7 готовых маршрутов. RouteMap компонент для авто-маршрутов.

### Block C — /kuhnya/ extension (10 страниц)

Расширение Sprint 1 с новыми блюдами (dzykka, fydzhyn, lyvzha, sladosti), напитками (araka), сыром, перелинк-страницей.

### Block D — /ob-osetii/ справочник (11 страниц)

История, культура, язык, народ, символика. **Sensitive**: древние аланы (БЕЗ современных тёзок), Беслан как исторический факт без туристического промо. Источники: Кузнецов, Калоев, Гадло, Абаев, Гутнов.

### Block E — Блог (16 страниц)

15 MDX статей в `src/content/blog/`. Темы: chto-privezti, osetiya-zimoy, marshrut-vladikavkaz-tbilisi, legendy, foto-spoty, kavkazskoe-gostepriimstvo, bezopasnost-v-gorah, osetiya-s-detmi, byudjetnoe-puteshestvie, luchshie-vidovye-tochki, osetinskaya-svadba, film-bodrov-karmadon, osetiny-i-gruziny-otlichiya, kalendar-prazdnikov, osetiya-vs-dagestan. **Sensitive (3 статьи)**: Бодров-Кармадон, ВГД-граница, Грузия-Осетия.

### Block F — /karta/ (1 страница)

Статика, Yandex Maps embed iframe, POI list по 7 категориям. Без MapLibre/JS island.

### Live (после Sprint 3)
- 248 страниц на проде
- 246 sitemap URL
- 0 broken internal links на sample 204 ссылок

## Reviews Widget (mini-sprint, out of sequence)

**Бриф:** `/home/cosmo/SOFT/COSMO/BROMARKET/BRIEFING_reviews_widget.md`

- 4 новых компонента: `ReviewsWidget.astro`, `ReviewCard.astro`, `StarRating.astro`, `helpers.ts`
- Cached singleton `getAllReviews()` (один SQL запрос за билд для 499 отзывов)
- AI отзывы (`is_generated=true`) показываются с бейджем "AI" но **исключаются из JSON-LD AggregateRating** (защита от Google fake-review санкций)
- Domain whitelist для author_avatar
- Schemas (TouristAttraction, Restaurant, TouristTrip, Person) расширены с aggregateRating + review[] props
- POILayout, TourLayout, GuideLayout все wire ReviewsWidget

## Sprint 4/5 — Audit fixes & content expansion (2026-04-06/07)

Mini-sprint после внешнего SEO/Trevozhniy/Dotoshniy аудита.

### Booking form
- BookingForm.astro переписан с supabase-js на direct fetch с явным `Prefer: return=minimal`
- Email `hello@brobrogid.ru` в Footer
- Cross-sprint reverse links (Sprint 1/2 → Sprint 3) — content-only edits 12 страниц, +32 ссылок

### 10 параллельных агентов одновременно
Word count expansion для 70+ файлов:
- 15 блог-статей (880-1200 → 1500-2000)
- 8 гидов (920 → 1500-1800)
- 13 thin shell туров → fully-written (1500-1700 каждый)
- 12 thin shell ресторанов → fully-written
- 8 mesta category indexes
- 8 pogoda overview pages
- 13 pogoda monthly pages

### SEO audit fixes (10 BLOCKERS + 17 IMPORTANT)

| # | Что |
|---|---|
| #1 | og-default.jpg + BlogLayout ogImage wire |
| #2 | og:type="article" на блог-постах |
| #3 | robots.txt sync через dynamic endpoint + deploy preflight |
| #4 | nginx www → non-www 301 |
| #5 | brand-styled 404 page |
| #6 | Related posts на блоге |
| #7 | preview-a noindex |
| #8 | canonical-200 stub pages → meta-refresh redirect + noindex |
| #9 | Inter+Manrope через Google Fonts preconnect/preload |
| #10 | scripts/expand-*.sh в .gitignore |

IMPORTANT: WebSite+Organization schema на главной, dateModified в content collection, LCP fetchpriority+width/height на hero img, og:image:width/height/alt, About+Privacy pages (ФЗ-152), GSC+Yandex placeholders, sitemap lastmod/priority/changefreq, HSTS+CSP+Permissions-Policy через nginx snippet, http→https в restorany.

**Технический win:** Обнаружено что nginx `add_header` не наследуется из server-level если location определяет свой `add_header`. Решено через `include /etc/nginx/snippets/brobrogid-security-headers.conf` в каждом location.

### Broken links cleanup
- `/mesta/[category]/[slug].astro` related filter теперь использует `isPoiPublishable + mapPoiToMestaUrlParams != null` (раньше пропускал → 11+ битых ссылок на не-сгенерированные POI)
- Создан `/otdykh-i-prozhivanie/oteli/` хаб (раньше 12 ссылок вели в 404)

## Sprint 6 — Russian slugs migration (2026-04-07)

**Бриф:** `BRIEFING_sprint6_russian_slugs.md` (упоминается в `00_overview/`)
**Цель:** мигрировать 101 POI с английских slugs на русские транслитерации.

### Что сделано

1. Параллельная сессия (api.brobrogid.ru) добавила поле `slug_legacy` в таблицу `pois`, обновила `slug` на русские (tseyskoe-uschele, dargavs-gorod-myortvyh, kurtatinskoe-uschele и т.д.)
2. **41 shadowing файл** переименован: `tsey-gorge.astro` → `tseyskoe-uschele.astro` и т.д. Внутри обновлён `getPOIBySlug('new-slug')`
3. **78 nginx 301 redirects** сгенерированы (`deploy/nginx/poi-redirects.conf`) для publishable POI: `slug_legacy` → `slug`. Подключены через `include /etc/nginx/snippets/brobrogid-poi-redirects.conf`
4. **Defense-in-depth**: `getPOIBySlug` теперь делает fallback lookup по `slug_legacy` если по primary slug POI не найден. Защита на случай рассинхрона hand-written shadowing файлов и БД в будущем.

### Verified live
```
301 /mesta/ushchelya/tsey-gorge/ → /mesta/ushchelya/tseyskoe-uschele/
301 /mesta/istoricheskie-mesta/dargavs--city-of-the-dead/ → /dargavs-gorod-myortvyh/
301 /vladikavkaz/oteli/imperial-hotel/ → /vladikavkaz/oteli/otel-imperial/
200 на всех новых русских slugs
```

## Текущее состояние (2026-04-07)

- **252 страницы** в build
- **246 URL** в sitemap
- **78 nginx 301 redirects** активны
- Reviews widget LIVE
- Booking форма LIVE с реальным WhatsApp `+79099377297`
- 3-уровневый noindex (meta + nginx X-Robots-Tag + robots.txt)
- Готовность к открытию индексации: ждёт ручного решения пользователя

## Открытые вопросы / TODO

- **Word count** для нескольких страниц всё ещё ниже spec (imperial-hotel 659/1500, fydzhynta 872, dargavs тур 1122). Soft target — Google не имеет жёсткого 1500-char floor.
- **Real reviews** — все 499 в БД с `is_generated=true` → AggregateRating нигде не появится пока не появятся настоящие отзывы (через будущую форму "оставить отзыв" — отдельный sprint)
- **Sprint 7 candidates**: форма "оставить отзыв" с миграцией БД, расширение на КБР/Дагестан, MapLibre интерактивная карта, БД фиксы (дубликаты POI, generic menu_items)

## Related

- [`../10_history/timeline.md`](../10_history/timeline.md) — общий project timeline
- [`../06_security/audit_history.md`](../06_security/audit_history.md) — закрытые findings
- [`../07_seo/launch_procedure.md`](../07_seo/launch_procedure.md) — открытие индексации
