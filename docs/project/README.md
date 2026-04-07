---
title: BROBROGID — Project Documentation Hub
type: index
audience: all-agents
last_updated: 2026-04-07
maintainer: archimag
---

# BROBROGID — Project Documentation

**Purpose:** Single source of truth for everything about the BROBROGID project.
**Audience:** Future Claude agents joining the project, security auditors, content writers, devs.
**Philosophy:** Each file is self-contained, small (<2000 words), cross-linked, RAG-friendly.

---

## What is BROBROGID?

A **multi-regional travel guide to the North Caucasus**, starting with North Ossetia.

**Architecture:** three independent sites sharing one database:

- `brobrogid.ru` — SEO-first content guide (Astro SSG) — new agent's zone
- `app.brobrogid.ru` — interactive PWA with maps, admin, offline support (React) — archimag's zone
- `api.brobrogid.ru` — self-hosted Supabase (PostgreSQL + PostgREST + GoTrue) — archimag's zone

**Current status (2026-04-07):** All three deployed on Selectel VPS, both sites under `noindex` while content finalizes. Waiting on final launch checklist.

---

## How to navigate this documentation

Start with **`00_overview/`** for the big picture, then drill into the domain you care about.

### For new agents joining the project

Read in this order:
1. `00_overview/README.md` — what the project is
2. `00_overview/architecture.md` — how the pieces fit
3. `00_overview/glossary.md` — project vocabulary
4. `01_domains/README.md` — three-domain split
5. Whichever domain you're working on

### For security work (SENTINEL, ARCHITECT, TREVOZHNIY)

- `06_security/` — main zone
- `02_database/rls_policies.md` + `triggers_and_functions.md` for DB security
- `../../error.md` — ongoing audit log (ephemeral, not in RAG)

### For SEO work

- `07_seo/` — main zone
- `03_content_site/seo.md` for Astro-specific
- `07_seo/launch_procedure.md` for opening indexation

### For content writers

- `00_overview/glossary.md`
- `05_data_model/` — understand POI/tour/guide structures
- `07_seo/sensitive_topics.md` — what NOT to write
- `03_content_site/README.md` — how content site works

### For database / backend work

- `02_database/` — everything about Supabase
- `01_domains/api_brobrogid_ru.md`

---

## Directory structure

```
docs/project/
├── README.md                     ← you are here
├── INDEX.md                      ← quick keyword lookup
├── CONTRIBUTING.md               ← how agents should add/edit docs
│
├── 00_overview/                  ← WHAT, WHY, WHO
│   ├── README.md                 ← project overview
│   ├── architecture.md           ← 3-domain + 1 DB architecture
│   ├── glossary.md               ← terms and acronyms
│   └── stakeholders.md           ← agents and zones
│
├── 01_domains/                   ← THREE SITES OVERVIEW
│   ├── README.md                 ← how they fit together
│   ├── brobrogid_ru.md           ← content site
│   ├── app_brobrogid_ru.md       ← PWA
│   └── api_brobrogid_ru.md       ← API
│
├── 02_database/                  ← SUPABASE DETAILS
│   ├── README.md
│   ├── schema.md                 ← all tables, columns, indexes
│   ├── migrations.md             ← migration history
│   ├── rls_policies.md           ← Row Level Security
│   ├── triggers_and_functions.md ← PL/pgSQL + SECURITY DEFINER
│   ├── connections.md            ← keys, env, tunnels
│   └── backup_restore.md
│
├── 03_content_site/              ← brobrogid.ru (ASTRO)
│   ├── README.md
│   ├── stack.md
│   ├── routing.md                ← URL structure, getStaticPaths
│   ├── data_flow.md              ← Supabase → SSG
│   ├── seo.md
│   ├── components.md
│   ├── sprints.md                ← what each sprint delivered
│   └── deploy.md
│
├── 04_pwa_app/                   ← app.brobrogid.ru (REACT PWA)
│   ├── README.md
│   ├── stack.md
│   ├── data_flow.md              ← JSON → seed → IDB → Zustand
│   ├── routing.md
│   ├── admin_panel.md
│   ├── prerender.md              ← Puppeteer pipeline
│   ├── pwa.md                    ← service worker, manifest
│   ├── i18n.md
│   └── deploy.md
│
├── 05_data_model/                ← SHARED TYPES
│   ├── README.md
│   ├── types.md                  ← TypeScript overview
│   ├── poi.md
│   ├── tour.md
│   ├── guide.md
│   ├── review.md                 ← polymorphic
│   ├── menu_item.md
│   ├── emergency.md
│   ├── transport.md
│   ├── localized_text.md         ← { ru, en } pattern
│   └── location.md
│
├── 06_security/                  ← THREAT MODEL + FIXES
│   ├── README.md                 ← security posture
│   ├── authentication.md
│   ├── rate_limiting.md          ← 4-layer defense
│   ├── booking_form_defenses.md  ← tour_bookings architecture
│   ├── content_security.md       ← XSS, honeypot, input validation
│   ├── secrets_management.md
│   ├── audit_history.md          ← closed findings
│   └── known_issues.md           ← open findings
│
├── 07_seo/                       ← SEO STRATEGY
│   ├── README.md
│   ├── keyword_research.md       ← 14K keys, 13 clusters
│   ├── url_structure.md
│   ├── meta_strategy.md
│   ├── json_ld_strategy.md
│   ├── sitemap.md
│   ├── robots_and_noindex.md
│   ├── sensitive_topics.md       ← Bodrov, Beslan, etc.
│   └── launch_procedure.md       ← opening indexation
│
├── 08_infrastructure/            ← SERVER AND OPS
│   ├── README.md
│   ├── nginx.md
│   ├── ssl.md                    ← Let's Encrypt, certbot
│   ├── docker_compose.md
│   ├── cron_jobs.md
│   ├── resources.md              ← RAM, CPU, disk
│   └── monitoring.md
│
├── 09_workflows/                 ← HOW TO DO THINGS
│   ├── README.md
│   ├── deploy.md                 ← full pipeline
│   ├── adding_content.md
│   ├── opening_indexing.md
│   ├── rollback.md
│   ├── agent_coordination.md     ← multi-session work
│   └── common_tasks.md
│
└── 10_history/                   ← TIMELINE
    ├── README.md
    ├── timeline.md
    ├── sprint_logs.md            ← each sprint summarized
    └── lessons_learned.md
```

---

## Ownership and who writes what

| Section | Primary author | Can contribute |
|---|---|---|
| `00_overview/` | archimag | any |
| `01_domains/` | archimag | domain owners |
| `02_database/` | archimag | SENTINEL, ARCHITECT (security parts) |
| `03_content_site/` | new agent (brobrogid-site) | content writers |
| `04_pwa_app/` | archimag | — |
| `05_data_model/` | archimag | any (schema docs) |
| `06_security/` | SENTINEL, ARCHITECT, TREVOZHNIY | archimag (fixes) |
| `07_seo/` | SEO agent | new agent (implementation) |
| `08_infrastructure/` | archimag | DevOps agents |
| `09_workflows/` | archimag | any |
| `10_history/` | archimag | all (add sprint logs) |

See `CONTRIBUTING.md` for how to add/update docs without breaking RAG indexing.

---

## Current state summary (as of 2026-04-07)

**Live on production:**
- `brobrogid.ru` — 252 pages, Russian slugs, reviews widget, noindex
- `app.brobrogid.ru` — 189 pages, admin panel, noindex
- `api.brobrogid.ru` — Supabase with 119 POI, 20 tours, 8 guides, 499 reviews

**Sprints completed:**
- Sprint 1: 7 landing pages (transport, pirogi, weather)
- Sprint 2: ~60 pages (Vladikavkaz hub, POI categories, seasons)
- Sprint 3: ~80-100 pages (tours, guides, routes, blog, reference)
- Sprint 6: Russian slugs (101 POI English → Russian transliteration)
- Reviews widget: delivered out of sprint sequence

**Security:** 12 findings closed (SENTINEL + ARCHITECT, 2 audit rounds)
**Open issue:** hardcoded admin creds in `auth.ts` — Pool 4 on the roadmap

**What's waiting:** user decision to open indexation + Pool 4 (PWA migration to Supabase API)

---

## RAG ingestion notes

- All files are Markdown with YAML frontmatter (title, type, audience, last_updated)
- Keep files under ~2000 words (optimal chunk size)
- Use relative links for cross-references: `[see schema](../02_database/schema.md)`
- Never put secrets in docs — reference `.agent/ADMIN_CREDENTIALS.md` instead
- Date format: ISO `YYYY-MM-DD`
- Code blocks get language hints for syntax
- Tables for structured data (better than bullet lists for RAG)

---

## Getting help

- **Project rules / CLAUDE.md:** `/home/cosmo/.claude/CLAUDE.md` (system-level)
- **Keyword data:** `/home/cosmo/SOFT/COSMO/BROMARKET/data/`
- **Sprint briefs:** `/home/cosmo/SOFT/COSMO/BROMARKET/BRIEFING_*.md`
- **Error log (ephemeral):** `/home/cosmo/SOFT/COSMO/BROBROGID/error.md`
- **Admin credentials (gitignored):** `.agent/ADMIN_CREDENTIALS.md`
- **Roadmap:** `.agent/ROADMAP.md`
