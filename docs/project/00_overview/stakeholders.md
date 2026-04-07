---
title: Stakeholders — кто за что отвечает
type: reference
audience: all-agents
owner: archimag
last_updated: 2026-04-07
---

# Кто за что отвечает

## Пользователь

- **G. Slanov** (g.slanov@gmail.com, `g.salatechru@yandex.ru`)
- **GitHub:** `gslanov`
- **Роль:** владелец проекта, конечный decision-maker, пишет контент, взаимодействует с пользователями
- **Что делает:** даёт направление, одобряет планы, пишет лендинги, делает окончательный review контента перед публикацией, решает когда открывать индексацию

## Agents

### Archimag (эта сессия)

- **Определение:** `/home/cosmo/.claude/CLAUDE.md`
- **Зона:**
  - `/home/cosmo/SOFT/COSMO/BROBROGID/` — React PWA репо
  - `api.brobrogid.ru` — Supabase + Docker + nginx + SSL
  - `app.brobrogid.ru` — React PWA сайт на проде
  - Selectel VPS infrastructure (SSH, backups, cron)
- **Что делает:**
  - Пишет SQL миграции (`supabase/migrations/*.sql`)
  - Управляет Docker Compose на сервере
  - Deploy обоих сервисов (`./deploy.sh` и ручной rsync)
  - Координирует работу других агентов (пишет брифинги, запускает ревьюеров)
  - Интеграция с ARCHITECT, SENTINEL, TREVOZHNIY, DOTOSHNIY через Agent tool
- **Что НЕ делает:**
  - Не пишет код сам — делегирует через dev-team
  - Не коммитит напрямую — через gitboy
  - Не трогает репо нового агента `brobrogid-site`
  - Не редактирует контент брифингов нового агента после его старта

### Brobrogid-site agent (отдельная сессия)

- **Определение:** `/home/cosmo/.claude/CLAUDE.md` (та же Archimag role, но в другой папке)
- **Зона:**
  - `/home/cosmo/SOFT/COSMO/BROBROGID_SITE/` — Astro контент-сайт репо
  - `brobrogid.ru` — production сайт
  - `/var/www/brobrogid-site/` на сервере
- **Что делает:**
  - Реализует спринты из брифингов (Sprint 1-3 уже выполнены)
  - Пишет Astro компоненты и страницы
  - Интегрируется с Supabase через `@supabase/supabase-js`
  - Делает свой deploy (собственный `scripts/deploy.sh`)
  - Пишет контент landing pages и блога
- **Координация с Archimag:** через пользователя. Archimag пишет брифинги в `BROMARKET/BRIEFING_*.md`, пользователь передаёт агенту.

### SENTINEL

- **Определение:** внешний security audit agent (не в `/home/cosmo/.claude/agents/`, определён где-то ещё)
- **Зона:** вся кодовая база, фокус на уязвимости
- **Что делает:** находит hardcoded credentials, XSS vectors, insecure session storage, weak password hashing, SQL injection, command injection. Пишет находки в `/home/cosmo/SOFT/COSMO/BROBROGID/error.md` с форматом `[SENTINEL][CRITICAL|HIGH|MEDIUM|INFO] file:line`.
- **Что НЕ делает:** не фиксит — только находит.
- **Читает error.md:** Archimag перед каждым действием (правило из CLAUDE.md).

### ARCHITECT

- **Определение:** внешний architect audit agent
- **Зона:** архитектурные риски, race conditions, privilege escalation, DoS vectors
- **Что делает:** глубокий анализ миграций БД, RLS политик, SECURITY DEFINER функций. Пишет в `error.md` аналогично SENTINEL.
- **Отличие от SENTINEL:** ARCHITECT смотрит на **архитектурные** проблемы (race, TOCTOU, unbounded growth), SENTINEL — на **реализационные** (hardcoded creds, XSS, weak hashing).

### TREVOZHNIY

- **Определение:** `/home/cosmo/.claude/agents/trevozhniy.md`
- **Зона:** проверка планов ПЕРЕД реализацией
- **Что делает:** читает брифинг спринта, ищет риски, пишет отчёт формата `CRITICAL / IMPORTANT / NOTES / CLEAN` с рекомендацией `proceed / fix brief / STOP`.
- **Когда запускается:** после того как брифинг написан, перед тем как отдать его исполнителю.
- **Invoked by:** Archimag через Agent tool.

### DOTOSHNIY

- **Определение:** `/home/cosmo/.claude/agents/dotoshniy.md`
- **Зона:** проверка полноты ПЛАНА и соответствия РЕАЛИЗАЦИИ спецификации
- **Что делает:** читает спеку (ossetia-structure.md) + брифинг спринта, проверяет что все атомарные требования покрыты. Пишет отчёт `IMPLEMENTED / PARTIAL / MISSING / DONE DIFFERENTLY` с решением `Ready to ship: YES / NO`.
- **Когда запускается:** вместе с TREVOZHNIY (до реализации, чтобы проверить план) и после реализации (чтобы проверить результат).

### GITBOY

- **Определение:** `/home/cosmo/.claude/agents/gitboy.md`
- **Зона:** git операции в проектах
- **Что делает:** на основании `git status` + контекста задачи принимает решения о логических коммитах, пишет conventional commit messages, пушит. Читает `GIT_LOG.md` как единственную память между вызовами.
- **Что НЕ делает:** не пушит без явной команды, не делает `--force` без разрешения, не редактирует код.

### AGENT-COUCH

- **Определение:** `/home/cosmo/.claude/agents/agent-couch.md`
- **Зона:** `.agent/BOARD.md` (проектное состояние) и `/home/cosmo/.claude/CLAUDE.md` (системные правила)
- **Что делает:** обновляет BOARD при любых изменениях контекста сессии, патчит CLAUDE.md **с подтверждением пользователя** когда видит повторяющиеся проблемы.
- **Читает первым делом:** BOARD + COUCH_LOG. Между вызовами памяти нет.

## Зоны ответственности — таблица

| Артефакт | Владелец | Редактируют | Читают |
|---|---|---|---|
| `api.brobrogid.ru` БД schema | Archimag | — | все |
| `supabase/migrations/` | Archimag | — | SENTINEL, ARCHITECT (review) |
| Supabase Docker Compose | Archimag | — | — |
| Nginx configs на сервере | Archimag + новый агент (свои vhosts) | — | — |
| `gslanov/brobrogid` репо | Archimag | gitboy | все |
| `gslanov/brobrogid-site` репо | новый агент | его gitboy | все |
| `/home/cosmo/SOFT/COSMO/BROBROGID/` | Archimag | — | все |
| `/home/cosmo/SOFT/COSMO/BROBROGID_SITE/` | новый агент | — | — |
| `/home/cosmo/SOFT/COSMO/BROMARKET/` | пользователь + Archimag | — | все |
| `docs/project/` (эти доки) | Archimag (инициировал) | все (по секциям) | все |
| `error.md` | SENTINEL, ARCHITECT | Archimag (добавляет ЗАКРЫТО) | все |
| `.agent/BOARD.md` | agent-couch | — | любая сессия при старте |
| `.agent/ROADMAP.md` | Archimag | — | все |
| `.agent/ADMIN_CREDENTIALS.md` | Archimag (gitignored) | — | сессии с прямым доступом |

## Правила кросс-агент-координации

### Если Archimag что-то нужно от нового агента

1. Пишет брифинг в `BROMARKET/BRIEFING_*.md`
2. Прогоняет через TREVOZHNIY + DOTOSHNIY (проверка плана)
3. Фиксит план если есть замечания
4. Сообщает пользователю: "передай новому агенту этот брифинг"
5. Пользователь копирует брифинг в сессию нового агента
6. Новый агент выполняет
7. Archimag верифицирует результат (curl с продакшена)

### Если новый агент нашёл проблему в зоне Archimag

1. Пишет в своём отчёте "нужна миграция БД" / "нужна настройка nginx" / "нужны данные"
2. Пользователь пересылает Archimag
3. Archimag реализует
4. Сообщает обратно

### Если SENTINEL/ARCHITECT нашли уязвимость

1. Они пишут в `error.md`
2. Archimag читает `error.md` перед каждым действием (правило CLAUDE.md)
3. Archimag решает: фиксить сейчас (security critical) или занести в TODO
4. После фикса — добавляет `[ARCHIMAG][ЗАКРЫТО]` секцию в `error.md`

## Related

- `README.md` — обзор проекта
- `architecture.md` — техническая архитектура
- `../09_workflows/agent_coordination.md` — детальные workflow
