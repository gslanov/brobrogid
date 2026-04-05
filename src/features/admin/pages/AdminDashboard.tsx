import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  MapPin,
  UtensilsCrossed,
  Route,
  Users,
  MessageSquare,
  Phone,
  Bus,
  Download,
  RefreshCw,
  ArrowRight,
  Database,
} from 'lucide-react'
import { getDB } from '@/data/db'

interface Counts {
  pois: number
  menuItems: number
  tours: number
  guides: number
  reviews: number
  emergency: number
  transport: number
}

interface EntityCard {
  label: string
  key: keyof Counts
  icon: React.ReactNode
  to: string
  color: string
  bgColor: string
}

const ENTITY_CARDS: EntityCard[] = [
  {
    label: 'Points of Interest',
    key: 'pois',
    icon: <MapPin size={22} />,
    to: '/admin/pois',
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
  },
  {
    label: 'Menu Items',
    key: 'menuItems',
    icon: <UtensilsCrossed size={22} />,
    to: '/admin/menu-items',
    color: 'text-amber-600',
    bgColor: 'bg-amber-50',
  },
  {
    label: 'Tours',
    key: 'tours',
    icon: <Route size={22} />,
    to: '/admin/tours',
    color: 'text-green-600',
    bgColor: 'bg-green-50',
  },
  {
    label: 'Guides',
    key: 'guides',
    icon: <Users size={22} />,
    to: '/admin/guides',
    color: 'text-purple-600',
    bgColor: 'bg-purple-50',
  },
  {
    label: 'Reviews',
    key: 'reviews',
    icon: <MessageSquare size={22} />,
    to: '/admin/reviews',
    color: 'text-pink-600',
    bgColor: 'bg-pink-50',
  },
  {
    label: 'Emergency Contacts',
    key: 'emergency',
    icon: <Phone size={22} />,
    to: '/admin/emergency',
    color: 'text-red-600',
    bgColor: 'bg-red-50',
  },
  {
    label: 'Transport Routes',
    key: 'transport',
    icon: <Bus size={22} />,
    to: '/admin/transport',
    color: 'text-teal-600',
    bgColor: 'bg-teal-50',
  },
]

export default function AdminDashboard() {
  const [counts, setCounts] = useState<Counts>({
    pois: 0,
    menuItems: 0,
    tours: 0,
    guides: 0,
    reviews: 0,
    emergency: 0,
    transport: 0,
  })
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  async function loadCounts() {
    try {
      const db = await getDB()
      const [pois, menuItems, tours, guides, reviews, emergency, transport] = await Promise.all([
        db.count('pois'),
        db.count('menuItems'),
        db.count('tours'),
        db.count('guides'),
        db.count('reviews'),
        db.count('emergency'),
        db.count('transport'),
      ])
      setCounts({ pois, menuItems, tours, guides, reviews, emergency, transport })
    } catch (err) {
      console.error('AdminDashboard: failed to load counts', err)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => {
    loadCounts()
  }, [])

  async function handleExport() {
    try {
      const db = await getDB()
      const [pois, menuItems, tours, guides, reviews, emergency, transport] = await Promise.all([
        db.getAll('pois'),
        db.getAll('menuItems'),
        db.getAll('tours'),
        db.getAll('guides'),
        db.getAll('reviews'),
        db.getAll('emergency'),
        db.getAll('transport'),
      ])
      const data = { pois, menuItems, tours, guides, reviews, emergency, transport, exportedAt: new Date().toISOString() }
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `brobrogid-export-${Date.now()}.json`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    } catch (err) {
      console.error('Export failed', err)
    }
  }

  function handleRefresh() {
    setRefreshing(true)
    loadCounts()
  }

  const total = Object.values(counts).reduce((acc, n) => acc + n, 0)

  return (
    <div className="p-8 max-w-6xl mx-auto">
      {/* Page title */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900">Dashboard</h2>
        <p className="text-sm text-gray-500 mt-1">
          Overview of all content in the BROBROGID database.
        </p>
      </div>

      {/* Summary strip */}
      <div className="mb-8 flex items-center gap-3 bg-white border border-gray-200 rounded-xl px-5 py-4">
        <Database size={20} className="text-gray-400" />
        <span className="text-sm text-gray-600">
          Total records in IDB:
        </span>
        <span className="font-bold text-gray-900 text-lg">
          {loading ? '—' : total}
        </span>
      </div>

      {/* Entity cards grid */}
      <div className="grid grid-cols-3 gap-5 mb-10">
        {ENTITY_CARDS.map((card) => (
          <div
            key={card.key}
            className="bg-white rounded-xl border border-gray-200 p-5 flex flex-col gap-4 hover:shadow-md transition-shadow"
          >
            {/* Icon + count */}
            <div className="flex items-start justify-between">
              <div className={`${card.bgColor} ${card.color} p-3 rounded-lg`}>
                {card.icon}
              </div>
              <span className="text-3xl font-bold text-gray-900">
                {loading ? (
                  <span className="inline-block w-8 h-8 bg-gray-100 rounded animate-pulse" />
                ) : (
                  counts[card.key]
                )}
              </span>
            </div>

            {/* Label + link */}
            <div>
              <div className="text-sm font-medium text-gray-700">{card.label}</div>
              <Link
                to={card.to}
                className={`inline-flex items-center gap-1 text-xs font-medium mt-2 ${card.color} hover:underline`}
              >
                Manage <ArrowRight size={12} />
              </Link>
            </div>
          </div>
        ))}
      </div>

      {/* Quick actions */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-4">
          Quick Actions
        </h3>
        <div className="flex items-center gap-3">
          <button
            onClick={handleExport}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#E85D26] hover:bg-[#d4531f] text-white text-sm font-medium rounded-lg transition-colors"
          >
            <Download size={16} />
            Export All Data
          </button>
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-medium rounded-lg transition-colors disabled:opacity-50"
          >
            <RefreshCw size={16} className={refreshing ? 'animate-spin' : ''} />
            Refresh Data
          </button>
          <Link
            to="/admin/export"
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-medium rounded-lg transition-colors"
          >
            <ArrowRight size={16} />
            Export Options
          </Link>
        </div>
      </div>
    </div>
  )
}
