import { useLayoutEffect, useState, useCallback, type ReactNode } from 'react'
import { useLocation } from 'react-router-dom'
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
  const { key } = useLocation()

  useLayoutEffect(() => {
    const el = document.getElementById('scroll-root')
    if (el) el.scrollTop = 0
    window.scrollTo(0, 0)
  }, [key])

  return (
    <div className="flex flex-col h-dvh max-w-lg mx-auto w-full bg-white relative overflow-hidden">
      <OfflineBanner />
      <main id="scroll-root" className="flex-1 pb-[calc(var(--bottom-nav-height)+var(--safe-area-bottom))] overflow-y-auto">
        {children}
      </main>
      <ToastContainer />
      <ProximityTracker />
      <BottomTabs />
    </div>
  )
}
