---
title: brobrogid.ru — Deploy Pipeline
type: runbook
audience: dev, devops
owner: brobrogid-site-agent
last_updated: 2026-04-07
---

# Deploy Runbook

## Когда деплоить

После любого из:
- Изменений в `src/` (контент, layouts, components)
- Изменений в `public/` (статические assets, favicon, og-default)
- Изменений в `astro.config.mjs`, `tailwind.config.mjs`, `tsconfig.json`
- Обновления зависимостей (`npm install`)
- **Изменения `SITE_UNDER_CONSTRUCTION` в `src/data/site.ts`** — критично, см. [`../07_seo/launch_procedure.md`](../07_seo/launch_procedure.md)

После изменений в nginx config — отдельный sub-pipeline (см. ниже "Nginx config update").

## Prerequisites

- **Local repo:** `/home/cosmo/SOFT/COSMO/BROBROGIDsite/`
- **SSH access:** key `/home/cosmo/.ssh/id_ed25519_selectel` (chmod 600 — preflight это проверит)
- **Node.js + npm:** установлены
- **Git** с clean working tree (ne обязательно — deploy не зависит от git, но best practice)
- **`.env`** с `PUBLIC_SUPABASE_URL`, `PUBLIC_SUPABASE_ANON_KEY`, `PUBLIC_SITE_URL`, `PUBLIC_IMAGE_BASE_URL`

## Standard deploy

```bash
cd /home/cosmo/SOFT/COSMO/BROBROGIDsite/
npm run check         # 1. TypeScript check (~3 sec)
npm run build         # 2. Astro SSG → dist/ (~28 sec)
bash scripts/deploy.sh --confirm  # 3. preflight + rsync (~5-15 sec)
```

После каждого шага проверь exit code = 0.

## Шаг 1 — `npm run check`

Запускает `astro check` — TypeScript validation для всех `.astro` файлов. Должно быть `0 errors, 0 warnings`. Допустимы 12 pre-existing hints (unrelated to current sprint work).

```
Result (NN files): 
- 0 errors
- 0 warnings
- 12 hints
```

Если есть errors — фикси перед build.

## Шаг 2 — `npm run build`

Astro SSG генерит `dist/`:

```
build done in ~28 sec
[build] 252 page(s) built
```

Что внутри `dist/`:
- 252 HTML страниц (включая `404.html`, `o-nas/`, `privacy/`, `robots.txt`, `sitemap-index.xml`, `sitemap-0.xml`, `og-default.jpg`)
- `_astro/` директория с hashed CSS/JS bundles
- Размер ~7-8 MB

Если build падает с null errors типа `Cannot read properties of null (reading 'category')` — значит какой-то shadowing файл потерял связь с БД (slug rename без переименования). Проверь `getPOIBySlug` calls vs БД slugs.

## Шаг 3 — `scripts/deploy.sh --confirm`

Bash скрипт с **6 preflight checks** + rsync. Без флага `--confirm` показывает usage и exit'ит — защита от accidental запуска.

### Preflight checks

| # | Проверка | Что делает |
|---|---|---|
| 1 | Confirm flag | `--confirm` обязателен |
| 2 | Build exists | `dist/` директория должна существовать |
| 3 | SSH key permissions | `stat -c %a` → должно быть `600` |
| 4 | Remote dir exists | `ssh ... [ -d /var/www/brobrogid-site/ ]` |
| 5 | Echo destination | Печатает host:path для визуального confirm |
| 6 | No `.env*` in dist | `find dist/ -name '.env*'` должен быть пустой |
| **6b** | **`SITE_UNDER_CONSTRUCTION` sync** | Парсит `^export const SITE_UNDER_CONSTRUCTION = (true\|false)` из `src/data/site.ts`, проверяет что `dist/robots.txt` и `dist/index.html` синхронизированы. Aborts если нет. |

Регекс preflight использует `^export const` префикс — это важно, иначе ловит комментарии в файле и парсит `false` вместо `true` (раз уже была эта ошибка, см. Sprint 4 history).

### Rsync

```
rsync -avz --delete -e "ssh -i $SSH_KEY" dist/ root@87.228.33.68:/var/www/brobrogid-site/
```

`--delete` убирает с удалённого сервера файлы которых больше нет в `dist/`. Это важно для cleanup'а старых страниц после переименований.

## После deploy — verification

```bash
# Sample page check
for u in / /ossetia/ /ossetia/blog/ /ossetia/tury-ekskursii/dargavs-city-of-the-dead/; do
  echo "$(curl -sLo /dev/null -w '%{http_code}' https://brobrogid.ru$u) $u"
done

# robots.txt должен соответствовать SITE_UNDER_CONSTRUCTION
curl -s https://brobrogid.ru/robots.txt

# Sample 301 redirect (Sprint 6 POI slugs)
curl -sI https://brobrogid.ru/ossetia/mesta/ushchelya/tsey-gorge/ | head -3

# Security headers
curl -sI https://brobrogid.ru/ | grep -iE 'strict|content-security|permissions|x-robots'
```

Все sample страницы должны быть 200 (или 301 для legacy slugs). Security headers должны присутствовать.

## Nginx config update (отдельный sub-pipeline)

Нужно если:
- Меняешь cache headers
- Добавляешь/удаляешь security headers
- Меняешь noindex defense-in-depth (нужно при открытии индексации)
- Добавляешь новые POI redirects (Sprint 6 паттерн)

```bash
# 1. Edit local file
vim deploy/nginx/brobrogid.ru.conf
# или
vim deploy/nginx/brobrogid-security-headers.conf

# 2. SCP на сервер
scp -i /home/cosmo/.ssh/id_ed25519_selectel \
  deploy/nginx/brobrogid.ru.conf \
  root@87.228.33.68:/etc/nginx/sites-available/brobrogid-site

scp -i /home/cosmo/.ssh/id_ed25519_selectel \
  deploy/nginx/brobrogid-security-headers.conf \
  root@87.228.33.68:/etc/nginx/snippets/brobrogid-security-headers.conf

# 3. Test + reload
ssh -i /home/cosmo/.ssh/id_ed25519_selectel root@87.228.33.68 \
  'nginx -t && systemctl reload nginx && echo OK'
```

Если `nginx -t` падает — config syntax error, fix локально и пробуй снова. **НЕ запускай `systemctl reload`** если test провалился.

## Включенные nginx файлы (для контекста)

| Путь на сервере | Что |
|---|---|
| `/etc/nginx/sites-available/brobrogid-site` | Главный server block для brobrogid.ru |
| `/etc/nginx/sites-enabled/brobrogid-site` | Symlink на above |
| `/etc/nginx/snippets/brobrogid-security-headers.conf` | Security headers (HSTS, CSP, X-Robots-Tag, nosniff и т.д.). Подключается include в каждый location |
| `/etc/nginx/snippets/brobrogid-poi-redirects.conf` | 78× `location = OLD { return 301 NEW; }` для Sprint 6 slug migration |
| `/etc/letsencrypt/live/brobrogid.ru/{fullchain,privkey}.pem` | SSL cert (Let's Encrypt, certbot, SAN: brobrogid.ru + www.brobrogid.ru, expires 2026-07-04) |

См. [`../08_infrastructure/nginx.md`](../08_infrastructure/nginx.md) для полной структуры nginx config.

## Rollback

Astro SSG = stateless. Rollback = redeploy предыдущей версии:

```bash
git log --oneline -10
git checkout <previous-commit-sha>
npm run build
bash scripts/deploy.sh --confirm
git checkout master  # обратно после успешного rollback
```

Старый React SPA остался в `/var/www/brobrogid/` на сервере как **emergency rollback**. Если новый сайт сломан совсем — `unlink sites-enabled/brobrogid-site && ln -s sites-available/brobrogid.ru sites-enabled/brobrogid.ru && nginx reload` вернёт старый React SPA.

## Troubleshooting

### `Cannot read properties of null (reading 'category')`

Shadowing файл (например `tsey-ski-resort.astro`) пытается прочитать POI который больше не существует с этим slug в БД. Произошёл slug rename в БД, но файл не переименован.

Fix: переименовать файл в новый slug, обновить `getPOIBySlug('new-slug')` внутри. Или удалить файл (тогда динамический `[slug].astro` сгенерит thin shell на новом URL автоматически).

### Preflight aborts с `SITE_UNDER_CONSTRUCTION=false but robots.txt still has Disallow`

Регекс preflight скрипта матчит первое вхождение в `src/data/site.ts`, может попасть в комментарий. Проверь что используется `^export const` префикс (если нет — это старая версия, обнови). Sprint 4 имел эту регрессию, фикс в коммите 503431b.

### Build падает с `npm audit` HIGH

Запусти `npm audit fix` без `--force`. Если не помогло — escalate (поднять Astro/Vite на минор версию).

### nginx -t passes но curl возвращает 502

Проверь `journalctl -u nginx -n 50`. Возможно syntax issue которая не ловится `-t` (например `if` внутри `location` имеет ограничения). Откати последний edit nginx config.

### `/og-default.jpg` 404

Файл `public/og-default.jpg` не закоммичен или потерялся. Восстанови:
```bash
curl -sL "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=1200&h=630&fit=crop&q=80&auto=format&fm=jpg" -o public/og-default.jpg
```
Затем rebuild + deploy.

### POI slugs показывают английские в sitemap после Sprint 6

Кэш Supabase или старый build. Запусти:
```bash
rm -rf dist/ .astro/
npm run build
```

## Cron / automation

**Нет автоматического deploy.** Каждый deploy делается вручную через `scripts/deploy.sh --confirm`. Это сознательное решение для контент-сайта где изменения редки и контролируемы.

Если в будущем понадобится cron rebuild (например, для daily content refresh) — добавить через `cron` на VPS, не GitHub Actions, чтобы избежать передачи SSH keys в CI.

## Verification после открытия индексации

Когда `SITE_UNDER_CONSTRUCTION = false`:

```bash
curl -s https://brobrogid.ru/robots.txt
# Должно: User-agent: *\nAllow: /\n\nSitemap: https://brobrogid.ru/sitemap-index.xml

curl -sI https://brobrogid.ru/ | grep -i robots
# Не должно показывать никаких meta robots

curl -sI https://brobrogid.ru/ | grep -i x-robots-tag
# Не должно: X-Robots-Tag из nginx тоже снят

curl -s https://brobrogid.ru/ossetia/ | grep noindex
# 0 совпадений
```

См. [`../07_seo/launch_procedure.md`](../07_seo/launch_procedure.md) для полной процедуры.

## Related

- [`stack.md`](stack.md) — что устанавливается через npm
- [`data_flow.md`](data_flow.md) — что происходит во время `npm run build`
- [`../08_infrastructure/nginx.md`](../08_infrastructure/nginx.md) — full nginx config
- [`../07_seo/launch_procedure.md`](../07_seo/launch_procedure.md) — открытие индексации
- [`../09_workflows/rollback.md`](../09_workflows/rollback.md) — emergency rollback
