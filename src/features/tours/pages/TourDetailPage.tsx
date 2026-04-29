import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { SEO } from '@/shared/ui/SEO'
import { JsonLd } from '@/shared/ui/JsonLd'
import { useDataStore } from '@/data/stores/data-store'
import { useToast } from '@/data/stores/toast-store'
import { getDB } from '@/data/db'
import { Search } from 'lucide-react'
import { TourDetailView } from '@/features/tours/components/TourDetailView'

function useReviews(tourId: string) {
  const [reviews, setReviews] = useState<any[]>([])
  const [loaded, setLoaded] = useState(false)
  useEffect(() => {
    let cancelled = false
    getDB()
      .then(db => db.getAllFromIndex('reviews', 'by-target', ['tour', tourId]))
      .then(data => { if (!cancelled) { setReviews(data); setLoaded(true) } })
      .catch(() => { if (!cancelled) setLoaded(true) })
    return () => { cancelled = true }
  }, [tourId])
  return { reviews, loaded }
}

export default function TourDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { i18n, t } = useTranslation()
  const lang = i18n.language as 'ru' | 'en'
  const tours = useDataStore((s) => s.tours)
  const guides = useDataStore((s) => s.guides)
  const isLoaded = useDataStore((s) => s.isLoaded)
  const tour = tours.find((t) => t.id === id)
  const guide = tour ? guides.find((g) => g.id === tour.guideId) : undefined
  const { reviews } = useReviews(id || '')
  const toast = useToast()

  const [showBooking, setShowBooking] = useState(false)
  const [bookingName, setBookingName] = useState('')
  const [bookingPhone, setBookingPhone] = useState('')
  const [bookingDate, setBookingDate] = useState('')
  const [bookingPeople, setBookingPeople] = useState(1)

  if (isLoaded && !tour) {
    return (
      <div className="min-h-dvh flex flex-col items-center justify-center px-4 text-center">
        <div className="mb-4 text-[var(--color-text-secondary)]"><Search size={48} /></div>
        <h1 className="text-xl font-bold mb-2">{t('tours.notFound')}</h1>
        <p className="text-sm text-[var(--color-text-secondary)] mb-6">{t('tours.notFoundHint')}</p>
        <button onClick={() => navigate(-1)} className="px-6 py-2.5 bg-[var(--color-primary)] text-white rounded-xl font-medium text-sm">
          {t('common.back')}
        </button>
      </div>
    )
  }

  if (!tour) return <div className="flex items-center justify-center min-h-dvh"><p>{t('common.loading')}</p></div>

  const spotsLeft = tour.maxGroupSize - tour.currentGroupSize

  const handleBookingSubmit = () => {
    if (!bookingName.trim() || !bookingPhone.trim() || !bookingDate) return

    const message = [
      `${t('tours.bookingRequest')}: ${tour.name[lang]}`,
      `${t('tours.bookingDate')}: ${new Date(bookingDate).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long' })}`,
      `${t('tours.bookingName')}: ${bookingName}`,
      `${t('tours.bookingPhone')}: ${bookingPhone}`,
      `${t('tours.bookingPeople')}: ${bookingPeople}`,
    ].join('\n')

    window.open(`https://wa.me/?text=${encodeURIComponent(message)}`, '_blank')
    toast.show(t('tours.bookingSent'), { type: 'success' })
    setShowBooking(false)
    setBookingName('')
    setBookingPhone('')
    setBookingDate('')
    setBookingPeople(1)
  }

  return (
    <>
      <SEO
        title={`${tour.name[lang]} — Тур`}
        description={tour.description[lang].slice(0, 160)}
        image={tour.photos[0]}
        url={`/tours/${tour.id}`}
      />
      <JsonLd data={{
        '@type': 'TouristTrip',
        name: tour.name[lang],
        description: tour.description[lang],
        image: tour.photos[0] ? `https://app.brobrogid.ru${tour.photos[0]}` : undefined,
        offers: { '@type': 'Offer', price: tour.price, priceCurrency: 'RUB' },
      }} />

      <TourDetailView
        tour={tour}
        guide={guide}
        reviews={reviews}
        onBack={() => navigate(-1)}
        onGuideClick={(guideId) => navigate(`/tours/guide/${guideId}`)}
        onBook={() => setShowBooking(true)}
      />

      {showBooking && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40" onClick={() => setShowBooking(false)}>
          <div
            className="w-full max-w-lg bg-white rounded-t-2xl p-5 pb-8 animate-slide-up"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-center mb-3">
              <div className="w-8 h-1 bg-gray-300 rounded-full" />
            </div>
            <h2 className="text-lg font-bold mb-4">{t('tours.bookingTitle')}</h2>

            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium text-[var(--color-text-secondary)] mb-1 block">{t('tours.bookingName')}</label>
                <input
                  type="text"
                  value={bookingName}
                  onChange={(e) => setBookingName(e.target.value)}
                  className="w-full px-3 py-2.5 border border-[var(--color-border)] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/30 focus:border-[var(--color-primary)]"
                  placeholder={t('tours.bookingName')}
                />
              </div>

              <div>
                <label className="text-sm font-medium text-[var(--color-text-secondary)] mb-1 block">{t('tours.bookingPhone')}</label>
                <input
                  type="tel"
                  value={bookingPhone}
                  onChange={(e) => setBookingPhone(e.target.value)}
                  className="w-full px-3 py-2.5 border border-[var(--color-border)] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/30 focus:border-[var(--color-primary)]"
                  placeholder="+7 (___) ___-__-__"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-[var(--color-text-secondary)] mb-1 block">{t('tours.bookingDate')}</label>
                <select
                  value={bookingDate}
                  onChange={(e) => setBookingDate(e.target.value)}
                  className="w-full px-3 py-2.5 border border-[var(--color-border)] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/30 focus:border-[var(--color-primary)] bg-white"
                >
                  <option value="">{t('tours.bookingDate')}</option>
                  {tour.dates.map((d) => (
                    <option key={d} value={d}>
                      {new Date(d).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' })}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-sm font-medium text-[var(--color-text-secondary)] mb-1 block">{t('tours.bookingPeople')}</label>
                <input
                  type="number"
                  min={1}
                  max={spotsLeft > 0 ? spotsLeft : 1}
                  value={bookingPeople}
                  onChange={(e) => setBookingPeople(Math.max(1, Math.min(spotsLeft > 0 ? spotsLeft : 1, Number(e.target.value))))}
                  className="w-full px-3 py-2.5 border border-[var(--color-border)] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/30 focus:border-[var(--color-primary)]"
                />
              </div>
            </div>

            <button
              onClick={handleBookingSubmit}
              disabled={!bookingName.trim() || !bookingPhone.trim() || !bookingDate}
              className={`w-full mt-5 py-3 rounded-xl font-semibold text-sm ${
                bookingName.trim() && bookingPhone.trim() && bookingDate
                  ? 'bg-[var(--color-primary)] text-white'
                  : 'bg-gray-200 text-gray-500'
              }`}
            >
              {t('tours.bookingSubmit')}
            </button>
          </div>
        </div>
      )}
    </>
  )
}
