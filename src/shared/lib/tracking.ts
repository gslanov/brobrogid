const API_URL = import.meta.env.VITE_API_URL as string | undefined

export type TrackEvent = 'directions' | 'call'

const STORAGE_KEY = 'brobrogid_track'

function loadLocal(): Record<string, Record<string, number>> {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}')
  } catch {
    return {}
  }
}

function saveLocal(data: Record<string, Record<string, number>>) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
}

export async function trackEvent(type: TrackEvent, poiId: string): Promise<void> {
  // Локальный счётчик всегда
  const data = loadLocal()
  if (!data[type]) data[type] = {}
  data[type][poiId] = (data[type][poiId] || 0) + 1
  saveLocal(data)

  // Сервер если подключён
  if (API_URL) {
    try {
      await fetch(`${API_URL}/api/track`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type, poiId }),
      })
    } catch { /* silent */ }
  }
}

export interface TrackStats {
  directions: Record<string, number>
  calls: Record<string, number>
}

export async function fetchStats(): Promise<TrackStats> {
  if (API_URL) {
    try {
      const res = await fetch(`${API_URL}/api/stats`)
      if (res.ok) return res.json()
    } catch { /* silent */ }
  }
  const data = loadLocal()
  return {
    directions: data['directions'] || {},
    calls: data['call'] || {},
  }
}
