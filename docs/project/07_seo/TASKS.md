---
title: SEO Documentation — Tasks for SEO agent
type: tasks
audience: seo-agent
owner: archimag (тaskwriter), filled-by: SEO agent
last_updated: 2026-04-07
priority: HIGH
---

# 📋 SEO Documentation — задания для SEO агента

**Кому:** SEO агент (или любой агент с экспертизой в SEO)
**Что нужно:** заполнить 7 файлов в `docs/project/07_seo/`
**Источники:** все материалы перечислены в каждой задаче
**Формат ответа:** Markdown файлы по template из `docs/project/CONTRIBUTING.md`

## Как работать с этим файлом

1. Прочитай этот файл целиком — поймёшь scope
2. Прочитай `docs/project/CONTRIBUTING.md` — правила формата
3. Прочитай `docs/project/README.md` — навигация
4. Прочитай `docs/project/00_overview/README.md` + `architecture.md` — контекст проекта
5. Бери задачи в порядке приоритета (1 → 7)
6. Каждую задачу делай как **один markdown файл** в `07_seo/`
7. Не меняй другие файлы документации без согласования

## Источники данных

Все эти файлы существуют, прочитай прежде чем писать:

- **Семантическое ядро:** `/home/cosmo/SOFT/COSMO/BROMARKET/data/clusters_filtered.json` (13 кластеров, ~14K ключей после очистки)
- **Wordstat данные:** `/home/cosmo/SOFT/COSMO/BROMARKET/data/wordstat_searchvolume.json`
- **Целевая структура сайта:** `/home/cosmo/SOFT/COSMO/BROMARKET/ossetia-structure.md` — спека URL-иерархии
- **Брифинги спринтов:** `/home/cosmo/SOFT/COSMO/BROMARKET/BRIEFING_sprint{1,2,3,6,reviews_widget,sprint6_russian_slugs}.md`
- **SEO аудит:** `/home/cosmo/SOFT/COSMO/BROMARKET/SEO/SEO_AUDIT_brobrogid.md` (от 2026-04-06)
- **Backup кластеров до очистки:** `clusters_filtered.backup_20260407.json`
- **Live сайт:** `https://brobrogid.ru` (под noindex, читай через curl)
- **PostgreSQL API:** `https://api.brobrogid.ru/rest/v1/pois?select=...` (anon key в `.agent/ADMIN_CREDENTIALS.md` если есть доступ к репо BROBROGID)

## Важные ограничения

- ❌ **НЕ открывай индексацию.** Все файлы пишутся в режиме "сайт под noindex". Любые рекомендации про launch — только в `launch_procedure.md` (он уже готов).
- ❌ **НЕ предлагай менять URL структуру.** Sprint 6 уже завершён, slugs русские. Документируй как есть.
- ❌ **НЕ предлагай Pool 4** или другие архитектурные изменения. Документируй текущее состояние.
- ❌ **НЕ дублируй контент** между файлами. Если тема пересекается — link, не copy-paste.
- ✅ **Используй конкретные числа** из реальных данных, не "приблизительно" и не выдумывай.
- ✅ **Каждый файл self-contained** — понятен в отрыве от других.
- ✅ **YAML frontmatter обязателен** на каждом файле.

---

## Список задач (по приоритету)

| # | Файл | Приоритет | Время | Сложность |
|---|---|---|---|---|
| 1 | `keyword_research.md` | 🔴 КРИТ | 2-3 часа | средняя |
| 2 | `url_structure.md` | 🔴 КРИТ | 1-2 часа | низкая |
| 3 | `meta_strategy.md` | 🟡 ВЫСОКО | 1-2 часа | средняя |
| 4 | `json_ld_strategy.md` | 🟡 ВЫСОКО | 2-3 часа | средняя |
| 5 | `sitemap.md` | 🟢 СРЕДНЕ | 30 мин | низкая |
| 6 | `robots_and_noindex.md` | 🟢 СРЕДНЕ | 30 мин | низкая |
| 7 | `sensitive_topics.md` | 🟢 СРЕДНЕ | 1 час | низкая |

**Общая оценка:** 1 рабочий день (8-10 часов) на все 7 файлов.

---

## Задача 1: keyword_research.md

**Статус:** stub в `07_seo/keyword_research.md`
**Что писать:** см. инструкцию внутри stub файла
**Источник:** `/home/cosmo/SOFT/COSMO/BROMARKET/data/clusters_filtered.json` + SEO_AUDIT
**Deliverable:** ~1500 слов, таблицы с топ-кластерами и приоритетами

## Задача 2: url_structure.md

**Источник:** `ossetia-structure.md` + актуальные URL на проде через `curl https://brobrogid.ru/sitemap-0.xml`
**Deliverable:** документация URL hierarchy с rationale

## Задача 3: meta_strategy.md

**Источник:** живые HTML страницы через `curl`, посмотреть какие title/description сейчас используются
**Deliverable:** формулы для title/description, character limits

## Задача 4: json_ld_strategy.md

**Источник:** `curl https://brobrogid.ru/ossetia/.../<page>/` и поиск `<script type="application/ld+json">`
**Deliverable:** реестр schema.org типов на каждой странице, объяснение выбора

## Задача 5: sitemap.md

**Источник:** `https://brobrogid.ru/sitemap-index.xml` и `sitemap-0.xml`
**Deliverable:** документация sitemap pipeline

## Задача 6: robots_and_noindex.md

**Источник:** `curl https://brobrogid.ru/robots.txt`, `curl -I https://brobrogid.ru/`, конфиги nginx (через ssh archimag)
**Deliverable:** documentation 4-layer noindex defense

## Задача 7: sensitive_topics.md

**Источник:** `BRIEFING_sprint3.md` (раздел 18 — sensitive topics)
**Deliverable:** перевести в постоянный reference (вынести из ephemeral брифа в постоянную доку)

---

## После завершения

Когда все 7 файлов готовы:

1. Обнови `07_seo/README.md` — убери "stub" пометки
2. Обнови `07_seo/README.md` `last_updated`
3. Сообщи archimag (через пользователя) — "SEO документация готова, проверь"
4. archimag прогонит TREVOZHNIY + DOTOSHNIY на полноту
5. Если есть замечания — фиксы
6. GitBoy коммит "docs(seo): fill out 07_seo section"
7. Push

## Координация со мной (archimag)

Если что-то неясно или нужны дополнительные данные — напиши через пользователя:

- **Нужны данные из БД** — могу запросить через Supabase API
- **Нужны конфиги nginx** — могу прочитать на сервере
- **Нужно посмотреть пререндеренные HTML** — могу curl оттуда
- **Нужны актуальные числа из БД** — могу выгрузить
- **Брифинг спринта потерян** — у меня есть копии

## Гайдлайны качества

**Хорошо:**
- "Кластер 'осетинские пироги' содержит 1657 ключей с суммарной частотностью 121 396 показов/мес. Топ-запрос — 'осетинские пироги' с 6 958 точной частотности."
- "URL `/ossetia/mesta/ushchelya/tseyskoe-uschele/` соответствует POI с slug `tseyskoe-uschele` (был `tsey-gorge` до Sprint 6, легаси сохранён в `pois.slug_legacy` для 301 редиректов)."
- "Title формула: `{poi.name.ru} — {category_label} в Северной Осетии | BROBROGID`. Пример: 'Цейское ущелье — Природа в Северной Осетии | BROBROGID'. Длина 45-60 символов оптимально."

**Плохо:**
- "Кластер пирогов очень популярный, много запросов" (без чисел)
- "URL структура русская, понятная" (без объяснения почему именно так)
- "Title должен быть привлекательным и содержать ключевые слова" (без конкретики)

## Финальные критерии успеха

- [ ] 7 файлов в `07_seo/` написаны
- [ ] Каждый файл 500-2000 слов
- [ ] YAML frontmatter везде заполнен
- [ ] Cross-references работают (`[link](path.md)`)
- [ ] Никаких stub-pomeток
- [ ] Конкретные числа везде где можно (не приблизительные)
- [ ] Все 7 файлов внутренне согласованы (одни и те же цифры, одни и те же URL)
- [ ] README.md в `07_seo/` обновлён, ссылается на готовые файлы
