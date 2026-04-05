import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { PageHeader } from '@/shared/ui/PageHeader'
import { getDB } from '@/data/db'
import type { EmergencyContact, EmergencyType } from '@/data/types'

const TYPE_INFO: Record<EmergencyType, { icon: string; color: string }> = {
  police: { icon: '\u{1F46E}', color: '#3b82f6' },
  ambulance: { icon: '\u{1F691}', color: '#ef4444' },
  fire: { icon: '\u{1F692}', color: '#f97316' },
  hospital: { icon: '\u{1F3E5}', color: '#10b981' },
  trauma: { icon: '\u{1FA79}', color: '#8b5cf6' },
  pharmacy: { icon: '\u{1F48A}', color: '#14b8a6' },
}

export default function EmergencyPage() {
  const { t, i18n } = useTranslation()
  const lang = i18n.language as 'ru' | 'en'
  const [contacts, setContacts] = useState<EmergencyContact[]>([])

  useEffect(() => { getDB().then(db => db.getAll('emergency')).then(setContacts) }, [])

  const quickDial = [
    { label: '112', sublabel: '\u0415\u0434\u0438\u043D\u044B\u0439', icon: '\u{1F4DE}', color: '#ef4444' },
    { label: '102', sublabel: t('emergency.police'), icon: '\u{1F46E}', color: '#3b82f6' },
    { label: '103', sublabel: t('emergency.ambulance'), icon: '\u{1F691}', color: '#ef4444' },
    { label: '101', sublabel: t('emergency.fire'), icon: '\u{1F692}', color: '#f97316' },
  ]

  const grouped = contacts.reduce<Record<string, EmergencyContact[]>>((acc, c) => {
    (acc[c.type] ||= []).push(c)
    return acc
  }, {})

  return (
    <div className="min-h-dvh bg-[var(--color-bg)]">
      <PageHeader title={t('emergency.title')} showBack />

      <div className="grid grid-cols-4 gap-2 px-4 py-4">
        {quickDial.map((d) => (
          <a key={d.label} href={`tel:${d.label}`} className="flex flex-col items-center gap-1 py-3 bg-white rounded-2xl shadow-sm border border-[var(--color-border)]">
            <span className="text-2xl">{d.icon}</span>
            <span className="text-lg font-bold" style={{ color: d.color }}>{d.label}</span>
            <span className="text-[11px] text-[var(--color-text-secondary)]">{d.sublabel}</span>
          </a>
        ))}
      </div>

      {Object.entries(grouped).map(([type, items]) => {
        const info = TYPE_INFO[type as EmergencyType]
        return (
          <div key={type} className="px-4 mt-4">
            <h3 className="font-semibold text-sm mb-2 flex items-center gap-2">
              <span>{info.icon}</span>
              {t(`emergency.${type}`)}
            </h3>
            <div className="space-y-2">
              {items.map((c) => (
                <div key={c.id} className="bg-white rounded-xl p-3 border border-[var(--color-border)]">
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-medium text-sm">{c.name[lang]}</h4>
                      <p className="text-xs text-[var(--color-text-secondary)] mt-0.5">{c.location.address[lang]}</p>
                      {c.is24h && <span className="text-[11px] text-green-600 font-medium">{'\u{1F7E2}'} 24/7</span>}
                    </div>
                    <a href={`tel:${c.phone}`} className="flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center" style={{ background: info.color + '15', color: info.color }}>
                      {'\u{1F4DE}'}
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )
      })}
    </div>
  )
}
