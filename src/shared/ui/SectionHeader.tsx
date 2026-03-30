import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'

interface SectionHeaderProps {
  title: string
  linkTo?: string
  linkText?: string
}

export function SectionHeader({ title, linkTo, linkText }: SectionHeaderProps) {
  const navigate = useNavigate()
  const { t } = useTranslation()

  return (
    <div className="flex items-center justify-between px-4 mb-3">
      <h2 className="text-lg font-bold">{title}</h2>
      {linkTo && (
        <button onClick={() => navigate(linkTo)} className="text-sm font-medium text-[var(--color-primary)]">
          {linkText || t('common.showAll')} →
        </button>
      )}
    </div>
  )
}
