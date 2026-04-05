interface EmptyStateProps {
  icon: string
  title: string
  subtitle?: string
  action?: { label: string; onClick: () => void }
}

export function EmptyState({ icon, title, subtitle, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-8 text-center">
      <span className="text-5xl mb-4">{icon}</span>
      <h3 className="text-lg font-semibold mb-1">{title}</h3>
      {subtitle && <p className="text-sm text-[var(--color-text-secondary)] mb-4">{subtitle}</p>}
      {action && (
        <button onClick={action.onClick} className="px-6 py-2.5 bg-[var(--color-primary)] text-white rounded-full text-sm font-medium">
          {action.label}
        </button>
      )}
    </div>
  )
}
