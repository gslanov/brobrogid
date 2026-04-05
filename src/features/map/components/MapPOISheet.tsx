import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import type { POI } from '@/data/types'
import type { SheetState } from '@/shared/ui/BottomSheet'
import { ImageWithFallback } from '@/shared/ui/ImageWithFallback'
import { FavoriteButton } from '@/shared/ui/FavoriteButton'
import { formatRating } from '@/shared/lib/utils'
import { Star, MapPin } from 'lucide-react'

interface MapPOISheetProps {
  poi: POI
  state: SheetState
}

export function MapPOISheet({ poi, state }: MapPOISheetProps) {
  const navigate = useNavigate()
  const { t, i18n } = useTranslation()
  const lang = i18n.language as 'ru' | 'en'

  return (
    <div className="px-4 pb-4">
      {/* Peek: always visible */}
      <div className="flex items-center gap-3">
        <div className="flex-1 min-w-0">
          <h3 className="font-bold text-base truncate">{poi.name[lang]}</h3>
          <div className="flex items-center gap-2 mt-0.5">
            <Star size={14} className="text-yellow-500 fill-yellow-500" />
            <span className="text-sm font-medium">{formatRating(poi.rating)}</span>
            <span className="text-xs text-[var(--color-text-secondary)]">({poi.reviewCount})</span>
          </div>
        </div>
        <div className="flex gap-2 flex-shrink-0">
          <button
            onClick={() => navigate(`/poi/${poi.id}`)}
            className="px-3 py-2 bg-[var(--color-primary)] text-white rounded-lg text-xs font-medium"
          >
            {t('poi.details')}
          </button>
          <button
            onClick={() => window.open(`https://yandex.ru/maps/?rtext=~${poi.location.lat},${poi.location.lng}&rtt=auto`)}
            className="px-3 py-2 bg-gray-100 rounded-lg text-xs font-medium"
          >
            {t('poi.directions')}
          </button>
        </div>
      </div>

      {/* Half: photos + details */}
      {(state === 'half' || state === 'full') && (
        <div className="mt-4">
          {/* Photo strip */}
          <div className="flex gap-2 overflow-x-auto no-scrollbar mb-3">
            {(poi.photos || []).slice(0, 3).map((photo, i) => (
              <ImageWithFallback
                key={i}
                src={photo}
                alt={`${poi.name[lang]} ${i + 1}`}
                fallbackText={poi.name[lang]}
                className="w-20 h-20 rounded-lg flex-shrink-0"
              />
            ))}
          </div>

          {/* Status */}
          <div className="flex items-center gap-3 mb-3">
            {poi.priceLevel && (
              <span className="text-xs text-[var(--color-text-secondary)]">{'₽'.repeat(poi.priceLevel)}</span>
            )}
          </div>

          {/* Action buttons */}
          <div className="flex gap-2 mb-3">
            <button onClick={() => navigate(`/poi/${poi.id}`)} className="flex-1 py-2 bg-[var(--color-primary)] text-white rounded-lg text-xs font-medium">
              {t('poi.details')}
            </button>
            <button
              onClick={() => window.open(`https://yandex.ru/maps/?rtext=~${poi.location.lat},${poi.location.lng}&rtt=auto`)}
              className="flex-1 py-2 bg-gray-100 rounded-lg text-xs font-medium text-center"
            >
              {t('poi.directions')}
            </button>
            {poi.phone && (
              <a href={`tel:${poi.phone}`} className="flex-1 py-2 bg-gray-100 rounded-lg text-xs font-medium text-center">
                {t('poi.call')}
              </a>
            )}
            <FavoriteButton poiId={poi.id} size="md" />
          </div>

          {/* Description */}
          <p className="text-sm text-[var(--color-text-secondary)] line-clamp-3">
            {poi.description.short[lang]}
          </p>
        </div>
      )}

      {/* Full: complete detail */}
      {state === 'full' && (
        <div className="mt-4 border-t border-[var(--color-border)] pt-4">
          <p className="text-sm text-[var(--color-text-secondary)] mb-4">
            {poi.description.full?.[lang] || poi.description.short[lang]}
          </p>

          {poi.location?.address && (
            <div className="flex items-start gap-2 mb-2">
              <MapPin size={16} className="flex-shrink-0 text-[var(--color-text-secondary)]" />
              <span className="text-sm">{poi.location.address[lang]}</span>
            </div>
          )}

          <button
            onClick={() => navigate(`/poi/${poi.id}`)}
            className="w-full mt-4 py-3 border border-[var(--color-primary)] text-[var(--color-primary)] rounded-xl text-sm font-medium"
          >
            {t('common.showAll')} →
          </button>
        </div>
      )}
    </div>
  )
}
