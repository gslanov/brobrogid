import { useMemo, useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { motion } from 'framer-motion'
import { useDataStore } from '@/data/stores/data-store'
import { Bus, Search } from 'lucide-react'

import { SectionHeader } from '@/shared/ui/SectionHeader'
import { POICard } from '@/shared/ui/POICard'
import { POICardSkeleton } from '@/shared/ui/Skeleton'
import { SEO } from '@/shared/ui/SEO'
import { JsonLd } from '@/shared/ui/JsonLd'
import { CATEGORY_COLORS, CATEGORY_ICONS, resetScroll } from '@/shared/lib/utils'
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

/* ═══════════════════════════════════════════════════════════
   Шапка — прозрачная поверх фото, стеклянная при прокрутке
   ═══════════════════════════════════════════════════════════ */
function ExploreHeader() {
  const { t } = useTranslation()
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const el = document.getElementById('scroll-root')
    if (!el) return
    const handleScroll = () => setScrolled(el.scrollTop > 24)
    el.addEventListener('scroll', handleScroll, { passive: true })
    return () => el.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <header
      className="sticky top-0 z-40 transition-all duration-300"
      style={{
        background: scrolled
          ? 'linear-gradient(180deg, rgba(26,31,40,0.97), rgba(1,2,4,0.66))'
          : 'linear-gradient(180deg, rgba(1,2,4,0.6), transparent)',
        backdropFilter: scrolled ? 'blur(20px)' : 'none',
        WebkitBackdropFilter: scrolled ? 'blur(20px)' : 'none',
        boxShadow: scrolled ? 'inset 0 1px 0 rgba(255,255,255,0.20), 0 8px 24px -12px #000' : 'none',
      }}
    >
      <div className="h-12 flex items-center justify-between px-4">
        <div className="flex items-center gap-2">
          <i
            className="w-[9px] h-[9px] diamond"
            style={{ background: 'var(--terra-hot)', boxShadow: '0 0 12px var(--terra-glow)' }}
          />
          <h1
            className="text-[14px] font-bold tracking-[0.18em]"
            style={{ color: 'var(--sand)' }}
          >
            BROBROGID
          </h1>
        </div>
        <span className="text-[12px] tracking-wide" style={{ color: 'var(--text-3)' }}>
          {t('common.vladikavkaz')}
        </span>
      </div>
      {/* Орнаментальный пояс проявляется вместе с фоном шапки */}
      <div
        className="orn-belt transition-opacity duration-300"
        style={{ height: 3, opacity: scrolled ? 0.5 : 0 }}
      />
    </header>
  )
}

/* ═══════════════════════════════════════════════════════════
   Герой — кинематографичный экран места дня
   ═══════════════════════════════════════════════════════════ */
function CinematicHero({ poi }: { poi: POI }) {
  const navigate = useNavigate()
  const { t, i18n } = useTranslation()
  const lang = i18n.language as 'ru' | 'en'
  const [offset, setOffset] = useState(0)

  /* Параллакс: фото уезжает медленнее, чем контент */
  useEffect(() => {
    const el = document.getElementById('scroll-root')
    if (!el) return
    const onScroll = () => setOffset(Math.min(el.scrollTop * 0.35, 120))
    el.addEventListener('scroll', onScroll, { passive: true })
    return () => el.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <button
      onClick={() => { resetScroll(); navigate(`/poi/${poi.id}`) }}
      className="relative block w-full text-left overflow-hidden -mt-[calc(3rem+4px)]"
      style={{ height: 'min(58vh, 460px)' }}
    >
      <div className="absolute inset-0" style={{ transform: `translateY(${offset}px)` }}>
        <img
          src={poi.photos?.[0] || '/images/placeholder.webp'}
          alt={poi.name[lang] || ''}
          className="w-full h-full object-cover animate-ken-burns"
          loading="eager"
          onError={(e) => {
            ;(e.target as HTMLImageElement).src = 'https://placehold.co/900x1200/12151B/6B7480?text=BROBROGID'
          }}
        />
      </div>

      <div className="absolute inset-0 scrim pointer-events-none" />

      <div className="absolute left-5 right-5 bottom-9">
        <span
          className="inline-flex items-center gap-2 px-2.5 py-1.5 rounded-full text-[9.5px] font-semibold uppercase tracking-[0.16em] mb-3"
          style={{
            background: 'var(--terra-tint)',
            border: '1px solid var(--terra-line)',
            color: '#F0C197',
            backdropFilter: 'blur(8px)',
          }}
        >
          <i className="w-[7px] h-[7px] diamond" style={{ background: 'var(--terra-hot)' }} />
          {t('explore.placeOfDay')}
        </span>

        <h2
          className="text-[30px] font-bold leading-[1.06] text-white"
          style={{ textShadow: '0 4px 26px rgba(0,0,0,0.65)' }}
        >
          {poi.name[lang] || ''}
        </h2>

        <p className="text-[12.5px] mt-2.5 flex items-center gap-2.5" style={{ color: '#AFBECC' }}>
          <span style={{ color: 'var(--terra-hot)' }}>★ {poi.rating.toFixed(1)}</span>
          <span>·</span>
          <span>
            {!poi.subcategory || /^[a-z0-9_-]+$/.test(poi.subcategory)
              ? t(`categories.${poi.category}`)
              : poi.subcategory}
          </span>
        </p>
      </div>
    </button>
  )
}

/* ═══════════════════════════════════════════════════════════
   Стеклянная панель со счётчиками — «нахлёстом» на герое
   ═══════════════════════════════════════════════════════════ */
function StatsPanel({ pois }: { pois: POI[] }) {
  const { t } = useTranslation()

  const stats = useMemo(() => {
    const categories = new Set(pois.map((p) => p.category))
    const reviews = pois.reduce((sum, p) => sum + (p.reviewCount || 0), 0)
    return [
      { value: pois.length, label: t('explore.statPlaces') },
      { value: categories.size, label: t('explore.statCategories') },
      { value: reviews, label: t('explore.statReviews') },
    ]
  }, [pois, t])

  return (
    <div className="relative z-10 -mt-7 mx-4">
      <div className="glass orn-corners rounded-[var(--radius-lg)] px-3 py-3.5 flex items-stretch">
        {stats.map((s, i) => (
          <div key={s.label} className="flex-1 flex items-center">
            {i > 0 && (
              <span
                className="w-px self-stretch mr-3"
                style={{ background: 'linear-gradient(180deg, transparent, rgba(255,255,255,0.16), transparent)' }}
              />
            )}
            <div className="flex-1 text-center">
              <div className="text-[17px] font-semibold leading-none">{s.value}</div>
              <div className="text-[9.5px] uppercase tracking-[0.1em] mt-1.5" style={{ color: 'var(--text-3)' }}>
                {s.label}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════
   Поиск — стеклянная строка со сменой подсказки
   ═══════════════════════════════════════════════════════════ */
function AnimatedSearchBar() {
  const navigate = useNavigate()
  const { i18n } = useTranslation()
  const placeholders = i18n.language === 'ru' ? GHOST_PLACEHOLDERS_RU : GHOST_PLACEHOLDERS_EN
  const [index, setIndex] = useState(0)
  const [fade, setFade] = useState(true)

  useEffect(() => {
    const interval = setInterval(() => {
      setFade(false)
      setTimeout(() => {
        setIndex((prev) => (prev + 1) % placeholders.length)
        setFade(true)
      }, 220)
    }, 3200)
    return () => clearInterval(interval)
  }, [placeholders.length])

  return (
    <motion.button
      onClick={() => navigate('/search')}
      whileTap={{ scale: 0.985 }}
      className="w-full flex items-center gap-3 rounded-[var(--radius-md)] px-4 h-[46px] text-left"
      style={{ background: 'var(--surface-2)', border: '1px solid var(--color-border)' }}
    >
      <Search size={17} style={{ color: 'var(--terra-hot)' }} className="flex-shrink-0" />
      <span
        className="text-[13px] transition-opacity duration-200"
        style={{ color: 'var(--text-3)', opacity: fade ? 1 : 0 }}
      >
        {placeholders[index]}
      </span>
    </motion.button>
  )
}

/* ═══════════════════════════════════════════════════════════
   Плитки категорий — ромб в цвете категории
   ═══════════════════════════════════════════════════════════ */
function CategoriesGrid() {
  const navigate = useNavigate()
  const { t } = useTranslation()

  const tiles = [
    ...POI_CATEGORIES.map((cat) => ({
      key: cat,
      label: t(`categories.${cat}`),
      color: CATEGORY_COLORS[cat],
      Icon: CATEGORY_ICONS[cat],
      // «Туры» ведут на маршруты, а не на список турфирм: человек ищет,
      // куда съездить. Сами фирмы доступны ссылкой внизу экрана маршрутов.
      to: cat === 'tours' ? '/tours' : `/search?category=${cat}`,
    })),
    {
      key: 'transport',
      label: t('explore.serviceTransport'),
      color: '#8A94A3',
      Icon: Bus,
      to: '/transport',
    },
  ]

  return (
    <div className="grid grid-cols-3 gap-2.5 px-4 stagger">
      {tiles.map(({ key, label, color, Icon, to }) => (
        <motion.button
          key={key}
          onClick={() => navigate(to)}
          whileTap={{ scale: 0.94 }}
          transition={{ type: 'spring', stiffness: 500, damping: 28 }}
          className="animate-fade-up flex flex-col items-center justify-center gap-2 rounded-[var(--radius-md)] py-3.5"
          style={{
            background: 'var(--surface-1)',
            border: '1px solid var(--color-border)',
          }}
        >
          {/* Иконка в ромбовидной рамке цвета категории */}
          <span className="relative w-9 h-9 flex items-center justify-center">
            <span
              className="absolute inset-0 diamond"
              style={{ background: color + '1F', border: `1px solid ${color}55` }}
            />
            <Icon size={17} style={{ color }} className="relative z-10" />
          </span>
          <span
            className="text-[10.5px] font-medium leading-[1.2] text-center px-1 w-full"
            style={{ hyphens: 'auto', WebkitHyphens: 'auto', overflowWrap: 'break-word' } as React.CSSProperties}
          >
            {label}
          </span>
        </motion.button>
      ))}
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════
   Лента карточек с инерцией
   ═══════════════════════════════════════════════════════════ */
function CardCarousel({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null)
  return (
    <div className="relative">
      <div
        ref={ref}
        className="flex gap-3 px-4 overflow-x-auto no-scrollbar momentum pb-5 scroll-snap-container"
      >
        {children}
      </div>
      {/* Мягкое затухание у правого края — намёк, что лента продолжается */}
      <div
        className="absolute top-0 right-0 bottom-5 w-10 pointer-events-none"
        style={{ background: 'linear-gradient(90deg, transparent, var(--bg))' }}
      />
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════
   Контекстный раздел — зависит от времени суток и дня недели
   ═══════════════════════════════════════════════════════════ */
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
        all.filter((p) => p.category === 'food' && (p.priceLevel ?? 0) >= 2).slice(0, 10),
    }
  }
  return {
    titleKey: 'explore.contextDefault',
    filter: (all) =>
      all.filter((p) => p.category === 'food' && p.cuisineType === 'national').slice(0, 10),
  }
}

/* ═══════════════════════════════════════════════════════════
   Экран
   ═══════════════════════════════════════════════════════════ */
export default function ExplorePage() {
  const { t } = useTranslation()
  const pois = useDataStore((s) => s.pois)
  const isLoading = pois.length === 0

  /* Место дня меняется каждый день — берём из лучших по рейтингу.
     Турфирмы и отели сюда не попадают: герой должен быть местом, а не услугой. */
  const heroPoi = useMemo(() => {
    const HERO_CATEGORIES: POICategory[] = ['nature', 'attractions', 'culture', 'museums', 'activities']
    const candidates = [...pois]
      .filter((p) => p.photos?.length && HERO_CATEGORIES.includes(p.category))
      .sort((a, b) => b.rating - a.rating)
      .slice(0, 12)
    if (candidates.length === 0) return null
    const dayOfYear = Math.floor(
      (Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000
    )
    return candidates[dayOfYear % candidates.length]
  }, [pois])

  const popular = useMemo(
    () => [...pois].sort((a, b) => b.rating - a.rating).slice(0, 10),
    [pois]
  )

  const contextConfig = useMemo(() => getContextualConfig(), [])
  const contextPois = useMemo(() => contextConfig.filter(pois), [pois, contextConfig])

  return (
    <div className="pb-6">
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

      <ExploreHeader />

      {/* 1. Кинематографичный герой во весь экран */}
      {heroPoi && <CinematicHero poi={heroPoi} />}

      {/* 2. Счётчики на стекле поверх героя */}
      {!isLoading && <StatsPanel pois={pois} />}

      {/* 3. Поиск */}
      <div className="px-4 mt-5 mb-6">
        <AnimatedSearchBar />
      </div>

      {/* 4. Категории */}
      <SectionHeader title={t('explore.categoriesTitle')} />
      <div className="mb-7">
        <CategoriesGrid />
      </div>

      {/* 5. Популярное */}
      <SectionHeader title={t('explore.popularPlaces')} linkTo="/search?sort=popular" />
      <CardCarousel>
        {isLoading
          ? Array.from({ length: 3 }, (_, i) => <POICardSkeleton key={i} variant="horizontal" />)
          : popular.map((poi) => <POICard key={poi.id} poi={poi} variant="horizontal" />)}
      </CardCarousel>

      {/* 6. Контекстный раздел */}
      {(isLoading || contextPois.length > 0) && (
        <>
          <SectionHeader title={t(contextConfig.titleKey)} />
          <CardCarousel>
            {isLoading
              ? Array.from({ length: 3 }, (_, i) => <POICardSkeleton key={i} variant="horizontal" />)
              : contextPois.map((poi) => <POICard key={poi.id} poi={poi} variant="horizontal" />)}
          </CardCarousel>
        </>
      )}
    </div>
  )
}
