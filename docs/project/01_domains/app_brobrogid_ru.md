---
title: app.brobrogid.ru — React PWA
type: reference
audience: archimag, dev
owner: archimag
last_updated: 2026-04-07
---

# app.brobrogid.ru

## Что это

Интерактивное PWA-приложение для путешественников. Карта, избранное, админка, офлайн-работа, bilingual (ru/en). Историческое "первое воплощение" проекта, до того как появился Astro-сайт для SEO.

## Назначение

- **Карта** — интерактивная через MapLibre GL, все POI с категориями и фильтрами
- **Детальные POI страницы** — фото, часы, телефон, отзывы, рейтинг, "похожие места"
- **Меню ресторанов** — просмотр, добавление в корзину (stub для будущих онлайн-заказов)
- **Избранное** — сохранение POI через IndexedDB, работает offline
- **Админка** — CRUD интерфейс для управления контентом через IDB (Pool 4 мигрирует на Supabase API)
- **Туры и гиды** — просмотр, contact
- **Экстренные службы** — страница с телефонами и адресами
- **i18n** — переключение ru/en везде включая admin
- **PWA** — можно установить на телефон как приложение, работает без сети

## Что это НЕ

- ❌ Не индексируется в поисковиках (всегда `noindex` — это app, не content)
- ❌ Не основной публичный сайт (им является brobrogid.ru с Astro)
- ❌ Не имеет SEO оптимизации (есть prerender для скорости, но не для Google)

## Статус на 2026-04-07

**Живой, задеплоен на `https://app.brobrogid.ru`.**

- 189 prerendered страниц
- Админка работает, **но с захардкоженными паролями** (SENTINEL CRITICAL finding, Pool 4)
- Карта работает, но PMTiles пока пустые (нужны тайлы)
- i18n русский по умолчанию, английский full coverage
- PWA manifest, service worker работают
- Читает данные из JSON snapshots (`public/content/*.json`), не напрямую из Supabase

## Стек

| Технология | Версия | Назначение |
|---|---|---|
| **Vite** | 8.0.5 | Build tool |
| **React** | 19.2 | UI framework |
| **TypeScript** | 5.9 | Типизация |
| **Tailwind CSS** | 4.2 | Стили (через `@tailwindcss/vite`) |
| **React Router** | 7.13 | Routing + lazy loading |
| **Zustand** | 5.0 | State management |
| **idb** | 8.0 | IndexedDB wrapper |
| **@tanstack/react-query** | 5.95 | Data fetching (используется минимально) |
| **i18next + react-i18next** | 26/17 | Локализация |
| **MapLibre GL** | 5.21 | Интерактивная карта |
| **PMTiles** | 4.4 | Vector tiles formato |
| **Framer Motion** | 12.38 | Анимации |
| **Fuse.js** | 7.1 | Fuzzy search |
| **Lucide React** | 1.7 | Иконки |
| **react-helmet-async** | 2.0 | Meta tags (для SEO) |
| **vite-plugin-pwa** | 1.2 | Service worker generation |
| **Puppeteer** | 24+ | Prerender script (dev dependency) |
| **sharp** | 0.33 | Image WebP conversion (dev dependency) |
| **tsx** | 4+ | Run TS scripts (dev) |
| **pg** | 8+ | PostgreSQL client для импорта (dev) |
| **@supabase/supabase-js** | 2+ | Supabase SDK (установлен, не используется — Pool 4) |

## Структура проекта

Local path: `/home/cosmo/SOFT/COSMO/BROBROGID/`

```
├── src/
│   ├── main.tsx                          # Entry point
│   ├── app/
│   │   ├── App.tsx                       # Root component, routing, init
│   │   ├── router.tsx                    # React Router + lazy loading
│   │   └── layout/
│   │       └── AppShell.tsx              # Main layout (mobile bottom tabs)
│   │
│   ├── data/
│   │   ├── db.ts                         # IDB schema + getDB() singleton
│   │   ├── types/
│   │   │   └── index.ts                  # ВСЕ TypeScript types
│   │   └── stores/
│   │       ├── data-store.ts             # Main Zustand store (pois, tours, guides)
│   │       ├── order-store.ts            # Shopping cart
│   │       ├── toast-store.ts            # Toast notifications
│   │       └── ui-store.ts               # UI state (bottom sheet, tabs)
│   │
│   ├── features/                         # Feature-based organization
│   │   ├── explore/                      # Главная
│   │   ├── map/                          # Интерактивная карта MapLibre
│   │   ├── poi/                          # Детальные POI страницы
│   │   ├── tours/                        # Туры и гиды
│   │   ├── guides/                       # Профили гидов
│   │   ├── ordering/                     # Меню ресторанов + корзина
│   │   ├── search/                       # Поиск (Fuse.js)
│   │   ├── saved/                        # Избранное (collections)
│   │   ├── emergency/                    # Экстренные службы
│   │   ├── profile/                      # Профиль пользователя
│   │   ├── subscription/                 # Подписка (stub)
│   │   ├── onboarding/                   # Первый запуск
│   │   └── admin/                        # Админ-панель (CRUD)
│   │       ├── pages/                    # Список+форма для каждой сущности
│   │       ├── components/               # Shared form components
│   │       ├── hooks/
│   │       │   ├── useAdminData.ts       # Generic CRUD hook over IDB
│   │       │   └── useAdminExport.ts     # Export to JSON
│   │       ├── lib/
│   │       │   ├── admin-db.ts           # Raw IDB CRUD
│   │       │   └── auth.ts               # ⚠️ hardcoded creds — SENTINEL CRITICAL
│   │       └── ...
│   │
│   ├── shared/
│   │   ├── ui/                           # Переиспользуемые компоненты
│   │   │   ├── SEO.tsx                   # Meta tags (react-helmet-async)
│   │   │   ├── JsonLd.tsx                # JSON-LD structured data
│   │   │   ├── PageHeader.tsx
│   │   │   ├── POICard.tsx
│   │   │   └── ...
│   │   ├── lib/
│   │   │   ├── utils.ts                  # cn(), formatPrice(), CATEGORY_COLORS
│   │   │   └── seed.ts                   # JSON → IDB seeding logic
│   │   └── hooks/
│   │
│   └── i18n/
│       ├── index.ts                      # i18next config
│       └── locales/
│           ├── ru.json                   # Русский (основной)
│           └── en.json                   # English
│
├── public/
│   ├── content/                          # JSON snapshots из Supabase
│   │   ├── pois.json                     # 119 POI
│   │   ├── tours.json                    # 20 туров
│   │   ├── guides.json                   # 8 гидов
│   │   ├── reviews.json                  # 499 отзывов
│   │   ├── menu-items.json               # 275 пунктов меню
│   │   ├── emergency.json                # Экстренные (nested object, нужна нормализация)
│   │   └── transport.json                # Транспорт (nested object)
│   ├── images/
│   │   └── pois/
│   │       ├── *.jpg                     # Оригиналы
│   │       └── *.webp                    # Оптимизированные (generated)
│   ├── icons/                            # Favicons, app icons
│   ├── tiles/                            # PMTiles для карты (пока пустые)
│   ├── manifest.webmanifest              # PWA manifest
│   └── robots.txt                        # Disallow: /
│
├── scripts/
│   ├── prerender.ts                      # Puppeteer prerender (основной)
│   ├── generate-sitemap.ts               # Sitemap generation
│   └── optimize-images.ts                # sharp WebP conversion
│
├── supabase/                             # ⚠️ В этом репо, НЕ в brobrogid-site
│   ├── migrations/                       # Все SQL миграции
│   ├── docker-compose.yml                # Supabase stack конфиг
│   ├── nginx-api.conf                    # Nginx config для api.brobrogid.ru
│   ├── backup.sh                         # Backup скрипт
│   ├── .env.example                      # Шаблон секретов
│   └── scripts/
│       ├── import.ts                     # JSON → Supabase import
│       └── slug_migration_dry_run.ts     # Sprint 6 transliteration
│
├── dist/                                 # Build output (gitignored)
├── deploy.sh                             # Deploy скрипт (rsync на сервер)
├── vite.config.ts                        # Vite config (PWA, Tailwind)
├── tsconfig.*.json                       # TS configs
└── package.json
```

## Ключевые особенности

### Feature-based organization

Вместо `components/`, `pages/`, `hooks/` — папка на фичу. Внутри всё что нужно: страницы, компоненты, хуки, утилиты. Легче ориентироваться, изменения локализованы.

### Data flow: JSON → IDB → Zustand → React

1. При первом запуске `seed.ts` фетчит `/content/*.json` (7 файлов)
2. Нормализует `emergency.json` и `transport.json` (они приходят как nested objects)
3. Пишет в IDB stores через idb wrapper
4. Zustand `data-store.loadAll()` читает из IDB → кладёт в store
5. React компоненты подписываются через `useDataStore` hook

**Плюсы:** работает offline после первого визита, быстрый UI.

**Минусы:** snapshot может устареть, изменения в Supabase не видны без rebuild.

### Prerender через Puppeteer

Vite build → `dist/` с SPA (пустым HTML). Затем `scripts/prerender.ts`:

1. Запускает локальный HTTP сервер на `dist/`
2. Читает JSON из `dist/content/` для построения URL list
3. Puppeteer: headless Chromium, 5 параллельных tabs
4. Для каждого URL: `page.goto()` → `waitForFunction()` → `page.content()` → сохранить в `dist/{path}/index.html`
5. Итог: 189 prerendered HTML файлов для SEO и instant FCP

**Важно:** prerender использует JSON snapshots, не БД напрямую. Если данные меняются — надо перезапускать с обновлёнными JSON.

### Admin panel

Полноценный CMS в `src/features/admin/` — CRUD для всех сущностей через **IndexedDB**.

**Структура:** list-view для каждой сущности (AdminPOIList, AdminTourList, ...), form-view для create/edit (AdminPOIForm, ...).

**Текущая реализация проблемна:**
1. Hardcoded creds в `auth.ts` — рейнбоу-таблица ломает за секунды (SENTINEL CRITICAL)
2. Аутентификация только на клиенте — localStorage bypass
3. Данные правятся в IDB, не в Supabase — изменения не уходят на другие сайты
4. Экспорт в JSON вручную

**Pool 4 закроет все проблемы:** миграция на Supabase Auth + прямые Supabase API вызовы.

### i18n

Русский по умолчанию. Английский полный coverage всех фич включая админку. Переключение хранится в IDB `userPrefs.language`.

Структура локалей: `src/i18n/locales/{ru,en}.json` — nested объекты по секциям (`app`, `tabs`, `poi`, `search`, ...).

**Админка локализована отдельно** в namespace `admin.*` с ~230 ключами.

## Deploy

См. `../09_workflows/deploy.md`. Кратко:

```bash
cd /home/cosmo/SOFT/COSMO/BROBROGID
./deploy.sh    # vite build → prerender → sitemap → rsync → nginx reload
```

Занимает 3-5 минут.

## Known issues

1. **SENTINEL CRITICAL:** hardcoded admin credentials в `src/features/admin/lib/auth.ts` — любой посетитель может залогиниться как admin. Митигация: сайт под noindex, `/admin` не афишируется. **Фикс: Pool 4.**

2. **Данные устаревают:** JSON snapshots синхронизируются вручную через `scripts/import.ts` и прямое редактирование `public/content/*.json`. **Фикс: Pool 4 — чтение из Supabase.**

3. **PMTiles пустые:** карта загружается, но тайлы отсутствуют. Нужно сгенерировать/скачать тайлы для Осетии и положить в `public/tiles/`.

4. **i18n в OnboardingPage** — некоторые ключи могут быть не локализованы (edge case).

5. **Service worker кэш** — обновления контента могут не доходить до пользователей с закэшированной версией, пока SW не зарегистрируется заново.

## Related

- `../04_pwa_app/` — детальные разделы про PWA
- `../02_database/schema.md` — структура БД
- `../06_security/known_issues.md` — hardcoded creds finding
- `../09_workflows/deploy.md` — деплой
- `../10_history/timeline.md` — как этот app эволюционировал
