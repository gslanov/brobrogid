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
            className="fixed bottom-[calc(var(--bottom-nav-height)+var(--safe-area-bottom))] left-0 right-0 z-50 bg-white rounded-t-2xl max-w-lg mx-auto max-h-[85vh] flex flex-col"
          >
            {/* Handle */}
            <div className="flex justify-center py-3 flex-shrink-0">
              <div className="w-8 h-1 bg-gray-300 rounded-full" />
            </div>

            {/* Scrollable content */}
            <div className="px-4 space-y-5 overflow-y-auto flex-1">
              <h3 className="text-base font-bold">{t('search.filters')}</h3>

              {/* Price level */}
              <div>
                <p className="text-sm font-medium mb-2">{t('search.priceLevel', 'Price level')}</p>
                <div className="flex gap-2">
                  {([1, 2, 3, 4] as PriceLevel[]).map((level) => (
                    <button
                      key={level}
                      onClick={() => togglePrice(level)}
                      className={`px-4 py-2 rounded-lg text-sm font-medium border transition-colors ${
                        local.priceLevels.includes(level)
                          ? 'bg-[var(--color-primary)] text-white border-[var(--color-primary)] shadow-sm'
                          : 'bg-white border-gray-300 text-gray-600'
                      }`}
                    >
                      {'₽'.repeat(level)}
                    </button>
                  ))}
                </div>
              </div>

              {/* Rating */}
              <div>
                <p className="text-sm font-medium mb-2">{t('search.minRating', 'Min rating')}: {local.minRating || t('search.any', 'Any')}</p>
                <input
                  type="range"
                  min={0}
                  max={5}
                  step={0.5}
                  value={local.minRating}
                  onChange={(e) => setLocal((prev) => ({ ...prev, minRating: parseFloat(e.target.value) }))}
                  className="w-full accent-[var(--color-primary)]"
                />
              </div>

              {/* Open now */}
              <label className="flex items-center justify-between">
                <span className="text-sm font-medium">{t('poi.openNow')}</span>
                <button
                  onClick={() => setLocal((prev) => ({ ...prev, openNow: !prev.openNow }))}
                  className={`w-11 h-6 rounded-full transition-colors relative ${local.openNow ? 'bg-[var(--color-primary)]' : 'bg-gray-300'}`}
                >
                  <div className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${local.openNow ? 'translate-x-5.5' : 'translate-x-0.5'}`} />
                </button>
              </label>

            </div>

            {/* Bottom actions — always visible */}
            <div className="px-4 pt-2 pb-6 flex gap-3 flex-shrink-0 border-t border-gray-100 mt-2">
              <button onClick={reset} className="flex-1 py-3 text-sm font-medium text-[var(--color-text-secondary)]">
                {t('search.reset', 'Reset')}
              </button>
              <button
                onClick={() => { onApply(local); onClose() }}
                className="flex-1 py-3 bg-[var(--color-primary)] text-white rounded-xl text-sm font-bold"
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
