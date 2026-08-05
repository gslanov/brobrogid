import { useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useDataStore } from '@/data/stores/data-store'
import { PageHeader } from '@/shared/ui/PageHeader'
import { POICard } from '@/shared/ui/POICard'
import type { CuisineType } from '@/data/types'
import { UtensilsCrossed, Soup, Salad, Utensils } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

const CUISINE_KEYS: Array<{ key: CuisineType | 'all'; labelKey: string; icon: LucideIcon }> = [
  { key: 'all', labelKey: 'food.all', icon: UtensilsCrossed },
  { key: 'national', labelKey: 'food.nationalShort', icon: Soup },
  { key: 'european', labelKey: 'food.europeanShort', icon: Salad },
  { key: 'mixed', labelKey: 'food.mixedShort', icon: Utensils },
]

export default function FoodPage() {
  const { t } = useTranslation()
  const [searchParams] = useSearchParams()
  const [filter, setFilter] = useState<CuisineType | 'all'>(
    (searchParams.get('type') as CuisineType) || 'all'
  )
  const pois = useDataStore((s) => s.pois)
  const foodPois = pois.filter((p) => p.category === 'food')
  const filtered = filter === 'all' ? foodPois : foodPois.filter((p) => p.cuisineType === filter)

  return (
    <div className="min-h-dvh">
      <PageHeader title={t('food.title')} showBack />
      <div className="flex gap-2 px-4 py-3.5 overflow-x-auto no-scrollbar">
        {CUISINE_KEYS.map((f) => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className="flex-shrink-0 flex items-center gap-2 px-3.5 h-9 rounded-full text-[12.5px] font-medium border transition-all whitespace-nowrap"
            style={filter === f.key
              ? { background: 'var(--terra-tint)', color: 'var(--terra-hot)', borderColor: 'var(--terra-line)' }
              : { background: 'var(--surface-1)', color: 'var(--text-2)', borderColor: 'var(--color-border)' }}
          >
            <f.icon size={14} /> {t(f.labelKey)}
          </button>
        ))}
      </div>
      <div className="px-4 pb-4 space-y-3">
        <p className="text-[11.5px]" style={{ color: 'var(--text-3)' }}>{t('food.venues', { count: filtered.length })}</p>
        {filtered.map((poi) => <POICard key={poi.id} poi={poi} variant="vertical" />)}
      </div>
    </div>
  )
}
