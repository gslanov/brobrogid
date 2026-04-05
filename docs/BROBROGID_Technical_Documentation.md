# BROBROGID — Technical Documentation

**Version:** 1.0.0
**Last Updated:** 2026-04-03

---

## 1. Project Overview

**BROBROGID** — Progressive Web Application (PWA), мобильный гид-путеводитель по Владикавказу и Северной Осетии.

Приложение позволяет:
- Исследовать достопримечательности, рестораны, природу и культурные объекты
- Просматривать интерактивную карту с кластеризацией и фильтрацией
- Бронировать экскурсии и просматривать профили гидов
- Заказывать еду из ресторанов (меню, корзина, оплата через СБП)
- Находить экстренные службы
- Сохранять избранные места в коллекции
- Работать офлайн (PWA + IndexedDB)
- Переключать язык (русский / английский)

---

## 2. Tech Stack

### Core
| Технология | Версия | Назначение |
|---|---|---|
| React | 19.2.4 | UI-библиотека |
| TypeScript | ~5.9.3 | Типизация |
| Vite | 8.0.1 | Сборщик |
| React Router DOM | 7.13.2 | Роутинг |

### State Management
| Технология | Версия | Назначение |
|---|---|---|
| Zustand | 5.0.12 | Глобальный стейт |
| React Query | 5.95.2 | Серверный стейт, кэширование |

### UI & Animation
| Технология | Версия | Назначение |
|---|---|---|
| Tailwind CSS | 4.2.2 | Utility-first стили |
| Framer Motion | 12.38.0 | Анимации, жесты, drag |
| Lucide React | 1.7.0 | Иконки (220+) |

### Data & Storage
| Технология | Версия | Назначение |
|---|---|---|
| idb | 8.0.3 | IndexedDB wrapper (офлайн) |
| MapLibre GL | 5.21.1 | Рендер карт |
| PMTiles | 4.4.0 | Формат тайлов карты |
| Fuse.js | 7.1.0 | Fuzzy-поиск |

### i18n
| Технология | Версия | Назначение |
|---|---|---|
| i18next | 26.0.2 | Фреймворк переводов |
| react-i18next | 17.0.1 | React-интеграция |

### PWA
| Технология | Версия | Назначение |
|---|---|---|
| vite-plugin-pwa | 1.2.0 | Service worker, манифест |

---

## 3. Project Structure

```
BROBROGID/
├── src/
│   ├── app/
│   │   ├── App.tsx                 # Главный компонент, инициализация
│   │   ├── layout/
│   │   │   ├── AppShell.tsx        # Обертка с нижней навигацией
│   │   │   └── BottomTabs.tsx      # Нижний таб-бар (4 вкладки)
│   │   └── router.tsx              # Определение маршрутов (lazy-loaded)
│   │
│   ├── data/
│   │   ├── db.ts                   # Схема IndexedDB + инициализация
│   │   ├── types/
│   │   │   └── index.ts            # Все TypeScript-интерфейсы
│   │   └── stores/
│   │       ├── data-store.ts       # Zustand: POI, туры, гиды, коллекции
│   │       ├── ui-store.ts         # Zustand: UI-состояние
│   │       ├── order-store.ts      # Zustand: корзина (persisted)
│   │       └── toast-store.ts      # Zustand: тост-уведомления
│   │
│   ├── features/                   # Feature-модули
│   │   ├── explore/pages/          # Главная страница
│   │   ├── map/pages/              # Интерактивная карта
│   │   ├── map/components/         # MapPOISheet
│   │   ├── poi/pages/              # Детальная страница POI
│   │   ├── search/pages/           # Поиск с фильтрами
│   │   ├── search/components/      # FilterSheet
│   │   ├── tours/pages/            # Список туров
│   │   ├── guides/pages/           # Профиль гида
│   │   ├── food/pages/             # Категории еды
│   │   ├── ordering/pages/         # Меню и корзина
│   │   ├── saved/pages/            # Избранное
│   │   ├── profile/pages/          # Профиль пользователя
│   │   ├── onboarding/pages/       # Онбординг (3 шага)
│   │   ├── emergency/pages/        # Экстренные службы
│   │   └── subscription/pages/     # Подписки
│   │
│   ├── shared/
│   │   ├── ui/                     # 14 переиспользуемых UI-компонентов
│   │   ├── lib/
│   │   │   ├── utils.ts            # Утилиты, маппинги категорий
│   │   │   └── seed.ts             # Первичное заполнение БД из JSON
│   │   └── hooks/
│   │       ├── useGeolocation.ts   # Геолокация
│   │       ├── useOnlineStatus.ts  # Статус сети
│   │       └── useRouteAnnounce.ts # a11y-анонсы навигации
│   │
│   ├── i18n/
│   │   ├── index.ts                # Конфигурация i18next
│   │   └── locales/
│   │       ├── ru.json             # Русский (257 ключей)
│   │       └── en.json             # Английский (255 ключей)
│   │
│   ├── main.tsx                    # Точка входа
│   └── index.css                   # Глобальные стили + дизайн-токены
│
├── public/
│   ├── content/                    # JSON-данные
│   │   ├── pois.json               # ~200+ POI
│   │   ├── tours.json              # ~15 туров
│   │   ├── guides.json             # ~8 гидов
│   │   ├── menu-items.json         # ~500+ позиций меню
│   │   ├── reviews.json            # ~300+ отзывов
│   │   ├── emergency.json          # Экстренные контакты
│   │   └── transport.json          # Маршруты транспорта
│   ├── images/                     # Фото POI, туров, еды
│   ├── icons/                      # Иконки приложения (192x192, 512x512)
│   └── favicon.svg
│
├── index.html
├── vite.config.ts                  # Vite + PWA конфигурация
├── tsconfig.app.json               # TypeScript (ES2023, strict)
├── package.json
└── docs/                           # Документация и спецификации
```

---

## 4. Data Models

Все типы определены в `src/data/types/index.ts`.

### LocalizedText
```typescript
{ ru: string; en: string }
```

### Location
```typescript
{ lat: number; lng: number; address: LocalizedText }
```

### POI (Point of Interest)
| Поле | Тип | Описание |
|---|---|---|
| `id` | `string` | Уникальный ID |
| `slug` | `string` | URL-slug |
| `name` | `LocalizedText` | Название |
| `category` | `POICategory` | Одна из 10 категорий |
| `subcategory` | `string` | Подкатегория |
| `cuisineType?` | `'national' \| 'european' \| 'mixed'` | Тип кухни (для еды) |
| `location` | `Location` | Геолокация + адрес |
| `description` | `{ short, medium, full }` | Описания разной длины |
| `photos` | `string[]` | URL фотографий |
| `rating` | `number` | Рейтинг 0-5 |
| `reviewCount` | `number` | Количество отзывов |
| `hours?` | `OperatingHours` | Часы работы (Пн-Вс) |
| `phone?` | `string` | Телефон |
| `website?` | `string` | Сайт |
| `priceLevel?` | `1-4` | Уровень цен |
| `tags` | `string[]` | Теги-фичи |
| `isChain` | `boolean` | Сетевое заведение |
| `subscriptionTier` | `'free' \| 'premium'` | Уровень доступа |
| `visitCount` | `number` | Счетчик посещений |
| `hasMenu` | `boolean` | Есть меню |
| `hasDelivery` | `boolean` | Есть доставка |
| `externalOrderUrl?` | `string` | Внешняя ссылка заказа |

### POICategory (10 категорий)
`'attractions'` | `'food'` | `'accommodation'` | `'nature'` | `'culture'` | `'shopping'` | `'nightlife'` | `'transport'` | `'activities'` | `'practical'`

### Tour
| Поле | Тип | Описание |
|---|---|---|
| `id` | `string` | ID |
| `name` | `LocalizedText` | Название |
| `description` | `LocalizedText` | Описание |
| `guideId` | `string` | ID гида |
| `price` | `number` | Цена (руб.) |
| `duration` | `string` | Длительность ("4 hours") |
| `type` | `'walking' \| 'driving' \| 'mixed'` | Тип экскурсии |
| `maxGroupSize` | `number` | Макс. размер группы |
| `currentGroupSize` | `number` | Текущий размер |
| `status` | `'recruiting' \| 'full' \| 'completed'` | Статус набора |
| `dates` | `string[]` | Даты проведения (ISO) |
| `meetingPoint` | `Location` | Место встречи |
| `route` | `Array<{ lat, lng }>` | Координаты маршрута |
| `rating` | `number` | Рейтинг |
| `photos` | `string[]` | Фотографии |
| `category` | `string` | Категория тура |

### Guide
| Поле | Тип | Описание |
|---|---|---|
| `id` | `string` | ID |
| `name` | `LocalizedText` | Имя |
| `bio` | `LocalizedText` | Биография |
| `photo` | `string` | Аватар |
| `languages` | `string[]` | Языки |
| `rating` | `number` | Рейтинг |
| `specializations` | `string[]` | Специализации |

### MenuItem
| Поле | Тип | Описание |
|---|---|---|
| `id` | `string` | ID |
| `poiId` | `string` | ID ресторана |
| `name` | `LocalizedText` | Название блюда |
| `description` | `LocalizedText` | Описание |
| `price` | `number` | Цена (руб.) |
| `currency` | `'RUB'` | Валюта |
| `category` | `string` | Категория (закуски, основные, десерты) |
| `photo?` | `string` | Фото |
| `isPopular` | `boolean` | Популярное блюдо |
| `tags` | `string[]` | Теги |

### Order
| Поле | Тип | Описание |
|---|---|---|
| `id` | `string` | UUID |
| `poiId` | `string` | ID ресторана |
| `items` | `OrderItem[]` | Позиции заказа |
| `total` | `number` | Итого |
| `status` | `'cart' \| 'pending' \| 'paid' \| 'confirmed'` | Статус |
| `paymentMethod` | `'sbp'` | СБП |
| `comment?` | `string` | Комментарий |

### EmergencyContact
| Поле | Тип | Описание |
|---|---|---|
| `id` | `string` | ID |
| `type` | `'police' \| 'ambulance' \| 'fire' \| 'hospital' \| 'trauma' \| 'pharmacy'` | Тип службы |
| `name` | `LocalizedText` | Название |
| `phone` | `string` | Телефон |
| `location` | `Location` | Местоположение |
| `is24h` | `boolean` | Круглосуточно |

### Collection
```typescript
{ id: string; name: string; poiIds: string[]; createdAt: string }
```

### UserPreferences
```typescript
{ language: 'ru' | 'en'; visitedPois: string[]; subscription?: Subscription }
```

---

## 5. Routing

Определено в `src/app/router.tsx`. Все маршруты lazy-loaded через `React.lazy()` + `Suspense`.

| Маршрут | Компонент | Описание |
|---|---|---|
| `/` | ExplorePage | Главная: герой, категории, популярное |
| `/map` | MapPage | Интерактивная карта |
| `/profile` | ProfilePage | Профиль и настройки |
| `/profile/saved` | SavedPage | Избранное и коллекции |
| `/profile/subscription` | SubscriptionPage | Подписки |
| `/poi/:id` | POIDetailPage | Детали POI |
| `/poi/:poiId/menu` | MenuPage | Меню ресторана |
| `/search` | SearchPage | Поиск с фильтрами |
| `/tours` | ToursPage | Список туров |
| `/tours/:id` | TourDetailPage | Детали тура |
| `/tours/guide/:id` | GuideDetailPage | Профиль гида |
| `/cart` | CartPage | Корзина и оформление |
| `/emergency` | EmergencyPage | Экстренные службы |
| `/onboarding` | OnboardingPage | Приветствие (3 шага) |

---

## 6. State Management (Zustand Stores)

### data-store.ts
```typescript
// State
{
  pois: POI[]
  tours: Tour[]
  guides: Guide[]
  collections: Collection[]
  userPrefs: UserPreferences
  isLoaded: boolean
}

// Actions
loadAll()                           // Загрузить все из IDB
toggleFavorite(poiId)               // Добавить/убрать из избранного
addToCollection(collectionId, poiId) // Добавить в коллекцию
createCollection(name)               // Создать коллекцию
setLanguage(lang)                    // Сменить язык
```

### ui-store.ts
```typescript
// State
{
  bottomSheetState: 'peek' | 'half' | 'full'
  activeTab: 'explore' | 'map' | 'saved' | 'profile'
  searchOpen: boolean
  selectedPOIId: string | null
  mapFilter: string | null
}
```

### order-store.ts (persisted в localStorage `'brobrogid-cart'`)
```typescript
// State
{ currentOrder: Order | null }

// Actions
addItem(poiId, menuItemId, price)    // Добавить в корзину
removeItem(menuItemId)                // Удалить из корзины
updateQuantity(menuItemId, qty)       // Изменить количество
clearCart()                           // Очистить корзину
setComment(comment)                   // Комментарий к заказу
isDifferentRestaurant(poiId)          // Проверка смены ресторана
```

### toast-store.ts
```typescript
// Toast
{ id: string; message: string; type: 'info'|'success'|'error'|'warning'; duration?: number }

// Hook
useToast() → { show(message, opts?) }
```

---

## 7. Database (IndexedDB)

Инициализация в `src/data/db.ts` через библиотеку `idb`.

**Имя БД:** `'brobrogid'` | **Версия:** 3

| Store | Key Path | Индексы | Назначение |
|---|---|---|---|
| `pois` | `id` | `by-category`, `by-slug` | Все POI |
| `menuItems` | `id` | `by-poi` | Позиции меню ресторанов |
| `tours` | `id` | `by-guide`, `by-status` | Экскурсии |
| `guides` | `id` | -- | Профили гидов |
| `reviews` | `id` | `by-target` (targetType, targetId) | Отзывы |
| `emergency` | `id` | `by-type` | Экстренные службы |
| `transport` | `id` | -- | Маршруты транспорта |
| `collections` | `id` | -- | Коллекции пользователя |
| `orders` | `id` | `by-status` | История заказов |
| `userPrefs` | `language` | -- | Настройки пользователя |

**Seeding:** При первом запуске `src/shared/lib/seed.ts` загружает JSON из `/public/content/` и заполняет все stores.

---

## 8. Shared UI Components (14 шт.)

Все в `src/shared/ui/`:

| Компонент | Назначение |
|---|---|
| **BottomSheet** | Перетаскиваемый bottom sheet (peek/half/full) |
| **CategoryBottomSheet** | Выбор категории через bottom sheet |
| **CategoryChip** | Кнопка-чип фильтра категории |
| **POICard** | Карточка POI (horizontal/vertical варианты) |
| **FavoriteButton** | Кнопка "в избранное" + haptic feedback |
| **PageHeader** | Sticky-заголовок с кнопкой "назад" |
| **SearchBar** | Поле поиска |
| **SectionHeader** | Заголовок секции с опциональной ссылкой |
| **Rating** | Отображение звездного рейтинга |
| **Toast** | Контейнер тост-уведомлений |
| **EmptyState** | Пустое состояние списка |
| **Skeleton** | Скелетон загрузки (shimmer-анимация) |
| **ImageWithFallback** | Изображение с обработкой ошибок |
| **OfflineBanner** | Баннер "нет сети" |

---

## 9. Pages & Features

### ExplorePage (`/`)
- Компактный хедер с брендингом BROBROGID
- Анимированный search bar с ротирующимися placeholder'ами
- Сетка сервисов (2x3): Еда, Достопримечательности, Туры, Карта, Транспорт, SOS
- Hero-карточка: рекомендуемый тур или топ-POI
- Горизонтальный скролл категорий (7 видимых)
- Карусель "Популярное": топ-10 POI по рейтингу
- Контекстная секция (зависит от времени суток):
  - Утро (6-11): "Завтраки рядом"
  - Вечер (17-23): "Вечерняя кухня"
  - Выходные: "На природу"
  - По умолчанию: "Национальная кухня"

### MapPage (`/map`)
- MapLibre GL (CartoDB Positron стиль)
- Кластеризация POI (zoom < 14)
- GeoJSON-маркеры с цветами и иконками категорий
- Фильтры категорий (8 + "Все")
- Кнопка "Искать в этом районе"
- GPS-кнопка (полет к текущей позиции)
- Bottom sheet с превью POI

### POIDetailPage (`/poi/:id`)
- Фото-карусель со scroll-snap и полноэкранной галереей
- Бейджи категории, кухни, доставки
- Рейтинг и количество отзывов
- Кнопки действий: маршрут, звонок, избранное, поделиться, меню
- Карточка быстрых фактов (адрес, часы работы, телефон, сайт, уровень цен)
- Описание с раскрытием "Ещё"
- Карусель "Рядом" (5 ближайших)
- Секция отзывов (агрегат, распределение, карточки)
- Sticky CTA при скролле

### SearchPage (`/search`)
- Sticky search bar
- История поиска (localStorage, max 5)
- Автокомплит (fuzzy, limit 5)
- Фильтры категорий
- Расширенные фильтры (FilterSheet): мин. рейтинг, уровень цен, "открыто сейчас"
- Сортировка: релевантность, рейтинг, популярность
- Debounced поиск (300мс), Fuse.js

### ToursPage (`/tours`)
- Фильтры статуса: Все, Набор открыт, Набор закрыт
- Карточки туров: фото, статус, цена, длительность, размер группы, рейтинг

### MenuPage (`/poi/:poiId/menu`)
- Фильтры категорий: закуски, основные, десерты
- Карточки блюд с фото, ценой, бейджем "популярное"
- Модальное окно с деталями блюда
- Инлайн-счетчик для корзины

### CartPage (`/cart`)
- Список позиций с управлением количеством
- Переключатель доставка/самовывоз
- Поле адреса (для доставки)
- Комментарий к заказу
- Итоговая сумма
- Оплата через СБП
- Отправка через WhatsApp

### OnboardingPage (`/onboarding`)
- 3 шага: Приветствие → Интересы → Геолокация
- Переключатель языка на первом шаге
- Анимации перехода (Framer Motion)
- Завершение: `localStorage.brobrogid_onboarding = 'true'`

### EmergencyPage (`/emergency`)
- Карточки экстренных служб по типам
- Кнопки: позвонить (tel:), навигация (Google Maps)
- Индикатор "24ч"

### ProfilePage (`/profile`)
- Аватар, имя, статистика
- Избранное, история заказов
- Настройки языка (RU/EN toggle)
- Подписка, уведомления
- Помощь, экстренные, о приложении
- Версия v1.0.0

### SavedPage (`/profile/saved`)
- Коллекции: "Избранное" + пользовательские
- Список POI с кнопкой удаления
- Undo-тост после удаления

---

## 10. Design System

### Цвета (CSS Variables)
```css
--color-primary:        #E85D26   /* Оранжевый */
--color-primary-light:  #FEF0E8
--color-text:           #1B1F23   /* Тёмно-серый */
--color-text-secondary: #64748B   /* Серый */
--color-bg:             #F8FAFC   /* Светло-серый фон */
--color-surface:        #FFFFFF
--color-card:           #FFFFFF
--color-border:         #E2E8F0
--color-success:        #16A34A   /* Зелёный */
--color-warning:        #F59E0B   /* Янтарный */
--color-danger:         #DC2626   /* Красный */
```

### Категории — цвета
| Категория | Цвет |
|---|---|
| attractions | `#ef4444` (красный) |
| food | `#f59e0b` (янтарный) |
| accommodation | `#8b5cf6` (фиолетовый) |
| nature | `#10b981` (зелёный) |
| culture | `#3b82f6` (синий) |
| shopping | `#ec4899` (розовый) |
| nightlife | `#6366f1` (индиго) |
| transport | `#64748b` (серый) |
| activities | `#f97316` (оранжевый) |
| practical | `#14b8a6` (бирюзовый) |

### Spacing (8pt Grid)
```css
--space-1: 4px   --space-2: 8px    --space-3: 12px
--space-4: 16px  --space-6: 24px   --space-8: 32px   --space-12: 48px
```

### Border Radius
```css
--radius-sm: 8px   --radius-md: 12px   --radius-lg: 16px
--radius-xl: 24px  --radius-full: 9999px
```

### Shadows (Elevation)
```css
--shadow-1: 0 1px 2px rgba(0,0,0,0.05)
--shadow-2: 0 2px 8px rgba(0,0,0,0.08)
--shadow-3: 0 4px 16px rgba(0,0,0,0.12)
--shadow-4: 0 8px 32px rgba(0,0,0,0.16)
```

### Animation
```css
--ease-standard:    cubic-bezier(0.2, 0, 0, 1)
--duration-micro:   150ms
--duration-small:   200ms
--duration-standard: 300ms
--duration-large:   400ms
```

### Layout
```css
--bottom-nav-height: 56px
--safe-area-bottom:  env(safe-area-inset-bottom, 0px)
```

---

## 11. Internationalization (i18n)

**Конфигурация:** `src/i18n/index.ts`
- Язык по умолчанию: `'ru'`
- Fallback: `'ru'`
- Escaping: отключён

**Структура ключей:**
```
app.*          — название, слоган
tabs.*         — вкладки навигации
categories.*   — названия категорий
explore.*      — главная страница
food.*         — раздел еды
poi.*          — детали POI
search.*       — поиск
tours.*        — экскурсии
guides.*       — гиды
ordering.*     — заказ еды
emergency.*    — экстренные
subscription.* — подписки
saved.*        — избранное
profile.*      — профиль
common.*       — общие (loading, error, retry)
offline.*      — офлайн-баннер
a11y.*         — accessibility
onboarding.*   — онбординг
pages.*        — заголовки страниц
```

**Плюрализация:** русский язык использует `_one`, `_few`, `_many`.

---

## 12. Hooks & Utilities

### Hooks (`src/shared/hooks/`)

| Hook | Возвращает | Описание |
|---|---|---|
| `useGeolocation` | `{ lat, lng, error, loading }` | Непрерывное отслеживание GPS |
| `useOnlineStatus` | `boolean` | Статус online/offline |
| `useRouteAnnounce` | `ref` | a11y-анонсы при навигации |

### Утилиты (`src/shared/lib/utils.ts`)

| Функция | Описание |
|---|---|
| `CATEGORY_COLORS` | Маппинг категория → HEX-цвет |
| `CATEGORY_ICONS` | Маппинг категория → Lucide-иконка |
| `CATEGORY_MAP_LABELS` | Маппинг категория → буква для карты |
| `formatPrice(price)` | Форматирование цены с символом ₽ |
| `formatRating(rating)` | Рейтинг до 1 знака |
| `getDistanceKm(lat1, lng1, lat2, lng2)` | Расстояние (формула Haversine) |
| `formatDistance(km)` | Человекочитаемое расстояние (м/км) |
| `cn(...classes)` | Объединение CSS-классов |

---

## 13. PWA Configuration

**Service Worker:** автогенерация через `vite-plugin-pwa`

**Манифест:**
- Имя: "BROBROGID — Гид по Владикавказу"
- Короткое имя: "BROBROGID"
- Иконки: 192x192, 512x512 PNG
- Display: standalone
- Theme color: `#E85D26`
- Start URL: `/`

**Стратегии кэширования:**
| Ресурс | Стратегия | TTL |
|---|---|---|
| Изображения | CacheFirst | 90 дней |
| Content JSON | StaleWhileRevalidate | -- |
| HTML/JS | NetworkFirst | -- |

---

## 14. Build Configuration

### Vite (`vite.config.ts`)
- Плагины: React, Tailwind CSS, PWA
- Алиас: `@/` → `./src/`

### TypeScript (`tsconfig.app.json`)
- Target: ES2023
- Module: ESNext
- Strict mode: включён
- No unused vars: включён
- Path alias: `@/*` → `src/*`
- JSX: react-jsx

---

## 15. Component Hierarchy

```
App (инициализация, редирект на онбординг)
├── AppShell (только после онбординга)
│   ├── OfflineBanner
│   ├── <main> → Route Component (lazy)
│   ├── ToastContainer
│   └── BottomTabs (4 вкладки: explore, map, saved, profile)
│
└── OnboardingPage (если не пройден)
```

---

## 16. Data Content

| Файл | Размер | Содержимое |
|---|---|---|
| `pois.json` | ~180 KB | ~200+ POI всех категорий |
| `tours.json` | ~24 KB | ~15 туров |
| `guides.json` | ~7 KB | ~8 гидов |
| `menu-items.json` | ~95 KB | ~500+ позиций меню |
| `reviews.json` | ~65 KB | ~300+ отзывов |
| `emergency.json` | ~7 KB | Экстренные контакты |
| `transport.json` | ~10 KB | Маршруты транспорта |

---

## 17. Constants

| Константа | Значение | Описание |
|---|---|---|
| `VLADIKAVKAZ_CENTER` | `[44.6678, 43.0367]` | Центр карты |
| Bottom nav height | `56px` | Высота нижней навигации |
| Max recent searches | `5` | Лимит истории поиска |
| React Query staleTime | `5 min` | Время жизни кэша |
| Search debounce | `300ms` | Задержка поиска |
| Onboarding flag | `localStorage.brobrogid_onboarding` | Флаг прохождения |
| Interests | `localStorage.brobrogid_interests` | Выбранные интересы |
| Cart persist key | `'brobrogid-cart'` | Ключ корзины в localStorage |

---

## 18. Accessibility

- ARIA-атрибуты на формах, кнопках, навигации
- Screen reader анонсы при навигации (`useRouteAnnounce`)
- Фокус-стили: 2px outline primary color
- Семантический HTML: `<header>`, `<nav>`, `<main>`, `<button>`
- Утилита `.sr-only` для скрытого текста
- ARIA live regions для тостов
- Keyboard navigation с focus-visible

---

## 19. Performance

- **Code splitting:** lazy-loaded роуты (React.lazy + Suspense)
- **Image optimization:** fallback placeholder + lazy loading
- **Caching:** React Query staleTime 5 мин, auto retry
- **Debouncing:** поиск 300мс
- **CSS:** Tailwind utility classes (no CSS-in-JS overhead)
- **TypeScript strict:** отлавливает неиспользуемые импорты
