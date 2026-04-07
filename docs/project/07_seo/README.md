---
title: SEO — section index
type: overview
audience: seo, content, brobrogid-site-agent
owner: TBD (SEO agent)
last_updated: 2026-04-07
stub: true
---

# 07_seo — SEO стратегия

> Эта секция **для SEO агентов и нового агента**. Archimag создал структуру и ключевой `launch_procedure.md` — остальное заполняется теми кто ведёт SEO работу.

## Заполнено

- **`launch_procedure.md`** — runbook открытия индексации. Готов.

## Stubs (требуют заполнения)

- `keyword_research.md` — **stub** — 14 312 ключей, 13 кластеров, топ-приоритеты. Источник: `/home/cosmo/SOFT/COSMO/BROMARKET/data/`
- `url_structure.md` — **stub** — почему выбрана структура `/ossetia/{category}/{slug}/`, rationale для разделения транспорта vs мест vs туров
- `meta_strategy.md` — **stub** — title формулы, description templates, OG теги, Twitter cards
- `json_ld_strategy.md` — **stub** — какие schema.org типы на каких страницах, как обрабатывать AggregateRating для is_generated reviews
- `sitemap.md` — **stub** — генерация, обновление, что попадает, что нет
- `robots_and_noindex.md` — **stub** — defense-in-depth стратегия (nginx + Astro + file)
- `sensitive_topics.md` — **stub** — Бодров/Кармадон, Беслан, древние аланы, осетинский язык. Было в `BRIEFING_sprint3.md`, нужно вынести сюда как постоянный reference

## Context для агента который это будет заполнять

**Уже сделано:**
- Собрано 14 312 ключей по Wordstat в `/home/cosmo/SOFT/COSMO/BROMARKET/data/`
- 13 кластеров: история_культура (580K суммарной частотности — но много мусора про актёров/ведущих "алан"), места (430K), другое (357K), еда_кухня (121K), транспорт (56K), ущелья_природа (55K), отдых_проживание (23K), туры (14K), погода_когда (13K), достопримечательности (3.8K), маршруты (3.3K), карты_навигация (2.9K), фото_видео (1.4K)
- Очищена "Алания Турция" — 268 ключей / 31K фейковой частотности удалены
- Sprint 1: 7 landing pages под топ конверсионные запросы
- Sprint 2-3: хабы городов, категории, туры, блог
- Sprint 6: русские slugs (критично для Yandex, важно для Google)

**Что решено:**
- Приоритет: русскоязычная аудитория (Москва, СПб → Владикавказ)
- Вторичная: московские пирожковые (15-20K кластер, воронка в туризм)
- Оба сайта под noindex до завершения контента

**Open questions (для будущего SEO агента):**
- Нужна ли английская версия (hreflang)? Сейчас решили нет.
- Когда добавлять Кабардино-Балкарию, Дагестан? После стабилизации осетинской части.
- Структурирование блога: категории vs теги vs хронология?
- Стратегия внутренней перелинковки между спринтами

## Related

- `../03_content_site/seo.md` — техническая реализация в Astro
- `../04_pwa_app/seo.md` — SEO для PWA (минимальная важность)
- `launch_procedure.md` — открытие индексации (готов)
- `/home/cosmo/SOFT/COSMO/BROMARKET/ossetia-structure.md` — целевая структура (source of truth для URL)
