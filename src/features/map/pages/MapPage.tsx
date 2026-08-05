import { useEffect, useRef, useState, useCallback, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { SEO } from '@/shared/ui/SEO'
import maplibregl from 'maplibre-gl'
import 'maplibre-gl/dist/maplibre-gl.css'
import { Geolocation } from '@capacitor/geolocation'
import { useDataStore } from '@/data/stores/data-store'
import { useUIStore } from '@/data/stores/ui-store'
import { CATEGORY_COLORS, CATEGORY_ICONS, CATEGORY_MAP_LABELS } from '@/shared/lib/utils'
import { BottomSheet, type SheetState } from '@/shared/ui/BottomSheet'
import { MapPOISheet } from '@/features/map/components/MapPOISheet'
import type { POI, POICategory, TransportRoute } from '@/data/types'
import type { Point } from 'geojson'

function createPhotoMarkerEl(poi: POI): HTMLElement {
  const color = CATEGORY_COLORS[poi.category]
  const photo = poi.photos?.[0] ?? ''

  const el = document.createElement('div')
  el.style.cssText = 'display:flex;flex-direction:column;align-items:center;cursor:pointer;filter:drop-shadow(0 3px 8px rgba(0,0,0,.35))'

  const circle = document.createElement('div')
  circle.style.cssText = `width:42px;height:42px;border-radius:50%;overflow:hidden;border:3px solid ${color};background:${color};flex-shrink:0`

  if (photo) {
    const img = document.createElement('img')
    img.src = photo
    img.style.cssText = 'width:100%;height:100%;object-fit:cover;display:block'
    circle.appendChild(img)
  } else {
    circle.style.cssText += ';display:flex;align-items:center;justify-content:center'
    const span = document.createElement('span')
    span.style.cssText = 'color:white;font-weight:700;font-size:15px'
    span.textContent = CATEGORY_MAP_LABELS[poi.category]
    circle.appendChild(span)
  }

  const tail = document.createElement('div')
  tail.style.cssText = `width:0;height:0;border-left:8px solid transparent;border-right:8px solid transparent;border-top:12px solid ${color};margin-top:-1px`

  el.appendChild(circle)
  el.appendChild(tail)

  return el
}

const VLADIKAVKAZ_CENTER: [number, number] = [44.6678, 43.0367]
// «shopping» удалён из проекта
const ALL_CATEGORIES: POICategory[] = ['attractions', 'food', 'nature', 'culture', 'museums', 'activities', 'transport', 'practical']


function buildTransportGeoJSON(routes: TransportRoute[]) {
  const stopMap = new Map<string, { name: string; routeNumbers: string[]; lat: number; lng: number }>()

  for (const route of routes) {
    if (route.type === 'tram') continue
    if (!route.stops.length) continue

    const terminals = [route.stops[0], route.stops[route.stops.length - 1]]

    for (const stop of terminals) {
      const key = `${stop.location.lat.toFixed(3)}_${stop.location.lng.toFixed(3)}`
      if (stopMap.has(key)) {
        const s = stopMap.get(key)!
        if (!s.routeNumbers.includes(route.number)) s.routeNumbers.push(route.number)
      } else {
        stopMap.set(key, {
          name: stop.name.ru,
          routeNumbers: [route.number],
          lat: stop.location.lat,
          lng: stop.location.lng,
        })
      }
    }
  }

  return {
    type: 'FeatureCollection' as const,
    features: Array.from(stopMap.values()).map((s) => ({
      type: 'Feature' as const,
      properties: { name: s.name, routes: s.routeNumbers.join(', ') },
      geometry: { type: 'Point' as const, coordinates: [s.lng, s.lat] },
    })),
  }
}

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
  const markersRef = useRef<Map<string, maplibregl.Marker>>(new Map())
  const isProgrammaticMoveRef = useRef(false)
  const { t } = useTranslation()
  const pois = useDataStore((s) => s.pois)
  const mapFilter = useUIStore((s) => s.mapFilter)
  const setMapFilter = useUIStore((s) => s.setMapFilter)
  const setBottomSheetState = useUIStore((s) => s.setBottomSheetState)

  const [selectedPoi, setSelectedPoi] = useState<POI | null>(null)
  const [sheetState, setSheetState] = useState<SheetState>('closed')
  const [transportRoutes, setTransportRoutes] = useState<TransportRoute[]>([])
  const [mapLoaded, setMapLoaded] = useState(false)

  useEffect(() => {
    poisRef.current = pois
  })

  useEffect(() => {
    fetch('/content/transport.json')
      .then((r) => r.json())
      .then((d) => setTransportRoutes(d.routes))
      .catch(() => {})
  }, [])

  const filtered = useMemo(() => {
    return mapFilter ? pois.filter((p) => p.category === mapFilter) : pois
  }, [pois, mapFilter])

  const handleSheetStateChange = useCallback((state: SheetState) => {
    setSheetState(state)
    setBottomSheetState(state !== 'closed' ? state : 'peek')
    if (state === 'closed') setSelectedPoi(null)
  }, [setBottomSheetState])

  // Initialize map
  useEffect(() => {
    if (!mapContainer.current || mapRef.current) return

    const map = new maplibregl.Map({
      container: mapContainer.current,
      // Тёмная подложка — карта в одном тоне с остальным приложением,
      // на ней светятся только наши метки
      style: 'https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json',
      center: VLADIKAVKAZ_CENTER,
      zoom: 13,
      attributionControl: false,
    })

    map.on('load', () => {
      setMapLoaded(true)

      /* Номера домов. В тёмной карте Carto слой `housenumber` есть, но залит
         прозрачным цветом — номера рисуются и не видны. Перекрашиваем в спокойный
         серый с тёмной обводкой и опускаем порог показа с 17-го уровня на 16-й,
         чтобы номера появлялись, когда на экране квартал, а не один двор. */
      if (map.getLayer('housenumber')) {
        map.setPaintProperty('housenumber', 'text-color', '#98A2AF')
        map.setPaintProperty('housenumber', 'text-halo-color', 'rgba(6,7,10,0.9)')
        map.setPaintProperty('housenumber', 'text-halo-width', 1.1)
        map.setLayerZoomRange('housenumber', 16, 24)
      }

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
          'circle-color': '#E08A4A',
          'circle-radius': ['step', ['get', 'point_count'], 15, 10, 20, 50, 25],
          'circle-stroke-width': 2,
          'circle-stroke-color': 'rgba(6,7,10,0.85)',
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
          'text-color': '#140F0A',
        },
      })

      // Sync custom photo markers on each render
      map.on('render', () => {
        if (!map.isSourceLoaded('pois')) return

        const features = map.querySourceFeatures('pois', {
          filter: ['!', ['has', 'point_count']],
        })

        const visibleIds = new Set<string>()

        for (const feature of features) {
          const id = feature.properties?.id as string
          if (!id) continue
          visibleIds.add(id)

          if (!markersRef.current.has(id)) {
            const poi = poisRef.current.find((p) => p.id === id)
            if (!poi) continue

            const el = createPhotoMarkerEl(poi)
            el.addEventListener('click', () => {
              setSelectedPoi(poi)
              setSheetState('peek')
              isProgrammaticMoveRef.current = true
              map.flyTo({ center: [poi.location.lng, poi.location.lat], duration: 300 })
            })

            const marker = new maplibregl.Marker({ element: el, anchor: 'bottom' })
              .setLngLat([poi.location.lng, poi.location.lat])
              .addTo(map)

            markersRef.current.set(id, marker)
          }
        }

        for (const [id, marker] of Array.from(markersRef.current.entries())) {
          if (!visibleIds.has(id)) {
            marker.remove()
            markersRef.current.delete(id)
          }
        }
      })

      // Click on cluster → zoom in
      map.on('click', 'clusters', (e) => {
        const features = map.queryRenderedFeatures(e.point, { layers: ['clusters'] })
        if (!features.length) return
        const clusterId = features[0].properties.cluster_id
        const source = map.getSource('pois') as maplibregl.GeoJSONSource
        source.getClusterExpansionZoom(clusterId).then((zoom) => {
          isProgrammaticMoveRef.current = true
          map.easeTo({
            center: (features[0].geometry as Point).coordinates as [number, number],
            zoom,
          })
        })
      })


      // Transport stops source + layers
      map.addSource('transport-stops', {
        type: 'geojson',
        data: { type: 'FeatureCollection', features: [] },
      })
      map.addLayer({
        id: 'transport-stops-layer',
        type: 'circle',
        source: 'transport-stops',
        paint: {
          'circle-color': '#8A94A3',
          'circle-radius': 8,
          'circle-stroke-width': 2,
          'circle-stroke-color': 'rgba(6,7,10,0.8)',
        },
        layout: { visibility: 'visible' },
      })
      map.addLayer({
        id: 'transport-labels',
        type: 'symbol',
        source: 'transport-stops',
        layout: {
          'text-field': ['get', 'routes'],
          'text-size': 10,
          'text-offset': [0, 1.4],
          'text-anchor': 'top',
          'visibility': 'visible',
        },
        paint: { 'text-color': '#E8D5B7', 'text-halo-color': 'rgba(6,7,10,0.9)', 'text-halo-width': 1.2 },
      })

      // Click on transport stop → popup
      map.on('click', 'transport-stops-layer', (e) => {
        const features = map.queryRenderedFeatures(e.point, { layers: ['transport-stops-layer'] })
        if (!features.length) return
        const { name, routes } = features[0].properties as { name: string; routes: string }
        new maplibregl.Popup({ closeButton: false })
          .setLngLat((features[0].geometry as GeoJSON.Point).coordinates as [number, number])
          .setHTML(`<div style="font-size:12.5px;line-height:1.5"><b>${name}</b><br/><span style="color:#9AA3AF">Маршруты: ${routes}</span></div>`)
          .addTo(map)
      })
      map.on('mouseenter', 'transport-stops-layer', () => { map.getCanvas().style.cursor = 'pointer' })
      map.on('mouseleave', 'transport-stops-layer', () => { map.getCanvas().style.cursor = '' })

      // Cursor changes
      map.on('mouseenter', 'clusters', () => { map.getCanvas().style.cursor = 'pointer' })
      map.on('mouseleave', 'clusters', () => { map.getCanvas().style.cursor = '' })

      // House numbers — visible from zoom 14
      map.addLayer({
        id: 'house-numbers',
        type: 'symbol',
        source: 'carto',
        'source-layer': 'housenumber',
        minzoom: 14,
        layout: {
          'text-field': ['get', 'housenumber'],
          'text-size': 10,
          'text-font': ['Open Sans Regular', 'Arial Unicode MS Regular'],
        },
        paint: {
          'text-color': '#888888',
          'text-halo-color': '#ffffff',
          'text-halo-width': 1,
        },
      })

      // Mountain peaks — GeoJSON from North Ossetia OSM administrative boundary
      map.addSource('mountain-peaks', {
        type: 'geojson',
        data: '/content/mountain-peaks.json',
      })

      const mountainSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20"><path d="M1,19 L6,6 L10,11 L15,3 L19,19 Z" fill="none" stroke="#6b4226" stroke-width="1.5" stroke-linejoin="round"/></svg>`
      const mountainImg = new Image(20, 20)
      mountainImg.onload = () => {
        if (!map.hasImage('mountain-peak-icon')) map.addImage('mountain-peak-icon', mountainImg)
        map.addLayer({
          id: 'mountain-peak-labels',
          type: 'symbol',
          source: 'mountain-peaks',
          minzoom: 10,
          layout: {
            'icon-image': 'mountain-peak-icon',
            'icon-size': 1,
            'icon-anchor': 'bottom',
            'icon-allow-overlap': true,
            'icon-ignore-placement': true,
            'icon-optional': true,
            'text-field': ['get', 'name'],
            'text-size': ['interpolate', ['linear'], ['zoom'], 10, 11, 14, 13],
            'text-font': ['Open Sans Bold', 'Arial Unicode MS Regular'],
            'text-anchor': 'top',
            'text-offset': [0, 0.3],
            'text-allow-overlap': true,
            'text-ignore-placement': true,
          },
          paint: {
            'text-color': '#6b4226',
            'text-halo-color': '#ffffff',
            'text-halo-width': 1.5,
          },
        })
      }
      mountainImg.src = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(mountainSvg)}`

      map.on('moveend', () => {
        isProgrammaticMoveRef.current = false
      })
    })

    mapRef.current = map

    return () => {
      markersRef.current.forEach((m) => m.remove())
      markersRef.current.clear()
      map.remove()
      mapRef.current = null
      setMapLoaded(false)
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // Update POI GeoJSON when filter changes
  useEffect(() => {
    if (!mapRef.current) return
    const source = mapRef.current.getSource('pois') as maplibregl.GeoJSONSource | undefined
    if (source) source.setData(buildGeoJSON(filtered))
  }, [filtered])

  // Update transport source once map is loaded, filter or routes change
  useEffect(() => {
    if (!mapLoaded || !mapRef.current) return
    const map = mapRef.current
    const source = map.getSource('transport-stops') as maplibregl.GeoJSONSource | undefined
    if (!source) return
    const empty: GeoJSON.FeatureCollection = { type: 'FeatureCollection', features: [] }
    if (mapFilter === 'transport' && transportRoutes.length) {
      source.setData(buildTransportGeoJSON(transportRoutes))
    } else {
      source.setData(empty)
    }
  }, [mapFilter, transportRoutes, mapLoaded])

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
          className="flex-shrink-0 px-3.5 h-9 rounded-full text-[12px] font-medium glass-strong"
          style={!mapFilter
            ? { color: 'var(--terra-hot)', border: '1px solid var(--terra-line)', boxShadow: '0 0 18px rgba(224,138,74,0.25)' }
            : { color: 'var(--text-2)' }}
        >
          {t('search.all')}
        </button>
        {ALL_CATEGORIES.map((cat) => {
          const Icon = CATEGORY_ICONS[cat]
          const color = CATEGORY_COLORS[cat]
          const active = mapFilter === cat
          return (
            <button
              key={cat}
              onClick={() => setMapFilter(active ? null : cat)}
              className="flex-shrink-0 flex items-center gap-1.5 px-3.5 h-9 rounded-full text-[12px] font-medium glass-strong whitespace-nowrap"
              style={active
                ? { color, border: `1px solid ${color}80`, boxShadow: `0 0 18px ${color}40` }
                : { color: 'var(--text-2)' }}
            >
              <Icon size={13} style={{ color: active ? color : 'var(--text-3)' }} /> {t(`categories.${cat}`)}
            </button>
          )
        })}
      </div>

      {/* Map container */}
      <div ref={mapContainer} className="w-full h-full" />

      {/* Step 3.5 — GPS + Zoom controls */}
      <div
        className="absolute right-3 z-10 flex flex-col gap-2 transition-all duration-200"
        style={{ bottom: selectedPoi ? (sheetState === 'peek' ? 140 : sheetState === 'half' ? '52%' : '92%') : 16 }}
      >
        <button
          onClick={async () => {
            if (!mapRef.current) return
            try {
              await Geolocation.requestPermissions()
              const pos = await Geolocation.getCurrentPosition({ enableHighAccuracy: true })
              isProgrammaticMoveRef.current = true
              mapRef.current?.flyTo({ center: [pos.coords.longitude, pos.coords.latitude], zoom: 15 })
            } catch {
              navigator.geolocation?.getCurrentPosition((pos) => {
                isProgrammaticMoveRef.current = true
                mapRef.current?.flyTo({ center: [pos.coords.longitude, pos.coords.latitude], zoom: 15 })
              })
            }
          }}
          className="w-10 h-10 rounded-full glass-strong flex items-center justify-center"
          style={{ boxShadow: 'var(--shadow-2)' }}
          aria-label="My location"
        >
          <svg className="w-5 h-5" style={{ color: 'var(--terra-hot)' }} fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z" />
          </svg>
        </button>
        <button
          onClick={() => { isProgrammaticMoveRef.current = true; mapRef.current?.zoomIn() }}
          className="w-10 h-10 rounded-full glass-strong flex items-center justify-center text-lg font-bold"
          style={{ color: 'var(--text)', boxShadow: 'var(--shadow-2)' }}
          aria-label="Zoom in"
        >+</button>
        <button
          onClick={() => { isProgrammaticMoveRef.current = true; mapRef.current?.zoomOut() }}
          className="w-10 h-10 rounded-full glass-strong flex items-center justify-center text-lg font-bold"
          style={{ color: 'var(--text)', boxShadow: 'var(--shadow-2)' }}
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
