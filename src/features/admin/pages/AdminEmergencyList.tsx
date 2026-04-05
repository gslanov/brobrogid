import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useAdminData } from '../hooks/useAdminData'
import AdminTable, { type Column } from '../components/AdminTable'
import type { EmergencyContact, EmergencyType } from '@/data/types'

const TYPE_COLORS: Record<EmergencyType, string> = {
  police: 'bg-blue-100 text-blue-700',
  ambulance: 'bg-red-100 text-red-700',
  fire: 'bg-orange-100 text-orange-700',
  hospital: 'bg-green-100 text-green-700',
  trauma: 'bg-purple-100 text-purple-700',
  pharmacy: 'bg-teal-100 text-teal-700',
}

const ALL_TYPES: EmergencyType[] = ['police', 'ambulance', 'fire', 'hospital', 'trauma', 'pharmacy']

export default function AdminEmergencyList() {
  const navigate = useNavigate()
  const { t } = useTranslation()
  const { items, isLoading, remove } = useAdminData<EmergencyContact>('emergency')
  const [activeType, setActiveType] = useState<EmergencyType | null>(null)

  const filtered = activeType === null ? items : items.filter((c) => c.type === activeType)

  const COLUMNS: Column<EmergencyContact>[] = [
    {
      key: 'name',
      label: t('admin.emergency.columns.name'),
      sortable: true,
      render: (item) => (
        <span className="font-medium text-gray-900">{item.name.ru}</span>
      ),
    },
    {
      key: 'type',
      label: t('admin.emergency.columns.type'),
      sortable: true,
      width: '120px',
      render: (item) => (
        <span
          className={[
            'inline-block px-2 py-0.5 rounded-full text-xs font-semibold',
            TYPE_COLORS[item.type],
          ].join(' ')}
        >
          {t(`admin.emergency.types.${item.type}`)}
        </span>
      ),
    },
    {
      key: 'phone',
      label: t('admin.emergency.columns.phone'),
      sortable: true,
      width: '140px',
      render: (item) => (
        <span className="font-mono text-sm text-gray-700">{item.phone}</span>
      ),
    },
    {
      key: 'is24h',
      label: t('admin.emergency.columns.is24h'),
      width: '60px',
      render: (item) => (
        <span className={item.is24h ? 'text-green-600 font-semibold' : 'text-gray-400'}>
          {item.is24h ? '✓' : '✗'}
        </span>
      ),
    },
    {
      key: 'location',
      label: t('admin.emergency.columns.address'),
      render: (item) => (
        <span className="text-sm text-gray-600">{item.location.address.ru}</span>
      ),
    },
  ]

  return (
    <div className="flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">{t('admin.emergency.title')}</h1>
          <p className="text-sm text-gray-500 mt-0.5">{items.length} {t('admin.common.total')}</p>
        </div>
        <button
          onClick={() => navigate('/admin/emergency/new')}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 active:bg-blue-800 transition-colors"
        >
          <Plus size={16} />
          {t('admin.emergency.newButton')}
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
        {ALL_TYPES.map((type) => {
          const count = items.filter((c) => c.type === type).length
          const isActive = activeType === type
          return (
            <button
              key={type}
              onClick={() => setActiveType(isActive ? null : type)}
              className={[
                'px-3 py-1 rounded-full text-xs font-semibold border transition-colors',
                isActive
                  ? `${TYPE_COLORS[type]} border-current`
                  : 'bg-white text-gray-600 border-gray-300 hover:border-gray-400',
              ].join(' ')}
            >
              {t(`admin.emergency.types.${type}`)} ({count})
            </button>
          )
        })}
      </div>

      {/* Table */}
      {isLoading ? (
        <div className="py-16 text-center text-gray-400 text-sm">Loading…</div>
      ) : (
        <AdminTable<EmergencyContact>
          columns={COLUMNS}
          data={filtered}
          searchKeys={['name.ru', 'name.en', 'phone']}
          searchPlaceholder={t('admin.emergency.searchPlaceholder')}
          emptyMessage={t('admin.emergency.emptyMessage')}
          onEdit={(item) => navigate(`/admin/emergency/${item.id}`)}
          onDelete={(item) => remove(item.id)}
          getId={(item) => item.id}
        />
      )}
    </div>
  )
}
