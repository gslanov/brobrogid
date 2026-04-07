---
title: brobrogid.ru — Astro контент-сайт
type: reference
audience: all-agents
owner: brobrogid-site-agent
last_updated: 2026-04-07
stub: true
---

# brobrogid.ru

> **Этот документ — placeholder.** Основной контент должен быть дописан владельцем зоны (brobrogid-site agent). Здесь краткие факты известные archimag.

## Что это

Основной публичный сайт проекта — контент-гид по Северной Осетии (с прицелом на весь Северный Кавказ). SEO-first, статический HTML, оптимизирован под Google и Яндекс.

## Стек (на момент написания)

- **Astro 5.18** — SSG framework
- **TypeScript** — строгий режим
- **Tailwind CSS** — стили
- **MDX** — блог-статьи
- **@astrojs/sitemap** — автосгенеренный sitemap
- **@astrojs/mdx** — MDX для блога
- **@supabase/supabase-js** — чтение данных при build time

## Статус

- **252 страницы** на проде
- Русские slugs после Sprint 6
- Reviews widget работает
- Под noindex до запуска

## Sprints

- **Sprint 1:** 7 landing pages (авиабилеты Мск-Влк, пироги, погода, что посмотреть, пироговые Москвы)
- **Sprint 2:** ~60 страниц (Vladikavkaz хаб, места, погода по месяцам)
- **Sprint 3:** ~80-100 страниц (туры, гиды, маршруты, блог, справочник)
- **Sprint 6:** Русские slugs (101 POI English → Russian transliteration)

## Что нужно описать владельцу зоны

Следующие файлы в `03_content_site/` нуждаются в заполнении:

- `README.md` — обзор проекта
- `stack.md` — полный стек с версиями
- `routing.md` — URL structure, getStaticPaths patterns, nested routes
- `data_flow.md` — как данные идут из Supabase в Astro в HTML
- `seo.md` — мета-теги, JSON-LD, canonical, hreflang, sitemap
- `components.md` — каталог ключевых компонентов
- `sprints.md` — что каждый спринт изменил
- `deploy.md` — build pipeline, rsync, nginx

А также в `07_seo/` — SEO-специфичные темы.

## Known facts

- Репо: `gslanov/brobrogid-site` (приватный)
- Local path: `/home/cosmo/SOFT/COSMO/BROBROGID_SITE/`
- Server: `/var/www/brobrogid-site/`
- Deploy: `scripts/deploy.sh --confirm`
- `SITE_UNDER_CONSTRUCTION` константа в `src/lib/site.ts` контролирует noindex
- Reviews widget использует vanilla JS в `<script>` тегах, не React islands
- POI slug migration (Sprint 6) — 78 nginx 301 redirects на сервере
- Content Collection для блога (MDX)
- astro.config.mjs содержит `image.domains: ['app.brobrogid.ru']` для remote images

## Related

- `../03_content_site/` — основная зона (должна быть заполнена brobrogid-site agent)
- `../02_database/` — источник данных
- `../07_seo/` — SEO стратегия
