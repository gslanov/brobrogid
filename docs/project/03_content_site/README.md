---
title: Content Site (brobrogid.ru) — section index
type: overview
audience: all-agents
owner: brobrogid-site-agent
last_updated: 2026-04-07
stub: true
---

# 03_content_site — brobrogid.ru (Astro)

> **Эта секция — для brobrogid-site agent.** Archimag создал структуру и stub-файлы, владелец зоны должен их заполнить.

## Файлы этого раздела

Каждый файл описывает аспект Astro контент-сайта. Заполняется владельцем зоны.

- `stack.md` — **stub** — полный стек с версиями (Astro 5, TypeScript, Tailwind, MDX, Supabase SDK, etc.)
- `routing.md` — **stub** — URL structure, getStaticPaths patterns, dynamic routes
- `data_flow.md` — **stub** — как данные текут из Supabase в Astro в HTML при build time
- `seo.md` — **stub** — мета-теги, JSON-LD, canonical, hreflang, sitemap
- `components.md` — **stub** — каталог ключевых компонентов (ReviewsWidget, TourCard, POICard, etc.)
- `sprints.md` — **stub** — что каждый спринт добавил (Sprint 1, 2, 3, 6, reviews widget)
- `deploy.md` — **stub** — build pipeline, rsync, nginx

## Что archimag уже знает (minimal context)

- Repo: `gslanov/brobrogid-site`
- Local path: `/home/cosmo/SOFT/COSMO/BROBROGID_SITE/`
- Server: `/var/www/brobrogid-site/`
- Stack: Astro 5.18 + TypeScript + Tailwind + MDX + @astrojs/sitemap + @astrojs/mdx + @supabase/supabase-js
- NO framework integrations (@astrojs/react, etc.) — vanilla JS для interactivity
- Build: `npm run build` → `dist/` → `rsync` через `scripts/deploy.sh --confirm`
- Supabase client в `src/lib/supabase.ts` (BUILD-TIME ONLY, no browser import)
- Query helpers в `src/lib/queries/pois.ts`, `tours.ts`, `guides.ts`, `reviews.ts`
- Russian slugs после Sprint 6 (legacy в DB поле `slug_legacy`)
- Reviews widget использует vanilla JS в `<script>` тегах
- SITE_UNDER_CONSTRUCTION = true константа в `src/lib/site.ts` контролирует noindex
- 252 страницы на проде под noindex

## What needs documentation

Новый агент должен описать:

1. **stack.md** — точные версии всех зависимостей, почему выбрана каждая
2. **routing.md** — как URL структурирована, как `getStaticPaths()` генерит страницы, как динамические `[slug].astro` работают
3. **data_flow.md** — конкретный пример из Supabase query до HTML на странице
4. **seo.md** — как emit-ятся меta теги через `<Head>` или Astro компоненты, JSON-LD шаблоны для каждого page type
5. **components.md** — реестр компонентов с назначением (layouts, islands, server-rendered)
6. **sprints.md** — timeline добавленного контента per спринт
7. **deploy.md** — как deploy работает, где nginx config живёт, как обновлять cache

## Where to find info

- Брифинги спринтов: `/home/cosmo/SOFT/COSMO/BROMARKET/BRIEFING_sprint{1,2,3}.md` + `BRIEFING_reviews_widget.md` + `BRIEFING_sprint6_russian_slugs.md`
- Target structure: `/home/cosmo/SOFT/COSMO/BROMARKET/ossetia-structure.md`
- Keyword data: `/home/cosmo/SOFT/COSMO/BROMARKET/data/`

## Related

- `../01_domains/brobrogid_ru.md` — high-level overview
- `../02_database/schema.md` — типы данных
- `../07_seo/` — SEO стратегия (cross-cutting concerns)
