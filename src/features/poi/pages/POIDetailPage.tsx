import { useState, useMemo } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { motion, AnimatePresence } from 'framer-motion'
import { useDataStore } from '@/data/stores/data-store'
import { FavoriteButton } from '@/shared/ui/FavoriteButton'
import { Rating } from '@/shared/ui/Rating'
import { CATEGORY_COLORS } from '@/shared/lib/utils'
import { getDB } from '@/data/db'

function useReviews(poiId: string) {
  const [reviews, setReviews] = useState<any[]>([])
  useMemo(() => {
    getDB().then(db => db.getAllFromIndex('reviews', 'by-target', ['poi', poiId])).then(setReviews)
  }, [poiId])
  return reviews
}

export default function POIDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { i18n, t } = useTranslation()
  const lang = i18n.language as 'ru' | 'en'
  const pois = useDataStore((s) => s.pois)
  const poi = pois.find((p) => p.id === id)
  const reviews = useReviews(id || '')
  const [showFull, setShowFull] = useState(false)

  if (!poi) {
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
    return nowMin >= oh * 60 + om && nowMin <= ch * 60 + cm
  }

  const openStatus = isOpenNow()

  return (
    <div className="pb-24">
      {/* Header */}
      <div className="sticky top-0 z-40 flex items-center justify-between px-4 h-14 bg-white/95 backdrop-blur-sm border-b border-[var(--color-border)]">
        <button onClick={() => navigate(-1)} className="w-10 h-10 flex items-center justify-center">
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
          </svg>
        </button>
        <FavoriteButton poiId={poi.id} />
      </div>

      {/* Photos */}
      <div className="flex gap-1 overflow-x-auto no-scrollbar">
        {(poi.photos.length > 0 ? poi.photos : ['placeholder']).map((photo, i) => (
          <div key={i} className="flex-shrink-0 w-[85vw] max-w-[400px] h-[250px] bg-gray-100">
            <img
              src={photo}
              alt={`${poi.name[lang]} ${i + 1}`}
              className="w-full h-full object-cover"
              onError={(e) => { (e.target as HTMLImageElement).src = `https://placehold.co/800x500/e2e8f0/64748b?text=${encodeURIComponent(poi.name.ru)}` }}
            />
          </div>
        ))}
      </div>

      {/* Info */}
      <div className="px-4 pt-4">
        <span className="px-2.5 py-1 rounded-full text-xs font-semibold text-white inline-block mb-2" style={{ background: CATEGORY_COLORS[poi.category] }}>
          {poi.subcategory}
        </span>
        <h1 className="text-2xl font-bold mb-2">{poi.name[lang]}</h1>
        <Rating value={poi.rating} count={poi.reviewCount} size="md" />

        {/* Quick info */}
        <div className="flex items-center gap-3 mt-3 text-sm">
          {openStatus !== null && (
            <span className={`font-medium ${openStatus ? 'text-green-600' : 'text-red-500'}`}>
              {openStatus ? t('poi.openNow') : t('poi.closed')}
            </span>
          )}
          {poi.priceLevel && <span className="text-[var(--color-text-secondary)]">{'₽'.repeat(poi.priceLevel)}</span>}
          {poi.cuisineType && (
            <span className="text-[var(--color-text-secondary)]">{t(`food.${poi.cuisineType}`)}</span>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-2 mt-4 overflow-x-auto no-scrollbar pb-1">
          {poi.hasMenu && (
            <button onClick={() => navigate(`/menu/${poi.id}`)} className="flex items-center gap-1.5 px-4 py-2.5 bg-[var(--color-primary)] text-white rounded-full text-sm font-medium flex-shrink-0">
              🍽️ {t('poi.seeMenu')}
            </button>
          )}
          {poi.phone && (
            <a href={`tel:${poi.phone}`} className="flex items-center gap-1.5 px-4 py-2.5 bg-green-50 text-green-700 rounded-full text-sm font-medium flex-shrink-0">
              📞 {t('poi.call')}
            </a>
          )}
          <button className="flex items-center gap-1.5 px-4 py-2.5 bg-gray-50 rounded-full text-sm font-medium flex-shrink-0">
            🧭 {t('poi.directions')}
          </button>
          <button className="flex items-center gap-1.5 px-4 py-2.5 bg-gray-50 rounded-full text-sm font-medium flex-shrink-0">
            ↗️ {t('poi.share')}
          </button>
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

      {/* Details */}
      <div className="px-4 mt-5 space-y-3">
        <h3 className="font-semibold text-base">Информация</h3>
        <div className="space-y-2 text-sm">
          <div className="flex gap-3">
            <span className="text-lg">📍</span>
            <span>{poi.location.address[lang]}</span>
          </div>
          {poi.phone && (
            <div className="flex gap-3">
              <span className="text-lg">📞</span>
              <a href={`tel:${poi.phone}`} className="text-[var(--color-primary)]">{poi.phone}</a>
            </div>
          )}
          {poi.website && (
            <div className="flex gap-3">
              <span className="text-lg">🌐</span>
              <a href={poi.website} target="_blank" rel="noopener" className="text-[var(--color-primary)] truncate">{poi.website}</a>
            </div>
          )}
          {poi.hours && (
            <div className="flex gap-3">
              <span className="text-lg">🕐</span>
              <div className="text-[var(--color-text-secondary)]">
                {Object.entries(poi.hours).map(([day, h]) => (
                  <div key={day}><span className="font-medium text-[var(--color-text)] capitalize">{day}</span>: {h as string}</div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Reviews */}
      {reviews.length > 0 && (
        <div className="px-4 mt-6">
          <h3 className="font-semibold text-base mb-3">{t('poi.reviews')} ({reviews.length})</h3>
          <div className="space-y-3">
            {reviews.slice(0, 5).map((r) => (
              <div key={r.id} className="bg-gray-50 rounded-xl p-3">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-medium text-sm">{r.authorName}</span>
                  <span className="text-xs text-[var(--color-text-secondary)]">{new Date(r.date).toLocaleDateString('ru-RU')}</span>
                </div>
                <div className="flex mb-1">
                  {[1,2,3,4,5].map(i => <span key={i} className={`text-xs ${i <= r.rating ? 'text-yellow-500' : 'text-gray-300'}`}>★</span>)}
                </div>
                <p className="text-sm text-[var(--color-text-secondary)]">{r.text}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Bottom CTA */}
      <div className="fixed bottom-[calc(var(--bottom-nav-height)+var(--safe-area-bottom))] left-0 right-0 z-30 px-4 py-3 bg-white/95 backdrop-blur-sm border-t border-[var(--color-border)]">
        <div className="flex gap-2 max-w-lg mx-auto">
          {poi.hasMenu ? (
            <button onClick={() => navigate(`/menu/${poi.id}`)} className="flex-1 py-3 bg-[var(--color-primary)] text-white rounded-xl font-semibold text-sm">
              {t('poi.order')}
            </button>
          ) : (
            <button className="flex-1 py-3 bg-[var(--color-primary)] text-white rounded-xl font-semibold text-sm">
              {t('poi.addToTrip')}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
