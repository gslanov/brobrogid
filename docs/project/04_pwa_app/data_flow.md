---
title: PWA Data Flow — JSON → IDB → Zustand → React
type: reference
audience: archimag, dev
owner: archimag
last_updated: 2026-04-07
---

# Data flow в app.brobrogid.ru

## Главный принцип

`app.brobrogid.ru` **не читает Supabase напрямую**. Вместо этого использует **JSON-snapshot** в `public/content/*.json`, который при build time копируется в `dist/content/`, а в браузере фетчится и кладётся в IndexedDB.

Этот pattern исторический — был построен до того как появилась Supabase. Он работает offline и быстро, но требует ручной синхронизации с БД. **Pool 4 закроет этот technical debt** миграцией на прямые `@supabase/supabase-js` вызовы.

## Полный flow

```
Supabase БД (api.brobrogid.ru)
        │
        ▼ ручной экспорт через scripts/import.ts (или прямая правка JSON)
        │
public/content/*.json   ←─── source of truth для app.brobrogid.ru
        │
        ▼ vite build копирует as-is в dist/
        │
dist/content/*.json
        │
        ├──────────────────────────┐
        ▼                          ▼
Puppeteer prerender         Runtime в браузере
(scripts/prerender.ts)      ▼
        │                   seedDatabase() в src/shared/lib/seed.ts
        │                   ▼
        │                   IndexedDB (через idb library)
        │                   ▼
        │                   useDataStore.loadAll() (Zustand)
        │                   ▼
        │                   React компоненты подписаны на store
        │                   ▼
        │                   UI рендерится
        ▼
prerendered HTML (189 страниц)
        │
        ▼ rsync на сервер
        │
/var/www/brobrogid-app/   ←─── nginx serve
```

## Шаг 1: JSON snapshot

**Расположение:** `public/content/`

**Файлы:**

| Файл | Записей | Структура |
|---|---|---|
| `pois.json` | 119 | Array of POI objects |
| `tours.json` | 20 | Array of Tour objects |
| `guides.json` | 8 | Array of Guide objects |
| `reviews.json` | 499 | Array of Review objects |
| `menu-items.json` | 275 | Array of MenuItem objects |
| `emergency.json` | — | **Object** (не array) с ключами `emergencyNumbers`, `hospitals`, `traumaCenters`, `pharmacies`, `usefulContacts` |
| `transport.json` | — | **Object** с ключами `routes`, `taxis`, `tips`, `rentals` |

**Важно:** `emergency.json` и `transport.json` имеют структуру отличную от других — это nested objects с группировкой по типу. `seed.ts` нормализует их в массивы `EmergencyContact[]` и `TransportRoute[]` при загрузке. См. секцию "Нормализация" ниже.

**Как обновить:** существует два способа:

1. **Через Supabase → JSON exporter:** скрипт читает БД и перезаписывает JSON. Этот pattern использовался при Sprint 6 для синхронизации новых slugs:
   ```python
   import json, urllib.request
   ANON = "..."
   req = urllib.request.Request(
       "https://api.brobrogid.ru/rest/v1/pois?select=*",
       headers={"apikey": ANON}
   )
   with urllib.request.urlopen(req) as r:
       data = json.loads(r.read())
   with open('public/content/pois.json', 'w', encoding='utf-8') as f:
       json.dump(data, f, ensure_ascii=False, indent=2)
   ```

2. **Прямая правка JSON в редакторе** — если меняем 1-2 поля. Не рекомендуется (можно поломать формат), но работает.

## Шаг 2: Vite build копирует JSON в dist

`public/` каталог копируется vite as-is в `dist/`. Никаких трансформаций. JSON остаются как есть.

После `npm run build`:
- `dist/content/pois.json` (тот же контент)
- `dist/content/tours.json`
- ...

Это единственное что нужно для prerender и для runtime в браузере.

## Шаг 3a: Puppeteer prerender (build-time SEO)

См. отдельный документ `prerender.md`. Кратко:

1. После `vite build` запускается `scripts/prerender.ts`
2. Запускает локальный HTTP сервер на `dist/`
3. Читает JSON из `dist/content/` для построения списка URL
4. Headless Chromium открывает каждый URL, ждёт пока React загрузит данные
5. Сохраняет финальный HTML в `dist/{path}/index.html`
6. Итог: 189 prerendered страниц

**Зачем prerender:** быстрый FCP (First Contentful Paint), HTML для соц.шеринга (Open Graph), резервный контент если JS не загрузится. Это **не SEO** (сайт под `noindex`), это просто скорость и совместимость.

## Шаг 3b: Runtime — seedDatabase в браузере

При первом визите пользователя:

1. React грузится, `App.tsx` вызывает `init()` в `useEffect`
2. `init()` → `await seedDatabase()` (`src/shared/lib/seed.ts`)
3. `seedDatabase` проверяет `db.count('pois') > 0` — если есть данные, пропускает (idempotent)
4. Если БД пустая — параллельно `fetch('/content/pois.json')`, `fetch('/content/tours.json')`, etc.
5. Нормализует `emergency.json` и `transport.json` в arrays
6. Открывает IDB транзакцию на 8 stores
7. `put` каждой записи в свой store
8. Создаёт дефолтную коллекцию `'favorites'` для будущих избранных

**Идемпотентность:** seed запускается один раз. На повторных визитах `db.count('pois')` уже > 0, seed не запускается. Это ускоряет загрузку.

**Когда seed запустится снова:**
- Если пользователь очистил storage браузера
- Если IDB удалён (например, "Clear cookies and site data")
- Если version bump в `db.ts` (`openDB('brobrogid', N)`) — все stores удаляются и пересоздаются

## Нормализация emergency.json и transport.json

JSON структура:

```json
// emergency.json — НЕ array, а object с группами
{
  "emergencyNumbers": [
    { "service": { "ru": "...", "en": "..." }, "number": "112", ... }
  ],
  "hospitals": [
    { "name": { "ru": "...", "en": "..." }, "phone": "...", "location": { "lat": 43.0298, "lng": 44.6812 }, ... }
  ],
  "traumaCenters": [...],
  "pharmacies": [...],
  "usefulContacts": [...]
}
```

Но IDB ожидает `EmergencyContact[]` (плоский массив со схемой `{ id, type, name, phone, location, is24h }`).

`seed.ts` имеет функцию `normalizeEmergency()`:
- Перебирает все группы
- Конвертирует каждый item в `EmergencyContact` shape
- Назначает `type` ('police', 'hospital', 'trauma', 'pharmacy')
- Генерит `id` (`emergency-1`, `emergency-2`, ...)
- Извлекает `location` из координат + address
- Устанавливает `is_24h` где применимо

Аналогично `normalizeTransport()` для `transport.json` — конвертит nested `{routes: [...]}` в `TransportRoute[]`.

**Этот баг был причиной серьёзной проблемы** на ранней стадии (Sprint 0): seed.ts не нормализовал emergency/transport, делал `for (const item of data as any[])` на объектах, что в JS не падает (просто not iterable), но IDB транзакция падала. После фикса в seed.ts всё работает.

## Шаг 4: Zustand store

После seed React загружает данные:

```typescript
// src/data/stores/data-store.ts
useDataStore.loadAll()
```

Это:
1. Открывает IDB через `getDB()` (singleton)
2. `Promise.all([db.getAll('pois'), db.getAll('tours'), db.getAll('guides'), db.getAll('collections')])`
3. Загружает userPrefs отдельно
4. `set({ pois, tours, guides, collections, userPrefs, isLoaded: true })`

**Что НЕ загружается в store:**
- `reviews` — не нужны на главной, фетчатся on-demand на детальной странице POI
- `menuItems` — то же, фетчатся когда открывается меню ресторана
- `emergency`, `transport` — фетчатся на соответствующих страницах
- `orders` — управляется отдельным `order-store.ts`

**Почему такая селективность:** уменьшаем initial state (быстрее first render), точечно загружаем по требованию.

## Шаг 5: React компоненты

```typescript
// Пример из ExplorePage
const pois = useDataStore((s) => s.pois)
const isLoaded = useDataStore((s) => s.isLoaded)
```

Zustand selectors заставляют компонент перерендериться только при изменении выбранного куска state.

**Pattern для on-demand данных:**

```typescript
// POIDetailPage.tsx
const { id } = useParams()
const [reviews, setReviews] = useState<Review[]>([])

useEffect(() => {
  async function load() {
    const db = await getDB()
    // Используем составной индекс by-target
    const txn = db.transaction('reviews')
    const idx = txn.store.index('by-target')
    const range = IDBKeyRange.only(['poi', id])
    const result = await idx.getAll(range)
    setReviews(result)
  }
  load()
}, [id])
```

## Шаг 6: Изменения данных

**toggleFavorite (избранное):**
1. User clicks heart icon
2. `useDataStore.toggleFavorite(poiId)`
3. Находит / создаёт коллекцию `'favorites'` в local state
4. Toggle poiId в массиве `poiIds`
5. `db.put('collections', updated)` — запись в IDB
6. `set({ collections: ... })` — обновление Zustand
7. React перерендерит подписанные компоненты

**Изменения НЕ синхронизируются с Supabase.** Это локальный state на устройстве пользователя. Если пользователь сменит браузер или очистит storage — избранное потеряется.

**Pool 4 это исправит:** избранное будет в Supabase `collections` таблице, привязанное к auth.users.

## Точки боли (technical debt)

1. **Snapshot устаревает** — изменения в Supabase не видны без ручного re-export JSON + rebuild + deploy
2. **Дублирование данных** — JSON в repo + IDB в браузере + Supabase в БД (3 копии одних данных)
3. **Нет аутентификации** — admin pages защищены только клиентским паролем (SENTINEL CRITICAL)
4. **Нет offline conflict resolution** — если пользователь редактирует офлайн, его правки не синхронизируются с сервером (потому что нет сервера для них)
5. **Размер JSON растёт** — все 119 POI грузятся при первом визите, даже если пользователь смотрит только одну страницу. ~50KB pois.json без проблем, но при 1000+ POI это станет заметно

## Что Pool 4 изменит

После миграции:

1. `seed.ts` удаляется (не нужен)
2. `public/content/*.json` удаляется (не нужны)
3. Stores загружают данные напрямую через `@supabase/supabase-js`:
   ```typescript
   const { data: pois } = await supabase.from('pois').select('*')
   ```
4. IDB остаётся как **offline cache** — пишем туда после успешного fetch, читаем при отсутствии сети
5. Service Worker (workbox) кэширует ответы Supabase API
6. Admin авторизация через Supabase Auth, hardcoded creds удаляются
7. Изменения в админке сразу попадают в Supabase, оба сайта видят свежие данные

## Related

- `prerender.md` — детально про Puppeteer pipeline
- `admin_panel.md` — как админка читает/пишет
- `i18n.md` — language preference тоже в IDB
- `pwa.md` — service worker кэширование
- `../02_database/schema.md` — Supabase schema (общая для PWA и Astro сайта)
- `../00_overview/architecture.md` — общая картина двух сайтов
