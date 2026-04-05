import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useDataStore } from '@/data/stores/data-store'
import { SearchBar } from '@/shared/ui/SearchBar'
import { SectionHeader } from '@/shared/ui/SectionHeader'
import { POICard } from '@/shared/ui/POICard'
import { CategoryChip } from '@/shared/ui/CategoryChip'
import type { POICategory } from '@/data/types'

const CATEGORIES: POICategory[] = ['attractions', 'food', 'nature', 'culture', 'shopping', 'activities', 'nightlife', 'practical']

function TourCard({ tour, lang }: { tour: any; lang: 'ru' | 'en' }) {
  const navigate = useNavigate()
  return (
    <button
      onClick={() => navigate(`/tours/${tour.id}`)}
      className="flex-shrink-0 w-[220px] bg-white rounded-2xl shadow-sm border border-[var(--color-border)] overflow-hidden text-left"
    >
      <div className="relative h-[130px] bg-gray-100">
        <img src={tour.photos?.[0]} alt={tour.name[lang]} className="w-full h-full object-cover" loading="lazy"
          onError={(e) => { (e.target as HTMLImageElement).src = `https://placehold.co/440x260/e2e8f0/64748b?text=${encodeURIComponent(tour.name.ru.slice(0, 12))}` }} />
        <div className="absolute bottom-2 left-2 px-2 py-0.5 bg-white/90 backdrop-blur rounded-full text-xs font-semibold">
          {tour.price.toLocaleString('ru-RU')} ₽
        </div>
        <div className={`absolute top-2 right-2 px-2 py-0.5 rounded-full text-[10px] font-bold text-white ${tour.status === 'recruiting' ? 'bg-green-500' : tour.status === 'full' ? 'bg-red-500' : 'bg-gray-500'}`}>
          {tour.status === 'recruiting' ? 'Набор' : tour.status === 'full' ? 'Набрана' : 'Завершён'}
        </div>
      </div>
      <div className="p-3">
        <h3 className="font-semibold text-sm truncate">{tour.name[lang]}</h3>
        <div className="flex items-center gap-2 mt-1 text-xs text-[var(--color-text-secondary)]">
          <span>⏱ {tour.duration}</span>
          <span>👥 {tour.currentGroupSize}/{tour.maxGroupSize}</span>
        </div>
        <div className="flex items-center gap-1 mt-1">
          <span className="text-yellow-500 text-xs">★</span>
          <span className="text-xs font-medium">{tour.rating.toFixed(1)}</span>
        </div>
      </div>
    </button>
  )
}

function QuickAccessButton({ icon, label, onClick }: { icon: string; label: string; onClick: () => void }) {
  return (
    <button onClick={onClick} className="flex flex-col items-center gap-1.5 flex-1 py-3 px-2 bg-white rounded-2xl shadow-sm border border-[var(--color-border)]">
      <span className="text-2xl">{icon}</span>
      <span className="text-xs font-medium text-center">{label}</span>
    </button>
  )
}

export default function ExplorePage() {
  const { t, i18n } = useTranslation()
  const navigate = useNavigate()
  const lang = i18n.language as 'ru' | 'en'
  const pois = useDataStore((s) => s.pois)
  const tours = useDataStore((s) => s.tours)

  const popular = useMemo(() => [...pois].sort((a, b) => b.rating - a.rating).slice(0, 10), [pois])
  const nationalFood = useMemo(() => pois.filter((p) => p.category === 'food' && p.cuisineType === 'national').slice(0, 10), [pois])
  const europeanFood = useMemo(() => pois.filter((p) => p.category === 'food' && p.cuisineType === 'european').slice(0, 10), [pois])
  const naturePois = useMemo(() => pois.filter((p) => p.category === 'nature').slice(0, 10), [pois])

  return (
    <div className="pb-4">
      {/* Header */}
      <div className="px-4 pt-4 pb-3 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-[var(--color-primary)]">BROBROGID</h1>
          <p className="text-xs text-[var(--color-text-secondary)]">{t('app.tagline')}</p>
        </div>
        <button onClick={() => navigate('/emergency')} className="w-10 h-10 bg-red-50 rounded-full flex items-center justify-center">
          <span className="text-lg">🚨</span>
        </button>
      </div>

      {/* Search */}
      <div className="px-4 mb-4">
        <SearchBar />
      </div>

      {/* Quick Access */}
      <div className="flex gap-2 px-4 mb-5">
        <QuickAccessButton icon="🚨" label="Экстренные" onClick={() => navigate('/emergency')} />
        <QuickAccessButton icon="🍽️" label="Еда" onClick={() => navigate('/food')} />
        <QuickAccessButton icon="🗺️" label="Туры" onClick={() => navigate('/tours')} />
        <QuickAccessButton icon="🚌" label="Транспорт" onClick={() => navigate('/map?filter=transport')} />
      </div>

      {/* Categories */}
      <div className="flex gap-2 px-4 pb-4 overflow-x-auto no-scrollbar">
        {CATEGORIES.map((cat) => (
          <CategoryChip key={cat} category={cat} onClick={() => navigate(`/search?category=${cat}`)} />
        ))}
      </div>

      {/* Popular */}
      <SectionHeader title="Популярные места" linkTo="/search?sort=popular" />
      <div className="flex gap-3 px-4 overflow-x-auto no-scrollbar pb-5">
        {popular.map((poi) => <POICard key={poi.id} poi={poi} variant="horizontal" />)}
      </div>

      {/* National Food */}
      <SectionHeader title={t('food.national')} linkTo="/food?type=national" />
      <div className="flex gap-3 px-4 overflow-x-auto no-scrollbar pb-5">
        {nationalFood.map((poi) => <POICard key={poi.id} poi={poi} variant="horizontal" />)}
      </div>

      {/* Tours */}
      <SectionHeader title={t('tours.title')} linkTo="/tours" />
      <div className="flex gap-3 px-4 overflow-x-auto no-scrollbar pb-5">
        {tours.map((tour) => <TourCard key={tour.id} tour={tour} lang={lang} />)}
      </div>

      {/* European Food */}
      <SectionHeader title={t('food.european')} linkTo="/food?type=european" />
      <div className="flex gap-3 px-4 overflow-x-auto no-scrollbar pb-5">
        {europeanFood.map((poi) => <POICard key={poi.id} poi={poi} variant="horizontal" />)}
      </div>

      {/* Nature */}
      <SectionHeader title="Природа Осетии" linkTo="/search?category=nature" />
      <div className="flex gap-3 px-4 overflow-x-auto no-scrollbar pb-5">
        {naturePois.map((poi) => <POICard key={poi.id} poi={poi} variant="horizontal" />)}
      </div>
    </div>
  )
}
