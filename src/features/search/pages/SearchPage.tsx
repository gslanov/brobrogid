import { useState, useMemo } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import Fuse from 'fuse.js'
import { useDataStore } from '@/data/stores/data-store'
import { POICard } from '@/shared/ui/POICard'
import { CategoryChip } from '@/shared/ui/CategoryChip'
import { EmptyState } from '@/shared/ui/EmptyState'
import type { POI, POICategory } from '@/data/types'

const ALL_CATEGORIES: POICategory[] = ['attractions', 'food', 'nature', 'culture', 'shopping', 'activities', 'nightlife', 'transport', 'practical']

export default function SearchPage() {
  const navigate = useNavigate()
  const { t } = useTranslation()
  const [searchParams] = useSearchParams()
  const [query, setQuery] = useState('')
  const [activeCategory, setActiveCategory] = useState<POICategory | null>(
    (searchParams.get('category') as POICategory) || null
  )
  const pois = useDataStore((s) => s.pois)

  const fuse = useMemo(() => new Fuse(pois, {
    keys: [
      { name: 'name.ru', weight: 2 },
      { name: 'name.en', weight: 2 },
      { name: 'tags', weight: 1.5 },
      { name: 'description.short.ru', weight: 1 },
      { name: 'description.short.en', weight: 1 },
      { name: 'subcategory', weight: 1 },
    ],
    threshold: 0.4,
  }), [pois])

  const results = useMemo(() => {
    let items: POI[] = pois
    if (query.trim()) {
      items = fuse.search(query).map((r) => r.item)
    }
    if (activeCategory) {
      items = items.filter((p) => p.category === activeCategory)
    }
    const sort = searchParams.get('sort')
    if (sort === 'popular') {
      items = [...items].sort((a, b) => b.visitCount - a.visitCount)
    }
    return items
  }, [query, activeCategory, pois, fuse, searchParams])

  return (
    <div className="min-h-dvh bg-[var(--color-bg)]">
      <div className="sticky top-0 z-40 bg-white border-b border-[var(--color-border)] px-4 pt-3 pb-2">
        <div className="flex items-center gap-2">
          <button onClick={() => navigate(-1)} className="w-10 h-10 flex items-center justify-center flex-shrink-0">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
            </svg>
          </button>
          <div className="flex-1 flex items-center gap-2 bg-gray-50 border border-[var(--color-border)] rounded-xl px-3 py-2.5">
            <svg className="w-4 h-4 text-gray-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
            </svg>
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={t('search.placeholder')}
              autoFocus
              className="flex-1 bg-transparent outline-none text-sm"
            />
            {query && (
              <button onClick={() => setQuery('')} className="text-gray-400">✕</button>
            )}
          </div>
        </div>
        <div className="flex gap-2 mt-2 overflow-x-auto no-scrollbar pb-1">
          <button
            onClick={() => setActiveCategory(null)}
            className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${!activeCategory ? 'bg-[var(--color-primary)] text-white border-[var(--color-primary)]' : 'bg-white border-gray-200'}`}
          >
            Все
          </button>
          {ALL_CATEGORIES.map((cat) => (
            <CategoryChip
              key={cat}
              category={cat}
              active={activeCategory === cat}
              onClick={() => setActiveCategory(activeCategory === cat ? null : cat)}
              showIcon={false}
            />
          ))}
        </div>
      </div>

      <div className="px-4 py-3">
        <p className="text-xs text-[var(--color-text-secondary)] mb-3">
          {results.length} {results.length === 1 ? 'результат' : 'результатов'}
        </p>
        {results.length === 0 ? (
          <EmptyState icon="🔍" title={t('search.noResults')} subtitle="Попробуйте изменить запрос или фильтры" />
        ) : (
          <div className="space-y-3">
            {results.map((poi) => <POICard key={poi.id} poi={poi} variant="vertical" />)}
          </div>
        )}
      </div>
    </div>
  )
}
