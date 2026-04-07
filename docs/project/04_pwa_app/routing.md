---
title: Routing — react-router structure
type: reference
audience: archimag, dev
owner: archimag
last_updated: 2026-04-07
---

# Маршруты app.brobrogid.ru

Используется `react-router-dom` v6 в `BrowserRouter` mode (HTML5 History API). Конфигурация в `src/app/router.tsx`.

## Public routes

| Path | Component | Назначение |
|---|---|---|
| `/` | `ExplorePage` | Главная — лента POI с фильтрами |
| `/poi/:slug` | `POIDetailPage` | Карточка места |
| `/poi/:slug/menu` | `MenuPage` | Меню ресторана (если `hasMenu`) |
| `/tours` | `ToursPage` | Список туров |
| `/tours/:slug` | `TourDetailPage` | Карточка тура |
| `/tours/guide/:slug` | `GuideDetailPage` | Профиль гида |
| `/map` | `MapPage` | Интерактивная карта (Leaflet) |
| `/search` | `SearchPage` | Полнотекстовый поиск (Fuse.js) |
| `/emergency` | `EmergencyPage` | Экстренные службы |
| `/subscription` | `SubscriptionPage` | Подписка (placeholder) |
| `/onboarding` | `OnboardingPage` | First-time intro |

## User routes (require local session)

| Path | Component |
|---|---|
| `/cart` | `CartPage` |
| `/profile` | `ProfilePage` |
| `/profile/favorites` | `FavoritesPage` |
| `/profile/orders` | `OrdersPage` |

## Admin routes (см. `admin_panel.md`)

`/admin/*` — 18 routes под `AdminLayout` с auth guard.

## Slug resolution

`:slug` маршруты делают двойной lookup для совместимости со старыми URL (Sprint 6):

```typescript
// POIDetailPage
const { slug } = useParams()
const poi = useDataStore(s =>
  s.pois.find(p => p.slug === slug || p.slug_legacy === slug)
)
if (!poi) return <NotFoundPage />
```

Если найден через `slug_legacy` — `useEffect` делает `navigate(/poi/${poi.slug}, { replace: true })` чтобы canonical URL был всегда новый русский slug.

## 404

Catch-all `<Route path="*" element={<NotFoundPage />} />` в конце router config. Prerender НЕ генерирует 404.html — nginx fallback `try_files $uri $uri/index.html /index.html` отдаёт корневой `index.html` который React render-нёт NotFoundPage клиентски.

## Lazy loading

Pages обёрнуты в `React.lazy` с `Suspense fallback={<PageSpinner />}`:

```typescript
const POIDetailPage = lazy(() => import('@/features/poi/pages/POIDetailPage'))
```

Это даёт code-splitting per-route. Initial bundle содержит только `ExplorePage` + shared chunks.

## Scroll restoration

`<ScrollRestoration />` в layout восстанавливает позицию при back/forward, скроллит вверх при новой навигации.

## Related

- `data_flow.md` — как страницы получают данные
- `prerender.md` — как 145 URL генерируются из этих маршрутов
- `admin_panel.md` — admin-зона
