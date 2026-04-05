import { useEffect, useState } from 'react'
import { NavLink } from 'react-router-dom'
import {
  LayoutDashboard,
  MapPin,
  UtensilsCrossed,
  Route,
  Users,
  MessageSquare,
  Phone,
  Bus,
  Download,
} from 'lucide-react'
import { getDB } from '@/data/db'

interface NavCounts {
  pois: number
  menuItems: number
  tours: number
  guides: number
  reviews: number
  emergency: number
  transport: number
}

interface NavItem {
  label: string
  to: string
  icon: React.ReactNode
  countKey?: keyof NavCounts
}

const navItems: NavItem[] = [
  { label: 'Dashboard', to: '/admin', icon: <LayoutDashboard size={18} /> },
  { label: 'POIs', to: '/admin/pois', icon: <MapPin size={18} />, countKey: 'pois' },
  { label: 'Menu Items', to: '/admin/menu-items', icon: <UtensilsCrossed size={18} />, countKey: 'menuItems' },
  { label: 'Tours', to: '/admin/tours', icon: <Route size={18} />, countKey: 'tours' },
  { label: 'Guides', to: '/admin/guides', icon: <Users size={18} />, countKey: 'guides' },
  { label: 'Reviews', to: '/admin/reviews', icon: <MessageSquare size={18} />, countKey: 'reviews' },
  { label: 'Emergency', to: '/admin/emergency', icon: <Phone size={18} />, countKey: 'emergency' },
  { label: 'Transport', to: '/admin/transport', icon: <Bus size={18} />, countKey: 'transport' },
]

const bottomItems: NavItem[] = [
  { label: 'Export', to: '/admin/export', icon: <Download size={18} /> },
]

export function AdminSidebar() {
  const [counts, setCounts] = useState<NavCounts>({
    pois: 0,
    menuItems: 0,
    tours: 0,
    guides: 0,
    reviews: 0,
    emergency: 0,
    transport: 0,
  })

  useEffect(() => {
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
        console.error('AdminSidebar: failed to load counts', err)
      }
    }
    loadCounts()
  }, [])

  const linkClass = ({ isActive }: { isActive: boolean }) =>
    [
      'flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors relative',
      isActive
        ? 'bg-gray-800 text-white before:absolute before:left-0 before:top-2 before:bottom-2 before:w-0.5 before:bg-[#E85D26] before:rounded-full'
        : 'text-gray-400 hover:bg-gray-800 hover:text-white',
    ].join(' ')

  return (
    <aside className="flex flex-col h-full w-64 bg-gray-900 flex-shrink-0">
      {/* Logo */}
      <div className="px-5 py-6 border-b border-gray-800">
        <div className="text-[#E85D26] font-black text-xl tracking-wide">BROBROGID</div>
        <div className="text-gray-500 text-xs mt-0.5 uppercase tracking-widest">Admin Panel</div>
      </div>

      {/* Main nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === '/admin'}
            className={linkClass}
          >
            <span className="flex-shrink-0">{item.icon}</span>
            <span className="flex-1">{item.label}</span>
            {item.countKey != null && counts[item.countKey] > 0 && (
              <span className="ml-auto bg-gray-700 text-gray-300 text-xs font-medium px-2 py-0.5 rounded-full min-w-[24px] text-center">
                {counts[item.countKey]}
              </span>
            )}
          </NavLink>
        ))}

        {/* Separator */}
        <div className="my-3 border-t border-gray-800" />

        {bottomItems.map((item) => (
          <NavLink key={item.to} to={item.to} className={linkClass}>
            <span className="flex-shrink-0">{item.icon}</span>
            <span className="flex-1">{item.label}</span>
          </NavLink>
        ))}
      </nav>

      {/* Footer */}
      <div className="px-5 py-4 border-t border-gray-800">
        <div className="text-gray-600 text-xs">v3 · IDB</div>
      </div>
    </aside>
  )
}
