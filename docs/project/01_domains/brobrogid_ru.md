---
title: brobrogid.ru — Astro контент-сайт
type: reference
audience: all-agents
owner: brobrogid-site-agent
last_updated: 2026-04-07
---

# brobrogid.ru

## Что это

Основной публичный сайт проекта BROBROGID — контент-гид по Северной Осетии (с прицелом на расширение на весь Северный Кавказ: КБР, Дагестан, Чечня, Ингушетия, КЧР). SEO-first, статический HTML, оптимизирован под Google и Яндекс. Не интерактивное приложение — никаких форм авторизации, корзин, real-time. Только контент, JSON-LD, навигация, и одна форма бронирования (booking) которая дёргает API.

Архитектурный принцип: **content-first, zero JS by default**. Astro отдаёт чистый HTML, JavaScript добавляется только там где он реально нужен (forms, reviews widget toggle, "читать дальше"). Никакого React/Svelte/Vue — vanilla JS в `<script>` тегах прямо в `.astro` файлах. Это сознательное архитектурное решение, см. `../03_content_site/stack.md`.

## Зачем существует

Параллельный сайт `app.brobrogid.ru` (PWA) был построен первым как React SPA с client-side рендерингом. У него фундаментальный SEO-блокер: поисковики не индексируют JavaScript-only контент или индексируют плохо. Решение — отдельный сайт со 100% статическим HTML, разделяющий ту же базу данных, но превращающий её в HTML на этапе build, а не в браузере пользователя.

Это даёт:
- Lighthouse SEO 100 на любой странице (нет JS, нет CSR latency)
- Полноценный crawl для Googlebot и YandexBot
- Sitemap и canonical URLs в честных HTML страницах, не в `<head>` после hydration
- Server-side JSON-LD для каждой сущности (POI/тур/гид/блог-пост)
- Стабильная скорость даже на медленной 3G

Trade-off: контент обновляется только при ребилде (rsync deploy), не в реальном времени. Для путеводителя где данные стабильные — это приемлемо.

## Где живёт

| Что | Где |
|---|---|
| Repo | `gslanov/brobrogid-site` (приватный, GitHub) |
| Local path | `/home/cosmo/SOFT/COSMO/BROBROGIDsite/` |
| Server path | `/var/www/brobrogid-site/` |
| Server | Selectel VPS `87.228.33.68` |
| nginx config | `/etc/nginx/sites-available/brobrogid-site` (symlink в `sites-enabled/`) |
| nginx snippets | `/etc/nginx/snippets/brobrogid-security-headers.conf`, `brobrogid-poi-redirects.conf` |
| SSL cert | `/etc/letsencrypt/live/brobrogid.ru/` (Let's Encrypt, certbot, SAN: brobrogid.ru + www.brobrogid.ru) |
| Deploy script | `scripts/deploy.sh --confirm` (preflight + rsync через SSH key `/home/cosmo/.ssh/id_ed25519_selectel`) |

## Стек

- **Astro 5.18.1** — SSG framework (поднят с 4.x из-за HIGH advisory)
- **TypeScript** — строгий режим, path aliases `@/components/*`, `@/layouts/*`, `@/lib/*`, `@/data/*`, `@/utils/*`, `@/styles/*`
- **Tailwind CSS 3** + `@tailwindcss/typography` для prose
- **MDX** через `@astrojs/mdx` для блог-статей
- **`@astrojs/sitemap`** — автогенерация с `lastmod`/`priority`/`changefreq`
- **`@astrojs/check`** — TypeScript valid
- **`@supabase/supabase-js`** — build-time client (НЕ браузерный, см. `data_flow.md`)
- **`sharp`** — оптимизация картинок
- **НЕТ** framework integrations (`@astrojs/react`, `@astrojs/svelte`, `@astrojs/vue`) — vanilla JS only

См. `../03_content_site/stack.md` для полных версий и обоснований.

## Текущий статус

| Метрика | Значение |
|---|---|
| Страниц на проде | **252** (после Sprint 6) |
| Sitemap URL | 246 (preview-a/preview-b исключены) |
| Размер dist/ | ~7-8 MB |
| Build time | ~28 сек |
| Slugs | Русские (после Sprint 6) с 78 nginx 301 redirects со старых английских |
| Reviews Widget | LIVE (vanilla JS, cached fetch, AI-фильтр для AggregateRating) |
| Booking форма | LIVE (direct fetch к PostgREST с `Prefer: return=minimal`) |
| `SITE_UNDER_CONSTRUCTION` | `true` — сайт под noindex |
| Defense-in-depth noindex | 3 уровня: meta tags + nginx X-Robots-Tag + robots.txt Disallow |

## Sprints

| Sprint | Что добавлено | Подробности |
|---|---|---|
| 1 | 7 landing pages (горячие конверсионные ключи) | См. `../03_content_site/sprints.md` |
| 2 | ~60 страниц (Vladikavkaz hub + Mesta + Pogoda) | dynamic POI через `getStaticPaths()` впервые |
| 3 | ~80-100 страниц (туры, гиды, маршруты, кухня, справочник, блог) | 5 layouts, JSON-LD `TouristTrip`+`Person`+`BlogPosting` |
| Reviews Widget | vanilla JS, на 5 типах страниц | Out-of-sequence mini-sprint |
| 4/5 | Word count expansion + cross-sprint links + booking form + audit fixes | 10 параллельных агентов одновременно |
| 6 | 101 POI EN→RU slugs + 78 nginx 301 redirects | `slug_legacy` fallback в queries |

Подробности per sprint — `../03_content_site/sprints.md`.

## Защита

- **Booking форма** — honeypot field + DB CHECK constraints + DB rate-limit trigger + RLS (anon только INSERT, без SELECT). См. `../06_security/booking_form_defenses.md`.
- **Reviews widget** — `is_generated=true` отзывы помечаются "AI" badge в UI, но **исключаются из JSON-LD AggregateRating** (защита от Google fake-review санкций)
- **Domain whitelist** для author_avatar в reviews (`src/components/reviews/helpers.ts:isAllowedAvatarUrl`)
- **CSP / HSTS / Permissions-Policy** через nginx snippet (см. `../08_infrastructure/nginx.md`)
- **Никогда `set:html`** для DB content — только `{value}` (Astro escape)
- **`PUBLIC_*` env vars only** — `service_role` JWT нигде в репо

## Где взять данные

- Брифы спринтов: `/home/cosmo/SOFT/COSMO/BROMARKET/BRIEFING_*.md`
- Исходная структура URL: `/home/cosmo/SOFT/COSMO/BROMARKET/ossetia-structure.md`
- Семантика: `/home/cosmo/SOFT/COSMO/BROMARKET/data/clusters_filtered.json` (14 312 ключей, 13 кластеров)
- Schema БД: `../02_database/schema.md`
- Sprint history: `../03_content_site/sprints.md`

## Известные источники несоответствий

- **`SITE_UNDER_CONSTRUCTION` константа** в `src/data/site.ts` (НЕ `src/lib/site.ts` как было в раннем брифе)
- **Local path** — `/home/cosmo/SOFT/COSMO/BROBROGIDsite/` (нижний регистр в `site`, без подчёркивания)
- **`getPOIBySlug` fallback** — после Sprint 6 функция при отсутствии POI по primary slug делает второй lookup по `slug_legacy`. Это защита на случай рассинхрона между hand-written shadowing файлами и БД.

## Related

- `../03_content_site/README.md` — индекс детальной документации
- `../03_content_site/stack.md` — полный стек
- `../03_content_site/routing.md` — URL-структура и `getStaticPaths()`
- `../03_content_site/data_flow.md` — Supabase → Astro → HTML
- `../03_content_site/seo.md` — мета-теги, JSON-LD, sitemap
- `../03_content_site/components.md` — каталог компонентов
- `../03_content_site/sprints.md` — sprint timeline
- `../03_content_site/deploy.md` — pipeline
- `../02_database/schema.md` — источник данных
- `../06_security/booking_form_defenses.md` — booking защита
- `../07_seo/launch_procedure.md` — открытие индексации
