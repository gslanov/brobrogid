---
title: Deploy app.brobrogid.ru
type: runbook
audience: archimag, dev, ops
owner: archimag
last_updated: 2026-04-07
---

# Деплой PWA

## Quick deploy

```bash
cd /home/cosmo/SOFT/COSMO/BROBROGID
./deploy.sh
```

`deploy.sh` делает:
1. `npm ci` — чистая установка зависимостей
2. `npm run build:seo` — vite build → prerender → sitemap
3. `rsync -avz --delete dist/ root@87.228.33.68:/var/www/brobrogid-app/`
4. `ssh ... "nginx -s reload"`

Время полного деплоя: ~5-7 минут (build 1-2 мин + prerender 3-4 мин + rsync 30-60 сек).

## Manual steps

### 1. Local build

```bash
npm ci
npm run build:seo
```

Проверь dist/:
```bash
ls dist/                     # должны быть index.html, assets/, content/, sw.js, sitemap.xml
ls dist/poi/ | wc -l          # ~119 prerendered POI dirs
```

### 2. Rsync

```bash
rsync -avz --delete \
  -e "ssh -i ~/.ssh/id_ed25519_selectel" \
  dist/ root@87.228.33.68:/var/www/brobrogid-app/
```

`--delete` важно — удаляет старые файлы (старые prerendered страницы для удалённых POI).

### 3. nginx reload

```bash
ssh -i ~/.ssh/id_ed25519_selectel root@87.228.33.68 "nginx -t && nginx -s reload"
```

`nginx -t` — проверка конфига перед reload.

## nginx конфиг (выдержка)

`/etc/nginx/sites-available/app.brobrogid.ru`:

```nginx
server {
  listen 443 ssl http2;
  server_name app.brobrogid.ru;

  root /var/www/brobrogid-app;
  index index.html;

  add_header X-Robots-Tag "noindex, nofollow" always;  # ⚠️ снимается при launch

  location / {
    try_files $uri $uri/index.html /index.html;
  }

  location /assets/ {
    expires 1y;
    add_header Cache-Control "public, immutable";
  }

  location /images/ {
    expires 90d;
  }

  location ~* \.html$ {
    expires 1h;
    add_header Cache-Control "must-revalidate";
  }
}
```

Полный конфиг в `../08_infrastructure/nginx.md`.

## Rollback

Backups dist/ хранятся локально:
```bash
# Перед каждым деплоем
cp -r dist dist.backup-$(date +%Y%m%d-%H%M)
```

Откатиться:
```bash
rsync -avz --delete dist.backup-20260407-1430/ \
  root@87.228.33.68:/var/www/brobrogid-app/
ssh selectel "nginx -s reload"
```

## Что обновить НЕ через deploy.sh

- **JSON content** (`public/content/*.json`) — обновить локально, потом commit + deploy
- **Иконки PWA** (`public/icons/*`) — то же
- **robots.txt** (`public/robots.txt`) — то же

Все они идут через build → попадают в `dist/` автоматически.

## Verify после деплоя

```bash
curl -I https://app.brobrogid.ru/                    # 200 + X-Robots-Tag noindex
curl https://app.brobrogid.ru/sitemap.xml | head     # XML с URLs
curl https://app.brobrogid.ru/poi/visadon-cyf | grep -c '<title>'  # >= 1
curl -I https://app.brobrogid.ru/sw.js               # 200, content-type javascript
```

## Troubleshooting

### Старые пользователи видят сломанную версию

Причина: SW кэширует chunks с старыми хэшами, новые chunks недоступны.

Фикс: уже встроен kill switch, новый SW сам обновится. Если совсем плохо — деплой пустого SW (см. `pwa.md`).

### 404 на новых страницах

Причина: prerender не сгенерил их (новый POI не попал в `dist/content/pois.json`).

Фикс: убедиться что JSON обновлён, rebuild.

### nginx 502

Причина: nginx запущен, но root каталог пустой / повреждённый rsync.

Фикс: проверь `/var/www/brobrogid-app/index.html` существует, повтори rsync.

## Related

- `../03_content_site/deploy.md` — деплой brobrogid.ru (другой workflow)
- `../08_infrastructure/nginx.md` — полный конфиг
- `../09_workflows/rollback.md` — общий процесс rollback
- `prerender.md`, `pwa.md` — что собирается
