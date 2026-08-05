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
      <div
        className="glass-strong rounded-[var(--radius-lg)] px-4 py-3.5 flex items-center gap-3"
        style={{ color: 'var(--text)', boxShadow: 'var(--shadow-4)' }}
      >
        <div
          className="w-9 h-9 diamond flex items-center justify-center flex-shrink-0"
          style={{ background: 'var(--terra-tint)', border: '1px solid var(--terra-line)' }}
        >
          <MapPin size={15} style={{ color: 'var(--terra-hot)' }} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[11px] leading-none mb-1" style={{ color: 'var(--text-3)' }}>
            {lang === 'ru' ? 'Вы рядом' : 'You are nearby'}
          </p>
          <p className="text-[13.5px] font-semibold truncate">{name}</p>
        </div>
        <button
          onClick={onConfirm}
          className="sheen flex-shrink-0 text-[12px] font-semibold px-3 py-2 rounded-[var(--radius-sm)]"
          style={{ background: 'var(--terra-hot)', color: 'var(--text-on-terra)' }}
        >
          {lang === 'ru' ? 'Был здесь' : 'Been here'}
        </button>
        <button onClick={onDismiss} className="flex-shrink-0 p-1" style={{ color: 'var(--text-3)' }}>
          <X size={16} />
        </button>
      </div>
    </div>
  )
}
