---
title: Lessons learned — что выучили
type: history
audience: archimag, all-agents
owner: archimag
last_updated: 2026-04-07
---

# Что мы выучили на этом проекте

Список не для красоты — для того чтобы агенты не наступали на те же грабли.

## Архитектурные

### 1. JSON snapshot pattern → tech debt

**Проблема:** PWA читает данные из `public/content/*.json` вместо Supabase напрямую. Это сделано когда Supabase ещё не было. Сейчас означает что любое изменение в БД требует ручной регенерации JSON + commit + deploy → **3 копии** одних данных.

**Урок:** не строить промежуточные кэши до того как реальный backend существует. Если строишь — заложи migration path с самого начала.

**Фикс:** Pool 4.

### 2. Hardcoded admin credentials в client bundle

**Проблема:** `src/features/admin/lib/auth.ts` содержит SHA-256 хэши паролей прямо в JS. DevTools → Sources → пароли видны.

**Урок:** никогда не ставить auth на client-only. Даже как "временное решение".

**Mitigation сейчас:** noindex навсегда + URL не светится. **Фикс:** Pool 4 (Supabase Auth).

### 3. Полиморфные FK без enforcement

**Проблема:** `reviews.target_id` указывает на pois/tours/guides без FK constraint (потому что один FK не может ссылаться на 3 таблицы). Удаление parent оставляет orphan reviews.

**Урок:** полиморфизм = ручная дисциплина в коде или triggers. Не для всех случаев он того стоит.

**Альтернативы:** отдельные таблицы `poi_reviews`, `tour_reviews`, `guide_reviews`. Дублирование — но FK работает.

## БД и миграции

### 4. JWT claims structure имеет значение

**Проблема:** `is_admin()` в migration 0008 читал `role` с верхнего уровня JWT claims. Но GoTrue кладёт admin role в `app_metadata.role`, а на верхнем уровне у всех `authenticated`. Функция всегда возвращала false → admin не мог писать.

**Фикс:** 0009 — читать оба места.

**Урок:** при внедрении auth — **сделай тестовый JWT с реальным GoTrue**, посмотри полную структуру claims, потом пиши `is_admin()`. Не предполагай.

### 5. TOCTOU в trigger-based rate limit

**Проблема:** `check_booking_rate_limit()` делал `SELECT count(*)` без lock. Два параллельных INSERT могли пройти проверку одновременно → bypass.

**Фикс:** `pg_advisory_xact_lock(hashtext(phone))` сериализует проверки по phone.

**Урок:** любые "проверь и вставь" операции на multi-row constraints требуют locking. Trigger ≠ atomic если внутри SELECT-then-RAISE.

### 6. SECURITY DEFINER нужен — но опасен

**Проблема:** trigger функция должна была SELECT'нуть `tour_bookings` от anon. Anon не имеет SELECT grant. Без `DEFINER` → permission denied. С `DEFINER` → работает, но функция выполняется от owner = potential privilege escalation.

**Mitigation:** `SET search_path = public, pg_temp` (защита от schema injection) + COMMENT с warning ("DO NOT add INSERT/UPDATE here") + audit.

**Урок:** SECURITY DEFINER — мощный инструмент, требующий явной маркировки и аудита. Никогда не "просто добавил, чтобы работало".

### 7. Heredoc в Bash расширяет переменные

**Проблема:** `$uri`, `$_` внутри SQL heredoc интерпретировались bash'ем как пустые → broken SQL.

**Фикс:** `<<'SQL'` (single quotes) — отключает интерполяцию.

**Урок:** для SQL/конфигов всегда `<<'EOF'`, не `<<EOF`.

## Frontend

### 8. Service Worker ломает prerender

**Проблема:** `vite-plugin-pwa` с `navigateFallback: 'index.html'` перехватывал navigation и отдавал кешированный пустой `index.html` вместо prerendered HTML с контентом. Prerender был бесполезен для returning visitors.

**Фикс:** `navigateFallback: null` в workbox config.

**Урок:** SW и prerender — несовместимые по умолчанию стратегии. Любой SPA с prerender должен явно отключить navigation interception.

### 9. nested JSON ≠ flat array

**Проблема:** `emergency.json` и `transport.json` имеют структуру `{groups: {hospitals: [...]}, ...}`. `seed.ts` делал `for (const item of data as any[])` → не падал, но создавал 0 записей в IDB.

**Фикс:** explicit normalize functions.

**Урок:** TypeScript `as any[]` отключает type safety. Schema validation на runtime обязателен на data boundaries.

### 10. localStorage admin session = 1-line bypass

**Проблема:** auth guard читает `localStorage.getItem('brobrogid_admin_session')`. Атакующий: открыл DevTools → `localStorage.setItem(...)` → залогинен.

**Урок:** client-only auth = decoration, не security.

## SEO и launch

### 11. Несколько слоёв noindex обязательны

**Проблема:** один meta tag noindex недостаточно — Googlebot может кэшировать robots.txt отдельно, X-Robots-Tag header отдельно. Если открыть только один слой случайно — страница попадёт в индекс.

**Решение:** 4-layer (header + robots.txt + meta + global flag) с атомарным снятием.

**Урок:** для критических флагов — defense in depth, не single switch.

### 12. Russian slugs vs old URLs → 301 обязателен

**Проблема:** Sprint 6 переименовал 101 POI slug. Если просто заменить — все старые ссылки в сети, в кэше Google, в закладках → 404.

**Решение:** `slug_legacy` колонка + lookup в коде `slug || slug_legacy` + `navigate(replace: true)` на canonical.

**Урок:** любая URL-миграция требует backward compat для всего контента который уже был publicly доступен (даже если "это всего месяц был online").

## Координация и процессы

### 13. Multi-agent работа без shared state — сложно

**Проблема:** агенты не имеют общей памяти. Координация через файлы + user.

**Решение:** четкие owner zones, frontmatter с owner, `error.md` для cross-agent comments, BOARD.md как single source of truth по статусу.

**Урок:** заранее распределить файлы, иначе хаос.

### 14. "Code looks correct" ≠ "works"

**Урок:** только qa-tester после реального запуска подтверждает что работает. Проверка кода глазами агента не считается тестом.

### 15. Перед каждой миграцией — backup

**Урок:** всегда. Без исключений. `pg_dump` занимает 2 секунды, restore из dump — 30 секунд. Восстановление руками после поломки — часы.

## Related

- `sprint_logs.md` — где какой урок был получен
- `timeline.md`
- `../02_database/migrations.md` — конкретные миграции
- `../06_security/known_issues.md` — что ещё не закрыто
