import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useDataStore } from '@/data/stores/data-store'
import { PageHeader } from '@/shared/ui/PageHeader'
import { Rating } from '@/shared/ui/Rating'
import { formatPrice } from '@/shared/lib/utils'
import type { TourStatus } from '@/data/types'

const STATUS_FILTERS: Array<{ key: TourStatus | 'all'; label: string }> = [
  { key: 'all', label: 'Все' },
  { key: 'recruiting', label: '🟢 Набор' },
  { key: 'full', label: '🔴 Набрана' },
]

export default function ToursPage() {
  const { i18n, t } = useTranslation()
  const navigate = useNavigate()
  const lang = i18n.language as 'ru' | 'en'
  const tours = useDataStore((s) => s.tours)
  const guides = useDataStore((s) => s.guides)
  const [filter, setFilter] = useState<TourStatus | 'all'>('all')

  const filtered = filter === 'all' ? tours : tours.filter((t) => t.status === filter)

  return (
    <div className="min-h-dvh bg-[var(--color-bg)]">
      <PageHeader title={t('tours.title')} showBack />
      <div className="flex gap-2 px-4 py-3 overflow-x-auto no-scrollbar">
        {STATUS_FILTERS.map((f) => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className={`flex-shrink-0 px-3.5 py-2 rounded-full text-sm font-medium border transition-colors ${filter === f.key ? 'bg-[var(--color-primary)] text-white border-[var(--color-primary)]' : 'bg-white border-gray-200'}`}
          >
            {f.label}
          </button>
        ))}
      </div>
      <div className="px-4 space-y-3 pb-4">
        {filtered.map((tour) => {
          const guide = guides.find((g) => g.id === tour.guideId)
          const spotsLeft = tour.maxGroupSize - tour.currentGroupSize
          return (
            <button key={tour.id} onClick={() => navigate(`/tours/${tour.id}`)} className="w-full bg-white rounded-2xl shadow-sm border border-[var(--color-border)] overflow-hidden text-left">
              <div className="relative h-[180px] bg-gray-100">
                <img src={tour.photos?.[0]} alt={tour.name[lang]} className="w-full h-full object-cover" loading="lazy"
                  onError={(e) => { (e.target as HTMLImageElement).src = `https://placehold.co/800x360/e2e8f0/64748b?text=${encodeURIComponent(tour.name.ru)}` }} />
                <div className={`absolute top-3 right-3 px-2.5 py-1 rounded-full text-xs font-bold text-white ${tour.status === 'recruiting' ? 'bg-green-500' : tour.status === 'full' ? 'bg-red-500' : 'bg-gray-500'}`}>
                  {t(`tours.${tour.status}`)}
                </div>
                <div className="absolute bottom-3 left-3 px-3 py-1 bg-white/90 backdrop-blur rounded-full text-sm font-bold">
                  {formatPrice(tour.price)}
                </div>
              </div>
              <div className="p-4">
                <h3 className="font-bold text-base">{tour.name[lang]}</h3>
                <p className="text-sm text-[var(--color-text-secondary)] mt-1 line-clamp-2">{tour.description[lang].slice(0, 120)}...</p>
                <div className="flex items-center gap-4 mt-3 text-sm text-[var(--color-text-secondary)]">
                  <span>⏱ {tour.duration}</span>
                  <span>👥 {tour.currentGroupSize}/{tour.maxGroupSize}</span>
                  {tour.status === 'recruiting' && spotsLeft > 0 && (
                    <span className="text-green-600 font-medium">Осталось {spotsLeft} мест</span>
                  )}
                </div>
                <div className="flex items-center justify-between mt-3">
                  <Rating value={tour.rating} count={tour.reviewCount} size="sm" />
                  {guide && <span className="text-xs text-[var(--color-text-secondary)]">Гид: {guide.name[lang]}</span>}
                </div>
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}
