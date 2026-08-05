import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { SEO } from '@/shared/ui/SEO'
import { PageHeader } from '@/shared/ui/PageHeader'
import { getDB } from '@/data/db'
import type { TransportRoute } from '@/data/types'

type FilterType = 'all' | 'marshrutka' | 'bus' | 'tram'

// Оттенки подобраны под тёмный фон: тёплый терракот, горная зелень, глина
const TYPE_COLOR: Record<string, string> = {
  marshrutka: '#E08A4A',
  bus:        '#5AA87A',
  tram:       '#D9534F',
}

const TYPE_STYLE: Record<string, { text: string; label: string }> = {
  marshrutka: { text: TYPE_COLOR.marshrutka, label: 'Маршрутка' },
  bus:        { text: TYPE_COLOR.bus,        label: 'Автобус' },
  tram:       { text: TYPE_COLOR.tram,       label: 'Трамвай' },
}

export default function TransportPage() {
  useTranslation()
  const navigate = useNavigate()
  const [routes, setRoutes] = useState<TransportRoute[]>([])
  const [filter, setFilter] = useState<FilterType>('all')
  const [query, setQuery] = useState('')

  useEffect(() => {
    getDB().then(db => db.getAll('transport')).then(setRoutes)
  }, [])

  const visible = routes.filter(r => {
    if (filter !== 'all' && r.type !== filter) return false
    if (query) {
      const q = query.toLowerCase()
      return r.number.toLowerCase().includes(q) || r.name.ru.toLowerCase().includes(q)
    }
    return true
  })

  const counts = {
    all: routes.length,
    marshrutka: routes.filter(r => r.type === 'marshrutka').length,
    bus: routes.filter(r => r.type === 'bus').length,
    tram: routes.filter(r => r.type === 'tram').length,
  }

  const filters: { key: FilterType; label: string }[] = [
    { key: 'all',        label: `Все (${counts.all})` },
    { key: 'marshrutka', label: `Маршрутки (${counts.marshrutka})` },
    { key: 'bus',        label: `Автобусы (${counts.bus})` },
    { key: 'tram',       label: `Трамваи (${counts.tram})` },
  ]

  return (
    <div className="min-h-dvh">
      <SEO
        title="Транспорт Владикавказа — BROBROGID"
        description="Маршруты маршруток, автобусов и трамваев Владикавказа."
        url="/transport"
      />
      <PageHeader title="Транспорт" showBack />

      <div className="px-4 pt-4 pb-3">
        <input
          type="search"
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="Поиск по номеру или названию..."
          className="w-full h-11 rounded-[var(--radius-md)] px-4 text-[13.5px] outline-none transition-colors"
          style={{ background: 'var(--surface-2)', border: '1px solid var(--color-border)', color: 'var(--text)' }}
        />
      </div>

      <div className="flex gap-2 px-4 pb-4 overflow-x-auto scrollbar-none">
        {filters.map(f => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className="flex-shrink-0 px-3.5 h-9 rounded-full text-[12px] font-semibold border transition-all whitespace-nowrap"
            style={filter === f.key
              ? { background: 'var(--terra-tint)', color: 'var(--terra-hot)', borderColor: 'var(--terra-line)' }
              : { background: 'var(--surface-1)', color: 'var(--text-3)', borderColor: 'var(--color-border)' }}
          >
            {f.label}
          </button>
        ))}
      </div>

      <div className="px-4 pb-6 space-y-2">
        {visible.length === 0 && (
          <p className="text-center text-[13px] py-12" style={{ color: 'var(--text-3)' }}>
            {routes.length === 0 ? 'Загрузка...' : 'Ничего не найдено'}
          </p>
        )}
        {visible.map(route => {
          const style = TYPE_STYLE[route.type] || { text: 'var(--text-2)', label: route.type }
          const color = TYPE_COLOR[route.type] || route.color || '#8A94A3'
          return (
            <button
              key={route.id}
              onClick={() => navigate(`/transport/${route.id}`)}
              className="w-full rounded-[var(--radius-lg)] p-3.5 flex items-center gap-3.5 text-left transition-colors"
              style={{ background: 'var(--surface-1)', border: '1px solid var(--color-border)' }}
            >
              {/* Номер маршрута в ромбе. Ромб — повёрнутый квадрат, поэтому он
                  меньше своей ячейки: иначе углы залезают на текст. */}
              <div className="relative w-12 h-12 flex items-center justify-center flex-shrink-0">
                <span
                  className="absolute inset-[7px] diamond"
                  style={{ background: color + '22', border: `1.5px solid ${color}66` }}
                />
                <span className="relative z-10 font-bold text-[15px]" style={{ color }}>
                  {route.number}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[13.5px] font-medium leading-snug line-clamp-2">
                  {route.name.ru}
                </p>
                <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                  <span className="text-[11px] font-semibold" style={{ color: style.text }}>
                    {style.label}
                  </span>
                  {route.stops.length > 0 && (
                    <span className="text-[11px]" style={{ color: 'var(--text-3)' }}>
                      · {route.stops.length} остановок
                    </span>
                  )}
                  {route.schedule?.weekday && (
                    <span className="text-[11px]" style={{ color: 'var(--text-3)' }}>
                      · {route.schedule.weekday}
                    </span>
                  )}
                </div>
              </div>
              <svg className="w-4 h-4 flex-shrink-0 ml-auto" style={{ color: 'var(--text-3)' }} fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
              </svg>
            </button>
          )
        })}
      </div>
    </div>
  )
}
