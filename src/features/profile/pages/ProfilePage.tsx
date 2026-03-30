import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { useDataStore } from '@/data/stores/data-store'

function MenuItem({ icon, label, onClick, badge }: { icon: string; label: string; onClick: () => void; badge?: string }) {
  return (
    <button onClick={onClick} className="flex items-center gap-3 w-full px-4 py-3.5 bg-white border-b border-[var(--color-border)] text-left">
      <span className="text-xl w-8 text-center">{icon}</span>
      <span className="flex-1 text-sm font-medium">{label}</span>
      {badge && <span className="text-xs bg-[var(--color-primary)] text-white px-2 py-0.5 rounded-full">{badge}</span>}
      <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
      </svg>
    </button>
  )
}

export default function ProfilePage() {
  const { t, i18n } = useTranslation()
  const navigate = useNavigate()
  const collections = useDataStore((s) => s.collections)
  const favCount = collections.find((c) => c.id === 'favorites')?.poiIds.length || 0

  const toggleLang = () => {
    const newLang = i18n.language === 'ru' ? 'en' : 'ru'
    i18n.changeLanguage(newLang)
  }

  return (
    <div className="min-h-dvh bg-[var(--color-bg)]">
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-sm border-b border-[var(--color-border)]">
        <div className="flex items-center justify-center h-14 px-4">
          <h1 className="text-base font-bold">{t('profile.title')}</h1>
        </div>
      </header>

      {/* Avatar & Stats */}
      <div className="bg-white px-4 py-6 flex flex-col items-center border-b border-[var(--color-border)]">
        <div className="w-20 h-20 rounded-full bg-[var(--color-primary)] flex items-center justify-center text-white text-3xl font-bold mb-3">
          T
        </div>
        <h2 className="text-lg font-bold">Путешественник</h2>
        <div className="flex gap-6 mt-3">
          <div className="text-center">
            <p className="text-xl font-bold text-[var(--color-primary)]">{favCount}</p>
            <p className="text-xs text-[var(--color-text-secondary)]">Сохранено</p>
          </div>
          <div className="text-center">
            <p className="text-xl font-bold text-[var(--color-accent)]">0</p>
            <p className="text-xs text-[var(--color-text-secondary)]">{t('profile.visited')}</p>
          </div>
        </div>
      </div>

      {/* Menu */}
      <div className="mt-3 bg-white rounded-t-xl">
        <MenuItem icon="🌐" label={t('profile.language')} onClick={toggleLang} badge={i18n.language.toUpperCase()} />
        <MenuItem icon="⭐" label={t('subscription.title')} onClick={() => navigate('/subscription')} />
        <MenuItem icon="🚨" label={t('emergency.title')} onClick={() => navigate('/emergency')} />
        <MenuItem icon="🍽️" label="Еда и напитки" onClick={() => navigate('/food')} />
        <MenuItem icon="🗺️" label={t('tours.title')} onClick={() => navigate('/tours')} />
        <MenuItem icon="👤" label={t('guides.title')} onClick={() => navigate('/guides')} />
        <MenuItem icon="ℹ️" label={t('profile.about')} onClick={() => {}} />
      </div>

      <div className="text-center py-6 text-xs text-[var(--color-text-secondary)]">
        BROBROGID v1.0.0 • Владикавказ
      </div>
    </div>
  )
}
