import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus } from 'lucide-react'
import { useAdminData } from '../hooks/useAdminData'
import AdminTable, { type Column } from '../components/AdminTable'
import type { TransportRoute } from '@/data/types'

type TransportType = TransportRoute['type']

const TYPE_LABELS: Record<TransportType, string> = {
  bus: 'Bus',
  marshrutka: 'Marshrutka',
  trolleybus: 'Trolleybus',
}

const TYPE_COLORS: Record<TransportType, string> = {
  bus: 'bg-blue-100 text-blue-700',
  marshrutka: 'bg-amber-100 text-amber-700',
  trolleybus: 'bg-purple-100 text-purple-700',
}

const ALL_TYPES: TransportType[] = ['bus', 'marshrutka', 'trolleybus']

const COLUMNS: Column<TransportRoute>[] = [
  {
    key: 'number',
    label: 'No.',
    sortable: true,
    width: '72px',
    render: (item) => (
      <span className="font-mono font-semibold text-gray-900">{item.number}</span>
    ),
  },
  {
    key: 'name',
    label: 'Name',
    sortable: true,
    render: (item) => (
      <span className="font-medium text-gray-900">{item.name.ru}</span>
    ),
  },
  {
    key: 'type',
    label: 'Type',
    sortable: true,
    width: '120px',
    render: (item) => (
      <span
        className={[
          'inline-block px-2 py-0.5 rounded-full text-xs font-semibold',
          TYPE_COLORS[item.type],
        ].join(' ')}
      >
        {TYPE_LABELS[item.type]}
      </span>
    ),
  },
  {
    key: 'stops',
    label: 'Stops',
    width: '80px',
    render: (item) => (
      <span className="text-sm text-gray-600">{item.stops.length}</span>
    ),
  },
  {
    key: 'color',
    label: 'Color',
    width: '80px',
    render: (item) => (
      <div className="flex items-center gap-2">
        <span
          className="w-5 h-5 rounded border border-gray-200 flex-shrink-0"
          style={{ backgroundColor: item.color || '#cccccc' }}
        />
        <span className="text-xs font-mono text-gray-500">{item.color}</span>
      </div>
    ),
  },
]

export default function AdminTransportList() {
  const navigate = useNavigate()
  const { items, isLoading, remove } = useAdminData<TransportRoute>('transport')
  const [activeType, setActiveType] = useState<TransportType | null>(null)

  const filtered = activeType === null ? items : items.filter((r) => r.type === activeType)

  return (
    <div className="flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">Transport Routes</h1>
          <p className="text-sm text-gray-500 mt-0.5">{items.length} total</p>
        </div>
        <button
          onClick={() => navigate('/admin/transport/new')}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 active:bg-blue-800 transition-colors"
        >
          <Plus size={16} />
          New Route
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
          const count = items.filter((r) => r.type === type).length
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
              {TYPE_LABELS[type]} ({count})
            </button>
          )
        })}
      </div>

      {/* Table */}
      {isLoading ? (
        <div className="py-16 text-center text-gray-400 text-sm">Loading…</div>
      ) : (
        <AdminTable<TransportRoute>
          columns={COLUMNS}
          data={filtered}
          searchKeys={['number', 'name.ru', 'name.en']}
          searchPlaceholder="Search routes…"
          emptyMessage="No transport routes found."
          onEdit={(item) => navigate(`/admin/transport/${item.id}`)}
          onDelete={(item) => remove(item.id)}
          getId={(item) => item.id}
        />
      )}
    </div>
  )
}
