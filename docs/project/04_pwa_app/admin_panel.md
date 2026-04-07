---
title: Admin Panel — CRUD CMS
type: reference
audience: archimag, dev, security
owner: archimag
last_updated: 2026-04-07
---

# Admin Panel в app.brobrogid.ru

## Что это

Полноценный CMS интерфейс для управления контентом проекта. Доступен по URL `/admin` на `app.brobrogid.ru`. Поддерживает CRUD для всех 7 основных сущностей.

## ⚠️ КРИТИЧНОЕ ПРЕДУПРЕЖДЕНИЕ

**Текущая реализация имеет CRITICAL security finding** (SENTINEL):

1. **Hardcoded credentials** в `src/features/admin/lib/auth.ts:10-23` — три пары username/password захардкожены в client bundle
2. **SHA-256 без соли** — пароли хэшируются single-pass без salt, ломается rainbow table за секунды
3. **Client-side только** — никакой серверной проверки, защита только в UI слое
4. **Session в localStorage** — XSS → session theft trivially

**Mitigation сейчас:**
- `app.brobrogid.ru` под `noindex` (всегда, навсегда)
- `/admin` URL не афишируется нигде
- Доступ требует знания URL + угадывания пароля + ломания SHA-256

**Полный фикс — Pool 4** — миграция на Supabase Auth:
- Удалить `auth.ts` полностью
- Заменить на `supabase.auth.signInWithPassword()`
- Guard через `supabase.auth.getSession()` + проверку JWT role в `app_metadata.role`
- Все мутации через authenticated supabase client (RLS на бэкенде)

## Структура

`src/features/admin/` — самодостаточный feature folder.

```
src/features/admin/
├── pages/                                # 17 страниц
│   ├── AdminLayout.tsx                  # Sidebar + Outlet, auth guard
│   ├── AdminDashboard.tsx               # Главная админки, статистика
│   ├── AdminLogin.tsx                   # Форма логина
│   ├── AdminExport.tsx                  # Экспорт данных в JSON
│   │
│   ├── AdminPOIList.tsx                 # POI: list view с поиском, фильтрами
│   ├── AdminPOIForm.tsx                 # POI: create/edit form
│   │
│   ├── AdminMenuItemList.tsx            # MenuItem CRUD
│   ├── AdminMenuItemForm.tsx
│   │
│   ├── AdminTourList.tsx                # Tour CRUD
│   ├── AdminTourForm.tsx
│   │
│   ├── AdminGuideList.tsx               # Guide CRUD
│   ├── AdminGuideForm.tsx
│   │
│   ├── AdminReviewList.tsx              # Review CRUD
│   ├── AdminReviewForm.tsx              # с cascading select для target_type
│   │
│   ├── AdminEmergencyList.tsx           # Emergency contacts
│   ├── AdminEmergencyForm.tsx
│   │
│   ├── AdminTransportList.tsx           # Transport routes
│   └── AdminTransportForm.tsx
│
├── components/                           # 14 shared components
│   ├── AdminSidebar.tsx                 # Навигация по сущностям
│   ├── AdminTable.tsx                   # Generic таблица с pagination, sort, search
│   ├── AdminFormField.tsx               # Wrapper для form fields
│   ├── ConfirmDialog.tsx                # Модалка подтверждения удаления
│   ├── SelectField.tsx                  # Стилизованный select
│   ├── LocalizedInput.tsx               # Input для { ru, en } полей
│   ├── LocalizedTextarea.tsx
│   ├── LocationPicker.tsx               # Lat/lng + address LocalizedText
│   ├── HoursEditor.tsx                  # Mon-Sun часы работы
│   ├── TagsInput.tsx                    # Массив тегов
│   ├── PhotosManager.tsx                # Массив URL фото
│   ├── DatesEditor.tsx                  # Массив ISO дат
│   ├── RouteEditor.tsx                  # JSON массив координат для тура
│   ├── StopsEditor.tsx                  # Остановки транспорта (вложенный объект)
│   └── LanguageToggle.tsx               # ru/en переключатель
│
├── hooks/
│   ├── useAdminData.ts                  # Generic CRUD hook через IDB
│   └── useAdminExport.ts                # Экспорт всех stores в JSON для скачивания
│
└── lib/
    ├── admin-db.ts                      # Raw IDB CRUD wrapper
    └── auth.ts                          # ⚠️ HARDCODED CREDS — SENTINEL CRITICAL
```

## Маршруты

В `src/app/router.tsx`:

```
/admin/login              → AdminLogin
/admin                    → AdminLayout (с auth guard)
  ├── /admin/             → AdminDashboard
  ├── /admin/pois         → AdminPOIList
  ├── /admin/pois/new     → AdminPOIForm (create mode)
  ├── /admin/pois/:id     → AdminPOIForm (edit mode)
  ├── /admin/menu-items   → AdminMenuItemList
  ├── /admin/menu-items/new
  ├── /admin/menu-items/:id
  ├── /admin/tours        → AdminTourList
  ├── /admin/tours/new
  ├── /admin/tours/:id
  ├── /admin/guides       → AdminGuideList
  ├── /admin/guides/new
  ├── /admin/guides/:id
  ├── /admin/reviews      → AdminReviewList
  ├── /admin/reviews/new
  ├── /admin/reviews/:id
  ├── /admin/emergency    → AdminEmergencyList
  ├── /admin/emergency/new
  ├── /admin/emergency/:id
  ├── /admin/transport    → AdminTransportList
  ├── /admin/transport/new
  ├── /admin/transport/:id
  └── /admin/export       → AdminExport
```

Всего 17 страниц + 1 layout = 18 routes.

## Auth flow (текущий, проблемный)

1. User открывает `/admin` (или `/admin/anything`)
2. `AdminLayout` проверяет `isAuthenticated()` (читает `localStorage.getItem('brobrogid_admin_session')`)
3. Если нет сессии → `<Navigate to="/admin/login">`
4. На `/admin/login` пользователь вводит username + password
5. `auth.ts.authenticate(username, password)`:
   - Хеширует password через SHA-256
   - Сравнивает с захардкоженным `ADMIN_USERS` массивом (3 user'а)
   - Если совпадает — `localStorage.setItem('brobrogid_admin_session', JSON.stringify({...}))`
6. Сессия живёт 24 часа (сравнение времени)

**Атаки которые работают:**
- Открыть DevTools → Sources → найти `auth.ts` → увидеть пароли в комментах рядом с хэшами
- `localStorage.setItem('brobrogid_admin_session', '{"username":"admin","loginAt":"<now>"}')` через консоль → войти без пароля
- XSS на любой странице app.brobrogid.ru → script ворует/подделывает session

## CRUD pattern (через useAdminData)

Generic hook для всех сущностей:

```typescript
// hooks/useAdminData.ts
export function useAdminData<T extends { id: string }>(
  storeName: StoreName
): UseAdminDataResult<T> {
  // Загружает все записи через adminGetAll
  // Возвращает: items, isLoading, count, getById, create, update, remove, reload
}
```

Использование в страницах:

```typescript
// AdminPOIList.tsx
const { items, isLoading, remove } = useAdminData<POI>('pois')
```

`adminGetAll`, `adminPut`, `adminRemove` — простые wrappers над idb API.

## Generic AdminTable component

`AdminTable.tsx` — переиспользуемая таблица для всех list pages:

- Props: `columns`, `data`, `onEdit`, `onDelete`, `searchKeys`, `searchPlaceholder`, `emptyMessage`
- Поиск через Fuse.js
- Сортируемые колонки (click header)
- Пагинация (25 на страницу)
- Edit/Delete buttons на каждой строке
- Confirm dialog на delete

Это даёт консистентный UX для всех 7 сущностей.

## Form components

Специальные для bilingual content:

- **`LocalizedInput`** — два поля (ru/en) с табами для переключения. Используется для `name`, `address`, etc.
- **`LocalizedTextarea`** — то же но textarea для description
- **`LocationPicker`** — lat, lng (number inputs) + LocalizedInput для address
- **`HoursEditor`** — 7 строк (Mon-Sun) с inputs для каждого дня
- **`TagsInput`** — chips с добавлением через Enter
- **`PhotosManager`** — список URL с кнопкой "+" и preview
- **`DatesEditor`** — список ISO дат
- **`RouteEditor`** — textarea с JSON массивом координат `[{lat, lng}, ...]` для туров
- **`StopsEditor`** — вложенная форма для остановок транспорта (LocalizedText name + lat/lng per stop)

## Запись изменений

**Все изменения идут в IDB**, не в Supabase:

```typescript
// AdminPOIForm.tsx
const { create, update } = useAdminData<POI>('pois')

async function handleSubmit() {
  if (isEdit) {
    await update(poi)  // db.put('pois', poi)
  } else {
    await create(poi)  // db.put('pois', poi) — put работает как upsert
  }
  navigate('/admin/pois')
}
```

**Это значит:**
1. Изменения видит ТОЛЬКО этот пользователь в этом браузере
2. Через `app.brobrogid.ru/poi/poi-001` пользователь увидит отредактированную версию (потому что POI читается из IDB)
3. **Но другие пользователи** этого не увидят (у них свой IDB snapshot)
4. **brobrogid.ru** этого не увидит (читает напрямую из Supabase)

**Workflow для админа сейчас:**
1. Внести изменения через админку
2. Открыть `/admin/export`
3. Скачать обновлённые JSON
4. Вручную закоммитить в `public/content/*.json`
5. Запустить отдельный import script для Supabase
6. Rebuild оба сайта
7. Deploy

**Это сложно и подвержено ошибкам.** Pool 4 закроет: админка будет писать напрямую в Supabase, оба сайта увидят изменения после rebuild.

## i18n

Админка полностью локализована (ru/en):

- Все строки через `useTranslation()` namespace `admin.*`
- ~230 ключей в `src/i18n/locales/{ru,en}.json` под `admin.*`
- Переключатель ru/en в header через `LanguageToggle` компонент
- Влияет только на UI админки — данные в `LocalizedInput` редактируются для обоих языков

## Что Pool 4 изменит

После Pool 4:

1. **`auth.ts` удаляется**, заменяется на `supabase.auth.signInWithPassword()`
2. **Сессия в httpOnly cookie** через GoTrue, не в localStorage
3. **`useAdminData` использует Supabase**, не IDB
4. **Изменения сразу в БД**, оба сайта видят после rebuild
5. **`/admin/export` становится менее критичным** (может остаться для backups)
6. **RLS защищает всё** на сервере, клиент только UI
7. **Hardcoded passwords удаляются** — admin user через Supabase Studio

## Deploy и обновления

Админка деплоится вместе с остальным app через `./deploy.sh`. Никаких отдельных шагов.

После Pool 4 — нужна будет миграция существующих коллекций избранного из IDB пользователей в Supabase. Это будет тонкая миграция требующая user consent.

## Related

- `data_flow.md` — общий data flow PWA
- `i18n.md` — i18n setup
- `../02_database/schema.md` — структура БД (после Pool 4 будет источник истины)
- `../06_security/known_issues.md` — SENTINEL CRITICAL про hardcoded creds
- `../10_history/timeline.md` — когда админка была построена и почему
