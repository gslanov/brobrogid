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
const GuideDetailPage = lazy(() => import('@/features/guides/pages/GuideDetailPage'))
const MenuPage = lazy(() => import('@/features/ordering/pages/MenuPage'))
const CartPage = lazy(() => import('@/features/ordering/pages/CartPage'))
const EmergencyPage = lazy(() => import('@/features/emergency/pages/EmergencyPage'))
const SubscriptionPage = lazy(() => import('@/features/subscription/pages/SubscriptionPage'))
const OnboardingPage = lazy(() => import('@/features/onboarding/pages/OnboardingPage'))
const AdminLayout = lazy(() => import('@/features/admin/pages/AdminLayout'))
const AdminDashboard = lazy(() => import('@/features/admin/pages/AdminDashboard'))
const AdminPOIList = lazy(() => import('@/features/admin/pages/AdminPOIList'))
const AdminPOIForm = lazy(() => import('@/features/admin/pages/AdminPOIForm'))
const AdminMenuItemList = lazy(() => import('@/features/admin/pages/AdminMenuItemList'))
const AdminMenuItemForm = lazy(() => import('@/features/admin/pages/AdminMenuItemForm'))
const AdminTourList = lazy(() => import('@/features/admin/pages/AdminTourList'))
const AdminTourForm = lazy(() => import('@/features/admin/pages/AdminTourForm'))
const AdminGuideList = lazy(() => import('@/features/admin/pages/AdminGuideList'))
const AdminGuideForm = lazy(() => import('@/features/admin/pages/AdminGuideForm'))
const AdminReviewList = lazy(() => import('@/features/admin/pages/AdminReviewList'))
const AdminReviewForm = lazy(() => import('@/features/admin/pages/AdminReviewForm'))
const AdminEmergencyList = lazy(() => import('@/features/admin/pages/AdminEmergencyList'))
const AdminEmergencyForm = lazy(() => import('@/features/admin/pages/AdminEmergencyForm'))
const AdminTransportList = lazy(() => import('@/features/admin/pages/AdminTransportList'))
const AdminTransportForm = lazy(() => import('@/features/admin/pages/AdminTransportForm'))
const AdminExport = lazy(() => import('@/features/admin/pages/AdminExport'))

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
  { path: 'profile', element: <Lazy><ProfilePage /></Lazy> },
  { path: 'profile/saved', element: <Lazy><SavedPage /></Lazy> },
  { path: 'profile/subscription', element: <Lazy><SubscriptionPage /></Lazy> },
  { path: 'poi/:id', element: <Lazy><POIDetailPage /></Lazy> },
  { path: 'poi/:poiId/menu', element: <Lazy><MenuPage /></Lazy> },
  { path: 'search', element: <Lazy><SearchPage /></Lazy> },
  { path: 'tours', element: <Lazy><ToursPage /></Lazy> },
  { path: 'tours/:id', element: <Lazy><TourDetailPage /></Lazy> },
  { path: 'tours/guide/:id', element: <Lazy><GuideDetailPage /></Lazy> },
  { path: 'cart', element: <Lazy><CartPage /></Lazy> },
  { path: 'emergency', element: <Lazy><EmergencyPage /></Lazy> },
  { path: 'subscription', element: <Lazy><SubscriptionPage /></Lazy> },
  { path: 'onboarding', element: <Lazy><OnboardingPage /></Lazy> },
  {
    path: 'admin',
    element: <Lazy><AdminLayout /></Lazy>,
    children: [
      { index: true, element: <Lazy><AdminDashboard /></Lazy> },
      { path: 'pois', element: <Lazy><AdminPOIList /></Lazy> },
      { path: 'pois/new', element: <Lazy><AdminPOIForm /></Lazy> },
      { path: 'pois/:id', element: <Lazy><AdminPOIForm /></Lazy> },
      { path: 'menu-items', element: <Lazy><AdminMenuItemList /></Lazy> },
      { path: 'menu-items/new', element: <Lazy><AdminMenuItemForm /></Lazy> },
      { path: 'menu-items/:id', element: <Lazy><AdminMenuItemForm /></Lazy> },
      { path: 'tours', element: <Lazy><AdminTourList /></Lazy> },
      { path: 'tours/new', element: <Lazy><AdminTourForm /></Lazy> },
      { path: 'tours/:id', element: <Lazy><AdminTourForm /></Lazy> },
      { path: 'guides', element: <Lazy><AdminGuideList /></Lazy> },
      { path: 'guides/new', element: <Lazy><AdminGuideForm /></Lazy> },
      { path: 'guides/:id', element: <Lazy><AdminGuideForm /></Lazy> },
      { path: 'reviews', element: <Lazy><AdminReviewList /></Lazy> },
      { path: 'reviews/new', element: <Lazy><AdminReviewForm /></Lazy> },
      { path: 'reviews/:id', element: <Lazy><AdminReviewForm /></Lazy> },
      { path: 'emergency', element: <Lazy><AdminEmergencyList /></Lazy> },
      { path: 'emergency/new', element: <Lazy><AdminEmergencyForm /></Lazy> },
      { path: 'emergency/:id', element: <Lazy><AdminEmergencyForm /></Lazy> },
      { path: 'transport', element: <Lazy><AdminTransportList /></Lazy> },
      { path: 'transport/new', element: <Lazy><AdminTransportForm /></Lazy> },
      { path: 'transport/:id', element: <Lazy><AdminTransportForm /></Lazy> },
      { path: 'export', element: <Lazy><AdminExport /></Lazy> },
    ],
  },
]
