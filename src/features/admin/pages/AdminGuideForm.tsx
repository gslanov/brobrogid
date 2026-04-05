import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Save, X, Loader2 } from 'lucide-react'
import { useAdminData } from '../hooks/useAdminData'
import { LocalizedInput } from '../components/LocalizedInput'
import { LocalizedTextarea } from '../components/LocalizedTextarea'
import { TagsInput } from '../components/TagsInput'
import { AdminFormField } from '../components/AdminFormField'
import type { Guide } from '@/data/types'

const EMPTY_GUIDE: Omit<Guide, 'id'> = {
  name: { ru: '', en: '' },
  bio: { ru: '', en: '' },
  photo: '',
  languages: [],
  rating: 0,
  reviewCount: 0,
  tourCount: 0,
  specializations: [],
}

function generateId(): string {
  return `guide-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`
}

export default function AdminGuideForm() {
  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>()
  const isEdit = !!id && id !== 'new'

  const { getById, create, update } = useAdminData<Guide>('guides')

  const [form, setForm] = useState<Guide>({ id: generateId(), ...EMPTY_GUIDE })
  const [isLoading, setIsLoading] = useState(isEdit)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!isEdit) return
    setIsLoading(true)
    getById(id!).then((item) => {
      if (item) {
        setForm(item)
      } else {
        setError('Guide not found.')
      }
      setIsLoading(false)
    })
  }, [id, isEdit, getById])

  function patch<K extends keyof Guide>(key: K, value: Guide[K]) {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setIsSaving(true)
    setError(null)
    try {
      if (isEdit) {
        await update(form)
      } else {
        await create(form)
      }
      navigate('/admin/guides')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Save failed.')
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return (
      <div className="p-8 flex items-center justify-center">
        <Loader2 size={24} className="animate-spin text-gray-400" />
      </div>
    )
  }

  return (
    <div className="p-8 max-w-3xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">
            {isEdit ? 'Edit Guide' : 'New Guide'}
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {isEdit ? `ID: ${form.id}` : 'A new guide will be created'}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => navigate('/admin/guides')}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-300 text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors"
          >
            <X size={16} />
            Cancel
          </button>
          <button
            form="guide-form"
            type="submit"
            disabled={isSaving}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 disabled:opacity-60 transition-colors"
          >
            {isSaving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
            Save
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-6 px-4 py-3 rounded-lg bg-red-50 border border-red-200 text-sm text-red-700">
          {error}
        </div>
      )}

      <form id="guide-form" onSubmit={handleSubmit} className="flex flex-col gap-6">
        {/* ID — readonly in edit mode */}
        {isEdit && (
          <AdminFormField label="ID">
            <input
              type="text"
              value={form.id}
              readOnly
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg bg-gray-50 text-gray-500 cursor-not-allowed"
            />
          </AdminFormField>
        )}

        {/* Name */}
        <LocalizedInput
          label="Name"
          required
          value={form.name}
          onChange={(v) => patch('name', v)}
          placeholder="Guide name"
        />

        {/* Bio */}
        <LocalizedTextarea
          label="Bio"
          value={form.bio}
          onChange={(v) => patch('bio', v)}
          rows={5}
          placeholder="Short biography"
        />

        {/* Photo URL + preview */}
        <div className="flex flex-col gap-2">
          <AdminFormField label="Photo URL">
            <input
              type="text"
              value={form.photo}
              onChange={(e) => patch('photo', e.target.value)}
              placeholder="https://example.com/photo.jpg"
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </AdminFormField>
          {form.photo && (
            <img
              src={form.photo}
              alt="Preview"
              className="h-28 w-28 object-cover rounded-xl border border-gray-200 mt-1"
              onError={(e) => {
                ;(e.target as HTMLImageElement).style.display = 'none'
              }}
            />
          )}
        </div>

        {/* Languages */}
        <TagsInput
          label="Languages"
          value={form.languages}
          onChange={(v) => patch('languages', v)}
          placeholder="e.g. Russian, English…"
        />

        {/* Specializations */}
        <TagsInput
          label="Specializations"
          value={form.specializations}
          onChange={(v) => patch('specializations', v)}
          placeholder="e.g. History, Trekking…"
        />

        {/* Numeric fields */}
        <div className="grid grid-cols-3 gap-4">
          <AdminFormField label="Rating (0–5)">
            <input
              type="number"
              min={0}
              max={5}
              step={0.1}
              value={form.rating}
              onChange={(e) => patch('rating', parseFloat(e.target.value) || 0)}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </AdminFormField>

          <AdminFormField label="Review Count">
            <input
              type="number"
              min={0}
              step={1}
              value={form.reviewCount}
              onChange={(e) => patch('reviewCount', parseInt(e.target.value) || 0)}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </AdminFormField>

          <AdminFormField label="Tour Count">
            <input
              type="number"
              min={0}
              step={1}
              value={form.tourCount}
              onChange={(e) => patch('tourCount', parseInt(e.target.value) || 0)}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </AdminFormField>
        </div>
      </form>
    </div>
  )
}
