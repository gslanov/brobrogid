import React from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useTranslation } from 'react-i18next'

const tabs = [
  { key: 'home', path: '/', icon: 'house' },
  { key: 'map', path: '/map', icon: 'map' },
  { key: 'tours', path: '/tours', icon: 'backpack' },
  { key: 'profile', path: '/profile', icon: 'user' },
] as const

const icons: Record<string, (active: boolean) => React.ReactNode> = {
  house: (a) => (
    <svg className="w-6 h-6" fill={a ? 'currentColor' : 'none'} viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12l8.954-8.955a1.126 1.126 0 011.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
    </svg>
  ),
  map: (a) => (
    <svg className="w-6 h-6" fill={a ? 'currentColor' : 'none'} viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 6.75V15m6-6v8.25m.503 3.498l4.875-2.437c.381-.19.622-.58.622-1.006V4.82c0-.836-.88-1.38-1.628-1.006l-3.869 1.934c-.317.159-.69.159-1.006 0L9.503 3.252a1.125 1.125 0 00-1.006 0L3.622 5.689C3.24 5.88 3 6.27 3 6.695V19.18c0 .836.88 1.38 1.628 1.006l3.869-1.934c.317-.159.69-.159 1.006 0l4.994 2.497c.317.158.69.158 1.006 0z" />
    </svg>
  ),
  backpack: (a) => (
    <svg className="w-6 h-6" fill={a ? 'currentColor' : 'none'} viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 6V3.75A2.25 2.25 0 0012.75 1.5h-1.5A2.25 2.25 0 009 3.75V6M6.75 6h10.5A2.25 2.25 0 0119.5 8.25v11.25a2.25 2.25 0 01-2.25 2.25H6.75a2.25 2.25 0 01-2.25-2.25V8.25A2.25 2.25 0 016.75 6zM9 14h6M9 17.5h6" />
    </svg>
  ),
  user: (a) => (
    <svg className="w-6 h-6" fill={a ? 'currentColor' : 'none'} viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
    </svg>
  ),
}

export function BottomTabs() {
  const navigate = useNavigate()
  const location = useLocation()
  const { t } = useTranslation()

  const handleTabClick = (path: string) => {
    const isActive = path === '/' ? location.pathname === '/' : location.pathname.startsWith(path)
    if (isActive) {
      window.scrollTo({ top: 0, behavior: 'smooth' })
    } else {
      navigate(path)
    }
  }

  return (
    <nav
      aria-label="Main navigation"
      className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-[var(--color-border)] shadow-sm"
      style={{ height: 'calc(var(--bottom-nav-height) + var(--safe-area-bottom))', paddingBottom: 'var(--safe-area-bottom)' }}
    >
      <div className="flex items-center justify-around h-[var(--bottom-nav-height)] max-w-lg mx-auto">
        {tabs.map((tab) => {
          const active = tab.path === '/'
            ? location.pathname === '/'
            : tab.path === '/profile'
              ? location.pathname === '/profile' || location.pathname.startsWith('/profile/')
              : location.pathname.startsWith(tab.path)
          return (
            <button
              key={tab.key}
              data-nav-tab
              onClick={() => handleTabClick(tab.path)}
              aria-current={active ? 'page' : undefined}
              className={`flex flex-col items-center justify-center gap-0.5 min-w-[48px] min-h-[48px] flex-1 h-full transition-colors ${active ? 'text-[var(--color-primary)]' : 'text-[var(--color-text-secondary)]'}`}
            >
              <div className={`relative flex items-center justify-center w-16 h-8 rounded-full transition-colors ${active ? 'bg-[var(--color-primary-light)]' : ''}`}>
                {icons[tab.icon](active)}
              </div>
              <span className="text-xs font-medium">{t(`tabs.${tab.key}`)}</span>
            </button>
          )
        })}
      </div>
    </nav>
  )
}
