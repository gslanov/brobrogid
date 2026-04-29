import { useState, useRef, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { Rating } from '@/shared/ui/Rating'
import { ImageWithFallback } from '@/shared/ui/ImageWithFallback'
import { formatPrice } from '@/shared/lib/utils'
import type { Tour, Guide, Review } from '@/data/types'
import { Clock, Users, Tag, Footprints, Car, MapPin, Navigation, Star, Check, X, ChevronLeft, ChevronRight } from 'lucide-react'

function getItinerary(type: string, duration: string, lang: 'ru' | 'en') {
  const hours = parseFloat(duration) || 4
  if (type === 'driving') {
    const items = [
      { time: '08:00', ru: 'Сбор группы, посадка в транспорт', en: 'Group gathering, boarding transport' },
      { time: '08:30', ru: 'Отправление', en: 'Departure' },
      { time: '10:30', ru: 'Первая остановка — осмотр', en: 'First stop — sightseeing' },
    ]
    if (hours > 5) {
      items.push({ time: '12:30', ru: 'Обед', en: 'Lunch break' })
      items.push({ time: '13:30', ru: 'Продолжение маршрута', en: 'Continue the route' })
    }
    items.push({ time: hours > 5 ? '15:00' : '12:00', ru: 'Вторая остановка — осмотр', en: 'Second stop — sightseeing' })
    items.push({ time: hours > 5 ? '17:00' : '14:00', ru: 'Возвращение', en: 'Return' })
    return items.map(i => ({ time: i.time, label: i[lang] }))
  }
  const items = [
    { time: '09:00', ru: 'Сбор группы', en: 'Group gathering' },
    { time: '09:30', ru: 'Начало экскурсии', en: 'Tour starts' },
    { time: '11:00', ru: 'Основные достопримечательности', en: 'Main attractions' },
  ]
  if (hours > 4) {
    items.push({ time: '12:00', ru: 'Обед', en: 'Lunch break' })
    items.push({ time: '13:00', ru: 'Продолжение маршрута', en: 'Continue the route' })
  }
  items.push({ time: hours > 4 ? '15:00' : '12:30', ru: 'Завершение экскурсии', en: 'Tour ends' })
  return items.map(i => ({ time: i.time, label: i[lang] }))
}

function getInclusions(type: string, duration: string, lang: 'ru' | 'en') {
  const hours = parseFloat(duration) || 4
  if (type === 'driving') {
    return [
      { included: true, ru: 'Транспорт', en: 'Transport' },
      { included: true, ru: 'Гид', en: 'Guide' },
      { included: hours > 6, ru: 'Обед', en: 'Lunch' },
      { included: true, ru: 'Входные билеты', en: 'Entrance fees' },
      { included: true, ru: 'Страховка', en: 'Insurance' },
      { included: false, ru: 'Личные расходы', en: 'Personal expenses' },
    ].map(i => ({ included: i.included, label: i[lang] }))
  }
  return [
    { included: true, ru: 'Трансфер к началу', en: 'Transport to start' },
    { included: true, ru: 'Гид', en: 'Guide' },
    { included: false, ru: 'Обед', en: 'Lunch' },
    { included: true, ru: 'Страховка', en: 'Insurance' },
    { included: false, ru: 'Личные расходы', en: 'Personal expenses' },
  ].map(i => ({ included: i.included, label: i[lang] }))
}

function getDifficulty(type: string, lang: 'ru' | 'en') {
  if (type === 'driving') return { label: lang === 'ru' ? 'Легко' : 'Easy', color: 'bg-green-100 text-green-700' }
  if (type === 'walking') return { label: lang === 'ru' ? 'Средне' : 'Moderate', color: 'bg-yellow-100 text-yellow-700' }
  return { label: lang === 'ru' ? 'Сложно' : 'Hard', color: 'bg-red-100 text-red-700' }
}

interface TourDetailViewProps {
  tour: Tour
  guide?: Guide
  reviews?: Review[]
  onBack?: () => void
  onGuideClick?: (guideId: string) => void
  onBook?: () => void
}

export function TourDetailView({ tour, guide, reviews = [], onBack, onGuideClick, onBook }: TourDetailViewProps) {
  const { i18n, t } = useTranslation()
  const lang = i18n.language as 'ru' | 'en'

  const [photoIndex, setPhotoIndex] = useState(0)
  const carouselRef = useRef<HTMLDivElement>(null)

  const handleCarouselScroll = useCallback(() => {
    if (!carouselRef.current) return
    const el = carouselRef.current
    const idx = Math.round(el.scrollLeft / el.offsetWidth)
    setPhotoIndex(idx)
  }, [])

  const spotsLeft = tour.maxGroupSize - tour.currentGroupSize

  return (
    <div className="pb-24">
      <div className="sticky top-0 z-40 flex items-center px-4 h-14 bg-white/95 backdrop-blur-sm border-b border-[var(--color-border)]">
        <button onClick={onBack} className="w-10 h-10 flex items-center justify-center -ml-2">
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" /></svg>
        </button>
      </div>

      <div className="relative">
        <div
          ref={carouselRef}
          onScroll={handleCarouselScroll}
          className="flex overflow-x-auto no-scrollbar"
          style={{ scrollSnapType: 'x mandatory' }}
        >
          {tour.photos.map((photo, i) => (
            <div key={i} className="flex-shrink-0 w-full h-[320px] bg-gray-100" style={{ scrollSnapAlign: 'start' }}>
              <img src={photo} alt="" className="w-full h-full object-cover" onError={(e) => { (e.target as HTMLImageElement).src = `https://placehold.co/800x500/e2e8f0/64748b?text=${encodeURIComponent(tour.name.ru)}` }} />
            </div>
          ))}
        </div>
        {tour.photos.length > 1 && photoIndex > 0 && (
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
        {tour.photos.length > 1 && photoIndex < tour.photos.length - 1 && (
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
        {tour.photos.length > 1 && (
          <div className="absolute bottom-3 right-3 px-2 py-0.5 bg-black/60 text-white text-xs rounded-full">
            {photoIndex + 1} / {tour.photos.length}
          </div>
        )}
      </div>

      <div className="px-4 pt-4">
        <div className={`inline-block px-2.5 py-1 rounded-full text-xs font-bold text-white mb-2 ${tour.status === 'recruiting' ? 'bg-green-500' : 'bg-red-500'}`}>
          {t(`tours.${tour.status}`)}
        </div>
        <h1 className="text-2xl font-bold">{tour.name[lang]}</h1>
        <Rating value={tour.rating} count={tour.reviewCount} size="md" />

        <div className="flex flex-wrap gap-3 mt-3 text-sm">
          <span className="flex items-center gap-1 px-3 py-1.5 bg-gray-100 rounded-lg"><Clock size={14} /> {tour.duration}</span>
          <span className="flex items-center gap-1 px-3 py-1.5 bg-gray-100 rounded-lg"><Users size={14} /> {lang === 'ru' ? `Записано ${tour.currentGroupSize} из ${tour.maxGroupSize}` : `Booked ${tour.currentGroupSize} of ${tour.maxGroupSize}`}</span>
          <span className="flex items-center gap-1 px-3 py-1.5 bg-gray-100 rounded-lg"><Tag size={14} /> {tour.category}</span>
          <span className="flex items-center gap-1 px-3 py-1.5 bg-gray-100 rounded-lg">{tour.type === 'walking' ? <Footprints size={14} /> : tour.type === 'driving' ? <Car size={14} /> : <><Footprints size={14} /><Car size={14} /></>} {t(`tours.type_${tour.type}`, tour.type)}</span>
          {(() => { const d = getDifficulty(tour.type, lang); return <span className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold ${d.color}`}>{d.label}</span> })()}
        </div>

        {spotsLeft > 0 && tour.status === 'recruiting' && (
          <p className="mt-3 text-sm text-green-600 font-medium">{t('tours.spotsLeft', { count: spotsLeft })}</p>
        )}
      </div>

      <div className="px-4 mt-5">
        <h3 className="font-semibold mb-2">{t('tours.description', 'Description')}</h3>
        <p className="text-sm leading-relaxed text-[var(--color-text-secondary)]">{tour.description[lang]}</p>
      </div>

      <div className="px-4 mt-5">
        <h3 className="font-semibold mb-3">{t('tours.schedule')}</h3>
        <div className="relative pl-6">
          <div className="absolute left-[7px] top-2 bottom-2 w-px bg-[var(--color-border)]" />
          {getItinerary(tour.type, tour.duration, lang).map((item, i, arr) => (
            <div key={i} className="relative flex items-start gap-3 pb-4 last:pb-0">
              <div className={`absolute left-[-17px] top-1.5 w-3 h-3 rounded-full border-2 ${i === 0 ? 'bg-[var(--color-primary)] border-[var(--color-primary)]' : i === arr.length - 1 ? 'bg-green-500 border-green-500' : 'bg-white border-[var(--color-primary)]'}`} />
              <span className="text-xs font-mono font-semibold text-[var(--color-text-secondary)] min-w-[40px]">{item.time}</span>
              <span className="text-sm text-[var(--color-text)]">{item.label}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="px-4 mt-5">
        <h3 className="font-semibold mb-3">{t('tours.whatsIncluded')}</h3>
        <div className="space-y-2">
          {getInclusions(tour.type, tour.duration, lang).map((item, i) => (
            <div key={i} className="flex items-center gap-2.5">
              {item.included ? (
                <div className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                  <Check size={12} className="text-green-600" />
                </div>
              ) : (
                <div className="w-5 h-5 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
                  <X size={12} className="text-red-500" />
                </div>
              )}
              <span className={`text-sm ${item.included ? 'text-[var(--color-text)]' : 'text-[var(--color-text-secondary)]'}`}>{item.label}</span>
            </div>
          ))}
        </div>
      </div>

      {tour.meetingPoint && (
        <div className="px-4 mt-5">
          <h3 className="font-semibold mb-2 flex items-center gap-1.5"><MapPin size={16} /> {t('poi.meetingPoint')}</h3>
          <div className="bg-gray-50 rounded-xl p-3">
            <p className="text-sm text-[var(--color-text)]">{tour.meetingPoint.address[lang]}</p>
            {onBack && (
              <button
                onClick={() => window.open(`https://yandex.ru/maps/?rtext=~${tour.meetingPoint.lat},${tour.meetingPoint.lng}&rtt=auto`)}
                className="mt-2 px-4 py-2 bg-[var(--color-primary)] text-white rounded-lg text-sm font-medium inline-flex items-center gap-1.5"
              >
                <Navigation size={16} /> {t('poi.route')}
              </button>
            )}
          </div>
        </div>
      )}

      {guide && (
        <div className="px-4 mt-5">
          <h3 className="font-semibold mb-2">{t('tours.guide', { name: '' }).replace(': ', '')}</h3>
          <button onClick={() => onGuideClick?.(guide.id)} className="flex items-center gap-3 bg-gray-50 rounded-xl p-3 w-full text-left">
            {guide.photo ? (
              <ImageWithFallback
                src={guide.photo}
                alt={guide.name[lang]}
                fallbackText={guide.name.ru[0]}
                className="w-12 h-12 rounded-full flex-shrink-0"
              />
            ) : (
              <div className="w-12 h-12 rounded-full bg-[var(--color-primary)] flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
                {guide.name.ru[0]}
              </div>
            )}
            <div>
              <p className="font-medium text-sm">{guide.name[lang]}</p>
              <div className="flex items-center gap-1 text-xs text-[var(--color-text-secondary)]">
                <Star size={12} className="text-yellow-500 fill-yellow-500" /> {guide.rating.toFixed(1)} • {guide.tourCount} {t('guides.tours')}
              </div>
            </div>
          </button>
        </div>
      )}

      {tour.dates.length > 0 && (
        <div className="px-4 mt-5">
          <h3 className="font-semibold mb-2">{t('tours.dates', 'Upcoming dates')}</h3>
          <div className="flex gap-2 flex-wrap">
            {tour.dates.slice(0, 5).map((d) => (
              <span key={d} className="px-3 py-1.5 bg-[var(--color-primary-light)] text-[var(--color-primary)] rounded-lg text-sm font-medium">
                {new Date(d).toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' })}
              </span>
            ))}
          </div>
        </div>
      )}

      <div className="px-4 mt-6">
        <h3 className="font-semibold mb-3">{t('poi.reviews')} ({reviews.length})</h3>
        {reviews.length > 0 ? (
          <div className="space-y-3">
            {reviews.slice(0, 5).map((r) => (
              <div key={r.id} className="bg-gray-50 rounded-xl p-3">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-medium text-sm">{r.authorName}</span>
                  <span className="text-xs text-[var(--color-text-secondary)]">{new Date(r.date).toLocaleDateString('ru-RU')}</span>
                </div>
                <div className="flex mb-1">{[1,2,3,4,5].map(i => <Star key={i} size={12} className={i <= r.rating ? 'text-yellow-500 fill-yellow-500' : 'text-gray-300'} />)}</div>
                <p className="text-sm text-[var(--color-text-secondary)]">{r.text}</p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-[var(--color-text-secondary)] py-4 text-center">{t('tours.noReviews')}</p>
        )}
      </div>

      <div className="sticky bottom-0 left-0 right-0 z-30 px-4 py-3 bg-white/95 backdrop-blur-sm border-t border-[var(--color-border)]">
        <div className="flex items-center justify-between max-w-lg mx-auto">
          <div>
            <p className="text-xl font-bold">{formatPrice(tour.price)}</p>
            <p className="text-xs text-[var(--color-text-secondary)]">{t('tours.perPerson')}</p>
          </div>
          <button
            disabled={tour.status !== 'recruiting'}
            onClick={() => tour.status === 'recruiting' && onBook?.()}
            className={`px-8 py-3 rounded-xl font-semibold text-sm ${tour.status === 'recruiting' ? 'bg-[var(--color-primary)] text-white' : 'bg-gray-200 text-gray-500'}`}
          >
            {tour.status === 'recruiting' ? t('tours.book') : t(`tours.${tour.status}`)}
          </button>
        </div>
      </div>
    </div>
  )
}
