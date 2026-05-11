import { useTranslation } from 'react-i18next'
import { MapPin, X } from 'lucide-react'
import type { POI } from '@/data/types'

interface ProximityToastProps {
  poi: POI
  onConfirm: () => void
  onDismiss: () => void
}

export function ProximityToast({ poi, onConfirm, onDismiss }: ProximityToastProps) {
  const { i18n } = useTranslation()
  const lang = i18n.language as 'ru' | 'en'
  const name = poi.name[lang] || poi.name.ru

  return (
    <div className="fixed bottom-[calc(var(--bottom-nav-height)+var(--safe-area-bottom)+12px)] left-4 right-4 z-50 max-w-lg mx-auto">
      <div className="bg-gray-900 text-white rounded-2xl px-4 py-3.5 shadow-2xl flex items-center gap-3">
        <div className="bg-[var(--color-primary)] rounded-full p-2 flex-shrink-0">
          <MapPin size={16} className="text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs text-gray-400 leading-none mb-0.5">
            {lang === 'ru' ? 'Вы рядом' : 'You are nearby'}
          </p>
          <p className="text-sm font-semibold truncate">{name}</p>
        </div>
        <button
          onClick={onConfirm}
          className="flex-shrink-0 bg-[var(--color-primary)] text-white text-xs font-semibold px-3 py-1.5 rounded-lg"
        >
          {lang === 'ru' ? 'Был здесь' : 'Been here'}
        </button>
        <button onClick={onDismiss} className="flex-shrink-0 text-gray-400 hover:text-white p-1">
          <X size={16} />
        </button>
      </div>
    </div>
  )
}
