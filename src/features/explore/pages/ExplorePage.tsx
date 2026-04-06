import { useMemo, useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useDataStore } from '@/data/stores/data-store'
import {
  UtensilsCrossed,
  Landmark,
  Map,
  MapPin,
  Bus,
  AlertTriangle,
  Star,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

import { SectionHeader } from '@/shared/ui/SectionHeader'
import { POICard } from '@/shared/ui/POICard'
import { CategoryChip } from '@/shared/ui/CategoryChip'
import { POICardSkeleton } from '@/shared/ui/Skeleton'
import { SEO } from '@/shared/ui/SEO'
import { JsonLd } from '@/shared/ui/JsonLd'
import type { POICategory } from '@/data/types'

const VISIBLE_CATEGORIES: POICategory[] = [
  'attractions',
  'food',
  'nature',
  'culture',
  'activities',
  'shopping',
  'nightlife',
]

const GHOST_PLACEHOLDERS_RU = [
  'Цейское ущелье...',
  'Осетинские пироги...',
  'Столовая гора...',
  'Проспект Мира...',
  'Даргавс...',
]

const GHOST_PLACEHOLDERS_EN = [
  'Tsey Gorge...',
  'Ossetian pies...',
  'Table Mountain...',
  'Prospekt Mira...',
  'Dargavs...',
]

/* ── Compact Header (48px) ── */
function ExploreHeader() {
  const { t } = useTranslation()
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 8)
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <header
      className={`sticky top-0 z-40 h-12 flex items-center justify-between px-4 transition-all duration-200 ${
        scrolled ? 'bg-white shadow-sm' : 'bg-transparent'
      }`}
    >
      <h1 className="text-base font-bold tracking-tight text-[var(--color-primary)]">
        BROBROGID
      </h1>
      <span className="text-sm text-[var(--color-text-secondary)]">
        {t('common.vladikavkaz')}
      </span>
    </header>
  )
}

/* ── Search Bar with rotating ghost placeholder ── */
function AnimatedSearchBar() {
  const navigate = useNavigate()
  const { i18n } = useTranslation()
  const placeholders =
    i18n.language === 'ru' ? GHOST_PLACEHOLDERS_RU : GHOST_PLACEHOLDERS_EN
  const [index, setIndex] = useState(0)
  const [fade, setFade] = useState(true)

  useEffect(() => {
    const interval = setInterval(() => {
      setFade(false)
      setTimeout(() => {
        setIndex((prev) => (prev + 1) % placeholders.length)
        setFade(true)
      }, 200)
    }, 3000)
    return () => clearInterval(interval)
  }, [placeholders.length])

  return (
    <button
      onClick={() => navigate('/search')}
      className="w-full flex items-center gap-3 bg-gray-50 border border-[var(--color-border)] rounded-xl px-4 h-12 text-left"
    >
      <svg
        className="w-5 h-5 text-[var(--color-text-secondary)] flex-shrink-0"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth={1.5}
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607z"
        />
      </svg>
      <span
        className={`text-[var(--color-text-secondary)] text-sm transition-opacity duration-200 ${
          fade ? 'opacity-100' : 'opacity-0'
        }`}
      >
        {placeholders[index]}
      </span>
    </button>
  )
}

/* ── Services Grid (2x3) ── */
const SERVICES: {
  key: string
  icon: LucideIcon
  labelKey: string
  path: string
  bg: string
  iconColor: string
}[] = [
  {
    key: 'food',
    icon: UtensilsCrossed,
    labelKey: 'explore.serviceFood',
    path: '/search?category=food',
    bg: 'bg-amber-50',
    iconColor: 'text-amber-500',
  },
  {
    key: 'attractions',
    icon: Landmark,
    labelKey: 'explore.serviceAttractions',
    path: '/search?category=attractions',
    bg: 'bg-red-50',
    iconColor: 'text-red-500',
  },
  {
    key: 'tours',
    icon: MapPin,
    labelKey: 'explore.serviceTours',
    path: '/tours',
    bg: 'bg-[var(--color-primary-light)]',
    iconColor: 'text-[var(--color-primary)]',
  },
  {
    key: 'map',
    icon: Map,
    labelKey: 'explore.serviceMap',
    path: '/map',
    bg: 'bg-emerald-50',
    iconColor: 'text-emerald-500',
  },
  {
    key: 'transport',
    icon: Bus,
    labelKey: 'explore.serviceTransport',
    path: '/search?category=transport',
    bg: 'bg-slate-50',
    iconColor: 'text-slate-500',
  },
  {
    key: 'sos',
    icon: AlertTriangle,
    labelKey: 'explore.serviceSOS',
    path: '/emergency',
    bg: 'bg-orange-50',
    iconColor: 'text-orange-600',
  },
]

function ServicesGrid() {
  const navigate = useNavigate()
  const { t } = useTranslation()

  return (
    <div className="grid grid-cols-3 gap-2 px-4 mb-5">
      {SERVICES.map(({ key, icon: Icon, labelKey, path, bg, iconColor }) => (
        <button
          key={key}
          onClick={() => navigate(path)}
          className={`flex flex-col items-center justify-center gap-1.5 ${bg} rounded-2xl py-3.5`}
        >
          <Icon size={22} className={iconColor} />
          <span className="text-[13px] font-medium leading-tight text-center">
            {t(labelKey)}
          </span>
        </button>
      ))}
    </div>
  )
}

/* ── Hero Card ── */
function HeroCard() {
  const navigate = useNavigate()
  const { t, i18n } = useTranslation()
  const lang = i18n.language as 'ru' | 'en'
  const tours = useDataStore((s) => s.tours)
  const pois = useDataStore((s) => s.pois)

  const heroTour = useMemo(
    () =>
      tours.find((tour) => tour.status === 'recruiting') ||
      [...tours].sort((a, b) => b.rating - a.rating)[0],
    [tours]
  )
  const heroPoi = useMemo(
    () => [...pois].sort((a, b) => b.rating - a.rating)[0],
    [pois]
  )

  const heroImage =
    heroTour?.photos?.[0] || heroPoi?.photos?.[0] || '/images/placeholder.webp'
  const heroTitle = heroTour ? heroTour.name[lang] : heroPoi?.name[lang] || ''
  const heroSubtitle = t('explore.heroTitle')

  const handleTap = () => {
    if (heroTour) navigate(`/tours/${heroTour.id}`)
    else if (heroPoi) navigate(`/poi/${heroPoi.id}`)
  }

  if (!heroTour && !heroPoi) return null

  return (
    <button onClick={handleTap} className="block w-full px-4 mb-5 text-left">
      <div className="relative w-full h-[200px] rounded-2xl overflow-hidden">
        <img
          src={heroImage}
          alt={heroTitle}
          className="w-full h-full object-cover"
          loading="eager"
          onError={(e) => {
            ;(e.target as HTMLImageElement).src =
              'https://placehold.co/800x400/334155/ffffff?text=BROBROGID'
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-4">
          <span className="text-xs font-semibold text-white/80 uppercase tracking-wider">
            {heroSubtitle}
          </span>
          <h2 className="text-lg font-bold text-white mt-0.5 line-clamp-2">
            {heroTitle}
          </h2>
          {heroTour && (
            <div className="flex items-center gap-3 mt-1.5">
              <span className="text-sm text-white/90 flex items-center gap-1">
                <Star size={14} className="fill-yellow-400 text-yellow-400" />
                {heroTour.rating.toFixed(1)}
              </span>
              <span className="text-sm text-white/80">
                {heroTour.price.toLocaleString('ru-RU')} ₽
              </span>
            </div>
          )}
        </div>
      </div>
    </button>
  )
}

/* ── Card Carousel ── */
function CardCarousel({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative">
      <div className="flex gap-3 px-4 overflow-x-auto no-scrollbar pb-5 scroll-snap-container">
        {children}
      </div>
      <div className="absolute top-0 right-0 bottom-5 w-8 bg-gradient-to-l from-white to-transparent pointer-events-none" />
    </div>
  )
}

/* ── Contextual section logic ── */
function getContextualConfig(): {
  titleKey: string
  filter: (pois: any[]) => any[]
} {
  const hour = new Date().getHours()
  const day = new Date().getDay()
  const isWeekend = day === 0 || day === 6

  if (isWeekend) {
    return {
      titleKey: 'explore.contextWeekend',
      filter: (all) => all.filter((p) => p.category === 'nature').slice(0, 10),
    }
  }
  if (hour >= 6 && hour < 11) {
    return {
      titleKey: 'explore.contextMorning',
      filter: (all) => all.filter((p) => p.category === 'food').slice(0, 10),
    }
  }
  if (hour >= 17 && hour < 23) {
    return {
      titleKey: 'explore.contextEvening',
      filter: (all) =>
        all
          .filter((p) => p.category === 'food' && (p.priceLevel ?? 0) >= 2)
          .slice(0, 10),
    }
  }
  return {
    titleKey: 'explore.contextDefault',
    filter: (all) =>
      all
        .filter((p) => p.category === 'food' && p.cuisineType === 'national')
        .slice(0, 10),
  }
}

/* ── Main Page ── */
export default function ExplorePage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const pois = useDataStore((s) => s.pois)
  const isLoading = pois.length === 0

  const popular = useMemo(
    () => [...pois].sort((a, b) => b.rating - a.rating).slice(0, 10),
    [pois]
  )

  const contextConfig = useMemo(() => getContextualConfig(), [])
  const contextPois = useMemo(
    () => contextConfig.filter(pois),
    [pois, contextConfig]
  )

  return (
    <div className="pb-4">
      <SEO
        title={t('app.name') + ' — ' + t('app.tagline')}
        description="Путеводитель по Владикавказу и Северной Осетии. Достопримечательности, рестораны, туры, карта."
        url="/"
      />
      <JsonLd data={{
        '@type': 'WebSite',
        name: 'BROBROGID',
        url: 'https://brobrogid.ru',
        description: 'Путеводитель по Владикавказу и Северной Осетии',
        potentialAction: {
          '@type': 'SearchAction',
          target: 'https://brobrogid.ru/search?q={search_term_string}',
          'query-input': 'required name=search_term_string'
        }
      }} />
      {/* 1. Compact Header */}
      <ExploreHeader />

      {/* 2. Search Bar with rotating placeholder */}
      <div className="px-4 py-2 mb-2">
        <AnimatedSearchBar />
      </div>

      {/* 3. Services Grid (2x3) */}
      <ServicesGrid />

      {/* 4. Hero Card */}
      <HeroCard />

      {/* 5. Category Chips */}
      <div className="relative mb-4">
        <div className="flex gap-2 px-4 overflow-x-auto no-scrollbar">
          {VISIBLE_CATEGORIES.map((cat) => (
            <CategoryChip
              key={cat}
              category={cat}
              onClick={() => navigate(`/search?category=${cat}`)}
            />
          ))}
        </div>
        <div className="absolute top-0 right-0 bottom-0 w-8 bg-gradient-to-l from-white to-transparent pointer-events-none" />
      </div>

      {/* 6. Popular carousel */}
      <SectionHeader
        title={t('explore.popularPlaces')}
        linkTo="/search?sort=popular"
      />
      <CardCarousel>
        {isLoading
          ? Array.from({ length: 3 }, (_, i) => (
              <POICardSkeleton key={i} variant="horizontal" />
            ))
          : popular.map((poi) => (
              <POICard key={poi.id} poi={poi} variant="horizontal" />
            ))}
      </CardCarousel>

      {/* 7. Contextual section */}
      {(isLoading || contextPois.length > 0) && (
        <>
          <SectionHeader title={t(contextConfig.titleKey)} />
          <CardCarousel>
            {isLoading
              ? Array.from({ length: 3 }, (_, i) => (
                  <POICardSkeleton key={i} variant="horizontal" />
                ))
              : contextPois.map((poi) => (
                  <POICard key={poi.id} poi={poi} variant="horizontal" />
                ))}
          </CardCarousel>
        </>
      )}
    </div>
  )
}
