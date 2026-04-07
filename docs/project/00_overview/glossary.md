---
title: BROBROGID Glossary
type: reference
audience: all-agents
owner: archimag
last_updated: 2026-04-07
---

# Словарь терминов проекта

## Сущности данных

**POI** (Point of Interest) — точка интереса. Любое место на карте: ресторан, отель, водопад, ущелье, храм, музей, парк. В БД таблица `pois`. Каждая имеет 10 категорий: `attractions`, `food`, `accommodation`, `nature`, `culture`, `shopping`, `nightlife`, `transport`, `activities`, `practical`.

**Tour** — экскурсионный тур с гидом. В БД таблица `tours`. Имеет `guide_id` FK → `guides.id`. Содержит маршрут (`route` — массив координат), даты (`dates` — массив ISO строк), цену (`price` в RUB), тип (`type`: walking/driving/mixed), статус (`status`: recruiting/full/completed).

**Guide** — профессиональный гид. В БД таблица `guides`. Имеет биографию, языки, специализации. Туры привязаны через `tours.guide_id`.

**Review** — отзыв. **Полиморфный** — может относиться к POI, туру или гиду. Поля `target_type` (`poi`|`tour`|`guide`) + `target_id`. Флаг `is_generated` — true если AI-сгенерирован (все 499 текущих отзывов такие, в JSON-LD не включаются).

**Menu item** — пункт меню ресторана. Привязан к POI через `poi_id`. Только для POI с `category='food'` и `has_menu=true`.

**Emergency contact** — экстренная служба (полиция, скорая, больница, аптека, травмпункт).

**Transport route** — маршрут общественного транспорта (автобус, маршрутка, троллейбус) с остановками.

**Tour booking** — заявка на тур. Создаётся анонимно через форму на `brobrogid.ru`, сохраняется в `tour_bookings`. Имеет защиту от спама (4 слоя) и poll для админа через статус.

**Collection** — пользовательская коллекция POI (избранное). Только в `app.brobrogid.ru`, хранится в IndexedDB.

**Order** — заказ еды через ресторанное меню. Только в `app.brobrogid.ru`, в IDB. Платежи через СБП (не реализовано полностью, stub).

## Паттерны данных

**LocalizedText** — объект `{ ru: string, en: string }` для локализованных текстов. Используется в `pois.name`, `pois.description`, `tours.name` и т.д. В PostgreSQL хранится как JSONB.

**Location** — объект `{ lat: number, lng: number, address: LocalizedText }`. Координаты POI.

**Polymorphic reference** — паттерн `target_type` + `target_id` в таблице `reviews`. Не классический FK, нет автоматической каскадной целостности. Приходится проверять вручную.

**Slug** — URL-friendly идентификатор. Должен быть уникальным в рамках сущности. До Sprint 6 были английскими (`tsey-gorge`), теперь русские транслитерации (`tseyskoe-uschele`). Старые сохранены в `slug_legacy` для 301 редиректов.

**slug_legacy** — колонка в `pois` (добавлена в migration 0013). Хранит оригинальный slug для генерации 301 редиректов со старых URL на новые. Никогда не удаляется.

## Агенты

**Archimag** — главный оркестратор (эта сессия). Координирует работу, пишет миграции БД, управляет app.brobrogid.ru, делает deploy. Определён в `/home/cosmo/.claude/CLAUDE.md`.

**Brobrogid-site agent** — отдельная сессия Claude, владеет `brobrogid.ru` (контент-сайт на Astro). Живёт в `/home/cosmo/SOFT/COSMO/BROBROGID_SITE/`.

**SENTINEL / ARCHITECT / TREVOZHNIY / DOTOSHNIY** — специализированные агенты-ревьюеры. Определения в `/home/cosmo/.claude/agents/`. Не владеют кодом, только проверяют.

**GITBOY** — агент git операций. Не решает что коммитить — получает задачу от Archimag. Разбивает на логические коммиты, пишет conventional commit messages.

**AGENT-COUCH** — агент наблюдения. Следит за BOARD и COUCH_LOG, патчит CLAUDE.md с разрешения пользователя. Без памяти между вызовами — всё состояние в `.agent/BOARD.md`.

## Инструменты и стек

**Astro** — static site generator. Рендерит `.astro` файлы в HTML при build time. Использует `getStaticPaths()` для генерации страниц из данных. Поддерживает "islands" — точечные React/Vue/Svelte компоненты, если нужен интерактив.

**Vite** — build tool и dev server. Используется под Astro и React. Также содержит dev server с HMR.

**PostgREST** — автоматический REST API из PostgreSQL схемы. Публикует все таблицы как `/rest/v1/{table}` endpoints. Поддерживает фильтры, сортировку, пагинацию, joins. JWT-based auth через PostgreSQL roles (anon, authenticated, service_role).

**GoTrue** — Supabase auth service. Отвечает за регистрацию, логин, email confirmation, password reset, JWT выдачу. Работает с таблицей `auth.users`.

**RLS** (Row Level Security) — PostgreSQL механизм фильтрации строк на уровне БД. Политики написаны в SQL, проверяют `request.jwt.claims` для определения роли пользователя. Обеспечивают что anon может читать только публичные данные, admin может писать.

**SECURITY DEFINER** — атрибут PostgreSQL функции, при котором функция выполняется с правами владельца (обычно `postgres`) а не вызывающего. Используется для обхода RLS когда триггеру нужен доступ к защищённой таблице. **Опасно при неаккуратных правках** — может стать privilege escalation vector.

**idb** — лёгкая обёртка над IndexedDB API. Используется в `app.brobrogid.ru` для локального хранилища данных (pois, tours, etc.). Не путать с Dexie — это другая библиотека с похожими задачами.

**Zustand** — минималистичный state manager для React. Используется в `app.brobrogid.ru` вместо Redux.

**MapLibre GL** — open-source форк Mapbox GL JS. Интерактивная векторная карта в `app.brobrogid.ru`. Тайлы через PMTiles.

**PMTiles** — формат упакованных векторных тайлов в один файл. Служится как статика через nginx.

**Puppeteer** — headless Chrome. Используется в `scripts/prerender.ts` (app.brobrogid.ru) для обхода SPA и сохранения prerendered HTML.

**@supabase/supabase-js** — официальный JavaScript SDK для Supabase. Используется в `brobrogid.ru` (Astro build time). В `app.brobrogid.ru` пока не используется (Pool 4 добавит).

## Инфраструктура

**Selectel VPS** — российский хостинг. Сервер `87.228.33.68`, домен `brobrogid.ru` тоже там (DNS management через их панель).

**Nginx** — reverse proxy + static file server. Три server blocks: `brobrogid.ru`, `app.brobrogid.ru`, `api.brobrogid.ru`. SSL termination.

**Let's Encrypt / certbot** — бесплатные SSL сертификаты, auto-renewal каждые 90 дней.

**Docker Compose** — контейнеризация Supabase стека. Файл `/opt/supabase/docker-compose.yml` описывает 3 сервиса: postgres, postgrest, gotrue.

**SSH tunnel** — используется для прямого доступа к PostgreSQL (порт 5432 слушает только 127.0.0.1 на сервере). Локальные скрипты подключаются через `ssh -L 15432:127.0.0.1:5432`.

## Процессы

**Sprint** — режим работы проекта. Большие задачи делятся на спринты с брифингом, ревью (Trevozhniy + Dotoshniy), реализацией, повторным ревью, деплоем. См. CLAUDE.md.

**Briefing** — детальный план спринта в `.md` файле. Пишется оркестратором (Archimag или пользователь), проверяется ревьюерами, передаётся исполняющему агенту.

**dry run** — запуск скрипта/миграции без применения изменений. Используется в `supabase/scripts/slug_migration_dry_run.ts` — показывает что бы изменилось, сохраняет в `.agent/sprint6_dry_run.txt` для ручной верификации.

**Pool 4** — запланированная задача миграции `app.brobrogid.ru` с JSON snapshots на прямые Supabase API вызовы. Закроет technical debt и security finding про hardcoded admin creds. Не блокирует.

**Legacy slug** — старый английский slug POI, сохранённый в `slug_legacy` после Sprint 6. Используется для 301 редиректов.

**noindex** — режим когда сайт закрыт от поисковиков. Обеспечивается через `robots.txt: Disallow: /` + `<meta name="robots" content="noindex, nofollow">` + `X-Robots-Tag` header. Всегда включён для `app.brobrogid.ru`. Временно включён для `brobrogid.ru` до официального запуска.

**Prerender** — процесс превращения SPA в статический HTML при build time. В `app.brobrogid.ru` делается через Puppeteer. В `brobrogid.ru` — встроено в Astro SSG.

**Sitemap** — XML файл для поисковиков со списком URL. В brobrogid.ru генерится автоматически через `@astrojs/sitemap`, в app.brobrogid.ru через собственный `scripts/generate-sitemap.ts`.

## Безопасность

**honeypot** — невидимое поле в форме. Боты заполняют все поля, включая honeypot. Люди — нет. Если honeypot заполнен, форма отклоняется (или soft-fails с `status='spam'`).

**TOCTOU** (Time-Of-Check Time-Of-Use) — race condition где проверка и использование разделены во времени. Пример: "проверить что меньше 3 записей с этим телефоном → вставить запись". Если параллельно выполнить 100 раз — все проверки увидят < 3 и все 100 вставок пройдут. Фикс: `pg_advisory_xact_lock` сериализует по ключу.

**Honeypot soft-fail** — вместо того чтобы возвращать ошибку при заполненном honeypot (бот учится), молча записываем заявку со `status='spam'`. Бот думает что прошло, не адаптируется. Админ фильтрует по статусу.

**Phone enumeration** — атака где злоумышленник подбирает телефоны и по ошибке rate limit ("too many bookings from this phone") узнаёт какие уже в системе. Фикс: generic error `"Too many requests"` без раскрытия деталей.

**E-A-T** (Experience, Expertise, Authoritativeness, Trustworthiness) — метрика Google для оценки качества контента. Особенно для YMYL (Your Money Your Life) тематик. Требует: человеческий ревью, уникальные факты, отсутствие AI-маркеров, источники.

**YMYL** (Your Money Your Life) — категория контента где ошибки могут повлиять на жизнь, здоровье, финансы. Google строже к таким страницам. Путеводитель про горы Осетии — частично YMYL (безопасность в горах, климат).

## Related

- `README.md` — общий обзор проекта
- `architecture.md` — техническая архитектура
- `stakeholders.md` — кто за что отвечает
