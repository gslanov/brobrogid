import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { motion, AnimatePresence } from 'framer-motion'
import type { PriceLevel } from '@/data/types'

function pluralPlace(n: number): string {
  const mod10 = n % 10
  const mod100 = n % 100
  if (mod100 >= 11 && mod100 <= 19) return `${n} мест`
  if (mod10 === 1) return `${n} место`
  if (mod10 >= 2 && mod10 <= 4) return `${n} места`
  return `${n} мест`
}

interface Filters {
  minRating: number
  priceLevels: PriceLevel[]
  openNow: boolean
}

interface FilterSheetProps {
  isOpen: boolean
  onClose: () => void
  filters: Filters
  onApply: (filters: Filters) => void
  resultCount: number
}

export function FilterSheet({ isOpen, onClose, filters, onApply, resultCount }: FilterSheetProps) {
  const { t } = useTranslation()
  const [local, setLocal] = useState<Filters>(filters)

  // Sync local state when sheet opens
  useEffect(() => {
    if (isOpen) setLocal(filters)
  }, [isOpen, filters])

  const togglePrice = (level: PriceLevel) => {
    setLocal((prev) => ({
      ...prev,
      priceLevels: prev.priceLevels.includes(level)
        ? prev.priceLevels.filter((p) => p !== level)
        : [...prev.priceLevels, level],
    }))
  }

  const reset = () => setLocal({ minRating: 0, priceLevels: [], openNow: false })

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 sheet-backdrop"
            onClick={onClose}
          />
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed bottom-[calc(var(--bottom-nav-height)+var(--safe-area-bottom))] left-0 right-0 z-50 rounded-t-[var(--radius-2xl)] max-w-lg mx-auto max-h-[85vh] flex flex-col overflow-hidden"
            style={{
              background: 'linear-gradient(180deg, var(--surface-2), var(--surface-1))',
              boxShadow: 'var(--shadow-4)',
            }}
          >
            <div className="orn-belt flex-shrink-0" style={{ height: 3, opacity: 0.55 }} />

            {/* Ручка для перетаскивания */}
            <div className="flex justify-center py-3 flex-shrink-0">
              <div className="w-9 h-1 rounded-full" style={{ background: 'var(--surface-3)' }} />
            </div>

            <div className="px-4 space-y-6 overflow-y-auto flex-1 pb-2">
              <h3 className="text-[15px] font-bold">{t('search.filters')}</h3>

              {/* Уровень цен */}
              <div>
                <p className="text-[12.5px] font-medium mb-2.5" style={{ color: 'var(--text-2)' }}>
                  {t('search.priceLevel', 'Price level')}
                </p>
                <div className="flex gap-2">
                  {([1, 2, 3, 4] as PriceLevel[]).map((level) => (
                    <button
                      key={level}
                      onClick={() => togglePrice(level)}
                      className="px-4 py-2 rounded-[var(--radius-sm)] text-[13px] font-medium border transition-all"
                      style={local.priceLevels.includes(level)
                        ? { background: 'var(--terra-tint)', color: 'var(--terra-hot)', borderColor: 'var(--terra-line)' }
                        : { background: 'var(--surface-1)', color: 'var(--text-3)', borderColor: 'var(--color-border)' }}
                    >
                      {'₽'.repeat(level)}
                    </button>
                  ))}
                </div>
              </div>

              {/* Минимальная оценка */}
              <div>
                <p className="text-[12.5px] font-medium mb-2.5" style={{ color: 'var(--text-2)' }}>
                  {t('search.minRating', 'Min rating')}:{' '}
                  <span style={{ color: 'var(--terra-hot)' }}>
                    {local.minRating || t('search.any', 'Any')}
                  </span>
                </p>
                <input
                  type="range"
                  min={0}
                  max={5}
                  step={0.5}
                  value={local.minRating}
                  onChange={(e) => setLocal((prev) => ({ ...prev, minRating: parseFloat(e.target.value) }))}
                  className="w-full"
                  style={{ accentColor: 'var(--terra-hot)' }}
                />
              </div>

              {/* Открыто сейчас */}
              <label className="flex items-center justify-between">
                <span className="text-[13px] font-medium">{t('poi.openNow')}</span>
                <button
                  onClick={() => setLocal((prev) => ({ ...prev, openNow: !prev.openNow }))}
                  className="w-12 h-6.5 rounded-full transition-colors relative"
                  style={{
                    width: 46,
                    height: 26,
                    background: local.openNow ? 'var(--terra-hot)' : 'var(--surface-3)',
                  }}
                >
                  <motion.div
                    className="absolute top-[3px] w-5 h-5 rounded-full"
                    style={{ background: local.openNow ? 'var(--text-on-terra)' : 'var(--text-3)' }}
                    animate={{ left: local.openNow ? 23 : 3 }}
                    transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                  />
                </button>
              </label>
            </div>

            {/* Кнопки — всегда на виду */}
            <div
              className="px-4 pt-3 pb-6 flex gap-3 flex-shrink-0 mt-2"
              style={{ borderTop: '1px solid var(--color-border)' }}
            >
              <button
                onClick={reset}
                className="flex-1 py-3 text-[13px] font-medium"
                style={{ color: 'var(--text-3)' }}
              >
                {t('search.reset', 'Reset')}
              </button>
              <button
                onClick={() => { onApply(local); onClose() }}
                className="sheen flex-1 py-3 rounded-[var(--radius-md)] text-[13px] font-bold"
                style={{ background: 'var(--terra-hot)', color: 'var(--text-on-terra)', boxShadow: 'var(--shadow-terra)' }}
              >
                {`Показать ${pluralPlace(resultCount)}`}
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

export type { Filters }
