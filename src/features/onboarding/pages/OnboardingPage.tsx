import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { motion, AnimatePresence } from 'framer-motion'
import { Geolocation } from '@capacitor/geolocation'
import type { POICategory } from '@/data/types'
import { CATEGORY_COLORS, CATEGORY_ICONS } from '@/shared/lib/utils'
import { MapPin } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

const INTEREST_OPTIONS: { key: POICategory; icon: LucideIcon }[] = [
  { key: 'attractions', icon: CATEGORY_ICONS.attractions },
  { key: 'food', icon: CATEGORY_ICONS.food },
  { key: 'nature', icon: CATEGORY_ICONS.nature },
  { key: 'culture', icon: CATEGORY_ICONS.culture },
  { key: 'activities', icon: CATEGORY_ICONS.activities },
]

/** Основная кнопка шага */
function PrimaryButton({ children, onClick, className = '' }: { children: React.ReactNode; onClick: () => void; className?: string }) {
  return (
    <motion.button
      onClick={onClick}
      whileTap={{ scale: 0.975 }}
      className={`sheen py-3.5 rounded-[var(--radius-md)] font-semibold text-[15px] ${className}`}
      style={{ background: 'var(--terra-hot)', color: 'var(--text-on-terra)', boxShadow: 'var(--shadow-terra)' }}
    >
      {children}
    </motion.button>
  )
}

export default function OnboardingPage() {
  const { t, i18n } = useTranslation()
  const navigate = useNavigate()
  const [step, setStep] = useState(0)
  const [interests, setInterests] = useState<POICategory[]>([])

  const toggleInterest = (key: POICategory) => {
    setInterests((prev) => prev.includes(key) ? prev.filter((i) => i !== key) : [...prev, key])
    if (navigator.vibrate) navigator.vibrate(8)
  }

  const complete = () => {
    localStorage.setItem('brobrogid_onboarding', 'true')
    localStorage.setItem('brobrogid_interests', JSON.stringify(interests))
    navigate('/', { replace: true })
  }

  const requestLocation = async () => {
    try {
      await Geolocation.requestPermissions()
      await Geolocation.getCurrentPosition()
    } catch {
      // Отказано или ошибка — идём дальше, приложение работает и без геолокации
    }
    complete()
  }

  const slide = {
    initial: { opacity: 0, x: 40 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -40 },
    transition: { duration: 0.32, ease: [0.16, 1, 0.3, 1] as const },
  }

  return (
    <div
      className="min-h-dvh flex flex-col"
      style={{
        background:
          'radial-gradient(760px 520px at 50% 12%, #1B1E26 0%, transparent 62%),' +
          'radial-gradient(600px 420px at 82% 88%, #201820 0%, transparent 58%),' +
          'var(--bg-deep)',
      }}
    >
      <AnimatePresence mode="wait">
        {step === 0 && (
          <motion.div key="welcome" {...slide} className="flex-1 flex flex-col items-center justify-center px-8 text-center">
            {/* Ромб-эмблема с двойной рамкой */}
            <div className="relative w-24 h-24 mb-8">
              <span
                className="absolute inset-0 diamond animate-pulse-glow"
                style={{ border: '1.5px solid var(--terra-line)', background: 'var(--terra-tint)', boxShadow: '0 0 46px var(--terra-glow)' }}
              />
              <span className="absolute inset-[16px] diamond" style={{ border: '1.5px solid var(--moss)' }} />
              <span className="absolute inset-[32px] diamond" style={{ background: 'var(--terra-hot)' }} />
            </div>

            <h1 className="text-[30px] font-bold tracking-[0.14em] mb-1" style={{ color: 'var(--sand)' }}>
              BROBROGID
            </h1>
            <div className="orn-belt animate-draw-belt w-44 mb-6" style={{ height: 4 }} />
            <p className="text-[15px] mb-10 max-w-xs leading-relaxed" style={{ color: 'var(--text-2)' }}>
              {t('app.tagline')}
            </p>

            <PrimaryButton onClick={() => setStep(1)} className="w-full max-w-xs">
              {t('onboarding.getStarted', 'Начать')}
            </PrimaryButton>

            <div className="mt-7 flex gap-2.5">
              {(['ru', 'en'] as const).map((lng) => {
                const active = i18n.language === lng
                return (
                  <button
                    key={lng}
                    onClick={() => i18n.changeLanguage(lng)}
                    className="px-4 py-2 rounded-full text-[13px] font-medium transition-all"
                    style={active
                      ? { background: 'var(--terra-tint)', color: 'var(--terra-hot)', border: '1px solid var(--terra-line)' }
                      : { background: 'var(--surface-1)', color: 'var(--text-3)', border: '1px solid var(--color-border)' }}
                  >
                    {lng === 'ru' ? 'Русский' : 'English'}
                  </button>
                )
              })}
            </div>
          </motion.div>
        )}

        {step === 1 && (
          <motion.div key="interests" {...slide} className="flex-1 flex flex-col px-6 pt-16">
            <div className="flex justify-end mb-5">
              <button onClick={() => setStep(2)} className="text-[13px]" style={{ color: 'var(--text-3)' }}>
                {t('onboarding.skip', 'Пропустить')}
              </button>
            </div>

            <h2 className="text-[24px] font-bold mb-2 leading-tight">
              {t('onboarding.interestsTitle', 'Что тебе интересно?')}
            </h2>
            <p className="text-[13.5px] mb-7 leading-relaxed" style={{ color: 'var(--text-3)' }}>
              {t('onboarding.interestsSubtitle', 'Выбери темы — подберём места под тебя')}
            </p>

            <div className="grid grid-cols-2 gap-3 mb-8 stagger">
              {INTEREST_OPTIONS.map(({ key, icon: Icon }) => {
                const active = interests.includes(key)
                const color = CATEGORY_COLORS[key]
                return (
                  <motion.button
                    key={key}
                    onClick={() => toggleInterest(key)}
                    whileTap={{ scale: 0.95 }}
                    className="animate-fade-up flex flex-col items-center justify-center gap-2.5 p-4 rounded-[var(--radius-lg)] text-center min-h-[104px] transition-colors"
                    style={{
                      background: active ? color + '14' : 'var(--surface-1)',
                      border: `1px solid ${active ? color + '80' : 'var(--color-border)'}`,
                      boxShadow: active ? `0 0 22px ${color}2E` : 'none',
                    }}
                  >
                    <span className="relative w-10 h-10 flex items-center justify-center">
                      <span
                        className="absolute inset-0 diamond transition-colors"
                        style={{ background: color + (active ? '2E' : '14'), border: `1px solid ${color}${active ? '99' : '3D'}` }}
                      />
                      <Icon size={18} className="relative z-10" style={{ color }} />
                    </span>
                    <span className="text-[12.5px] font-medium leading-tight break-words w-full">
                      {t(`categories.${key}`)}
                    </span>
                  </motion.button>
                )
              })}
            </div>

            <PrimaryButton onClick={() => setStep(2)} className="w-full mt-auto mb-8">
              {t('onboarding.continue', 'Продолжить')}
            </PrimaryButton>
          </motion.div>
        )}

        {step === 2 && (
          <motion.div key="location" {...slide} className="flex-1 flex flex-col items-center justify-center px-8 text-center">
            <div className="relative w-24 h-24 mb-8 flex items-center justify-center">
              <span
                className="absolute inset-0 diamond animate-pulse-glow"
                style={{ border: '1.5px solid var(--terra-line)', background: 'var(--terra-tint)' }}
              />
              <MapPin size={38} className="relative z-10" style={{ color: 'var(--terra-hot)' }} />
            </div>

            <h2 className="text-[24px] font-bold mb-2.5 leading-tight">
              {t('onboarding.locationTitle', 'Покажем, что рядом')}
            </h2>
            <p className="text-[13.5px] mb-9 max-w-xs leading-relaxed" style={{ color: 'var(--text-3)' }}>
              {t('onboarding.locationSubtitle', 'Разреши доступ к геолокации — и увидишь места вокруг себя')}
            </p>

            <PrimaryButton onClick={requestLocation} className="w-full max-w-xs mb-4">
              {t('onboarding.enableLocation', 'Разрешить')}
            </PrimaryButton>
            <button onClick={complete} className="text-[13px]" style={{ color: 'var(--text-3)' }}>
              {t('onboarding.notNow', 'Не сейчас')}
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Ромбы-шаги вместо точек */}
      <div className="flex justify-center gap-2.5 pb-9">
        {[0, 1, 2].map((i) => (
          <motion.span
            key={i}
            className={step === i ? 'h-[7px] rounded-[2px]' : 'w-[7px] h-[7px] diamond'}
            animate={{ width: step === i ? 22 : 7 }}
            transition={{ type: 'spring', stiffness: 400, damping: 30 }}
            style={{
              background: step === i ? 'var(--terra-hot)' : 'var(--surface-3)',
              boxShadow: step === i ? '0 0 14px var(--terra-glow)' : 'none',
            }}
          />
        ))}
      </div>
    </div>
  )
}
