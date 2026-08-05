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
    <div className="flex items-center gap-2.5 px-4 mb-3">
      {/* Ромб — фирменная метка начала раздела */}
      <i className="w-[7px] h-[7px] diamond flex-shrink-0" style={{ background: 'var(--terra)' }} />
      <h2 className="text-[16.5px] font-semibold whitespace-nowrap">{title}</h2>
      {/* Орнаментальный хвост уходит вправо и тает */}
      <span className="orn-tail" />
      {linkTo && (
        <button
          onClick={() => navigate(linkTo)}
          className="text-[12.5px] font-semibold whitespace-nowrap flex-shrink-0"
          style={{ color: 'var(--terra-hot)' }}
        >
          {linkText || t('common.showAll')} →
        </button>
      )}
    </div>
  )
}
