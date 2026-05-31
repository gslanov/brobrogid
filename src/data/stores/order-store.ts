import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Order, OrderItem } from '../types'

interface OrderState {
  currentOrder: Order | null
  addItem: (poiId: string, menuItemId: string, price: number) => void
  isDifferentRestaurant: (poiId: string) => boolean
  removeItem: (menuItemId: string) => void
  updateQuantity: (menuItemId: string, quantity: number) => void
  clearCart: () => void
  setComment: (comment: string) => void
}

function createEmptyOrder(poiId: string): Order {
  return {
    id: crypto.randomUUID(),
    poiId,
    items: [],
    total: 0,
    status: 'cart',
    paymentMethod: 'sbp',
    createdAt: new Date().toISOString(),
  }
}

function calcTotal(items: OrderItem[]): number {
  return items.reduce((sum, item) => sum + item.price * item.quantity, 0)
}

export const useOrderStore = create<OrderState>()(
  persist(
    (set, get) => ({
      currentOrder: null,

      isDifferentRestaurant: (poiId) => {
        const { currentOrder } = get()
        return !!(currentOrder && currentOrder.items.length > 0 && currentOrder.poiId !== poiId)
      },

      addItem: (poiId, menuItemId, price) => {
        const { currentOrder } = get()
        const order = currentOrder?.poiId === poiId ? { ...currentOrder } : createEmptyOrder(poiId)

        const existing = order.items.find((i) => i.menuItemId === menuItemId)
        if (existing) {
          order.items = order.items.map((i) =>
            i.menuItemId === menuItemId ? { ...i, quantity: i.quantity + 1 } : i,
          )
        } else {
          order.items = [...order.items, { menuItemId, quantity: 1, price }]
        }

        order.total = calcTotal(order.items)
        set({ currentOrder: order })
      },

      removeItem: (menuItemId) => {
        const { currentOrder } = get()
        if (!currentOrder) return

        const items = currentOrder.items.filter((i) => i.menuItemId !== menuItemId)
        set({ currentOrder: { ...currentOrder, items, total: calcTotal(items) } })
      },

      updateQuantity: (menuItemId, quantity) => {
        const { currentOrder } = get()
        if (!currentOrder) return

        if (quantity <= 0) {
          get().removeItem(menuItemId)
          return
        }

        const items = currentOrder.items.map((i) =>
          i.menuItemId === menuItemId ? { ...i, quantity } : i,
        )
        set({ currentOrder: { ...currentOrder, items, total: calcTotal(items) } })
      },

      clearCart: () => set({ currentOrder: null }),

      setComment: (comment) => {
        const { currentOrder } = get()
        if (currentOrder) set({ currentOrder: { ...currentOrder, comment } })
      },
    }),
    {
      name: 'brobrogid-cart',
    }
  )
)
