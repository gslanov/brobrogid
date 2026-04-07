---
title: PWA — Service Worker и offline
type: reference
audience: archimag, dev
owner: archimag
last_updated: 2026-04-07
---

# PWA setup

## Stack

- `vite-plugin-pwa` (workbox под капотом)
- Manifest генерируется автоматически из конфига
- SW регистрируется через `virtual:pwa-register`

## vite.config.ts (ключевое)

```ts
VitePWA({
  registerType: 'autoUpdate',
  manifest: {
    name: 'BROBROGID — Гид по Владикавказу',
    short_name: 'BROBROGID',
    theme_color: '#0f172a',
    background_color: '#ffffff',
    display: 'standalone',
    start_url: '/',
    icons: [/* 192, 512, maskable */]
  },
  workbox: {
    navigateFallback: null,  // см. prerender.md
    runtimeCaching: [
      {
        urlPattern: /\/content\/.*\.json$/,
        handler: 'StaleWhileRevalidate',
        options: { cacheName: 'content-json' }
      },
      {
        urlPattern: /\/images\/.*\.(png|jpe?g|webp|svg)$/,
        handler: 'CacheFirst',
        options: { cacheName: 'images', expiration: { maxEntries: 200, maxAgeSeconds: 90 * 24 * 3600 } }
      }
    ]
  }
})
```

## Кэш-стратегии

| Что | Стратегия | Почему |
|---|---|---|
| `/content/*.json` | StaleWhileRevalidate | мгновенный response из кэша + фоновое обновление |
| `/images/*` | CacheFirst (90 дней) | картинки иммутабельные |
| `/assets/*` (vite hashed) | CacheFirst (1 год) | hashed filenames → immutable |
| HTML pages | Network-first (default) | чтобы видеть свежий prerender |

## Offline режим

После первого визита всё работает offline:
- HTML страница уже в кэше
- JSON данные в IDB (см. `data_flow.md`)
- Картинки в SW кэше

**Что НЕ работает offline:**
- Поиск через Yandex Maps tiles (карта серая)
- Submission форм (queue не реализован)

## Kill switch для старого SW

В прошлом был задеплоен «kill switch» — пустой SW который unregister-ит сам себя:

```js
// dist/sw.js (старая версия)
self.addEventListener('install', () => self.skipWaiting())
self.addEventListener('activate', async () => {
  const regs = await self.registration.unregister()
  const clients = await self.clients.matchAll()
  clients.forEach(c => c.navigate(c.url))
})
```

Это было нужно когда старый SW кэшировал поломанные chunks. Сейчас новый SW работает нормально.

## Update flow

`registerType: 'autoUpdate'` означает:
1. SW проверяет update при каждой загрузке
2. Если есть новый — скачивает в фоне
3. На следующем визите активируется новый SW
4. Старые кэши очищаются

Пользователь не видит prompt, обновления тихие.

## Manifest icons

Файлы в `public/icons/`:
- `pwa-192x192.png`
- `pwa-512x512.png`
- `maskable-icon-512x512.png` (с safe area для Android)
- `apple-touch-icon.png` (iOS)

## Verify

```bash
curl https://app.brobrogid.ru/manifest.webmanifest | jq
curl -I https://app.brobrogid.ru/sw.js
# Chrome DevTools → Application → Service Workers
```

## Related

- `data_flow.md` — IDB как persistent layer
- `prerender.md` — почему `navigateFallback: null`
- `deploy.md` — как SW попадает на сервер
