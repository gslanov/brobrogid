import { useEffect, useState } from 'react'
import { useRoutes, useNavigate, useLocation } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { routes } from './router'
import { AppShell } from './layout/AppShell'
import { seedDatabase } from '@/shared/lib/seed'
import { useDataStore } from '@/data/stores/data-store'
import { useRouteAnnounce } from '@/shared/hooks/useRouteAnnounce'
import { AlertTriangle } from 'lucide-react'

export default function App() {
  const [ready, setReady] = useState(false)
  const [initError, setInitError] = useState(false)
  const loadAll = useDataStore((s) => s.loadAll)
  const announceRef = useRouteAnnounce()
  const navigate = useNavigate()
  const location = useLocation()
  const { t } = useTranslation()

  useEffect(() => {
    async function init() {
      try {
        await seedDatabase()
        await loadAll()
        setReady(true)
      } catch (err) {
        console.error('Init failed:', err)
        setInitError(true)
      }
    }
    init()
  }, [loadAll])

  // Redirect logic — after ready
  useEffect(() => {
    if (!ready) return
    const onboarded = localStorage.getItem('brobrogid_onboarding')
    if (!onboarded && location.pathname !== '/onboarding') {
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
  if (location.pathname === '/onboarding') {
    return <>{routeElement}</>
  }

  return (
    <AppShell>
      {routeElement}
      <div ref={announceRef} aria-live="polite" aria-atomic="true" className="sr-only" />
    </AppShell>
  )
}
