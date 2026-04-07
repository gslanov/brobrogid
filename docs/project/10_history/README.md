---
title: History — section index
type: overview
audience: all-agents
owner: archimag
last_updated: 2026-04-07
---

# 10_history — эволюция проекта

Хронология решений, спринтов, уроков.

## Файлы

- **`timeline.md`** — ✅ готово — хронология ключевых фаз
- `sprint_logs.md` — **stub** — краткие резюме каждого спринта (1, 2, 3, 6, reviews widget)
- `lessons_learned.md` — **stub** — что мы поняли по ходу проекта, anti-patterns, retrospectives

## Зачем это раздел

История помогает будущим агентам понять:

1. **Почему** сделано так — контекст решений часто теряется
2. **Что пробовали и отказались** — избежать повторения тупиков
3. **Когда закрывались security findings** — audit trail
4. **Какие проблемы были** — сигнал где тонко

## Что должно быть в sprint_logs.md

Для каждого спринта:

```markdown
## Sprint N — <name> (YYYY-MM-DD)

**Цель:** одно предложение.

**Что сделано:**
- Bullet list

**Что НЕ сделано:**
- Bullet list с причинами

**Встреченные проблемы:**
- Issue 1 → решение
- Issue 2 → workaround

**Время:** N дней реально vs N запланировано

**Lessons:** что бы сделали иначе

**Artifacts:**
- Commits: `abc1234` ... `def5678`
- Brief: `BROMARKET/BRIEFING_sprint{N}.md`
- Docs updated: `...`
```

## Что должно быть в lessons_learned.md

Неформальный документ, живые наблюдения:

```markdown
## Anti-pattern: <name>

**Что:** <описание>
**Почему возникло:** <причина>
**Последствия:** <что сломалось или усложнилось>
**Правильный подход:** <как надо>
**Детектор:** <как заметить повтор в будущем>
```

Примеры которые можно внести:

1. **Hardcoded credentials в client bundle** — auth.ts проблема. Как возникло, почему Pool 4 её решает.
2. **JSON snapshots вместо прямого БД доступа** — app.brobrogid.ru data flow. Почему это было решением на момент разработки, почему стало техническим долгом.
3. **SECURITY DEFINER без явного предупреждения** — легко сломать в будущих миграциях. Нужно всегда COMMENT.
4. **CHECK constraint для honeypot вместо soft-fail** — бот адаптируется по error messages. Лучше молча записывать со status='spam'.
5. **Разные slug конвенции между БД и клиентом** — английские в БД, русские на сайте. Фикс Sprint 6, но lesson: синхронизировать с самого начала.
6. **"Алания" семантическое загрязнение** — не учёт амбивалентности топонимов. Always фильтровать keyword research.

## Related

- `timeline.md` — кликабельная хронология
- `../00_overview/README.md` — текущее состояние
- `../../error.md` — living security audit log (ephemeral, not in RAG)
