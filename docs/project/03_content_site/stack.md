---
title: brobrogid.ru — Stack Reference
type: reference
audience: dev
owner: brobrogid-site-agent
last_updated: 2026-04-07
---

# Stack

## Что это

Полный список зависимостей `brobrogid.ru` с версиями (на момент 2026-04-07) и обоснованием каждого выбора. Стек умышленно минимальный — каждое добавление обсуждается.

## Основные зависимости

| Пакет | Версия | Зачем |
|---|---|---|
| `astro` | 5.18.1 | SSG framework. Поднят с 4.x потому что в `^4.16` была HIGH advisory `GHSA-whqg-ppgf-wp8c` (Auth Bypass via Double URL Encoding). Astro 5.x — стабильный LTS-эквивалент со 100% покрытием нужных API. |
| `@astrojs/mdx` | ^4.3.14 | MDX renderer для блог-статей. Фронтматтер с zod schema, контент в Markdown + JSX. |
| `@astrojs/sitemap` | ^3.7.2 | Авто-генерация sitemap из всех страниц. Кастомизирован через `serialize` callback (lastmod/priority/changefreq). Filter исключает `preview-a/`, `preview-b/`. |
| `@astrojs/tailwind` | ^6.0.2 | Tailwind интеграция. Tailwind 3 (НЕ 4 — несовместимо с Astro 5 без `@tailwindcss/vite`). |
| `@astrojs/check` | ^0.9.8 | TypeScript validation для `.astro` файлов. Запускается через `npm run check`. |
| `@astrojs/rss` | ^4.0.18 | Зарезервирован для блог RSS feed (не используется в текущем sprint). |
| `tailwindcss` | ^3.4.x | CSS framework. Кастомизация через `tailwind.config.mjs`: цвета `mountain` (горы), `sky`, `autumn`. Шрифты Inter (sans) и Manrope (display). |
| `@tailwindcss/typography` | ^0.5.x | Plugin для prose классов в MDX/Markdown контенте. Используется в `LandingLayout`/`BlogLayout`. |
| `@supabase/supabase-js` | ^2.x | PostgREST client. ИСПОЛЬЗУЕТСЯ ТОЛЬКО на build-time через `src/lib/supabase.ts`. См. [`data_flow.md`](data_flow.md). |
| `sharp` | ^0.34.x | Image processing для Astro `<Image>`. Astro 5 требует sharp как peer. |
| `typescript` | ^5.x | Strict mode, path aliases. Конфиг в `tsconfig.json`. |

## Что НЕ установлено и почему

Принципиально отсутствуют:

- **`@astrojs/react`, `@astrojs/svelte`, `@astrojs/vue`, `@astrojs/preact`** — никаких framework integrations. Решение принято в начале проекта чтобы сохранить философию "Astro островки только когда реально нужно". Каждая интеграция добавляет 30-60 KB к bundle и мысленный overhead.

- **`@astrojs/image`** — отдельный пакет, заменён built-in `astro:assets` (Astro 5).

- **`vitest`, `@testing-library`** — нет unit-тестов на компоненты. Контент-сайт SSG, основной "тест" — Lighthouse + ручной curl-проверка после deploy. Tradeoff осознан.

- **`prettier`** — форматирование делается через VS Code/IDE, не через CI hook.

## Почему vanilla JS без framework

Главная причина — booking форма + reviews widget — единственные интерактивные элементы. Они **прекрасно реализуются на vanilla**:

- **Booking форма** — `<form>` с inline `<script>` который делает `fetch()` к PostgREST. ~100 строк JS, ноль зависимостей. См. `src/components/content/BookingForm.astro`.
- **Reviews widget** — server-rendered grid из ВСЕХ отзывов в DOM (первые 6 видимы, остальные `display:none` через class). Vanilla `<script>` с `classList.remove()` для "Показать все" + "Читать дальше" toggle. См. `src/components/reviews/ReviewsWidget.astro`.

Если бы я добавил React ради этого — получил бы:
- +40 KB на каждую страницу с виджетом
- React island setup
- Hydration latency
- Дополнительная mental load для каждого следующего агента

Решение: vanilla. Если когда-то потребуется реальный сложный SPA-компонент (например, интерактивная карта с MapLibre + кластеризацией) — добавим **только тогда** и **только нужный framework**.

## Конфигурационные файлы

| Файл | Что определяет |
|---|---|
| `astro.config.mjs` | Site URL (`process.env.PUBLIC_SITE_URL`), integrations (tailwind, mdx, sitemap), `image.domains: ['app.brobrogid.ru']`, sitemap serialize callback с lastmod/priority/changefreq |
| `tailwind.config.mjs` | Theme tokens (mountain/sky/autumn colors, Inter/Manrope fonts, container settings), `@tailwindcss/typography` plugin |
| `tsconfig.json` | Strict mode, extends `astro/tsconfigs/strict`, path aliases для `@/components/*`, `@/layouts/*`, `@/lib/*`, `@/data/*`, `@/utils/*`, `@/styles/*` |
| `src/content.config.ts` | Astro 5 content collection schema для `blog` (zod): title, description, date, updatedAt, image, imageAlt, author, related[], tags[], faqItems[] |
| `package.json` | Scripts: `dev`, `build`, `preview`, `check`, `deploy` (вызывает `scripts/deploy.sh`) |
| `.env` | `PUBLIC_SUPABASE_URL`, `PUBLIC_SUPABASE_ANON_KEY`, `PUBLIC_SITE_URL`, `PUBLIC_IMAGE_BASE_URL`. Только PUBLIC_ префикс — гарантирует что Vite может инлайнить в браузерный bundle. |
| `.env.example` | Template без секретов, для документации. |
| `.gitignore` | `node_modules/`, `dist/`, `.env`, `.env.*` (с `!.env.example`), `.astro/`, `.claude/`, `.agent/`, `scripts/expand-*.sh` |

## Build artifacts

```
brobrogid-site/
├── dist/                   ← target директория, full HTML
│   ├── index.html
│   ├── ossetia/...
│   ├── _astro/             ← hashed JS/CSS bundles (1y cache)
│   ├── og-default.jpg      ← OG fallback image (1200×630)
│   ├── robots.txt          ← dynamic из endpoint, синхронизирован с SITE_UNDER_CONSTRUCTION
│   ├── sitemap-index.xml
│   ├── sitemap-0.xml       ← 246 URL
│   └── 404.html            ← brand-styled
├── node_modules/
├── public/                 ← static assets копируются в dist/ as-is
│   ├── favicon.svg
│   └── og-default.jpg
└── src/
    ├── pages/              ← роуты Astro
    ├── content/blog/       ← MDX блог-статьи
    ├── content.config.ts
    ├── layouts/
    ├── components/
    ├── lib/
    ├── utils/
    ├── data/
    └── styles/
```

## Версии — как обновлять

- **Astro минорные версии** — обновлять без раздумий когда выходят, проверять `npm run build` после
- **Astro мажорные** — читать changelog, готовиться к breaking changes (Astro 5→6 потребует переход на `@tailwindcss/vite` и Tailwind 4)
- **Supabase JS** — обновлять регулярно, простой API, breaking changes редкие
- **Tailwind 3.x** — пока не апдейтить до 4.x (несовместимо с `@astrojs/tailwind`, нужна миграция)
- **`@astrojs/check`** — следить за warnings, на момент 2026-04-07 есть 12 предексистующих hints (нерелевантные)

## npm audit

`npm audit --audit-level=high` — должно возвращать 0 HIGH/CRITICAL. На момент 2026-04-07 есть 5 moderate в `yaml-language-server` (dev-only chain через `@astrojs/check`), не блокеры.

Известный TODO: `vite ≤ 6.4.1` имеет 2 HIGH CVE (Path Traversal в Optimized Deps, WebSocket dev server file read) — фиксится через `npm audit fix` без `--force`. Только dev-time, prod не затронут.

## Related

- [`routing.md`](routing.md) — как эти технологии используются для построения URL
- [`data_flow.md`](data_flow.md) — где Supabase используется
- [`seo.md`](seo.md) — Tailwind + JSON-LD + sitemap в действии
- [`deploy.md`](deploy.md) — как build артефакты деплоятся
- [`../06_security/secrets_management.md`](../06_security/secrets_management.md) — почему только PUBLIC_ env vars
