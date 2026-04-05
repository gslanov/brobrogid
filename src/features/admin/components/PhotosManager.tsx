import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Trash2, ImageOff, Plus } from 'lucide-react'

interface PhotosManagerProps {
  label: string
  value: string[]
  onChange: (value: string[]) => void
}

function PhotoThumbnail({ url }: { url: string }) {
  const [errored, setErrored] = useState(false)

  if (errored) {
    return (
      <div className="w-16 h-16 flex-shrink-0 rounded border border-gray-200 bg-gray-100 flex items-center justify-center text-gray-400">
        <ImageOff size={20} />
      </div>
    )
  }

  return (
    <img
      src={url}
      alt=""
      onError={() => setErrored(true)}
      className="w-16 h-16 flex-shrink-0 rounded border border-gray-200 object-cover"
    />
  )
}

export function PhotosManager({ label, value, onChange }: PhotosManagerProps) {
  const { t } = useTranslation()
  const [input, setInput] = useState('')

  const addPhoto = () => {
    const trimmed = input.trim()
    if (!trimmed) return
    onChange([...value, trimmed])
    setInput('')
  }

  const removePhoto = (index: number) => {
    onChange(value.filter((_, i) => i !== index))
  }

  return (
    <div className="flex flex-col gap-2">
      <label className="text-sm font-medium text-gray-700">{label}</label>

      {/* Photos list */}
      {value.length > 0 && (
        <ul className="flex flex-col gap-2">
          {value.map((url, i) => (
            <li key={i} className="flex items-center gap-3 p-2 rounded border border-gray-200 bg-gray-50">
              <PhotoThumbnail url={url} />
              <span className="flex-1 text-xs text-gray-600 break-all line-clamp-2">{url}</span>
              <button
                type="button"
                onClick={() => removePhoto(i)}
                className="flex-shrink-0 text-gray-400 hover:text-red-500 transition-colors"
                aria-label="Remove photo"
              >
                <Trash2 size={16} />
              </button>
            </li>
          ))}
        </ul>
      )}

      {/* Add row */}
      <div className="flex gap-2">
        <input
          type="url"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addPhoto())}
          placeholder="https://example.com/photo.jpg"
          className="flex-1 rounded border border-gray-300 px-3 py-1.5 text-sm text-gray-800 bg-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
        />
        <button
          type="button"
          onClick={addPhoto}
          className="inline-flex items-center gap-1 px-3 py-1.5 rounded border border-gray-300 text-sm text-gray-600 bg-white hover:bg-gray-50 transition-colors whitespace-nowrap"
        >
          <Plus size={14} />
          {t('admin.common.addPhoto')}
        </button>
      </div>
    </div>
  )
}
