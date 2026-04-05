import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Save, X } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useAdminData } from '../hooks/useAdminData'
import { LocalizedInput } from '../components/LocalizedInput'
import { LocalizedTextarea } from '../components/LocalizedTextarea'
import SelectField from '../components/SelectField'
import { DatesEditor } from '../components/DatesEditor'
import { LocationPicker } from '../components/LocationPicker'
import { RouteEditor } from '../components/RouteEditor'
import { PhotosManager } from '../components/PhotosManager'
import type { Tour, TourType, TourStatus, Guide } from '@/data/types'

function generateId(): string {
  return `tour-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`
}

const EMPTY_TOUR: Omit<Tour, 'id'> = {
  name: { ru: '', en: '' },
  description: { ru: '', en: '' },
  guideId: '',
  price: 0,
  duration: '',
  type: 'walking',
  maxGroupSize: 10,
  currentGroupSize: 0,
  status: 'recruiting',
  dates: [],
  meetingPoint: { lat: 43.02, lng: 44.68, address: { ru: '', en: '' } },
  route: [],
  rating: 0,
  reviewCount: 0,
  photos: [],
  category: '',
}

// labelKey arrays — resolved inside component via t()
const TYPE_OPTIONS: { value: string; labelKey: string }[] = [
  { value: 'walking', labelKey: 'admin.tours.types.walking' },
  { value: 'driving', labelKey: 'admin.tours.types.driving' },
  { value: 'mixed', labelKey: 'admin.tours.types.mixed' },
]

const STATUS_OPTIONS: { value: string; labelKey: string }[] = [
  { value: 'recruiting', labelKey: 'admin.tours.statuses.recruiting' },
  { value: 'full', labelKey: 'admin.tours.statuses.full' },
  { value: 'completed', labelKey: 'admin.tours.statuses.completed' },
]

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide border-b border-gray-200 pb-2 mt-2">
      {children}
    </h3>
  )
}

export default function AdminTourForm() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { t } = useTranslation()
  const isEdit = id !== 'new' && id !== undefined

  const { getById, create, update } = useAdminData<Tour>('tours')
  const { items: guides } = useAdminData<Guide>('guides')

  const [form, setForm] = useState<Tour>({
    id: generateId(),
    ...EMPTY_TOUR,
  })
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const typeOptions = TYPE_OPTIONS.map((o) => ({ value: o.value, label: t(o.labelKey) }))
  const statusOptions = STATUS_OPTIONS.map((o) => ({ value: o.value, label: t(o.labelKey) }))

  useEffect(() => {
    if (!isEdit) return
    getById(id!).then((item) => {
      if (item) setForm(item)
    })
  }, [id, isEdit, getById])

  const guideOptions = guides.map((g) => ({
    value: g.id,
    label: g.name.ru,
  }))

  function set<K extends keyof Tour>(key: K, value: Tour[K]) {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    if (!form.name.ru.trim()) {
      setError('Name (RU) is required.')
      return
    }
    if (!form.guideId) {
      setError('Please select a guide.')
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
      navigate('/admin/tours')
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
          {isEdit ? t('admin.tours.form.editTitle') : t('admin.tours.form.newTitle')}
        </h2>
        {isEdit && (
          <p className="text-xs text-gray-400 mt-0.5 font-mono">{form.id}</p>
        )}
      </div>

      <form onSubmit={handleSave} className="flex flex-col gap-6">

        {/* ── Basic Info ─────────────────────────────────────── */}
        <SectionTitle>{t('admin.tours.form.basicInfo')}</SectionTitle>

        <LocalizedInput
          label={t('admin.tours.form.name')}
          value={form.name}
          onChange={(v) => set('name', v)}
          required
          placeholder={t('admin.tours.form.namePlaceholder')}
        />

        <LocalizedTextarea
          label={t('admin.tours.form.description')}
          value={form.description}
          onChange={(v) => set('description', v)}
          placeholder={t('admin.tours.form.descPlaceholder')}
          rows={4}
        />

        <div className="flex gap-4">
          <div className="flex flex-col gap-1 flex-1">
            <label className="text-sm font-medium text-gray-700">
              {t('admin.tours.form.price')} <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              min={0}
              step={1}
              value={form.price}
              onChange={(e) => set('price', Number(e.target.value))}
              required
              className="w-full rounded border border-gray-300 px-3 py-1.5 text-sm text-gray-800 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
            />
          </div>
          <div className="flex flex-col gap-1 flex-1">
            <label className="text-sm font-medium text-gray-700">{t('admin.tours.form.duration')}</label>
            <input
              type="text"
              value={form.duration}
              onChange={(e) => set('duration', e.target.value)}
              placeholder="e.g. 3 hours"
              className="w-full rounded border border-gray-300 px-3 py-1.5 text-sm text-gray-800 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
            />
          </div>
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-gray-700">{t('admin.tours.form.category')}</label>
          <input
            type="text"
            value={form.category}
            onChange={(e) => set('category', e.target.value)}
            placeholder="e.g. History, Nature, Gastro"
            className="w-full rounded border border-gray-300 px-3 py-1.5 text-sm text-gray-800 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <SelectField
            label={t('admin.tours.form.type')}
            value={form.type}
            onChange={(v) => set('type', v as TourType)}
            options={typeOptions}
            required
          />
          <SelectField
            label={t('admin.tours.form.status')}
            value={form.status}
            onChange={(v) => set('status', v as TourStatus)}
            options={statusOptions}
            required
          />
        </div>

        {/* ── Guide & Schedule ───────────────────────────────── */}
        <SectionTitle>{t('admin.tours.form.guideSchedule')}</SectionTitle>

        <SelectField
          label={t('admin.tours.form.guide')}
          value={form.guideId}
          onChange={(v) => set('guideId', v)}
          options={guideOptions}
          required
          placeholder={t('admin.tours.form.guidePlaceholder')}
        />

        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-gray-700">{t('admin.tours.form.maxGroupSize')}</label>
            <input
              type="number"
              min={1}
              value={form.maxGroupSize}
              onChange={(e) => set('maxGroupSize', Number(e.target.value))}
              className="w-full rounded border border-gray-300 px-3 py-1.5 text-sm text-gray-800 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-gray-700">{t('admin.tours.form.currentGroupSize')}</label>
            <input
              type="number"
              min={0}
              value={form.currentGroupSize}
              onChange={(e) => set('currentGroupSize', Number(e.target.value))}
              className="w-full rounded border border-gray-300 px-3 py-1.5 text-sm text-gray-800 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
            />
          </div>
        </div>

        <DatesEditor
          label={t('admin.tours.form.dates')}
          value={form.dates}
          onChange={(v) => set('dates', v)}
        />

        {/* ── Route ─────────────────────────────────────────── */}
        <SectionTitle>{t('admin.tours.form.route')}</SectionTitle>

        <LocationPicker
          label={t('admin.tours.form.meetingPoint')}
          value={form.meetingPoint}
          onChange={(v) => set('meetingPoint', v)}
        />

        <RouteEditor
          label={t('admin.tours.form.routeCoords')}
          value={form.route}
          onChange={(v) => set('route', v)}
        />

        {/* ── Media ─────────────────────────────────────────── */}
        <SectionTitle>{t('admin.tours.form.media')}</SectionTitle>

        <PhotosManager
          label={t('admin.tours.form.photos')}
          value={form.photos}
          onChange={(v) => set('photos', v)}
        />

        {/* ── Stats ─────────────────────────────────────────── */}
        <SectionTitle>{t('admin.tours.form.stats')}</SectionTitle>

        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-gray-700">{t('admin.tours.form.rating')}</label>
            <input
              type="number"
              min={0}
              max={5}
              step={0.1}
              value={form.rating}
              onChange={(e) => set('rating', Number(e.target.value))}
              className="w-full rounded border border-gray-300 px-3 py-1.5 text-sm text-gray-800 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-gray-700">{t('admin.tours.form.reviewCount')}</label>
            <input
              type="number"
              min={0}
              value={form.reviewCount}
              onChange={(e) => set('reviewCount', Number(e.target.value))}
              className="w-full rounded border border-gray-300 px-3 py-1.5 text-sm text-gray-800 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
            />
          </div>
        </div>

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
            onClick={() => navigate('/admin/tours')}
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
