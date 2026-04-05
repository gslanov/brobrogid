import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useDataStore } from '@/data/stores/data-store'
import { Rating } from '@/shared/ui/Rating'
import { ImageWithFallback } from '@/shared/ui/ImageWithFallback'
import { formatPrice } from '@/shared/lib/utils'
import { getDB } from '@/data/db'
import { Search, Clock, Star } from 'lucide-react'

function useReviews(guideId: string) {
  const [reviews, setReviews] = useState<any[]>([])
  const [loaded, setLoaded] = useState(false)
  useEffect(() => {
    let cancelled = false
    getDB()
      .then(db => db.getAllFromIndex('reviews', 'by-target', ['guide', guideId]))
      .then(data => { if (!cancelled) { setReviews(data); setLoaded(true) } })
      .catch(() => { if (!cancelled) setLoaded(true) })
    return () => { cancelled = true }
  }, [guideId])
  return { reviews, loaded }
}

export default function GuideDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { i18n, t } = useTranslation()
  const lang = i18n.language as 'ru' | 'en'
  const guides = useDataStore((s) => s.guides)
  const tours = useDataStore((s) => s.tours)
  const isLoaded = useDataStore((s) => s.isLoaded)
  const guide = guides.find((g) => g.id === id)
  const guideTours = tours.filter((t) => t.guideId === id)
  const { reviews, loaded: reviewsLoaded } = useReviews(id || '')

  // 404 handling
  if (isLoaded && !guide) {
    return (
      <div className="min-h-dvh flex flex-col items-center justify-center px-4 text-center">
        <div className="mb-4 text-[var(--color-text-secondary)]"><Search size={48} /></div>
        <h1 className="text-xl font-bold mb-2">{t('guides.notFound')}</h1>
        <p className="text-sm text-[var(--color-text-secondary)] mb-6">{t('guides.notFoundHint')}</p>
        <button onClick={() => navigate(-1)} className="px-6 py-2.5 bg-[var(--color-primary)] text-white rounded-xl font-medium text-sm">
          {t('common.back')}
        </button>
      </div>
    )
  }

  if (!guide) return <div className="flex items-center justify-center min-h-dvh"><p>{t('common.loading')}</p></div>

  return (
    <div className="min-h-dvh bg-[var(--color-bg)]">
      <div className="sticky top-0 z-40 flex items-center px-4 h-14 bg-white/95 backdrop-blur-sm border-b border-[var(--color-border)]">
        <button onClick={() => navigate(-1)} className="w-10 h-10 flex items-center justify-center -ml-2">
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" /></svg>
        </button>
      </div>

      <div className="flex flex-col items-center px-4 pt-6 pb-4 bg-white">
        {guide.photo ? (
          <ImageWithFallback
            src={guide.photo}
            alt={guide.name[lang]}
            fallbackText={guide.name.ru[0]}
            className="w-24 h-24 rounded-full mb-3"
          />
        ) : (
          <div className="w-24 h-24 rounded-full bg-[var(--color-primary)] flex items-center justify-center text-white font-bold text-4xl mb-3">
            {guide.name.ru[0]}
          </div>
        )}
        <h1 className="text-xl font-bold">{guide.name[lang]}</h1>
        <Rating value={guide.rating} count={guide.reviewCount} size="md" />
        <div className="flex gap-2 mt-2">
          {guide.languages.map((l) => <span key={l} className="text-xs px-2.5 py-1 bg-[var(--color-primary-light)] text-[var(--color-primary)] rounded-full">{l}</span>)}
        </div>
        <div className="flex gap-6 mt-4">
          <div className="text-center"><p className="text-lg font-bold">{guide.tourCount}</p><p className="text-xs text-[var(--color-text-secondary)]">{t('guides.tours')}</p></div>
          <div className="text-center"><p className="text-lg font-bold">{guide.reviewCount}</p><p className="text-xs text-[var(--color-text-secondary)]">{t('poi.reviews')}</p></div>
        </div>
      </div>

      <div className="px-4 mt-4">
        <h3 className="font-semibold mb-2">{t('guides.about', 'About')}</h3>
        <p className="text-sm leading-relaxed text-[var(--color-text-secondary)]">{guide.bio[lang]}</p>
      </div>

      <div className="px-4 mt-4">
        <h3 className="font-semibold mb-2">{t('guides.specializations', 'Specializations')}</h3>
        <div className="flex flex-wrap gap-2">
          {guide.specializations.map((s) => <span key={s} className="text-xs px-3 py-1.5 bg-gray-100 rounded-full">{s}</span>)}
        </div>
      </div>

      {guideTours.length > 0 && (
        <div className="px-4 mt-5">
          <h3 className="font-semibold mb-3">{t('tours.title')} ({guideTours.length})</h3>
          <div className="space-y-2">
            {guideTours.map((tour) => (
              <button key={tour.id} onClick={() => navigate(`/tours/${tour.id}`)} className="w-full flex items-center gap-3 bg-white rounded-xl p-3 border border-[var(--color-border)] text-left">
                <div className="w-16 h-16 rounded-lg bg-gray-100 flex-shrink-0 overflow-hidden">
                  <img src={tour.photos?.[0]} alt="" className="w-full h-full object-cover" onError={(e) => { (e.target as HTMLImageElement).src = `https://placehold.co/128x128/e2e8f0/64748b?text=Tour` }} />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium text-sm truncate">{tour.name[lang]}</h4>
                  <p className="text-xs text-[var(--color-text-secondary)] flex items-center gap-0.5"><Clock size={12} /> {tour.duration} • {formatPrice(tour.price)}</p>
                  <div className={`inline-block mt-1 px-2 py-0.5 rounded-full text-[11px] font-bold text-white ${tour.status === 'recruiting' ? 'bg-green-500' : 'bg-red-500'}`}>
                    {t(`tours.${tour.status === 'recruiting' ? 'recruitingShort' : 'fullShort'}`)}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Reviews section */}
      <div className="px-4 mt-6 pb-4">
        <h3 className="font-semibold mb-3">{t('guides.reviews', { count: reviews.length })}</h3>
        {reviews.length > 0 ? (
          <div className="space-y-3">
            {reviews.map((r) => (
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
        ) : reviewsLoaded ? (
          <p className="text-sm text-[var(--color-text-secondary)] py-4 text-center">{t('guides.noReviews')}</p>
        ) : null}
      </div>
    </div>
  )
}
