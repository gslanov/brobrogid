import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useAdminData } from '../hooks/useAdminData'
import AdminTable, { type Column } from '../components/AdminTable'
import type { MenuItem, POI } from '@/data/types'

export default function AdminMenuItemList() {
  const navigate = useNavigate()
  const { t } = useTranslation()
  const { items, isLoading, remove } = useAdminData<MenuItem>('menuItems')
  const { items: pois } = useAdminData<POI>('pois')
  const [activePoi, setActivePoi] = useState<string | null>(null)

  // Build POI id → name map
  const poiMap = Object.fromEntries(pois.map((p) => [p.id, p.name.ru]))

  // POIs that actually have menu items present
  const poisWithItems = pois.filter((p) => items.some((m) => m.poiId === p.id))

  const filtered =
    activePoi === null ? items : items.filter((m) => m.poiId === activePoi)

  const COLUMNS: Column<MenuItem>[] = [
    {
      key: 'name',
      label: t('admin.menuItems.columns.name'),
      sortable: true,
      render: (item) => (
        <span className="font-medium text-gray-900">{item.name.ru}</span>
      ),
    },
    {
      key: 'poiId',
      label: t('admin.menuItems.columns.poiName'),
      sortable: true,
      render: (item) => (
        <span className="text-gray-600 text-sm">
          {poiMap[item.poiId] ?? item.poiId}
        </span>
      ),
    },
    {
      key: 'category',
      label: t('admin.menuItems.columns.category'),
      sortable: true,
      render: (item) => (
        <span className="text-gray-600 text-sm">{item.category || '—'}</span>
      ),
    },
    {
      key: 'price',
      label: t('admin.menuItems.columns.price'),
      sortable: true,
      width: '100px',
      render: (item) => (
        <span className="text-sm font-medium text-gray-800">
          {item.price.toLocaleString('ru-RU')} ₽
        </span>
      ),
    },
    {
      key: 'isPopular',
      label: t('admin.menuItems.columns.popular'),
      width: '80px',
      render: (item) => (
        <span
          className={[
            'inline-block px-2 py-0.5 rounded-full text-xs font-semibold',
            item.isPopular
              ? 'bg-amber-100 text-amber-700'
              : 'bg-gray-100 text-gray-500',
          ].join(' ')}
        >
          {item.isPopular ? t('admin.common.yes') : t('admin.common.no')}
        </span>
      ),
    },
  ]

  return (
    <div className="flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">{t('admin.menuItems.title')}</h1>
          <p className="text-sm text-gray-500 mt-0.5">{items.length} {t('admin.common.total')}</p>
        </div>
        <button
          onClick={() => navigate('/admin/menu-items/new')}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 active:bg-blue-800 transition-colors"
        >
          <Plus size={16} />
          {t('admin.menuItems.newButton')}
        </button>
      </div>

      {/* POI filter */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setActivePoi(null)}
          className={[
            'px-3 py-1 rounded-full text-xs font-semibold border transition-colors',
            activePoi === null
              ? 'bg-gray-900 text-white border-gray-900'
              : 'bg-white text-gray-600 border-gray-300 hover:border-gray-400',
          ].join(' ')}
        >
          All ({items.length})
        </button>
        {poisWithItems.map((poi) => {
          const count = items.filter((m) => m.poiId === poi.id).length
          const isActive = activePoi === poi.id
          return (
            <button
              key={poi.id}
              onClick={() => setActivePoi(isActive ? null : poi.id)}
              className={[
                'px-3 py-1 rounded-full text-xs font-semibold border transition-colors',
                isActive
                  ? 'bg-amber-600 text-white border-amber-600'
                  : 'bg-white text-gray-600 border-gray-300 hover:border-gray-400',
              ].join(' ')}
            >
              {poi.name.ru} ({count})
            </button>
          )
        })}
      </div>

      {/* Table */}
      {isLoading ? (
        <div className="py-16 text-center text-gray-400 text-sm">Loading…</div>
      ) : (
        <AdminTable<MenuItem>
          columns={COLUMNS}
          data={filtered}
          searchKeys={['name.ru', 'name.en', 'category', 'tags']}
          searchPlaceholder={t('admin.menuItems.searchPlaceholder')}
          emptyMessage={t('admin.menuItems.emptyMessage')}
          onEdit={(item) => navigate(`/admin/menu-items/${item.id}`)}
          onDelete={(item) => remove(item.id)}
          getId={(item) => item.id}
        />
      )}
    </div>
  )
}
