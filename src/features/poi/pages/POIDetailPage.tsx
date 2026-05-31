import { useState, useMemo, useRef, useEffect, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { SEO } from '@/shared/ui/SEO'
import { JsonLd } from '@/shared/ui/JsonLd'
import { motion, AnimatePresence } from 'framer-motion'
import { useDataStore } from '@/data/stores/data-store'
import { useToast } from '@/data/stores/toast-store'
import { FavoriteButton } from '@/shared/ui/FavoriteButton'
import { Rating } from '@/shared/ui/Rating'
import { ImageWithFallback } from '@/shared/ui/ImageWithFallback'
import { Skeleton } from '@/shared/ui/Skeleton'
import { CATEGORY_COLORS } from '@/shared/lib/utils'
import { getDB } from '@/data/db'
import { POICard } from '@/shared/ui/POICard'
import { SectionHeader } from '@/shared/ui/SectionHeader'
import { Navigation, Phone, Share2, UtensilsCrossed, MapPin, Clock, Banknote, Search, Heart, HeartOff, Star, Truck, X, ChevronLeft, ChevronRight } from 'lucide-react'

function getDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371
  const dLat = (lat2 - lat1) * Math.PI / 180
  const dLng = (lng2 - lng1) * Math.PI / 180
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLng / 2) ** 2
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

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
  const { reviews, loaded: reviewsLoaded } = useReviews(id || '')
  const [showFull, setShowFull] = useState(false)
  const [showAllReviews, setShowAllReviews] = useState(false)
  const [photoIndex, setPhotoIndex] = useState(0)
  const [showGallery, setShowGallery] = useState(false)
  const [showCTA, setShowCTA] = useState(false)
  const [showSchedule, setShowSchedule] = useState(false)
  const actionsRef = useRef<HTMLDivElement>(null)
  const carouselRef = useRef<HTMLDivElement>(null)

  // Step 5.3 — IntersectionObserver for sticky CTA
  useEffect(() => {
    if (!actionsRef.current) return
    const observer = new IntersectionObserver(
      ([entry]) => setShowCTA(!entry.isIntersecting),
      { threshold: 0 }
    )
    observer.observe(actionsRef.current)
    return () => observer.disconnect()
  }, [poi])

  // Step 5.1 — Track photo index on scroll
  const handleCarouselScroll = useCallback(() => {
    if (!carouselRef.current) return
    const el = carouselRef.current
    const idx = Math.round(el.scrollLeft / el.offsetWidth)
    setPhotoIndex(idx)
  }, [])

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

  const isOpenNow = () => {
    if (!poi.hours) return null
    const days = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'] as const
    const now = new Date()
    const dayKey = days[now.getDay()]
    const hours = poi.hours[dayKey]
    if (!hours) return false
    const [open, close] = hours.split('-')
    const nowMin = now.getHours() * 60 + now.getMinutes()
    const [oh, om] = open.split(':').map(Number)
    const [ch, cm] = close.split(':').map(Number)
    const openMin = oh * 60 + om
    const closeMin = ch * 60 + cm
    // Handle overnight hours (e.g. 23:00-02:00)
    if (closeMin < openMin) return nowMin >= openMin || nowMin <= closeMin
    return nowMin >= openMin && nowMin <= closeMin
  }

  const openStatus = isOpenNow()
  const photos = poi.photos.length > 0 ? poi.photos : []

  const cuisineLabels: Record<string, { ru: string; en: string }> = {
    national: { ru: 'Национальная кухня', en: 'National Cuisine' },
    european: { ru: 'Европейская кухня', en: 'European Cuisine' },
    mixed: { ru: 'Смешанная кухня', en: 'Mixed Cuisine' },
  }

  const priceLevelLabels: Record<number, string> = {
    1: t('poi.priceBudget'),
    2: t('poi.priceAverage'),
    3: t('poi.priceExpensive'),
    4: t('poi.priceVeryExpensive'),
  }

  const dayNames: Record<string, { ru: string; en: string }> = {
    mon: { ru: 'Пн', en: 'Mon' },
    tue: { ru: 'Вт', en: 'Tue' },
    wed: { ru: 'Ср', en: 'Wed' },
    thu: { ru: 'Чт', en: 'Thu' },
    fri: { ru: 'Пт', en: 'Fri' },
    sat: { ru: 'Сб', en: 'Sat' },
    sun: { ru: 'Вс', en: 'Sun' },
  }
  const dayOrder = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'] as const
  const todayKey = (['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'] as const)[new Date().getDay()]

  // Nearby POIs
  const nearbyPois = useMemo(() => {
    if (!poi) return []
    return pois
      .filter((p) => p.id !== poi.id)
      .map((p) => ({
        poi: p,
        distance: getDistance(poi.location.lat, poi.location.lng, p.location.lat, p.location.lng),
      }))
      .sort((a, b) => a.distance - b.distance)
      .slice(0, 5)
  }, [pois, poi])

  // Step 5.5 — Rating distribution (simulated)
  const ratingDistribution = useMemo(() => {
    if (reviews.length === 0) return null
    const dist = [0, 0, 0, 0, 0]
    reviews.forEach((r) => { if (r.rating >= 1 && r.rating <= 5) dist[r.rating - 1]++ })
    const max = Math.max(...dist, 1)
    return dist.map((count) => ({ count, pct: (count / max) * 100 }))
  }, [reviews])

  return (
    <div className="pb-40">
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
      {/* Header */}
      <div className="sticky top-0 z-40 flex items-center justify-between px-4 h-14 bg-white/95 backdrop-blur-sm border-b border-[var(--color-border)]">
        <button onClick={() => navigate(-1)} className="w-10 h-10 flex items-center justify-center">
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
          </svg>
        </button>
        <FavoriteButton poiId={poi.id} />
      </div>

      {/* Step 5.1 — Photo carousel with scroll-snap, counter, full-screen */}
      {photos.length > 0 ? (
        <div className="relative">
          <div
            ref={carouselRef}
            onScroll={handleCarouselScroll}
            className="flex overflow-x-auto no-scrollbar"
            style={{ scrollSnapType: 'x mandatory' }}
          >
            {photos.map((photo, i) => (
              <button
                key={i}
                onClick={() => { setPhotoIndex(i); setShowGallery(true) }}
                className="flex-shrink-0 w-full h-[320px] bg-gray-100"
                style={{ scrollSnapAlign: 'start' }}
              >
                <ImageWithFallback
                  src={photo}
                  alt={`${poi.name[lang]} ${i + 1}`}
                  fallbackText={poi.name[lang]}
                  className="w-full h-full"
                />
              </button>
            ))}
          </div>
          {/* Navigation arrows */}
          {photos.length > 1 && photoIndex > 0 && (
            <button
              onClick={() => {
                if (!carouselRef.current) return
                carouselRef.current.scrollBy({ left: -carouselRef.current.offsetWidth, behavior: 'smooth' })
              }}
              className="absolute left-2 top-1/2 -translate-y-1/2 w-10 h-10 bg-black/30 backdrop-blur-sm rounded-full flex items-center justify-center text-white"
            >
              <ChevronLeft size={20} />
            </button>
          )}
          {photos.length > 1 && photoIndex < photos.length - 1 && (
            <button
              onClick={() => {
                if (!carouselRef.current) return
                carouselRef.current.scrollBy({ left: carouselRef.current.offsetWidth, behavior: 'smooth' })
              }}
              className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 bg-black/30 backdrop-blur-sm rounded-full flex items-center justify-center text-white"
            >
              <ChevronRight size={20} />
            </button>
          )}
          {/* 1/N counter */}
          {photos.length > 1 && (
            <div className="absolute bottom-3 right-3 px-2 py-0.5 bg-black/60 text-white text-xs rounded-full">
              {photoIndex + 1} / {photos.length}
            </div>
          )}
        </div>
      ) : (
        <Skeleton variant="rect" height={320} className="!rounded-none" />
      )}

      {/* Step 5.2 — Name + Rating (directly under) */}
      <div className="px-4 pt-4">
        <div className="flex flex-wrap items-center gap-2 mb-2">
          <span className="px-2.5 py-1 rounded-full text-xs font-semibold text-white inline-block" style={{ background: CATEGORY_COLORS[poi.category] }}>
            {poi.subcategory}
          </span>
          {poi.cuisineType && cuisineLabels[poi.cuisineType] && (
            <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-orange-100 text-orange-700 inline-block">
              {cuisineLabels[poi.cuisineType][lang]}
            </span>
          )}
          {poi.hasDelivery && (
            <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700 inline-block">
              <Truck size={12} className="inline-block mr-0.5" /> {t('poi.delivery')}
            </span>
          )}
        </div>
        <h1 className="text-2xl font-bold mb-1">{poi.name[lang]}</h1>

        {/* Rating row — tappable review count */}
        <div className="flex items-center gap-1 mb-3">
          <Rating value={poi.rating} count={poi.reviewCount} size="md" />
        </div>

        {/* Step 5.2 — Action buttons */}
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

        {/* Step 5.2 — Quick facts card */}
        <div className="bg-gray-50 rounded-xl p-3 mt-4 space-y-2.5">
          <div className="flex items-start gap-2.5 text-sm">
            <MapPin size={16} className="flex-shrink-0 mt-0.5 text-[var(--color-text-secondary)]" />
            <span>{poi.location.address[lang]}</span>
          </div>
          {openStatus !== null && (
            <div>
              <button
                onClick={() => poi.hours && setShowSchedule((v) => !v)}
                className="flex items-center gap-2.5 text-sm w-full"
              >
                <Clock size={16} className="flex-shrink-0 text-[var(--color-text-secondary)]" />
                <span className={`font-medium ${openStatus ? 'text-green-600' : 'text-red-500'}`}>
                  {openStatus ? t('poi.openNow') : t('poi.closed')}
                  {poi.hours && poi.hours[todayKey] && (
                    <span className="text-[var(--color-text-secondary)] font-normal ml-1">
                      ({t('poi.today')}: {poi.hours[todayKey]})
                    </span>
                  )}
                </span>
                {poi.hours && (
                  <svg
                    className={`w-4 h-4 ml-auto transition-transform ${showSchedule ? 'rotate-180' : ''}`}
                    fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                  </svg>
                )}
              </button>
              {showSchedule && poi.hours && (
                <div className="mt-2 ml-7 space-y-1">
                  {dayOrder.map((day) => {
                    const hours = poi.hours?.[day]
                    const isToday = day === todayKey
                    return (
                      <div key={day} className={`flex justify-between text-xs ${isToday ? 'font-bold text-[var(--color-primary)]' : 'text-[var(--color-text-secondary)]'}`}>
                        <span>{dayNames[day][lang]}{isToday ? ` (${t('poi.today')})` : ''}</span>
                        <span>{hours || '—'}</span>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          )}
          {poi.phone && (
            <div className="flex items-center gap-2.5 text-sm">
              <Phone size={16} className="flex-shrink-0 text-[var(--color-text-secondary)]" />
              <a href={`tel:${poi.phone}`} className="text-[var(--color-primary)]">{poi.phone}</a>
            </div>
          )}
          {poi.website && (
            <div className="flex items-center gap-2.5 text-sm">
              <span>
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9 9 0 100-18 9 9 0 000 18z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3.6 9h16.8M3.6 15h16.8" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 3a15.3 15.3 0 014 9 15.3 15.3 0 01-4 9 15.3 15.3 0 01-4-9 15.3 15.3 0 014-9z" />
                </svg>
              </span>
              <a href={poi.website} target="_blank" rel="noopener noreferrer" className="text-[var(--color-primary)] truncate">
                {t('poi.website')}
              </a>
            </div>
          )}
          {poi.priceLevel && (
            <div className="flex items-center gap-2.5 text-sm">
              <Banknote size={16} className="flex-shrink-0 text-[var(--color-text-secondary)]" />
              <span>{'₽'.repeat(poi.priceLevel)} · {priceLevelLabels[poi.priceLevel]}</span>
            </div>
          )}
        </div>
      </div>

      {/* Description */}
      <div className="px-4 mt-5">
        <AnimatePresence mode="wait">
          <motion.div key={showFull ? 'full' : 'medium'} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <p className="text-sm leading-relaxed text-[var(--color-text)]">
              {showFull ? poi.description.full[lang] : poi.description.medium[lang]}
            </p>
          </motion.div>
        </AnimatePresence>
        {!showFull && (
          <button onClick={() => setShowFull(true)} className="text-sm font-medium text-[var(--color-primary)] mt-2">
            {t('common.more')} →
          </button>
        )}
      </div>

      {/* Step 5.4 — Feature tags (if we had data) */}
      {poi.tags && poi.tags.length > 0 && (
        <div className="px-4 mt-4">
          <div className="flex flex-wrap gap-2">
            {poi.tags.map((tag) => (
              <span key={tag} className="px-3 py-1 bg-gray-100 rounded-full text-xs font-medium text-[var(--color-text-secondary)]">
                {tag}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Nearby POIs */}
      {nearbyPois.length > 0 && (
        <div className="mt-6">
          <SectionHeader title={t('profile.nearby')} />
          <div className="flex gap-3 overflow-x-auto no-scrollbar px-4 pb-1">
            {nearbyPois.map(({ poi: nearPoi, distance }) => (
              <POICard
                key={nearPoi.id}
                poi={nearPoi}
                variant="horizontal"
                showDistance={distance < 1 ? `${Math.round(distance * 1000)} m` : `${distance.toFixed(1)} km`}
              />
            ))}
          </div>
        </div>
      )}

      {/* Step 5.5 — Reviews with aggregate + distribution */}
      <div className="px-4 mt-6">
        <h3 className="font-semibold text-base mb-3">{t('poi.reviews')} ({poi.reviewCount})</h3>

        {/* Aggregate */}
        <div className="flex items-center gap-4 mb-4 bg-gray-50 rounded-xl p-4">
          <div className="text-center">
            <div className="text-3xl font-bold">{poi.rating.toFixed(1)}</div>
            <div className="flex mt-1">
              {[1,2,3,4,5].map(i => <Star key={i} size={14} className={i <= Math.round(poi.rating) ? 'text-yellow-500 fill-yellow-500' : 'text-gray-300'} />)}
            </div>
            <div className="text-xs text-[var(--color-text-secondary)] mt-1">{poi.reviewCount} {t('poi.reviews').toLowerCase()}</div>
          </div>

          {/* Distribution bars */}
          {ratingDistribution && (
            <div className="flex-1 space-y-1">
              {[5,4,3,2,1].map((star) => (
                <div key={star} className="flex items-center gap-2">
                  <span className="text-xs w-3 text-right">{star}</span>
                  <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div className="h-full bg-yellow-400 rounded-full" style={{ width: `${ratingDistribution[star - 1].pct}%` }} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Review cards */}
        {reviews.length > 0 ? (
          <div className="space-y-3">
            {(showAllReviews ? reviews : reviews.slice(0, 5)).map((r) => (
              <div key={r.id} className="bg-gray-50 rounded-xl p-3">
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-8 h-8 rounded-full bg-[var(--color-primary)] flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                    {(r.authorName || '?')[0].toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <span className="font-medium text-sm">{r.authorName}</span>
                    <span className="text-xs text-[var(--color-text-secondary)] ml-2">{new Date(r.date).toLocaleDateString('ru-RU')}</span>
                  </div>
                </div>
                <div className="flex mb-1 ml-10">
                  {[1,2,3,4,5].map(i => <Star key={i} size={12} className={i <= r.rating ? 'text-yellow-500 fill-yellow-500' : 'text-gray-300'} />)}
                </div>
                <p className="text-sm text-[var(--color-text-secondary)] ml-10">{r.text}</p>
              </div>
            ))}
            {reviews.length > 5 && (
              <button
                onClick={() => setShowAllReviews((v) => !v)}
                className="w-full py-2 text-sm font-medium text-[var(--color-primary)]"
              >
                {showAllReviews ? t('common.hide', 'Hide') : `${t('common.showAll')} (${reviews.length}) →`}
              </button>
            )}
          </div>
        ) : reviewsLoaded ? (
          <p className="text-sm text-[var(--color-text-secondary)] py-4 text-center">{t('poi.noReviews')}</p>
        ) : (
          <div className="space-y-3">
            {[1,2,3].map(i => (
              <div key={i} className="bg-gray-50 rounded-xl p-3 space-y-2">
                <Skeleton variant="text" width="30%" />
                <Skeleton variant="text" width="60%" />
                <Skeleton variant="text" width="90%" height={12} />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Step 5.3 — Smart sticky CTA (hidden when actions visible) */}
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

      {/* Full-screen gallery modal */}
      <AnimatePresence>
        {showGallery && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black flex items-center justify-center"
          >
            <button
              onClick={() => setShowGallery(false)}
              className="absolute top-4 right-4 z-10 w-12 h-12 bg-black/40 backdrop-blur-sm rounded-full flex items-center justify-center text-white"
            >
              <X size={20} />
            </button>
            <div className="w-full h-full flex overflow-x-auto no-scrollbar" style={{ scrollSnapType: 'x mandatory' }}>
              {photos.map((photo, i) => (
                <div key={i} className="flex-shrink-0 w-full h-full flex items-center justify-center" style={{ scrollSnapAlign: 'start' }}>
                  <img src={photo} alt={`${poi.name[lang]} ${i + 1}`} className="max-w-full max-h-full object-contain" />
                </div>
              ))}
            </div>
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 text-white text-sm bg-black/50 px-3 py-1 rounded-full">
              {photoIndex + 1} / {photos.length}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
