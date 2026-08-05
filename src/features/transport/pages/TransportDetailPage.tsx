import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { SEO } from '@/shared/ui/SEO'
import { PageHeader } from '@/shared/ui/PageHeader'
import { getDB } from '@/data/db'
import type { TransportRoute } from '@/data/types'

// Те же оттенки, что и в списке маршрутов
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
      <div className="min-h-dvh">
        <PageHeader title="Маршрут" showBack />
        <p className="text-center text-[13px] py-16" style={{ color: 'var(--text-3)' }}>Загрузка…</p>
      </div>
    )
  }

  const style = TYPE_STYLE[route.type] || { text: 'var(--text-2)', label: route.type }
  const color = TYPE_COLOR[route.type] || route.color || '#8A94A3'
  const name = route.name[lang] || route.name.ru

  return (
    <div className="min-h-dvh">
      <SEO title={`${name} — BROBROGID`} description={name} url={`/transport/${route.id}`} />
      <PageHeader title={`Маршрут №${route.number}`} showBack />

      {/* Header card */}
      <div
        className="mx-4 mt-4 rounded-[var(--radius-lg)] p-4"
        style={{ background: 'var(--surface-1)', border: '1px solid var(--color-border)' }}
      >
        <div className="flex items-center gap-3.5">
          <div className="relative w-14 h-14 flex items-center justify-center flex-shrink-0">
            <span
              className="absolute inset-[8px] diamond"
              style={{ background: color + '22', border: `1.5px solid ${color}66`, boxShadow: `0 0 22px ${color}33` }}
            />
            <span className="relative z-10 font-bold text-[18px]" style={{ color }}>{route.number}</span>
          </div>
          <div className="min-w-0">
            <p className="font-semibold text-[13.5px] leading-snug">{name}</p>
            <span className="inline-block mt-1.5 text-[11px] font-semibold" style={{ color: style.text }}>
              {style.label}
            </span>
          </div>
        </div>

        {(route.schedule?.weekday || route.schedule?.weekend) && (
          <div className="mt-3.5 pt-3.5 flex gap-6" style={{ borderTop: '1px solid var(--color-border)' }}>
            {route.schedule.weekday && (
              <div>
                <p className="text-[10.5px]" style={{ color: 'var(--text-3)' }}>Пн–Пт</p>
                <p className="text-[13px] font-medium mt-0.5">{route.schedule.weekday}</p>
              </div>
            )}
            {route.schedule.weekend && route.schedule.weekend !== route.schedule.weekday && (
              <div>
                <p className="text-[10.5px]" style={{ color: 'var(--text-3)' }}>Сб–Вс</p>
                <p className="text-[13px] font-medium mt-0.5">{route.schedule.weekend}</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Остановки */}
      <div className="flex items-center gap-2.5 px-4 mt-6 mb-3">
        <i className="w-[6px] h-[6px] diamond" style={{ background: 'var(--terra)' }} />
        <h2 className="text-[11px] font-semibold uppercase tracking-[0.14em]" style={{ color: 'var(--text-3)' }}>
          Остановки — {route.stops.length}
        </h2>
        <span className="orn-tail" />
      </div>

      <div className="px-4 pb-8">
        <div className="relative">
          {/* Линия маршрута — орнаментальный пунктир */}
          <div
            className="absolute left-[19px] top-5 bottom-5 w-[2px]"
            style={{ background: `repeating-linear-gradient(180deg, ${color}AA 0 5px, transparent 5px 10px)` }}
          />
          <div className="space-y-0">
            {route.stops.map((stop, i) => {
              const isFirst = i === 0
              const isLast = i === route.stops.length - 1
              const stopName = stop.name[lang] || stop.name.ru
              return (
                <div key={i} className="flex items-start gap-3 py-2">
                  <div className="flex-shrink-0 w-10 flex flex-col items-center">
                    {/* Ромб вместо точки; конечные — залиты цветом */}
                    <div
                      className="w-[15px] h-[15px] diamond z-10 mt-1"
                      style={{
                        background: isFirst || isLast ? color : 'var(--bg)',
                        border: `1.5px solid ${color}`,
                        boxShadow: isFirst || isLast ? `0 0 14px ${color}66` : 'none',
                      }}
                    />
                  </div>
                  <div className="flex-1 pb-1">
                    <p
                      className="text-[13.5px] leading-snug"
                      style={{
                        color: isFirst || isLast ? 'var(--text)' : 'var(--text-2)',
                        fontWeight: isFirst || isLast ? 600 : 400,
                      }}
                    >
                      {stopName}
                    </p>
                    {(isFirst || isLast) && (
                      <p className="text-[10.5px] mt-0.5" style={{ color: 'var(--text-3)' }}>
                        {isFirst ? 'Начало маршрута' : 'Конец маршрута'}
                      </p>
                    )}
                  </div>
                  <span className="text-[10.5px] mt-1 flex-shrink-0" style={{ color: 'var(--text-3)' }}>
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
