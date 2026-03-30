import { useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useDataStore } from '@/data/stores/data-store'
import { PageHeader } from '@/shared/ui/PageHeader'
import { POICard } from '@/shared/ui/POICard'
import type { CuisineType } from '@/data/types'

const CUISINE_FILTERS: Array<{ key: CuisineType | 'all'; label: string; icon: string }> = [
  { key: 'all', label: 'Все', icon: '🍽️' },
  { key: 'national', label: 'Национальная', icon: '🥟' },
  { key: 'european', label: 'Европейская', icon: '🍝' },
  { key: 'mixed', label: 'Смешанная', icon: '🍴' },
]

export default function FoodPage() {
  const [searchParams] = useSearchParams()
  const [filter, setFilter] = useState<CuisineType | 'all'>(
    (searchParams.get('type') as CuisineType) || 'all'
  )
  const pois = useDataStore((s) => s.pois)
  const foodPois = pois.filter((p) => p.category === 'food')
  const filtered = filter === 'all' ? foodPois : foodPois.filter((p) => p.cuisineType === filter)

  return (
    <div className="min-h-dvh bg-[var(--color-bg)]">
      <PageHeader title="Еда и напитки" showBack />
      <div className="flex gap-2 px-4 py-3 overflow-x-auto no-scrollbar">
        {CUISINE_FILTERS.map((f) => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className={`flex-shrink-0 flex items-center gap-1.5 px-3.5 py-2 rounded-full text-sm font-medium border transition-colors ${filter === f.key ? 'bg-[var(--color-primary)] text-white border-[var(--color-primary)]' : 'bg-white border-gray-200'}`}
          >
            <span>{f.icon}</span> {f.label}
          </button>
        ))}
      </div>
      <div className="px-4 pb-4 space-y-3">
        <p className="text-xs text-[var(--color-text-secondary)]">{filtered.length} заведений</p>
        {filtered.map((poi) => <POICard key={poi.id} poi={poi} variant="vertical" />)}
      </div>
    </div>
  )
}
