import type { POICategory } from '@/data/types'
import {
  Landmark,
  UtensilsCrossed,
  Building,
  TreePine,
  Palette,
  Bus,
  Mountain,
  Info,
  Compass,
  Library,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

export const CATEGORY_COLORS: Record<POICategory, string> = {
  attractions: '#ef4444',
  food: '#f59e0b',
  accommodation: '#8b5cf6',
  nature: '#10b981',
  culture: '#3b82f6',
  museums: '#6366f1',

  transport: '#64748b',
  activities: '#f97316',
  practical: '#14b8a6',
  tours: '#0ea5e9',
}

export const CATEGORY_ICONS: Record<POICategory, LucideIcon> = {
  attractions: Landmark,
  food: UtensilsCrossed,
  accommodation: Building,
  nature: TreePine,
  culture: Palette,
  museums: Library,

  transport: Bus,
  activities: Mountain,
  practical: Info,
  tours: Compass,
}

/** Short text labels for map markers where SVG components cannot be used */
export const CATEGORY_MAP_LABELS: Record<POICategory, string> = {
  attractions: 'A',
  food: 'F',
  accommodation: 'H',
  nature: 'N',
  culture: 'C',
  museums: 'M',

  transport: 'T',
  activities: 'X',
  practical: 'i',
  tours: 'T',
}

export function formatPrice(price: number): string {
  return new Intl.NumberFormat('ru-RU').format(price) + ' ₽'
}

export function formatRating(rating: number): string {
  return rating.toFixed(1)
}

export function getDistanceKm(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371
  const dLat = ((lat2 - lat1) * Math.PI) / 180
  const dLng = ((lng2 - lng1) * Math.PI) / 180
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLng / 2) ** 2
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

export function formatDistance(km: number): string {
  if (km < 1) return `${Math.round(km * 1000)} м`
  return `${km.toFixed(1)} км`
}

export function cn(...classes: (string | false | undefined | null)[]): string {
  return classes.filter(Boolean).join(' ')
}

export function resetScroll() {
  const el = document.getElementById('scroll-root')
  if (el) el.scrollTop = 0
  window.scrollTo(0, 0)
}
