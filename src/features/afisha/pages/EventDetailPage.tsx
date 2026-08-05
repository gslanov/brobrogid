import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { SEO } from '@/shared/ui/SEO'
import { PageHeader } from '@/shared/ui/PageHeader'
import type { Event } from '@/data/types'

function formatDate(dateStr: string): string {
  const date = new Date(dateStr)
  return date.toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' })
}

export default function EventDetailPage() {
  const { id } = useParams<{ id: string }>()
  const { t } = useTranslation()
  const [event, setEvent] = useState<Event | null>(null)
  const [notFound, setNotFound] = useState(false)

  useEffect(() => {
    fetch('/content/events.json')
      .then((r) => r.json())
      .then((data: Event[]) => {
        const found = data.find((e) => e.id === id)
        if (found) setEvent(found)
        else setNotFound(true)
      })
      .catch(() => setNotFound(true))
  }, [id])

  if (notFound) {
    return (
      <div className="min-h-dvh bg-[var(--color-bg)] flex flex-col">
        <PageHeader title={t('afisha.title')} showBack />
        <div className="flex-1 flex items-center justify-center text-gray-400">{t('common.notFound', 'Не найдено')}</div>
      </div>
    )
  }

  if (!event) {
    return (
      <div className="min-h-dvh bg-[var(--color-bg)] animate-pulse">
        <div className="h-64 bg-gray-200" />
        <div className="p-4 space-y-3">
          <div className="h-3 bg-gray-200 rounded w-1/3" />
          <div className="h-6 bg-gray-200 rounded w-3/4" />
          <div className="h-4 bg-gray-200 rounded w-1/2" />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-dvh bg-[var(--color-bg)]">
      <SEO title={`${event.title} — BROBROGID`} description={event.description.slice(0, 150)} />

      {/* Hero image */}
      <div className="relative h-64 bg-gray-100">
        {event.image ? (
          <img src={event.image} alt={event.title} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-[var(--color-primary-light)]">
            <svg className="w-16 h-16 text-[var(--color-primary)] opacity-30" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
            </svg>
          </div>
        )}
        <div className="absolute top-0 left-0 right-0">
          <PageHeader title="" showBack transparent />
        </div>
      </div>

      <div className="px-4 py-4">
        {/* Date + time */}
        <p className="text-sm text-[var(--color-primary)] font-semibold mb-2">
          {formatDate(event.date)}
          {event.endDate && event.endDate !== event.date && ` — ${formatDate(event.endDate)}`}
          {event.time && ` · ${event.time}`}
        </p>

        {/* Title */}
        <h1 className="text-xl font-black leading-snug mb-3">{event.title}</h1>

        {/* Venue */}
        <div className="flex items-start gap-2 mb-4">
          <svg className="w-4 h-4 flex-shrink-0 mt-0.5 text-[var(--color-text-secondary)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
          </svg>
          <div>
            <p className="text-sm font-medium">{event.venue}</p>
            {event.address && <p className="text-xs text-[var(--color-text-secondary)]">{event.address}</p>}
          </div>
        </div>

        {/* Price */}
        {event.price && (
          <div className="inline-block px-3 py-1.5 bg-[var(--color-primary-light)] rounded-full text-sm font-semibold text-[var(--color-primary)] mb-4">
            {event.price}
          </div>
        )}

        {/* Description */}
        {event.description && (
          <p className="text-sm text-[var(--color-text-secondary)] leading-relaxed mb-6">{event.description}</p>
        )}

        {/* Source link */}
        <a
          href={event.sourceUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="block w-full py-3 bg-[var(--color-primary)] text-white rounded-xl text-sm font-semibold text-center"
        >
          {t('afisha.goToSource')}
        </a>

        <p className="text-center text-xs text-gray-400 mt-2">
          {t('afisha.source')}: {event.source === 'gorodzovet' ? 'gorodzovet.ru' : 'afishagoroda.ru'}
        </p>
      </div>
    </div>
  )
}
