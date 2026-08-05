import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { SEO } from '@/shared/ui/SEO'
import { PageHeader } from '@/shared/ui/PageHeader'
import { getDB } from '@/data/db'
import type { EmergencyContact, EmergencyType } from '@/data/types'

// Цвета приглушены под тёмный фон
const TYPE_INFO: Record<EmergencyType, { icon: string; color: string }> = {
  police: { icon: '\u{1F46E}', color: '#5B93D6' },
  ambulance: { icon: '\u{1F691}', color: '#D9534F' },
  fire: { icon: '\u{1F692}', color: '#E0704A' },
  hospital: { icon: '\u{1F3E5}', color: '#5AA87A' },
  trauma: { icon: '\u{1FA79}', color: '#A98BD8' },
  pharmacy: { icon: '\u{1F48A}', color: '#4FB0A5' },
}

export default function EmergencyPage() {
  const { t, i18n } = useTranslation()
  const lang = i18n.language as 'ru' | 'en'
  const [contacts, setContacts] = useState<EmergencyContact[]>([])

  useEffect(() => { getDB().then(db => db.getAll('emergency')).then(setContacts) }, [])

  const quickDial = [
    { label: '112', sublabel: '\u0415\u0434\u0438\u043D\u044B\u0439', icon: '\u{1F4DE}', color: '#D9534F' },
    { label: '102', sublabel: t('emergency.police'), icon: '\u{1F46E}', color: '#5B93D6' },
    { label: '103', sublabel: t('emergency.ambulance'), icon: '\u{1F691}', color: '#D9534F' },
    { label: '101', sublabel: t('emergency.fire'), icon: '\u{1F692}', color: '#E0704A' },
  ]

  const grouped = contacts.reduce<Record<string, EmergencyContact[]>>((acc, c) => {
    (acc[c.type] ||= []).push(c)
    return acc
  }, {})

  return (
    <div className="min-h-dvh">
      <SEO
        title="Экстренные службы — BROBROGID"
        description="Телефоны экстренных служб Владикавказа: полиция, скорая, пожарная, больницы, аптеки."
        url="/emergency"
      />
      <PageHeader title={t('emergency.title')} showBack />

      <div className="grid grid-cols-4 gap-2 px-4 py-4">
        {quickDial.map((d) => (
          <a
            key={d.label}
            href={`tel:${d.label}`}
            className="flex flex-col items-center gap-1 py-3.5 rounded-[var(--radius-md)]"
            style={{ background: 'var(--surface-1)', border: `1px solid ${d.color}33`, boxShadow: `0 0 20px ${d.color}14` }}
          >
            <span className="text-[22px]">{d.icon}</span>
            <span className="text-[17px] font-bold" style={{ color: d.color }}>{d.label}</span>
            <span className="text-[10.5px]" style={{ color: 'var(--text-3)' }}>{d.sublabel}</span>
          </a>
        ))}
      </div>

      {Object.entries(grouped).map(([type, items]) => {
        const info = TYPE_INFO[type as EmergencyType]
        return (
          <div key={type} className="px-4 mt-4">
            <div className="flex items-center gap-2.5 mb-2.5">
              <span className="text-[15px]">{info.icon}</span>
              <h3 className="font-semibold text-[13.5px]">{t(`emergency.${type}`)}</h3>
              <span className="orn-tail" />
            </div>
            <div className="space-y-2">
              {items.map((c) => (
                <div
                  key={c.id}
                  className="rounded-[var(--radius-md)] p-3.5"
                  style={{ background: 'var(--surface-1)', border: '1px solid var(--color-border)' }}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <h4 className="font-medium text-[13.5px]">{c.name[lang]}</h4>
                      <p className="text-[11.5px] mt-1" style={{ color: 'var(--text-3)' }}>{c.location.address[lang]}</p>
                      {c.is24h && (
                        <span className="text-[11px] font-medium mt-1 inline-block" style={{ color: 'var(--moss-light)' }}>
                          24/7
                        </span>
                      )}
                    </div>
                    <a
                      href={`tel:${c.phone}`}
                      className="relative flex-shrink-0 w-11 h-11 flex items-center justify-center"
                    >
                      <span
                        className="absolute inset-[5px] diamond"
                        style={{ background: info.color + '1F', border: `1px solid ${info.color}55` }}
                      />
                      <span className="relative z-10 text-[14px]">{'\u{1F4DE}'}</span>
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
