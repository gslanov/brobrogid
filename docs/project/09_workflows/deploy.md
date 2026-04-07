---
title: Deploy workflow — оба сайта
type: runbook
audience: archimag, dev, ops
owner: archimag
last_updated: 2026-04-07
---

# Деплой workflow

Два сайта, две разные команды.

## brobrogid.ru (Astro)

```bash
cd /home/cosmo/SOFT/COSMO/BROMARKET
./deploy.sh
```

Внутри:
1. `npm ci`
2. `npm run build` (Astro static)
3. `rsync dist/ root@87.228.33.68:/var/www/brobrogid/`
4. `nginx -s reload`

Время: ~2 минуты.

Подробнее: `../03_content_site/deploy.md`.

## app.brobrogid.ru (PWA)

```bash
cd /home/cosmo/SOFT/COSMO/BROBROGID
./deploy.sh
```

Внутри:
1. `npm ci`
2. `npm run build:seo` (vite build → prerender → sitemap)
3. `rsync dist/ root@87.228.33.68:/var/www/brobrogid-app/`
4. `nginx -s reload`

Время: ~5-7 минут (из-за prerender).

Подробнее: `../04_pwa_app/deploy.md`.

## Полный деплой обоих сайтов

```bash
(cd /home/cosmo/SOFT/COSMO/BROMARKET && ./deploy.sh) && \
(cd /home/cosmo/SOFT/COSMO/BROBROGID && ./deploy.sh)
```

## Pre-deploy checklist

- [ ] `npx tsc --noEmit` — 0 errors
- [ ] `npm run lint` (если есть) — 0 errors
- [ ] Smoke test локально (`npm run preview`)
- [ ] Git committed
- [ ] BOARD.md обновлён (через agent-couch)

## Post-deploy verification

См. `../08_infrastructure/monitoring.md` → smoke test секция.

```bash
# 3 endpoint должны отвечать 200
for d in brobrogid.ru app.brobrogid.ru api.brobrogid.ru; do
  curl -sI https://$d/ | head -1
done
```

## При проблемах

См. `rollback.md`.

## Related

- `../03_content_site/deploy.md`, `../04_pwa_app/deploy.md` — детали
- `rollback.md`, `common_tasks.md`
- `../08_infrastructure/nginx.md`
