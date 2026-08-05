import type { ReactNode } from 'react'

interface EmptyStateProps {
  icon: ReactNode
  title: string
  subtitle?: string
  action?: { label: string; onClick: () => void }
}

export function EmptyState({ icon, title, subtitle, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-8 text-center">
      {/* Иконка в ромбовидной рамке — та же форма, что и во всём приложении */}
      <div className="relative w-[104px] h-[104px] flex items-center justify-center mb-5">
        <span
          className="absolute inset-0 diamond"
          style={{ border: '1px solid var(--terra-line)', background: 'var(--terra-tint)' }}
        />
        <span className="relative z-10" style={{ color: 'var(--terra)' }}>{icon}</span>
      </div>
      <h3 className="text-[17px] font-semibold mb-1.5">{title}</h3>
      {subtitle && (
        <p className="text-[13px] mb-5 max-w-[280px] leading-relaxed" style={{ color: 'var(--text-3)' }}>
          {subtitle}
        </p>
      )}
      {action && (
        <button
          onClick={action.onClick}
          className="sheen px-6 py-2.5 rounded-full text-[13.5px] font-semibold"
          style={{ background: 'var(--terra-hot)', color: 'var(--text-on-terra)', boxShadow: 'var(--shadow-terra)' }}
        >
          {action.label}
        </button>
      )}
    </div>
  )
}
