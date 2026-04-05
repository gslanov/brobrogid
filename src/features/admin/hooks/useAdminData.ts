import { useState, useEffect, useCallback } from 'react'
import {
  adminGetAll,
  adminGetById,
  adminPut,
  adminRemove,
  adminCount,
} from '../lib/admin-db'

type StoreName =
  | 'pois'
  | 'menuItems'
  | 'tours'
  | 'guides'
  | 'reviews'
  | 'emergency'
  | 'transport'
  | 'collections'
  | 'orders'

interface UseAdminDataResult<T> {
  items: T[]
  isLoading: boolean
  count: number
  getById: (id: string) => Promise<T | undefined>
  create: (item: T) => Promise<void>
  update: (item: T) => Promise<void>
  remove: (id: string) => Promise<void>
  reload: () => Promise<void>
}

export function useAdminData<T extends { id: string }>(
  storeName: StoreName,
): UseAdminDataResult<T> {
  const [items, setItems] = useState<T[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [count, setCount] = useState(0)

  const load = useCallback(async () => {
    setIsLoading(true)
    try {
      const [all, total] = await Promise.all([
        adminGetAll<T>(storeName),
        adminCount(storeName),
      ])
      setItems(all)
      setCount(total)
    } finally {
      setIsLoading(false)
    }
  }, [storeName])

  useEffect(() => {
    load()
  }, [load])

  const getById = useCallback(
    (id: string) => adminGetById<T>(storeName, id),
    [storeName],
  )

  const create = useCallback(
    async (item: T) => {
      try {
        await adminPut<T>(storeName, item)
        setItems((prev) => {
          const exists = prev.some((i) => i.id === item.id)
          if (exists) return prev.map((i) => (i.id === item.id ? item : i))
          return [...prev, item]
        })
        setCount((c) => c + 1)
      } catch (err) {
        console.error(`Failed to create in ${storeName}:`, err)
        await load()
        throw err
      }
    },
    [storeName, load],
  )

  const update = useCallback(
    async (item: T) => {
      try {
        await adminPut<T>(storeName, item)
        setItems((prev) => prev.map((i) => (i.id === item.id ? item : i)))
      } catch (err) {
        console.error(`Failed to update in ${storeName}:`, err)
        await load()
        throw err
      }
    },
    [storeName, load],
  )

  const remove = useCallback(
    async (id: string) => {
      try {
        await adminRemove(storeName, id)
        setItems((prev) => prev.filter((i) => i.id !== id))
        setCount((c) => Math.max(0, c - 1))
      } catch (err) {
        console.error(`Failed to remove from ${storeName}:`, err)
        await load()
        throw err
      }
    },
    [storeName, load],
  )

  return { items, isLoading, count, getById, create, update, remove, reload: load }
}
