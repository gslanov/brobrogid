---
title: PWA Stack — версии и обоснования
type: reference
audience: archimag, dev
owner: archimag
last_updated: 2026-04-07
---

# Tech Stack — app.brobrogid.ru

Полный стек React PWA с версиями и rationale.

## Runtime dependencies

| Package | Version | Назначение | Почему именно это |
|---|---|---|---|
| **react** | 19.2.4 | UI framework | Latest stable, нужен для concurrent features |
| **react-dom** | 19.2.4 | DOM renderer | Парный к react |
| **react-router-dom** | 7.13.2 | Client-side routing | v7 — стабильная, поддерживает lazy loading |
| **zustand** | 5.0 | State management | Минимальный API, без бойлерплейта Redux, TypeScript-friendly |
| **idb** | 8.0 | IndexedDB wrapper | Лёгкая (не Dexie), promise-based, типизированная схема через generics |
| **i18next** | 26 | i18n core | Industry standard, namespace support |
| **react-i18next** | 17 | React bindings | Hook `useTranslation`, Trans component |
| **maplibre-gl** | 5.21 | Vector map | Open-source форк Mapbox, без vendor lock-in |
| **pmtiles** | 4.4 | Tile format | Один файл вместо thousands, легко serve через nginx |
| **framer-motion** | 12.38 | Animations | Imperative API + reduced-motion respect |
| **lucide-react** | 1.7 | Icons | Лучший трейд-офф размер/количество, tree-shakeable |
| **fuse.js** | 7.1 | Fuzzy search | Пушистый поиск без бэкенда, для search page |
| **react-helmet-async** | 2.0 | Head management | Dynamic meta tags для SEO + react.lazy совместимость |
| **@tanstack/react-query** | 5.95 | Async data | Установлен но почти не используется (data flow через Zustand+IDB) |

## Build / dev dependencies

| Package | Version | Назначение |
|---|---|---|
| **vite** | 8.0.5 | Build tool, dev server (security update от 8.0.4) |
| **@vitejs/plugin-react** | 6.0.1 | React refresh, JSX transform |
| **@tailwindcss/vite** | 4.2.2 | Tailwind v4 как Vite plugin (новый pipeline) |
| **vite-plugin-pwa** | 1.2.0 | Service worker generation, manifest |
| **typescript** | 5.9 | Strict mode, project references |
| **eslint** | 9 | Linting |
| **puppeteer** | 24+ | Headless Chrome для prerender script |
| **sharp** | 0.33 | Image WebP conversion |
| **tsx** | 4+ | Run TS scripts directly |
| **pg** | 8 | PostgreSQL client для импорта в БД |
| **@types/pg** | 8 | TS types для pg |
| **@supabase/supabase-js** | 2 | Supabase SDK (установлен, не используется — Pool 4) |

## Архитектурные решения и почему

### Vite вместо Create React App или Next.js

- **CRA** мёртв с 2023, не обновляется
- **Next.js** — overkill для сайта без SSR требований (наш SSR делается через Puppeteer prerender)
- **Vite** — быстрый dev server (мгновенный HMR), современная сборка через Rolldown/esbuild, простой config

### React 19 (latest)

- Concurrent features (useDeferredValue, useTransition)
- Лучшая поддержка Suspense
- React Compiler (опционально, не используем пока)

Trade-off: некоторые библиотеки ещё не объявили React 19 в peerDeps (например `react-helmet-async`, `vite-plugin-pwa` через workbox). Используем `--legacy-peer-deps` при `npm install` для обхода. Работает нормально.

### Zustand вместо Redux/MobX/Jotai

- Минимальный API: `create(set => ({...}))`
- Нет boilerplate как в Redux
- TypeScript-friendly из коробки
- Selectors для preventing re-renders
- ~3KB gzipped vs ~30KB Redux Toolkit

### idb (а не Dexie)

- Лёгкая обёртка (~10KB) над raw IndexedDB API
- Promise-based, async/await
- TypeScript types через generics
- Не имеет ORM-подобного API (это плюс — меньше магии)

Альтернативы:
- **Dexie** — полноценный ORM, ~70KB, имеет свой query language. Слишком тяжело для нашего use case.
- **localforage** — простой key-value, без индексов. Не подходит для query patterns.

### MapLibre GL вместо Google Maps / Mapbox

- **Google Maps:** платный (с 2018), требует API key, не контролируется
- **Mapbox:** платный, vendor lock-in
- **MapLibre GL:** open-source форк Mapbox GL JS до того как он стал closed-source. Бесплатный, можно serve свои tiles.

### PMTiles вместо vector tiles серверов

- Vector tiles обычно требуют tile server (TileServer GL, Tegola)
- PMTiles — один файл со всеми tiles, можно serve как статику через nginx
- Используем `pmtiles` JS library в браузере для чтения

### Framer Motion вместо CSS animations / react-spring

- Декларативный API (`<motion.div animate={{x: 100}}>`)
- Built-in `prefers-reduced-motion` респект
- Variants для shared animations
- Layout animations (`layoutId`)

### react-helmet-async вместо Next.js Head или React Helmet

- React Helmet (без async) deprecated и не работает с React 18+ Suspense
- `react-helmet-async` — fork с поддержкой Suspense, асинхронный rendering
- Один из немногих способов сделать dynamic meta tags для SEO в SPA

### Tailwind v4

- Новая версия с CSS-first подходом (`@tailwind` директивы → CSS variables)
- Лучшая интеграция с Vite через `@tailwindcss/vite` plugin
- В 5x быстрее v3 при build

### Lucide React (не Heroicons / FontAwesome)

- ~1500 иконок, MIT лицензия
- Tree-shakeable: импорты типа `import { MapPin } from 'lucide-react'` тащат только нужное
- Стилевая консистентность (все иконки в одном стиле)

## Что НЕ используется

Намеренно не включено:

- **Redux / Redux Toolkit** — слишком тяжело
- **Material UI / Ant Design** — кастомный дизайн через Tailwind
- **Axios** — `fetch` достаточно
- **Moment / date-fns** — для дат используем `Intl.DateTimeFormat`
- **Lodash** — современный JS покрывает всё
- **jQuery** — нет
- **Server-side фреймворк** — это SPA, prerender отдельным скриптом

## NPM Audit статус

**6 high vulnerabilities** (последний скан):
- 3 в `vite` 8.0.4 → закрыты в 8.0.5 (применено)
- 3 в `serialize-javascript` через `workbox-build` → `vite-plugin-pwa` chain. **Build-time only**, не в production. Фикс требует downgrade `vite-plugin-pwa@0.19.8` (breaking, потеря фич) — не делаем.

См. `06_security/known_issues.md` для деталей.

## Размеры бандла

После `vite build` (с tree-shaking, code splitting):

- `index-*.js` (main bundle): 332 KB raw → 105 KB gzipped
- `MapPage-*.js` (lazy chunk с MapLibre): 1043 KB raw → 279 KB gzipped (отдельный chunk, грузится только при /map)
- Total prerendered HTML: ~140 MB (189 страниц с inline meta + JSON-LD)

## Связь со стеком content site

`brobrogid.ru` (Astro) намеренно использует **другой стек**:
- Astro вместо React (для лучшего SEO через SSG)
- Tailwind тот же
- НЕТ Zustand, idb, MapLibre, framer-motion (не нужны для статики)
- ЕСТЬ `@supabase/supabase-js` (читает БД на build time)

## Related

- `data_flow.md` — как стек используется в data flow
- `prerender.md` — Puppeteer pipeline
- `pwa.md` — Service Worker, manifest
- `i18n.md` — i18next setup
- `../06_security/known_issues.md` — npm audit статус
