import { useState, useMemo, useRef, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { SEO } from '@/shared/ui/SEO'
import { JsonLd } from '@/shared/ui/JsonLd'
import { motion, AnimatePresence } from 'framer-motion'
import { useDataStore } from '@/data/stores/data-store'
import { useToast } from '@/data/stores/toast-store'
import { FavoriteButton } from '@/shared/ui/FavoriteButton'
import { getDB } from '@/data/db'
import { Navigation, Phone, Share2, UtensilsCrossed, Search, Heart, HeartOff } from 'lucide-react'
import { POIDetailView } from '@/features/poi/components/POIDetailView'

function useReviews(poiId: string) {
  const [reviews, setReviews] = useState<any[]>([])
  const [loaded, setLoaded] = useState(false)
  useEffect(() => {
    let cancelled = false
    getDB()
      .then(db => db.getAllFromIndex('reviews', 'by-target', ['poi', poiId]))
      .then(data => { if (!cancelled) { setReviews(data); setLoaded(true) } })
      .catch(() => { if (!cancelled) setLoaded(true) })
    return () => { cancelled = true }
  }, [poiId])
  return { reviews, loaded }
}

export default function POIDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { i18n, t } = useTranslation()
  const lang = i18n.language as 'ru' | 'en'
  const pois = useDataStore((s) => s.pois)
  const isLoaded = useDataStore((s) => s.isLoaded)
  const toggleFavorite = useDataStore((s) => s.toggleFavorite)
  const collections = useDataStore((s) => s.collections)
  const poi = pois.find((p) => p.id === id)
  const isFav = collections.find((c) => c.id === 'favorites')?.poiIds.includes(id || '') ?? false
  const toast = useToast()
  const { reviews } = useReviews(id || '')
  const [showCTA, setShowCTA] = useState(false)
  const actionsRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!actionsRef.current) return
    const observer = new IntersectionObserver(
      ([entry]) => setShowCTA(!entry.isIntersecting),
      { threshold: 0 }
    )
    observer.observe(actionsRef.current)
    return () => observer.disconnect()
  }, [poi])

  const nearbyPois = useMemo(() => {
    if (!poi) return []
    const R = 6371
    return pois
      .filter((p) => p.id !== poi.id)
      .map((p) => {
        const dLat = (p.location.lat - poi.location.lat) * Math.PI / 180
        const dLng = (p.location.lng - poi.location.lng) * Math.PI / 180
        const a = Math.sin(dLat / 2) ** 2 + Math.cos(poi.location.lat * Math.PI / 180) * Math.cos(p.location.lat * Math.PI / 180) * Math.sin(dLng / 2) ** 2
        return { poi: p, distance: R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)) }
      })
      .sort((a, b) => a.distance - b.distance)
      .slice(0, 5)
      .map(({ poi: p }) => p)
  }, [pois, poi])

  if (!poi) {
    if (isLoaded) {
      return (
        <div className="flex flex-col items-center justify-center min-h-dvh gap-4 px-4 text-center">
          <span className="text-[var(--color-text-secondary)]"><Search size={48} /></span>
          <h2 className="text-xl font-bold">{t('poi.notFound')}</h2>
          <p className="text-sm text-[var(--color-text-secondary)]">{t('poi.notFoundHint')}</p>
          <button onClick={() => navigate(-1)} className="mt-2 px-6 py-2.5 bg-[var(--color-primary)] text-white rounded-xl font-medium text-sm">
            ← {t('common.back')}
          </button>
        </div>
      )
    }
    return (
      <div className="flex items-center justify-center min-h-dvh">
        <p className="text-[var(--color-text-secondary)]">{t('common.loading')}</p>
      </div>
    )
  }

  const actionsSlot = (
    <div ref={actionsRef} className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
      <button
        onClick={() => window.open(`https://yandex.ru/maps/?rtext=~${poi.location.lat},${poi.location.lng}&rtt=auto`)}
        className="flex items-center gap-1.5 px-4 h-12 bg-gray-100 rounded-full text-sm font-medium flex-shrink-0"
      >
        <Navigation size={16} /> {t('poi.directions')}
      </button>
      {poi.phone && (
        <a href={`tel:${poi.phone}`} className="flex items-center gap-1.5 px-4 h-12 bg-green-50 text-green-700 rounded-full text-sm font-medium flex-shrink-0">
          <Phone size={16} /> {t('poi.call')}
        </a>
      )}
      <FavoriteButton poiId={poi.id} />
      <button
        onClick={async () => {
          if (navigator.share) {
            try {
              await navigator.share({ title: poi.name[lang], text: poi.description.short[lang], url: window.location.href })
            } catch { /* user cancelled */ }
          } else {
            await navigator.clipboard.writeText(window.location.href)
            toast.show(t('common.copied', 'Link copied'), { type: 'success' })
          }
        }}
        className="flex items-center gap-1.5 px-4 h-12 bg-gray-100 rounded-full text-sm font-medium flex-shrink-0"
      >
        <Share2 size={16} /> {t('poi.share')}
      </button>
      {poi.hasMenu && (
        <button onClick={() => navigate(`/poi/${poi.id}/menu`)} className="flex items-center gap-1.5 px-4 h-12 bg-[var(--color-primary)] text-white rounded-full text-sm font-medium flex-shrink-0">
          <UtensilsCrossed size={16} /> {t('poi.seeMenu')}
        </button>
      )}
    </div>
  )

  return (
    <>
      <SEO
        title={`${poi.name[lang]} — BROBROGID`}
        description={poi.description.short[lang]}
        image={poi.photos[0]}
        url={`/poi/${poi.id}`}
        type="place"
      />
      <JsonLd data={poi.category === 'food' ? {
        '@type': 'FoodEstablishment',
        name: poi.name[lang],
        description: poi.description.short[lang],
        image: poi.photos[0] ? `https://app.brobrogid.ru${poi.photos[0]}` : undefined,
        address: { '@type': 'PostalAddress', addressLocality: 'Владикавказ', streetAddress: poi.location.address[lang] },
        geo: { '@type': 'GeoCoordinates', latitude: poi.location.lat, longitude: poi.location.lng },
        aggregateRating: poi.reviewCount > 0 ? { '@type': 'AggregateRating', ratingValue: poi.rating, reviewCount: poi.reviewCount } : undefined,
        telephone: poi.phone,
        priceRange: poi.priceLevel ? '₽'.repeat(poi.priceLevel) : undefined,
      } : {
        '@type': 'TouristAttraction',
        name: poi.name[lang],
        description: poi.description.short[lang],
        image: poi.photos[0] ? `https://app.brobrogid.ru${poi.photos[0]}` : undefined,
        address: { '@type': 'PostalAddress', addressLocality: 'Владикавказ', streetAddress: poi.location.address[lang] },
        geo: { '@type': 'GeoCoordinates', latitude: poi.location.lat, longitude: poi.location.lng },
        aggregateRating: poi.reviewCount > 0 ? { '@type': 'AggregateRating', ratingValue: poi.rating, reviewCount: poi.reviewCount } : undefined,
      }} />

      <div className="sticky top-0 z-40 flex items-center justify-between px-4 h-14 bg-white/95 backdrop-blur-sm border-b border-[var(--color-border)]">
        <button onClick={() => navigate(-1)} className="w-10 h-10 flex items-center justify-center">
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
          </svg>
        </button>
        <FavoriteButton poiId={poi.id} />
      </div>

      <POIDetailView poi={poi} reviews={reviews} nearbyPois={nearbyPois} actionsSlot={actionsSlot} />

      <AnimatePresence>
        {showCTA && (
          <motion.div
            initial={{ y: 60, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 60, opacity: 0 }}
            transition={{ duration: 0.2, ease: [0.2, 0, 0, 1] }}
            className="fixed bottom-[calc(var(--bottom-nav-height)+var(--safe-area-bottom))] left-0 right-0 z-30 px-4 py-3 bg-white/95 backdrop-blur-sm border-t border-[var(--color-border)]"
          >
            <div className="flex gap-2 max-w-lg mx-auto">
              {poi.hasMenu ? (
                <>
                  <button onClick={() => navigate(`/poi/${poi.id}/menu`)} className="flex-1 py-3 bg-[var(--color-primary)] text-white rounded-xl font-semibold text-sm">
                    {t('poi.order')}
                  </button>
                  <button
                    onClick={() => window.open(`https://yandex.ru/maps/?rtext=~${poi.location.lat},${poi.location.lng}&rtt=auto`)}
                    className="py-3 px-4 border border-[var(--color-border)] rounded-xl text-sm font-medium"
                  >
                    <Navigation size={16} className="inline-block mr-1" />{t('poi.directions')}
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={() => {
                      toggleFavorite(poi.id)
                      if (navigator.vibrate) navigator.vibrate(10)
                      if (isFav) {
                        toast.show(t('saved.removed', 'Removed'), { type: 'info' })
                      } else {
                        toast.show(t('saved.saved', 'Saved!'), { type: 'success' })
                      }
                    }}
                    className={`flex-1 py-3 rounded-xl font-semibold text-sm flex items-center justify-center gap-1.5 ${isFav ? 'bg-red-50 text-red-600 border border-red-200' : 'bg-[var(--color-primary)] text-white'}`}
                  >
                    {isFav ? <><HeartOff size={16} /> {t('saved.remove')}</> : <><Heart size={16} /> {t('poi.save')}</>}
                  </button>
                  <button
                    onClick={() => window.open(`https://yandex.ru/maps/?rtext=~${poi.location.lat},${poi.location.lng}&rtt=auto`)}
                    className="py-3 px-4 border border-[var(--color-border)] rounded-xl text-sm font-medium flex items-center gap-1.5"
                  >
                    <Navigation size={16} /> {t('poi.directions')}
                  </button>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
