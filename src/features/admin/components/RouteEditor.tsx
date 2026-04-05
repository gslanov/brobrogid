import { useState, useEffect } from 'react'

interface RoutePoint {
  lat: number
  lng: number
}

interface RouteEditorProps {
  label: string
  value: RoutePoint[]
  onChange: (value: RoutePoint[]) => void
}

function prettyPrint(points: RoutePoint[]): string {
  return JSON.stringify(points, null, 2)
}

export function RouteEditor({ label, value, onChange }: RouteEditorProps) {
  const [text, setText] = useState(() => prettyPrint(value))
  const [error, setError] = useState<string | null>(null)

  // Sync external value changes into textarea only when not actively editing
  useEffect(() => {
    setText(prettyPrint(value))
  }, [value])

  const parse = (raw: string): RoutePoint[] | null => {
    try {
      const parsed = JSON.parse(raw)
      if (!Array.isArray(parsed)) return null
      for (const item of parsed) {
        if (typeof item.lat !== 'number' || typeof item.lng !== 'number') return null
      }
      return parsed as RoutePoint[]
    } catch {
      return null
    }
  }

  const handleBlur = () => {
    const result = parse(text)
    if (result === null) {
      setError('Invalid JSON. Expected Array<{ lat: number; lng: number }>.')
    } else {
      setError(null)
      onChange(result)
    }
  }

  const handleFormat = () => {
    const result = parse(text)
    if (result === null) {
      setError('Cannot format: invalid JSON.')
    } else {
      setError(null)
      const formatted = prettyPrint(result)
      setText(formatted)
      onChange(result)
    }
  }

  const handleClear = () => {
    setText('[]')
    setError(null)
    onChange([])
  }

  const pointCount = (() => {
    const result = parse(text)
    return result ? result.length : null
  })()

  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium text-gray-700">{label}</label>
        <span className="text-xs text-gray-400">
          {pointCount !== null ? `${pointCount} point${pointCount === 1 ? '' : 's'} in route` : 'invalid JSON'}
        </span>
      </div>

      <textarea
        value={text}
        onChange={(e) => { setText(e.target.value); setError(null) }}
        onBlur={handleBlur}
        rows={8}
        spellCheck={false}
        className={[
          'w-full rounded border px-3 py-2 text-xs font-mono text-gray-800 bg-white resize-y focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition',
          error ? 'border-red-400' : 'border-gray-300',
        ].join(' ')}
      />

      {error && <p className="text-xs text-red-500">{error}</p>}

      <div className="flex gap-2">
        <button
          type="button"
          onClick={handleFormat}
          className="px-3 py-1.5 rounded border border-gray-300 text-xs text-gray-600 bg-white hover:bg-gray-50 transition-colors"
        >
          Format
        </button>
        <button
          type="button"
          onClick={handleClear}
          className="px-3 py-1.5 rounded border border-gray-300 text-xs text-gray-500 bg-white hover:bg-red-50 hover:text-red-600 hover:border-red-300 transition-colors"
        >
          Clear
        </button>
      </div>
    </div>
  )
}
