import { Outlet, useLocation, Link, Navigate, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { AdminSidebar } from '../components/AdminSidebar'
import { LanguageToggle } from '../components/LanguageToggle'
import { Home, LogOut } from 'lucide-react'
import { getSession, isAuthenticated, clearSession } from '../lib/auth'

const BREADCRUMB_KEYS: Record<string, string> = {
  '/admin': 'admin.sidebar.dashboard',
  '/admin/pois': 'admin.sidebar.pois',
  '/admin/menu-items': 'admin.sidebar.menuItems',
  '/admin/tours': 'admin.sidebar.tours',
  '/admin/guides': 'admin.sidebar.guides',
  '/admin/reviews': 'admin.sidebar.reviews',
  '/admin/emergency': 'admin.sidebar.emergency',
  '/admin/transport': 'admin.sidebar.transport',
  '/admin/export': 'admin.sidebar.export',
}

function Breadcrumbs() {
  const { t } = useTranslation()
  const location = useLocation()
  const pathname = location.pathname.replace(/\/$/, '')
  const currentKey = BREADCRUMB_KEYS[pathname]

  return (
    <nav className="flex items-center gap-2 text-sm text-gray-400" aria-label="Breadcrumb">
      <Link
        to="/admin"
        className="flex items-center gap-1 hover:text-gray-700 transition-colors"
      >
        <Home size={14} />
        <span>{t('admin.layout.admin', 'Админ')}</span>
      </Link>
      {currentKey && currentKey !== 'admin.sidebar.dashboard' && (
        <>
          <span className="text-gray-300">/</span>
          <span className="text-gray-700 font-medium">{t(currentKey)}</span>
        </>
      )}
    </nav>
  )
}

export default function AdminLayout() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const session = getSession()

  if (!session || !isAuthenticated()) {
    return <Navigate to="/admin/login" replace />
  }

  function handleLogout() {
    clearSession()
    navigate('/admin/login', { replace: true })
  }

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-gray-50">
      {/* Sidebar */}
      <AdminSidebar />

      {/* Main area */}
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        {/* Top header */}
        <header className="flex-shrink-0 h-14 bg-white border-b border-gray-200 flex items-center justify-between px-6">
          <div className="flex items-center gap-4">
            <h1 className="text-base font-semibold text-gray-900">{t('admin.layout.title')}</h1>
            <span className="text-gray-300">·</span>
            <Breadcrumbs />
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs text-gray-500 font-medium">{session.username}</span>
            <LanguageToggle />
            <Link
              to="/"
              className="text-xs text-gray-400 hover:text-gray-700 transition-colors px-3 py-1.5 rounded-md hover:bg-gray-100"
            >
              {t('admin.layout.backToApp')}
            </Link>
            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-red-600 transition-colors px-3 py-1.5 rounded-md hover:bg-red-50"
            >
              <LogOut size={13} />
              {t('admin.layout.logout')}
            </button>
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
