import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import type { POI } from '@/data/types'
import { CATEGORY_COLORS, formatRating } from '@/shared/lib/utils'
import { FavoriteButton } from './FavoriteButton'

interface POICardProps {
  poi: POI
  variant?: 'horizontal' | 'vertical'
  showDistance?: string
}

export function POICard({ poi, variant = 'vertical', showDistance }: POICardProps) {
  const navigate = useNavigate()
  const { i18n } = useTranslation()
  const lang = i18n.language as 'ru' | 'en'

  if (variant === 'horizontal') {
    return (
      <button
        onClick={() => navigate(`/poi/${poi.id}`)}
        className="flex-shrink-0 w-[200px] bg-white rounded-2xl shadow-sm border border-[var(--color-border)] overflow-hidden text-left hover:shadow-md transition-shadow"
      >
        <div className="relative h-[130px] bg-gray-100">
          <img
            src={poi.photos[0] || '/images/placeholder.webp'}
            alt={poi.name[lang]}
            className="w-full h-full object-cover"
            loading="lazy"
            onError={(e) => { (e.target as HTMLImageElement).src = `https://placehold.co/400x260/e2e8f0/64748b?text=${encodeURIComponent(poi.name.ru.slice(0, 10))}` }}
          />
          <div className="absolute top-2 left-2">
            <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold text-white" style={{ background: CATEGORY_COLORS[poi.category] }}>
              {poi.subcategory}
            </span>
          </div>
          <div className="absolute top-2 right-2">
            <FavoriteButton poiId={poi.id} size="sm" />
          </div>
        </div>
        <div className="p-3">
          <h3 className="font-semibold text-sm truncate">{poi.name[lang]}</h3>
          <div className="flex items-center gap-1.5 mt-1">
            <span className="text-yellow-500 text-xs">★</span>
            <span className="text-xs font-medium">{formatRating(poi.rating)}</span>
            <span className="text-xs text-[var(--color-text-secondary)]">({poi.reviewCount})</span>
            {poi.priceLevel && <span className="text-xs text-[var(--color-text-secondary)] ml-auto">{'₽'.repeat(poi.priceLevel)}</span>}
          </div>
          {showDistance && <p className="text-[11px] text-[var(--color-text-secondary)] mt-1">{showDistance}</p>}
        </div>
      </button>
    )
  }

  return (
    <button
      onClick={() => navigate(`/poi/${poi.id}`)}
      className="flex bg-white rounded-2xl shadow-sm border border-[var(--color-border)] overflow-hidden text-left hover:shadow-md transition-shadow w-full"
    >
      <div className="relative w-[120px] min-h-[120px] bg-gray-100 flex-shrink-0">
        <img
          src={poi.photos[0] || '/images/placeholder.webp'}
          alt={poi.name[lang]}
          className="w-full h-full object-cover"
          loading="lazy"
          onError={(e) => { (e.target as HTMLImageElement).src = `https://placehold.co/240x240/e2e8f0/64748b?text=${encodeURIComponent(poi.name.ru.slice(0, 10))}` }}
        />
      </div>
      <div className="flex-1 p-3 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold text-white inline-block mb-1" style={{ background: CATEGORY_COLORS[poi.category] }}>
              {poi.subcategory}
            </span>
            <h3 className="font-semibold text-sm truncate">{poi.name[lang]}</h3>
          </div>
          <FavoriteButton poiId={poi.id} size="sm" />
        </div>
        <p className="text-xs text-[var(--color-text-secondary)] mt-1 line-clamp-2">{poi.description.short[lang]}</p>
        <div className="flex items-center gap-2 mt-2">
          <span className="text-yellow-500 text-xs">★</span>
          <span className="text-xs font-medium">{formatRating(poi.rating)}</span>
          <span className="text-xs text-[var(--color-text-secondary)]">({poi.reviewCount})</span>
          {poi.priceLevel && <span className="text-xs text-[var(--color-text-secondary)] ml-auto">{'₽'.repeat(poi.priceLevel)}</span>}
          {showDistance && <span className="text-[11px] text-[var(--color-text-secondary)] ml-auto">{showDistance}</span>}
        </div>
        {poi.hasMenu && (
          <span className="inline-block mt-1.5 text-[10px] font-medium text-[var(--color-primary)] bg-blue-50 px-2 py-0.5 rounded-full">Есть меню</span>
        )}
      </div>
    </button>
  )
}
