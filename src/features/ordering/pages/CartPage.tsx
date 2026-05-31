import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useOrderStore } from '@/data/stores/order-store'
import { useDataStore } from '@/data/stores/data-store'
import { PageHeader } from '@/shared/ui/PageHeader'
import { EmptyState } from '@/shared/ui/EmptyState'
import { formatPrice } from '@/shared/lib/utils'
import { ShoppingCart, X } from 'lucide-react'
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
  const [showOrderForm, setShowOrderForm] = useState(false)
  const [orderName, setOrderName] = useState('')
  const [orderPhone, setOrderPhone] = useState('')
  const [deliveryMethod, setDeliveryMethod] = useState<'pickup' | 'delivery'>('pickup')
  const [orderAddress, setOrderAddress] = useState('')

  useEffect(() => {
    if (!currentOrder?.poiId) return
    getDB().then(db => db.getAllFromIndex('menuItems', 'by-poi', currentOrder.poiId)).then(setMenuItems)
  }, [currentOrder?.poiId])

  if (!currentOrder || currentOrder.items.length === 0) {
    return (
      <div className="min-h-dvh bg-[var(--color-bg)]">
        <PageHeader title={t('ordering.cart')} showBack />
        <EmptyState icon={<ShoppingCart size={48} />} title={t('ordering.empty')} action={{ label: t('ordering.toMenu'), onClick: () => navigate(-1) }} />
      </div>
    )
  }

  const handleSubmitOrder = () => {
    if (!orderName.trim() || !orderPhone.trim()) return
    if (deliveryMethod === 'delivery' && !orderAddress.trim()) return

    const restaurantName = poi?.name[lang] || ''
    const itemLines = currentOrder.items.map((item) => {
      const menuItem = menuItems.find((m) => m.id === item.menuItemId)
      const name = menuItem ? menuItem.name[lang] : item.menuItemId
      return `${name} x${item.quantity} — ${formatPrice(item.price * item.quantity)}`
    }).join('\n')

    const methodLabel = deliveryMethod === 'pickup'
      ? (lang === 'ru' ? 'Самовывоз' : 'Pickup')
      : (lang === 'ru' ? 'Доставка' : 'Delivery')

    let message = `${lang === 'ru' ? 'Заказ из' : 'Order from'} ${restaurantName}:\n${itemLines}\n${t('ordering.total')}: ${formatPrice(currentOrder.total)}\n${t('ordering.orderName')}: ${orderName}\n${t('ordering.orderPhone')}: ${orderPhone}\n${t('ordering.deliveryMethod')}: ${methodLabel}`

    if (deliveryMethod === 'delivery') {
      message += `\n${t('ordering.address')}: ${orderAddress}`
    }

    if (currentOrder.comment) {
      message += `\n${t('ordering.comment')}: ${currentOrder.comment}`
    }

    window.open(`https://wa.me/?text=${encodeURIComponent(message)}`, '_blank')
    setShowOrderForm(false)
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
                <p className="text-sm text-[var(--color-text-secondary)]">{formatPrice(item.price)}</p>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => updateQuantity(item.menuItemId, item.quantity - 1)} className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center font-bold text-lg">&minus;</button>
                <span className="w-6 text-center font-medium text-sm">{item.quantity}</span>
                <button onClick={() => updateQuantity(item.menuItemId, item.quantity + 1)} className="w-10 h-10 rounded-full bg-[var(--color-primary)] text-white flex items-center justify-center font-bold text-lg">+</button>
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
          maxLength={500}
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
          <button
            onClick={() => setShowOrderForm(true)}
            className="w-full py-3.5 bg-[var(--color-primary)] text-white rounded-xl font-semibold text-base"
          >
            {t('ordering.submitOrder')}
          </button>
          <button onClick={() => {
            if (window.confirm(lang === 'ru' ? 'Очистить корзину? Все товары будут удалены' : 'Clear cart? All items will be removed')) {
              clearCart()
            }
          }} className="w-full py-2 text-sm text-red-500 mt-2">{t('ordering.clearCart')}</button>
        </div>
      </div>

      {/* Order form modal */}
      {showOrderForm && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40" onClick={() => setShowOrderForm(false)}>
          <div
            className="w-full max-w-lg bg-white rounded-t-2xl p-5 pb-8 animate-slide-up"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold">{t('ordering.submitOrder')}</h2>
              <button onClick={() => setShowOrderForm(false)} className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100">
                <X size={18} />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium text-[var(--color-text-secondary)] mb-1 block">{t('ordering.orderName')}</label>
                <input
                  type="text"
                  value={orderName}
                  onChange={(e) => setOrderName(e.target.value)}
                  className="w-full px-3 py-2.5 border border-[var(--color-border)] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/30 focus:border-[var(--color-primary)]"
                  placeholder={t('ordering.orderName')}
                />
              </div>

              <div>
                <label className="text-sm font-medium text-[var(--color-text-secondary)] mb-1 block">{t('ordering.orderPhone')}</label>
                <input
                  type="tel"
                  value={orderPhone}
                  onChange={(e) => setOrderPhone(e.target.value)}
                  className="w-full px-3 py-2.5 border border-[var(--color-border)] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/30 focus:border-[var(--color-primary)]"
                  placeholder="+7 (___) ___-__-__"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-[var(--color-text-secondary)] mb-1 block">{t('ordering.deliveryMethod')}</label>
                <div className="flex gap-2">
                  <button
                    onClick={() => setDeliveryMethod('pickup')}
                    className={`flex-1 py-2.5 rounded-xl text-sm font-medium border transition-colors ${deliveryMethod === 'pickup' ? 'bg-[var(--color-primary)] text-white border-[var(--color-primary)]' : 'bg-white text-[var(--color-text)] border-[var(--color-border)]'}`}
                  >
                    {t('ordering.pickup')}
                  </button>
                  <button
                    onClick={() => setDeliveryMethod('delivery')}
                    className={`flex-1 py-2.5 rounded-xl text-sm font-medium border transition-colors ${deliveryMethod === 'delivery' ? 'bg-[var(--color-primary)] text-white border-[var(--color-primary)]' : 'bg-white text-[var(--color-text)] border-[var(--color-border)]'}`}
                  >
                    {t('ordering.delivery')}
                  </button>
                </div>
              </div>

              {deliveryMethod === 'delivery' && (
                <div>
                  <label className="text-sm font-medium text-[var(--color-text-secondary)] mb-1 block">{t('ordering.address')}</label>
                  <input
                    type="text"
                    value={orderAddress}
                    onChange={(e) => setOrderAddress(e.target.value)}
                    className="w-full px-3 py-2.5 border border-[var(--color-border)] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/30 focus:border-[var(--color-primary)]"
                    placeholder={t('ordering.addressPlaceholder')}
                  />
                </div>
              )}

              {/* Order summary */}
              <div className="bg-gray-50 rounded-xl p-3 space-y-1.5">
                <p className="text-xs font-semibold text-[var(--color-text-secondary)] uppercase">{t('ordering.orderSummary')}</p>
                {currentOrder.items.map((item) => {
                  const menuItem = menuItems.find((m) => m.id === item.menuItemId)
                  if (!menuItem) return null
                  return (
                    <div key={item.menuItemId} className="flex justify-between text-sm">
                      <span>{menuItem.name[lang]} x{item.quantity}</span>
                      <span className="font-medium">{formatPrice(item.price * item.quantity)}</span>
                    </div>
                  )
                })}
                <div className="flex justify-between text-sm font-bold pt-1.5 border-t border-[var(--color-border)]">
                  <span>{t('ordering.total')}</span>
                  <span>{formatPrice(currentOrder.total)}</span>
                </div>
              </div>
            </div>

            <button
              onClick={handleSubmitOrder}
              disabled={!orderName.trim() || !orderPhone.trim() || (deliveryMethod === 'delivery' && !orderAddress.trim())}
              className={`w-full mt-5 py-3 rounded-xl font-semibold text-sm ${
                orderName.trim() && orderPhone.trim() && (deliveryMethod !== 'delivery' || orderAddress.trim())
                  ? 'bg-[var(--color-primary)] text-white'
                  : 'bg-gray-200 text-gray-500'
              }`}
            >
              {t('ordering.sendViaWhatsApp')}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
