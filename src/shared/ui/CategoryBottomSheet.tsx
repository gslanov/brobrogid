import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import type { POICategory } from '@/data/types'
import { CATEGORY_COLORS, CATEGORY_ICONS } from '@/shared/lib/utils'

const ALL_CATEGORIES: POICategory[] = [
  'attractions', 'food', 'nature', 'culture', 'activities',
  'shopping', 'nightlife', 'transport', 'accommodation', 'practical',
]

interface CategoryBottomSheetProps {
  isOpen: boolean
  onClose: () => void
}

export function CategoryBottomSheet({ isOpen, onClose }: CategoryBottomSheetProps) {
  const { t } = useTranslation()
  const navigate = useNavigate()

  const handleSelect = (cat: POICategory) => {
    onClose()
    navigate(`/search?category=${cat}`)
  }

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
            className="fixed bottom-0 left-0 right-0 z-50 bg-white rounded-t-2xl max-w-lg mx-auto"
          >
            <div className="flex justify-center py-3">
              <div className="w-8 h-1 bg-gray-300 rounded-full" />
            </div>
            <h3 className="text-base font-bold px-4 mb-3">{t('common.allCategories')}</h3>
            <div className="grid grid-cols-2 gap-2 px-4 pb-8">
              {ALL_CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  onClick={() => handleSelect(cat)}
                  className="flex items-center gap-3 p-3 rounded-xl border border-[var(--color-border)] text-left hover:bg-gray-50 transition-colors"
                >
                  <span
                    className="w-10 h-10 rounded-xl flex items-center justify-center"
                    style={{ background: `${CATEGORY_COLORS[cat]}15`, color: CATEGORY_COLORS[cat] }}
                  >
                    {(() => { const Icon = CATEGORY_ICONS[cat]; return <Icon size={20} /> })()}
                  </span>
                  <span className="text-sm font-medium">{t(`categories.${cat}`)}</span>
                </button>
              ))}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
