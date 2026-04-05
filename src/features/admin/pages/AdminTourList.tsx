import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useAdminData } from '../hooks/useAdminData'
import AdminTable, { type Column } from '../components/AdminTable'
import type { Tour, TourStatus, Guide } from '@/data/types'

const STATUS_COLORS: Record<TourStatus, string> = {
  recruiting: 'bg-green-100 text-green-700',
  full: 'bg-amber-100 text-amber-700',
  completed: 'bg-gray-100 text-gray-500',
}

const ALL_STATUSES: TourStatus[] = ['recruiting', 'full', 'completed']

export default function AdminTourList() {
  const navigate = useNavigate()
  const { t } = useTranslation()
  const { items, isLoading, remove } = useAdminData<Tour>('tours')
  const { items: guides } = useAdminData<Guide>('guides')
  const [activeStatus, setActiveStatus] = useState<TourStatus | null>(null)

  const guideMap = Object.fromEntries(guides.map((g) => [g.id, g.name.ru]))

  const filtered =
    activeStatus === null
      ? items
      : items.filter((t) => t.status === activeStatus)

  const COLUMNS: Column<Tour>[] = [
    {
      key: 'name',
      label: t('admin.tours.columns.name'),
      sortable: true,
      render: (tour) => (
        <span className="font-medium text-gray-900">{tour.name.ru}</span>
      ),
    },
    {
      key: 'guideId',
      label: t('admin.tours.columns.guide'),
      sortable: true,
      render: (tour) => (
        <span className="text-gray-600 text-sm">
          {guideMap[tour.guideId] ?? tour.guideId}
        </span>
      ),
    },
    {
      key: 'type',
      label: t('admin.tours.columns.type'),
      sortable: true,
      width: '100px',
      render: (tour) => (
        <span className="text-gray-600 text-sm">{t(`admin.tours.types.${tour.type}`, { defaultValue: tour.type })}</span>
      ),
    },
    {
      key: 'status',
      label: t('admin.tours.columns.status'),
      sortable: true,
      width: '110px',
      render: (tour) => (
        <span
          className={[
            'inline-block px-2 py-0.5 rounded-full text-xs font-semibold',
            STATUS_COLORS[tour.status],
          ].join(' ')}
        >
          {t(`admin.tours.statuses.${tour.status}`)}
        </span>
      ),
    },
    {
      key: 'price',
      label: t('admin.tours.columns.price'),
      sortable: true,
      width: '100px',
      render: (tour) => (
        <span className="text-sm font-medium text-gray-800">
          {tour.price.toLocaleString('ru-RU')} ₽
        </span>
      ),
    },
    {
      key: 'maxGroupSize',
      label: t('admin.tours.columns.maxGroup'),
      sortable: true,
      width: '100px',
      render: (tour) => (
        <span className="text-sm text-gray-600">
          {tour.currentGroupSize} / {tour.maxGroupSize}
        </span>
      ),
    },
  ]

  return (
    <div className="flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">{t('admin.tours.title')}</h1>
          <p className="text-sm text-gray-500 mt-0.5">{items.length} {t('admin.common.total')}</p>
        </div>
        <button
          onClick={() => navigate('/admin/tours/new')}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 active:bg-blue-800 transition-colors"
        >
          <Plus size={16} />
          {t('admin.tours.newButton')}
        </button>
      </div>

      {/* Status filter chips */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setActiveStatus(null)}
          className={[
            'px-3 py-1 rounded-full text-xs font-semibold border transition-colors',
            activeStatus === null
              ? 'bg-gray-900 text-white border-gray-900'
              : 'bg-white text-gray-600 border-gray-300 hover:border-gray-400',
          ].join(' ')}
        >
          All ({items.length})
        </button>
        {ALL_STATUSES.map((status) => {
          const count = items.filter((t) => t.status === status).length
          const isActive = activeStatus === status
          return (
            <button
              key={status}
              onClick={() => setActiveStatus(isActive ? null : status)}
              className={[
                'px-3 py-1 rounded-full text-xs font-semibold border transition-colors',
                isActive
                  ? status === 'recruiting'
                    ? 'bg-green-600 text-white border-green-600'
                    : status === 'full'
                      ? 'bg-amber-500 text-white border-amber-500'
                      : 'bg-gray-500 text-white border-gray-500'
                  : 'bg-white text-gray-600 border-gray-300 hover:border-gray-400',
              ].join(' ')}
            >
              {t(`admin.tours.statuses.${status}`)} ({count})
            </button>
          )
        })}
      </div>

      {/* Table */}
      {isLoading ? (
        <div className="py-16 text-center text-gray-400 text-sm">Loading…</div>
      ) : (
        <AdminTable<Tour>
          columns={COLUMNS}
          data={filtered}
          searchKeys={['name.ru', 'name.en', 'category']}
          searchPlaceholder={t('admin.tours.searchPlaceholder')}
          emptyMessage={t('admin.tours.emptyMessage')}
          onEdit={(tour) => navigate(`/admin/tours/${tour.id}`)}
          onDelete={(tour) => remove(tour.id)}
          getId={(tour) => tour.id}
        />
      )}
    </div>
  )
}
