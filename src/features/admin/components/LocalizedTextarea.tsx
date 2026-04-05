import { useState } from 'react'

interface LocalizedTextareaProps {
  label: string
  value: { ru: string; en: string }
  onChange: (value: { ru: string; en: string }) => void
  required?: boolean
  placeholder?: string
  rows?: number
}

type Lang = 'ru' | 'en'

export function LocalizedTextarea({
  label,
  value,
  onChange,
  required,
  placeholder,
  rows = 3,
}: LocalizedTextareaProps) {
  const [activeLang, setActiveLang] = useState<Lang>('ru')

  const handleChange = (text: string) => {
    onChange({ ...value, [activeLang]: text })
  }

  const isEmpty = (lang: Lang) => !value[lang]?.trim()

  return (
    <div className="flex flex-col gap-1">
      <label className="text-sm font-medium text-gray-700">
        {label}
        {required && <span className="ml-0.5 text-red-500">*</span>}
      </label>

      {/* Tabs */}
      <div className="flex gap-1 mb-0.5">
        {(['ru', 'en'] as Lang[]).map((lang) => (
          <button
            key={lang}
            type="button"
            onClick={() => setActiveLang(lang)}
            className={[
              'relative flex items-center gap-1 px-3 py-1 text-xs font-semibold rounded-t border transition-colors',
              activeLang === lang
                ? 'bg-white border-b-white border-gray-300 text-blue-600 z-10'
                : 'bg-gray-100 border-transparent text-gray-400 hover:text-gray-600',
            ].join(' ')}
          >
            {lang.toUpperCase()}
            {isEmpty(lang) && (
              <span className="w-1.5 h-1.5 rounded-full bg-red-500 flex-shrink-0" />
            )}
          </button>
        ))}
      </div>

      {/* Textarea */}
      <textarea
        value={value[activeLang] ?? ''}
        onChange={(e) => handleChange(e.target.value)}
        placeholder={placeholder}
        rows={rows}
        className="w-full rounded border border-gray-300 px-3 py-1.5 text-sm text-gray-800 bg-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition resize-y"
      />
    </div>
  )
}
