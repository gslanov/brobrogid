import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import type { POICategory } from '@/data/types'
import { CATEGORY_COLORS, CATEGORY_ICONS } from '@/shared/lib/utils'

// «shopping» удалён из проекта — заменён на действующие категории
const ALL_CATEGORIES: POICategory[] = [
  'attractions', 'food', 'nature', 'culture', 'museums',
  'activities', 'tours', 'accommodation', 'transport', 'practical',
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
            className="fixed bottom-0 left-0 right-0 z-50 rounded-t-[var(--radius-2xl)] max-w-lg mx-auto overflow-hidden"
            style={{
              background: 'linear-gradient(180deg, var(--surface-2), var(--surface-1))',
              boxShadow: 'var(--shadow-4)',
            }}
          >
            <div className="orn-belt" style={{ height: 3, opacity: 0.55 }} />
            <div className="flex justify-center py-3">
              <div className="w-9 h-1 rounded-full" style={{ background: 'var(--surface-3)' }} />
            </div>
            <h3 className="text-[15px] font-bold px-4 mb-3">{t('common.allCategories')}</h3>
            <div className="grid grid-cols-2 gap-2 px-4 pb-8">
              {ALL_CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  onClick={() => handleSelect(cat)}
                  className="flex items-center gap-3 p-2.5 rounded-[var(--radius-md)] text-left transition-colors"
                  style={{ background: 'var(--surface-1)', border: '1px solid var(--color-border)' }}
                >
                  <span className="relative w-9 h-9 flex items-center justify-center flex-shrink-0">
                    <span
                      className="absolute inset-0 diamond"
                      style={{ background: `${CATEGORY_COLORS[cat]}1F`, border: `1px solid ${CATEGORY_COLORS[cat]}55` }}
                    />
                    <span className="relative z-10" style={{ color: CATEGORY_COLORS[cat] }}>
                      {(() => { const Icon = CATEGORY_ICONS[cat]; return <Icon size={17} /> })()}
                    </span>
                  </span>
                  <span className="text-[12.5px] font-medium">{t(`categories.${cat}`)}</span>
                </button>
              ))}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
