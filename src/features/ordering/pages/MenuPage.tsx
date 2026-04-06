import { useState, useEffect, useMemo, useCallback, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { SEO } from '@/shared/ui/SEO'
import { useDataStore } from '@/data/stores/data-store'
import { useOrderStore } from '@/data/stores/order-store'
import { getDB } from '@/data/db'
import { formatPrice } from '@/shared/lib/utils'
import type { MenuItem } from '@/data/types'
import { Search, Flame, X, Minus, Plus } from 'lucide-react'

/* ── Inline counter pill ─────────────────────────────────────── */

function InlineCounter({
  quantity,
  onAdd,
  onIncrement,
  onDecrement,
  label,
}: {
  quantity: number
  onAdd: () => void
  onIncrement: () => void
  onDecrement: () => void
  label: string
}) {
  if (quantity === 0) {
    return (
      <button
        onClick={(e) => { e.stopPropagation(); onAdd() }}
        className="px-4 py-2.5 min-h-[44px] bg-[var(--color-primary)] text-white rounded-lg text-xs font-medium"
      >
        + {label}
      </button>
    )
  }

  return (
    <div className="inline-flex items-center min-h-[44px] rounded-full bg-[var(--color-primary)] text-white overflow-hidden">
      <button
        onClick={(e) => { e.stopPropagation(); onDecrement() }}
        className="w-10 h-[44px] flex items-center justify-center active:bg-white/20"
        aria-label="Decrease quantity"
      >
        <Minus size={16} />
      </button>
      <span className="min-w-[24px] text-center text-sm font-bold select-none">{quantity}</span>
      <button
        onClick={(e) => { e.stopPropagation(); onIncrement() }}
        className="w-10 h-[44px] flex items-center justify-center active:bg-white/20"
        aria-label="Increase quantity"
      >
        <Plus size={16} />
      </button>
    </div>
  )
}

/* ── Dish detail modal ───────────────────────────────────────── */

function DishDetailModal({
  item,
  lang,
  quantity,
  onAdd,
  onIncrement,
  onDecrement,
  onClose,
  addLabel,
}: {
  item: MenuItem
  lang: 'ru' | 'en'
  quantity: number
  onAdd: () => void
  onIncrement: () => void
  onDecrement: () => void
  onClose: () => void
  addLabel: string
}) {
  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [onClose])

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center" onClick={onClose}>
      {/* Backdrop */}
      <div className="absolute inset-0 sheet-backdrop" />

      {/* Sheet */}
      <div
        className="relative w-full max-w-lg bg-white rounded-t-2xl overflow-hidden animate-slide-up max-h-[90dvh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 z-10 w-9 h-9 flex items-center justify-center rounded-full bg-black/40 text-white"
          aria-label="Close"
        >
          <X size={20} />
        </button>

        {/* Scrollable content */}
        <div className="overflow-y-auto flex-1">
          {/* Photo */}
          {item.photo ? (
            <div className="w-full h-[250px] bg-gray-100">
              <img
                src={item.photo}
                alt={item.name[lang]}
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = `https://placehold.co/600x250/e2e8f0/64748b?text=${encodeURIComponent(item.name.ru.slice(0, 10))}`
                }}
              />
            </div>
          ) : (
            <div className="w-full h-[250px] bg-gray-100 flex items-center justify-center text-gray-400 text-4xl">
              {item.name[lang].slice(0, 1)}
            </div>
          )}

          {/* Info */}
          <div className="px-4 pt-4 pb-2">
            <h2 className="text-xl font-bold">{item.name[lang]}</h2>

            {item.isPopular && (
              <span className="text-sm text-orange-600 font-medium inline-flex items-center gap-1 mt-1">
                <Flame size={14} /> Popular
              </span>
            )}

            <p className="text-sm text-[var(--color-text-secondary)] mt-2 leading-relaxed">
              {item.description[lang]}
            </p>

            {item.tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-3">
                {item.tags.map((tag) => (
                  <span key={tag} className="text-xs px-2 py-1 bg-gray-100 rounded-full text-gray-600">
                    {tag}
                  </span>
                ))}
              </div>
            )}

            <div className="mt-4 text-xl font-bold">{formatPrice(item.price)}</div>
          </div>
        </div>

        {/* Bottom action */}
        <div className="px-4 py-4 border-t border-[var(--color-border)] bg-white">
          {quantity === 0 ? (
            <button
              onClick={() => { onAdd(); onClose() }}
              className="w-full py-3.5 min-h-[44px] bg-[var(--color-primary)] text-white rounded-xl text-sm font-semibold"
            >
              {addLabel} -- {formatPrice(item.price)}
            </button>
          ) : (
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-[var(--color-text-secondary)]">
                {formatPrice(item.price * quantity)}
              </span>
              <InlineCounter
                quantity={quantity}
                onAdd={onAdd}
                onIncrement={onIncrement}
                onDecrement={onDecrement}
                label={addLabel}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

/* ── Menu page ───────────────────────────────────────────────── */

export default function MenuPage() {
  const { poiId } = useParams<{ poiId: string }>()
  const navigate = useNavigate()
  const { i18n, t } = useTranslation()
  const lang = i18n.language as 'ru' | 'en'
  const pois = useDataStore((s) => s.pois)
  const isLoaded = useDataStore((s) => s.isLoaded)
  const poi = pois.find((p) => p.id === poiId)
  const { currentOrder, addItem, isDifferentRestaurant, clearCart, updateQuantity } = useOrderStore()
  const [items, setItems] = useState<MenuItem[]>([])
  const [activeCategory, setActiveCategory] = useState<string | null>(null)
  const [selectedDish, setSelectedDish] = useState<MenuItem | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [debouncedQuery, setDebouncedQuery] = useState('')
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    if (!poiId) return
    getDB().then(db => db.getAllFromIndex('menuItems', 'by-poi', poiId)).then(setItems)
  }, [poiId])

  // Debounced search
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => setDebouncedQuery(searchQuery), 300)
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current) }
  }, [searchQuery])

  const categories = [...new Set(items.map((i) => i.category))]

  const filtered = useMemo(() => {
    let result = activeCategory ? items.filter((i) => i.category === activeCategory) : items
    if (debouncedQuery.trim()) {
      const q = debouncedQuery.trim().toLowerCase()
      result = result.filter((i) =>
        i.name.ru.toLowerCase().includes(q) ||
        i.name.en.toLowerCase().includes(q)
      )
    }
    return result
  }, [items, activeCategory, debouncedQuery])

  const cartCount = (currentOrder && currentOrder.poiId === poiId) ? currentOrder.items.reduce((s, i) => s + i.quantity, 0) : 0
  const cartTotal = (currentOrder && currentOrder.poiId === poiId) ? currentOrder.total : 0

  const showSearch = items.length > 10

  /** Get quantity for a specific menu item from the cart */
  const getItemQuantity = useCallback((menuItemId: string): number => {
    if (!currentOrder || currentOrder.poiId !== poiId) return 0
    const found = currentOrder.items.find((i) => i.menuItemId === menuItemId)
    return found ? found.quantity : 0
  }, [currentOrder, poiId])

  /** Handle add with restaurant-switch confirmation */
  const handleAdd = useCallback((itemId: string, price: number) => {
    if (isDifferentRestaurant(poiId!)) {
      if (window.confirm(lang === 'ru'
        ? 'В корзине товары из другого ресторана. Очистить и начать новый заказ?'
        : 'Cart has items from another restaurant. Clear and start a new order?')) {
        clearCart()
        addItem(poiId!, itemId, price)
      }
    } else {
      addItem(poiId!, itemId, price)
    }
  }, [poiId, isDifferentRestaurant, clearCart, addItem, lang])

  // 404 handling
  if (isLoaded && !poi) {
    return (
      <div className="min-h-dvh flex flex-col items-center justify-center px-4 text-center">
        <div className="mb-4 text-[var(--color-text-secondary)]"><Search size={48} /></div>
        <h1 className="text-xl font-bold mb-2">{t('ordering.notFound')}</h1>
        <p className="text-sm text-[var(--color-text-secondary)] mb-6">{t('ordering.notFoundHint')}</p>
        <button onClick={() => navigate(-1)} className="px-6 py-2.5 bg-[var(--color-primary)] text-white rounded-xl font-medium text-sm">
          {t('common.back')}
        </button>
      </div>
    )
  }

  if (!poi) return <div className="flex items-center justify-center min-h-dvh"><p>{t('common.loading')}</p></div>

  return (
    <div className="min-h-dvh bg-[var(--color-bg)] pb-24">
      <SEO
        title={`Меню — ${poi.name[lang]}`}
        description={`Меню ресторана ${poi.name[lang]} во Владикавказе`}
        url={`/poi/${poi.id}/menu`}
      />
      <div className="sticky top-0 z-40 bg-white border-b border-[var(--color-border)]">
        <div className="flex items-center gap-3 px-4 h-14">
          <button onClick={() => navigate(-1)} className="w-10 h-10 flex items-center justify-center -ml-2">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" /></svg>
          </button>
          <div className="flex-1 min-w-0">
            <h1 className="text-lg font-bold truncate">{poi.name[lang]}</h1>
            <p className="text-sm text-[var(--color-text-secondary)]">{t('ordering.menu')}</p>
          </div>
        </div>

        {/* Search bar (only for large menus) */}
        {showSearch && (
          <div className="px-4 pb-2">
            <div className="relative">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={lang === 'ru' ? 'Поиск по меню...' : 'Search menu...'}
                className="w-full h-10 pl-9 pr-9 rounded-lg bg-gray-100 text-sm border-none outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2 top-1/2 -translate-y-1/2 w-6 h-6 flex items-center justify-center text-gray-400"
                  aria-label="Clear search"
                >
                  <X size={16} />
                </button>
              )}
            </div>
          </div>
        )}

        <div className="flex gap-2 px-4 pb-2 overflow-x-auto no-scrollbar">
          <button onClick={() => setActiveCategory(null)} className={`flex-shrink-0 px-4 py-2.5 min-h-[44px] rounded-full text-xs font-medium border ${!activeCategory ? 'bg-[var(--color-primary)] text-white border-[var(--color-primary)]' : 'bg-white border-gray-200'}`}>{t('food.all')}</button>
          {categories.map((cat) => (
            <button key={cat} onClick={() => setActiveCategory(activeCategory === cat ? null : cat)} className={`flex-shrink-0 px-4 py-2.5 min-h-[44px] rounded-full text-xs font-medium border ${activeCategory === cat ? 'bg-[var(--color-primary)] text-white border-[var(--color-primary)]' : 'bg-white border-gray-200'}`}>{cat}</button>
          ))}
        </div>
      </div>

      <div className="px-4 py-3 space-y-3">
        {filtered.length === 0 && debouncedQuery.trim() && (
          <div className="text-center py-12 text-sm text-[var(--color-text-secondary)]">
            {lang === 'ru' ? 'Ничего не найдено' : 'No items found'}
          </div>
        )}

        {filtered.map((item) => {
          const qty = getItemQuantity(item.id)

          return (
            <div
              key={item.id}
              className="flex gap-3 bg-white rounded-xl p-3 border border-[var(--color-border)] cursor-pointer active:bg-gray-50 transition-colors"
              onClick={() => setSelectedDish(item)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setSelectedDish(item) } }}
            >
              {item.photo && (
                <div className="w-24 h-24 rounded-lg bg-gray-100 flex-shrink-0 overflow-hidden">
                  <img src={item.photo} alt={item.name[lang]} className="w-full h-full object-cover" onError={(e) => { (e.target as HTMLImageElement).src = `https://placehold.co/160x160/e2e8f0/64748b?text=${encodeURIComponent(item.name.ru.slice(0, 6))}` }} />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="font-medium text-sm">{item.name[lang]}</h3>
                    {item.isPopular && <span className="text-xs text-orange-600 font-medium inline-flex items-center gap-0.5"><Flame size={12} /> {t('search.popular')}</span>}
                  </div>
                </div>
                <p className="text-xs text-[var(--color-text-secondary)] mt-0.5 line-clamp-2">{item.description[lang]}</p>
                <div className="flex items-center justify-between mt-2">
                  <span className="font-bold text-sm">{formatPrice(item.price)}</span>
                  <InlineCounter
                    quantity={qty}
                    onAdd={() => handleAdd(item.id, item.price)}
                    onIncrement={() => addItem(poiId!, item.id, item.price)}
                    onDecrement={() => updateQuantity(item.id, qty - 1)}
                    label={t('ordering.addToCart')}
                  />
                </div>
                {item.tags.length > 0 && (
                  <div className="flex gap-1 mt-1">
                    {item.tags.map((tag) => <span key={tag} className="text-[11px] px-1.5 py-0.5 bg-gray-100 rounded text-gray-600">{tag}</span>)}
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {/* Cart bar */}
      {cartCount > 0 && (
        <div className="fixed bottom-[calc(var(--bottom-nav-height)+var(--safe-area-bottom))] left-0 right-0 z-30 px-4 py-3">
          <button onClick={() => navigate('/cart')} className="w-full max-w-lg mx-auto flex items-center justify-between bg-[var(--color-primary)] text-white rounded-xl px-4 py-3.5 shadow-lg">
            <span className="bg-white/20 px-2.5 py-0.5 rounded-full text-sm font-bold">{cartCount}</span>
            <span className="font-semibold text-sm">{t('ordering.cart')}</span>
            <span className="font-bold">{formatPrice(cartTotal)}</span>
          </button>
        </div>
      )}

      {/* Dish detail modal */}
      {selectedDish && (
        <DishDetailModal
          item={selectedDish}
          lang={lang}
          quantity={getItemQuantity(selectedDish.id)}
          onAdd={() => handleAdd(selectedDish.id, selectedDish.price)}
          onIncrement={() => addItem(poiId!, selectedDish.id, selectedDish.price)}
          onDecrement={() => updateQuantity(selectedDish.id, getItemQuantity(selectedDish.id) - 1)}
          onClose={() => setSelectedDish(null)}
          addLabel={t('ordering.addToCart')}
        />
      )}
    </div>
  )
}
