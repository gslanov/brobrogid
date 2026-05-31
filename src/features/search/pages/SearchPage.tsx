import { useState, useMemo, useEffect, useCallback } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { SEO } from '@/shared/ui/SEO'
import Fuse from 'fuse.js'
import { useDataStore } from '@/data/stores/data-store'
import { POICard } from '@/shared/ui/POICard'
import { CategoryChip } from '@/shared/ui/CategoryChip'
import { EmptyState } from '@/shared/ui/EmptyState'
import { FilterSheet, type Filters } from '@/features/search/components/FilterSheet'
import type { POI, POICategory } from '@/data/types'
import { Search, X } from 'lucide-react'

const ALL_CATEGORIES: POICategory[] = ['attractions', 'food', 'nature', 'culture', 'shopping', 'activities', 'nightlife', 'transport', 'practical']
const SORT_OPTIONS = ['relevance', 'rating', 'popularity'] as const
type SortOption = typeof SORT_OPTIONS[number]

const RECENT_SEARCHES_KEY = 'brobrogid_recent_searches'
const MAX_RECENT = 5

function getRecentSearches(): string[] {
  try { return JSON.parse(localStorage.getItem(RECENT_SEARCHES_KEY) || '[]') }
  catch { return [] }
}
function saveRecentSearch(q: string) {
  const recent = getRecentSearches().filter((s) => s !== q)
  recent.unshift(q)
  localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(recent.slice(0, MAX_RECENT)))
}
function removeRecentSearch(q: string) {
  const recent = getRecentSearches().filter((s) => s !== q)
  localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(recent))
}

export default function SearchPage() {
  const navigate = useNavigate()
  const { t, i18n } = useTranslation()
  const [searchParams] = useSearchParams()
  const [query, setQuery] = useState('')
  const [debouncedQuery, setDebouncedQuery] = useState('')
  const [activeCategory, setActiveCategory] = useState<POICategory | null>(
    (searchParams.get('category') as POICategory) || null
  )
  const [sort, setSort] = useState<SortOption>(
    searchParams.get('sort') === 'popular' ? 'popularity' : 'relevance'
  )
  const [filters, setFilters] = useState<Filters>({ minRating: 0, priceLevels: [], openNow: false })
  const [filterSheetOpen, setFilterSheetOpen] = useState(false)
  const [showRecent, setShowRecent] = useState(true)
  const [submitted, setSubmitted] = useState(!!searchParams.get('category') || !!searchParams.get('sort'))
  const [recentSearches, setRecentSearches] = useState(getRecentSearches)
  const pois = useDataStore((s) => s.pois)

  // Step 4.1 — Debounce 300ms
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedQuery(query), 300)
    return () => clearTimeout(timer)
  }, [query])

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

  // Autocomplete suggestions
  const suggestions = useMemo(() => {
    if (!query.trim() || query.length < 1) return []
    return fuse.search(query, { limit: 5 }).map((r) => r.item)
  }, [query, fuse])

  const results = useMemo(() => {
    let items: POI[] = pois
    if (debouncedQuery.trim()) {
      items = fuse.search(debouncedQuery).map((r) => r.item)
    }
    if (activeCategory) {
      items = items.filter((p) => p.category === activeCategory)
    }
    // Step 4.2 — Apply filters
    if (filters.minRating > 0) {
      items = items.filter((p) => p.rating >= filters.minRating)
    }
    if (filters.priceLevels.length > 0) {
      items = items.filter((p) => p.priceLevel && filters.priceLevels.includes(p.priceLevel))
    }
    // openNow filter — check current day/time against hours
    if (filters.openNow) {
      items = items.filter((p) => {
        if (!p.hours) return false
        const days = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'] as const
        const now = new Date()
        const dayKey = days[now.getDay()]
        const hours = p.hours[dayKey]
        if (!hours) return false
        const [open, close] = hours.split('-')
        const nowMin = now.getHours() * 60 + now.getMinutes()
        const [oh, om] = open.split(':').map(Number)
        const [ch, cm] = close.split(':').map(Number)
        const openMin = oh * 60 + om
        const closeMin = ch * 60 + cm
        // Handle overnight hours (e.g. 23:00-02:00)
        if (closeMin < openMin) return nowMin >= openMin || nowMin <= closeMin
        return nowMin >= openMin && nowMin <= closeMin
      })
    }
    // Step 4.4 — Sort
    if (sort === 'rating') {
      items = [...items].sort((a, b) => b.rating - a.rating)
    } else if (sort === 'popularity') {
      items = [...items].sort((a, b) => b.visitCount - a.visitCount)
    }
    return items
  }, [debouncedQuery, activeCategory, pois, fuse, sort, filters])

  const handleSubmit = useCallback((q: string) => {
    if (!q.trim()) return
    saveRecentSearch(q.trim())
    setRecentSearches(getRecentSearches())
    setShowRecent(false)
    setSubmitted(true)
    setQuery(q.trim())
  }, [])

  const handleRemoveRecent = (q: string) => {
    removeRecentSearch(q)
    setRecentSearches(getRecentSearches())
  }

  const activeFilterCount = (filters.minRating > 0 ? 1 : 0) + (filters.priceLevels.length > 0 ? 1 : 0) + (filters.openNow ? 1 : 0)

  return (
    <div className="min-h-dvh bg-[var(--color-bg)]">
      <SEO
        title="Поиск — BROBROGID"
        description="Поиск мест, ресторанов, туров и гидов во Владикавказе."
        url="/search"
      />
      <div className="sticky top-0 z-40 bg-white border-b border-[var(--color-border)] px-4 pt-3 pb-2">
        <div className="flex items-center gap-2">
          <button onClick={() => navigate(-1)} className="w-10 h-10 flex items-center justify-center flex-shrink-0">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
            </svg>
          </button>
          <form
            onSubmit={(e) => { e.preventDefault(); handleSubmit(query) }}
            className="flex-1 flex items-center gap-2 bg-gray-50 border border-[var(--color-border)] rounded-xl px-3 h-12"
          >
            <svg className="w-4 h-4 text-gray-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
            </svg>
            <input
              value={query}
              onChange={(e) => { setQuery(e.target.value); setShowRecent(!e.target.value); if (e.target.value !== query) setSubmitted(false) }}
              onFocus={() => { if (!query) setShowRecent(true) }}
              placeholder={t('search.placeholder')}
              autoFocus
              className="flex-1 bg-transparent outline-none text-sm"
            />
            {query && (
              <button type="button" onClick={() => { setQuery(''); setShowRecent(true) }} className="text-gray-400"><X size={16} /></button>
            )}
          </form>
        </div>
        {/* Category chips + Filters button */}
        <div className="flex gap-2 mt-2 overflow-x-auto no-scrollbar pb-1">
          <button
            onClick={() => setActiveCategory(null)}
            className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${!activeCategory ? 'bg-[var(--color-primary)] text-white border-[var(--color-primary)]' : 'bg-white border-gray-200'}`}
          >
            {t('search.all')}
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
          <button
            onClick={() => setFilterSheetOpen(true)}
            className={`flex-shrink-0 flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${activeFilterCount > 0 ? 'bg-[var(--color-primary)] text-white border-[var(--color-primary)]' : 'bg-white border-gray-200'}`}
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 3c2.755 0 5.455.232 8.083.678.533.09.917.556.917 1.096v1.044a2.25 2.25 0 0 1-.659 1.591l-5.432 5.432a2.25 2.25 0 0 0-.659 1.591v2.927a2.25 2.25 0 0 1-1.244 2.013L9.75 21v-6.568a2.25 2.25 0 0 0-.659-1.591L3.659 7.409A2.25 2.25 0 0 1 3 5.818V4.774c0-.54.384-1.006.917-1.096A48.32 48.32 0 0 1 12 3Z" />
            </svg>
            {t('search.filters')}
            {activeFilterCount > 0 && (
              <span className="w-4 h-4 bg-white text-[var(--color-primary)] rounded-full text-[11px] font-bold flex items-center justify-center">
                {activeFilterCount}
              </span>
            )}
          </button>
        </div>
      </div>

      <div className="px-4 py-3">
        {/* Step 4.1 — Recent searches overlay */}
        {showRecent && !query && recentSearches.length > 0 && (
          <div className="mb-4">
            <h3 className="text-sm font-semibold mb-2">{t('search.recent')}</h3>
            <div className="space-y-1">
              {recentSearches.map((s) => (
                <div key={s} className="flex items-center justify-between py-2">
                  <button onClick={() => { setQuery(s); handleSubmit(s) }} className="flex items-center gap-2 text-sm">
                    <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                    </svg>
                    {s}
                  </button>
                  <button onClick={() => handleRemoveRecent(s)} className="text-gray-400 p-1"><X size={14} /></button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Step 4.1 — Autocomplete suggestions while typing */}
        {query && !submitted && suggestions.length > 0 && (
          <div className="mb-4">
            {suggestions.map((poi) => (
              <button
                key={poi.id}
                onClick={() => { navigate(`/poi/${poi.id}`) }}
                className="flex items-center gap-3 w-full py-2.5 text-left"
              >
                <svg className="w-4 h-4 text-gray-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
                </svg>
                <span className="text-sm truncate">{poi.name[i18n.language as 'ru' | 'en']}</span>
              </button>
            ))}
          </div>
        )}

        {/* Step 4.4 — Sort chips */}
        {submitted && (
          <div className="flex items-center gap-2 mb-3">
            <p className="text-xs text-[var(--color-text-secondary)]">
              {t('search.results', { count: results.length })}
            </p>
            <div className="flex gap-1.5 ml-auto">
              {SORT_OPTIONS.map((s) => (
                <button
                  key={s}
                  onClick={() => setSort(s)}
                  className={`px-2 py-1 rounded-md text-[11px] font-medium transition-colors ${sort === s ? 'bg-[var(--color-primary)] text-white' : 'bg-gray-100'}`}
                >
                  {t(`search.sort_${s}`, s)}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Results */}
        {submitted && results.length === 0 ? (
          <EmptyState
            icon={<Search size={48} />}
            title={t('search.noResults')}
            subtitle={t('search.noResultsHint')}
            action={{ label: t('categories.attractions'), onClick: () => setActiveCategory('attractions') }}
          />
        ) : submitted ? (
          <div className="space-y-3">
            {results.map((poi) => <POICard key={poi.id} poi={poi} variant="vertical" />)}
          </div>
        ) : null}
      </div>

      {/* Step 4.2 — Filter bottom sheet */}
      <FilterSheet
        isOpen={filterSheetOpen}
        onClose={() => setFilterSheetOpen(false)}
        filters={filters}
        onApply={setFilters}
        resultCount={results.length}
      />
    </div>
  )
}
