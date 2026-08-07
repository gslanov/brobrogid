import { useEffect, useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { motion } from 'framer-motion'
import { Clock, MapPin, Star, Users } from 'lucide-react'

import type { Tour } from '@/data/types'
import { PageHeader } from '@/shared/ui/PageHeader'
import { imageSrcSet } from '@/shared/lib/imageVariants'
import { SEO } from '@/shared/ui/SEO'
import { CATEGORY_COLORS, formatRating } from '@/shared/lib/utils'
import { loadTours, localizeDuration, tourTypeLabel, tourShort } from '../lib/tour-utils'

const ACCENT = CATEGORY_COLORS.tours

function TourCard({ tour, onOpen }: { tour: Tour; onOpen: () => void }) {
  const { t, i18n } = useTranslation()
  const lang = i18n.language as 'ru' | 'en'

  return (
    <motion.div
      role="button"
      tabIndex={0}
      onClick={onOpen}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onOpen() }
      }}
      whileTap={{ scale: 0.975 }}
      transition={{ type: 'spring', stiffness: 500, damping: 30 }}
      className="lacquer animate-fade-up rounded-[var(--radius-lg)] overflow-hidden cursor-pointer"
      style={{
        background: 'var(--surface-1)',
        border: '1px solid var(--color-border)',
        boxShadow: 'var(--shadow-2)',
      }}
    >
      <div className="relative h-[168px]" style={{ background: 'var(--surface-2)' }}>
        <img
          src={tour.photos?.[0] || '/images/placeholder.webp'}
          srcSet={imageSrcSet(tour.photos?.[0], [400, 800])}
          sizes="100vw"
          alt={tour.name[lang]}
          className="w-full h-full object-cover"
          loading="lazy"
          onError={(e) => {
            (e.target as HTMLImageElement).src =
              `https://placehold.co/640x420/12151B/6B7480?text=${encodeURIComponent(tour.name.ru.slice(0, 12))}`
          }}
        />
        <div className="absolute inset-0 scrim-soft pointer-events-none" />

        <span
          className="absolute top-2.5 left-2.5 inline-flex items-center gap-1.5 px-2 py-[3px] rounded-full text-[10.5px] font-semibold glass-strong"
          style={{ color: 'var(--text)' }}
        >
          <i className="w-[6px] h-[6px] diamond" style={{ background: ACCENT }} />
          {tourTypeLabel(tour.type, lang)}
        </span>

        {tour.rating > 0 && (
          <span
            className="absolute top-2.5 right-2.5 inline-flex items-center gap-1 px-2 py-[3px] rounded-full text-[10.5px] font-semibold glass-strong"
            style={{ color: 'var(--text)' }}
          >
            <Star size={10} fill="var(--terra-hot)" style={{ color: 'var(--terra-hot)' }} />
            {formatRating(tour.rating)}
            <span style={{ color: 'var(--text-3)' }}>({tour.reviewCount})</span>
          </span>
        )}

        <h3 className="absolute left-3 right-3 bottom-2.5 font-semibold text-[15px] leading-[1.25] line-clamp-2">
          {tour.name[lang]}
        </h3>
      </div>

      <div className="p-3">
        <div className="flex items-center justify-between gap-2 mb-1.5">
          <div className="flex items-center gap-1.5 text-[11.5px]" style={{ color: ACCENT }}>
            <Clock size={12} />
            <span className="font-medium">{localizeDuration(tour.duration, lang)}</span>
          </div>
          {tour.price > 0 && (
            <span className="text-[13px] font-bold" style={{ color: 'var(--text)' }}>
              {tour.price.toLocaleString('ru-RU')} ₽
            </span>
          )}
        </div>
        <p className="text-[12.5px] leading-[1.45] line-clamp-2" style={{ color: 'var(--text-2)' }}>
          {tourShort(tour.description, lang)}
        </p>
        <div className="flex items-center gap-3 mt-2 text-[11.5px]" style={{ color: 'var(--text-3)' }}>
          {tour.maxGroupSize > 0 && (
            <span className="inline-flex items-center gap-1.5 flex-shrink-0">
              <Users size={12} />
              {t('tours.spotsLeft', { count: Math.max(0, tour.maxGroupSize - (tour.currentGroupSize ?? 0)) })}
            </span>
          )}
          {tour.meetingPoint?.address && (
            <span className="inline-flex items-center gap-1.5 min-w-0">
              <MapPin size={12} className="flex-shrink-0" />
              <span className="truncate">{tour.meetingPoint.address[lang]}</span>
            </span>
          )}
        </div>
      </div>
    </motion.div>
  )
}

function CardSkeleton() {
  return (
    <div
      className="rounded-[var(--radius-lg)] overflow-hidden animate-pulse"
      style={{ background: 'var(--surface-1)', border: '1px solid var(--color-border)' }}
    >
      <div className="h-[168px]" style={{ background: 'var(--surface-2)' }} />
      <div className="p-3 space-y-2">
        <div className="h-3 w-1/3 rounded" style={{ background: 'var(--surface-2)' }} />
        <div className="h-3 w-3/4 rounded" style={{ background: 'var(--surface-2)' }} />
        <div className="h-3 w-1/2 rounded" style={{ background: 'var(--surface-2)' }} />
      </div>
    </div>
  )
}

export default function ToursPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const location = useLocation()
  const [tours, setTours] = useState<Tour[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadTours()
      .then(setTours)
      .catch(() => setTours([]))
      .finally(() => setIsLoading(false))
  }, [])

  const openTour = (id: string) => {
    const el = document.getElementById('scroll-root')
    const val = (el?.scrollTop || 0) || window.scrollY
    sessionStorage.setItem('scroll:' + location.pathname + location.search, String(val))
    navigate(`/tours/${id}`)
  }

  return (
    <div className="min-h-dvh" style={{ background: 'var(--bg)' }}>
      <SEO
        title={`${t('tours.title')} — BROBROGID`}
        description="Маршруты по Северной Осетии: ущелья, водопады, ледники и башенные комплексы."
        url="/tours"
      />
      <PageHeader title={t('tours.title')} showBack />

      <div className="px-4 pt-3 pb-2">
        <p className="text-[13px]" style={{ color: 'var(--text-2)' }}>
          {isLoading ? ' ' : t('tours.routesCount', { count: tours.length })}
        </p>
      </div>

      <div className="px-4 pb-8 space-y-3.5 stagger">
        {isLoading ? (
          [1, 2, 3].map((i) => <CardSkeleton key={i} />)
        ) : tours.length === 0 ? (
          <p className="text-center py-20 text-[13.5px]" style={{ color: 'var(--text-3)' }}>
            {t('tours.empty')}
          </p>
        ) : (
          tours.map((tour) => (
            <TourCard key={tour.id} tour={tour} onOpen={() => openTour(tour.id)} />
          ))
        )}
      </div>

      {/* Подпись под списком: маршруты возят действующие турфирмы из раздела «Места» */}
      {!isLoading && tours.length > 0 && (
        <div className="px-4 pb-10">
          <button
            onClick={() => navigate('/search?category=tours')}
            className="sheen w-full py-3 rounded-[var(--radius-md)] font-semibold text-[13px]"
            style={{ background: 'var(--surface-2)', border: '1px solid var(--color-border)', color: 'var(--text)' }}
          >
            {t('tours.firmsLink')}
          </button>
        </div>
      )}
    </div>
  )
}
