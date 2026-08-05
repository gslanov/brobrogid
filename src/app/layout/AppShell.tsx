import { useEffect, useState, useCallback, type ReactNode } from 'react'
import { useLocation, useNavigationType } from 'react-router-dom'
import { BottomTabs } from './BottomTabs'
import { ToastContainer } from '@/shared/ui/Toast'
import { OfflineBanner } from '@/shared/ui/OfflineBanner'
import { ProximityToast } from '@/shared/ui/ProximityToast'
import { useProximityTracker } from '@/shared/hooks/useProximityTracker'
import { useDataStore } from '@/data/stores/data-store'
import type { POI } from '@/data/types'

function ProximityTracker() {
  const pois = useDataStore((s) => s.pois)
  const visitedIds = useDataStore((s) => s.userPrefs.visitedPois)
  const markVisited = useDataStore((s) => s.markVisited)
  const [nearbyPoi, setNearbyPoi] = useState<POI | null>(null)

  const handleNearby = useCallback((poi: POI) => {
    setNearbyPoi(poi)
  }, [])

  useProximityTracker({ pois, visitedIds, onNearby: handleNearby })

  if (!nearbyPoi) return null

  return (
    <ProximityToast
      poi={nearbyPoi}
      onConfirm={() => {
        markVisited(nearbyPoi.id)
        setNearbyPoi(null)
      }}
      onDismiss={() => setNearbyPoi(null)}
    />
  )
}

export function AppShell({ children }: { children: ReactNode }) {
  const location = useLocation()
  const navType = useNavigationType()
  const urlKey = 'scroll:' + location.pathname + location.search

  useEffect(() => {
    const el = document.getElementById('scroll-root')
    if (!el) return

    if (navType === 'POP') {
      const saved = sessionStorage.getItem(urlKey)
      if (saved) {
        const pos = parseInt(saved, 10)
        el.scrollTop = pos
        window.scrollTo(0, pos)
        requestAnimationFrame(() => {
          el.scrollTop = pos
          window.scrollTo(0, pos)
        })
      } else {
        el.scrollTop = 0
        window.scrollTo(0, 0)
      }
    } else {
      el.scrollTop = 0
      window.scrollTo(0, 0)
    }

    const save = () => {
      const val = el.scrollTop || window.scrollY
      if (val > 0) sessionStorage.setItem(urlKey, String(val))
    }
    el.addEventListener('scroll', save, { passive: true })
    window.addEventListener('scroll', save, { passive: true })
    return () => {
      el.removeEventListener('scroll', save)
      window.removeEventListener('scroll', save)
    }
  }, [location.key, navType, urlKey])

  return (
    <div
      className="flex flex-col h-dvh max-w-lg mx-auto w-full relative overflow-hidden"
      style={{
        /* «Мокрый камень»: холодная засветка сверху, тёплый подсвет снизу.
           Раньше здесь лежали два серых пятна — они гасили глянец. */
        background:
          'radial-gradient(130% 55% at 50% -12%, rgba(255,255,255,0.075) 0%, transparent 52%),' +
          'radial-gradient(100% 50% at 15% 105%, rgba(224,138,74,0.09) 0%, transparent 58%),' +
          'var(--bg-deep)',
      }}
    >
      <OfflineBanner />
      <main id="scroll-root" className="flex-1 pb-[calc(var(--bottom-nav-height)+var(--safe-area-bottom))] overflow-y-auto momentum">
        {children}
      </main>
      <ToastContainer />
      <ProximityTracker />
      <BottomTabs />
    </div>
  )
}
