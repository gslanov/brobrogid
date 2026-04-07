---
title: Documentation Index — keyword lookup
type: index
audience: all-agents
owner: archimag
last_updated: 2026-04-07
---

# Index — быстрый поиск по ключевым словам

Если ищешь информацию по теме, используй этот файл как карту. Каждая запись — ссылка на документ(ы) где тема раскрыта.

## A-Z по ключевым словам

### A

- **admin panel** → `01_domains/app_brobrogid_ru.md`, future `04_pwa_app/admin_panel.md`
- **admin credentials** → `06_security/known_issues.md` (open finding), `.agent/ADMIN_CREDENTIALS.md` (gitignored)
- **agent coordination** → `00_overview/stakeholders.md`, future `09_workflows/agent_coordination.md`
- **Astro** → `01_domains/brobrogid_ru.md`, future `03_content_site/stack.md`
- **auth / authentication** → `06_security/README.md`, future `06_security/authentication.md`
- **architecture** → `00_overview/architecture.md`
- **ARCHITECT findings** → `10_history/timeline.md` (round 2 section), `06_security/README.md`, `error.md`
- **api.brobrogid.ru** → `01_domains/api_brobrogid_ru.md`, `02_database/`
- **AggregateRating** → `03_content_site/seo.md` (stub), `07_seo/json_ld_strategy.md` (stub)

### B

- **backup** → `02_database/README.md`, future `02_database/backup_restore.md`
- **BASE_URL** → `04_pwa_app/seo.md` (stub), defined in `src/shared/ui/SEO.tsx` as `https://app.brobrogid.ru`
- **booking form** → `06_security/README.md`, future `06_security/booking_form_defenses.md`
- **brobrogid.ru** → `01_domains/brobrogid_ru.md`, `03_content_site/`

### C

- **categories (POI)** → `02_database/schema.md` (enum poi_category), `05_data_model/poi.md` (stub)
- **certbot / SSL** → `02_database/README.md`, future `08_infrastructure/ssl.md`
- **CORS** → `02_database/README.md` (nginx section)
- **content flow** → `00_overview/architecture.md`, `04_pwa_app/data_flow.md` (stub), `03_content_site/data_flow.md` (stub)
- **cron** → future `08_infrastructure/cron_jobs.md`

### D

- **database schema** → `02_database/schema.md`
- **data flow** → `00_overview/architecture.md`
- **data types** → `02_database/schema.md`, future `05_data_model/types.md`
- **deploy** → `01_domains/app_brobrogid_ru.md`, future `09_workflows/deploy.md`
- **Docker Compose** → `02_database/README.md`, future `08_infrastructure/docker_compose.md`
- **dry run** → `06_security/README.md` (пример — `supabase/scripts/slug_migration_dry_run.ts`)

### E

- **emergency contacts** → `02_database/schema.md`
- **.env** → `00_overview/glossary.md` (secrets), `/opt/supabase/.env` на сервере
- **error.md** → ephemeral security audit log, not in RAG

### F

- **feature folder structure** → `01_domains/app_brobrogid_ru.md`
- **Framer Motion** → `01_domains/app_brobrogid_ru.md` (stack)
- **Fuse.js** → `01_domains/app_brobrogid_ru.md` (search)

### G

- **getStaticPaths** → future `03_content_site/data_flow.md`
- **GoTrue** → `02_database/README.md`
- **guides** → `02_database/schema.md`

### H

- **hardcoded credentials** → `06_security/known_issues.md` (CRITICAL), `src/features/admin/lib/auth.ts:10-23`
- **honeypot** → `00_overview/glossary.md`, `06_security/README.md`, migration `0010` и `0012`

### I

- **i18n** → `01_domains/app_brobrogid_ru.md`, future `04_pwa_app/i18n.md`
- **IDB / IndexedDB** → `01_domains/app_brobrogid_ru.md`, future `04_pwa_app/data_flow.md`
- **immutable fields** → `02_database/schema.md` (tour_bookings), migration `0012`
- **indexation** → `07_seo/launch_procedure.md`
- **is_admin()** → `02_database/README.md`, migration `0008` + `0009` + `0012`

### J

- **JSON-LD** → future `07_seo/json_ld_strategy.md`, `03_content_site/seo.md`
- **JWT** → `02_database/README.md`, `00_overview/glossary.md`

### K

- **keyword research** → future `07_seo/keyword_research.md`, `/home/cosmo/SOFT/COSMO/BROMARKET/data/`

### L

- **launch** → `07_seo/launch_procedure.md`
- **legacy slug** → `02_database/schema.md`, migration `0013`
- **Let's Encrypt** → `02_database/README.md`
- **Lighthouse** → `07_seo/launch_procedure.md`
- **LocalizedText** → `02_database/schema.md`, future `05_data_model/localized_text.md`

### M

- **MapLibre GL** → `01_domains/app_brobrogid_ru.md`
- **menu items** → `02_database/schema.md`
- **migrations** → future `02_database/migrations.md`, `supabase/migrations/*.sql`
- **multi-domain** → `00_overview/architecture.md`, `01_domains/README.md`
- **MDX** → `01_domains/brobrogid_ru.md` (blog)

### N

- **new agent / brobrogid-site** → `01_domains/brobrogid_ru.md`, `00_overview/stakeholders.md`
- **nginx** → `02_database/README.md`, future `08_infrastructure/nginx.md`
- **noindex** → `07_seo/launch_procedure.md`

### O

- **ON DELETE RESTRICT** → migration `0012`
- **onboarding (user)** → `01_domains/app_brobrogid_ru.md`
- **OG tags / Open Graph** → `04_pwa_app/seo.md` (stub), future `07_seo/meta_strategy.md`

### P

- **PMTiles** → `01_domains/app_brobrogid_ru.md`
- **POI** → `02_database/schema.md`, future `05_data_model/poi.md`
- **PostgREST** → `02_database/README.md`
- **PostgreSQL** → `02_database/README.md`
- **prerender** → `01_domains/app_brobrogid_ru.md`, future `04_pwa_app/prerender.md`
- **PWA** → `01_domains/app_brobrogid_ru.md`, future `04_pwa_app/pwa.md`
- **Puppeteer** → `00_overview/glossary.md`, prerender script

### Q

- **query helpers** → future `03_content_site/data_flow.md`, `02_database/connections.md`

### R

- **race condition** → `00_overview/glossary.md` (TOCTOU), migration `0011`
- **rate limit** → `06_security/README.md`, future `06_security/rate_limiting.md`
- **React Router** → `01_domains/app_brobrogid_ru.md`
- **react-helmet-async** → `01_domains/app_brobrogid_ru.md`
- **reviews** → `02_database/schema.md`
- **reviews widget** → `10_history/timeline.md`, future `03_content_site/components.md`
- **RLS** → `02_database/README.md`, future `02_database/rls_policies.md`
- **robots.txt** → `07_seo/launch_procedure.md`
- **rollback** → `07_seo/launch_procedure.md`, future `09_workflows/rollback.md`
- **Russian slugs** → `10_history/timeline.md` (Sprint 6)

### S

- **schema (DB)** → `02_database/schema.md`
- **SECURITY DEFINER** → `00_overview/glossary.md`, `06_security/README.md`, migration `0011`/`0012`
- **SENTINEL findings** → `10_history/timeline.md`, `06_security/README.md`, `error.md`
- **service_role** → `02_database/README.md`, `06_security/README.md`
- **SITE_UNDER_CONSTRUCTION** → `07_seo/launch_procedure.md`
- **sitemap** → `07_seo/launch_procedure.md`
- **slug** → `00_overview/glossary.md`, `02_database/schema.md`, Sprint 6 в `10_history/timeline.md`
- **slug_legacy** → migration `0013`, `02_database/schema.md`
- **snapshot columns** → migration `0012`, `02_database/schema.md`
- **Supabase** → `02_database/README.md`
- **sprint** → `10_history/timeline.md`, `10_history/sprint_logs.md` (stub)

### T

- **Tailwind** → `01_domains/app_brobrogid_ru.md`
- **TOCTOU** → `00_overview/glossary.md`, migration `0011`
- **tour bookings** → `02_database/schema.md`, `06_security/README.md`
- **tours** → `02_database/schema.md`
- **transliteration** → Sprint 6 в `10_history/timeline.md`, `supabase/scripts/slug_migration_dry_run.ts`
- **Trevozhniy** → `00_overview/stakeholders.md`
- **triggers** → future `02_database/triggers_and_functions.md`
- **types** → `02_database/schema.md`, `src/data/types/index.ts` (PWA), future `05_data_model/types.md`

### U

- **update whitelist** → migration `0012` (column-level GRANT)
- **URL structure** → `07_seo/launch_procedure.md`, future `07_seo/url_structure.md`

### V

- **VPS** → Selectel `87.228.33.68`, `02_database/README.md`
- **Vite** → `01_domains/app_brobrogid_ru.md`

### W

- **WebP** → `01_domains/app_brobrogid_ru.md`
- **workbox** → `01_domains/app_brobrogid_ru.md` (PWA)

### X-Z

- **XSS** → `06_security/README.md`, migrations `0010`/`0011`
- **Yandex Webmaster** → `07_seo/launch_procedure.md`
- **Zustand** → `01_domains/app_brobrogid_ru.md`

## Типичные вопросы agent'ов

### "Где хранятся секреты?"

`/opt/supabase/.env` (на сервере, не в git), `.agent/ADMIN_CREDENTIALS.md` (gitignored), не в VITE_* vars.

### "Какие данные в БД?"

`02_database/schema.md` — все таблицы. `00_overview/README.md` — количественный обзор.

### "Как добавить POI?"

Insert в Supabase `pois` (через psql, Supabase Studio, или admin API script). Оба сайта видят после rebuild.

### "Сайт открыт для индексации?"

Нет, оба под noindex. См. `07_seo/launch_procedure.md` для процедуры открытия.

### "Где код живёт?"

- PWA: `/home/cosmo/SOFT/COSMO/BROBROGID/` (archimag зона)
- Content site: `/home/cosmo/SOFT/COSMO/BROBROGID_SITE/` (brobrogid-site agent зона)
- Research: `/home/cosmo/SOFT/COSMO/BROMARKET/` (общее, пользовательское)

### "Как обновить данные на проде?"

См. `09_workflows/deploy.md` (stub). Коротко:
1. Подключиться к Supabase, изменить данные
2. Rebuild оба сайта
3. Deploy через rsync

### "Что такое Pool 4?"

Migration `app.brobrogid.ru` с JSON snapshots на прямые Supabase API вызовы. Закроет technical debt + SENTINEL CRITICAL (hardcoded creds). Planned.

## Links to external (not in RAG) files

- `/home/cosmo/.claude/CLAUDE.md` — system-level agent rules
- `/home/cosmo/.claude/agents/*.md` — agent definitions (trevozhniy, dotoshniy, gitboy, etc.)
- `/home/cosmo/SOFT/COSMO/BROBROGID/error.md` — living security audit log
- `/home/cosmo/SOFT/COSMO/BROMARKET/ossetia-structure.md` — target structure for content site
- `/home/cosmo/SOFT/COSMO/BROMARKET/BRIEFING_*.md` — sprint briefs
- `/home/cosmo/SOFT/COSMO/BROBROGID/.agent/ROADMAP.md` — high-level roadmap
- `/home/cosmo/SOFT/COSMO/BROBROGID/.agent/BOARD.md` — project state (agent-couch)
