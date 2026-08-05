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
    <div
      className="px-4 py-2 flex items-center justify-between text-[12.5px]"
      style={{
        background: 'rgba(224,160,58,0.12)',
        borderBottom: '1px solid rgba(224,160,58,0.28)',
        color: 'var(--warning)',
      }}
    >
      <span className="flex items-center gap-1.5">
        <AlertTriangle size={15} /> {t('offline.banner', "You're offline. Some features may be limited.")}
      </span>
      <button onClick={() => setDismissed(true)} className="font-bold ml-2 opacity-80"><X size={15} /></button>
    </div>
  )
}
