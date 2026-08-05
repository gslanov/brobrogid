import { useNavigate } from 'react-router-dom'
import { resetScroll } from '@/shared/lib/utils'

interface PageHeaderProps {
  title: string
  showBack?: boolean
  right?: React.ReactNode
  /** Шапка поверх фото-обложки: без подложки и без орнаментального пояса */
  transparent?: boolean
}

export function PageHeader({ title, showBack = false, right, transparent = false }: PageHeaderProps) {
  const navigate = useNavigate()

  return (
    <header
      className="sticky top-0 z-40"
      style={
        transparent
          ? { background: 'transparent' }
          : {
              background: 'linear-gradient(180deg, rgba(26,31,40,0.97), rgba(1,2,4,0.66))',
              backdropFilter: 'blur(20px)',
              WebkitBackdropFilter: 'blur(20px)',
              boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.20), 0 8px 24px -12px #000',
            }
      }
    >
      <div className="flex items-center justify-between h-14 px-4">
        {showBack ? (
          <button
            onClick={() => { resetScroll(); navigate(-1) }}
            className="w-10 h-10 flex items-center justify-center -ml-2"
            style={{ color: 'var(--text)' }}
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
            </svg>
          </button>
        ) : (
          <div className="w-10" />
        )}
        <h1 className="text-[15.5px] font-bold truncate">{title}</h1>
        {right || <div className="w-10" />}
      </div>
      {/* Орнаментальный пояс вместо серой линии */}
      {!transparent && <div className="orn-belt" style={{ height: 3, opacity: 0.5 }} />}
    </header>
  )
}
