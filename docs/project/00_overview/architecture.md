---
title: Architecture — три сайта на одной базе
type: overview
audience: all-agents
owner: archimag
last_updated: 2026-04-07
---

# Архитектура проекта

## Общая картина

Три независимых сервиса, одна БД. Каждый сайт решает свою задачу, данные — единый источник истины.

```
                    ┌─────────────────────────────┐
                    │   api.brobrogid.ru          │
                    │   (Supabase self-hosted)    │
                    │                             │
                    │   PostgreSQL 16 + PostgREST │
                    │   + GoTrue (auth)           │
                    │                             │
                    │   Tables: pois, tours,      │
                    │   guides, reviews,          │
                    │   menu_items, tour_bookings │
                    │   + emergency, transport    │
                    └──────┬─────────────┬────────┘
                           │             │
           read at build   │             │  read at build
                           ↓             ↓
              ┌────────────────┐  ┌────────────────────┐
              │ brobrogid.ru   │  │ app.brobrogid.ru   │
              │                │  │                    │
              │ Astro SSG      │  │ React 19 + Vite 8  │
              │ TypeScript     │  │ TypeScript         │
              │ Tailwind       │  │ Tailwind           │
              │ MDX            │  │ Zustand + idb      │
              │                │  │ MapLibre GL        │
              │ Purpose: SEO   │  │ i18next            │
              │ content site   │  │ Puppeteer prerender│
              │                │  │                    │
              │ 252 pages      │  │ 189 pages          │
              │ noindex (pre-  │  │ noindex (always,   │
              │  launch)       │  │  это app не SEO)    │
              │                │  │                    │
              │ Purpose:       │  │ Purpose: interactive│
              │ organic traffic│  │ PWA, admin, maps,  │
              │ from search    │  │ offline, forms     │
              └────────────────┘  └────────────────────┘
                       │                     │
                       └──────────┬──────────┘
                                  │
                       ┌──────────┴──────────┐
                       │ Selectel VPS        │
                       │ 87.228.33.68        │
                       │                     │
                       │ Nginx (3 vhosts)    │
                       │ Let's Encrypt SSL   │
                       │ Docker Compose      │
                       │ Cron backup         │
                       └─────────────────────┘
```

## Поток данных

### Единый источник истины — Supabase

Все содержательные данные живут **только в Supabase**:

- POI (точки интереса) — достопримечательности, рестораны, отели, природа, культура
- Tours — готовые экскурсионные туры с привязкой к гидам
- Guides — профили гидов
- Reviews — отзывы, полиморфные (target_type + target_id)
- Menu items — пункты меню ресторанов
- Emergency contacts — экстренные службы
- Transport routes — маршруты общественного транспорта
- Tour bookings — заявки на туры (создаются анонимно через форму, читает админ)

### Как каждый сайт получает данные

**brobrogid.ru (Astro SSG):**

1. При `npm run build` — Astro `getStaticPaths()` делает запрос к `https://api.brobrogid.ru/rest/v1/pois` (и другим таблицам)
2. Для каждого POI строится статический HTML файл через Astro шаблоны
3. Итог: `dist/ossetia/mesta/.../{slug}/index.html` — полноценный HTML с мета-тегами, JSON-LD, контентом
4. rsync копирует `dist/` на `/var/www/brobrogid-site/`
5. Nginx отдаёт статику

**Следствие:** изменения в БД попадают на brobrogid.ru только при новом rebuild.

**app.brobrogid.ru (React PWA):**

Исторически сложился другой pattern — через JSON snapshots:

1. Данные в БД экспортируются в `public/content/*.json` (сейчас вручную — Pool 4 закроет это)
2. Vite build копирует JSON в `dist/content/`
3. Puppeteer prerender script обходит 189 URL, читает JSON на лету, генерит prerendered HTML
4. Runtime: React seed.ts при первой загрузке фетчит JSON, кладёт в IndexedDB (idb library)
5. Zustand stores читают из IDB, компоненты рендерят

**Следствие:** изменения в БД → нужно (вручную) переэкспортировать JSON → rebuild → deploy. Pool 4 закроет этот technical debt миграцией на `@supabase/supabase-js` напрямую.

### Что общего

- Одни и те же типы данных (описаны в `05_data_model/`)
- Одна схема Supabase
- Оба сайта хостятся на одном VPS
- Оба закрыты от индексации до официального запуска

### В чём различаются

| Аспект | brobrogid.ru | app.brobrogid.ru |
|---|---|---|
| **Назначение** | SEO-контент | Интерактивное приложение |
| **Стек** | Astro SSG | React SPA + PWA |
| **Где владелец** | новый агент | archimag |
| **Репозиторий** | `gslanov/brobrogid-site` | `gslanov/brobrogid` |
| **Локально** | `/home/cosmo/SOFT/COSMO/BROBROGID_SITE/` | `/home/cosmo/SOFT/COSMO/BROBROGID/` |
| **Директория на сервере** | `/var/www/brobrogid-site/` | `/var/www/brobrogid-app/` |
| **URL паттерн POI** | `/ossetia/mesta/{category}/{slug}/` | `/poi/{id}` (ID-based, не slug-based) |
| **Источник данных** | Supabase напрямую (SSG build) | JSON snapshot → IDB |
| **Интерактив** | минимум, vanilla JS | полный, React state, карта MapLibre |
| **Admin panel** | нет (админ через Supabase Studio/API) | есть (`/admin/`, CRUD через IDB) |
| **i18n** | только ru (сейчас) | ru + en |
| **Service Worker** | нет | да (Vite PWA plugin) |

## Почему такое разделение

Исторически было одно приложение — React PWA. Выяснилось:

1. **SEO для SPA плохой** — Google видит пустой `<div id="root">`, контент приходит через JS
2. **Prerender Puppeteer — workaround**, не решение: медленный билд, не все боты выполняют JS правильно
3. **Контент-сайт и интерактивное приложение — разные задачи** со слишком разными приоритетами (SEO vs UX)

Решили **разделить**:
- Новый Astro сайт получает SEO-приоритет, статический HTML без JS
- Старый React сайт остаётся как интерактивный app для тех кто любит карту, PWA, офлайн
- Общая БД — единый источник истины

## Что это даёт

1. **Best-in-class SEO** — Astro SSG + Tailwind + real HTML → Lighthouse 95+ из коробки
2. **Независимые deploy** — падение одного сайта не влияет на другой
3. **Разные агенты** могут параллельно работать — не мешают друг другу
4. **Постепенная миграция** — можно убить старый React app когда Astro полностью покроет функциональность (или оставить как interactive app forever)

## Что это стоит

1. **Дублирование работы** — некоторые компоненты (карточки POI, звёзды) написаны дважды
2. **Синхронизация данных** — нужно следить чтобы оба сайта видели одни и те же данные
3. **Два git репо** — коммитов больше, PR отдельные
4. **Координация агентов** — через пользователя как переводчик (нет прямого A→B канала)

## Критические зависимости

1. **Если упадёт Supabase** → brobrogid.ru продолжит работать (статика уже задеплоена), но rebuild будет невозможен. `app.brobrogid.ru` не заметит (читает JSON snapshot).

2. **Если упадёт nginx** → оба сайта + API недоступны. certbot не сможет продлить SSL → cascading failure через 90 дней.

3. **Если упадёт Docker** → Supabase недоступен. brobrogid.ru — деградация как выше. app.brobrogid.ru — не замечает (JSON snapshot).

4. **Если сломается rebuild нового агента** → brobrogid.ru застывает в последнем рабочем состоянии. Пользователи продолжают видеть старый контент.

5. **Если сломается миграция БД без backup** → смотри `09_workflows/rollback.md`. Всегда есть backup от 3:00 UTC + один вручную перед каждой миграцией.

## Сценарии изменений

### Админ редактирует POI

1. Админ заходит в Supabase Studio (или использует future admin UI)
2. UPDATE в таблице `pois`
3. **brobrogid.ru не видит сразу** — нужен rebuild
4. Архимаг (или cron в будущем) запускает `./deploy.sh` у нового агента
5. ~5 минут билд, rsync, через ~5 минут новая версия на проде

### Пользователь оставляет заявку на тур

1. Пользователь заполняет форму на `brobrogid.ru/ossetia/tury-ekskursii/{slug}/`
2. JS island отправляет POST на `api.brobrogid.ru/rest/v1/tour_bookings`
3. Проходит 4 слоя защиты: nginx rate limit + CHECK constraints + honeypot trigger + rate-limit trigger
4. INSERT в таблицу `tour_bookings` со `status='new'`
5. Админ видит заявку через Supabase Studio или admin UI
6. Опционально: Telegram-бот в будущем присылает уведомление

### Админ добавляет нового POI

1. INSERT в `pois` (Supabase Studio или скрипт)
2. Нужны все required поля: `id`, `slug`, `name` (JSONB `{ru,en}`), `category`, `location`, `description` (JSONB с short/medium/full)
3. Новый slug — автоматически транслит (использовать `supabase/scripts/slug_migration_dry_run.ts` как reference)
4. Фото кладутся в `public/images/pois/{slug}.jpg` в обоих репо (дублируем!) + создать webp через `scripts/optimize-images.ts`
5. Rebuild обоих сайтов
6. Deploy

**Проблема:** фото дублируются в двух репо. Pool 4 решит — будем хранить в Supabase Storage или CDN.

## Related

- `../01_domains/README.md` — детальное описание каждого домена
- `../02_database/schema.md` — структура БД
- `../04_pwa_app/data_flow.md` — JSON snapshot pattern в деталях
- `../03_content_site/data_flow.md` — Supabase SDK pattern в Astro
- `../09_workflows/deploy.md` — как разворачивать изменения
