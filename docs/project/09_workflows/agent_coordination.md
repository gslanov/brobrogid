---
title: Agent coordination — кто что делает
type: reference
audience: archimag, all-agents
owner: archimag
last_updated: 2026-04-07
---

# Координация агентов

Несколько агентов работают параллельно. Чтобы не топтаться по ногам — это правила.

## Зоны ответственности

| Зона | Owner agent |
|---|---|
| `00_overview/`, `02_database/`, `04_pwa_app/`, `05_data_model/`, `08_infrastructure/`, `09_workflows/`, `10_history/` | archimag |
| `03_content_site/` | brobrogid-site agent |
| `06_security/` | trevozhniy / sentinel |
| `07_seo/` (кроме `launch_procedure.md` и `TASKS.md`) | seo agent |
| `01_domains/` | shared (любой может уточнить) |

См. `00_overview/stakeholders.md` для полного списка.

## Правила

1. **Не редактируй чужие файлы** без явной координации через archimag. Можешь добавить inline комментарий в виде PR-style suggestion в `error.md` (см. ниже).

2. **Stub файлы свободны** — если файл помечен `🔴 stub` в README соответствующей секции, его может заполнить ответственный agent.

3. **Cross-references** — можешь свободно ссылаться на чужие файлы через `Related` секцию.

4. **Frontmatter обязателен** — каждый файл должен иметь `title`, `type`, `audience`, `owner`, `last_updated`. См. `CONTRIBUTING.md`.

5. **Обновляй last_updated** при каждом значимом изменении.

## Shared error.md

Если нашёл ошибку в чужом файле — НЕ редактируй сам. Запиши в `docs/project/error.md` (создаётся при первой записи):

```markdown
## 2026-04-07 — agent X — file Y

В `02_database/schema.md` строка 45: написано `users` но таблица называется `auth.users`. Предлагаемый fix: добавить schema prefix.
```

Owner файла прочитает и исправит. Когда исправил — удалит запись.

## Конфликты scope

Если задача попадает между двумя зонами (например, "SEO для admin panel"):
1. Уточни у archimag через user
2. Или создай файл в основной зоне и pointer в смежной

## Связь через user

У агентов нет shared memory кроме файлов. Координация:
- Через файлы в `docs/project/`
- Через `.agent/BOARD.md` (агент-couch управляет)
- Через user (передача сообщений)

## Hand-off pattern

Когда задача переходит от одного agent к другому:
1. Текущий agent пишет brief в виде файла в подходящей зоне
2. Brief содержит: что сделано, что осталось, какие решения приняты, какие открыты
3. User передаёт brief следующему agent

## BOARD.md

`.agent/BOARD.md` — общая доска состояния проекта. Только agent-couch пишет туда. Остальные читают на старте сессии.

## Related

- `../00_overview/stakeholders.md` — зоны
- `../CONTRIBUTING.md` — правила формата
- `common_tasks.md`
