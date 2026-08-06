import { useState, useMemo, useRef, useCallback, useLayoutEffect, type ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import { motion, AnimatePresence } from 'framer-motion'
import { ImageWithFallback } from '@/shared/ui/ImageWithFallback'
import { Skeleton } from '@/shared/ui/Skeleton'
import { CATEGORY_COLORS } from '@/shared/lib/utils'
import { POICard } from '@/shared/ui/POICard'
import { SectionHeader } from '@/shared/ui/SectionHeader'
import { imageSrcSet } from '@/shared/lib/imageVariants'
import { Phone, MapPin, Clock, Banknote, Star, Truck, X, ChevronLeft, ChevronRight, Globe } from 'lucide-react'
import type { POI, Review } from '@/data/types'

function getDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371
  const dLat = (lat2 - lat1) * Math.PI / 180
  const dLng = (lng2 - lng1) * Math.PI / 180
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLng / 2) ** 2
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

interface POIDetailViewProps {
  poi: POI
  reviews?: Review[]
  nearbyPois?: POI[]
  actionsSlot?: ReactNode
}

export function POIDetailView({ poi, reviews = [], nearbyPois = [], actionsSlot }: POIDetailViewProps) {
  const { i18n, t } = useTranslation()
  const lang = i18n.language as 'ru' | 'en'

  const [showFull, setShowFull] = useState(false)
  const [showAllReviews, setShowAllReviews] = useState(false)
  const [photoIndex, setPhotoIndex] = useState(0)
  const [showGallery, setShowGallery] = useState(false)
  const [showSchedule, setShowSchedule] = useState(false)
  const carouselRef = useRef<HTMLDivElement>(null)
  const galleryRef = useRef<HTMLDivElement>(null)

  const handleCarouselScroll = useCallback(() => {
    if (!carouselRef.current) return
    const el = carouselRef.current
    const idx = Math.round(el.scrollLeft / el.offsetWidth)
    setPhotoIndex(idx)
  }, [])

  /* Полноэкранная галерея открывается на том кадре, по которому нажали.
     Без этого лента всегда стартовала с левого края — счётчик показывал «3 / 7»,
     а перед глазами была первая фотография.
     Зависимость только от showGallery: перематываем один раз при открытии,
     дальше листание внутри галереи не должно дёргать ленту обратно. */
  useLayoutEffect(() => {
    const el = galleryRef.current
    if (!showGallery || !el) return
    el.scrollLeft = photoIndex * el.offsetWidth
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showGallery])

  const handleGalleryScroll = useCallback(() => {
    if (!galleryRef.current) return
    const el = galleryRef.current
    setPhotoIndex(Math.round(el.scrollLeft / el.offsetWidth))
  }, [])

  /* При закрытии возвращаем ленту под шапкой на тот же кадр,
     чтобы человек оказался там, где его оставили. */
  const closeGallery = useCallback(() => {
    setShowGallery(false)
    requestAnimationFrame(() => {
      const el = carouselRef.current
      if (el) el.scrollLeft = photoIndex * el.offsetWidth
    })
  }, [photoIndex])

  const isOpenNow = () => {
    try {
      if (!poi.hours) return null
      const days = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'] as const
      const now = new Date()
      const dayKey = days[now.getDay()]
      const hours = poi.hours[dayKey]
      if (!hours || typeof hours !== 'string') return false
      // Приводим разные тире к одному виду: – — → -
      const normalized = hours.replace(/[–—]/g, '-')
      const parts = normalized.split('-')
      if (parts.length < 2) return false
      const [open, close] = parts
      if (!open || !close) return false
      const nowMin = now.getHours() * 60 + now.getMinutes()
      const [oh, om] = open.split(':').map(Number)
      const [ch, cm] = close.split(':').map(Number)
      if ([oh, om, ch, cm].some(isNaN)) return false
      const openMin = oh * 60 + om
      const closeMin = ch * 60 + cm
      if (closeMin < openMin) return nowMin >= openMin || nowMin <= closeMin
      return nowMin >= openMin && nowMin <= closeMin
    } catch {
      return null
    }
  }

  const openStatus = isOpenNow()
  const photos = poi.photos.length > 0 ? poi.photos : []
  const catColor = CATEGORY_COLORS[poi.category]
  const isSlug = !poi.subcategory || /^[a-z0-9_-]+$/.test(poi.subcategory)
  const catLabel = isSlug ? t(`categories.${poi.category}`) : poi.subcategory
  const visibleTags = (poi.tags || []).filter((tag) => !/^[a-z0-9_-]+$/.test(tag))

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

  const nearbyWithDistance = useMemo(() => {
    if (!nearbyPois || nearbyPois.length === 0) return []
    return nearbyPois
      .map((p) => ({
        poi: p,
        distance: getDistance(poi.location.lat, poi.location.lng, p.location.lat, p.location.lng),
      }))
      .sort((a, b) => a.distance - b.distance)
  }, [nearbyPois, poi])

  const ratingDistribution = useMemo(() => {
    if (reviews.length === 0) return null
    const dist = [0, 0, 0, 0, 0]
    reviews.forEach((r) => { if (r.rating >= 1 && r.rating <= 5) dist[r.rating - 1]++ })
    const max = Math.max(...dist, 1)
    return dist.map((count) => ({ count, pct: (count / max) * 100 }))
  }, [reviews])

  return (
    <div className="pb-40">
      {/* ═══ Кинематографичный герой: фото во весь экран, название поверх ═══ */}
      {photos.length > 0 ? (
        <div className="relative -mt-14" style={{ height: 'min(52vh, 430px)' }}>
          <div
            ref={carouselRef}
            onScroll={handleCarouselScroll}
            className="flex overflow-x-auto no-scrollbar momentum h-full"
            style={{ scrollSnapType: 'x mandatory' }}
          >
            {photos.map((photo, i) => (
              <button
                key={i}
                onClick={() => { setPhotoIndex(i); setShowGallery(true) }}
                className="flex-shrink-0 w-full h-full"
                style={{ scrollSnapAlign: 'start', background: 'var(--surface-2)' }}
                aria-label={`${poi.name[lang]} — ${i + 1}`}
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

          {/* Затемнение под текст */}
          <div className="absolute inset-0 scrim pointer-events-none" />

          {/* Стрелки листания */}
          {photos.length > 1 && photoIndex > 0 && (
            <button
              onClick={() => carouselRef.current?.scrollBy({ left: -carouselRef.current.offsetWidth, behavior: 'smooth' })}
              className="absolute left-2.5 top-1/2 -translate-y-1/2 w-9 h-9 glass-strong rounded-full flex items-center justify-center text-white"
              aria-label="←"
            >
              <ChevronLeft size={18} />
            </button>
          )}
          {photos.length > 1 && photoIndex < photos.length - 1 && (
            <button
              onClick={() => carouselRef.current?.scrollBy({ left: carouselRef.current.offsetWidth, behavior: 'smooth' })}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 w-9 h-9 glass-strong rounded-full flex items-center justify-center text-white"
              aria-label="→"
            >
              <ChevronRight size={18} />
            </button>
          )}

          {/* Ромбы-точки вместо круглых */}
          {photos.length > 1 && (
            <div className="absolute left-0 right-0 flex justify-center gap-1.5 pointer-events-none" style={{ bottom: 118 }}>
              {photos.slice(0, 8).map((_, i) => (
                <span
                  key={i}
                  className={i === photoIndex ? 'h-[5px] rounded-[2px]' : 'w-[5px] h-[5px] diamond'}
                  style={
                    i === photoIndex
                      ? { width: 16, background: 'var(--terra-hot)', boxShadow: '0 0 10px var(--terra-glow)' }
                      : { background: 'rgba(255,255,255,0.42)' }
                  }
                />
              ))}
            </div>
          )}

          {/* Название и оценка поверх фото */}
          <div className="absolute left-4 right-4 bottom-5 pointer-events-none">
            <div className="flex flex-wrap items-center gap-1.5 mb-2.5">
              <span
                className="inline-flex items-center gap-1.5 px-2 py-[3px] rounded-full text-[10.5px] font-semibold glass-strong"
                style={{ color: '#fff' }}
              >
                <i className="w-[6px] h-[6px] diamond" style={{ background: catColor }} />
                {catLabel}
              </span>
              {poi.cuisineType && cuisineLabels[poi.cuisineType] && (
                <span className="px-2 py-[3px] rounded-full text-[10.5px] font-semibold glass-strong text-white">
                  {cuisineLabels[poi.cuisineType][lang]}
                </span>
              )}
              {poi.hasDelivery && (
                <span
                  className="px-2 py-[3px] rounded-full text-[10.5px] font-semibold glass-strong inline-flex items-center gap-1"
                  style={{ color: 'var(--moss-light)' }}
                >
                  <Truck size={11} /> {t('poi.delivery')}
                </span>
              )}
            </div>

            <h1
              className="text-[26px] font-bold leading-[1.08] text-white"
              style={{ textShadow: '0 4px 24px rgba(0,0,0,0.7)' }}
            >
              {poi.name[lang]}
            </h1>

            <div className="flex items-center gap-2 mt-2 text-[12.5px]" style={{ color: '#B9C6D2' }}>
              <span className="inline-flex items-center gap-1" style={{ color: 'var(--terra-hot)' }}>
                <Star size={13} style={{ fill: 'var(--terra-hot)' }} /> {poi.rating.toFixed(1)}
              </span>
              <span>({poi.reviewCount})</span>
              {poi.priceLevel && (
                <>
                  <span>·</span>
                  <span>{'₽'.repeat(poi.priceLevel)}</span>
                </>
              )}
            </div>
          </div>
        </div>
      ) : (
        <Skeleton variant="rect" height={320} className="!rounded-none" />
      )}

      {/* ═══ Действия: аудиогид + кнопки ═══ */}
      <div className="px-4 pt-4">{actionsSlot}</div>

      {/* ═══ Панель фактов ═══ */}
      <div className="px-4 mt-4">
        <div
          className="rounded-[var(--radius-lg)] p-3.5 space-y-3"
          style={{ background: 'var(--surface-1)', border: '1px solid var(--color-border)' }}
        >
          <div className="flex items-start gap-2.5 text-[13px]">
            <MapPin size={15} className="flex-shrink-0 mt-0.5" style={{ color: 'var(--terra)' }} />
            <span style={{ color: 'var(--text)' }}>{poi.location.address[lang]}</span>
          </div>

          {openStatus !== null && (
            <div>
              <button
                onClick={() => poi.hours && setShowSchedule((v) => !v)}
                className="flex items-center gap-2.5 text-[13px] w-full"
              >
                <Clock size={15} className="flex-shrink-0" style={{ color: 'var(--terra)' }} />
                <span
                  className="font-medium"
                  style={{ color: openStatus ? 'var(--success)' : 'var(--danger)' }}
                >
                  {openStatus ? t('poi.openNow') : t('poi.closed')}
                  {poi.hours && poi.hours[todayKey] && (
                    <span className="font-normal ml-1" style={{ color: 'var(--text-3)' }}>
                      ({t('poi.today')}: {poi.hours[todayKey]})
                    </span>
                  )}
                </span>
                {poi.hours && (
                  <svg
                    className={`w-4 h-4 ml-auto transition-transform ${showSchedule ? 'rotate-180' : ''}`}
                    style={{ color: 'var(--text-3)' }}
                    fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                  </svg>
                )}
              </button>

              <AnimatePresence>
                {showSchedule && poi.hours && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.24, ease: [0.16, 1, 0.3, 1] }}
                    className="overflow-hidden"
                  >
                    <div className="mt-2.5 ml-7 space-y-1.5 pb-1">
                      {dayOrder.map((day) => {
                        const hours = poi.hours?.[day]
                        const isToday = day === todayKey
                        return (
                          <div
                            key={day}
                            className="flex justify-between text-[11.5px]"
                            style={{
                              color: isToday ? 'var(--terra-hot)' : 'var(--text-3)',
                              fontWeight: isToday ? 700 : 400,
                            }}
                          >
                            <span>{dayNames[day][lang]}{isToday ? ` (${t('poi.today')})` : ''}</span>
                            <span>{hours || '—'}</span>
                          </div>
                        )
                      })}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}

          {poi.phone && (
            <div className="flex items-center gap-2.5 text-[13px]">
              <Phone size={15} className="flex-shrink-0" style={{ color: 'var(--terra)' }} />
              <a href={`tel:${poi.phone}`} style={{ color: 'var(--terra-hot)' }}>{poi.phone}</a>
            </div>
          )}

          {poi.website && (
            <div className="flex items-center gap-2.5 text-[13px]">
              <Globe size={15} className="flex-shrink-0" style={{ color: 'var(--terra)' }} />
              <a
                href={poi.website}
                target="_blank"
                rel="noopener noreferrer"
                className="truncate"
                style={{ color: 'var(--terra-hot)' }}
              >
                {t('poi.website')}
              </a>
            </div>
          )}

          {poi.priceLevel && (
            <div className="flex items-center gap-2.5 text-[13px]">
              <Banknote size={15} className="flex-shrink-0" style={{ color: 'var(--terra)' }} />
              <span>{'₽'.repeat(poi.priceLevel)} · {priceLevelLabels[poi.priceLevel]}</span>
            </div>
          )}
        </div>
      </div>

      {/* ═══ Описание ═══ */}
      <div className="px-4 mt-6">
        <div className="orn-rule mb-4" />
        <AnimatePresence mode="wait">
          <motion.div key={showFull ? 'full' : 'medium'} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <p className="text-[13.5px] leading-[1.7]" style={{ color: 'var(--text-2)' }}>
              {showFull ? poi.description.full[lang] : poi.description.medium[lang]}
            </p>
          </motion.div>
        </AnimatePresence>
        {!showFull && (
          <button
            onClick={() => setShowFull(true)}
            className="text-[13px] font-semibold mt-3 inline-flex items-center gap-1.5"
            style={{ color: 'var(--terra-hot)' }}
          >
            <i className="w-[5px] h-[5px] diamond" style={{ background: 'var(--terra-hot)' }} />
            {t('common.more')}
          </button>
        )}
      </div>

      {/* ═══ Теги ═══ */}
      {/* Служебные слаги вроде `nature` в списке тегов не показываем — это мусор из данных */}
      {visibleTags.length > 0 && (
        <div className="px-4 mt-5">
          <div className="flex flex-wrap gap-2">
            {visibleTags.map((tag) => (
              <span
                key={tag}
                className="px-3 py-1.5 rounded-full text-[11.5px] font-medium"
                style={{ background: 'var(--surface-2)', color: 'var(--text-2)', border: '1px solid var(--color-border)' }}
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* ═══ Рядом ═══ */}
      {nearbyWithDistance.length > 0 && (
        <div className="mt-8">
          <SectionHeader title={t('profile.nearby')} />
          <div className="flex gap-3 overflow-x-auto no-scrollbar momentum px-4 pb-1">
            {nearbyWithDistance.map(({ poi: nearPoi, distance }) => (
              <POICard
                key={nearPoi.id}
                poi={nearPoi}
                variant="horizontal"
                showDistance={distance < 1 ? `${Math.round(distance * 1000)} м` : `${distance.toFixed(1)} км`}
              />
            ))}
          </div>
        </div>
      )}

      {/* ═══ Отзывы ═══ */}
      <div className="mt-8">
        <SectionHeader title={`${t('poi.reviews')} (${poi.reviewCount})`} />

        <div className="px-4">
          <div
            className="flex items-center gap-5 mb-4 rounded-[var(--radius-lg)] p-4"
            style={{ background: 'var(--surface-1)', border: '1px solid var(--color-border)' }}
          >
            <div className="text-center flex-shrink-0">
              <div className="text-[30px] font-bold leading-none" style={{ color: 'var(--sand)' }}>
                {poi.rating.toFixed(1)}
              </div>
              <div className="flex mt-2 gap-0.5 justify-center">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Star
                    key={i}
                    size={12}
                    style={{
                      color: i <= Math.round(poi.rating) ? 'var(--terra-hot)' : 'var(--surface-3)',
                      fill: i <= Math.round(poi.rating) ? 'var(--terra-hot)' : 'var(--surface-3)',
                    }}
                  />
                ))}
              </div>
              <div className="text-[10.5px] mt-1.5" style={{ color: 'var(--text-3)' }}>
                {poi.reviewCount}
              </div>
            </div>

            {ratingDistribution && (
              <div className="flex-1 space-y-1.5">
                {[5, 4, 3, 2, 1].map((star) => (
                  <div key={star} className="flex items-center gap-2">
                    <span className="text-[10.5px] w-2.5 text-right" style={{ color: 'var(--text-3)' }}>{star}</span>
                    <div className="flex-1 h-[5px] rounded-full overflow-hidden" style={{ background: 'var(--surface-3)' }}>
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${ratingDistribution[star - 1].pct}%` }}
                        transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1], delay: (5 - star) * 0.06 }}
                        className="h-full rounded-full"
                        style={{ background: 'linear-gradient(90deg, var(--terra), var(--terra-hot))' }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {reviews.length > 0 ? (
            <div className="space-y-2.5">
              {(showAllReviews ? reviews : reviews.slice(0, 5)).map((r) => (
                <div
                  key={r.id}
                  className="rounded-[var(--radius-md)] p-3.5"
                  style={{ background: 'var(--surface-1)', border: '1px solid var(--color-border)' }}
                >
                  <div className="flex items-center gap-2.5 mb-2">
                    <div
                      className="w-8 h-8 diamond flex items-center justify-center text-[11px] font-bold flex-shrink-0"
                      style={{ background: 'var(--terra-tint)', border: '1px solid var(--terra-line)', color: 'var(--terra-hot)' }}
                    >
                      <span>{(r.authorName || '?')[0].toUpperCase()}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-[13px]">{r.authorName}</div>
                      <div className="flex items-center gap-2 mt-0.5">
                        <div className="flex gap-0.5">
                          {[1, 2, 3, 4, 5].map((i) => (
                            <Star
                              key={i}
                              size={10}
                              style={{
                                color: i <= r.rating ? 'var(--terra-hot)' : 'var(--surface-3)',
                                fill: i <= r.rating ? 'var(--terra-hot)' : 'var(--surface-3)',
                              }}
                            />
                          ))}
                        </div>
                        <span className="text-[10.5px]" style={{ color: 'var(--text-3)' }}>
                          {new Date(r.date).toLocaleDateString('ru-RU')}
                        </span>
                      </div>
                    </div>
                  </div>
                  <p className="text-[12.5px] leading-[1.6]" style={{ color: 'var(--text-2)' }}>{r.text}</p>
                </div>
              ))}
              {reviews.length > 5 && (
                <button
                  onClick={() => setShowAllReviews((v) => !v)}
                  className="w-full py-2.5 text-[13px] font-semibold rounded-[var(--radius-md)]"
                  style={{ color: 'var(--terra-hot)', background: 'var(--surface-1)', border: '1px solid var(--color-border)' }}
                >
                  {showAllReviews ? t('common.hide', 'Скрыть') : `${t('common.showAll')} (${reviews.length}) →`}
                </button>
              )}
            </div>
          ) : (
            <p className="text-[13px] py-4 text-center" style={{ color: 'var(--text-3)' }}>{t('poi.noReviews')}</p>
          )}
        </div>
      </div>

      {/* ═══ Галерея на весь экран ═══ */}
      <AnimatePresence>
        {showGallery && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center"
            style={{ background: 'var(--bg-deep)' }}
          >
            <button
              onClick={closeGallery}
              className="absolute top-4 right-4 z-10 w-11 h-11 glass-strong rounded-full flex items-center justify-center text-white"
              aria-label={t('common.close')}
            >
              <X size={19} />
            </button>
            <div
              ref={galleryRef}
              onScroll={handleGalleryScroll}
              className="w-full h-full flex overflow-x-auto no-scrollbar momentum"
              style={{ scrollSnapType: 'x mandatory' }}
            >
              {photos.map((photo, i) => (
                <div key={i} className="flex-shrink-0 w-full h-full flex items-center justify-center" style={{ scrollSnapAlign: 'start' }}>
                  <img src={photo} srcSet={imageSrcSet(photo)} sizes="100vw" alt={`${poi.name[lang]} ${i + 1}`} className="max-w-full max-h-full object-contain" />
                </div>
              ))}
            </div>
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 text-white text-[12px] glass-strong px-3 py-1.5 rounded-full">
              {photoIndex + 1} / {photos.length}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
