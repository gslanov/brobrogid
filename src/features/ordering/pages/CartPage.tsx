import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useOrderStore } from '@/data/stores/order-store'
import { useDataStore } from '@/data/stores/data-store'
import { PageHeader } from '@/shared/ui/PageHeader'
import { EmptyState } from '@/shared/ui/EmptyState'
import { formatPrice } from '@/shared/lib/utils'
import { useState, useEffect } from 'react'
import { getDB } from '@/data/db'
import type { MenuItem } from '@/data/types'

export default function CartPage() {
  const navigate = useNavigate()
  const { i18n, t } = useTranslation()
  const lang = i18n.language as 'ru' | 'en'
  const { currentOrder, updateQuantity, clearCart, setComment } = useOrderStore()
  const pois = useDataStore((s) => s.pois)
  const poi = pois.find((p) => p.id === currentOrder?.poiId)
  const [menuItems, setMenuItems] = useState<MenuItem[]>([])

  useEffect(() => {
    if (!currentOrder?.poiId) return
    getDB().then(db => db.getAllFromIndex('menuItems', 'by-poi', currentOrder.poiId)).then(setMenuItems)
  }, [currentOrder?.poiId])

  if (!currentOrder || currentOrder.items.length === 0) {
    return (
      <div className="min-h-dvh bg-[var(--color-bg)]">
        <PageHeader title={t('ordering.cart')} showBack />
        <EmptyState icon="cart" title={t('ordering.empty')} action={{ label: 'К меню', onClick: () => navigate(-1) }} />
      </div>
    )
  }

  return (
    <div className="min-h-dvh bg-[var(--color-bg)] pb-40">
      <PageHeader title={t('ordering.cart')} showBack />
      {poi && <p className="px-4 text-sm text-[var(--color-text-secondary)] py-2">{poi.name[lang]}</p>}

      <div className="px-4 space-y-2 mt-2">
        {currentOrder.items.map((item) => {
          const menuItem = menuItems.find((m) => m.id === item.menuItemId)
          if (!menuItem) return null
          return (
            <div key={item.menuItemId} className="flex items-center gap-3 bg-white rounded-xl p-3 border border-[var(--color-border)]">
              <div className="flex-1 min-w-0">
                <h3 className="font-medium text-sm">{menuItem.name[lang]}</h3>
                <p className="text-xs text-[var(--color-text-secondary)]">{formatPrice(item.price)}</p>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => updateQuantity(item.menuItemId, item.quantity - 1)} className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center font-bold text-lg">&minus;</button>
                <span className="w-6 text-center font-medium text-sm">{item.quantity}</span>
                <button onClick={() => updateQuantity(item.menuItemId, item.quantity + 1)} className="w-8 h-8 rounded-full bg-[var(--color-primary)] text-white flex items-center justify-center font-bold text-lg">+</button>
              </div>
              <span className="font-bold text-sm w-16 text-right">{formatPrice(item.price * item.quantity)}</span>
            </div>
          )
        })}
      </div>

      <div className="px-4 mt-4">
        <textarea
          value={currentOrder.comment || ''}
          onChange={(e) => setComment(e.target.value)}
          placeholder={t('ordering.comment')}
          rows={2}
          className="w-full bg-white border border-[var(--color-border)] rounded-xl px-3 py-2.5 text-sm resize-none"
        />
      </div>

      <div className="fixed bottom-[calc(var(--bottom-nav-height)+var(--safe-area-bottom))] left-0 right-0 z-30 px-4 py-3 bg-white/95 backdrop-blur-sm border-t border-[var(--color-border)]">
        <div className="max-w-lg mx-auto">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm">{t('ordering.total')}</span>
            <span className="text-xl font-bold">{formatPrice(currentOrder.total)}</span>
          </div>
          <button className="w-full py-3.5 bg-[var(--color-primary)] text-white rounded-xl font-semibold text-sm">
            {t('ordering.payViaSBP')}
          </button>
          <button onClick={clearCart} className="w-full py-2 text-sm text-red-500 mt-2">Очистить корзину</button>
        </div>
      </div>
    </div>
  )
}
