import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Save, X } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useAdminData } from '../hooks/useAdminData'
import { LocalizedInput } from '../components/LocalizedInput'
import { LocalizedTextarea } from '../components/LocalizedTextarea'
import SelectField from '../components/SelectField'
import { TagsInput } from '../components/TagsInput'
import type { MenuItem, POI } from '@/data/types'

function generateId(): string {
  return `mi-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`
}

const EMPTY: Omit<MenuItem, 'id'> = {
  poiId: '',
  name: { ru: '', en: '' },
  description: { ru: '', en: '' },
  price: 0,
  currency: 'RUB',
  category: '',
  photo: '',
  isPopular: false,
  tags: [],
}

export default function AdminMenuItemForm() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { t } = useTranslation()
  const isEdit = id !== 'new' && id !== undefined

  const { getById, create, update } = useAdminData<MenuItem>('menuItems')
  const { items: pois } = useAdminData<POI>('pois')

  const [form, setForm] = useState<MenuItem>({
    id: generateId(),
    ...EMPTY,
  })
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!isEdit) return
    getById(id!).then((item) => {
      if (item) setForm(item)
    })
  }, [id, isEdit, getById])

  const poiOptions = pois
    .filter((p) => p.hasMenu)
    .map((p) => ({ value: p.id, label: p.name.ru }))

  function set<K extends keyof MenuItem>(key: K, value: MenuItem[K]) {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    if (!form.poiId) {
      setError('Please select a POI.')
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
      navigate('/admin/menu-items')
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
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            {isEdit ? t('admin.menuItems.form.editTitle') : t('admin.menuItems.form.newTitle')}
          </h2>
          {isEdit && (
            <p className="text-xs text-gray-400 mt-0.5 font-mono">{form.id}</p>
          )}
        </div>
      </div>

      <form onSubmit={handleSave} className="flex flex-col gap-6">
        {/* ID (readonly in edit mode) */}
        {isEdit && (
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-gray-700">{t('admin.common.id')}</label>
            <input
              type="text"
              value={form.id}
              readOnly
              className="w-full rounded border border-gray-200 px-3 py-1.5 text-sm text-gray-400 bg-gray-50 font-mono cursor-not-allowed"
            />
          </div>
        )}

        {/* POI */}
        <SelectField
          label={t('admin.menuItems.form.poi')}
          value={form.poiId}
          onChange={(v) => set('poiId', v)}
          options={poiOptions}
          required
          placeholder={t('admin.menuItems.form.poiPlaceholder')}
        />

        {/* Name */}
        <LocalizedInput
          label={t('admin.menuItems.form.name')}
          value={form.name}
          onChange={(v) => set('name', v)}
          required
          placeholder={t('admin.menuItems.form.namePlaceholder')}
        />

        {/* Description */}
        <LocalizedTextarea
          label={t('admin.menuItems.form.description')}
          value={form.description}
          onChange={(v) => set('description', v)}
          placeholder={t('admin.menuItems.form.descPlaceholder')}
          rows={3}
        />

        {/* Price + Currency row */}
        <div className="flex gap-4 items-end">
          <div className="flex flex-col gap-1 flex-1">
            <label className="text-sm font-medium text-gray-700">
              {t('admin.menuItems.form.price')} <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              min={0}
              step={1}
              value={form.price}
              onChange={(e) => set('price', Number(e.target.value))}
              className="w-full rounded border border-gray-300 px-3 py-1.5 text-sm text-gray-800 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
              required
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-gray-700">{t('admin.menuItems.form.currency')}</label>
            <div className="rounded border border-gray-200 bg-gray-50 px-3 py-1.5 text-sm text-gray-500 select-none">
              RUB
            </div>
          </div>
        </div>

        {/* Category */}
        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-gray-700">{t('admin.menuItems.form.category')}</label>
          <input
            type="text"
            value={form.category}
            onChange={(e) => set('category', e.target.value)}
            placeholder="e.g. Soups, Grills, Desserts"
            className="w-full rounded border border-gray-300 px-3 py-1.5 text-sm text-gray-800 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
          />
        </div>

        {/* Photo */}
        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-gray-700">{t('admin.menuItems.form.photo')}</label>
          <input
            type="text"
            value={form.photo ?? ''}
            onChange={(e) => set('photo', e.target.value)}
            placeholder="https://example.com/photo.jpg"
            className="w-full rounded border border-gray-300 px-3 py-1.5 text-sm text-gray-800 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
          />
        </div>

        {/* isPopular */}
        <label className="flex items-center gap-2 cursor-pointer select-none w-fit">
          <input
            type="checkbox"
            checked={form.isPopular}
            onChange={(e) => set('isPopular', e.target.checked)}
            className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          />
          <span className="text-sm font-medium text-gray-700">{t('admin.menuItems.form.isPopular')}</span>
        </label>

        {/* Tags */}
        <TagsInput
          label={t('admin.menuItems.form.tags')}
          value={form.tags}
          onChange={(v) => set('tags', v)}
          placeholder={t('admin.menuItems.form.tagPlaceholder')}
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
            onClick={() => navigate('/admin/menu-items')}
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
