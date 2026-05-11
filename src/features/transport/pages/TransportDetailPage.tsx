import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { SEO } from '@/shared/ui/SEO'
import { PageHeader } from '@/shared/ui/PageHeader'
import { getDB } from '@/data/db'
import type { TransportRoute } from '@/data/types'

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

export default function TransportDetailPage() {
  const { id } = useParams<{ id: string }>()
  const { i18n } = useTranslation()
  const lang = i18n.language as 'ru' | 'en'
  const [route, setRoute] = useState<TransportRoute | null>(null)

  useEffect(() => {
    if (!id) return
    getDB().then(db => db.get('transport', id)).then(r => setRoute(r ?? null))
  }, [id])

  if (!route) {
    return (
      <div className="min-h-dvh bg-[var(--color-bg)]">
        <PageHeader title="Маршрут" showBack />
        <p className="text-center text-sm text-[var(--color-text-secondary)] py-16">Загрузка…</p>
      </div>
    )
  }

  const style = TYPE_STYLE[route.type] || { bg: '#F5F5F5', text: '#555', label: route.type }
  const color = TYPE_COLOR[route.type] || route.color || '#3B82F6'
  const name = route.name[lang] || route.name.ru

  return (
    <div className="min-h-dvh bg-[var(--color-bg)]">
      <SEO title={`${name} — BROBROGID`} description={name} url={`/transport/${route.id}`} />
      <PageHeader title={`Маршрут №${route.number}`} showBack />

      {/* Header card */}
      <div className="mx-4 mt-4 bg-white rounded-2xl border border-[var(--color-border)] p-4">
        <div className="flex items-center gap-3">
          <div
            className="w-14 h-14 rounded-xl flex items-center justify-center flex-shrink-0 font-bold text-white text-2xl"
            style={{ backgroundColor: color }}
          >
            {route.number}
          </div>
          <div>
            <p className="font-semibold text-gray-900 text-sm leading-snug">{name}</p>
            <span
              className="inline-block mt-1 text-xs font-semibold px-2 py-0.5 rounded-full"
              style={{ background: style.bg, color: style.text }}
            >
              {style.label}
            </span>
          </div>
        </div>

        {(route.schedule?.weekday || route.schedule?.weekend) && (
          <div className="mt-3 pt-3 border-t border-[var(--color-border)] flex gap-4">
            {route.schedule.weekday && (
              <div>
                <p className="text-[11px] text-[var(--color-text-secondary)]">Пн–Пт</p>
                <p className="text-sm font-medium text-gray-900">{route.schedule.weekday}</p>
              </div>
            )}
            {route.schedule.weekend && route.schedule.weekend !== route.schedule.weekday && (
              <div>
                <p className="text-[11px] text-[var(--color-text-secondary)]">Сб–Вс</p>
                <p className="text-sm font-medium text-gray-900">{route.schedule.weekend}</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Stops */}
      <div className="px-4 mt-5 mb-2">
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">
          Остановки — {route.stops.length}
        </h2>
      </div>

      <div className="px-4 pb-8">
        <div className="relative">
          {/* vertical line */}
          <div
            className="absolute left-[19px] top-5 bottom-5 w-0.5"
            style={{ backgroundColor: color + '40' }}
          />
          <div className="space-y-0">
            {route.stops.map((stop, i) => {
              const isFirst = i === 0
              const isLast = i === route.stops.length - 1
              const stopName = stop.name[lang] || stop.name.ru
              return (
                <div key={i} className="flex items-start gap-3 py-2">
                  <div className="flex-shrink-0 w-10 flex flex-col items-center">
                    <div
                      className={[
                        'w-4 h-4 rounded-full border-2 z-10 mt-0.5',
                        isFirst || isLast ? 'border-white' : 'border-white bg-white',
                      ].join(' ')}
                      style={{
                        backgroundColor: isFirst || isLast ? color : color + '60',
                        borderColor: color,
                      }}
                    />
                  </div>
                  <div className="flex-1 pb-1">
                    <p className={[
                      'text-sm leading-snug',
                      isFirst || isLast ? 'font-semibold text-gray-900' : 'text-gray-700',
                    ].join(' ')}>
                      {stopName}
                    </p>
                    {(isFirst || isLast) && (
                      <p className="text-[11px] text-[var(--color-text-secondary)] mt-0.5">
                        {isFirst ? 'Начало маршрута' : 'Конец маршрута'}
                      </p>
                    )}
                  </div>
                  <span className="text-[11px] text-[var(--color-text-secondary)] mt-0.5 flex-shrink-0">
                    {i + 1}
                  </span>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
