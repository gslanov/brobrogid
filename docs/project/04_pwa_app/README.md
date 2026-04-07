---
title: PWA App (app.brobrogid.ru) — section index
type: overview
audience: archimag
owner: archimag
last_updated: 2026-04-07
stub: true
---

# 04_pwa_app — app.brobrogid.ru (React PWA)

> Основной overview в `../01_domains/app_brobrogid_ru.md`. Эта секция — для глубоких reference файлов.

## Files (mostly stubs, to be filled by archimag)

- `stack.md` — **stub** — полный стек с версиями, почему что выбрано
- `data_flow.md` — **stub** — JSON → seed.ts → IDB → Zustand → React. Детальный разбор.
- `routing.md` — **stub** — React Router + lazy loading patterns
- `admin_panel.md` — **stub** — полный разбор CRUD админки
- `prerender.md` — **stub** — Puppeteer pipeline детально
- `pwa.md` — **stub** — Service Worker, manifest, offline strategy
- `i18n.md` — **stub** — i18next setup, namespaces, admin i18n
- `seo.md` — **stub** — JSON-LD, react-helmet-async usage
- `deploy.md` — **stub** — deploy.sh pipeline

## Minimal context (чтобы stubs не были пустыми)

Уже описано в `../01_domains/app_brobrogid_ru.md`:
- Stack: Vite 8.0.5 + React 19.2 + TypeScript 5.9 + Tailwind 4.2 + Zustand 5 + idb 8 + i18next + MapLibre GL + react-helmet-async + Puppeteer (dev) + sharp (dev)
- Feature-based структура в `src/features/*/`
- Prerender: Puppeteer обходит 189 URL, сохраняет HTML
- Admin: CRUD через IDB (Pool 4 мигрирует на Supabase)
- Known issue: hardcoded admin creds в `auth.ts` (SENTINEL CRITICAL)

## Что должно быть описано подробно

Для **каждого аспекта** (data_flow, prerender, admin, etc.) нужно:

1. **What** — что это, одна фраза
2. **Why** — зачем, какую проблему решает
3. **Where** — файлы, функции, конкретные строки
4. **How** — пошаговый flow, диаграммы
5. **Dependencies** — что зависит, от чего зависит
6. **Gotchas** — что уже ломалось, неочевидные поведения
7. **TODO** — что можно улучшить (Pool 4 items)

## Related

- `../01_domains/app_brobrogid_ru.md` — high-level overview
- `../02_database/` — общая БД (хотя app читает не напрямую)
- `../06_security/known_issues.md` — hardcoded creds
- `../10_history/timeline.md` — история эволюции app
