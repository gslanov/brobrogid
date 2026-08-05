import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { useDataStore } from '@/data/stores/data-store'
import { Globe, Heart, Info, Siren, Star, Bell, Clock, MessageCircle, Navigation, Phone } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { fetchStats } from '@/shared/lib/tracking'
import type { TrackStats } from '@/shared/lib/tracking'

/** Общий фон для строк меню — карточка на тёмной поверхности */
const rowStyle: React.CSSProperties = {
  background: 'var(--surface-1)',
  borderBottom: '1px solid var(--color-border)',
}

function SectionLabel({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-2.5 px-4 pt-6 pb-2">
      <i className="w-[6px] h-[6px] diamond" style={{ background: 'var(--terra)' }} />
      <span className="text-[11px] font-semibold uppercase tracking-[0.14em]" style={{ color: 'var(--text-3)' }}>
        {label}
      </span>
      <span className="orn-tail" />
    </div>
  )
}

function MenuItem({ icon: Icon, label, onClick, badge, showChevron = true }: { icon: LucideIcon; label: string; onClick: () => void; badge?: string; badgeVariant?: 'primary' | 'muted'; showChevron?: boolean }) {
  return (
    <button onClick={onClick} className="flex items-center gap-3 w-full px-4 py-3.5 text-left" style={rowStyle}>
      <span className="w-8 flex items-center justify-center" style={{ color: 'var(--terra)' }}><Icon size={19} /></span>
      <span className="flex-1 text-[13.5px] font-medium">{label}</span>
      {badge && (
        <span
          className="text-[11px] px-2 py-0.5 rounded-full font-semibold"
          style={{ background: 'var(--terra-tint)', color: 'var(--terra-hot)', border: '1px solid var(--terra-line)' }}
        >
          {badge}
        </span>
      )}
      {showChevron && (
        <svg className="w-4 h-4" style={{ color: 'var(--text-3)' }} fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
        </svg>
      )}
    </button>
  )
}

function LangToggle({ currentLang, onToggle }: { currentLang: string; onToggle: () => void }) {
  const pill = (active: boolean): React.CSSProperties => ({
    background: active ? 'var(--terra-hot)' : 'transparent',
    color: active ? 'var(--text-on-terra)' : 'var(--text-3)',
  })
  return (
    <button onClick={onToggle} className="flex items-center gap-3 w-full px-4 py-3.5 text-left" style={rowStyle}>
      <span className="w-8 flex items-center justify-center" style={{ color: 'var(--terra)' }}><Globe size={19} /></span>
      <span className="flex-1 text-[13.5px] font-medium">{currentLang === 'ru' ? 'Язык' : 'Language'}</span>
      <div className="flex items-center rounded-full p-0.5" style={{ background: 'var(--surface-3)' }}>
        <span className="px-2.5 py-1 rounded-full text-[11px] font-semibold transition-colors" style={pill(currentLang === 'ru')}>RU</span>
        <span className="px-2.5 py-1 rounded-full text-[11px] font-semibold transition-colors" style={pill(currentLang === 'en')}>EN</span>
      </div>
    </button>
  )
}

function StatsSection({ lang }: { lang: 'ru' | 'en' }) {
  const pois = useDataStore((s) => s.pois)
  const [stats, setStats] = useState<TrackStats>({ directions: {}, calls: {} })

  useEffect(() => {
    fetchStats().then(setStats)
  }, [])

  /**
   * Статистика хранится по внутренним номерам мест и переживает их удаление.
   * Записи об удалённых местах отбрасываем целиком — показывать голый `poi-119`
   * бессмысленно, а в итоговых счётчиках они ломали бы сходимость с списком.
   */
  const live = (counts: Record<string, number>) =>
    Object.entries(counts).filter(([id]) => pois.some((p) => p.id === id))

  const top = (counts: Record<string, number>, limit = 50) =>
    live(counts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, limit)
      .map(([id, count]) => ({
        count,
        name: pois.find((p) => p.id === id)!.name[lang],
      }))

  const sum = (counts: Record<string, number>) =>
    live(counts).reduce((acc, [, n]) => acc + n, 0)

  const totalDirections = sum(stats.directions)
  const totalCalls = sum(stats.calls)

  if (totalDirections === 0 && totalCalls === 0) return null

  return (
    <div className="mt-2">
      <SectionLabel label="Аналитика" />
      <div style={{ background: 'var(--surface-1)', borderBottom: '1px solid var(--color-border)' }}>
        {/* Итоги */}
        <div className="flex" style={{ borderBottom: '1px solid var(--color-border)' }}>
          <div className="flex-1 py-4 flex flex-col items-center gap-1">
            <Navigation size={17} style={{ color: 'var(--terra-hot)' }} />
            <p className="text-[20px] font-bold" style={{ color: 'var(--terra-hot)' }}>{totalDirections}</p>
            <p className="text-[11px]" style={{ color: 'var(--text-3)' }}>Маршрутов</p>
          </div>
          <div className="w-px" style={{ background: 'var(--color-border)' }} />
          <div className="flex-1 py-4 flex flex-col items-center gap-1">
            <Phone size={17} style={{ color: 'var(--moss-light)' }} />
            <p className="text-[20px] font-bold" style={{ color: 'var(--moss-light)' }}>{totalCalls}</p>
            <p className="text-[11px]" style={{ color: 'var(--text-3)' }}>Звонков</p>
          </div>
        </div>

        {/* Top by directions */}
        {top(stats.directions).length > 0 && (
          <div className="px-4 py-3" style={{ borderBottom: '1px solid var(--color-border)' }}>
            <p className="text-[11px] font-semibold mb-2 flex items-center gap-1.5" style={{ color: 'var(--text-3)' }}>
              <Navigation size={11} /> Топ по маршрутам
            </p>
            {top(stats.directions).map(({ name, count }, i) => (
              <div key={i} className="flex items-center justify-between py-1">
                <span className="text-[13px] truncate flex-1" style={{ color: 'var(--text-2)' }}>{i + 1}. {name}</span>
                <span className="text-[13px] font-semibold ml-2" style={{ color: 'var(--terra-hot)' }}>{count}</span>
              </div>
            ))}
          </div>
        )}

        {/* Топ по звонкам */}
        {top(stats.calls).length > 0 && (
          <div className="px-4 py-3">
            <p className="text-[11px] font-semibold mb-2 flex items-center gap-1.5" style={{ color: 'var(--text-3)' }}>
              <Phone size={11} /> Топ по звонкам
            </p>
            {top(stats.calls).map(({ name, count }, i) => (
              <div key={i} className="flex items-center justify-between py-1">
                <span className="text-[13px] truncate flex-1" style={{ color: 'var(--text-2)' }}>{i + 1}. {name}</span>
                <span className="text-[13px] font-semibold ml-2" style={{ color: 'var(--moss-light)' }}>{count}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default function ProfilePage() {
  const { t, i18n } = useTranslation()
  const navigate = useNavigate()
  const collections = useDataStore((s) => s.collections)
  const visitedIds = useDataStore((s) => s.userPrefs.visitedPois)
  const setLanguage = useDataStore((s) => s.setLanguage)
  const favCount = collections.find((c) => c.id === 'favorites')?.poiIds.length || 0
  const visitedCount = visitedIds.length
  const [showAbout, setShowAbout] = useState(false)
  const lang = i18n.language as 'ru' | 'en'

  const toggleLang = () => {
    const newLang = i18n.language === 'ru' ? 'en' : 'ru'
    i18n.changeLanguage(newLang)
    setLanguage(newLang)
  }

  return (
    <div className="min-h-dvh">
      <header
        className="sticky top-0 z-40"
        style={{
          background: 'linear-gradient(180deg, rgba(26,31,40,0.97), rgba(1,2,4,0.66))',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.20), 0 8px 24px -12px #000',
        }}
      >
        <div className="flex items-center justify-center h-14 px-4">
          <h1 className="text-[15.5px] font-bold">{t('profile.title')}</h1>
        </div>
        <div className="orn-belt" style={{ height: 3, opacity: 0.5 }} />
      </header>

      {/* Аватар и счётчики */}
      <div
        className="px-4 py-7 flex flex-col items-center"
        style={{
          background: 'radial-gradient(360px 200px at 50% 0%, rgba(224,138,74,0.10), transparent 70%), var(--surface-1)',
          borderBottom: '1px solid var(--color-border)',
        }}
      >
        {/* Ромб вместо круглого аватара */}
        <div className="relative w-[74px] h-[74px] flex items-center justify-center mb-4">
          <span
            className="absolute inset-0 diamond"
            style={{ background: 'var(--terra-tint)', border: '1.5px solid var(--terra-line)', boxShadow: '0 0 28px var(--terra-glow)' }}
          />
          <span className="relative z-10 text-[26px] font-bold" style={{ color: 'var(--terra-hot)' }}>Т</span>
        </div>
        <h2 className="text-[17px] font-bold">{t('profile.traveler', 'Путешественник')}</h2>
        <div className="flex gap-8 mt-4">
          <div className="text-center">
            <p className="text-[20px] font-bold" style={{ color: 'var(--terra-hot)' }}>{favCount}</p>
            <p className="text-[11px] mt-0.5" style={{ color: 'var(--text-3)' }}>{t('saved.title')}</p>
          </div>
          <div className="w-px" style={{ background: 'var(--color-border)' }} />
          <div className="text-center">
            <p className="text-[20px] font-bold" style={{ color: 'var(--moss-light)' }}>{visitedCount}</p>
            <p className="text-[11px] mt-0.5" style={{ color: 'var(--text-3)' }}>{t('profile.visited')}</p>
          </div>
        </div>
      </div>

      {/* Analytics */}
      <StatsSection lang={lang} />

      {/* Section: My */}
      <SectionLabel label={t('profile.sectionMy')} />
      <div>
        <MenuItem icon={Heart} label={t('saved.title')} onClick={() => navigate('/profile/saved')} badge={favCount > 0 ? String(favCount) : undefined} />
        <MenuItem icon={Clock} label={t('profile.orderHistory')} onClick={() => {}} badge={t('profile.comingSoon')} showChevron={false} />
      </div>

      {/* Section: Settings */}
      <SectionLabel label={t('profile.sectionSettings')} />
      <div>
        <LangToggle currentLang={i18n.language} onToggle={toggleLang} />
        <MenuItem icon={Star} label={t('subscription.title')} onClick={() => navigate('/profile/subscription')} />
        <MenuItem icon={Bell} label={t('profile.notifications')} onClick={() => {}} badge={t('profile.comingSoon')} showChevron={false} />
      </div>

      {/* Section: Help */}
      <SectionLabel label={t('profile.sectionHelp')} />
      <div>
        <MenuItem icon={Siren} label={t('emergency.title')} onClick={() => navigate('/emergency')} />
        <MenuItem icon={Info} label={t('profile.about')} onClick={() => setShowAbout(true)} />
        <MenuItem icon={MessageCircle} label={t('profile.feedback')} onClick={() => {}} badge={t('profile.comingSoon')} showChevron={false} />
      </div>

      <div className="flex flex-col items-center py-8 gap-3">
        <div className="orn-belt w-28" style={{ height: 3, opacity: 0.45 }} />
        <span className="text-[11px] tracking-[0.16em]" style={{ color: 'var(--text-3)' }}>
          BROBROGID v1.0.0
        </span>
      </div>

      {/* About modal */}
      {showAbout && (
        <div className="fixed inset-0 z-50 flex items-center justify-center sheet-backdrop" onClick={() => setShowAbout(false)}>
          <div
            className="rounded-[var(--radius-xl)] mx-6 p-6 max-w-sm w-full overflow-hidden animate-fade-up"
            style={{ background: 'var(--surface-2)', border: '1px solid var(--color-border)', boxShadow: 'var(--shadow-4)' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="orn-belt -mx-6 -mt-6 mb-5" style={{ height: 3, opacity: 0.6 }} />
            <h2 className="text-[17px] font-bold text-center mb-4">{t('profile.about')}</h2>
            <div className="text-center text-[13px] space-y-1.5" style={{ color: 'var(--text-3)' }}>
              <p className="text-[15px] font-bold" style={{ color: 'var(--sand)' }}>BROBROGID v1.0.0</p>
              <p>Путеводитель по Северной Осетии</p>
              <p>Владикавказ и окрестности</p>
              <p className="pt-3">&copy; 2026 BROBROGID</p>
            </div>
            <button
              onClick={() => setShowAbout(false)}
              className="sheen w-full mt-6 py-2.5 rounded-[var(--radius-md)] font-semibold text-[13.5px]"
              style={{ background: 'var(--terra-hot)', color: 'var(--text-on-terra)', boxShadow: 'var(--shadow-terra)' }}
            >
              {t('common.close')}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
