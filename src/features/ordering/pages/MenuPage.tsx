import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useDataStore } from '@/data/stores/data-store'
import { useOrderStore } from '@/data/stores/order-store'
import { getDB } from '@/data/db'
import { formatPrice } from '@/shared/lib/utils'
import type { MenuItem } from '@/data/types'

export default function MenuPage() {
  const { poiId } = useParams<{ poiId: string }>()
  const navigate = useNavigate()
  const { i18n, t } = useTranslation()
  const lang = i18n.language as 'ru' | 'en'
  const pois = useDataStore((s) => s.pois)
  const poi = pois.find((p) => p.id === poiId)
  const { currentOrder, addItem } = useOrderStore()
  const [items, setItems] = useState<MenuItem[]>([])
  const [activeCategory, setActiveCategory] = useState<string | null>(null)

  useEffect(() => {
    if (!poiId) return
    getDB().then(db => db.getAllFromIndex('menuItems', 'by-poi', poiId)).then(setItems)
  }, [poiId])

  const categories = [...new Set(items.map((i) => i.category))]
  const filtered = activeCategory ? items.filter((i) => i.category === activeCategory) : items
  const cartCount = (currentOrder && currentOrder.poiId === poiId) ? currentOrder.items.reduce((s, i) => s + i.quantity, 0) : 0
  const cartTotal = (currentOrder && currentOrder.poiId === poiId) ? currentOrder.total : 0

  if (!poi) return <div className="flex items-center justify-center min-h-dvh"><p>Загрузка...</p></div>

  return (
    <div className="min-h-dvh bg-[var(--color-bg)] pb-24">
      <div className="sticky top-0 z-40 bg-white border-b border-[var(--color-border)]">
        <div className="flex items-center gap-3 px-4 h-14">
          <button onClick={() => navigate(-1)} className="w-10 h-10 flex items-center justify-center -ml-2">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" /></svg>
          </button>
          <div className="flex-1 min-w-0">
            <h1 className="text-sm font-bold truncate">{poi.name[lang]}</h1>
            <p className="text-[11px] text-[var(--color-text-secondary)]">{t('ordering.menu')}</p>
          </div>
        </div>
        <div className="flex gap-2 px-4 pb-2 overflow-x-auto no-scrollbar">
          <button onClick={() => setActiveCategory(null)} className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium border ${!activeCategory ? 'bg-[var(--color-primary)] text-white border-[var(--color-primary)]' : 'bg-white border-gray-200'}`}>Все</button>
          {categories.map((cat) => (
            <button key={cat} onClick={() => setActiveCategory(activeCategory === cat ? null : cat)} className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium border ${activeCategory === cat ? 'bg-[var(--color-primary)] text-white border-[var(--color-primary)]' : 'bg-white border-gray-200'}`}>{cat}</button>
          ))}
        </div>
      </div>

      <div className="px-4 py-3 space-y-3">
        {filtered.map((item) => (
          <div key={item.id} className="flex gap-3 bg-white rounded-xl p-3 border border-[var(--color-border)]">
            {item.photo && (
              <div className="w-20 h-20 rounded-lg bg-gray-100 flex-shrink-0 overflow-hidden">
                <img src={item.photo} alt={item.name[lang]} className="w-full h-full object-cover" onError={(e) => { (e.target as HTMLImageElement).src = `https://placehold.co/160x160/e2e8f0/64748b?text=${encodeURIComponent(item.name.ru.slice(0, 6))}` }} />
              </div>
            )}
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h3 className="font-medium text-sm">{item.name[lang]}</h3>
                  {item.isPopular && <span className="text-[10px] text-orange-600 font-medium">fire Популярное</span>}
                </div>
              </div>
              <p className="text-xs text-[var(--color-text-secondary)] mt-0.5 line-clamp-2">{item.description[lang]}</p>
              <div className="flex items-center justify-between mt-2">
                <span className="font-bold text-sm">{formatPrice(item.price)}</span>
                <button onClick={() => addItem(poiId!, item.id, item.price)} className="px-3 py-1.5 bg-[var(--color-primary)] text-white rounded-lg text-xs font-medium">
                  + {t('ordering.addToCart')}
                </button>
              </div>
              {item.tags.length > 0 && (
                <div className="flex gap-1 mt-1">
                  {item.tags.map((tag) => <span key={tag} className="text-[10px] px-1.5 py-0.5 bg-gray-100 rounded text-gray-600">{tag}</span>)}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {cartCount > 0 && (
        <div className="fixed bottom-[calc(var(--bottom-nav-height)+var(--safe-area-bottom))] left-0 right-0 z-30 px-4 py-3">
          <button onClick={() => navigate('/cart')} className="w-full max-w-lg mx-auto flex items-center justify-between bg-[var(--color-primary)] text-white rounded-xl px-4 py-3.5 shadow-lg">
            <span className="bg-white/20 px-2.5 py-0.5 rounded-full text-sm font-bold">{cartCount}</span>
            <span className="font-semibold text-sm">{t('ordering.cart')}</span>
            <span className="font-bold">{formatPrice(cartTotal)}</span>
          </button>
        </div>
      )}
    </div>
  )
}
