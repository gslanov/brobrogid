import { useNavigate, useLocation } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { motion } from 'framer-motion'
import type { POI } from '@/data/types'
import { CATEGORY_COLORS, formatRating } from '@/shared/lib/utils'
import { FavoriteButton } from './FavoriteButton'
import { Star } from 'lucide-react'

interface POICardProps {
  poi: POI
  variant?: 'horizontal' | 'vertical'
  showDistance?: string
}

/** Метка категории: ромб в цвете категории + подпись на стекле.
 *  Если в данных вместо подкатегории лежит служебный слаг (`nature`),
 *  показываем человеческое название категории. */
function CategoryTag({ poi }: { poi: POI }) {
  const { t } = useTranslation()
  const color = CATEGORY_COLORS[poi.category]
  const isSlug = !poi.subcategory || /^[a-z0-9_-]+$/.test(poi.subcategory)
  const label = isSlug ? t(`categories.${poi.category}`) : poi.subcategory

  return (
    <span
      className="inline-flex items-center gap-1.5 px-2 py-[3px] rounded-full text-[10.5px] font-semibold glass-strong"
      style={{ color: 'var(--text)' }}
    >
      <i className="w-[6px] h-[6px] diamond" style={{ background: color }} />
      {label}
    </span>
  )
}

export function POICard({ poi, variant = 'vertical', showDistance }: POICardProps) {
  const navigate = useNavigate()
  const location = useLocation()
  const { i18n } = useTranslation()
  const lang = i18n.language as 'ru' | 'en'
  const goToPoi = () => {
    const el = document.getElementById('scroll-root')
    const val = (el?.scrollTop || 0) || window.scrollY
    sessionStorage.setItem('scroll:' + location.pathname + location.search, String(val))
    navigate(`/poi/${poi.id}`)
  }

  /* Карточка — не <button>, потому что внутри лежит кнопка «в избранное».
     Вложенные кнопки ломают вёрстку, поэтому роль назначаем явно. */
  const pressProps = {
    role: 'button' as const,
    tabIndex: 0,
    onClick: goToPoi,
    onKeyDown: (e: React.KeyboardEvent) => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); goToPoi() }
    },
  }

  /* ── Карточка для горизонтальных лент ─────────────────────── */
  if (variant === 'horizontal') {
    return (
      <motion.div
        {...pressProps}
        whileTap={{ scale: 0.965 }}
        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
        className="lacquer flex-shrink-0 w-[228px] rounded-[var(--radius-lg)] overflow-hidden text-left relative cursor-pointer"
        style={{
          background: 'var(--surface-1)',
          border: '1px solid var(--color-border)',
          boxShadow: 'var(--shadow-2)',
        }}
      >
        <div className="relative h-[152px]" style={{ background: 'var(--surface-2)' }}>
          <img
            src={poi.photos[0] || '/images/placeholder.webp'}
            alt={poi.name[lang]}
            className="w-full h-full object-cover"
            loading="lazy"
            onError={(e) => { (e.target as HTMLImageElement).src = `https://placehold.co/460x300/12151B/6B7480?text=${encodeURIComponent(poi.name.ru.slice(0, 10))}` }}
          />
          <div className="absolute inset-0 scrim-soft pointer-events-none" />

          <div className="absolute top-2.5 left-2.5">
            <CategoryTag poi={poi} />
          </div>
          <div className="absolute top-2 right-2">
            <FavoriteButton poiId={poi.id} size="sm" />
          </div>

          <h3
            className="absolute left-3 right-3 bottom-2.5 font-semibold text-[14.5px] leading-[1.25] line-clamp-2"
            style={{ color: '#fff', textShadow: '0 2px 12px rgba(0,0,0,0.6)' }}
          >
            {poi.name[lang]}
          </h3>
        </div>

        <div className="flex items-center gap-1.5 px-3 h-[38px]">
          <Star size={12} style={{ color: 'var(--terra-hot)', fill: 'var(--terra-hot)' }} />
          <span className="text-[12px] font-semibold">{formatRating(poi.rating)}</span>
          <span className="text-[11px]" style={{ color: 'var(--text-3)' }}>({poi.reviewCount})</span>
          {showDistance && (
            <span className="text-[11px] ml-auto" style={{ color: 'var(--text-2)' }}>{showDistance}</span>
          )}
          {!showDistance && poi.priceLevel && (
            <span className="text-[11px] ml-auto" style={{ color: 'var(--text-2)' }}>{'₽'.repeat(poi.priceLevel)}</span>
          )}
        </div>
      </motion.div>
    )
  }

  /* ── Карточка-строка для списков ──────────────────────────── */
  return (
    <motion.div
      {...pressProps}
      whileTap={{ scale: 0.985 }}
      transition={{ type: 'spring', stiffness: 500, damping: 30 }}
      className="lacquer flex rounded-[var(--radius-lg)] overflow-hidden text-left w-full cursor-pointer"
      style={{
        background: 'var(--surface-1)',
        border: '1px solid var(--color-border)',
        boxShadow: 'var(--shadow-1)',
      }}
    >
      <div className="relative w-[118px] min-h-[118px] flex-shrink-0" style={{ background: 'var(--surface-2)' }}>
        <img
          src={poi.photos[0] || '/images/placeholder.webp'}
          alt={poi.name[lang]}
          className="w-full h-full object-cover absolute inset-0"
          loading="lazy"
          onError={(e) => { (e.target as HTMLImageElement).src = `https://placehold.co/240x240/12151B/6B7480?text=${encodeURIComponent(poi.name.ru.slice(0, 10))}` }}
        />
        {/* Тонкая орнаментальная кромка между фото и текстом — едва заметная */}
        <span
          className="absolute top-0 bottom-0 right-0 w-[1.5px] opacity-30"
          style={{ background: 'repeating-linear-gradient(180deg, var(--terra) 0 5px, transparent 5px 10px)' }}
        />
      </div>

      <div className="flex-1 p-3 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <CategoryTag poi={poi} />
            <h3 className="font-semibold text-[14px] leading-[1.3] line-clamp-2 mt-1.5">{poi.name[lang]}</h3>
          </div>
          <FavoriteButton poiId={poi.id} size="sm" />
        </div>

        <p className="text-[11.5px] mt-1 line-clamp-2 leading-[1.45]" style={{ color: 'var(--text-3)' }}>
          {poi.description.short[lang]}
        </p>

        <div className="flex items-center gap-1.5 mt-2">
          <Star size={12} style={{ color: 'var(--terra-hot)', fill: 'var(--terra-hot)' }} />
          <span className="text-[12px] font-semibold">{formatRating(poi.rating)}</span>
          <span className="text-[11px]" style={{ color: 'var(--text-3)' }}>({poi.reviewCount})</span>
          {poi.priceLevel && !showDistance && (
            <span className="text-[11px] ml-auto" style={{ color: 'var(--text-2)' }}>{'₽'.repeat(poi.priceLevel)}</span>
          )}
          {showDistance && (
            <span className="text-[11px] ml-auto" style={{ color: 'var(--text-2)' }}>{showDistance}</span>
          )}
        </div>
      </div>
    </motion.div>
  )
}
