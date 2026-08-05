import React from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { motion } from 'framer-motion'
import { resetScroll } from '@/shared/lib/utils'

const tabs = [
  { key: 'home', path: '/', icon: 'house' },
  { key: 'map', path: '/map', icon: 'map' },
  { key: 'afisha', path: '/afisha', icon: 'calendar' },
  { key: 'sos', path: '/emergency', icon: 'sos' },
  { key: 'profile', path: '/profile', icon: 'user' },
] as const

const icons: Record<string, (active: boolean) => React.ReactNode> = {
  house: (a) => (
    <svg className="w-[22px] h-[22px]" fill={a ? 'currentColor' : 'none'} viewBox="0 0 24 24" strokeWidth={1.6} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12l8.954-8.955a1.126 1.126 0 011.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
    </svg>
  ),
  map: (a) => (
    <svg className="w-[22px] h-[22px]" fill={a ? 'currentColor' : 'none'} viewBox="0 0 24 24" strokeWidth={1.6} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 6.75V15m6-6v8.25m.503 3.498l4.875-2.437c.381-.19.622-.58.622-1.006V4.82c0-.836-.88-1.38-1.628-1.006l-3.869 1.934c-.317.159-.69.159-1.006 0L9.503 3.252a1.125 1.125 0 00-1.006 0L3.622 5.689C3.24 5.88 3 6.27 3 6.695V19.18c0 .836.88 1.38 1.628 1.006l3.869-1.934c.317-.159.69-.159 1.006 0l4.994 2.497c.317.158.69.158 1.006 0z" />
    </svg>
  ),
  sos: () => (
    <svg className="w-[22px] h-[22px]" fill="none" viewBox="0 0 24 24" strokeWidth={1.6} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
    </svg>
  ),
  calendar: (a) => (
    <svg className="w-6 h-6" fill={a ? 'currentColor' : 'none'} viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
    </svg>
  ),
  user: (a) => (
    <svg className="w-[22px] h-[22px]" fill={a ? 'currentColor' : 'none'} viewBox="0 0 24 24" strokeWidth={1.6} stroke="currentColor">
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
      const el = document.getElementById('scroll-root')
      if (el) el.scrollTo({ top: 0, behavior: 'smooth' })
    } else {
      resetScroll()
      navigate(path)
    }
  }

  return (
    <nav
      aria-label="Main navigation"
      className="fixed bottom-0 left-0 right-0 z-50 glass-strong"
      style={{
        height: 'calc(var(--bottom-nav-height) + var(--safe-area-bottom))',
        paddingBottom: 'var(--safe-area-bottom)',
        background: 'linear-gradient(180deg, rgba(18,23,31,0.72), rgba(0,1,2,1))',
        backdropFilter: 'blur(22px)',
        WebkitBackdropFilter: 'blur(22px)',
        boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.20)',
        borderTop: 'none',
      }}
    >
      {/* Орнаментальная линия вместо обычного бордюра */}
      <div
        className="absolute top-0 left-0 right-0 h-[1.5px] opacity-35"
        style={{ background: 'var(--orn-dash)' }}
      />

      <div className="flex items-center justify-around h-[var(--bottom-nav-height)] max-w-lg mx-auto">
        {tabs.map((tab) => {
          const active = tab.path === '/'
            ? location.pathname === '/'
            : tab.path === '/profile'
              ? location.pathname === '/profile' || location.pathname.startsWith('/profile/')
              : location.pathname.startsWith(tab.path)

          const isSos = tab.key === 'sos'
          const activeColor = isSos ? 'var(--danger)' : 'var(--terra-hot)'

          return (
            <button
              key={tab.key}
              data-nav-tab
              onClick={() => handleTabClick(tab.path)}
              aria-current={active ? 'page' : undefined}
              className="relative flex flex-col items-center justify-center gap-1 min-w-[48px] min-h-[48px] flex-1 h-full"
              style={{ color: active ? activeColor : 'var(--text-3)' }}
            >
              <div className="relative flex items-center justify-center w-11 h-8">
                {/* Ромб-подложка активной вкладки — плавно переезжает между вкладками */}
                {active && (
                  <motion.span
                    layoutId="tab-diamond"
                    transition={{ type: 'spring', stiffness: 420, damping: 32 }}
                    className="absolute w-7 h-7 diamond"
                    style={{
                      background: isSos ? 'rgba(217,83,79,0.16)' : 'var(--terra-tint)',
                      border: `1.5px solid ${isSos ? 'rgba(217,83,79,0.5)' : 'var(--terra-line)'}`,
                      boxShadow: `0 0 20px ${isSos ? 'rgba(217,83,79,0.35)' : 'var(--terra-glow)'}`,
                    }}
                  />
                )}
                <span className="relative z-10 transition-transform duration-200">
                  {icons[tab.icon](active)}
                </span>
              </div>
              <span
                className="text-[10.5px] font-medium tracking-wide transition-opacity"
                style={{ opacity: active ? 1 : 0.75 }}
              >
                {t(`tabs.${tab.key}`)}
              </span>
            </button>
          )
        })}
      </div>
    </nav>
  )
}
