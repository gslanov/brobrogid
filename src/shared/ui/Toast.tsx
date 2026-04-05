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

const BG: Record<string, string> = {
  info: 'bg-gray-800',
  success: 'bg-green-700',
  error: 'bg-red-700',
  warning: 'bg-amber-600',
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
            className={`${BG[toast.type]} text-white rounded-xl px-4 py-3 shadow-lg max-w-sm w-full flex items-center gap-3 pointer-events-auto cursor-grab active:cursor-grabbing`}
            role="alert"
          >
            <span className="flex-shrink-0">{(() => { const Icon = ICONS[toast.type]; return <Icon size={18} /> })()}</span>
            <span className="text-sm font-medium flex-1">{toast.message}</span>
            {toast.action && (
              <button
                onClick={() => {
                  toast.action!.onClick()
                  removeToast(toast.id)
                }}
                className="text-sm font-bold underline flex-shrink-0"
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
