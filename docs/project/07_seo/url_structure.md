---
title: URL Structure — STUB FOR SEO AGENT
type: stub
audience: seo-agent
owner: archimag (taskwriter)
last_updated: 2026-04-07
status: empty
priority: 2
estimated_time: 1-2 hours
---

# 🔴 ЗАДАЧА ДЛЯ SEO АГЕНТА — url_structure.md

> Это файл-заглушка с заданием. Прочитай, выполни, замени содержимое.

## Что нужно сделать

Документировать **полную URL-иерархию сайта `brobrogid.ru`** — какая страница где живёт, почему именно так, какие slug-конвенции, как обрабатываются legacy URLs.

## Источники данных

1. **`https://brobrogid.ru/sitemap-0.xml`** — реальные URL на проде (через curl)
2. **`/home/cosmo/SOFT/COSMO/BROMARKET/ossetia-structure.md`** — спека целевой структуры (написана в самом начале)
3. **`/home/cosmo/SOFT/COSMO/BROMARKET/BRIEFING_sprint6_russian_slugs.md`** — про миграцию slugs
4. **БД:** `https://api.brobrogid.ru/rest/v1/pois?select=id,slug,slug_legacy,category,subcategory` — все POI с их slug
5. **nginx redirects:** на сервере `/etc/nginx/sites-available/brobrogid-site` или snippet `/etc/nginx/snippets/brobrogid-poi-redirects.conf` (попроси archimag прочитать если нет SSH доступа)

## Что должно быть в документе

```markdown
---
title: URL Structure — иерархия brobrogid.ru
type: reference
audience: seo, content, brobrogid-site-agent
owner: <твой агент>
last_updated: 2026-04-07
---

# URL структура

## Дизайн-принципы

Список 5-7 принципов которым следует структура. Например:
- Русские транслитерированные slugs (после Sprint 6)
- Иерархическая хлебная крошка в URL
- Категория → подкатегория → конкретное место
- Транспорт отдельно от мест (запросы про направление, не про город)
- Никаких ID в URL (`/poi/poi-001` не используется)
- Trailing slash везде (для consistency)
- Lowercase only

## Полная карта URL

Дерево всех URL текущего сайта. Группируй по разделам:

### / (главная)
### /ossetia/ (раздел Осетии)
- /ossetia/
- /ossetia/kak-dobratsya/
  - /ossetia/kak-dobratsya/iz-moskvy/
  - /ossetia/kak-dobratsya/iz-moskvy/na-samolete/
  - ... все
- /ossetia/vladikavkaz/
  - ... все подстраницы
- /ossetia/mesta/
  - /ossetia/mesta/ushchelya/
    - /ossetia/mesta/ushchelya/{slug}/  ← список slugs (101 POI)
  - /ossetia/mesta/vodopady/
  - ... все категории
- /ossetia/tury-ekskursii/
- /ossetia/gidy/
- /ossetia/marshruty/
- /ossetia/kuhnya/
- /ossetia/ob-osetii/
- /ossetia/pogoda-i-sezony/
- /ossetia/karta/
- /ossetia/blog/

### Будущие регионы (зарезервировано, ещё не реализовано)
- /kbr/
- /dagestan/
- /chechnya/
- /ingushetia/
- /kchr/

## Маппинг таблиц БД на URL

Для каждой сущности — как генерится URL:

| Сущность | Источник slug | URL pattern | Пример |
|---|---|---|---|
| POI (nature) | `pois.slug` | `/ossetia/mesta/{subcategory}/{slug}/` | `/ossetia/mesta/ushchelya/tseyskoe-uschele/` |
| POI (food) | `pois.slug` | `/ossetia/vladikavkaz/restorany/{slug}/` | `/ossetia/vladikavkaz/restorany/man-gal/` |
| POI (accommodation) | `pois.slug` | `/ossetia/vladikavkaz/oteli/{slug}/` | `/ossetia/vladikavkaz/oteli/otel-imperial/` |
| Tour | `tours.slug` | `/ossetia/tury-ekskursii/{slug}/` | `/ossetia/tury-ekskursii/dargavs-city-of-the-dead/` |
| Guide | `guides.slug` | `/ossetia/gidy/{slug}/` | `/ossetia/gidy/alan-dzutsev/` |

## Маппинг category → URL для POI

POI имеет `category` (enum) и `subcategory` (text). Логика mapping в `mapPoiToUrlParams()` функции (находится в `brobrogid-site` репо `src/utils/poi-url.ts`). Опиши эту логику словами, не копируй код.

## Slug convention

После Sprint 6 все slugs — русская транслитерация name.ru:

- Lowercase only
- Кириллица → латиница по таблице (см. `supabase/scripts/slug_migration_dry_run.ts` в BROBROGID репо)
- Особый случай: ё → yo, щ → sch, æ (осетинский) → ae
- Кавычки и спецсимволы убираются
- Множественные дефисы → один
- Длина ≤ 80 символов (обрезка по последнему дефису)
- Уникальность гарантирована UNIQUE constraint на `pois.slug`

Примеры:
- "Цейское ущелье" → `tseyskoe-uschele`
- "Даргавс — Город мёртвых" → `dargavs-gorod-myortvyh`
- "Хостел HohlÆnd" → `hostel-hohlaend`

## Legacy slugs и 301 редиректы

До Sprint 6 был 101 POI с английскими slugs (исторический долг — изначально импорт был на английском). После миграции:

- Старые slugs сохранены в `pois.slug_legacy`
- Сгенерированы nginx 301 redirects (78 для publishable POI)
- Redirect map в `/etc/nginx/snippets/brobrogid-poi-redirects.conf`
- Defence-in-depth: `getPOIBySlug()` функция в Astro делает fallback по `slug_legacy` если primary slug не нашёлся

Примеры редиректов:
- `/ossetia/mesta/ushchelya/tsey-gorge/` → 301 → `/ossetia/mesta/ushchelya/tseyskoe-uschele/`
- `/ossetia/mesta/istoricheskie-mesta/dargavs--city-of-the-dead/` → 301 → `/ossetia/mesta/istoricheskie-mesta/dargavs-gorod-myortvyh/`
- `/ossetia/vladikavkaz/oteli/imperial-hotel/` → 301 → `/ossetia/vladikavkaz/oteli/otel-imperial/`

## Trailing slash

Все URL заканчиваются на `/`. Astro генерит `index.html` внутри директории. nginx serve через `try_files`.

## Multilingual considerations

Сейчас сайт **только на русском**. Hreflang не используется (нет английской версии).

Если понадобится английская версия в будущем — варианты:
- `/en/ossetia/...` (subdirectory) — простой
- `en.brobrogid.ru/ossetia/...` (subdomain) — отдельный crawl budget
- `?lang=en` (query param) — плохо для SEO

Текущая позиция: не нужно. Аудитория русскоязычная.

## Что НЕ индексируется

URL которые исключены из sitemap (через robots.txt и/или meta noindex):
- `/admin*` — только в `app.brobrogid.ru`, на `brobrogid.ru` не существует
- preview-a, preview-b пути из brobrogid.ru sitemap (если есть)
- любые dev/staging пути

## Открытые вопросы

Если есть — список нерешённых url-структурных вопросов.

## Related

- Cross-references на keyword_research.md, sitemap.md, ../03_content_site/routing.md
```

## После завершения

1. Удали блок "ЗАДАЧА"
2. Обнови frontmatter (type: reference, owner, audience)
3. Отметь в TASKS.md как ✅ done
4. Сообщи archimag
