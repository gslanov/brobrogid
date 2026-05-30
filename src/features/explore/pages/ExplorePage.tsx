import { useMemo, useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useDataStore } from '@/data/stores/data-store'
import { Bus } from 'lucide-react'

import { SectionHeader } from '@/shared/ui/SectionHeader'
import { POICard } from '@/shared/ui/POICard'
import { POICardSkeleton } from '@/shared/ui/Skeleton'
import { SEO } from '@/shared/ui/SEO'
import { JsonLd } from '@/shared/ui/JsonLd'
import { CATEGORY_COLORS, CATEGORY_ICONS } from '@/shared/lib/utils'
import type { POI, POICategory } from '@/data/types'

const POI_CATEGORIES: POICategory[] = [
  'attractions',
  'food',
  'accommodation',
  'nature',
  'culture',
  'museums',
  'activities',

  'tours',
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

/* ── Categories + Services Grid ── */
function CategoriesGrid() {
  const navigate = useNavigate()
  const { t } = useTranslation()

  return (
    <div className="grid grid-cols-3 gap-2 px-4 mb-5">
      {POI_CATEGORIES.map((cat) => {
        const Icon = CATEGORY_ICONS[cat]
        const color = CATEGORY_COLORS[cat]
        return (
          <button
            key={cat}
            onClick={() => navigate(`/search?category=${cat}`)}
            className="flex flex-col items-center justify-center gap-1.5 rounded-2xl py-3.5"
            style={{ backgroundColor: color + '18' }}
          >
            <Icon size={22} style={{ color }} />
            <span className="text-[12px] font-medium leading-tight text-center px-1 w-full break-words">
              {t(`categories.${cat}`)}
            </span>
          </button>
        )
      })}
      <button
        onClick={() => navigate('/transport')}
        className="flex flex-col items-center justify-center gap-1.5 bg-slate-50 rounded-2xl py-3.5"
      >
        <Bus size={22} className="text-slate-500" />
        <span className="text-[12px] font-medium leading-tight text-center">{t('explore.serviceTransport')}</span>
      </button>
    </div>
  )
}

/* ── Hero Card ── */
function HeroCard() {
  const navigate = useNavigate()
  const { t, i18n } = useTranslation()
  const lang = i18n.language as 'ru' | 'en'
  const pois = useDataStore((s) => s.pois)

  const heroPoi = useMemo(
    () => [...pois].sort((a, b) => b.rating - a.rating)[0],
    [pois]
  )

  if (!heroPoi) return null

  return (
    <button onClick={() => navigate(`/poi/${heroPoi.id}`)} className="block w-full px-4 mb-5 text-left">
      <div className="relative w-full h-[200px] rounded-2xl overflow-hidden">
        <img
          src={heroPoi.photos?.[0] || '/images/placeholder.webp'}
          alt={heroPoi.name[lang] || ''}
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
            {t('explore.heroTitle')}
          </span>
          <h2 className="text-lg font-bold text-white mt-0.5 line-clamp-2">
            {heroPoi.name[lang] || ''}
          </h2>
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
  filter: (pois: POI[]) => POI[]
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
        title="BROBROGID — Гид по Владикавказу и Северной Осетии: туры, рестораны, ущелья"
        description="Путеводитель по Владикавказу и Северной Осетии: что посмотреть, ущелья и горы, туры и гиды, где поесть и остановиться, как добраться."
        canonical="/"
        ogImage="/og/home.jpg"
        ogType="website"
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

      {/* 3. Categories Grid */}
      <CategoriesGrid />

      {/* 4. Hero Card */}
      <HeroCard />

      {/* 5. Popular carousel */}
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
