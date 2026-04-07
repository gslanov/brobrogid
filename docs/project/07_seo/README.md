---
title: SEO — section index
type: overview
audience: seo, content, brobrogid-site-agent
owner: archimag (taskwriter), to be filled by SEO agent
last_updated: 2026-04-07
---

# 07_seo — SEO стратегия

## Статус заполнения

| Файл | Статус | Кто заполняет |
|---|---|---|
| `README.md` | ✅ ты здесь | archimag |
| `TASKS.md` | ✅ готов | archimag (master task list) |
| `launch_procedure.md` | ✅ готов | archimag |
| `keyword_research.md` | 🔴 stub (priority 1) | SEO agent |
| `url_structure.md` | 🔴 stub (priority 2) | SEO agent |
| `meta_strategy.md` | 🟡 stub (priority 3) | SEO agent |
| `json_ld_strategy.md` | 🟡 stub (priority 4) | SEO agent |
| `sitemap.md` | 🟢 stub (priority 5) | SEO agent |
| `robots_and_noindex.md` | 🟢 stub (priority 6) | SEO agent |
| `sensitive_topics.md` | 🟢 stub (priority 7) | SEO agent |

## Для SEO агента

**Стартовая точка:** прочитай `TASKS.md` — там полный план работ с приоритетами, источниками данных, deliverables и правилами.

Каждый stub файл содержит свою задачу с конкретной структурой документа который нужно написать. Нельзя ошибиться — всё разжёвано.

**Порядок работы:**
1. Прочти `TASKS.md`
2. Прочти `docs/project/CONTRIBUTING.md` (правила формата)
3. Прочти `docs/project/00_overview/{README,architecture}.md` (контекст)
4. Бери задачи в порядке приоритета (1 → 7)
5. После каждого файла — обнови `TASKS.md` (отметь как done) + этот README

## Готовые материалы

Эти 3 файла уже написаны и можно использовать как reference:

### `TASKS.md`

Master task list. Источники данных, приоритеты, deliverables, координация с archimag.

### `launch_procedure.md`

Полный runbook открытия индексации. Описаны все 4 уровня noindex защиты, как снимать атомарно, что делать после, как rollback.

**КРИТИЧНО:** не запускать до сигнала пользователя. Сейчас сайт под noindex.

## Что НЕ должен делать SEO агент

- ❌ Открывать индексацию (это решение пользователя + отдельная процедура)
- ❌ Менять URL структуру (Sprint 6 завершён, slugs русские)
- ❌ Предлагать архитектурные изменения (Pool 4 и т.д. — отдельная зона)
- ❌ Дублировать контент между файлами
- ❌ Выдумывать числа (запускай curl + Python для реальных)
- ❌ Удалять stubs других файлов (только своих)

## Координация с archimag

Если нужно:
- Данные из БД → запросить через пользователя
- Конфиги nginx → запросить
- Текущие HTML страницы → curl сам, но если нужен SSH доступ → запросить
- Брифинги спринтов → читай в `/home/cosmo/SOFT/COSMO/BROMARKET/BRIEFING_*.md`

## Related

- `../00_overview/architecture.md` — общая архитектура
- `../03_content_site/seo.md` (stub новым агентом) — техническая реализация SEO в Astro
- `../06_security/README.md` — security overlapping concerns
- `/home/cosmo/SOFT/COSMO/BROMARKET/SEO/SEO_AUDIT_brobrogid.md` — внешний аудит
- `/home/cosmo/SOFT/COSMO/BROMARKET/ossetia-structure.md` — целевая структура
