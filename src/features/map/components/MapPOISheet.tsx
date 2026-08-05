import { useNavigate, useLocation } from 'react-router-dom'
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
  const location = useLocation()
  const { t, i18n } = useTranslation()
  const lang = i18n.language as 'ru' | 'en'
  const goToPoi = () => {
    const el = document.getElementById('scroll-root')
    const val = (el?.scrollTop || 0) || window.scrollY
    sessionStorage.setItem('scroll:' + location.pathname + location.search, String(val))
    navigate(`/poi/${poi.id}`)
  }

  return (
    <div className="px-4 pb-4">
      {/* Peek: always visible */}
      <div className="flex items-center gap-3">
        <div className="flex-1 min-w-0">
          <h3 className="font-bold text-[15.5px] truncate">{poi.name[lang]}</h3>
          <div className="flex items-center gap-2 mt-1">
            <Star size={13} style={{ color: 'var(--terra-hot)', fill: 'var(--terra-hot)' }} />
            <span className="text-[13px] font-semibold">{formatRating(poi.rating)}</span>
            <span className="text-[11.5px]" style={{ color: 'var(--text-3)' }}>({poi.reviewCount})</span>
          </div>
        </div>
        {state === 'peek' && (
          <div className="flex gap-2 flex-shrink-0">
            <button
              onClick={() => { goToPoi() }}
              className="sheen px-3.5 h-9 rounded-[var(--radius-sm)] text-[12px] font-semibold"
              style={{ background: 'var(--terra-hot)', color: 'var(--text-on-terra)' }}
            >
              {t('poi.details')}
            </button>
            <button
              onClick={() => window.open(`https://www.google.com/maps/dir/?api=1&destination=${poi.location.lat},${poi.location.lng}`)}
              className="px-3.5 h-9 rounded-[var(--radius-sm)] text-[12px] font-medium"
              style={{ background: 'var(--surface-3)', color: 'var(--text-2)' }}
            >
              {t('poi.directions')}
            </button>
          </div>
        )}
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
                className="w-20 h-20 rounded-[var(--radius-sm)] flex-shrink-0 overflow-hidden"
              />
            ))}
          </div>

          {/* Status */}
          <div className="flex items-center gap-3 mb-3">
            {poi.priceLevel && (
              <span className="text-[11.5px]" style={{ color: 'var(--text-3)' }}>{'₽'.repeat(poi.priceLevel)}</span>
            )}
          </div>

          {/* Action buttons */}
          <div className="flex gap-2 mb-3">
            <button
              onClick={() => { goToPoi() }}
              className="sheen flex-1 py-2.5 rounded-[var(--radius-sm)] text-[12px] font-semibold"
              style={{ background: 'var(--terra-hot)', color: 'var(--text-on-terra)' }}
            >
              {t('poi.details')}
            </button>
            <button
              onClick={() => window.open(`https://www.google.com/maps/dir/?api=1&destination=${poi.location.lat},${poi.location.lng}`)}
              className="flex-1 py-2.5 rounded-[var(--radius-sm)] text-[12px] font-medium text-center"
              style={{ background: 'var(--surface-3)', color: 'var(--text-2)' }}
            >
              {t('poi.directions')}
            </button>
            {poi.phone && (
              <a
                href={`tel:${poi.phone}`}
                className="flex-1 py-2.5 rounded-[var(--radius-sm)] text-[12px] font-medium text-center"
                style={{ background: 'var(--surface-3)', color: 'var(--moss-light)' }}
              >
                {t('poi.call')}
              </a>
            )}
            <FavoriteButton poiId={poi.id} size="md" />
          </div>

          {/* Description */}
          <p className="text-[13px] leading-relaxed line-clamp-3" style={{ color: 'var(--text-2)' }}>
            {poi.description.short[lang]}
          </p>
        </div>
      )}

      {/* Full: complete detail */}
      {state === 'full' && (
        <div className="mt-4 pt-4">
          <div className="orn-rule mb-4" />
          <p className="text-[13px] leading-relaxed mb-4" style={{ color: 'var(--text-2)' }}>
            {poi.description.full?.[lang] || poi.description.short[lang]}
          </p>

          {poi.location?.address && (
            <div className="flex items-start gap-2.5 mb-2">
              <MapPin size={15} className="flex-shrink-0 mt-0.5" style={{ color: 'var(--terra)' }} />
              <span className="text-[13px]">{poi.location.address[lang]}</span>
            </div>
          )}

          <button
            onClick={() => { goToPoi() }}
            className="w-full mt-4 py-3 rounded-[var(--radius-md)] text-[13px] font-semibold"
            style={{ border: '1px solid var(--terra-line)', color: 'var(--terra-hot)', background: 'var(--terra-tint)' }}
          >
            {t('common.showAll')} →
          </button>
        </div>
      )}
    </div>
  )
}
