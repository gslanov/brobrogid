import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'

interface SearchBarProps {
  onFocus?: () => void
  interactive?: boolean
}

export function SearchBar({ onFocus, interactive = false }: SearchBarProps) {
  const navigate = useNavigate()
  const { t } = useTranslation()

  if (!interactive) {
    return (
      <button
        onClick={() => navigate('/search')}
        className="w-full flex items-center gap-3 bg-gray-50 border border-[var(--color-border)] rounded-2xl px-4 py-3 text-left"
      >
        <svg className="w-5 h-5 text-[var(--color-text-secondary)]" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607z" />
        </svg>
        <span className="text-[var(--color-text-secondary)] text-sm">{t('search.placeholder')}</span>
      </button>
    )
  }

  return (
    <div className="flex items-center gap-3 bg-gray-50 border border-[var(--color-border)] rounded-2xl px-4 py-3">
      <svg className="w-5 h-5 text-[var(--color-text-secondary)]" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607z" />
      </svg>
      <input
        type="text"
        placeholder={t('search.placeholder')}
        autoFocus
        onFocus={onFocus}
        className="flex-1 bg-transparent outline-none text-sm"
      />
    </div>
  )
}
