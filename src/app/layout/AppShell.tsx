import type { ReactNode } from 'react'
import { BottomTabs } from './BottomTabs'

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="flex flex-col min-h-dvh max-w-lg mx-auto w-full bg-white relative">
      <main className="flex-1 pb-[calc(var(--bottom-nav-height)+var(--safe-area-bottom))] overflow-y-auto">
        {children}
      </main>
      <BottomTabs />
    </div>
  )
}
