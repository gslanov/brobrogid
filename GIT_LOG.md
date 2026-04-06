## 2026-04-03
- Action: GitBoy startup diagnostics. Added .agent/ and .claude/ to .gitignore.
- Files: .gitignore
- Commit: `99407c9` "chore: add .agent/ and .claude/ to gitignore"
- Status: ok
- For next invocation: Large amount of uncommitted changes accumulated since commit ff66266. ~41 modified tracked files + ~18 new untracked files (new components, hooks, stores, features). No remote configured. Only branch is master. Need to stage and commit all accumulated work in logical groups.

## 2026-04-05 (session 2 — admin CMS)
- Action: Committed admin panel (36 new files) in 7 logical commits, pushed to GitHub.
- Files: src/features/admin/** (lib, hooks, components, pages), src/app/App.tsx, src/app/router.tsx, deploy.sh
- Commits:
  - `ffa0423` "feat: add admin CMS foundation — db layer, hooks, layout, sidebar, dashboard"
  - `60d4c47` "feat: add admin shared form components (14 components)"
  - `34a9f8f` "feat: add admin pages for POI, MenuItem, Tour, Guide entities"
  - `799e1e0` "feat: add admin pages for Review, Emergency, Transport entities"
  - `9230021` "feat: add AdminExport page — JSON/CSV bulk export for all entities"
  - `779e396` "feat: wire admin routes into app — bypass AppShell and onboarding for /admin"
  - `df56a78` "chore: add deploy.sh — build and rsync to Selectel nginx server"
- Remote: https://github.com/gslanov/brobrogid.git — pushed successfully
- Status: ok
- For next invocation: Repo is clean and pushed. Admin CMS fully committed. .agent/ADMIN_ARCHITECTURE.md is local only (gitignored). Branch: master. deploy.sh deploys to 87.228.33.68 via rsync.

## 2026-04-05
- Action: Committed all accumulated changes in 8 logical groups, created remote origin, pushed master to GitHub.
- Files: all project files (~200+ files across 8 commits)
- Commits:
  - `7db8d28` "feat: add shared UI primitives and hooks"
  - `706a796` "feat: add map components, onboarding flow, and search components"
  - `e83ac46` "feat: add POI/tours content data, icons, and images assets"
  - `f969605` "refactor: update core app shell, data layer, shared UI components, and global styles"
  - `35c8a16` "feat: update all feature pages"
  - `1a2f952` "chore: update i18n locales, package deps, vite config, and html entry"
  - `cefb344` "docs: add GIT_LOG, preview files, and project docs"
  - `3e32c47` "docs: add UI review and content reference directories"
- Remote: https://github.com/gslanov/brobrogid.git (origin/master set up)
- Status: ok
- For next invocation: Repo is clean and fully pushed to GitHub as gslanov/brobrogid. Branch: master. Remote: origin. No pending changes except .agent/BOARD.md which is gitignored.

## 2026-04-05 (session 3 — admin i18n + auth)
- Action: 4 logical commits + push to origin/master
- Files: auth.ts, AdminLogin.tsx, AdminLayout.tsx, router.tsx, seed.ts, LanguageToggle.tsx, all admin pages/components (27 files), en.json, ru.json, App.tsx
- Commits:
  - `581eb74` "feat: add admin authentication — auth.ts, AdminLogin page, layout auth guard, login route"
  - `8f457fe` "fix: normalize emergency/transport JSON in seed.ts"
  - `6e15f87` "feat: add i18n support to admin panel — LanguageToggle, ~230 locale keys, all pages and components migrated to i18next"
  - `11ec6bd` "fix: restore language preference on app init (App.tsx)"
- Remote: pushed to https://github.com/gslanov/brobrogid.git — ok
- Status: ok
- For next invocation: Repo is clean and pushed. Admin panel now has full i18n (RU/EN) and authentication. Branch: master. No pending changes.

## 2026-04-06 (session 5 — content expansion + supabase infra)
- Action: 9 logical commits + push to origin/master
- Files: public/content/*.json (6 files), public/images/pois/ (252 images), public/robots.txt, index.html, src/shared/ui/SEO.tsx, src/features/admin/components/AdminTable.tsx, deploy.sh, package.json, package-lock.json, supabase/ (migrations x8, docker-compose.yml, seed/import.ts, backup.sh, nginx-api.conf)
- Commits:
  - `45763ba` "feat(content): expand content — 119 POIs, 20 tours, 499 reviews, 275 menu items, emergency and transport"
  - `1f559c2` "feat(images): add 126 new POI images with WebP variants (252 files)"
  - `0f5235a` "chore: close site from indexing during reconstruction"
  - `7ad8771` "fix(admin): tighten AdminTable generic constraint to { id: string }"
  - `185c9b1` "chore(deploy): switch deploy.sh to build:seo, update package deps"
  - `b9f9912` "feat(supabase): add PostgreSQL migrations — full schema with RLS (0001-0008)"
  - `f2d16c3` "feat(supabase): add Docker Compose stack — PostgreSQL 16, PostgREST 12, GoTrue 2"
  - `ebbebde` "feat(supabase): add JSON→PostgreSQL import script and daily pg_dump backup"
  - `85e32f3` "feat(supabase): add nginx reverse proxy config for api.brobrogid.ru"
- Security: supabase/.env NOT committed — covered by .env pattern in .gitignore
- Remote: pushed to https://github.com/gslanov/brobrogid.git — ok
- Status: ok
- For next invocation: Repo is clean and pushed. Supabase infrastructure fully committed (no secrets). Site is closed from indexing (SITE_UNDER_CONSTRUCTION=true). Branch: master.

## 2026-04-06 (session 4 — SEO + WebP)
- Action: 7 logical commits + push to origin/master
- Files: SEO.tsx, JsonLd.tsx, main.tsx, index.html, all public pages (10 files), scripts/ (3 files), 62 WebP images (pois+tours), ImageWithFallback.tsx, robots.txt, vite.config.ts, package.json, package-lock.json, info/ (148 files)
- Commits:
  - `6259bd6` "feat: add SEO components (SEO.tsx, JsonLd.tsx, HelmetProvider)"
  - `6776a3c` "feat: add per-page SEO and structured data to all public pages"
  - `e5f2db6` "feat: add prerender script, sitemap generator, image optimizer"
  - `c390aca` "feat: convert images to WebP, update ImageWithFallback with <picture>"
  - `a19d78b` "chore: add robots.txt, update vite.config (SW navigateFallback null)"
  - `2210f21` "chore: update package.json with build:seo scripts and dependencies"
  - `c2523c7` "chore: add info/ — research data, scripts, and reference images"
- Remote: pushed to https://github.com/gslanov/brobrogid.git — ok
- Status: ok
- For next invocation: Repo is clean and pushed. SEO layer complete — prerender (141 pages), react-helmet-async, JSON-LD, OG/Twitter Cards, hreflang, robots.txt, sitemap autogen, 62 WebP images, SW navigateFallback null. Branch: master.
