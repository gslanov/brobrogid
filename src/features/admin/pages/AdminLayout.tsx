import { Outlet, useLocation, Link } from 'react-router-dom'
import { AdminSidebar } from '../components/AdminSidebar'
import { Home } from 'lucide-react'

const BREADCRUMB_MAP: Record<string, string> = {
  '/admin': 'Dashboard',
  '/admin/pois': 'POIs',
  '/admin/menu-items': 'Menu Items',
  '/admin/tours': 'Tours',
  '/admin/guides': 'Guides',
  '/admin/reviews': 'Reviews',
  '/admin/emergency': 'Emergency',
  '/admin/transport': 'Transport',
  '/admin/export': 'Export',
}

function Breadcrumbs() {
  const location = useLocation()
  const pathname = location.pathname.replace(/\/$/, '')
  const current = BREADCRUMB_MAP[pathname]

  return (
    <nav className="flex items-center gap-2 text-sm text-gray-400" aria-label="Breadcrumb">
      <Link
        to="/admin"
        className="flex items-center gap-1 hover:text-gray-700 transition-colors"
      >
        <Home size={14} />
        <span>Admin</span>
      </Link>
      {current && current !== 'Dashboard' && (
        <>
          <span className="text-gray-300">/</span>
          <span className="text-gray-700 font-medium">{current}</span>
        </>
      )}
    </nav>
  )
}

export default function AdminLayout() {
  return (
    <div className="flex h-screen w-screen overflow-hidden bg-gray-50">
      {/* Sidebar */}
      <AdminSidebar />

      {/* Main area */}
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        {/* Top header */}
        <header className="flex-shrink-0 h-14 bg-white border-b border-gray-200 flex items-center justify-between px-6">
          <div className="flex items-center gap-4">
            <h1 className="text-base font-semibold text-gray-900">BROBROGID Admin</h1>
            <span className="text-gray-300">·</span>
            <Breadcrumbs />
          </div>
          <div className="flex items-center gap-3">
            <Link
              to="/"
              className="text-xs text-gray-400 hover:text-gray-700 transition-colors px-3 py-1.5 rounded-md hover:bg-gray-100"
            >
              ← Back to App
            </Link>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
