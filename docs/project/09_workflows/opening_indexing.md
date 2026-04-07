---
title: Opening indexing — pointer
type: pointer
audience: archimag, seo, ops
owner: archimag
last_updated: 2026-04-07
---

# Открытие индексации

⚠️ **НЕ запускать без явного сигнала пользователя.**

Полный runbook → **`../07_seo/launch_procedure.md`**.

## Краткая суть

Сайт защищён 4-layer noindex:
1. `nginx X-Robots-Tag: noindex, nofollow` (header)
2. `robots.txt: Disallow: /`
3. `<meta name="robots" content="noindex">` в HTML через SEO компонент
4. `SITE_UNDER_CONSTRUCTION = true` глобальный флаг

Открытие = атомарное снятие всех 4 слоёв + проверка + submit в Google/Yandex Search Console.

⚠️ **`app.brobrogid.ru` НЕ открывается никогда** — там админка с hardcoded creds. Открывается только `brobrogid.ru`.

## Related

- `../07_seo/launch_procedure.md` — полный runbook
- `../07_seo/robots_and_noindex.md` — стратегия (заполняется SEO агентом)
- `../03_content_site/seo.md` — техническая реализация в Astro
- `../04_pwa_app/seo.md` — техническая реализация в PWA
