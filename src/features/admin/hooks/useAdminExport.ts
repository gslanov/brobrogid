import { useCallback, useState } from 'react'
import { adminGetAll, adminCount } from '../lib/admin-db'

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

const STORE_FILE_MAP: Record<StoreName, string> = {
  pois: 'pois.json',
  tours: 'tours.json',
  guides: 'guides.json',
  reviews: 'reviews.json',
  menuItems: 'menu-items.json',
  emergency: 'emergency.json',
  transport: 'transport.json',
  collections: 'collections.json',
  orders: 'orders.json',
}

const EXPORTABLE_STORES: StoreName[] = [
  'pois',
  'tours',
  'guides',
  'reviews',
  'menuItems',
  'emergency',
  'transport',
]

export interface StoreInfo {
  name: StoreName
  fileName: string
  count: number
}

function downloadJson(data: unknown, fileName: string): void {
  const json = JSON.stringify(data, null, 2)
  const blob = new Blob([json], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = fileName
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

interface UseAdminExportResult {
  stores: StoreInfo[]
  isLoading: boolean
  exportStore: (name: StoreName) => Promise<void>
  exportAll: () => Promise<void>
  refreshCounts: () => Promise<void>
}

export function useAdminExport(): UseAdminExportResult {
  const [stores, setStores] = useState<StoreInfo[]>([])
  const [isLoading, setIsLoading] = useState(false)

  const refreshCounts = useCallback(async () => {
    const infos = await Promise.all(
      EXPORTABLE_STORES.map(async (name) => ({
        name,
        fileName: STORE_FILE_MAP[name],
        count: await adminCount(name),
      })),
    )
    setStores(infos)
  }, [])

  // Load counts on first call
  const ensureLoaded = useCallback(async () => {
    if (stores.length === 0) await refreshCounts()
  }, [stores.length, refreshCounts])

  const exportStore = useCallback(
    async (name: StoreName) => {
      setIsLoading(true)
      try {
        await ensureLoaded()
        const data = await adminGetAll(name)
        downloadJson(data, STORE_FILE_MAP[name])
      } finally {
        setIsLoading(false)
      }
    },
    [ensureLoaded],
  )

  const exportAll = useCallback(async () => {
    setIsLoading(true)
    try {
      await ensureLoaded()
      for (const name of EXPORTABLE_STORES) {
        const data = await adminGetAll(name)
        downloadJson(data, STORE_FILE_MAP[name])
        // small delay to avoid browser blocking multiple downloads
        await new Promise((r) => setTimeout(r, 150))
      }
    } finally {
      setIsLoading(false)
    }
  }, [ensureLoaded])

  return { stores, isLoading, exportStore, exportAll, refreshCounts }
}
