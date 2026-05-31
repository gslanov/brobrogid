import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Save, X } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useAdminData } from '../hooks/useAdminData'
import { LocalizedInput } from '../components/LocalizedInput'
import SelectField from '../components/SelectField'
import { StopsEditor } from '../components/StopsEditor'
import type { TransportRoute } from '@/data/types'

function generateId(): string {
  return `transport-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`
}

type TransportType = TransportRoute['type']

const EMPTY: Omit<TransportRoute, 'id'> = {
  number: '',
  name: { ru: '', en: '' },
  type: 'bus',
  stops: [],
  schedule: { weekday: '', weekend: '' },
  color: '#3b82f6',
}

// labelKey pattern — resolved inside component
const TYPE_OPTIONS: { value: string; labelKey: string }[] = [
  { value: 'bus', labelKey: 'admin.transport.types.bus' },
  { value: 'marshrutka', labelKey: 'admin.transport.types.marshrutka' },
  { value: 'trolleybus', labelKey: 'admin.transport.types.trolleybus' },
]

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide border-b border-gray-200 pb-2 mt-2">
      {children}
    </h3>
  )
}

export default function AdminTransportForm() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { t } = useTranslation()
  const isEdit = id !== 'new' && id !== undefined

  const { getById, create, update } = useAdminData<TransportRoute>('transport')

  const [form, setForm] = useState<TransportRoute>({
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

  function set<K extends keyof TransportRoute>(key: K, value: TransportRoute[K]) {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  function setSchedule(field: 'weekday' | 'weekend', value: string) {
    setForm((prev) => ({
      ...prev,
      schedule: { weekday: prev.schedule?.weekday ?? '', weekend: prev.schedule?.weekend ?? '', [field]: value },
    }))
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    if (!form.number.trim()) {
      setError('Route number is required.')
      return
    }
    if (!form.name.ru.trim()) {
      setError('Name (RU) is required.')
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
      navigate('/admin/transport')
    } catch (err) {
      console.error(err)
      setError('Save failed. See console for details.')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="p-8 max-w-3xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-gray-900">
          {isEdit ? t('admin.transport.form.editTitle') : t('admin.transport.form.newTitle')}
        </h2>
        {isEdit && (
          <p className="text-xs text-gray-400 mt-0.5 font-mono">{form.id}</p>
        )}
      </div>

      <form onSubmit={handleSave} className="flex flex-col gap-6">

        {/* ── Basic Info ───────────────────────────────────────── */}
        <SectionTitle>{t('admin.tours.form.basicInfo')}</SectionTitle>

        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-gray-700">
              {t('admin.transport.form.number')} <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={form.number}
              onChange={(e) => set('number', e.target.value)}
              placeholder="e.g. 19, 35к"
              className="w-full rounded border border-gray-300 px-3 py-1.5 text-sm text-gray-800 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
            />
          </div>
          <SelectField
            label={t('admin.transport.form.type')}
            value={form.type}
            onChange={(v) => set('type', v as TransportType)}
            options={typeOptions}
            required
          />
        </div>

        <LocalizedInput
          label={t('admin.transport.form.name')}
          value={form.name}
          onChange={(v) => set('name', v)}
          required
          placeholder={t('admin.transport.form.namePlaceholder')}
        />

        {/* ── Color ────────────────────────────────────────────── */}
        <SectionTitle>{t('admin.transport.form.color')}</SectionTitle>

        <div className="flex items-end gap-3">
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-gray-700">{t('admin.transport.form.color')}</label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={form.color}
                onChange={(e) => set('color', e.target.value)}
                className="w-10 h-9 rounded border border-gray-300 cursor-pointer bg-white p-0.5"
              />
              <input
                type="text"
                value={form.color}
                onChange={(e) => set('color', e.target.value)}
                placeholder="#3b82f6"
                maxLength={7}
                className="w-28 rounded border border-gray-300 px-3 py-1.5 text-sm font-mono text-gray-800 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
              />
              <span
                className="w-8 h-8 rounded-full border border-gray-200 flex-shrink-0"
                style={{ backgroundColor: form.color || '#cccccc' }}
              />
            </div>
          </div>
        </div>

        {/* ── Schedule ─────────────────────────────────────────── */}
        <SectionTitle>{t('admin.common.schedule')}</SectionTitle>

        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-gray-700">{t('admin.transport.form.scheduleWeekday')}</label>
            <input
              type="text"
              value={form.schedule?.weekday ?? ''}
              onChange={(e) => setSchedule('weekday', e.target.value)}
              placeholder="e.g. 06:00 – 22:00"
              className="w-full rounded border border-gray-300 px-3 py-1.5 text-sm text-gray-800 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-gray-700">{t('admin.transport.form.scheduleWeekend')}</label>
            <input
              type="text"
              value={form.schedule?.weekend ?? ''}
              onChange={(e) => setSchedule('weekend', e.target.value)}
              placeholder="e.g. 07:00 – 21:00"
              className="w-full rounded border border-gray-300 px-3 py-1.5 text-sm text-gray-800 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
            />
          </div>
        </div>

        {/* ── Stops ────────────────────────────────────────────── */}
        <SectionTitle>{t('admin.transport.form.stops')}</SectionTitle>

        <StopsEditor
          label={t('admin.transport.form.stops')}
          value={form.stops}
          onChange={(v) => set('stops', v)}
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
            onClick={() => navigate('/admin/transport')}
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
