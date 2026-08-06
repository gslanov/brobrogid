import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Clock, MapPin, Navigation, Route, Star, Users } from 'lucide-react'

import type { Tour } from '@/data/types'
import { PageHeader } from '@/shared/ui/PageHeader'
import { SEO } from '@/shared/ui/SEO'
import { imageSrcSet } from '@/shared/lib/imageVariants'
import { CATEGORY_COLORS, formatRating } from '@/shared/lib/utils'
import { loadTours, localizeDuration, tourTypeLabel } from '../lib/tour-utils'

const ACCENT = CATEGORY_COLORS.tours

export default function TourDetailPage() {
  const { id } = useParams<{ id: string }>()
  const { t, i18n } = useTranslation()
  const navigate = useNavigate()
  const lang = i18n.language as 'ru' | 'en'

  const [tour, setTour] = useState<Tour | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadTours()
      .then((all) => setTour(all.find((x) => x.id === id) ?? null))
      .catch(() => setTour(null))
      .finally(() => setIsLoading(false))
  }, [id])

  if (isLoading) {
    return (
      <div className="min-h-dvh" style={{ background: 'var(--bg)' }}>
        <PageHeader title="" showBack />
        <div className="h-[240px] animate-pulse" style={{ background: 'var(--surface-2)' }} />
        <div className="p-4 space-y-3">
          <div className="h-5 w-2/3 rounded animate-pulse" style={{ background: 'var(--surface-2)' }} />
          <div className="h-3 w-full rounded animate-pulse" style={{ background: 'var(--surface-2)' }} />
          <div className="h-3 w-5/6 rounded animate-pulse" style={{ background: 'var(--surface-2)' }} />
        </div>
      </div>
    )
  }

  if (!tour) {
    return (
      <div className="min-h-dvh" style={{ background: 'var(--bg)' }}>
        <PageHeader title={t('tours.notFound')} showBack />
        <div className="flex flex-col items-center justify-center py-24 px-8 text-center">
          <p className="font-semibold text-[15px] mb-1">{t('tours.notFound')}</p>
          <p className="text-[13px] mb-6" style={{ color: 'var(--text-3)' }}>{t('tours.notFoundHint')}</p>
          <button
            onClick={() => navigate('/tours')}
            className="sheen px-6 py-2.5 rounded-full text-[13.5px] font-semibold"
            style={{ background: ACCENT, color: 'var(--text-on-terra)' }}
          >
            {t('tours.title')}
          </button>
        </div>
      </div>
    )
  }

  const meeting = tour.meetingPoint
  const routePoints = tour.route?.length ?? 0

  return (
    <div className="min-h-dvh pb-10" style={{ background: 'var(--bg)' }}>
      <SEO
        title={`${tour.name[lang]} — BROBROGID`}
        description={tour.description[lang].slice(0, 160)}
        url={`/tours/${tour.id}`}
      />

      {/* Обложка во всю ширину, шапка лежит поверх неё */}
      <div className="relative">
        <div className="absolute inset-x-0 top-0 z-40">
          <PageHeader title="" showBack transparent />
        </div>
        <div className="relative h-[268px]" style={{ background: 'var(--surface-2)' }}>
          <img
            src={tour.photos?.[0] || '/images/placeholder.webp'}
            srcSet={imageSrcSet(tour.photos?.[0])}
            sizes="100vw"
            alt={tour.name[lang]}
            className="w-full h-full object-cover"
            onError={(e) => {
              (e.target as HTMLImageElement).src =
                `https://placehold.co/860x560/12151B/6B7480?text=${encodeURIComponent(tour.name.ru.slice(0, 12))}`
            }}
          />
          <div className="absolute inset-0 scrim pointer-events-none" />
          {tour.rating > 0 && (
            <span
              className="absolute top-16 right-4 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[12px] font-semibold glass-strong"
              style={{ color: 'var(--text)' }}
            >
              <Star size={12} fill="var(--terra-hot)" style={{ color: 'var(--terra-hot)' }} />
              {formatRating(tour.rating)}
              <span style={{ color: 'var(--text-3)' }}>· {tour.reviewCount}</span>
            </span>
          )}
          <h1 className="absolute left-4 right-4 bottom-4 text-[21px] font-black leading-[1.15]">
            {tour.name[lang]}
          </h1>
        </div>
      </div>

      {/* Цена и набор группы */}
      <div
        className="mx-4 mt-3.5 rounded-[var(--radius-lg)] p-3.5 flex items-center justify-between gap-3"
        style={{ background: 'var(--surface-1)', border: '1px solid var(--color-border)' }}
      >
        <div>
          <p className="text-[19px] font-black leading-none" style={{ color: 'var(--text)' }}>
            {tour.price.toLocaleString('ru-RU')} ₽
          </p>
          <p className="text-[11.5px] mt-1" style={{ color: 'var(--text-3)' }}>{t('tours.perPerson')}</p>
        </div>
        <div className="text-right">
          <p className="inline-flex items-center gap-1.5 text-[13px] font-semibold" style={{ color: 'var(--text)' }}>
            <Users size={13} style={{ color: ACCENT }} />
            {t('tours.spotsLeft', { count: Math.max(0, tour.maxGroupSize - (tour.currentGroupSize ?? 0)) })}
          </p>
          <p className="text-[11.5px] mt-1" style={{ color: 'var(--text-3)' }}>
            {t(`tours.${tour.status}`)} · {tour.currentGroupSize}/{tour.maxGroupSize}
          </p>
        </div>
      </div>

      {/* Метки: сколько идёт и как передвигаемся */}
      <div className="flex flex-wrap gap-2 px-4 pt-3.5">
        <span
          className="inline-flex items-center gap-1.5 px-3 h-8 rounded-full text-[12px] font-medium"
          style={{ background: 'var(--surface-1)', border: '1px solid var(--color-border)', color: 'var(--text)' }}
        >
          <Clock size={13} style={{ color: ACCENT }} />
          {localizeDuration(tour.duration, lang)}
        </span>
        <span
          className="inline-flex items-center gap-1.5 px-3 h-8 rounded-full text-[12px] font-medium"
          style={{ background: 'var(--surface-1)', border: '1px solid var(--color-border)', color: 'var(--text)' }}
        >
          <Route size={13} style={{ color: ACCENT }} />
          {tourTypeLabel(tour.type, lang)}
        </span>
        {routePoints > 0 && (
          <span
            className="inline-flex items-center gap-1.5 px-3 h-8 rounded-full text-[12px] font-medium"
            style={{ background: 'var(--surface-1)', border: '1px solid var(--color-border)', color: 'var(--text)' }}
          >
            <MapPin size={13} style={{ color: ACCENT }} />
            {t('tours.stops', { count: routePoints })}
          </span>
        )}
      </div>

      <div className="orn-rule mx-4 my-4" />

      <section className="px-4">
        <h2 className="text-[15px] font-bold mb-2">{t('tours.description')}</h2>
        <p className="text-[13.5px] leading-[1.6] whitespace-pre-line" style={{ color: 'var(--text-2)' }}>
          {tour.description[lang]}
        </p>
      </section>

      {meeting && (
        <>
          <div className="orn-rule mx-4 my-4" />
          <section className="px-4">
            <h2 className="text-[15px] font-bold mb-2">{t('tours.meetingPoint')}</h2>
            <div
              className="glass-warm rounded-[var(--radius-lg)] p-3.5 flex items-start gap-3"
              style={{ border: '1px solid var(--color-border)' }}
            >
              <span className="relative w-9 h-9 flex items-center justify-center flex-shrink-0">
                <span
                  className="absolute inset-[6px] diamond"
                  style={{ background: `${ACCENT}1F`, border: `1px solid ${ACCENT}55` }}
                />
                <MapPin size={15} className="relative z-10" style={{ color: ACCENT }} />
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-[13.5px] leading-snug">{meeting.address?.[lang]}</p>
                <button
                  onClick={() =>
                    window.open(
                      `https://www.google.com/maps/dir/?api=1&destination=${meeting.lat},${meeting.lng}`,
                    )
                  }
                  className="mt-2 inline-flex items-center gap-1.5 text-[12px] font-semibold"
                  style={{ color: ACCENT }}
                >
                  <Navigation size={12} />
                  {t('poi.directions')}
                </button>
              </div>
            </div>
          </section>
        </>
      )}

      {/* Кто возит — действующие турфирмы лежат в разделе мест */}
      <div className="orn-rule mx-4 my-4" />
      <section className="px-4">
        <button
          onClick={() => navigate('/search?category=tours')}
          className="sheen w-full py-3 rounded-[var(--radius-md)] font-semibold text-[13px]"
          style={{ background: 'var(--surface-2)', border: '1px solid var(--color-border)', color: 'var(--text)' }}
        >
          {t('tours.firmsLink')}
        </button>
      </section>
    </div>
  )
}
