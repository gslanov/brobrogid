import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useDataStore } from '@/data/stores/data-store'
import { PageHeader } from '@/shared/ui/PageHeader'
import { Rating } from '@/shared/ui/Rating'

export default function GuidesPage() {
  const { i18n, t } = useTranslation()
  const navigate = useNavigate()
  const lang = i18n.language as 'ru' | 'en'
  const guides = useDataStore((s) => s.guides)

  return (
    <div className="min-h-dvh bg-[var(--color-bg)]">
      <PageHeader title={t('guides.title')} showBack />
      <div className="px-4 py-3 space-y-3">
        {guides.map((guide) => (
          <button key={guide.id} onClick={() => navigate(`/tours/guide/${guide.id}`)} className="w-full flex gap-4 bg-white rounded-2xl p-4 shadow-sm border border-[var(--color-border)] text-left">
            <div className="w-16 h-16 rounded-full bg-[var(--color-primary)] flex items-center justify-center text-white font-bold text-2xl flex-shrink-0">
              {guide.name.ru[0]}
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-bold text-base">{guide.name[lang]}</h3>
              <p className="text-sm text-[var(--color-text-secondary)] mt-0.5 line-clamp-2">{guide.bio[lang]}</p>
              <div className="flex items-center gap-3 mt-2">
                <Rating value={guide.rating} count={guide.reviewCount} size="sm" />
                <span className="text-xs text-[var(--color-text-secondary)]">{guide.tourCount} {t('guides.tours')}</span>
              </div>
              <div className="flex gap-1 mt-1.5">
                {guide.languages.map((l) => (
                  <span key={l} className="text-[11px] px-2 py-0.5 bg-gray-100 rounded-full">{l}</span>
                ))}
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}
