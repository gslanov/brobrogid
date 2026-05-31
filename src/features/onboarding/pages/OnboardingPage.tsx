import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { motion, AnimatePresence } from 'framer-motion'
import type { POICategory } from '@/data/types'
import { CATEGORY_ICONS } from '@/shared/lib/utils'
import { Mountain as MountainIcon, MapPin } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

const INTEREST_OPTIONS: { key: POICategory; icon: LucideIcon }[] = [
  { key: 'attractions', icon: CATEGORY_ICONS.attractions },
  { key: 'food', icon: CATEGORY_ICONS.food },
  { key: 'nature', icon: CATEGORY_ICONS.nature },
  { key: 'culture', icon: CATEGORY_ICONS.culture },
  { key: 'activities', icon: CATEGORY_ICONS.activities },
  { key: 'nightlife', icon: CATEGORY_ICONS.nightlife },
]

export default function OnboardingPage() {
  const { t, i18n } = useTranslation()
  const navigate = useNavigate()
  const [step, setStep] = useState(0)
  const [interests, setInterests] = useState<POICategory[]>([])

  const toggleInterest = (key: POICategory) => {
    setInterests((prev) => prev.includes(key) ? prev.filter((i) => i !== key) : [...prev, key])
  }

  const complete = () => {
    localStorage.setItem('brobrogid_onboarding', 'true')
    localStorage.setItem('brobrogid_interests', JSON.stringify(interests))
    navigate('/', { replace: true })
  }

  const requestLocation = () => {
    navigator.geolocation?.getCurrentPosition(
      () => complete(),
      () => complete(),
    )
  }

  return (
    <div className="min-h-dvh bg-white flex flex-col">
      <AnimatePresence mode="wait">
        {step === 0 && (
          <motion.div key="welcome" initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -50 }} className="flex-1 flex flex-col items-center justify-center px-8 text-center">
            <div className="mb-6 text-[var(--color-primary)]"><MountainIcon size={64} /></div>
            <h1 className="text-3xl font-bold text-[var(--color-primary)] mb-2">BROBROGID</h1>
            <p className="text-lg text-[var(--color-text-secondary)] mb-8">{t('app.tagline')}</p>
            <button onClick={() => setStep(1)} className="w-full max-w-xs py-3.5 bg-[var(--color-primary)] text-white rounded-xl font-semibold text-base">
              {t('onboarding.getStarted', 'Get Started')}
            </button>
            <div className="mt-6 flex gap-3">
              <button onClick={() => i18n.changeLanguage('ru')} className={`px-4 py-2 rounded-lg text-sm font-medium ${i18n.language === 'ru' ? 'bg-[var(--color-primary-light)] text-[var(--color-primary)]' : 'bg-gray-100'}`}>
                Русский
              </button>
              <button onClick={() => i18n.changeLanguage('en')} className={`px-4 py-2 rounded-lg text-sm font-medium ${i18n.language === 'en' ? 'bg-[var(--color-primary-light)] text-[var(--color-primary)]' : 'bg-gray-100'}`}>
                English
              </button>
            </div>
          </motion.div>
        )}

        {step === 1 && (
          <motion.div key="interests" initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -50 }} className="flex-1 flex flex-col px-6 pt-16">
            <div className="flex justify-end mb-4">
              <button onClick={() => setStep(2)} className="text-sm text-[var(--color-text-secondary)]">{t('onboarding.skip', 'Skip')}</button>
            </div>
            <h2 className="text-2xl font-bold mb-2">{t('onboarding.interestsTitle', 'What interests you?')}</h2>
            <p className="text-sm text-[var(--color-text-secondary)] mb-6">{t('onboarding.interestsSubtitle', 'Choose topics to personalize your feed')}</p>
            <div className="grid grid-cols-2 gap-3 mb-8">
              {INTEREST_OPTIONS.map(({ key, icon }) => (
                <button
                  key={key}
                  onClick={() => toggleInterest(key)}
                  className={`flex items-center gap-3 p-4 rounded-2xl border-2 transition-colors text-left ${
                    interests.includes(key) ? 'border-[var(--color-primary)] bg-[var(--color-primary-light)]' : 'border-gray-200'
                  }`}
                >
                  {(() => { const Icon = icon; return <Icon size={24} /> })()}
                  <span className="text-sm font-medium">{t(`categories.${key}`)}</span>
                </button>
              ))}
            </div>
            <button onClick={() => setStep(2)} className="w-full py-3.5 bg-[var(--color-primary)] text-white rounded-xl font-semibold text-base mt-auto mb-8">
              {t('onboarding.continue', 'Continue')}
            </button>
          </motion.div>
        )}

        {step === 2 && (
          <motion.div key="location" initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -50 }} className="flex-1 flex flex-col items-center justify-center px-8 text-center">
            <div className="mb-6 text-[var(--color-primary)]"><MapPin size={64} /></div>
            <h2 className="text-2xl font-bold mb-2">{t('onboarding.locationTitle', 'Find experiences near you')}</h2>
            <p className="text-sm text-[var(--color-text-secondary)] mb-8">{t('onboarding.locationSubtitle', 'Allow location access to discover nearby places')}</p>
            <button onClick={requestLocation} className="w-full max-w-xs py-3.5 bg-[var(--color-primary)] text-white rounded-xl font-semibold text-base mb-3">
              {t('onboarding.enableLocation', 'Enable Location')}
            </button>
            <button onClick={complete} className="text-sm text-[var(--color-text-secondary)]">
              {t('onboarding.notNow', 'Not Now')}
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Progress dots */}
      <div className="flex justify-center gap-2 pb-8">
        {[0, 1, 2].map((i) => (
          <div key={i} className={`w-2 h-2 rounded-full transition-colors ${step === i ? 'bg-[var(--color-primary)]' : 'bg-gray-300'}`} />
        ))}
      </div>
    </div>
  )
}
