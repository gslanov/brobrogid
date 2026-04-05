import { Copy } from 'lucide-react'

type DayKey = 'mon' | 'tue' | 'wed' | 'thu' | 'fri' | 'sat' | 'sun'

interface HoursEditorProps {
  label: string
  value: { mon?: string; tue?: string; wed?: string; thu?: string; fri?: string; sat?: string; sun?: string }
  onChange: (value: { mon?: string; tue?: string; wed?: string; thu?: string; fri?: string; sat?: string; sun?: string }) => void
}

const DAYS: { key: DayKey; label: string }[] = [
  { key: 'mon', label: 'Mon' },
  { key: 'tue', label: 'Tue' },
  { key: 'wed', label: 'Wed' },
  { key: 'thu', label: 'Thu' },
  { key: 'fri', label: 'Fri' },
  { key: 'sat', label: 'Sat' },
  { key: 'sun', label: 'Sun' },
]

export function HoursEditor({ label, value, onChange }: HoursEditorProps) {
  const handleDay = (key: DayKey, text: string) => {
    onChange({ ...value, [key]: text || undefined })
  }

  const copyMonToAll = () => {
    const monValue = value.mon ?? ''
    const updated: typeof value = {}
    for (const { key } of DAYS) {
      updated[key] = monValue || undefined
    }
    onChange(updated)
  }

  return (
    <fieldset className="rounded border border-gray-300 bg-white px-3 pt-1 pb-3">
      <legend className="flex items-center gap-2 px-1">
        <span className="text-sm font-medium text-gray-700">{label}</span>
        <button
          type="button"
          onClick={copyMonToAll}
          title="Copy Mon to all days"
          className="flex items-center gap-1 text-xs text-blue-500 hover:text-blue-700 transition-colors"
        >
          <Copy size={12} />
          Copy Mon to all
        </button>
      </legend>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1.5 mt-1">
        {DAYS.map(({ key, label: dayLabel }) => (
          <div key={key} className="flex items-center gap-2">
            <span className="w-8 text-xs font-medium text-gray-500 flex-shrink-0">{dayLabel}</span>
            <input
              type="text"
              value={value[key] ?? ''}
              onChange={(e) => handleDay(key, e.target.value)}
              placeholder="09:00-21:00"
              className="flex-1 min-w-0 rounded border border-gray-300 px-2 py-1 text-sm text-gray-800 bg-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
            />
          </div>
        ))}
      </div>
    </fieldset>
  )
}
