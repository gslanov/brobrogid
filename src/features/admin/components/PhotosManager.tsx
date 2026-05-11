import { useRef, useState } from 'react'
import { Trash2, ImageOff, Upload, ChevronUp, ChevronDown } from 'lucide-react'

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
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [loading, setLoading] = useState(false)

  const handleFiles = (files: FileList | null) => {
    if (!files || files.length === 0) return
    setLoading(true)
    const readers = Array.from(files).map(
      (file) =>
        new Promise<string>((resolve) => {
          const reader = new FileReader()
          reader.onload = (e) => resolve(e.target?.result as string)
          reader.readAsDataURL(file)
        })
    )
    Promise.all(readers).then((results) => {
      onChange([...value, ...results])
      setLoading(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    })
  }

  const removePhoto = (index: number) => {
    onChange(value.filter((_, i) => i !== index))
  }

  const movePhoto = (index: number, direction: -1 | 1) => {
    const next = index + direction
    if (next < 0 || next >= value.length) return
    const arr = [...value]
    ;[arr[index], arr[next]] = [arr[next], arr[index]]
    onChange(arr)
  }

  return (
    <div className="flex flex-col gap-2">
      <label className="text-sm font-medium text-gray-700">{label}</label>

      {value.length > 0 && (
        <ul className="flex flex-col gap-2">
          {value.map((url, i) => (
            <li key={i} className="flex items-center gap-3 p-2 rounded border border-gray-200 bg-gray-50">
              <PhotoThumbnail url={url} />
              <span className="flex-1 text-xs text-gray-600 break-all line-clamp-2">
                {url.startsWith('data:') ? 'Загруженное фото' : url}
              </span>
              <div className="flex flex-col gap-0.5 flex-shrink-0">
                <button
                  type="button"
                  onClick={() => movePhoto(i, -1)}
                  disabled={i === 0}
                  className="text-gray-400 hover:text-gray-700 disabled:opacity-20 transition-colors"
                  aria-label="Move up"
                >
                  <ChevronUp size={16} />
                </button>
                <button
                  type="button"
                  onClick={() => movePhoto(i, 1)}
                  disabled={i === value.length - 1}
                  className="text-gray-400 hover:text-gray-700 disabled:opacity-20 transition-colors"
                  aria-label="Move down"
                >
                  <ChevronDown size={16} />
                </button>
              </div>
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

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={(e) => handleFiles(e.target.files)}
      />
      <button
        type="button"
        onClick={() => fileInputRef.current?.click()}
        disabled={loading}
        className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded border border-dashed border-gray-300 text-sm text-gray-600 bg-white hover:bg-gray-50 hover:border-gray-400 transition-colors disabled:opacity-50"
      >
        <Upload size={15} />
        {loading ? 'Загрузка...' : 'Выбрать фото'}
      </button>
    </div>
  )
}
