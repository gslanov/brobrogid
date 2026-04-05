import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Save, X } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useAdminData } from '../hooks/useAdminData'
import { LocalizedInput } from '../components/LocalizedInput'
import { LocationPicker } from '../components/LocationPicker'
import SelectField from '../components/SelectField'
import type { EmergencyContact, EmergencyType } from '@/data/types'

function generateId(): string {
  return `emergency-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`
}

const EMPTY: Omit<EmergencyContact, 'id'> = {
  type: 'police',
  name: { ru: '', en: '' },
  phone: '',
  location: { lat: 43.02, lng: 44.68, address: { ru: '', en: '' } },
  is24h: false,
}

// labelKey pattern — resolved inside component
const TYPE_OPTIONS: { value: string; labelKey: string }[] = [
  { value: 'police', labelKey: 'admin.emergency.types.police' },
  { value: 'ambulance', labelKey: 'admin.emergency.types.ambulance' },
  { value: 'fire', labelKey: 'admin.emergency.types.fire' },
  { value: 'hospital', labelKey: 'admin.emergency.types.hospital' },
  { value: 'trauma', labelKey: 'admin.emergency.types.trauma' },
  { value: 'pharmacy', labelKey: 'admin.emergency.types.pharmacy' },
]

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide border-b border-gray-200 pb-2 mt-2">
      {children}
    </h3>
  )
}

export default function AdminEmergencyForm() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { t } = useTranslation()
  const isEdit = id !== 'new' && id !== undefined

  const { getById, create, update } = useAdminData<EmergencyContact>('emergency')

  const [form, setForm] = useState<EmergencyContact>({
    id: generateId(),
    ...EMPTY,
  })
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const typeOptions = TYPE_OPTIONS.map((o) => ({ value: o.value, label: t(o.labelKey) }))

  useEffect(() => {
    if (!isEdit) return
    getById(id!).then((item) => {
      if (item) setForm(item)
    })
  }, [id, isEdit, getById])

  function set<K extends keyof EmergencyContact>(key: K, value: EmergencyContact[K]) {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    if (!form.name.ru.trim()) {
      setError('Name (RU) is required.')
      return
    }
    if (!form.phone.trim()) {
      setError('Phone is required.')
      return
    }
    setError(null)
    setIsSaving(true)
    try {
      if (isEdit) {
        await update(form)
      } else {
        await create(form)
      }
      navigate('/admin/emergency')
    } catch (err) {
      console.error(err)
      setError('Save failed. See console for details.')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="p-8 max-w-2xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-gray-900">
          {isEdit ? t('admin.emergency.form.editTitle') : t('admin.emergency.form.newTitle')}
        </h2>
        {isEdit && (
          <p className="text-xs text-gray-400 mt-0.5 font-mono">{form.id}</p>
        )}
      </div>

      <form onSubmit={handleSave} className="flex flex-col gap-6">

        {/* ── Details ──────────────────────────────────────────── */}
        <SectionTitle>{t('admin.common.details')}</SectionTitle>

        <SelectField
          label={t('admin.emergency.form.type')}
          value={form.type}
          onChange={(v) => set('type', v as EmergencyType)}
          options={typeOptions}
          required
        />

        <LocalizedInput
          label={t('admin.emergency.form.name')}
          value={form.name}
          onChange={(v) => set('name', v)}
          required
          placeholder={t('admin.emergency.form.namePlaceholder')}
        />

        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-gray-700">
            {t('admin.emergency.form.phone')} <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={form.phone}
            onChange={(e) => set('phone', e.target.value)}
            placeholder="e.g. 112 or +7 (8672) 00-00-00"
            className="w-full rounded border border-gray-300 px-3 py-1.5 text-sm text-gray-800 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
          />
        </div>

        <div className="flex items-center gap-3">
          <input
            id="is24h"
            type="checkbox"
            checked={form.is24h}
            onChange={(e) => set('is24h', e.target.checked)}
            className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          />
          <label htmlFor="is24h" className="text-sm font-medium text-gray-700 cursor-pointer">
            {t('admin.emergency.form.is24h')}
          </label>
        </div>

        {/* ── Location ─────────────────────────────────────────── */}
        <SectionTitle>{t('admin.emergency.form.location')}</SectionTitle>

        <LocationPicker
          label={t('admin.emergency.form.location')}
          value={form.location}
          onChange={(v) => set('location', v)}
        />

        {/* Error */}
        {error && (
          <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-2">
            {error}
          </p>
        )}

        {/* Actions */}
        <div className="flex items-center gap-3 pt-2">
          <button
            type="submit"
            disabled={isSaving}
            className="inline-flex items-center gap-2 px-5 py-2 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 active:bg-blue-800 disabled:opacity-50 transition-colors"
          >
            <Save size={15} />
            {isSaving ? 'Saving…' : t('admin.common.save')}
          </button>
          <button
            type="button"
            onClick={() => navigate('/admin/emergency')}
            className="inline-flex items-center gap-2 px-5 py-2 rounded-lg border border-gray-300 bg-white text-gray-700 text-sm font-medium hover:bg-gray-50 transition-colors"
          >
            <X size={15} />
            {t('admin.common.cancel')}
          </button>
        </div>
      </form>
    </div>
  )
}
