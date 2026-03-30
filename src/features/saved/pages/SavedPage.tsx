import { useTranslation } from 'react-i18next'
import { useDataStore } from '@/data/stores/data-store'
import { POICard } from '@/shared/ui/POICard'
import { EmptyState } from '@/shared/ui/EmptyState'
import { useNavigate } from 'react-router-dom'

export default function SavedPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const pois = useDataStore((s) => s.pois)
  const collections = useDataStore((s) => s.collections)
  const favIds = collections.find((c) => c.id === 'favorites')?.poiIds || []
  const favPois = pois.filter((p) => favIds.includes(p.id))

  return (
    <div className="min-h-dvh bg-[var(--color-bg)]">
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-sm border-b border-[var(--color-border)]">
        <div className="flex items-center justify-center h-14 px-4">
          <h1 className="text-base font-bold">{t('saved.title')}</h1>
        </div>
      </header>

      <div className="px-4 py-4">
        {favPois.length === 0 ? (
          <EmptyState
            icon="❤️"
            title={t('saved.empty')}
            subtitle="Нажмите ❤️ на любом месте, чтобы сохранить его"
            action={{ label: 'Исследовать', onClick: () => navigate('/') }}
          />
        ) : (
          <>
            <p className="text-xs text-[var(--color-text-secondary)] mb-3">{favPois.length} мест</p>
            <div className="space-y-3">
              {favPois.map((poi) => <POICard key={poi.id} poi={poi} variant="vertical" />)}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
