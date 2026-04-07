---
title: Sprint logs — история итераций
type: history
audience: archimag, dev
owner: archimag
last_updated: 2026-04-07
---

# История спринтов

Проект разбит на спринты. Каждый спринт = чётко ограниченная задача со scope'ом и success criteria. Этот файл — краткая выжимка. Полные брифинги — в `/home/cosmo/SOFT/COSMO/BROMARKET/BRIEFING_*.md` (вне docs hub).

## Sprint 0 — Bootstrap (~2025-Q4)

- Vite + React 19 + Tailwind setup
- IndexedDB через `idb` library
- JSON snapshot pattern (`public/content/*.json`)
- Базовый routing + 7 страниц
- **Bug:** seed.ts не нормализовал nested emergency/transport JSON → IDB транзакция падала. Фикс: `normalizeEmergency()` и `normalizeTransport()` функции.

## Sprint 1-3 — Контентное наполнение

- Импорт POI из BROMARKET (Excel/JSON)
- Импорт ресторанов с меню
- Импорт туров и гидов
- Импорт ~500 reviews из Google/Yandex/TripAdvisor

## Sprint 4 — Admin Panel

- Полный CMS на 17 страниц
- Generic AdminTable, useAdminData hook
- LocalizedInput для bilingual content
- ⚠️ **SENTINEL CRITICAL:** hardcoded credentials в `auth.ts` (Pool 4 закроет)

## Sprint 5 — PWA + i18n

- vite-plugin-pwa, manifest, SW
- react-i18next интеграция
- ru/en переключатель
- Offline кэш через workbox

## Sprint 6 — Russian Slugs Migration

**Цель:** заменить английские slugs (`tsey-gorge`) на русские транслитерации (`cejskoe-ushele`) для лучшего SEO и UX.

**Что сделано:**
- 101 POI slug мигрирован
- Миграции `0006_add_slug_legacy.sql`, `0007_migrate_slugs.sql`
- `slug_legacy` колонка для 301 redirects
- Dry-run скрипт `supabase/scripts/slug_migration_dry_run.ts`
- Обновлены оба сайта (Astro + PWA) для обработки `slug || slug_legacy`

## Sprint 7 — Supabase Self-Hosted

**Цель:** уйти от Supabase Cloud (платно, не RU). Развернуть self-hosted на Selectel VPS.

**Что сделано:**
- Docker compose stack (postgres + postgrest + gotrue)
- nginx reverse proxy (`api.brobrogid.ru`)
- Миграции 0001-0008
- JSON → PostgreSQL импорт скрипт
- Daily pg_dump backup cron

## Sprint 8 — Security Hardening (ARCHITECT audit round 1)

**Findings:** 7 issues от ARCHITECT review.
- `is_admin()` не работал (читал верхний уровень JWT) → fix в `0009`
- GRANTs отсутствовали для admin write → fix в `0009`
- Полный аудит RLS policies

## Sprint 9 — tour_bookings Hardening (ARCHITECT round 2)

**Findings:** 5 issues по форме бронирования.
- TOCTOU race в rate limit → `pg_advisory_xact_lock` в `0011`
- Honeypot жёстко падал → soft-fail с `status='spam'`
- Возможность laundering через UPDATE → immutable trigger + column-level GRANT в `0012`
- Snapshot тура/гида → SECURITY DEFINER функция

**Итог:** 4-layer защита (см. `../02_database/rls_policies.md` секция tour_bookings).

## Sprint 10 — SEO Infrastructure (Phase 1)

- Puppeteer prerender (~145-183 URL)
- `react-helmet-async` SEO компонент
- JSON-LD structured data
- robots.txt + sitemap.xml генератор
- WebP конвертация картинок (`sharp`)
- ⚠️ **Не запускать индексацию** до сигнала пользователя (4-layer noindex)

## Sprint 11 — Domain Split

- `app.brobrogid.ru` для PWA
- `brobrogid.ru` для Astro static контентного сайта
- Разделение SEO-задач между двумя сайтами
- Один Supabase обслуживает оба

## Sprint 12 — Documentation Hub (текущий)

- Создание `docs/project/` для всех агентов
- Распределение зон между archimag, brobrogid-site agent, SEO agent
- Заполнение зон archimag (этот спринт)

## Pool 4 — Future (отложен)

**Цель:** убрать JSON snapshot pattern, перевести PWA на прямые Supabase запросы.

- Удалить `seed.ts`, `public/content/*.json`
- `useDataStore` использует `@supabase/supabase-js`
- Admin auth через Supabase Auth (закроет SENTINEL CRITICAL про hardcoded creds)
- IDB остаётся как offline cache
- Изменения в админке сразу попадают в БД, оба сайта видят

**Не запускать без:** review, тестирования миграции IDB → Supabase user data, plan для conflict resolution.

## Related

- `lessons_learned.md` — что выучили
- `timeline.md` — даты ключевых событий
- `../02_database/migrations.md` — какие миграции в каком спринте
