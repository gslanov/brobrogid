import { useTranslation } from 'react-i18next'
import { Trash2, Plus } from 'lucide-react'
import { LocalizedInput } from './LocalizedInput'

interface Stop {
  name: { ru: string; en: string }
  location: { lat: number; lng: number }
}

interface StopsEditorProps {
  label: string
  value: Stop[]
  onChange: (value: Stop[]) => void
}

const emptyStop = (): Stop => ({
  name: { ru: '', en: '' },
  location: { lat: 0, lng: 0 },
})

export function StopsEditor({ label, value, onChange }: StopsEditorProps) {
  const { t } = useTranslation()

  const addStop = () => {
    onChange([...value, emptyStop()])
  }

  const removeStop = (index: number) => {
    onChange(value.filter((_, i) => i !== index))
  }

  const updateStop = (index: number, updated: Stop) => {
    onChange(value.map((s, i) => (i === index ? updated : s)))
  }

  return (
    <div className="flex flex-col gap-3">
      <label className="text-sm font-medium text-gray-700">{label}</label>

      {value.length > 0 && (
        <ul className="flex flex-col gap-3">
          {value.map((stop, i) => (
            <li key={i} className="p-3 rounded border border-gray-200 bg-gray-50">
              {/* Header row */}
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  #{i + 1}
                </span>
                <button
                  type="button"
                  onClick={() => removeStop(i)}
                  className="text-gray-400 hover:text-red-500 transition-colors"
                  aria-label={`Remove stop #${i + 1}`}
                >
                  <Trash2 size={15} />
                </button>
              </div>

              {/* Name */}
              <div className="mb-2">
                <LocalizedInput
                  label={t('admin.common.name')}
                  value={stop.name}
                  onChange={(name) => updateStop(i, { ...stop, name })}
                />
              </div>

              {/* Coordinates */}
              <div className="flex gap-2">
                <div className="flex-1 flex flex-col gap-1">
                  <label className="text-xs text-gray-500">{t('admin.common.lat')}</label>
                  <input
                    type="number"
                    step="any"
                    value={stop.location.lat}
                    onChange={(e) =>
                      updateStop(i, {
                        ...stop,
                        location: { ...stop.location, lat: parseFloat(e.target.value) || 0 },
                      })
                    }
                    className="rounded border border-gray-300 px-2 py-1.5 text-sm text-gray-800 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                  />
                </div>
                <div className="flex-1 flex flex-col gap-1">
                  <label className="text-xs text-gray-500">{t('admin.common.lng')}</label>
                  <input
                    type="number"
                    step="any"
                    value={stop.location.lng}
                    onChange={(e) =>
                      updateStop(i, {
                        ...stop,
                        location: { ...stop.location, lng: parseFloat(e.target.value) || 0 },
                      })
                    }
                    className="rounded border border-gray-300 px-2 py-1.5 text-sm text-gray-800 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                  />
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}

      <button
        type="button"
        onClick={addStop}
        className="inline-flex items-center gap-1.5 self-start px-3 py-1.5 rounded border border-dashed border-gray-400 text-sm text-gray-600 bg-white hover:bg-gray-50 hover:border-gray-500 transition-colors"
      >
        <Plus size={14} />
        {t('admin.common.addStop')}
      </button>
    </div>
  )
}
