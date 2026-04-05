import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { useDataStore } from '@/data/stores/data-store'
import { Globe, Heart, Info, Siren, Star, Bell, Clock, MessageCircle } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

function SectionLabel({ label }: { label: string }) {
  return (
    <div className="px-4 pt-5 pb-1.5">
      <span className="text-xs font-semibold text-[var(--color-text-secondary)] uppercase tracking-wide">{label}</span>
    </div>
  )
}

function MenuItem({ icon: Icon, label, onClick, badge, showChevron = true }: { icon: LucideIcon; label: string; onClick: () => void; badge?: string; badgeVariant?: 'primary' | 'muted'; showChevron?: boolean }) {
  return (
    <button onClick={onClick} className="flex items-center gap-3 w-full px-4 py-3.5 bg-white border-b border-[var(--color-border)] text-left">
      <span className="w-8 flex items-center justify-center text-[var(--color-text-secondary)]"><Icon size={20} /></span>
      <span className="flex-1 text-sm font-medium">{label}</span>
      {badge && <span className="text-xs bg-[var(--color-primary)] text-white px-2 py-0.5 rounded-full">{badge}</span>}
      {showChevron && (
        <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
        </svg>
      )}
    </button>
  )
}

function LangToggle({ currentLang, onToggle }: { currentLang: string; onToggle: () => void }) {
  return (
    <button onClick={onToggle} className="flex items-center gap-3 w-full px-4 py-3.5 bg-white border-b border-[var(--color-border)] text-left">
      <span className="w-8 flex items-center justify-center text-[var(--color-text-secondary)]"><Globe size={20} /></span>
      <span className="flex-1 text-sm font-medium">{currentLang === 'ru' ? 'Язык' : 'Language'}</span>
      <div className="flex items-center bg-gray-100 rounded-full p-0.5">
        <span className={`px-2.5 py-1 rounded-full text-xs font-semibold transition-colors ${currentLang === 'ru' ? 'bg-[var(--color-primary)] text-white' : 'text-[var(--color-text-secondary)]'}`}>RU</span>
        <span className={`px-2.5 py-1 rounded-full text-xs font-semibold transition-colors ${currentLang === 'en' ? 'bg-[var(--color-primary)] text-white' : 'text-[var(--color-text-secondary)]'}`}>EN</span>
      </div>
    </button>
  )
}

export default function ProfilePage() {
  const { t, i18n } = useTranslation()
  const navigate = useNavigate()
  const collections = useDataStore((s) => s.collections)
  const setLanguage = useDataStore((s) => s.setLanguage)
  const favCount = collections.find((c) => c.id === 'favorites')?.poiIds.length || 0
  const [showAbout, setShowAbout] = useState(false)

  const toggleLang = () => {
    const newLang = i18n.language === 'ru' ? 'en' : 'ru'
    i18n.changeLanguage(newLang)
    setLanguage(newLang)
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
        <h2 className="text-lg font-bold">{t('profile.traveler', 'Путешественник')}</h2>
        <div className="flex gap-6 mt-3">
          <div className="text-center">
            <p className="text-xl font-bold text-[var(--color-primary)]">{favCount}</p>
            <p className="text-xs text-[var(--color-text-secondary)]">{t('saved.title')}</p>
          </div>
          <div className="text-center">
            <p className="text-xl font-bold text-[var(--color-accent)]">0</p>
            <p className="text-xs text-[var(--color-text-secondary)]">{t('profile.visited')}</p>
          </div>
        </div>
      </div>

      {/* Section: My */}
      <SectionLabel label={t('profile.sectionMy')} />
      <div className="bg-white">
        <MenuItem icon={Heart} label={t('saved.title')} onClick={() => navigate('/profile/saved')} badge={favCount > 0 ? String(favCount) : undefined} />
        <MenuItem icon={Clock} label={t('profile.orderHistory')} onClick={() => {}} badge={t('profile.comingSoon')} showChevron={false} />
      </div>

      {/* Section: Settings */}
      <SectionLabel label={t('profile.sectionSettings')} />
      <div className="bg-white">
        <LangToggle currentLang={i18n.language} onToggle={toggleLang} />
        <MenuItem icon={Star} label={t('subscription.title')} onClick={() => navigate('/profile/subscription')} />
        <MenuItem icon={Bell} label={t('profile.notifications')} onClick={() => {}} badge={t('profile.comingSoon')} showChevron={false} />
      </div>

      {/* Section: Help */}
      <SectionLabel label={t('profile.sectionHelp')} />
      <div className="bg-white">
        <MenuItem icon={Siren} label={t('emergency.title')} onClick={() => navigate('/emergency')} />
        <MenuItem icon={Info} label={t('profile.about')} onClick={() => setShowAbout(true)} />
        <MenuItem icon={MessageCircle} label={t('profile.feedback')} onClick={() => {}} badge={t('profile.comingSoon')} showChevron={false} />
      </div>

      <div className="text-center py-6 text-xs text-[var(--color-text-secondary)]">
        BROBROGID v1.0.0
      </div>

      {/* About modal */}
      {showAbout && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={() => setShowAbout(false)}>
          <div className="bg-white rounded-2xl mx-6 p-6 max-w-sm w-full shadow-xl" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-lg font-bold text-center mb-4">{t('profile.about')}</h2>
            <div className="text-center text-sm text-[var(--color-text-secondary)] space-y-1">
              <p className="text-base font-bold text-[var(--color-text)]">BROBROGID v1.0.0</p>
              <p>Путеводитель по Северной Осетии</p>
              <p>Владикавказ и окрестности</p>
              <p className="pt-3">&copy; 2026 BROBROGID</p>
            </div>
            <button
              onClick={() => setShowAbout(false)}
              className="w-full mt-5 py-2.5 bg-[var(--color-primary)] text-white rounded-xl font-medium text-sm"
            >
              {t('common.close')}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
