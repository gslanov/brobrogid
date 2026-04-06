import { useEffect, useRef, useState, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { SEO } from '@/shared/ui/SEO'
import maplibregl from 'maplibre-gl'
import 'maplibre-gl/dist/maplibre-gl.css'
import { useDataStore } from '@/data/stores/data-store'
import { useUIStore } from '@/data/stores/ui-store'
import { CATEGORY_COLORS, CATEGORY_ICONS, CATEGORY_MAP_LABELS } from '@/shared/lib/utils'
import { BottomSheet, type SheetState } from '@/shared/ui/BottomSheet'
import { MapPOISheet } from '@/features/map/components/MapPOISheet'
import type { POI, POICategory } from '@/data/types'

const VLADIKAVKAZ_CENTER: [number, number] = [44.6678, 43.0367]
const ALL_CATEGORIES: POICategory[] = ['attractions', 'food', 'nature', 'culture', 'shopping', 'activities', 'transport', 'practical']

function buildGeoJSON(pois: POI[]) {
  return {
    type: 'FeatureCollection' as const,
    features: pois.map((poi) => ({
      type: 'Feature' as const,
      properties: {
        id: poi.id,
        category: poi.category,
        icon: CATEGORY_MAP_LABELS[poi.category],
        color: CATEGORY_COLORS[poi.category],
        name: poi.name.ru,
      },
      geometry: {
        type: 'Point' as const,
        coordinates: [poi.location.lng, poi.location.lat],
      },
    })),
  }
}

export default function MapPage() {
  const mapContainer = useRef<HTMLDivElement>(null)
  const mapRef = useRef<maplibregl.Map | null>(null)
  const poisRef = useRef<POI[]>([])
  const { t } = useTranslation()
  const pois = useDataStore((s) => s.pois)
  poisRef.current = pois
  const mapFilter = useUIStore((s) => s.mapFilter)
  const setMapFilter = useUIStore((s) => s.setMapFilter)
  const setBottomSheetState = useUIStore((s) => s.setBottomSheetState)

  const [selectedPoi, setSelectedPoi] = useState<POI | null>(null)
  const [sheetState, setSheetState] = useState<SheetState>('closed')
  const [showSearchArea, setShowSearchArea] = useState(false)

  const [boundsFilter, setBoundsFilter] = useState<{ north: number; south: number; east: number; west: number } | null>(null)

  const filtered = (() => {
    let result = mapFilter ? pois.filter((p) => p.category === mapFilter) : pois
    if (boundsFilter) {
      result = result.filter((p) => {
        const { lat, lng } = p.location
        return lat >= boundsFilter.south && lat <= boundsFilter.north &&
               lng >= boundsFilter.west && lng <= boundsFilter.east
      })
    }
    return result
  })()

  const handleSheetStateChange = useCallback((state: SheetState) => {
    setSheetState(state)
    setBottomSheetState(state === 'closed' ? 'peek' : state as any)
    if (state === 'closed') setSelectedPoi(null)
  }, [setBottomSheetState])

  // Initialize map
  useEffect(() => {
    if (!mapContainer.current || mapRef.current) return

    const map = new maplibregl.Map({
      container: mapContainer.current,
      style: 'https://basemaps.cartocdn.com/gl/positron-gl-style/style.json',
      center: VLADIKAVKAZ_CENTER,
      zoom: 13,
      attributionControl: false,
    })

    map.on('load', () => {
      // Step 3.4 — GeoJSON source with clustering
      map.addSource('pois', {
        type: 'geojson',
        data: buildGeoJSON(pois),
        cluster: true,
        clusterMaxZoom: 14,
        clusterRadius: 50,
      })

      // Cluster circles
      map.addLayer({
        id: 'clusters',
        type: 'circle',
        source: 'pois',
        filter: ['has', 'point_count'],
        paint: {
          'circle-color': '#1A73E8',
          'circle-radius': ['step', ['get', 'point_count'], 15, 10, 20, 50, 25],
          'circle-stroke-width': 3,
          'circle-stroke-color': '#fff',
        },
      })

      // Cluster count labels
      map.addLayer({
        id: 'cluster-count',
        type: 'symbol',
        source: 'pois',
        filter: ['has', 'point_count'],
        layout: {
          'text-field': '{point_count_abbreviated}',
          'text-size': 12,
        },
        paint: {
          'text-color': '#ffffff',
        },
      })

      // Unclustered individual markers
      map.addLayer({
        id: 'unclustered-point',
        type: 'circle',
        source: 'pois',
        filter: ['!', ['has', 'point_count']],
        paint: {
          'circle-color': ['get', 'color'],
          'circle-radius': 8,
          'circle-stroke-width': 3,
          'circle-stroke-color': '#fff',
        },
      })

      // Unclustered marker icons (text labels)
      map.addLayer({
        id: 'unclustered-icon',
        type: 'symbol',
        source: 'pois',
        filter: ['!', ['has', 'point_count']],
        layout: {
          'text-field': ['get', 'icon'],
          'text-size': 14,
          'text-allow-overlap': true,
        },
      })

      // Click on cluster → zoom in
      map.on('click', 'clusters', (e) => {
        const features = map.queryRenderedFeatures(e.point, { layers: ['clusters'] })
        if (!features.length) return
        const clusterId = features[0].properties.cluster_id
        const source = map.getSource('pois') as maplibregl.GeoJSONSource
        source.getClusterExpansionZoom(clusterId).then((zoom) => {
          map.easeTo({
            center: (features[0].geometry as any).coordinates,
            zoom,
          })
        })
      })

      // Click on individual marker → select POI
      map.on('click', 'unclustered-point', (e) => {
        const features = map.queryRenderedFeatures(e.point, { layers: ['unclustered-point'] })
        if (!features.length) return
        const poiId = features[0].properties.id
        const poi = poisRef.current.find((p) => p.id === poiId)
        if (poi) {
          setSelectedPoi(poi)
          setSheetState('peek')
          map.flyTo({ center: [poi.location.lng, poi.location.lat], duration: 300 })
        }
      })

      // Cursor changes
      map.on('mouseenter', 'clusters', () => { map.getCanvas().style.cursor = 'pointer' })
      map.on('mouseleave', 'clusters', () => { map.getCanvas().style.cursor = '' })
      map.on('mouseenter', 'unclustered-point', () => { map.getCanvas().style.cursor = 'pointer' })
      map.on('mouseleave', 'unclustered-point', () => { map.getCanvas().style.cursor = '' })

      // Step 3.5 — "Search this area" on moveend
      map.on('moveend', () => {
        setShowSearchArea(true)
      })
    })

    mapRef.current = map

    return () => { map.remove(); mapRef.current = null }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // Update GeoJSON data when filter changes
  useEffect(() => {
    if (!mapRef.current) return
    const source = mapRef.current.getSource('pois') as maplibregl.GeoJSONSource | undefined
    if (source) {
      source.setData(buildGeoJSON(filtered))
    }
  }, [filtered])

  const handleSearchArea = () => {
    setShowSearchArea(false)
    if (!mapRef.current) return
    const bounds = mapRef.current.getBounds()
    setBoundsFilter({
      north: bounds.getNorth(),
      south: bounds.getSouth(),
      east: bounds.getEast(),
      west: bounds.getWest(),
    })
  }

  return (
    <div className="relative h-[calc(100dvh-var(--bottom-nav-height)-var(--safe-area-bottom))]">
      <SEO
        title="Карта Владикавказа — BROBROGID"
        description="Интерактивная карта Владикавказа с достопримечательностями, ресторанами и маршрутами."
        url="/map"
      />
      {/* Step 3.5 — Category filter chips */}
      <div className="absolute top-3 left-0 right-0 z-10 flex gap-2 px-3 overflow-x-auto no-scrollbar">
        <button
          onClick={() => setMapFilter(null)}
          className={`flex-shrink-0 px-3 py-2 rounded-full text-xs font-medium shadow-md border ${!mapFilter ? 'bg-[var(--color-primary)] text-white border-[var(--color-primary)]' : 'bg-white border-white'}`}
        >
          {t('search.all')}
        </button>
        {ALL_CATEGORIES.map((cat) => {
          const Icon = CATEGORY_ICONS[cat]
          return (
            <button
              key={cat}
              onClick={() => setMapFilter(mapFilter === cat ? null : cat)}
              className={`flex-shrink-0 flex items-center gap-1 px-3 py-2 rounded-full text-xs font-medium shadow-md border ${mapFilter === cat ? 'bg-[var(--color-primary)] text-white border-[var(--color-primary)]' : 'bg-white border-white'}`}
            >
              <Icon size={14} /> {t(`categories.${cat}`)}
            </button>
          )
        })}
      </div>

      {/* Step 3.5 — "Search this area" button */}
      {showSearchArea && (
        <button
          onClick={handleSearchArea}
          className="absolute top-16 left-1/2 -translate-x-1/2 z-10 px-4 py-2 bg-white rounded-full shadow-lg text-sm font-medium text-[var(--color-primary)] border border-[var(--color-border)]"
        >
          {t('search.searchArea', 'Search this area')}
        </button>
      )}

      {/* Map container */}
      <div ref={mapContainer} className="w-full h-full" />

      {/* Step 3.5 — GPS + Zoom controls */}
      <div
        className="absolute right-3 z-10 flex flex-col gap-2 transition-all duration-200"
        style={{ bottom: selectedPoi ? (sheetState === 'peek' ? 140 : sheetState === 'half' ? '52%' : '92%') : 16 }}
      >
        <button
          onClick={() => {
            if (mapRef.current) {
              navigator.geolocation?.getCurrentPosition((pos) => {
                mapRef.current?.flyTo({ center: [pos.coords.longitude, pos.coords.latitude], zoom: 15 })
              })
            }
          }}
          className="w-10 h-10 bg-white rounded-full shadow-lg flex items-center justify-center border border-[var(--color-border)]"
          aria-label="My location"
        >
          <svg className="w-5 h-5 text-[var(--color-primary)]" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z" />
          </svg>
        </button>
        <button
          onClick={() => mapRef.current?.zoomIn()}
          className="w-10 h-10 bg-white rounded-full shadow-lg flex items-center justify-center border border-[var(--color-border)] text-lg font-bold"
          aria-label="Zoom in"
        >+</button>
        <button
          onClick={() => mapRef.current?.zoomOut()}
          className="w-10 h-10 bg-white rounded-full shadow-lg flex items-center justify-center border border-[var(--color-border)] text-lg font-bold"
          aria-label="Zoom out"
        >−</button>
      </div>

      {/* Step 3.1/3.2/3.3 — Bottom sheet with POI preview */}
      {selectedPoi && (
        <BottomSheet
          isOpen={!!selectedPoi}
          state={sheetState}
          onStateChange={handleSheetStateChange}
        >
          <MapPOISheet poi={selectedPoi} state={sheetState} />
        </BottomSheet>
      )}
    </div>
  )
}
