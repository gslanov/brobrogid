import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import maplibregl from 'maplibre-gl'
import 'maplibre-gl/dist/maplibre-gl.css'
import { useDataStore } from '@/data/stores/data-store'
import { useUIStore } from '@/data/stores/ui-store'
import { CATEGORY_COLORS, CATEGORY_ICONS, formatRating } from '@/shared/lib/utils'
// geolocation available for future use
import type { POI, POICategory } from '@/data/types'

const VLADIKAVKAZ_CENTER: [number, number] = [44.6678, 43.0367]

const ALL_CATEGORIES: POICategory[] = ['attractions', 'food', 'nature', 'culture', 'shopping', 'activities', 'practical']

export default function MapPage() {
  const mapContainer = useRef<HTMLDivElement>(null)
  const mapRef = useRef<maplibregl.Map | null>(null)
  const markersRef = useRef<maplibregl.Marker[]>([])
  const navigate = useNavigate()
  const { i18n } = useTranslation()
  const lang = i18n.language as 'ru' | 'en'
  const pois = useDataStore((s) => s.pois)
  const mapFilter = useUIStore((s) => s.mapFilter)
  const setMapFilter = useUIStore((s) => s.setMapFilter)
  const [selectedPoi, setSelectedPoi] = useState<POI | null>(null)
  // const geo = useGeolocation()

  useEffect(() => {
    if (!mapContainer.current || mapRef.current) return

    const map = new maplibregl.Map({
      container: mapContainer.current,
      style: 'https://basemaps.cartocdn.com/gl/positron-gl-style/style.json',
      center: VLADIKAVKAZ_CENTER,
      zoom: 13,
      attributionControl: false,
    })

    map.addControl(new maplibregl.NavigationControl(), 'top-right')
    map.addControl(new maplibregl.GeolocateControl({ positionOptions: { enableHighAccuracy: true }, trackUserLocation: true }), 'top-right')

    mapRef.current = map

    return () => { map.remove(); mapRef.current = null }
  }, [])

  useEffect(() => {
    if (!mapRef.current) return
    const map = mapRef.current

    // Clear old markers
    markersRef.current.forEach(m => m.remove())
    markersRef.current = []

    const filtered = mapFilter ? pois.filter(p => p.category === mapFilter) : pois

    filtered.forEach(poi => {
      const color = CATEGORY_COLORS[poi.category]
      const icon = CATEGORY_ICONS[poi.category]

      const el = document.createElement('div')
      el.className = 'flex items-center justify-center cursor-pointer'
      el.style.cssText = `width:36px;height:36px;background:${color};border-radius:50%;border:3px solid white;box-shadow:0 2px 8px rgba(0,0,0,0.3);font-size:16px;display:flex;align-items:center;justify-content:center;`
      el.textContent = icon
      el.onclick = () => setSelectedPoi(poi)

      const marker = new maplibregl.Marker({ element: el })
        .setLngLat([poi.location.lng, poi.location.lat])
        .addTo(map)

      markersRef.current.push(marker)
    })
  }, [pois, mapFilter])

  return (
    <div className="relative h-[calc(100dvh-var(--bottom-nav-height)-var(--safe-area-bottom))]">
      {/* Category filters */}
      <div className="absolute top-3 left-0 right-0 z-10 flex gap-2 px-3 overflow-x-auto no-scrollbar">
        <button
          onClick={() => setMapFilter(null)}
          className={`flex-shrink-0 px-3 py-2 rounded-full text-xs font-medium shadow-md border ${!mapFilter ? 'bg-[var(--color-primary)] text-white border-[var(--color-primary)]' : 'bg-white border-white'}`}
        >{'\u0412\u0441\u0435'}</button>
        {ALL_CATEGORIES.map(cat => (
          <button
            key={cat}
            onClick={() => setMapFilter(mapFilter === cat ? null : cat)}
            className={`flex-shrink-0 px-3 py-2 rounded-full text-xs font-medium shadow-md border ${mapFilter === cat ? 'bg-[var(--color-primary)] text-white border-[var(--color-primary)]' : 'bg-white border-white'}`}
          >
            {CATEGORY_ICONS[cat]} {cat === 'food' ? '\u0415\u0434\u0430' : cat === 'attractions' ? '\u041C\u0435\u0441\u0442\u0430' : cat === 'nature' ? '\u041F\u0440\u0438\u0440\u043E\u0434\u0430' : cat === 'culture' ? '\u041A\u0443\u043B\u044C\u0442\u0443\u0440\u0430' : cat === 'shopping' ? '\u041C\u0430\u0433\u0430\u0437\u0438\u043D\u044B' : cat === 'activities' ? '\u0410\u043A\u0442\u0438\u0432\u043D\u043E\u0441\u0442\u0438' : '\u041F\u043E\u043B\u0435\u0437\u043D\u043E\u0435'}
          </button>
        ))}
      </div>

      {/* Map */}
      <div ref={mapContainer} className="w-full h-full" />

      {/* Selected POI bottom card */}
      {selectedPoi && (
        <div className="absolute bottom-4 left-3 right-3 z-10">
          <div className="bg-white rounded-2xl shadow-lg p-3 flex gap-3">
            <div className="w-20 h-20 rounded-xl bg-gray-100 flex-shrink-0 overflow-hidden">
              <img src={selectedPoi.photos[0]} alt="" className="w-full h-full object-cover"
                onError={(e) => { (e.target as HTMLImageElement).src = `https://placehold.co/160x160/e2e8f0/64748b?text=${CATEGORY_ICONS[selectedPoi.category]}` }} />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-bold text-sm truncate">{selectedPoi.name[lang]}</h3>
              <p className="text-xs text-[var(--color-text-secondary)] line-clamp-1">{selectedPoi.description.short[lang]}</p>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-yellow-500 text-xs">{'\u2605'}</span>
                <span className="text-xs font-medium">{formatRating(selectedPoi.rating)}</span>
                {selectedPoi.priceLevel && <span className="text-xs text-[var(--color-text-secondary)]">{'\u20BD'.repeat(selectedPoi.priceLevel)}</span>}
              </div>
              <button onClick={() => navigate(`/poi/${selectedPoi.id}`)} className="mt-1.5 px-3 py-1 bg-[var(--color-primary)] text-white rounded-lg text-xs font-medium">
                {'\u041F\u043E\u0434\u0440\u043E\u0431\u043D\u0435\u0435'}
              </button>
            </div>
            <button onClick={() => setSelectedPoi(null)} className="self-start text-gray-400 text-lg">{'\u2715'}</button>
          </div>
        </div>
      )}
    </div>
  )
}
