import { useTranslation } from 'react-i18next'
import { LocalizedInput } from './LocalizedInput'

interface LocationPickerProps {
  label: string
  value: { lat: number; lng: number; address: { ru: string; en: string } }
  onChange: (value: { lat: number; lng: number; address: { ru: string; en: string } }) => void
}

export function LocationPicker({ label, value, onChange }: LocationPickerProps) {
  const { t } = useTranslation()

  const handleCoord = (field: 'lat' | 'lng', raw: string) => {
    const parsed = parseFloat(raw)
    onChange({ ...value, [field]: isNaN(parsed) ? 0 : parsed })
  }

  return (
    <fieldset className="rounded border border-gray-300 bg-white px-3 pt-1 pb-3">
      <legend className="px-1 text-sm font-medium text-gray-700">{label}</legend>

      {/* Lat / Lng row */}
      <div className="flex gap-3 mb-3">
        <div className="flex-1 flex flex-col gap-1">
          <label className="text-xs font-medium text-gray-500">{t('admin.common.latitude')}</label>
          <input
            type="number"
            step="any"
            value={value.lat}
            onChange={(e) => handleCoord('lat', e.target.value)}
            className="w-full rounded border border-gray-300 px-3 py-1.5 text-sm text-gray-800 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
          />
        </div>
        <div className="flex-1 flex flex-col gap-1">
          <label className="text-xs font-medium text-gray-500">{t('admin.common.longitude')}</label>
          <input
            type="number"
            step="any"
            value={value.lng}
            onChange={(e) => handleCoord('lng', e.target.value)}
            className="w-full rounded border border-gray-300 px-3 py-1.5 text-sm text-gray-800 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
          />
        </div>
      </div>

      {/* Address */}
      <LocalizedInput
        label={t('admin.common.address')}
        value={value.address}
        onChange={(address) => onChange({ ...value, address })}
        placeholder={t('admin.common.streetPlaceholder')}
      />
    </fieldset>
  )
}
