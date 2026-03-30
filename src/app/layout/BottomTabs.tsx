import React from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useTranslation } from 'react-i18next'

const tabs = [
  { key: 'explore', path: '/', icon: 'compass' },
  { key: 'map', path: '/map', icon: 'map' },
  { key: 'saved', path: '/saved', icon: 'heart' },
  { key: 'profile', path: '/profile', icon: 'user' },
] as const

const icons: Record<string, (active: boolean) => React.ReactNode> = {
  compass: (a) => (
    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" strokeWidth={a ? 2.5 : 1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1.5 15l-4-4 4-4v3h5v2h-5v3z" />
      <circle cx="12" cy="12" r="9" fill="none" />
      <polygon points="14.5,9.5 9.5,11.5 9.5,14.5 14.5,12.5" fill={a ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="1.5" />
    </svg>
  ),
  map: (a) => (
    <svg className="w-6 h-6" fill={a ? 'currentColor' : 'none'} viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 6.75V15m6-6v8.25m.503 3.498l4.875-2.437c.381-.19.622-.58.622-1.006V4.82c0-.836-.88-1.38-1.628-1.006l-3.869 1.934c-.317.159-.69.159-1.006 0L9.503 3.252a1.125 1.125 0 00-1.006 0L3.622 5.689C3.24 5.88 3 6.27 3 6.695V19.18c0 .836.88 1.38 1.628 1.006l3.869-1.934c.317-.159.69-.159 1.006 0l4.994 2.497c.317.158.69.158 1.006 0z" />
    </svg>
  ),
  heart: (a) => (
    <svg className="w-6 h-6" fill={a ? 'currentColor' : 'none'} viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
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

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-[var(--color-border)]" style={{ height: 'calc(var(--bottom-nav-height) + var(--safe-area-bottom))', paddingBottom: 'var(--safe-area-bottom)' }}>
      <div className="flex items-center justify-around h-[var(--bottom-nav-height)] max-w-lg mx-auto">
        {tabs.map((tab) => {
          const active = tab.path === '/' ? location.pathname === '/' : location.pathname.startsWith(tab.path)
          return (
            <button
              key={tab.key}
              onClick={() => navigate(tab.path)}
              className={`flex flex-col items-center justify-center gap-0.5 flex-1 h-full transition-colors ${active ? 'text-[var(--color-primary)]' : 'text-[var(--color-text-secondary)]'}`}
            >
              {icons[tab.icon](active)}
              <span className="text-[10px] font-medium">{t(`tabs.${tab.key}`)}</span>
            </button>
          )
        })}
      </div>
    </nav>
  )
}
