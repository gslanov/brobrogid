import { useTranslation } from 'react-i18next'
import type { POICategory } from '@/data/types'
import { CATEGORY_COLORS, CATEGORY_ICONS } from '@/shared/lib/utils'

interface CategoryChipProps {
  category: POICategory
  active?: boolean
  onClick?: () => void
  showIcon?: boolean
}

export function CategoryChip({ category, active = false, onClick, showIcon = true }: CategoryChipProps) {
  const { t } = useTranslation()
  const color = CATEGORY_COLORS[category]
  const Icon = CATEGORY_ICONS[category]

  return (
    <button
      onClick={onClick}
      className="flex-shrink-0 flex items-center gap-1.5 px-3.5 h-9 rounded-full text-sm font-medium transition-all whitespace-nowrap border"
      style={{
        background: active ? color : 'white',
        color: active ? 'white' : color,
        borderColor: active ? color : '#e2e8f0',
      }}
    >
      {showIcon && <Icon size={16} />}
      {t(`categories.${category}`)}
    </button>
  )
}
