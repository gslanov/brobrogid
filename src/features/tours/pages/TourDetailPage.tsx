import { useState, useMemo } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useDataStore } from '@/data/stores/data-store'
import { Rating } from '@/shared/ui/Rating'
import { formatPrice } from '@/shared/lib/utils'
import { getDB } from '@/data/db'

function useReviews(tourId: string) {
  const [reviews, setReviews] = useState<any[]>([])
  useMemo(() => {
    getDB().then(db => db.getAllFromIndex('reviews', 'by-target', ['tour', tourId])).then(setReviews)
  }, [tourId])
  return reviews
}

export default function TourDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { i18n, t } = useTranslation()
  const lang = i18n.language as 'ru' | 'en'
  const tours = useDataStore((s) => s.tours)
  const guides = useDataStore((s) => s.guides)
  const tour = tours.find((t) => t.id === id)
  const guide = tour ? guides.find((g) => g.id === tour.guideId) : null
  const reviews = useReviews(id || '')

  if (!tour) return <div className="flex items-center justify-center min-h-dvh"><p>Загрузка...</p></div>

  const spotsLeft = tour.maxGroupSize - tour.currentGroupSize

  return (
    <div className="pb-24">
      <div className="sticky top-0 z-40 flex items-center px-4 h-14 bg-white/95 backdrop-blur-sm border-b border-[var(--color-border)]">
        <button onClick={() => navigate(-1)} className="w-10 h-10 flex items-center justify-center -ml-2">
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" /></svg>
        </button>
      </div>

      <div className="flex gap-1 overflow-x-auto no-scrollbar">
        {tour.photos.map((photo, i) => (
          <div key={i} className="flex-shrink-0 w-[85vw] max-w-[400px] h-[250px] bg-gray-100">
            <img src={photo} alt="" className="w-full h-full object-cover" onError={(e) => { (e.target as HTMLImageElement).src = `https://placehold.co/800x500/e2e8f0/64748b?text=${encodeURIComponent(tour.name.ru)}` }} />
          </div>
        ))}
      </div>

      <div className="px-4 pt-4">
        <div className={`inline-block px-2.5 py-1 rounded-full text-xs font-bold text-white mb-2 ${tour.status === 'recruiting' ? 'bg-green-500' : 'bg-red-500'}`}>
          {t(`tours.${tour.status}`)}
        </div>
        <h1 className="text-2xl font-bold">{tour.name[lang]}</h1>
        <Rating value={tour.rating} count={tour.reviewCount} size="md" />

        <div className="flex flex-wrap gap-3 mt-3 text-sm">
          <span className="px-3 py-1.5 bg-gray-100 rounded-lg">⏱ {tour.duration}</span>
          <span className="px-3 py-1.5 bg-gray-100 rounded-lg">👥 {tour.currentGroupSize}/{tour.maxGroupSize}</span>
          <span className="px-3 py-1.5 bg-gray-100 rounded-lg">🏷️ {tour.category}</span>
          <span className="px-3 py-1.5 bg-gray-100 rounded-lg">{tour.type === 'walking' ? '🚶 Пешком' : tour.type === 'driving' ? '🚗 На авто' : '🚶🚗 Смешанный'}</span>
        </div>

        {spotsLeft > 0 && tour.status === 'recruiting' && (
          <p className="mt-3 text-sm text-green-600 font-medium">Осталось мест: {spotsLeft}</p>
        )}
      </div>

      <div className="px-4 mt-5">
        <h3 className="font-semibold mb-2">Описание</h3>
        <p className="text-sm leading-relaxed text-[var(--color-text-secondary)]">{tour.description[lang]}</p>
      </div>

      {guide && (
        <div className="px-4 mt-5">
          <h3 className="font-semibold mb-2">Гид</h3>
          <button onClick={() => navigate(`/guides/${guide.id}`)} className="flex items-center gap-3 bg-gray-50 rounded-xl p-3 w-full text-left">
            <div className="w-12 h-12 rounded-full bg-[var(--color-primary)] flex items-center justify-center text-white font-bold text-lg">
              {guide.name.ru[0]}
            </div>
            <div>
              <p className="font-medium text-sm">{guide.name[lang]}</p>
              <div className="flex items-center gap-1 text-xs text-[var(--color-text-secondary)]">
                <span className="text-yellow-500">★</span> {guide.rating.toFixed(1)} • {guide.tourCount} туров
              </div>
            </div>
          </button>
        </div>
      )}

      {tour.dates.length > 0 && (
        <div className="px-4 mt-5">
          <h3 className="font-semibold mb-2">Ближайшие даты</h3>
          <div className="flex gap-2 flex-wrap">
            {tour.dates.slice(0, 5).map((d) => (
              <span key={d} className="px-3 py-1.5 bg-blue-50 text-[var(--color-primary)] rounded-lg text-sm font-medium">
                {new Date(d).toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' })}
              </span>
            ))}
          </div>
        </div>
      )}

      {reviews.length > 0 && (
        <div className="px-4 mt-6">
          <h3 className="font-semibold mb-3">Отзывы ({reviews.length})</h3>
          <div className="space-y-3">
            {reviews.slice(0, 5).map((r) => (
              <div key={r.id} className="bg-gray-50 rounded-xl p-3">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-medium text-sm">{r.authorName}</span>
                  <span className="text-xs text-[var(--color-text-secondary)]">{new Date(r.date).toLocaleDateString('ru-RU')}</span>
                </div>
                <div className="flex mb-1">{[1,2,3,4,5].map(i => <span key={i} className={`text-xs ${i <= r.rating ? 'text-yellow-500' : 'text-gray-300'}`}>★</span>)}</div>
                <p className="text-sm text-[var(--color-text-secondary)]">{r.text}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="fixed bottom-[calc(var(--bottom-nav-height)+var(--safe-area-bottom))] left-0 right-0 z-30 px-4 py-3 bg-white/95 backdrop-blur-sm border-t border-[var(--color-border)]">
        <div className="flex items-center justify-between max-w-lg mx-auto">
          <div>
            <p className="text-xl font-bold">{formatPrice(tour.price)}</p>
            <p className="text-xs text-[var(--color-text-secondary)]">{t('tours.perPerson')}</p>
          </div>
          <button disabled={tour.status !== 'recruiting'} className={`px-8 py-3 rounded-xl font-semibold text-sm ${tour.status === 'recruiting' ? 'bg-[var(--color-primary)] text-white' : 'bg-gray-200 text-gray-500'}`}>
            {tour.status === 'recruiting' ? t('tours.book') : t(`tours.${tour.status}`)}
          </button>
        </div>
      </div>
    </div>
  )
}
