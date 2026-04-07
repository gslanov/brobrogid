---
title: Content Site (brobrogid.ru) — section index
type: overview
audience: all-agents
owner: brobrogid-site-agent
last_updated: 2026-04-07
---

# 03_content_site — brobrogid.ru (Astro)

Этот раздел документирует **brobrogid.ru** — Astro SSG контент-сайт, главный публичный фасад проекта BROBROGID. Высокоуровневый обзор — в `../01_domains/brobrogid_ru.md`. Этот раздел углубляется в технику.

## Файлы этого раздела

| Файл | Что внутри |
|---|---|
| [`stack.md`](stack.md) | Полный стек с версиями и обоснованием каждого выбора |
| [`routing.md`](routing.md) | URL-структура, `getStaticPaths()` патrerns, dynamic vs shadowing routes |
| [`data_flow.md`](data_flow.md) | Конкретный пример: Supabase query → build-time render → HTML |
| [`seo.md`](seo.md) | Meta tags, canonical, OG, JSON-LD schemas, sitemap, robots |
| [`components.md`](components.md) | Каталог layouts, components/seo, components/content, components/reviews |
| [`sprints.md`](sprints.md) | Что каждый спринт добавил (1, 2, 3, Reviews Widget, 4/5 fixes, 6 slugs) |
| [`deploy.md`](deploy.md) | Build pipeline, rsync, nginx config, preflight checks, rollback |

## Для чего этот сайт

`brobrogid.ru` — это **SEO machine**. Цель — собрать органический трафик из Google и Яндекс по 14 312 ключевым фразам семантического ядра (см. `/home/cosmo/SOFT/COSMO/BROMARKET/data/clusters_filtered.json`). Главные кластеры по приоритету:
1. **Места (430K частот)** — ущелья, водопады, горы, исторические места
2. **Кухня (121K)** — особенно осетинские пироги (пироги Москва — отдельный sub-cluster)
3. **Транспорт (56K)** — Москва-Владикавказ авиабилеты, поезд, аэропорт
4. **Владикавказ (~6K точных)** — отели, рестораны, что посмотреть

Архитектура подчинена этой цели: SSG для скорости crawl и Lighthouse 100, JSON-LD для Rich Results, чистые семантические URL, sitemap auto, structured data везде.

## Архитектурные принципы

1. **Vanilla JS only** — никаких framework integrations. JS добавляется через `<script>` теги внутри `.astro` файлов когда реально нужен (booking форма, reviews widget toggle, "читать дальше"). См. [decision rationale](stack.md#почему-vanilla-js-без-framework).
2. **Build-time fetch** — все запросы к Supabase делаются один раз во время `npm run build`. Никаких runtime API calls с клиента (за исключением booking форм). См. [`data_flow.md`](data_flow.md).
3. **Cached singleton** для запросов которые нужны многим страницам (`getAllReviews()`, `getAllPOIs()`) — иначе билд-pipeline делал бы 200+ HTTP round-trips.
4. **Server-rendered + progressive enhancement** — каждый интерактивный widget сначала рендерится полностью на сервере, JavaScript только улучшает UX (toggle, sort). Без JS — всё работает.
5. **Defense-in-depth noindex** — пока сайт не запущен, noindex стоит в трёх местах одновременно: meta tags из `BaseLayout`, `X-Robots-Tag` header в nginx, `Disallow: /` в `robots.txt`. Контролируется одной константой `SITE_UNDER_CONSTRUCTION` в `src/data/site.ts` + ручной правкой nginx snippet + dynamic robots.txt endpoint. Preflight в `scripts/deploy.sh` валидирует синхронизацию перед каждым деплоем.
6. **Никогда `set:html`** для DB content — только `{value}` через Astro escape. XSS невозможен даже если в Supabase попадёт `<script>alert(1)</script>`.

## Текущее состояние (2026-04-07)

- **252 страницы** в build, 246 URL в sitemap (preview-a/preview-b исключены)
- Sprint 6 закрыт: 101 POI с русскими slugs, 78 nginx 301 redirects
- Reviews widget LIVE (vanilla JS)
- Booking форма LIVE (direct fetch к PostgREST)
- Audit fixes (10 BLOCKERS + IMPORTANT items) закрыты
- Защита: 3-уровневый noindex, security headers через snippet, форма с honeypot+rate limit
- Pending: открытие индексации (требует только флипа `SITE_UNDER_CONSTRUCTION`+ обновления nginx snippet + ручного действия пользователя в Google Search Console / Yandex Webmaster)

## Sprint timeline (краткое)

| # | Когда | Что | Файлов |
|---|---|---|---|
| 1 | 2026-04-06 | 7 landing pages для горячих ключей | 13 |
| 2 | 2026-04-06 | Vladikavkaz hub + Mesta + Pogoda | ~60 |
| 3 | 2026-04-06 | Туры + гиды + маршруты + кухня + справочник + блог + карта | ~80 |
| Reviews | 2026-04-06 | Reviews widget vanilla JS + JSON-LD | 5 components + layouts wire |
| 4/5 | 2026-04-06/07 | Word count expansion + cross-sprint links + booking form + audit | ~70 modified |
| 6 | 2026-04-07 | EN→RU slug migration + nginx 301 redirects | 41 renames + 78 redirects |

Полный отчёт — [`sprints.md`](sprints.md).

## Где взять контекст

- Брифинги: `/home/cosmo/SOFT/COSMO/BROMARKET/BRIEFING_for_new_agent.md` (Sprint 1), `BRIEFING_sprint2.md`, `BRIEFING_sprint3.md`, `BRIEFING_reviews_widget.md`, `BRIEFING_sprint6_russian_slugs.md`
- URL структура target: `/home/cosmo/SOFT/COSMO/BROMARKET/ossetia-structure.md`
- Semantic data: `/home/cosmo/SOFT/COSMO/BROMARKET/data/clusters_filtered.json`
- Локальный JOURNAL проекта: `/home/cosmo/SOFT/COSMO/BROBROGIDsite/docs/JOURNAL.md`
- Git log: `/home/cosmo/SOFT/COSMO/BROBROGIDsite/GIT_LOG.md`

## Related

- [`../01_domains/brobrogid_ru.md`](../01_domains/brobrogid_ru.md) — high-level overview
- [`../02_database/schema.md`](../02_database/schema.md) — структура данных
- [`../05_data_model/`](../05_data_model/) — типы (POI, Tour, Guide, Review, MenuItem)
- [`../07_seo/`](../07_seo/) — SEO стратегия (cross-cutting)
- [`../06_security/booking_form_defenses.md`](../06_security/booking_form_defenses.md) — booking form
- [`../08_infrastructure/nginx.md`](../08_infrastructure/nginx.md) — nginx config
