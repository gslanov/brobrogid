---
title: Prerender — Puppeteer pipeline
type: reference
audience: archimag, dev, seo
owner: archimag
last_updated: 2026-04-07
---

# Prerender app.brobrogid.ru

## Зачем

`app.brobrogid.ru` — React SPA. Без prerender первый запрос отдаёт пустой `<div id="root"></div>` — плохо для:
- FCP/LCP метрик (Lighthouse)
- Open Graph превью (соц.шеринг)
- Резервного рендеринга если JS не загрузился

**SEO** prerender тут не цель — сайт под `noindex` (см. `../07_seo/launch_procedure.md`). Когда индекс откроется, prerender станет SEO-критичным.

## Pipeline

1. `npm run build` → `vite build` → `dist/`
2. `tsx scripts/prerender.ts`:
   - Поднимает локальный HTTP сервер на `dist/` (порт 4173)
   - Читает `dist/content/{pois,tours,guides}.json` → строит список ~145 URL
   - Запускает headless Chromium через `puppeteer`
   - 5 параллельных страниц
   - Для каждого URL:
     ```ts
     await page.evaluateOnNewDocument(() => {
       localStorage.setItem('brobrogid_onboarding', 'true')  // skip onboarding
     })
     await page.goto(url, { waitUntil: 'networkidle0', timeout: 30000 })
     await page.waitForFunction(
       () => document.querySelector('#root')?.children.length > 0
             && !document.querySelector('.animate-spin'),
       { timeout: 15000 }
     )
     const html = await page.content()
     ```
   - Сохраняет в `dist/<path>/index.html`
3. nginx `try_files $uri $uri/index.html /index.html` → отдаёт prerendered HTML
4. SPA hydrates на клиенте

## Список URL

| Категория | Шаблон | Кол-во |
|---|---|---|
| Static | `/`, `/map`, `/tours`, `/emergency`, `/search`, `/subscription` | 6 |
| POI | `/poi/{slug}` | 119 |
| POI menu | `/poi/{slug}/menu` (только `hasMenu=true`) | ~30 |
| Tour | `/tours/{slug}` | 20 |
| Guide | `/tours/guide/{slug}` | 8 |

**Исключено:** `/admin/*`, `/cart`, `/profile/*`, `/onboarding` (private).

Итого ~183 страницы. Время — 3-4 минуты.

## Service Worker gotcha

⚠️ vite-plugin-pwa с `navigateFallback: 'index.html'` ломает prerender — SW перехватывает navigation и отдаёт пустой кешированный `index.html` вместо prerendered HTML.

**Фикс в `vite.config.ts`:**
```ts
VitePWA({
  workbox: {
    navigateFallback: null,  // не перехватывать навигации
  }
})
```

## Build script

`package.json`:
```json
"build": "vite build",
"build:seo": "npm run build && tsx scripts/prerender.ts && tsx scripts/generate-sitemap.ts"
```

`deploy.sh` использует `build:seo`.

## Verify

```bash
curl http://localhost:4173/poi/visadon-cyf | grep -c '<script type="application/ld+json"'
# Должно быть >= 1

curl http://localhost:4173/poi/visadon-cyf | grep -c '<title>'
# >= 1, не пустой
```

## Related

- `../07_seo/launch_procedure.md` — связь с SEO launch
- `data_flow.md` — что рендерится
- `seo.md` — meta-tags strategy
