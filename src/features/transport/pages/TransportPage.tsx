import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { SEO } from '@/shared/ui/SEO'
import { PageHeader } from '@/shared/ui/PageHeader'
import { getDB } from '@/data/db'
import type { TransportRoute } from '@/data/types'

type FilterType = 'all' | 'marshrutka' | 'bus' | 'tram'

const TYPE_STYLE: Record<string, { bg: string; text: string; label: string }> = {
  marshrutka: { bg: '#FFF3E0', text: '#E65100', label: 'Маршрутка' },
  bus:        { bg: '#E8F5E9', text: '#2E7D32', label: 'Автобус' },
  tram:       { bg: '#FFEBEE', text: '#C62828', label: 'Трамвай' },
}

const TYPE_COLOR: Record<string, string> = {
  marshrutka: '#FF6B35',
  bus:        '#2E7D32',
  tram:       '#C0392B',
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
    <div className="min-h-dvh bg-[var(--color-bg)]">
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
          className="w-full h-11 bg-white border border-[var(--color-border)] rounded-xl px-4 text-sm outline-none focus:border-[var(--color-primary)] transition-colors"
        />
      </div>

      <div className="flex gap-2 px-4 pb-4 overflow-x-auto scrollbar-none">
        {filters.map(f => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className={[
              'flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold border transition-colors',
              filter === f.key
                ? 'bg-gray-900 text-white border-gray-900'
                : 'bg-white text-gray-600 border-gray-300',
            ].join(' ')}
          >
            {f.label}
          </button>
        ))}
      </div>

      <div className="px-4 pb-6 space-y-2">
        {visible.length === 0 && (
          <p className="text-center text-sm text-[var(--color-text-secondary)] py-12">
            {routes.length === 0 ? 'Загрузка...' : 'Ничего не найдено'}
          </p>
        )}
        {visible.map(route => {
          const style = TYPE_STYLE[route.type] || { bg: '#F5F5F5', text: '#555', label: route.type }
          const color = TYPE_COLOR[route.type] || route.color || '#3B82F6'
          return (
            <button
              key={route.id}
              onClick={() => navigate(`/transport/${route.id}`)}
              className="w-full bg-white rounded-2xl border border-[var(--color-border)] p-4 flex items-center gap-3 text-left active:bg-gray-50 transition-colors"
            >
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 font-bold text-white text-lg"
                style={{ backgroundColor: color }}
              >
                {route.number}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 leading-snug line-clamp-2">
                  {route.name.ru}
                </p>
                <div className="flex items-center gap-2 mt-1">
                  <span
                    className="text-xs font-semibold px-2 py-0.5 rounded-full"
                    style={{ background: style.bg, color: style.text }}
                  >
                    {style.label}
                  </span>
                  {route.stops.length > 0 && (
                    <span className="text-xs text-[var(--color-text-secondary)]">
                      {route.stops.length} остановок
                    </span>
                  )}
                  {route.schedule?.weekday && (
                    <span className="text-xs text-[var(--color-text-secondary)]">
                      {route.schedule.weekday}
                    </span>
                  )}
                </div>
              </div>
              <svg className="w-4 h-4 text-gray-300 flex-shrink-0 ml-auto" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
              </svg>
            </button>
          )
        })}
      </div>
    </div>
  )
}
