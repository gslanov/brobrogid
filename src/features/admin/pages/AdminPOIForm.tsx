import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ChevronLeft, Save } from 'lucide-react'
import { useAdminData } from '../hooks/useAdminData'
import { LocalizedInput } from '../components/LocalizedInput'
import { LocalizedTextarea } from '../components/LocalizedTextarea'
import { LocationPicker } from '../components/LocationPicker'
import { HoursEditor } from '../components/HoursEditor'
import { TagsInput } from '../components/TagsInput'
import { PhotosManager } from '../components/PhotosManager'
import SelectField from '../components/SelectField'
import type { POI, POICategory, CuisineType, OperatingHours } from '@/data/types'

// ---------------------------------------------------------------------------
// Transliteration: Cyrillic → Latin
// ---------------------------------------------------------------------------
const TRANSLIT_MAP: Record<string, string> = {
  а: 'a', б: 'b', в: 'v', г: 'g', д: 'd', е: 'e', ё: 'yo', ж: 'zh',
  з: 'z', и: 'i', й: 'y', к: 'k', л: 'l', м: 'm', н: 'n', о: 'o',
  п: 'p', р: 'r', с: 's', т: 't', у: 'u', ф: 'f', х: 'kh', ц: 'ts',
  ч: 'ch', ш: 'sh', щ: 'shch', ъ: '', ы: 'y', ь: '', э: 'e', ю: 'yu',
  я: 'ya',
}

function toSlug(text: string): string {
  return text
    .toLowerCase()
    .split('')
    .map((ch) => TRANSLIT_MAP[ch] ?? (/[a-z0-9]/.test(ch) ? ch : ' '))
    .join('')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
}

// ---------------------------------------------------------------------------
// Select options
// ---------------------------------------------------------------------------
const CATEGORY_OPTIONS: { value: string; label: string }[] = [
  { value: 'attractions', label: 'Attractions' },
  { value: 'food', label: 'Food' },
  { value: 'accommodation', label: 'Accommodation' },
  { value: 'nature', label: 'Nature' },
  { value: 'culture', label: 'Culture' },
  { value: 'shopping', label: 'Shopping' },
  { value: 'nightlife', label: 'Nightlife' },
  { value: 'transport', label: 'Transport' },
  { value: 'activities', label: 'Activities' },
  { value: 'practical', label: 'Practical' },
]

const CUISINE_OPTIONS: { value: string; label: string }[] = [
  { value: 'national', label: 'National' },
  { value: 'european', label: 'European' },
  { value: 'mixed', label: 'Mixed' },
]

const PRICE_LEVEL_OPTIONS: { value: string; label: string }[] = [
  { value: '1', label: '₽ — Budget' },
  { value: '2', label: '₽₽ — Moderate' },
  { value: '3', label: '₽₽₽ — Upscale' },
  { value: '4', label: '₽₽₽₽ — Luxury' },
]

const SUBSCRIPTION_OPTIONS: { value: string; label: string }[] = [
  { value: 'free', label: 'Free' },
  { value: 'premium', label: 'Premium' },
]

// ---------------------------------------------------------------------------
// Empty POI factory
// ---------------------------------------------------------------------------
function emptyPOI(): POI {
  return {
    id: crypto.randomUUID(),
    slug: '',
    name: { ru: '', en: '' },
    category: 'attractions',
    subcategory: '',
    location: { lat: 43.0236, lng: 44.6825, address: { ru: '', en: '' } },
    description: {
      short: { ru: '', en: '' },
      medium: { ru: '', en: '' },
      full: { ru: '', en: '' },
    },
    photos: [],
    rating: 0,
    reviewCount: 0,
    hours: {},
    phone: '',
    website: '',
    tags: [],
    isChain: false,
    subscriptionTier: 'free',
    visitCount: 0,
    hasMenu: false,
    hasDelivery: false,
    externalOrderUrl: '',
  }
}

// ---------------------------------------------------------------------------
// Section wrapper
// ---------------------------------------------------------------------------
function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-4">
      <h2 className="text-base font-semibold text-gray-800 border-b border-gray-200 pb-2">
        {title}
      </h2>
      {children}
    </div>
  )
}

// ---------------------------------------------------------------------------
// Checkbox row helper
// ---------------------------------------------------------------------------
function CheckboxField({
  label,
  checked,
  onChange,
}: {
  label: string
  checked: boolean
  onChange: (v: boolean) => void
}) {
  return (
    <label className="inline-flex items-center gap-2 cursor-pointer select-none">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
      />
      <span className="text-sm font-medium text-gray-700">{label}</span>
    </label>
  )
}

// ---------------------------------------------------------------------------
// Main form component
// ---------------------------------------------------------------------------
export default function AdminPOIForm() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const isCreate = id === 'new'

  const { getById, create, update } = useAdminData<POI>('pois')

  const [form, setForm] = useState<POI>(emptyPOI)
  const [isLoading, setIsLoading] = useState(!isCreate)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Load existing POI in edit mode
  useEffect(() => {
    if (isCreate) return
    let cancelled = false
    setIsLoading(true)
    getById(id!).then((poi) => {
      if (cancelled) return
      if (poi) {
        setForm(poi)
      } else {
        setError('POI not found')
      }
      setIsLoading(false)
    })
    return () => { cancelled = true }
  }, [id, isCreate, getById])

  // ---------------------------------------------------------------------------
  // Field updaters
  // ---------------------------------------------------------------------------
  function set<K extends keyof POI>(key: K, value: POI[K]) {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  function handleNameChange(value: { ru: string; en: string }) {
    setForm((prev) => ({
      ...prev,
      name: value,
      // Auto-generate slug from name.ru only in create mode
      ...(isCreate ? { slug: toSlug(value.ru) } : {}),
    }))
  }

  // ---------------------------------------------------------------------------
  // Save
  // ---------------------------------------------------------------------------
  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    setIsSaving(true)
    setError(null)
    try {
      const payload: POI = {
        ...form,
        // Clean optional empty strings to undefined
        phone: form.phone?.trim() || undefined,
        website: form.website?.trim() || undefined,
        externalOrderUrl: form.externalOrderUrl?.trim() || undefined,
        cuisineType: form.category === 'food' ? form.cuisineType : undefined,
        priceLevel: form.priceLevel ?? undefined,
      }
      if (isCreate) {
        await create(payload)
      } else {
        await update(payload)
      }
      navigate('/admin/pois')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Save failed')
      setIsSaving(false)
    }
  }

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------
  if (isLoading) {
    return (
      <div className="py-16 text-center text-gray-400 text-sm">Loading…</div>
    )
  }

  if (error && !isCreate) {
    return (
      <div className="py-16 text-center text-red-500 text-sm">{error}</div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto flex flex-col gap-6 pb-12">
      {/* Page header */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => navigate('/admin/pois')}
          className="p-1.5 rounded-lg text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition-colors"
        >
          <ChevronLeft size={20} />
        </button>
        <h1 className="text-xl font-semibold text-gray-900">
          {isCreate ? 'New POI' : `Edit: ${form.name.ru || form.id}`}
        </h1>
      </div>

      <form onSubmit={handleSave} className="flex flex-col gap-8">

        {/* ── Basic Info ── */}
        <Section title="Basic Info">
          {/* ID (readonly in edit mode) */}
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-gray-700">ID</label>
            <input
              type="text"
              value={form.id}
              readOnly
              className="w-full rounded border border-gray-200 px-3 py-1.5 text-sm text-gray-400 bg-gray-50 cursor-default select-all"
            />
          </div>

          {/* Slug */}
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-gray-700">Slug</label>
            <input
              type="text"
              value={form.slug}
              onChange={(e) => set('slug', e.target.value)}
              placeholder="auto-generated-from-name"
              className="w-full rounded border border-gray-300 px-3 py-1.5 text-sm text-gray-800 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
            />
          </div>

          <LocalizedInput
            label="Name"
            value={form.name}
            onChange={handleNameChange}
            required
            placeholder="Name of the place"
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <SelectField
              label="Category"
              value={form.category}
              onChange={(v) => set('category', v as POICategory)}
              options={CATEGORY_OPTIONS}
              required
            />

            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-gray-700">Subcategory</label>
              <input
                type="text"
                value={form.subcategory}
                onChange={(e) => set('subcategory', e.target.value)}
                placeholder="e.g. Museum, Café, Park…"
                className="w-full rounded border border-gray-300 px-3 py-1.5 text-sm text-gray-800 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
              />
            </div>
          </div>

          {/* Cuisine type — only visible when category = food */}
          {form.category === 'food' && (
            <SelectField
              label="Cuisine Type"
              value={form.cuisineType ?? ''}
              onChange={(v) => set('cuisineType', v as CuisineType)}
              options={CUISINE_OPTIONS}
              placeholder="Select cuisine…"
            />
          )}
        </Section>

        {/* ── Location ── */}
        <Section title="Location">
          <LocationPicker
            label="Location"
            value={form.location}
            onChange={(v) => set('location', v)}
          />
        </Section>

        {/* ── Description ── */}
        <Section title="Description">
          <LocalizedTextarea
            label="Short description"
            value={form.description.short}
            onChange={(v) => setForm((prev) => ({ ...prev, description: { ...prev.description, short: v } }))}
            rows={2}
            placeholder="One sentence summary"
          />
          <LocalizedTextarea
            label="Medium description"
            value={form.description.medium}
            onChange={(v) => setForm((prev) => ({ ...prev, description: { ...prev.description, medium: v } }))}
            rows={4}
            placeholder="2–4 sentences"
          />
          <LocalizedTextarea
            label="Full description"
            value={form.description.full}
            onChange={(v) => setForm((prev) => ({ ...prev, description: { ...prev.description, full: v } }))}
            rows={8}
            placeholder="Detailed description"
          />
        </Section>

        {/* ── Media ── */}
        <Section title="Media">
          <PhotosManager
            label="Photos"
            value={form.photos}
            onChange={(v) => set('photos', v)}
          />
        </Section>

        {/* ── Business Info ── */}
        <Section title="Business Info">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-gray-700">Rating</label>
              <input
                type="number"
                min={0}
                max={5}
                step={0.1}
                value={form.rating}
                onChange={(e) => set('rating', parseFloat(e.target.value) || 0)}
                className="w-full rounded border border-gray-300 px-3 py-1.5 text-sm text-gray-800 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-gray-700">Review Count</label>
              <input
                type="number"
                min={0}
                step={1}
                value={form.reviewCount}
                onChange={(e) => set('reviewCount', parseInt(e.target.value, 10) || 0)}
                className="w-full rounded border border-gray-300 px-3 py-1.5 text-sm text-gray-800 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
              />
            </div>
          </div>

          <HoursEditor
            label="Opening Hours"
            value={form.hours ?? {}}
            onChange={(v: OperatingHours) => set('hours', v)}
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-gray-700">Phone</label>
              <input
                type="tel"
                value={form.phone ?? ''}
                onChange={(e) => set('phone', e.target.value)}
                placeholder="+7 (000) 000-00-00"
                className="w-full rounded border border-gray-300 px-3 py-1.5 text-sm text-gray-800 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-gray-700">Website</label>
              <input
                type="url"
                value={form.website ?? ''}
                onChange={(e) => set('website', e.target.value)}
                placeholder="https://example.com"
                className="w-full rounded border border-gray-300 px-3 py-1.5 text-sm text-gray-800 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
              />
            </div>
          </div>

          <SelectField
            label="Price Level"
            value={form.priceLevel !== undefined ? String(form.priceLevel) : ''}
            onChange={(v) => set('priceLevel', v ? (parseInt(v, 10) as 1 | 2 | 3 | 4) : undefined)}
            options={PRICE_LEVEL_OPTIONS}
            placeholder="Not specified"
          />

          <TagsInput
            label="Tags"
            value={form.tags}
            onChange={(v) => set('tags', v)}
            placeholder="Add tag and press Enter"
          />

          <div className="flex flex-wrap gap-6">
            <CheckboxField
              label="Is Chain"
              checked={form.isChain}
              onChange={(v) => set('isChain', v)}
            />
            <CheckboxField
              label="Has Menu"
              checked={form.hasMenu}
              onChange={(v) => set('hasMenu', v)}
            />
            <CheckboxField
              label="Has Delivery"
              checked={form.hasDelivery}
              onChange={(v) => set('hasDelivery', v)}
            />
          </div>

          {form.hasDelivery && (
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-gray-700">External Order URL</label>
              <input
                type="url"
                value={form.externalOrderUrl ?? ''}
                onChange={(e) => set('externalOrderUrl', e.target.value)}
                placeholder="https://delivery.example.com/…"
                className="w-full rounded border border-gray-300 px-3 py-1.5 text-sm text-gray-800 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
              />
            </div>
          )}
        </Section>

        {/* ── Meta ── */}
        <Section title="Meta">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <SelectField
              label="Subscription Tier"
              value={form.subscriptionTier}
              onChange={(v) => set('subscriptionTier', v as 'free' | 'premium')}
              options={SUBSCRIPTION_OPTIONS}
              required
            />

            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-gray-700">Visit Count</label>
              <input
                type="number"
                min={0}
                step={1}
                value={form.visitCount}
                onChange={(e) => set('visitCount', parseInt(e.target.value, 10) || 0)}
                className="w-full rounded border border-gray-300 px-3 py-1.5 text-sm text-gray-800 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
              />
            </div>
          </div>
        </Section>

        {/* ── Error ── */}
        {error && (
          <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-2">
            {error}
          </p>
        )}

        {/* ── Actions ── */}
        <div className="flex items-center gap-3 pt-2 border-t border-gray-200">
          <button
            type="submit"
            disabled={isSaving}
            className="inline-flex items-center gap-2 px-5 py-2 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 active:bg-blue-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Save size={15} />
            {isSaving ? 'Saving…' : 'Save'}
          </button>
          <button
            type="button"
            onClick={() => navigate('/admin/pois')}
            className="px-5 py-2 rounded-lg bg-white text-gray-700 text-sm font-medium border border-gray-300 hover:bg-gray-50 active:bg-gray-100 transition-colors"
          >
            Cancel
          </button>
        </div>

      </form>
    </div>
  )
}
