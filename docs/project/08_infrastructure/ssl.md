---
title: SSL — Let's Encrypt
type: runbook
audience: archimag, ops
owner: archimag
last_updated: 2026-04-07
---

# SSL сертификаты

## Provider

Let's Encrypt через `certbot` (standalone webroot mode).

## Текущие сертификаты

```
/etc/letsencrypt/live/
├── brobrogid.ru/           # + www.brobrogid.ru
├── app.brobrogid.ru/
└── api.brobrogid.ru/
```

Каждый — `fullchain.pem` + `privkey.pem` + `chain.pem` + `cert.pem`.

## Получить новый сертификат

```bash
ssh selectel
certbot certonly --webroot -w /var/www/brobrogid \
  -d brobrogid.ru -d www.brobrogid.ru \
  --email admin@brobrogid.ru --agree-tos --no-eff-email
```

Для нового домена — добавить server block в nginx (HTTP only сначала), потом certbot, потом обновить server block на HTTPS, reload.

## Auto-renewal

`certbot.timer` (systemd) проверяет каждые 12 часов:
```bash
ssh selectel "systemctl status certbot.timer"
ssh selectel "systemctl list-timers | grep certbot"
```

После renewal — `certbot` сам делает `nginx -s reload` через post-hook:
```
/etc/letsencrypt/renewal-hooks/post/reload-nginx.sh:
  #!/bin/bash
  nginx -s reload
```

## Manual renewal

```bash
ssh selectel "certbot renew"                    # все, dry-run
ssh selectel "certbot renew --force-renewal"    # принудительно
```

## Проверка

```bash
ssh selectel "certbot certificates"
echo | openssl s_client -servername brobrogid.ru -connect brobrogid.ru:443 2>/dev/null | openssl x509 -noout -dates
```

## Срок

Let's Encrypt сертификаты — 90 дней. Auto-renewal срабатывает при <30 днях. Если auto не сработал — на email из `--email` придёт notification за 20 дней до истечения.

## Troubleshooting

### Renewal failed: "DNS challenge"
Используется webroot, не DNS. Проверь что nginx смотрит на `/var/www/<domain>` и доступен по `http://<domain>/.well-known/acme-challenge/`.

### Certificate expired
```bash
ssh selectel "certbot renew --force-renewal && nginx -s reload"
```

### "Too many requests"
Let's Encrypt rate limit — 50 certs/week per domain. Подожди.

## Related

- `nginx.md` — где сертификаты подключены
- `../06_security/secrets_management.md` (stub)
