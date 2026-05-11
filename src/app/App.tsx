import { useEffect, useRef, useState } from 'react'
import { useRoutes, useNavigate, useLocation } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { App as CapApp } from '@capacitor/app'
import { Capacitor } from '@capacitor/core'
import { routes } from './router'
import { AppShell } from './layout/AppShell'
import { seedDatabase } from '@/shared/lib/seed'
import { initNotifications } from '@/shared/lib/notifications'
import { useDataStore } from '@/data/stores/data-store'
import { useRouteAnnounce } from '@/shared/hooks/useRouteAnnounce'
import { AlertTriangle } from 'lucide-react'
import i18n from '@/i18n'

export default function App() {
  const [ready, setReady] = useState(false)
  const [initError, setInitError] = useState(false)
  const loadAll = useDataStore((s) => s.loadAll)
  const announceRef = useRouteAnnounce()
  const navigate = useNavigate()
  const location = useLocation()
  const { t } = useTranslation()
  const lastBackPress = useRef<number>(0)
  const [exitToast, setExitToast] = useState(false)

  useEffect(() => {
    async function init() {
      try {
        await seedDatabase()
        await loadAll()
        initNotifications()
        const storedLang = useDataStore.getState().userPrefs?.language
        if (storedLang && storedLang !== i18n.language) {
          i18n.changeLanguage(storedLang)
        }
        setReady(true)
      } catch (err) {
        console.error('Init failed:', err)
        setInitError(true)
      }
    }
    init()
  }, [loadAll])

  // Double back press to exit (Android only)
  useEffect(() => {
    if (Capacitor.getPlatform() !== 'android') return
    const listener = CapApp.addListener('backButton', () => {
      const now = Date.now()
      if (now - lastBackPress.current < 2000) {
        CapApp.exitApp()
      } else {
        lastBackPress.current = now
        setExitToast(true)
        setTimeout(() => setExitToast(false), 2000)
      }
    })
    return () => { listener.then(h => h.remove()) }
  }, [])

  // Redirect logic — after ready
  useEffect(() => {
    if (!ready) return
    const onboarded = localStorage.getItem('brobrogid_onboarding')
    if (!onboarded && location.pathname !== '/onboarding' && !location.pathname.startsWith('/admin')) {
      navigate('/onboarding', { replace: true })
    }
    // Already onboarded but on /onboarding — redirect away
    if (onboarded && location.pathname === '/onboarding') {
      navigate('/', { replace: true })
    }
  }, [ready, location.pathname, navigate])

  const routeElement = useRoutes(routes)

  if (initError) {
    return (
      <div className="flex items-center justify-center min-h-dvh bg-[var(--color-bg)]">
        <div className="text-center px-8">
          <span className="mb-4 block text-amber-500"><AlertTriangle size={48} /></span>
          <h1 className="text-xl font-bold mb-2">{t('common.error')}</h1>
          <p className="text-sm text-[var(--color-text-secondary)] mb-4">
            {t('common.initError', 'Could not load data. Please try refreshing.')}
          </p>
          <button onClick={() => window.location.reload()} className="px-6 py-2.5 bg-[var(--color-primary)] text-white rounded-full text-sm font-medium">
            {t('common.retry')}
          </button>
        </div>
      </div>
    )
  }

  if (!ready) {
    return (
      <div className="flex items-center justify-center min-h-dvh bg-[var(--color-bg)]">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[var(--color-primary)] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-[var(--color-primary)]">BROBROGID</h1>
          <p className="text-[var(--color-text-secondary)] mt-1">{t('common.loading')}</p>
        </div>
      </div>
    )
  }

  // Onboarding page — no AppShell (no tab bar)
  if (location.pathname === '/onboarding' || location.pathname.startsWith('/admin')) {
    return <>{routeElement}</>
  }

  return (
    <AppShell>
      {routeElement}
      <div ref={announceRef} aria-live="polite" aria-atomic="true" className="sr-only" />
      {exitToast && (
        <div className="fixed bottom-24 left-1/2 -translate-x-1/2 bg-gray-800 text-white text-sm px-4 py-2 rounded-full shadow-lg z-50 pointer-events-none">
          {t('common.pressBackAgain', 'Нажмите «Назад» ещё раз для выхода')}
        </div>
      )}
    </AppShell>
  )
}
