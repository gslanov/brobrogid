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
      className="flex-shrink-0 flex items-center gap-2 px-3.5 h-9 rounded-full text-[12.5px] font-medium transition-all whitespace-nowrap border"
      style={{
        background: active ? color + '26' : 'var(--surface-1)',
        color: active ? color : 'var(--text-2)',
        borderColor: active ? color + '80' : 'var(--color-border)',
        boxShadow: active ? `0 0 16px ${color}33` : 'none',
      }}
    >
      {showIcon
        ? <Icon size={14} style={{ color }} />
        : <i className="w-[6px] h-[6px] diamond" style={{ background: color }} />}
      {t(`categories.${category}`)}
    </button>
  )
}
