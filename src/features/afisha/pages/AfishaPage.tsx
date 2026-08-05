import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { SEO } from '@/shared/ui/SEO'
import type { Event } from '@/data/types'

function formatDate(dateStr: string): string {
  const date = new Date(dateStr)
  return date.toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' })
}

function EventCard({ event, onClick }: { event: Event; onClick: () => void }) {
  return (
    <button onClick={onClick} className="w-full text-left bg-white rounded-2xl overflow-hidden shadow-sm border border-[var(--color-border)] active:scale-[0.98] transition-transform">
      <div className="relative h-44 bg-gray-100">
        {event.image ? (
          <img
            src={event.image}
            alt={event.title}
            className="w-full h-full object-cover"
            onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-[var(--color-primary-light)]">
            <svg className="w-12 h-12 text-[var(--color-primary)] opacity-40" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
            </svg>
          </div>
        )}
        {event.price && (
          <div className="absolute bottom-2 left-2 px-2.5 py-1 bg-white/90 backdrop-blur rounded-full text-xs font-semibold text-[var(--color-text)]">
            {event.price}
          </div>
        )}
      </div>
      <div className="p-3">
        <p className="text-xs text-[var(--color-primary)] font-medium mb-1">{formatDate(event.date)}{event.time ? ` · ${event.time}` : ''}</p>
        <h3 className="font-semibold text-sm leading-snug line-clamp-2 mb-1">{event.title}</h3>
        <p className="text-xs text-[var(--color-text-secondary)] truncate">{event.venue}</p>
      </div>
    </button>
  )
}

export default function AfishaPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [events, setEvents] = useState<Event[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetch('/content/events.json')
      .then((r) => r.json())
      .then((data: Event[]) => {
        const today = new Date().toISOString().slice(0, 10)
        const sorted = [...data].sort((a, b) => {
          const aUpcoming = a.date >= today
          const bUpcoming = b.date >= today
          if (aUpcoming && !bUpcoming) return -1
          if (!aUpcoming && bUpcoming) return 1
          return a.date.localeCompare(b.date)
        })
        setEvents(sorted)
      })
      .catch(() => setEvents([]))
      .finally(() => setIsLoading(false))
  }, [])

  return (
    <div className="min-h-dvh bg-[var(--color-bg)]">
      <SEO
        title="Афиша Владикавказа — BROBROGID"
        description="События, концерты, выставки и мероприятия Владикавказа."
        url="/afisha"
      />

      <div className="px-4 pt-4 pb-2">
        <h1 className="text-2xl font-black">{t('afisha.title')}</h1>
        <p className="text-sm text-[var(--color-text-secondary)] mt-0.5">{t('afisha.subtitle')}</p>
      </div>

      <div className="px-4 pb-6">
        {isLoading ? (
          <div className="space-y-4 mt-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white rounded-2xl overflow-hidden shadow-sm border border-[var(--color-border)] animate-pulse">
                <div className="h-44 bg-gray-200" />
                <div className="p-3 space-y-2">
                  <div className="h-3 bg-gray-200 rounded w-1/3" />
                  <div className="h-4 bg-gray-200 rounded w-3/4" />
                  <div className="h-3 bg-gray-200 rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : events.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <svg className="w-16 h-16 text-gray-300 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
            </svg>
            <p className="text-gray-500 font-medium">{t('afisha.empty')}</p>
            <p className="text-gray-400 text-sm mt-1">{t('afisha.emptyHint')}</p>
          </div>
        ) : (
          <div className="space-y-4 mt-2">
            {events.map((event) => (
              <EventCard key={event.id} event={event} onClick={() => navigate(`/afisha/${event.id}`)} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
