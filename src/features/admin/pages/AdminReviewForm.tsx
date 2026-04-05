import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Save, X, Loader2, Star } from 'lucide-react'
import { useAdminData } from '../hooks/useAdminData'
import { adminGetAll } from '../lib/admin-db'
import SelectField from '../components/SelectField'
import { AdminFormField } from '../components/AdminFormField'
import type { Review, ReviewTargetType, POI, Tour, Guide } from '@/data/types'

interface TargetOption {
  value: string
  label: string
}

const TARGET_TYPE_OPTIONS = [
  { value: 'poi', label: 'POI' },
  { value: 'tour', label: 'Tour' },
  { value: 'guide', label: 'Guide' },
]

function generateId(): string {
  return `review-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`
}

const EMPTY_REVIEW: Omit<Review, 'id'> = {
  targetType: 'poi',
  targetId: '',
  authorName: '',
  authorAvatar: '',
  rating: 5,
  text: '',
  date: new Date().toISOString().slice(0, 10),
  isGenerated: false,
}

function StarRatingInput({
  value,
  onChange,
}: {
  value: number
  onChange: (v: number) => void
}) {
  const [hovered, setHovered] = useState<number | null>(null)
  const display = hovered ?? value

  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => onChange(star)}
          onMouseEnter={() => setHovered(star)}
          onMouseLeave={() => setHovered(null)}
          className="transition-transform hover:scale-110"
          aria-label={`${star} stars`}
        >
          <Star
            size={24}
            className={
              star <= display
                ? 'text-amber-400 fill-amber-400'
                : 'text-gray-300 fill-gray-100'
            }
          />
        </button>
      ))}
      <span className="ml-2 text-sm font-medium text-gray-700">{value} / 5</span>
    </div>
  )
}

async function loadTargetOptions(type: ReviewTargetType): Promise<TargetOption[]> {
  if (type === 'poi') {
    const pois = await adminGetAll<POI>('pois')
    return pois.map((p) => ({ value: p.id, label: p.name.ru }))
  }
  if (type === 'tour') {
    const tours = await adminGetAll<Tour>('tours')
    return tours.map((t) => ({ value: t.id, label: t.name.ru }))
  }
  // guide
  const guides = await adminGetAll<Guide>('guides')
  return guides.map((g) => ({ value: g.id, label: g.name.ru }))
}

export default function AdminReviewForm() {
  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>()
  const isEdit = !!id && id !== 'new'

  const { getById, create, update } = useAdminData<Review>('reviews')

  const [form, setForm] = useState<Review>({ id: generateId(), ...EMPTY_REVIEW })
  const [isLoading, setIsLoading] = useState(isEdit)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [targetOptions, setTargetOptions] = useState<TargetOption[]>([])
  const [targetOptionsLoading, setTargetOptionsLoading] = useState(false)

  // Load form data in edit mode
  useEffect(() => {
    if (!isEdit) return
    setIsLoading(true)
    getById(id!).then((item) => {
      if (item) {
        setForm(item)
      } else {
        setError('Review not found.')
      }
      setIsLoading(false)
    })
  }, [id, isEdit, getById])

  // Load target options when targetType changes
  useEffect(() => {
    setTargetOptionsLoading(true)
    loadTargetOptions(form.targetType).then((opts) => {
      setTargetOptions(opts)
      setTargetOptionsLoading(false)
    })
  }, [form.targetType])

  function patch<K extends keyof Review>(key: K, value: Review[K]) {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  function handleTargetTypeChange(type: string) {
    setForm((prev) => ({
      ...prev,
      targetType: type as ReviewTargetType,
      targetId: '',
    }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.targetId) {
      setError('Please select a target.')
      return
    }
    setIsSaving(true)
    setError(null)
    try {
      if (isEdit) {
        await update(form)
      } else {
        await create(form)
      }
      navigate('/admin/reviews')
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
    <div className="p-8 max-w-2xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">
            {isEdit ? 'Edit Review' : 'New Review'}
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {isEdit ? `ID: ${form.id}` : 'A new review will be created'}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => navigate('/admin/reviews')}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-300 text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors"
          >
            <X size={16} />
            Cancel
          </button>
          <button
            form="review-form"
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

      <form id="review-form" onSubmit={handleSubmit} className="flex flex-col gap-6">
        {/* Target Type */}
        <SelectField
          label="Target Type"
          required
          value={form.targetType}
          onChange={handleTargetTypeChange}
          options={TARGET_TYPE_OPTIONS}
        />

        {/* Target ID — cascading */}
        <div className="flex flex-col gap-1">
          <SelectField
            label="Target"
            required
            value={form.targetId}
            onChange={(v) => patch('targetId', v)}
            options={targetOptions}
            placeholder={
              targetOptionsLoading
                ? 'Loading…'
                : targetOptions.length === 0
                  ? 'No items found'
                  : '— Select target —'
            }
          />
          {targetOptionsLoading && (
            <p className="text-xs text-gray-400 flex items-center gap-1">
              <Loader2 size={11} className="animate-spin" />
              Loading {form.targetType}s…
            </p>
          )}
        </div>

        {/* Author Name */}
        <AdminFormField label="Author Name" required>
          <input
            type="text"
            value={form.authorName}
            onChange={(e) => patch('authorName', e.target.value)}
            required
            placeholder="John Doe"
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </AdminFormField>

        {/* Author Avatar */}
        <AdminFormField label="Author Avatar URL">
          <input
            type="text"
            value={form.authorAvatar ?? ''}
            onChange={(e) => patch('authorAvatar', e.target.value)}
            placeholder="https://example.com/avatar.jpg"
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </AdminFormField>

        {/* Rating — visual stars + number */}
        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium text-gray-700">
            Rating <span className="text-red-500">*</span>
          </label>
          <StarRatingInput
            value={form.rating}
            onChange={(v) => patch('rating', v)}
          />
          <input
            type="number"
            min={1}
            max={5}
            step={1}
            value={form.rating}
            onChange={(e) => patch('rating', parseInt(e.target.value) || 1)}
            className="w-24 px-3 py-2 text-sm border border-gray-300 rounded-lg bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* Review Text */}
        <AdminFormField label="Review Text">
          <textarea
            value={form.text}
            onChange={(e) => patch('text', e.target.value)}
            rows={4}
            placeholder="Write a review…"
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-y"
          />
        </AdminFormField>

        {/* Date */}
        <AdminFormField label="Date" required>
          <input
            type="date"
            value={form.date}
            onChange={(e) => patch('date', e.target.value)}
            required
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </AdminFormField>

        {/* Is Generated */}
        <div className="flex items-center gap-3">
          <input
            id="isGenerated"
            type="checkbox"
            checked={form.isGenerated}
            onChange={(e) => patch('isGenerated', e.target.checked)}
            className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
          />
          <label htmlFor="isGenerated" className="text-sm font-medium text-gray-700 select-none cursor-pointer">
            AI-generated review
          </label>
        </div>
      </form>
    </div>
  )
}
