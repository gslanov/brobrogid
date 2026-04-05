import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Trash2, Plus } from 'lucide-react'

interface DatesEditorProps {
  label: string
  value: string[]
  onChange: (value: string[]) => void
}

const fmt = new Intl.DateTimeFormat(undefined, {
  day: 'numeric',
  month: 'long',
  year: 'numeric',
})

function formatDate(iso: string): string {
  try {
    // Parse YYYY-MM-DD without timezone shift
    const [y, m, d] = iso.split('-').map(Number)
    return fmt.format(new Date(y, m - 1, d))
  } catch {
    return iso
  }
}

export function DatesEditor({ label, value, onChange }: DatesEditorProps) {
  const { t } = useTranslation()
  const [input, setInput] = useState('')

  const addDate = () => {
    if (!input || value.includes(input)) {
      setInput('')
      return
    }
    const next = [...value, input].sort()
    onChange(next)
    setInput('')
  }

  const removeDate = (iso: string) => {
    onChange(value.filter((d) => d !== iso))
  }

  return (
    <div className="flex flex-col gap-2">
      <label className="text-sm font-medium text-gray-700">{label}</label>

      {/* Dates list */}
      {value.length > 0 && (
        <ul className="flex flex-col gap-1">
          {value.map((iso) => (
            <li key={iso} className="flex items-center justify-between px-3 py-1.5 rounded border border-gray-200 bg-gray-50">
              <span className="text-sm text-gray-700">{formatDate(iso)}</span>
              <button
                type="button"
                onClick={() => removeDate(iso)}
                className="text-gray-400 hover:text-red-500 transition-colors ml-2"
                aria-label={`Remove date ${iso}`}
              >
                <Trash2 size={15} />
              </button>
            </li>
          ))}
        </ul>
      )}

      {/* Add row */}
      <div className="flex gap-2">
        <input
          type="date"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addDate())}
          className="flex-1 rounded border border-gray-300 px-3 py-1.5 text-sm text-gray-800 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
        />
        <button
          type="button"
          onClick={addDate}
          className="inline-flex items-center gap-1 px-3 py-1.5 rounded border border-gray-300 text-sm text-gray-600 bg-white hover:bg-gray-50 transition-colors whitespace-nowrap"
        >
          <Plus size={14} />
          {t('admin.common.addDate')}
        </button>
      </div>
    </div>
  )
}
