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
import { Navigation, Phone, Share2, Search, Heart, HeartOff, Volume2, VolumeX } from 'lucide-react'
import { trackEvent } from '@/shared/lib/tracking'
import type { Review } from '@/data/types'
import { POIDetailView } from '@/features/poi/components/POIDetailView'
import { useTTS } from '@/shared/hooks/useTTS'

function useReviews(poiId: string) {
  const [reviews, setReviews] = useState<Review[]>([])
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
  const goBack = () => { navigate(-1) }
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

  const ttsCategories = ['attractions', 'culture', 'nature', 'springs', 'museums']
  const { speaking, toggle: toggleTTS, supported: ttsSupported } = useTTS(poi?.id ?? '', poi?.category ?? '')

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
          <button
            onClick={goBack}
            className="sheen mt-2 px-6 py-2.5 rounded-[var(--radius-md)] font-semibold text-sm"
            style={{ background: 'var(--terra-hot)', color: 'var(--text-on-terra)', boxShadow: 'var(--shadow-terra)' }}
          >
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

  const chipStyle: React.CSSProperties = {
    background: 'var(--surface-1)',
    border: '1px solid var(--color-border)',
    color: 'var(--text)',
  }

  const actionsSlot = (
    <div ref={actionsRef}>
      {/* Аудиогид — крупный плеер на тёплом стекле, а не мелкая кнопка в ряду */}
      {ttsSupported && ttsCategories.includes(poi.category) && (
        <motion.button
          onClick={toggleTTS}
          whileTap={{ scale: 0.985 }}
          className="sheen w-full glass-warm rounded-[var(--radius-lg)] p-3 flex items-center gap-3 mb-3 text-left"
          aria-label={speaking ? t('poi.stopAudio', 'Остановить') : t('poi.playAudio', 'Слушать')}
        >
          <span
            className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
            style={{
              background: 'var(--terra-hot)',
              color: 'var(--text-on-terra)',
              boxShadow: speaking ? '0 0 22px var(--terra-glow)' : 'none',
            }}
          >
            {speaking ? <VolumeX size={17} /> : <Volume2 size={17} />}
          </span>
          <span className="flex-1 min-w-0">
            <span className="block text-[13px] font-semibold">
              {t('poi.audioGuide', 'Аудиогид')}
            </span>
            <span className="block text-[11px] mt-0.5" style={{ color: 'var(--text-3)' }}>
              {speaking
                ? t('poi.audioPlaying', 'Идёт воспроизведение — нажмите, чтобы остановить')
                : t('poi.audioHint', 'Слушать рассказ об этом месте')}
            </span>
          </span>
          {/* Живые полоски-эквалайзер, пока читает */}
          {speaking && (
            <span className="flex items-end gap-[3px] h-5 flex-shrink-0">
              {[0, 1, 2].map((i) => (
                <motion.span
                  key={i}
                  className="w-[3px] rounded-full"
                  style={{ background: 'var(--terra-hot)' }}
                  animate={{ height: ['30%', '100%', '45%'] }}
                  transition={{ duration: 0.9, repeat: Infinity, delay: i * 0.15, ease: 'easeInOut' }}
                />
              ))}
            </span>
          )}
        </motion.button>
      )}

      <div className="flex gap-2 overflow-x-auto no-scrollbar momentum pb-1">
        <button
          onClick={() => {
            trackEvent('directions', poi.id)
            window.open(`https://www.google.com/maps/dir/?api=1&destination=${poi.location.lat},${poi.location.lng}`)
          }}
          className="sheen flex items-center gap-1.5 px-3.5 h-9 rounded-full text-[12px] font-medium flex-shrink-0"
          style={chipStyle}
        >
          <Navigation size={13} style={{ color: 'var(--terra-hot)' }} /> {t('poi.directions')}
        </button>
        {poi.phone && (
          <a
            href={`tel:${poi.phone}`}
            onClick={() => trackEvent('call', poi.id)}
            className="sheen flex items-center gap-1.5 px-3.5 h-9 rounded-full text-[12px] font-medium flex-shrink-0"
            style={{ ...chipStyle, color: 'var(--moss-light)' }}
          >
            <Phone size={13} /> {t('poi.call')}
          </a>
        )}
        <button
          onClick={async () => {
            if (navigator.share) {
              try {
                await navigator.share({ title: poi.name[lang], text: poi.description.short[lang], url: window.location.href })
              } catch { /* пользователь отменил */ }
            } else {
              await navigator.clipboard.writeText(window.location.href)
              toast.show(t('common.copied', 'Link copied'), { type: 'success' })
            }
          }}
          className="sheen flex items-center gap-1.5 px-3.5 h-9 rounded-full text-[12px] font-medium flex-shrink-0"
          style={chipStyle}
        >
          <Share2 size={13} style={{ color: 'var(--terra-hot)' }} /> {t('poi.share')}
        </button>
      </div>
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

      {/* Плавающая шапка поверх фото — без белой полосы, чтобы кадр дышал */}
      <div className="sticky top-0 z-40 flex items-center justify-between px-4 h-14 pointer-events-none">
        <button
          onClick={goBack}
          className="w-10 h-10 rounded-full glass-strong flex items-center justify-center text-white pointer-events-auto"
          aria-label={t('common.back')}
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
          </svg>
        </button>
        <div className="pointer-events-auto">
          <FavoriteButton poiId={poi.id} />
        </div>
      </div>

      <POIDetailView poi={poi} reviews={reviews} nearbyPois={nearbyPois} actionsSlot={actionsSlot} />

      <AnimatePresence>
        {showCTA && (
          <motion.div
            initial={{ y: 60, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 60, opacity: 0 }}
            transition={{ duration: 0.2, ease: [0.2, 0, 0, 1] }}
            className="fixed bottom-[calc(var(--bottom-nav-height)+var(--safe-area-bottom))] left-0 right-0 z-30 px-4 py-3"
            style={{
              background: 'linear-gradient(180deg, rgba(26,31,40,0.78), rgba(1,2,4,0.99))',
              backdropFilter: 'blur(20px)',
              WebkitBackdropFilter: 'blur(20px)',
              boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.20)',
            }}
          >
            <div className="flex gap-2 max-w-lg mx-auto">
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
                className="sheen flex-1 py-3 rounded-[var(--radius-md)] font-semibold text-[13.5px] flex items-center justify-center gap-1.5"
                style={
                  isFav
                    ? { background: 'var(--surface-2)', color: 'var(--terra-hot)', border: '1px solid var(--terra-line)' }
                    : { background: 'var(--terra-hot)', color: 'var(--text-on-terra)', boxShadow: 'var(--shadow-terra)' }
                }
              >
                {isFav ? <><HeartOff size={16} /> {t('saved.remove')}</> : <><Heart size={16} /> {t('poi.save')}</>}
              </button>
              <button
                onClick={() => window.open(`https://www.google.com/maps/dir/?api=1&destination=${poi.location.lat},${poi.location.lng}`)}
                className="py-3 px-4 rounded-[var(--radius-md)] text-[13.5px] font-medium flex items-center gap-1.5"
                style={{ background: 'var(--surface-1)', border: '1px solid var(--color-border)', color: 'var(--text)' }}
              >
                <Navigation size={16} style={{ color: 'var(--terra-hot)' }} /> {t('poi.directions')}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
