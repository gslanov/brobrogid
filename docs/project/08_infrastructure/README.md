---
title: Infrastructure — section index
type: overview
audience: archimag, devops
owner: archimag
last_updated: 2026-04-07
stub: true
---

# 08_infrastructure — сервер и DevOps

> Эта секция — archimag зона. Большинство stub.

## Файлы

- `nginx.md` — **stub** — 3 server blocks, rate limits, CORS, SSL
- `ssl.md` — **stub** — Let's Encrypt, certbot auto-renewal
- `docker_compose.md` — **stub** — Supabase stack (postgres + postgrest + gotrue)
- `cron_jobs.md` — **stub** — daily backup, certbot renew
- `resources.md` — **stub** — текущее потребление RAM/CPU/disk, лимиты
- `monitoring.md` — **stub** — что мониторится сейчас (ничего сверх стандартного), что добавить

## Quick facts

- **Provider:** Selectel VPS
- **IP:** 87.228.33.68
- **OS:** Ubuntu 24.04 LTS
- **Specs:** 2 vCPU, 3.8 GB RAM (+ 4 GB swap), 50 GB disk
- **Ports open:** 80, 443, 22 (SSH only with key)
- **SSH access:** `ssh -i /home/cosmo/.ssh/id_ed25519_selectel root@87.228.33.68`
- **Root disk usage:** ~1.5 GB (Sprint 6 стадия)
- **Docker:** 28.2.2
- **Docker Compose:** 2.37.1
- **Nginx:** 1.24.0
- **PostgreSQL:** 16 (in Docker)
- **Memory layout:**
  - PostgreSQL: ~42 MB (idle)
  - PostgREST: ~7 MB
  - GoTrue: ~7 MB
  - Nginx: ~10 MB
  - System + Docker daemon: ~300 MB
  - **Free: ~3.1 GB** (+ 4 GB swap)

## Deployed services

| Service | Config file | Data location |
|---|---|---|
| Nginx | `/etc/nginx/sites-available/{brobrogid,brobrogid-site,app-brobrogid,api-brobrogid}` | `/var/www/{brobrogid,brobrogid-site,brobrogid-app}/` |
| PostgreSQL (Docker) | `/opt/supabase/docker-compose.yml` + `.env` | `/opt/supabase/postgres-data/` |
| PostgREST (Docker) | `/opt/supabase/docker-compose.yml` + `.env` | — (stateless) |
| GoTrue (Docker) | `/opt/supabase/docker-compose.yml` + `.env` | Uses PostgreSQL `auth` schema |
| Certbot | Auto via systemd timer | `/etc/letsencrypt/live/{brobrogid.ru,app.brobrogid.ru,api.brobrogid.ru}/` |
| Backup cron | `/etc/cron.d/brobrogid-backup` | `/opt/supabase/backups/` |

## Related

- `../02_database/README.md` — Supabase stack details
- `../02_database/backup_restore.md` — backup operations
- `../09_workflows/deploy.md` — deploy pipeline
