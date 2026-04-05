import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, Star, Zap } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useAdminData } from '../hooks/useAdminData'
import { adminGetAll } from '../lib/admin-db'
import AdminTable, { type Column } from '../components/AdminTable'
import type { Review, ReviewTargetType, POI, Tour, Guide } from '@/data/types'

type TargetMap = Record<string, string>

function buildTargetMap(pois: POI[], tours: Tour[], guides: Guide[]): TargetMap {
  const map: TargetMap = {}
  for (const p of pois) map[p.id] = p.name.ru
  for (const t of tours) map[t.id] = t.name.ru
  for (const g of guides) map[g.id] = g.name.ru
  return map
}

const TARGET_TYPE_COLORS: Record<ReviewTargetType, string> = {
  poi: 'bg-blue-100 text-blue-700',
  tour: 'bg-green-100 text-green-700',
  guide: 'bg-purple-100 text-purple-700',
}

export default function AdminReviewList() {
  const navigate = useNavigate()
  const { t } = useTranslation()
  const { items, isLoading, remove } = useAdminData<Review>('reviews')
  const [targetMap, setTargetMap] = useState<TargetMap>({})
  const [activeType, setActiveType] = useState<ReviewTargetType | null>(null)

  useEffect(() => {
    Promise.all([
      adminGetAll<POI>('pois'),
      adminGetAll<Tour>('tours'),
      adminGetAll<Guide>('guides'),
    ]).then(([pois, tours, guides]) => {
      setTargetMap(buildTargetMap(pois, tours, guides))
    })
  }, [])

  const filtered =
    activeType === null
      ? items
      : items.filter((r) => r.targetType === activeType)

  const columns: Column<Review>[] = [
    {
      key: 'targetType',
      label: t('admin.reviews.columns.type'),
      sortable: true,
      width: '90px',
      render: (review) => (
        <span
          className={`inline-block px-2 py-0.5 rounded-full text-xs font-semibold ${TARGET_TYPE_COLORS[review.targetType]}`}
        >
          {t(`admin.reviews.targetTypes.${review.targetType}`)}
        </span>
      ),
    },
    {
      key: 'targetId',
      label: t('admin.reviews.columns.target'),
      render: (review) => (
        <span className="text-sm text-gray-700">
          {targetMap[review.targetId] ?? review.targetId}
        </span>
      ),
    },
    {
      key: 'authorName',
      label: t('admin.reviews.columns.author'),
      sortable: true,
      render: (review) => (
        <span className="text-sm text-gray-800">{review.authorName}</span>
      ),
    },
    {
      key: 'rating',
      label: t('admin.reviews.columns.rating'),
      sortable: true,
      width: '80px',
      render: (review) => (
        <span className="inline-flex items-center gap-1 text-sm font-medium text-gray-800">
          <Star size={13} className="text-amber-400 fill-amber-400" />
          {review.rating}
        </span>
      ),
    },
    {
      key: 'date',
      label: t('admin.reviews.columns.date'),
      sortable: true,
      width: '110px',
      render: (review) => (
        <span className="text-sm text-gray-500">{review.date}</span>
      ),
    },
    {
      key: 'isGenerated',
      label: t('admin.reviews.columns.generated'),
      width: '90px',
      render: (review) =>
        review.isGenerated ? (
          <span className="inline-flex items-center gap-1 text-xs font-medium text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full">
            <Zap size={11} />
            AI
          </span>
        ) : (
          <span className="text-xs text-gray-400">—</span>
        ),
    },
  ]

  const counts: Record<ReviewTargetType, number> = {
    poi: items.filter((r) => r.targetType === 'poi').length,
    tour: items.filter((r) => r.targetType === 'tour').length,
    guide: items.filter((r) => r.targetType === 'guide').length,
  }

  return (
    <div className="p-8 max-w-6xl mx-auto flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">{t('admin.reviews.title')}</h1>
          <p className="text-sm text-gray-500 mt-0.5">{items.length} {t('admin.common.total')}</p>
        </div>
        <button
          onClick={() => navigate('/admin/reviews/new')}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 active:bg-blue-800 transition-colors"
        >
          <Plus size={16} />
          {t('admin.reviews.newButton')}
        </button>
      </div>

      {/* Type filter chips */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setActiveType(null)}
          className={[
            'px-3 py-1 rounded-full text-xs font-semibold border transition-colors',
            activeType === null
              ? 'bg-gray-900 text-white border-gray-900'
              : 'bg-white text-gray-600 border-gray-300 hover:border-gray-400',
          ].join(' ')}
        >
          All ({items.length})
        </button>
        {(['poi', 'tour', 'guide'] as ReviewTargetType[]).map((type) => (
          <button
            key={type}
            onClick={() => setActiveType(activeType === type ? null : type)}
            className={[
              'px-3 py-1 rounded-full text-xs font-semibold border transition-colors',
              activeType === type
                ? TARGET_TYPE_COLORS[type] + ' border-transparent'
                : 'bg-white text-gray-600 border-gray-300 hover:border-gray-400',
            ].join(' ')}
          >
            {t(`admin.reviews.targetTypes.${type}`)} ({counts[type]})
          </button>
        ))}
      </div>

      {/* Table */}
      {isLoading ? (
        <div className="py-16 text-center text-gray-400 text-sm">Loading…</div>
      ) : (
        <AdminTable<Review>
          columns={columns}
          data={filtered}
          searchKeys={['authorName', 'text', 'targetId']}
          searchPlaceholder={t('admin.reviews.searchPlaceholder')}
          emptyMessage={t('admin.reviews.emptyMessage')}
          onEdit={(review) => navigate(`/admin/reviews/${review.id}`)}
          onDelete={(review) => remove(review.id)}
          getId={(review) => review.id}
        />
      )}
    </div>
  )
}
