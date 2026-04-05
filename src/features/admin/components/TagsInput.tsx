import { useState, type KeyboardEvent } from 'react'
import { X, Plus } from 'lucide-react'

interface TagsInputProps {
  label: string
  value: string[]
  onChange: (value: string[]) => void
  placeholder?: string
}

export function TagsInput({
  label,
  value,
  onChange,
  placeholder = 'Add tag...',
}: TagsInputProps) {
  const [input, setInput] = useState('')

  const addTag = () => {
    const trimmed = input.trim()
    if (!trimmed || value.includes(trimmed)) {
      setInput('')
      return
    }
    onChange([...value, trimmed])
    setInput('')
  }

  const removeTag = (index: number) => {
    onChange(value.filter((_, i) => i !== index))
  }

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      addTag()
    }
  }

  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-sm font-medium text-gray-700">{label}</label>

      {/* Tags */}
      {value.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {value.map((tag, i) => (
            <span
              key={i}
              className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-700"
            >
              {tag}
              <button
                type="button"
                onClick={() => removeTag(i)}
                className="hover:text-blue-900 transition-colors"
                aria-label={`Remove tag ${tag}`}
              >
                <X size={12} />
              </button>
            </span>
          ))}
        </div>
      )}

      {/* Input row */}
      <div className="flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="flex-1 rounded border border-gray-300 px-3 py-1.5 text-sm text-gray-800 bg-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
        />
        <button
          type="button"
          onClick={addTag}
          className="inline-flex items-center gap-1 px-3 py-1.5 rounded border border-gray-300 text-sm text-gray-600 bg-white hover:bg-gray-50 transition-colors"
        >
          <Plus size={14} />
          Add
        </button>
      </div>
    </div>
  )
}
