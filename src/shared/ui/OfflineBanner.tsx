import { useState, useEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { useOnlineStatus } from '@/shared/hooks/useOnlineStatus'
import { useToast } from '@/data/stores/toast-store'
import { AlertTriangle, X } from 'lucide-react'

export function OfflineBanner() {
  const online = useOnlineStatus()
  const { t } = useTranslation()
  const toast = useToast()
  const [dismissed, setDismissed] = useState(false)
  const wasOffline = useRef(false)

  useEffect(() => {
    if (!online) {
      wasOffline.current = true
      setDismissed(false)
    } else if (wasOffline.current) {
      wasOffline.current = false
      toast.show(t('offline.backOnline', "You're back online"), { type: 'success' })
    }
  }, [online, toast, t])

  if (online || dismissed) return null

  return (
    <div className="bg-amber-100 text-amber-800 px-4 py-2 flex items-center justify-between text-sm">
      <span className="flex items-center gap-1.5"><AlertTriangle size={16} /> {t('offline.banner', "You're offline. Some features may be limited.")}</span>
      <button onClick={() => setDismissed(true)} className="text-amber-600 font-bold ml-2"><X size={16} /></button>
    </div>
  )
}
