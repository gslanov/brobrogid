---
title: BROBROGID — Project Overview
type: overview
audience: all-agents
owner: archimag
last_updated: 2026-04-07
---

# BROBROGID — что это за проект

## Суть

**Путеводитель по Северному Кавказу** для русскоязычной аудитории, начинается с Северной Осетии, архитектурно готов к расширению на Кабардино-Балкарию, Дагестан, Чечню, Ингушетию, Карачаево-Черкессию.

## Для кого

**Первичная аудитория:** путешественники из Москвы и Санкт-Петербурга, планирующие поездку в Осетию. Топ ключевые запросы из семантического ядра (14 312 ключей):

- `москва владикавказ авиабилеты` — 3 079 точной частотности/мес
- `осетинские пироги` — 6 958 (плюс 15-20K вокруг темы)
- `погода во владикавказе` — 1 185
- `поезд москва владикавказ` — 913
- `владикавказ что посмотреть` — 374
- `туры в осетию` — 1 509
- `горы кавказа` — 7 007

**Вторичная:** москвичи, заказывающие осетинские пироги с доставкой (воронка в туризм).

## Цель

1. **Органический SEO-трафик** из Google и Яндекс — основной источник посещаемости
2. **Конверсия в бронирования туров** через форму с Supabase-интеграцией
3. **Источник авторитета** — быть референсом по Осетии у путешественников

## Не является

- ❌ Маркетплейсом (не продаёт туры от третьих лиц)
- ❌ Системой бронирования отелей (только перелинкует)
- ❌ Соцсетью (никаких user-generated content, кроме формы заявки)
- ❌ Блог-платформой для сторонних авторов

## Конкуренты и позиционирование

Основные конкуренты по SEO: Tripster.ru, Tourister.ru, Travelask.ru, сайты конкретных гидов. Наше преимущество — современный стек (Astro SSG = идеальный Lighthouse), фокус на один регион с глубоким покрытием, интеграция с реальной БД, честность в AI-контенте (бейджи на сгенерированных отзывах).

## Текущая стадия

**Pre-launch.** Техническая инфраструктура готова, первая волна контента написана, сайт закрыт от индексации. Ждёт: финальный review контента, решение об открытии индексации, Google Search Console / Yandex Webmaster setup, Pool 4 (миграция PWA на Supabase API).

## Команда агентов

Проект ведётся несколькими Claude-сессиями. Подробнее в `stakeholders.md`:

- **Archimag** — оркестратор, владеет `api.brobrogid.ru`, `app.brobrogid.ru`, инфраструктурой
- **Brobrogid-site agent** — владеет `brobrogid.ru`, контентом, SEO реализацией
- **SENTINEL, ARCHITECT** — security аудит (error.md)
- **TREVOZHNIY, DOTOSHNIY** — ревью брифингов
- **GITBOY** — git операции
- **AGENT-COUCH** — BOARD и координация

## Технический стек (краткий)

**Frontend (два сайта):**
- brobrogid.ru: Astro 5 + TypeScript + Tailwind + MDX + @supabase/supabase-js
- app.brobrogid.ru: Vite 8 + React 19 + TypeScript + Tailwind + Zustand + idb + i18next + MapLibre + Framer Motion + react-helmet-async

**Backend:** PostgreSQL 16 + PostgREST 12 + GoTrue 2 (self-hosted, Docker)

**Инфраструктура:** Selectel VPS (2vCPU, 4GB+4GB swap, 50GB), Nginx, Let's Encrypt, cron backups

**Code:** GitHub (`gslanov/brobrogid`, `gslanov/brobrogid-site`), rsync deploy, без CI/CD

## Ключевые ссылки

- Production: `https://brobrogid.ru`, `https://app.brobrogid.ru`, `https://api.brobrogid.ru`
- VPS: `87.228.33.68` (SSH ключ `/home/cosmo/.ssh/id_ed25519_selectel`)
- Local paths:
  - PWA: `/home/cosmo/SOFT/COSMO/BROBROGID/`
  - Content site: `/home/cosmo/SOFT/COSMO/BROBROGID_SITE/`
  - Research/SEO: `/home/cosmo/SOFT/COSMO/BROMARKET/`

## Related

- `architecture.md` — как три сайта взаимодействуют
- `glossary.md` — словарь терминов
- `stakeholders.md` — кто за что отвечает
- `../01_domains/README.md` — трёхдоменная модель
- `../10_history/timeline.md` — как проект развивался
