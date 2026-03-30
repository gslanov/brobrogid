import { useEffect, useState } from 'react'
import { useRoutes } from 'react-router-dom'
import { routes } from './router'
import { AppShell } from './layout/AppShell'
import { seedDatabase } from '@/shared/lib/seed'
import { useDataStore } from '@/data/stores/data-store'

export default function App() {
  const [ready, setReady] = useState(false)
  const loadAll = useDataStore((s) => s.loadAll)

  useEffect(() => {
    async function init() {
      await seedDatabase()
      await loadAll()
      setReady(true)
    }
    init()
  }, [loadAll])

  const routeElement = useRoutes(routes)

  if (!ready) {
    return (
      <div className="flex items-center justify-center min-h-dvh bg-[var(--color-bg)]">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[var(--color-primary)] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-[var(--color-primary)]">BROBROGID</h1>
          <p className="text-[var(--color-text-secondary)] mt-1">Загружаем гид по Владикавказу...</p>
        </div>
      </div>
    )
  }

  return <AppShell>{routeElement}</AppShell>
}
