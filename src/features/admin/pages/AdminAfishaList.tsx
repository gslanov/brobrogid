import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Calendar, ExternalLink, RefreshCw } from 'lucide-react'
import type { Event } from '@/data/types'

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('ru-RU', { day: 'numeric', month: 'short', year: 'numeric' })
}

export default function AdminAfishaList() {
  const { t } = useTranslation()
  const [events, setEvents] = useState<Event[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showScript, setShowScript] = useState(false)

  useEffect(() => {
    fetch('/content/events.json')
      .then((r) => r.json())
      .then((data: Event[]) => setEvents(data))
      .catch(() => setEvents([]))
      .finally(() => setIsLoading(false))
  }, [])

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-gray-900">{t('admin.afisha.title', 'Афиша')}</h2>
          <p className="text-sm text-gray-500 mt-0.5">
            {isLoading ? '…' : t('admin.afisha.count', { count: events.length, defaultValue: `${events.length} событий` })}
          </p>
        </div>
        <button
          onClick={() => setShowScript(!showScript)}
          className="flex items-center gap-2 px-4 py-2 bg-[#E85D26] text-white rounded-lg text-sm font-medium hover:bg-orange-600 transition-colors"
        >
          <RefreshCw size={15} />
          {t('admin.afisha.refresh', 'Обновить данные')}
        </button>
      </div>

      {/* Refresh instructions */}
      {showScript && (
        <div className="mb-6 p-4 bg-gray-900 rounded-xl text-sm">
          <p className="text-gray-400 mb-2 text-xs uppercase tracking-wider">Как обновить афишу:</p>
          <code className="text-green-400 block mb-2">python scripts/fetch-events.py</code>
          <p className="text-gray-500 text-xs">Скрипт скачает события с gorodzovet.ru и afishagoroda.ru и сохранит в public/content/events.json</p>
        </div>
      )}

      {/* Events table */}
      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-16 bg-gray-100 rounded-lg animate-pulse" />
          ))}
        </div>
      ) : events.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <Calendar size={48} className="text-gray-300 mb-4" />
          <p className="text-gray-500 font-medium">{t('admin.afisha.empty', 'Нет событий')}</p>
          <p className="text-gray-400 text-sm mt-1">{t('admin.afisha.emptyHint', 'Запустите скрипт fetch-events.py для загрузки')}</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Название</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider w-32">Дата</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider w-28">Источник</th>
                <th className="w-10" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {events.map((event) => (
                <tr key={event.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3">
                    <p className="font-medium text-gray-900 line-clamp-1">{event.title}</p>
                    <p className="text-xs text-gray-400 mt-0.5 truncate">{event.venue}</p>
                  </td>
                  <td className="px-4 py-3 text-gray-600 text-xs">{formatDate(event.date)}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${
                      event.source === 'gorodzovet' ? 'bg-blue-50 text-blue-700' : 'bg-green-50 text-green-700'
                    }`}>
                      {event.source === 'gorodzovet' ? 'gorodzovet' : 'afishagoroda'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <a href={event.sourceUrl} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-gray-700 transition-colors">
                      <ExternalLink size={15} />
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
