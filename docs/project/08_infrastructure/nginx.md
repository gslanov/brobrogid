---
title: nginx — конфигурация
type: reference
audience: archimag, ops
owner: archimag
last_updated: 2026-04-07
---

# nginx на 87.228.33.68

Один nginx обслуживает 3 домена: `brobrogid.ru`, `app.brobrogid.ru`, `api.brobrogid.ru`.

## Файлы

```
/etc/nginx/
├── nginx.conf                              # глобальные настройки
├── sites-available/
│   ├── brobrogid.ru                       # Astro static
│   ├── app.brobrogid.ru                   # PWA SPA
│   └── api.brobrogid.ru                   # Supabase reverse proxy
└── sites-enabled/                          # symlinks
```

## brobrogid.ru (Astro)

```nginx
server {
  listen 443 ssl http2;
  server_name brobrogid.ru www.brobrogid.ru;

  ssl_certificate /etc/letsencrypt/live/brobrogid.ru/fullchain.pem;
  ssl_certificate_key /etc/letsencrypt/live/brobrogid.ru/privkey.pem;

  root /var/www/brobrogid;
  index index.html;

  add_header X-Robots-Tag "noindex, nofollow" always;  # ⚠️ снимется на launch
  add_header X-Content-Type-Options "nosniff" always;
  add_header X-Frame-Options "SAMEORIGIN" always;
  add_header Referrer-Policy "strict-origin-when-cross-origin" always;

  location / {
    try_files $uri $uri/ $uri.html =404;
  }

  location /_astro/ {
    expires 1y;
    add_header Cache-Control "public, immutable";
  }
}

server {
  listen 80;
  server_name brobrogid.ru www.brobrogid.ru;
  return 301 https://brobrogid.ru$request_uri;
}
```

## app.brobrogid.ru (PWA SPA)

```nginx
server {
  listen 443 ssl http2;
  server_name app.brobrogid.ru;

  ssl_certificate /etc/letsencrypt/live/app.brobrogid.ru/fullchain.pem;
  ssl_certificate_key /etc/letsencrypt/live/app.brobrogid.ru/privkey.pem;

  root /var/www/brobrogid-app;
  index index.html;

  add_header X-Robots-Tag "noindex, nofollow" always;  # ⚠️ NEVER снимается (admin под app.)

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

## api.brobrogid.ru (Supabase)

```nginx
server {
  listen 443 ssl http2;
  server_name api.brobrogid.ru;

  ssl_certificate /etc/letsencrypt/live/api.brobrogid.ru/fullchain.pem;
  ssl_certificate_key /etc/letsencrypt/live/api.brobrogid.ru/privkey.pem;

  client_max_body_size 10M;

  # PostgREST
  location /rest/v1/ {
    proxy_pass http://127.0.0.1:3000/;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto https;
  }

  # GoTrue
  location /auth/v1/ {
    proxy_pass http://127.0.0.1:9999/;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto https;
  }

  # CORS headers (если нужны)
  add_header Access-Control-Allow-Origin "https://brobrogid.ru, https://app.brobrogid.ru" always;
  add_header Access-Control-Allow-Methods "GET, POST, PATCH, DELETE, OPTIONS" always;
  add_header Access-Control-Allow-Headers "Content-Type, Authorization, apikey, Prefer, Range" always;
}
```

## Базовые настройки nginx.conf

```nginx
worker_processes auto;
events { worker_connections 1024; }

http {
  sendfile on;
  tcp_nopush on;
  keepalive_timeout 65;
  server_tokens off;

  # gzip
  gzip on;
  gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript image/svg+xml;
  gzip_min_length 1000;

  # brotli (если модуль установлен)
  # brotli on;
  # brotli_types text/plain text/css application/json application/javascript text/xml application/xml;

  include /etc/nginx/sites-enabled/*;
}
```

## Reload / restart

```bash
ssh selectel "nginx -t && nginx -s reload"      # без downtime
ssh selectel "systemctl restart nginx"           # полный restart (downtime ~1s)
```

## Логи

```
/var/log/nginx/access.log
/var/log/nginx/error.log
```

```bash
ssh selectel "tail -f /var/log/nginx/error.log"
ssh selectel "tail -100 /var/log/nginx/access.log | awk '{print \$9}' | sort | uniq -c"  # status codes
```

## Related

- `ssl.md` — Let's Encrypt certbot
- `../04_pwa_app/deploy.md` — деплой app.
- `../03_content_site/deploy.md` — деплой brobrogid.ru
- `../02_database/connections.md` — Supabase под капотом
