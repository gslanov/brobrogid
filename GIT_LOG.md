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
