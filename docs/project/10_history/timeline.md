---
title: Project Timeline
type: reference
audience: all-agents
owner: archimag
last_updated: 2026-04-07
---

# Project Timeline

Хронология ключевых фаз и решений проекта.

## 2026-03 — Pre-project research

- Семантическое ядро собрано (14 312 ключей, 13 кластеров) через Яндекс Wordstat и Rush Analytics
- Data в `/home/cosmo/SOFT/COSMO/BROMARKET/data/`
- Написана целевая структура `/ossetia/` в `ossetia-structure.md`

## 2026-04-05 — Бутстрап приложения

- Создан repo `gslanov/brobrogid`
- Initial scaffolding: Vite + React 19 + TypeScript + Tailwind
- Feature-based structure (`src/features/*/`)
- Типы данных (`src/data/types/index.ts`)
- IDB layer через `idb` library (не Dexie)
- Zustand stores (data, order, ui, toast)
- Начальные feature pages: Explore, Map, Search, Tours, POIDetail, etc.
- i18n настройка (ru/en)
- PWA manifest

## 2026-04-06 morning — Admin CMS

- Полная админка в `src/features/admin/`
- 17 pages (list + form для каждой сущности)
- 14 shared components
- `useAdminData` hook через raw IDB
- Hardcoded auth (3 users with SHA-256) — **CRITICAL ISSUE создана тут**
- Admin i18n (ru/en, 230 ключей под `admin.*` namespace)

## 2026-04-06 — SEO-prerender

- **Проблема:** SPA без SSR → Google видит пустой HTML
- **Решение:** Puppeteer-based prerender в `scripts/prerender.ts`
- `react-helmet-async` для dynamic meta tags
- JSON-LD для Rich Results (TouristAttraction, FoodEstablishment, TouristTrip, Person)
- robots.txt + sitemap.xml generation
- WebP конвертация через sharp
- 141 → 189 prerendered страниц
- Deploy на `brobrogid.ru` (тогда ещё основной домен)

## 2026-04-06 evening — Domain split

**Решение:** разделить на три домена:

- `brobrogid.ru` → новый Astro контент-сайт (будет построен отдельно)
- `app.brobrogid.ru` → существующий React PWA (интерактив)
- `api.brobrogid.ru` → Supabase self-hosted

**Почему:** контент-сайт для SEO и интерактивное приложение — разные задачи с разными приоритетами.

## 2026-04-06 — Supabase self-hosted

- Docker + docker-compose на Selectel VPS
- Minimal stack: PostgreSQL 16 + PostgREST 12 + GoTrue 2 (~60 MB RAM)
- nginx reverse proxy для `api.brobrogid.ru`
- Let's Encrypt SSL
- Cron backup
- 13 migrations (schema + RLS + triggers + tour_bookings)
- Impoрт данных из JSON в БД

## 2026-04-06 — Второй агент (Astro сайт)

- Отдельная сессия Claude создана для `brobrogid-site`
- Брифинг в `BRIEFING_for_new_agent.md`
- Agent создал:
  - Новый repo `gslanov/brobrogid-site`
  - Astro проект с layouts, components
  - Sprint 1: 7 landing pages + 6 хабов (deployed)
  - Content: 1500+ слов каждая, JSON-LD, OG, BreadcrumbList

## 2026-04-06 — Noindex

- Решение держать **все сайты под noindex** до финального запуска
- Мера: robots.txt Disallow + meta noindex + nginx X-Robots-Tag
- Причина: сайт ещё наполняется, не хотим засорять индекс

## 2026-04-06 — Sprint 2 + Sprint 3 брифы

- `BRIEFING_sprint2.md` — Vladikavkaz hub, POI категории, погода
- `BRIEFING_sprint3.md` — туры, гиды, маршруты, блог, справочник
- Reviewed Trevozhniy + Dotoshniy (multiple rounds of fixes)

## 2026-04-07 — Security audit round 1 (SENTINEL)

- SENTINEL прошёлся по `0010_tour_bookings.sql`
- 5 findings: HIGH column-level writes, HIGH XSS vector, MEDIUM enumeration, HIGH weak rate limit
- Plus CRITICAL из `auth.ts` (hardcoded creds) — признана отдельной задачей
- Migration `0011_tour_bookings_hardening.sql` закрывает 5 findings

## 2026-04-07 — Security audit round 2 (ARCHITECT)

- ARCHITECT добавил 7 новых findings
- 2 уже закрыты в 0011 (TOCTOU + DoS)
- 4 новых в 0012: ON DELETE SET NULL, admin UPDATE whitelist, honeypot detection, SECURITY DEFINER docs
- 1 аудит (service_role в VITE_*) — clean, закрыт как ИНФО

## 2026-04-07 — Sprint 6 — Russian slugs

- Обнаружено что 101 POI имеет английские slugs при русском контенте
- Brief: `BRIEFING_sprint6_russian_slugs.md`
- Migration `0013_russian_slugs.sql` применён
- app.brobrogid.ru: обновлён `pois.json` + rebuild + deploy
- brobrogid.ru: новый агент переименовал 41 .astro file + 78 nginx 301 redirects + deploy
- Оба сайта синхронизированы

## 2026-04-07 — Reviews widget

- Новый агент независимо сделал reviews widget на brobrogid.ru
- Vanilla JS (без React islands)
- Все 5 типов страниц (POI, ресторан, отель, тур, гид)
- AI badges на is_generated=true отзывах
- JSON-LD не эмитит AggregateRating для AI-only отзывов (защита от Google manipulation санкций)

## 2026-04-07 — Data cleanup

- vite 8.0.4 → 8.0.5 (3 HIGH CVE dev server fixes)
- Очистка "Алания Турция" семантического загрязнения — 268 ключей / 31K фейк-показов из clusters_filtered.json

## 2026-04-07 — Documentation hub (текущий момент)

- Создана `docs/project/` — structured multi-agent documentation
- Готова для RAG ingestion
- Stubs для других агентов (security, content site, SEO)

## Что впереди

- **Pool 4:** миграция `app.brobrogid.ru` с JSON на Supabase API. Закроет technical debt + SENTINEL CRITICAL (hardcoded creds) + упростит синхронизацию данных.

- **Launch procedure:** снятие noindex на `brobrogid.ru`, Google Search Console + Yandex Webmaster setup.

- **Sprint 4-5 (новый агент):** контентная стратегия, внутренние ссылки блог→POI, остальные посёлки/вершины.

- **Региональная экспансия:** `/kbr/`, `/dagestan/`, `/chechnya/`, `/ingushetia/`, `/kchr/`.

- **Мобильные приложения:** отложены до стабилизации контент-сайта.

## Related

- `sprint_logs.md` — краткие резюме каждого спринта
- `lessons_learned.md` — что мы поняли по ходу проекта
- `../00_overview/README.md` — текущее состояние проекта
