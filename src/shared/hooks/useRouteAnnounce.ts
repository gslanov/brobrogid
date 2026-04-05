import { useEffect, useRef } from 'react'
import { useLocation } from 'react-router-dom'
import { useTranslation } from 'react-i18next'

const ROUTE_TITLES: Record<string, string> = {
  '/': 'explore',
  '/map': 'map',
  '/profile': 'profile',
  '/profile/saved': 'saved',
  '/profile/subscription': 'subscription',
  '/search': 'search',
  '/tours': 'tours',
  '/emergency': 'emergency',
  '/cart': 'cart',
  '/onboarding': 'onboarding',
}

// Maps first path segment to a page key for detail routes
const DETAIL_ROUTES: Record<string, string> = {
  poi: 'poi',
  tours: 'tours',
  profile: 'profile',
  subscription: 'subscription',
}

export function useRouteAnnounce() {
  const location = useLocation()
  const { t } = useTranslation()
  const announceRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    const segments = location.pathname.split('/').filter(Boolean)
    const fullPath = location.pathname
    const basePath = '/' + (segments[0] || '')

    // Check full path first (for nested routes like /profile/saved)
    let pageKey = ROUTE_TITLES[fullPath] || ROUTE_TITLES[basePath]
    if (!pageKey && segments[0]) {
      pageKey = DETAIL_ROUTES[segments[0]] || segments[0]
    }
    pageKey = pageKey || 'explore'

    const localizedName = t(`pages.${pageKey}`, pageKey)
    document.title = `BROBROGID — ${localizedName}`

    if (announceRef.current) {
      announceRef.current.textContent = `${t('a11y.navigatedTo', 'Navigated to')} ${localizedName}`
    }
  }, [location.pathname, t])

  return announceRef
}
