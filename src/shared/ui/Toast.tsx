import { useToastStore } from '@/data/stores/toast-store'
import { AnimatePresence, motion, type PanInfo } from 'framer-motion'
import { Info, CheckCircle, XCircle, AlertTriangle } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

const ICONS: Record<string, LucideIcon> = {
  info: Info,
  success: CheckCircle,
  error: XCircle,
  warning: AlertTriangle,
}

/** Цвет ромба-индикатора слева. Сама плашка везде одна — тёмное стекло. */
const ACCENT: Record<string, string> = {
  info: 'var(--text-2)',
  success: 'var(--success)',
  error: 'var(--danger)',
  warning: 'var(--warning)',
}

export function ToastContainer() {
  const { toasts, removeToast } = useToastStore()

  return (
    <div className="fixed bottom-[calc(var(--bottom-nav-height)+var(--safe-area-bottom)+8px)] left-0 right-0 z-50 flex flex-col items-center gap-2 px-4 pointer-events-none">
      <AnimatePresence>
        {toasts.map((toast) => (
          <motion.div
            key={toast.id}
            initial={{ opacity: 0, y: 40, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2, ease: [0.2, 0, 0, 1] }}
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            onDragEnd={(_: unknown, info: PanInfo) => {
              if (Math.abs(info.offset.x) > 80) removeToast(toast.id)
            }}
            className="glass-strong rounded-[var(--radius-md)] px-4 py-3 max-w-sm w-full flex items-center gap-3 pointer-events-auto cursor-grab active:cursor-grabbing"
            style={{ color: 'var(--text)', boxShadow: 'var(--shadow-3)' }}
            role="alert"
          >
            <span className="flex-shrink-0" style={{ color: ACCENT[toast.type] }}>
              {(() => { const Icon = ICONS[toast.type]; return <Icon size={17} /> })()}
            </span>
            <span className="text-[13px] font-medium flex-1">{toast.message}</span>
            {toast.action && (
              <button
                onClick={() => {
                  toast.action!.onClick()
                  removeToast(toast.id)
                }}
                className="text-[13px] font-bold flex-shrink-0"
                style={{ color: 'var(--terra-hot)' }}
              >
                {toast.action.label}
              </button>
            )}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  )
}
