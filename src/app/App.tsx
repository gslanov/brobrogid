import { useEffect, useRef, useState } from 'react'
import { useRoutes, useNavigate, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
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
          <button
            onClick={() => window.location.reload()}
            className="sheen px-6 py-2.5 rounded-full text-sm font-semibold"
            style={{ background: 'var(--terra-hot)', color: 'var(--text-on-terra)', boxShadow: 'var(--shadow-terra)' }}
          >
            {t('common.retry')}
          </button>
        </div>
      </div>
    )
  }

  if (!ready) {
    return (
      <div
        className="flex items-center justify-center min-h-dvh"
        style={{
          background:
            'radial-gradient(700px 500px at 50% 30%, #1A1D24 0%, transparent 62%), var(--bg-deep)',
        }}
      >
        <div className="text-center px-10">
          {/* Ромб-эмблема с медленным свечением */}
          <div className="relative w-16 h-16 mx-auto mb-7">
            <span
              className="absolute inset-0 diamond animate-pulse-glow"
              style={{
                border: '1.5px solid var(--terra-line)',
                background: 'var(--terra-tint)',
                boxShadow: '0 0 34px var(--terra-glow)',
              }}
            />
            <span
              className="absolute inset-[13px] diamond"
              style={{ border: '1.5px solid var(--moss)' }}
            />
          </div>

          <h1
            className="text-[26px] font-bold tracking-[0.16em]"
            style={{ color: 'var(--sand)' }}
          >
            BROBROGID
          </h1>

          {/* Орнаментальный пояс прорисовывается слева направо */}
          <div className="orn-belt animate-draw-belt mt-4 mx-auto w-40" />

          <p className="mt-4 text-sm" style={{ color: 'var(--text-3)' }}>
            {t('common.loading')}
          </p>
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
      {/* Переход между экранами: новый уплывает вверх, старый растворяется */}
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={location.pathname}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
        >
          {routeElement}
        </motion.div>
      </AnimatePresence>
      <div ref={announceRef} aria-live="polite" aria-atomic="true" className="sr-only" />
      {exitToast && (
        <div
          className="fixed bottom-24 left-1/2 -translate-x-1/2 glass-strong text-sm px-4 py-2 rounded-full z-50 pointer-events-none"
          style={{ color: 'var(--text)', boxShadow: 'var(--shadow-3)' }}
        >
          {t('common.pressBackAgain', 'Нажмите «Назад» ещё раз для выхода')}
        </div>
      )}
    </AppShell>
  )
}
