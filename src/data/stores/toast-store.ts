import { create } from 'zustand'

export interface Toast {
  id: string
  message: string
  type: 'info' | 'success' | 'error' | 'warning'
  action?: { label: string; onClick: () => void }
  duration?: number
}

interface ToastStore {
  toasts: Toast[]
  addToast: (toast: Omit<Toast, 'id'>) => void
  removeToast: (id: string) => void
}

const timers = new Map<string, ReturnType<typeof setTimeout>>()

export const useToastStore = create<ToastStore>((set) => ({
  toasts: [],
  addToast: (toast) => {
    const id = crypto.randomUUID()
    set((s) => ({ toasts: [...s.toasts, { ...toast, id }] }))

    const duration = toast.duration ?? 4000
    if (duration > 0) {
      const timer = setTimeout(() => {
        timers.delete(id)
        set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) }))
      }, duration)
      timers.set(id, timer)
    }
  },
  removeToast: (id) => {
    const timer = timers.get(id)
    if (timer) { clearTimeout(timer); timers.delete(id) }
    set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) }))
  },
}))

export function useToast() {
  const { addToast } = useToastStore()
  return {
    show: (message: string, opts?: Partial<Omit<Toast, 'id' | 'message'>>) =>
      addToast({ message, type: 'info', ...opts }),
  }
}
