import { useTranslation } from 'react-i18next'
import { useDataStore } from '@/data/stores/data-store'
import { POICard } from '@/shared/ui/POICard'
import { EmptyState } from '@/shared/ui/EmptyState'
import { useNavigate } from 'react-router-dom'
import { Heart } from 'lucide-react'

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
        <div className="flex items-center h-14 px-4">
          <button onClick={() => navigate('/profile')} className="w-10 h-10 flex items-center justify-center -ml-2">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
            </svg>
          </button>
          <h1 className="text-base font-bold flex-1 text-center pr-10">{t('saved.title')}</h1>
        </div>
      </header>

      <div className="px-4 py-4">
        {favPois.length === 0 ? (
          <EmptyState
            icon={<Heart size={48} />}
            title={t('saved.empty')}
            subtitle={t('saved.emptyHint')}
            action={{ label: t('saved.explore'), onClick: () => navigate('/') }}
          />
        ) : (
          <>
            <p className="text-xs text-[var(--color-text-secondary)] mb-3">{t('saved.places', { count: favPois.length })}</p>
            <div className="space-y-3">
              {favPois.map((poi) => <POICard key={poi.id} poi={poi} variant="vertical" />)}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
