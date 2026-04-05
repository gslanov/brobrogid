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
      <div className="w-[120px] h-[120px] flex items-center justify-center mb-4 text-[var(--color-text-secondary)]">
        {icon}
      </div>
      <h3 className="text-lg font-semibold mb-1">{title}</h3>
      {subtitle && <p className="text-sm text-[var(--color-text-secondary)] mb-4 max-w-[280px]">{subtitle}</p>}
      {action && (
        <button onClick={action.onClick} className="px-6 py-2.5 bg-[var(--color-primary)] text-white rounded-full text-sm font-medium">
          {action.label}
        </button>
      )}
    </div>
  )
}
