import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useAdminData } from '../hooks/useAdminData'
import AdminTable, { type Column } from '../components/AdminTable'
import type { POI, POICategory } from '@/data/types'
import { CATEGORY_COLORS } from '@/shared/lib/utils'

const ALL_CATEGORIES: POICategory[] = [
  'attractions',
  'food',
  'accommodation',
  'nature',
  'culture',
  'shopping',
  'nightlife',
  'transport',
  'activities',
  'practical',
]

const PRICE_LEVEL_LABELS: Record<number, string> = {
  1: '₽',
  2: '₽₽',
  3: '₽₽₽',
  4: '₽₽₽₽',
}

export default function AdminPOIList() {
  const navigate = useNavigate()
  const { t } = useTranslation()
  const { items, isLoading, remove } = useAdminData<POI>('pois')
  const [activeCategory, setActiveCategory] = useState<POICategory | null>(null)

  const filtered =
    activeCategory === null
      ? items
      : items.filter((p) => p.category === activeCategory)

  const COLUMNS: Column<POI>[] = [
    {
      key: 'name',
      label: t('admin.pois.columns.name'),
      sortable: true,
      render: (poi) => (
        <span className="font-medium text-gray-900">{poi.name.ru}</span>
      ),
    },
    {
      key: 'category',
      label: t('admin.pois.columns.category'),
      sortable: true,
      render: (poi) => (
        <span
          className="inline-block px-2 py-0.5 rounded-full text-xs font-semibold text-white"
          style={{ backgroundColor: CATEGORY_COLORS[poi.category] }}
        >
          {t(`admin.pois.categories.${poi.category}`)}
        </span>
      ),
    },
    {
      key: 'subcategory',
      label: t('admin.pois.columns.subcategory'),
      sortable: true,
      render: (poi) => (
        <span className="text-gray-600 text-sm">{poi.subcategory || '—'}</span>
      ),
    },
    {
      key: 'rating',
      label: t('admin.pois.columns.rating'),
      sortable: true,
      width: '80px',
      render: (poi) => (
        <span className="text-sm font-medium text-gray-800">
          {poi.rating > 0 ? poi.rating.toFixed(1) : '—'}
        </span>
      ),
    },
    {
      key: 'priceLevel',
      label: t('admin.pois.columns.price'),
      width: '80px',
      render: (poi) => (
        <span className="text-sm text-gray-600">
          {poi.priceLevel ? PRICE_LEVEL_LABELS[poi.priceLevel] : '—'}
        </span>
      ),
    },
    {
      key: 'tags',
      label: t('admin.pois.columns.tags'),
      width: '70px',
      render: (poi) => (
        <span className="text-sm text-gray-500">{poi.tags.length}</span>
      ),
    },
  ]

  return (
    <div className="flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">{t('admin.pois.title')}</h1>
          <p className="text-sm text-gray-500 mt-0.5">{items.length} {t('admin.common.total')}</p>
        </div>
        <button
          onClick={() => navigate('/admin/pois/new')}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 active:bg-blue-800 transition-colors"
        >
          <Plus size={16} />
          {t('admin.pois.newButton')}
        </button>
      </div>

      {/* Category filter chips */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setActiveCategory(null)}
          className={[
            'px-3 py-1 rounded-full text-xs font-semibold border transition-colors',
            activeCategory === null
              ? 'bg-gray-900 text-white border-gray-900'
              : 'bg-white text-gray-600 border-gray-300 hover:border-gray-400',
          ].join(' ')}
        >
          {t('admin.pois.all', { count: items.length })}
        </button>
        {ALL_CATEGORIES.map((cat) => {
          const count = items.filter((p) => p.category === cat).length
          const isActive = activeCategory === cat
          return (
            <button
              key={cat}
              onClick={() => setActiveCategory(isActive ? null : cat)}
              className={[
                'px-3 py-1 rounded-full text-xs font-semibold border transition-colors',
                isActive ? 'text-white border-transparent' : 'bg-white text-gray-600 border-gray-300 hover:border-gray-400',
              ].join(' ')}
              style={isActive ? { backgroundColor: CATEGORY_COLORS[cat], borderColor: CATEGORY_COLORS[cat] } : undefined}
            >
              {t(`admin.pois.categories.${cat}`)} ({count})
            </button>
          )
        })}
      </div>

      {/* Table */}
      {isLoading ? (
        <div className="py-16 text-center text-gray-400 text-sm">{t('admin.common.loading')}</div>
      ) : (
        <AdminTable<POI>
          columns={COLUMNS}
          data={filtered}
          searchKeys={['name.ru', 'name.en', 'subcategory', 'tags']}
          searchPlaceholder={t('admin.pois.searchPlaceholder')}
          emptyMessage={t('admin.pois.emptyMessage')}
          onEdit={(poi) => navigate(`/admin/pois/${poi.id}`)}
          onDelete={(poi) => remove(poi.id)}
          getId={(poi) => poi.id}
        />
      )}
    </div>
  )
}
