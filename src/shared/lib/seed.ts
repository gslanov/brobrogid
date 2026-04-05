import { getDB } from '@/data/db'
import type { EmergencyContact, TransportRoute } from '@/data/types'

async function loadJSON<T>(path: string): Promise<T> {
  const res = await fetch(path)
  if (!res.ok) throw new Error(`Failed to load ${path}: ${res.status}`)
  return res.json()
}

/**
 * Convert emergency.json (nested object) → EmergencyContact[]
 * JSON has: { emergencyNumbers, hospitals, traumaCenters, pharmacies, usefulContacts }
 * IDB expects: { id, type, name, phone, location, is24h }
 */
function normalizeEmergency(raw: Record<string, unknown[]>): EmergencyContact[] {
  const contacts: EmergencyContact[] = []
  let idx = 0

  const emptyLocation = { lat: 0, lng: 0, address: { ru: '', en: '' } }

  // emergencyNumbers → type: 'police' (general emergency numbers)
  for (const item of (raw.emergencyNumbers || []) as Array<Record<string, unknown>>) {
    contacts.push({
      id: `emergency-${++idx}`,
      type: 'police',
      name: (item.service as { ru: string; en: string }) || { ru: '', en: '' },
      phone: (item.number as string) || '',
      location: emptyLocation,
      is24h: true,
    })
  }

  // hospitals → type: 'hospital'
  for (const item of (raw.hospitals || []) as Array<Record<string, unknown>>) {
    contacts.push({
      id: `emergency-${++idx}`,
      type: (item.type as EmergencyContact['type']) || 'hospital',
      name: (item.name as { ru: string; en: string }) || { ru: '', en: '' },
      phone: (item.phone as string) || '',
      location: {
        lat: (item.location as { lat: number; lng: number })?.lat || 0,
        lng: (item.location as { lat: number; lng: number })?.lng || 0,
        address: (item.address as { ru: string; en: string }) || { ru: '', en: '' },
      },
      is24h: !!(item.hasEmergency),
    })
  }

  // traumaCenters → type: 'trauma'
  for (const item of (raw.traumaCenters || []) as Array<Record<string, unknown>>) {
    contacts.push({
      id: `emergency-${++idx}`,
      type: 'trauma',
      name: (item.name as { ru: string; en: string }) || { ru: '', en: '' },
      phone: (item.phone as string) || '',
      location: {
        lat: (item.location as { lat: number; lng: number })?.lat || 0,
        lng: (item.location as { lat: number; lng: number })?.lng || 0,
        address: (item.address as { ru: string; en: string }) || { ru: '', en: '' },
      },
      is24h: false,
    })
  }

  // pharmacies → type: 'pharmacy'
  for (const item of (raw.pharmacies || []) as Array<Record<string, unknown>>) {
    contacts.push({
      id: `emergency-${++idx}`,
      type: 'pharmacy',
      name: (item.name as { ru: string; en: string }) || { ru: '', en: '' },
      phone: (item.phone as string) || '',
      location: {
        lat: (item.location as { lat: number; lng: number })?.lat || 0,
        lng: (item.location as { lat: number; lng: number })?.lng || 0,
        address: (item.address as { ru: string; en: string }) || { ru: '', en: '' },
      },
      is24h: !!(item.is24h),
    })
  }

  return contacts
}

/**
 * Convert transport.json (nested object) → TransportRoute[]
 * JSON has: { routes, taxis, tips }
 * IDB expects: { id, number, name, type, stops[], schedule?, color }
 * JSON stops have flat lat/lng; IDB expects { name, location: { lat, lng } }
 */
function normalizeTransport(raw: Record<string, unknown[]>): TransportRoute[] {
  const routes: TransportRoute[] = []

  for (const item of (raw.routes || []) as Array<Record<string, unknown>>) {
    const rawStops = (item.stops || []) as Array<Record<string, unknown>>
    routes.push({
      id: (item.id as string) || `transport-${routes.length + 1}`,
      number: (item.number as string) || '',
      name: (item.name as { ru: string; en: string }) || { ru: '', en: '' },
      type: (item.type as TransportRoute['type']) || 'bus',
      stops: rawStops.map((s) => ({
        name: (s.name as { ru: string; en: string }) || { ru: '', en: '' },
        location: { lat: (s.lat as number) || 0, lng: (s.lng as number) || 0 },
      })),
      schedule: item.hours ? { weekday: item.hours as string, weekend: item.hours as string } : undefined,
      color: '#3B82F6',
    })
  }

  return routes
}

export async function seedDatabase() {
  const db = await getDB()

  const poisCount = await db.count('pois')
  if (poisCount > 0) return // Already seeded

  // Fetch all content — sequential to reduce server load, with individual error handling
  let pois: unknown[] = []
  let tours: unknown[] = []
  let guides: unknown[] = []
  let reviews: unknown[] = []
  let menuItems: unknown[] = []
  let emergencyContacts: EmergencyContact[] = []
  let transportRoutes: TransportRoute[] = []

  try {
    ;[pois, tours, guides, reviews, menuItems] = await Promise.all([
      loadJSON<unknown[]>('/content/pois.json'),
      loadJSON<unknown[]>('/content/tours.json'),
      loadJSON<unknown[]>('/content/guides.json'),
      loadJSON<unknown[]>('/content/reviews.json'),
      loadJSON<unknown[]>('/content/menu-items.json'),
    ])
  } catch (err) {
    console.error('Seed: failed to load core content', err)
    throw err
  }

  // Emergency and transport have different JSON structure — normalize
  try {
    const rawEmergency = await loadJSON<Record<string, unknown[]>>('/content/emergency.json')
    emergencyContacts = normalizeEmergency(rawEmergency)
  } catch (err) {
    console.warn('Seed: emergency data skipped', err)
  }

  try {
    const rawTransport = await loadJSON<Record<string, unknown[]>>('/content/transport.json')
    transportRoutes = normalizeTransport(rawTransport)
  } catch (err) {
    console.warn('Seed: transport data skipped', err)
  }

  // Write to IDB in a single transaction
  const tx = db.transaction(
    ['pois', 'tours', 'guides', 'reviews', 'emergency', 'transport', 'menuItems', 'collections'],
    'readwrite',
  )

  for (const poi of pois as Record<string, unknown>[]) await tx.objectStore('pois').put(poi as never)
  for (const tour of tours as Record<string, unknown>[]) await tx.objectStore('tours').put(tour as never)
  for (const guide of guides as Record<string, unknown>[]) await tx.objectStore('guides').put(guide as never)
  for (const review of reviews as Record<string, unknown>[]) await tx.objectStore('reviews').put(review as never)
  for (const item of emergencyContacts) await tx.objectStore('emergency').put(item as never)
  for (const route of transportRoutes) await tx.objectStore('transport').put(route as never)
  for (const item of menuItems as Record<string, unknown>[]) await tx.objectStore('menuItems').put(item as never)

  // Create default favorites collection
  await tx.objectStore('collections').put({
    id: 'favorites',
    name: 'Избранное',
    poiIds: [],
    createdAt: new Date().toISOString(),
  } as never)

  await tx.done
}
