---
title: Domains — три сайта проекта
type: overview
audience: all-agents
owner: archimag
last_updated: 2026-04-07
---

# Три домена

Проект имеет три независимых сервиса на одном сервере, каждый со своей задачей.

| Домен | Тип | Назначение | Стек | Владелец | Индексация |
|---|---|---|---|---|---|
| **brobrogid.ru** | SSG | Контент-сайт для SEO | Astro + TypeScript + Tailwind + MDX | brobrogid-site agent | сейчас noindex, откроется при запуске |
| **app.brobrogid.ru** | PWA | Интерактивное приложение, карта, админка | Vite + React 19 + Zustand + MapLibre | archimag | всегда noindex (app, не SEO) |
| **api.brobrogid.ru** | API | Supabase self-hosted | PostgreSQL + PostgREST + GoTrue | archimag | noindex (не страница) |

Все три живут на Selectel VPS `87.228.33.68`. Разделяются через nginx server blocks по `server_name`.

## Почему три отдельных сайта

**Не:** один React SPA который делает всё.
**Почему:** SEO для SPA плохой (bots видят пустой div), а контент-сайту важен SEO на 100%.

**Не:** Astro с интерактивными островами для всего.
**Почему:** карта, админка, оффлайн-работа, PWA — слишком тяжёлый интерактив для Astro islands философии. Проще оставить React PWA как отдельный app.

**Не:** два React сайта с SSR через Next.js.
**Почему:** Next.js тяжелее Astro, больше конфигурации, SSR требует Node-сервер (не просто nginx статику).

**Решение:** Astro для контента (идеален), React PWA для app (уже был, работает), общая БД.

## Поток данных между сайтами

```
                Supabase (api.brobrogid.ru)
                        ▲
                        │ (shared data)
                        │
        ┌───────────────┴───────────────┐
        │                               │
  brobrogid.ru                    app.brobrogid.ru
  (at build time)                 (at build time,
                                   через JSON snapshot)
```

См. `../00_overview/architecture.md` для деталей.

## Файлы

- `brobrogid_ru.md` — про контент-сайт (заполняется новым агентом)
- `app_brobrogid_ru.md` — про PWA
- `api_brobrogid_ru.md` — про API (краткий обзор, детали в `02_database/`)
