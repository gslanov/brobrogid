import { lazy, Suspense } from 'react'
import type { RouteObject } from 'react-router-dom'

const ExplorePage = lazy(() => import('@/features/explore/pages/ExplorePage'))
const MapPage = lazy(() => import('@/features/map/pages/MapPage'))
const SavedPage = lazy(() => import('@/features/saved/pages/SavedPage'))
const ProfilePage = lazy(() => import('@/features/profile/pages/ProfilePage'))
const POIDetailPage = lazy(() => import('@/features/poi/pages/POIDetailPage'))
const SearchPage = lazy(() => import('@/features/search/pages/SearchPage'))
const ToursPage = lazy(() => import('@/features/tours/pages/ToursPage'))
const TourDetailPage = lazy(() => import('@/features/tours/pages/TourDetailPage'))
const GuidesPage = lazy(() => import('@/features/guides/pages/GuidesPage'))
const GuideDetailPage = lazy(() => import('@/features/guides/pages/GuideDetailPage'))
const FoodPage = lazy(() => import('@/features/food/pages/FoodPage'))
const MenuPage = lazy(() => import('@/features/ordering/pages/MenuPage'))
const CartPage = lazy(() => import('@/features/ordering/pages/CartPage'))
const EmergencyPage = lazy(() => import('@/features/emergency/pages/EmergencyPage'))
const SubscriptionPage = lazy(() => import('@/features/subscription/pages/SubscriptionPage'))

function Lazy({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={<div className="flex items-center justify-center py-20"><div className="w-8 h-8 border-3 border-[var(--color-primary)] border-t-transparent rounded-full animate-spin" /></div>}>
      {children}
    </Suspense>
  )
}

export const routes: RouteObject[] = [
  { index: true, element: <Lazy><ExplorePage /></Lazy> },
  { path: 'map', element: <Lazy><MapPage /></Lazy> },
  { path: 'saved', element: <Lazy><SavedPage /></Lazy> },
  { path: 'profile', element: <Lazy><ProfilePage /></Lazy> },
  { path: 'poi/:id', element: <Lazy><POIDetailPage /></Lazy> },
  { path: 'search', element: <Lazy><SearchPage /></Lazy> },
  { path: 'tours', element: <Lazy><ToursPage /></Lazy> },
  { path: 'tours/:id', element: <Lazy><TourDetailPage /></Lazy> },
  { path: 'guides', element: <Lazy><GuidesPage /></Lazy> },
  { path: 'guides/:id', element: <Lazy><GuideDetailPage /></Lazy> },
  { path: 'food', element: <Lazy><FoodPage /></Lazy> },
  { path: 'menu/:poiId', element: <Lazy><MenuPage /></Lazy> },
  { path: 'cart', element: <Lazy><CartPage /></Lazy> },
  { path: 'emergency', element: <Lazy><EmergencyPage /></Lazy> },
  { path: 'subscription', element: <Lazy><SubscriptionPage /></Lazy> },
]
