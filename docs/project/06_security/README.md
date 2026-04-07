---
title: Security Overview
type: overview
audience: security, archimag
owner: archimag (SENTINEL + ARCHITECT contribute)
last_updated: 2026-04-07
---

# Security posture

## Модель угроз

**Что защищаем:**

1. **Данные POI/туров/гидов** — публичные, но писать может только admin
2. **Заявки на туры** (`tour_bookings`) — приватные, только admin читает
3. **Admin credentials** — доступ к панели
4. **Supabase instance** — server-side integrity, performance
5. **Доступность сайтов** — DoS защита

**От чего защищаемся:**

1. **Спам на формах** — боты заливают заявки
2. **SQL injection / NoSQL injection** — через формы
3. **XSS** — через комментарии, author_name, review text
4. **CSRF** — через админку
5. **Privilege escalation** — anon → admin
6. **Session hijacking** — кража сессии
7. **Enumeration attacks** — телефоны, emails, пользователи
8. **DoS** — перегрузка форм/БД
9. **Data exfiltration** — чтение admin-only данных через anon endpoint
10. **Supply chain** — vulnerable dependencies

## Уровни защиты (defense-in-depth)

### 1. Network / nginx

- TLS 1.2+ через Let's Encrypt
- HSTS header (1 year)
- Rate limiting (`limit_req`):
  - `/rest/v1/*` — 30 req/s burst 60
  - `/rest/v1/tour_bookings` — 5 req/min burst 2
  - `/auth/v1/*` — 30 req/s burst 20
- `server_tokens off`
- X-Content-Type-Options, X-Frame-Options, Referrer-Policy

### 2. API (PostgREST + GoTrue)

- PostgREST публикует только `public` schema
- GoTrue signup disabled (`GOTRUE_DISABLE_SIGNUP=true`)
- JWT validation через shared secret

### 3. PostgreSQL roles

- Четыре роли: anon, authenticated, service_role, authenticator
- Column-level GRANTs для chirurgical контроля (особенно `tour_bookings`)
- service_role используется только для server-side scripts

### 4. Row Level Security (RLS)

- Включена на всех `public` таблицах
- Политики проверяют `is_admin()` helper (reads JWT claims from app_metadata.role)
- `current_user_id()` helper для owner-only доступа к user data

### 5. DB-level validation

- CHECK constraints (length, format, range)
- Regex constraints (email, phone)
- Trigger-based rate limiting (TOCTOU-safe через advisory locks)
- Immutable fields trigger (customer data нельзя переписать после insert)

### 6. Application-level

- Honeypot fields в формах (soft-fail)
- Astro default escape (никогда `set:html`)
- Supabase client env var check (throws если нет ключа)
- CORS allowlist

## Security audit history

Проект прошёл **два раунда** аудита от SENTINEL + ARCHITECT. Все critical/high closed.

### Round 1 (2026-04-06) — migration 0011

**Закрыто:**
- SENTINEL HIGH: anon writes ip_address/user_agent → column-level GRANT
- SENTINEL HIGH: Stored XSS в name/comment → CHECK `[<>]`
- SENTINEL MEDIUM: Phone enumeration → generic error
- ARCHITECT CRITICAL: TOCTOU race → advisory lock
- ARCHITECT CRITICAL: Unbounded DoS → global cap 30/min

### Round 2 (2026-04-07) — migration 0012

**Закрыто:**
- ARCHITECT HIGH: ON DELETE SET NULL заметание следов → ON DELETE RESTRICT + snapshot columns
- ARCHITECT MEDIUM: Admin UPDATE без whitelist → column-level GRANT (только `status`) + immutable trigger
- ARCHITECT MEDIUM: Honeypot hard-fail обнаруживается → soft-fail trigger
- ARCHITECT HIGH: SECURITY DEFINER privesc — усилен COMMENT с предупреждением

### Open findings

**SENTINEL CRITICAL: `src/features/admin/lib/auth.ts:10-23` (app.brobrogid.ru)**

Hardcoded admin credentials в client bundle:
- Три user/password пары захардкожены
- SHA-256 без соли (ломается rainbow table)
- Вся auth логика на клиенте, никакой серверной проверки
- Session в localStorage как plain JSON (XSS→session theft)

**Mitigation:** сайт под `noindex`, `/admin` не афишируется. **Full fix:** Pool 4 — миграция на Supabase Auth. Planned.

**ARCHITECT HIGH: SECURITY DEFINER privilege escalation risk**

`check_booking_rate_limit()` функция имеет атрибут SECURITY DEFINER (нужен для SELECT от anon). Если в будущем кто-то добавит INSERT/UPDATE/DELETE в неё — anon получит write доступ в обход RLS через триггер.

**Mitigation:** COMMENT в 0012 с жирным предупреждением. **Долгосрочно:** CI check что функция содержит только SELECT.

## Файлы этого раздела

- `README.md` — ты здесь
- `authentication.md` — GoTrue, admin user, JWT flow — **stub, нужно заполнить**
- `rate_limiting.md` — 4-layer defense — **stub**
- `booking_form_defenses.md` — полный разбор tour_bookings защиты — **stub**
- `content_security.md` — XSS, honeypot, input validation — **stub**
- `secrets_management.md` — где живут ключи — **stub**
- `audit_history.md` — детали каждой находки SENTINEL/ARCHITECT — **stub**
- `known_issues.md` — открытые issues (полный список с митигациями) — **stub**

## Related

- `../02_database/rls_policies.md` — RLS details
- `../02_database/triggers_and_functions.md` — trigger logic
- `../../../error.md` — living audit log (не в git)
- `../10_history/sprint_logs.md` — когда что было найдено/закрыто
