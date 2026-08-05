import { useEffect, useRef, useCallback } from 'react'
import { Geolocation } from '@capacitor/geolocation'
import { App } from '@capacitor/app'
import { Capacitor } from '@capacitor/core'
import { showLocalNotification } from '@/shared/lib/notifications'
import type { POI } from '@/data/types'

const CHECK_INTERVAL_MS = 30_000

function getDistanceMeters(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371000
  const dLat = ((lat2 - lat1) * Math.PI) / 180
  const dLng = ((lng2 - lng1) * Math.PI) / 180
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

interface UseProximityTrackerOptions {
  pois: POI[]
  visitedIds: string[]
  onNearby: (poi: POI) => void
}

export function useProximityTracker({ pois, visitedIds, onNearby }: UseProximityTrackerOptions) {
  // Cooldown: don't fire same POI within 10 minutes
  const recentlyNotified = useRef<Map<string, number>>(new Map())

  const check = useCallback(async () => {
    try {
      const pos = await Geolocation.getCurrentPosition({ timeout: 10000, enableHighAccuracy: false })
      const { latitude, longitude } = pos.coords
      const now = Date.now()
      const COOLDOWN_MS = 10 * 60 * 1000

      for (const poi of pois) {
        if (visitedIds.includes(poi.id)) continue
        const lastNotified = recentlyNotified.current.get(poi.id) || 0
        if (now - lastNotified < COOLDOWN_MS) continue

        const dist = getDistanceMeters(latitude, longitude, poi.location.lat, poi.location.lng)
        const radius = poi.radius ?? 100

        if (dist <= radius) {
          recentlyNotified.current.set(poi.id, now)

          // Проверяем в фоне ли приложение
          let isBackground = false
          if (Capacitor.isNativePlatform()) {
            try {
              const state = await App.getState()
              isBackground = !state.isActive
            } catch { /* getState not available outside native */ }
          }

          if (isBackground) {
            // Приложение в фоне — показываем системное уведомление
            const name = poi.name?.ru || poi.name?.en || ''
            await showLocalNotification('Вы рядом', `${name} — нажмите чтобы отметить посещение`)
          } else {
            // Приложение открыто — показываем in-app toast
            onNearby(poi)
          }

          break // одно уведомление за раз
        }
      }
    } catch {
      // Нет разрешения или нет GPS — молча игнорируем
    }
  }, [pois, visitedIds, onNearby])

  useEffect(() => {
    check()
    const interval = setInterval(check, CHECK_INTERVAL_MS)
    return () => clearInterval(interval)
  }, [check])
}
