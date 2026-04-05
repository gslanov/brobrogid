import { useRef, useEffect, useState, type ReactNode } from 'react'
import { motion, useMotionValue, useTransform, animate, type PanInfo } from 'framer-motion'

export type SheetState = 'closed' | 'peek' | 'half' | 'full'

interface BottomSheetProps {
  children: ReactNode
  isOpen: boolean
  state: SheetState
  onStateChange: (state: SheetState) => void
  peek?: number
}

export function BottomSheet({
  children,
  isOpen,
  state,
  onStateChange,
  peek = 120,
}: BottomSheetProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const y = useMotionValue(0)

  // Compute snap points in component body, not default params
  const [snapHeights, setSnapHeights] = useState({ half: 400, full: 720 })
  useEffect(() => {
    setSnapHeights({
      half: window.innerHeight * 0.5,
      full: window.innerHeight - 80,
    })
  }, [])

  const half = snapHeights.half
  const full = snapHeights.full

  const getHeightForState = (s: SheetState) => {
    switch (s) {
      case 'peek': return peek
      case 'half': return half
      case 'full': return full
      default: return 0
    }
  }

  const currentHeight = getHeightForState(state)

  // Cancel previous animation on unmount or state change
  useEffect(() => {
    const target = isOpen ? currentHeight : 0
    const controls = animate(y, target, { type: 'spring', damping: 25, stiffness: 300 })
    return () => controls.stop()
  }, [isOpen, currentHeight, y])

  const sheetHeight = useTransform(y, (v) => Math.max(0, v))

  const handleDragEnd = (_: unknown, info: PanInfo) => {
    const velocity = info.velocity.y
    const current = y.get()

    // Fast swipe detection
    if (Math.abs(velocity) > 500) {
      if (velocity < 0) {
        if (state === 'peek') onStateChange('half')
        else if (state === 'half') onStateChange('full')
      } else {
        if (state === 'full') onStateChange('half')
        else if (state === 'half') onStateChange('peek')
        else onStateChange('closed')
      }
      return
    }

    // Snap to nearest
    const snapPoints = [0, peek, half, full]
    const states: SheetState[] = ['closed', 'peek', 'half', 'full']
    let closestIdx = 0
    let closestDist = Infinity
    snapPoints.forEach((sp, i) => {
      const dist = Math.abs(current - sp)
      if (dist < closestDist) {
        closestDist = dist
        closestIdx = i
      }
    })
    onStateChange(states[closestIdx])
  }

  if (!isOpen && state === 'closed') return null

  return (
    <motion.div
      ref={containerRef}
      style={{ height: sheetHeight }}
      drag="y"
      dragConstraints={{ top: 0, bottom: 0 }}
      dragElastic={0.1}
      onDrag={(_, info) => {
        const newH = currentHeight - info.delta.y
        y.set(Math.max(0, Math.min(full, newH)))
      }}
      onDragEnd={handleDragEnd}
      className="fixed bottom-0 left-0 right-0 z-30 bg-white rounded-t-2xl shadow-lg max-w-lg mx-auto overflow-hidden touch-none"
    >
      <div className="flex justify-center py-2 cursor-grab active:cursor-grabbing">
        <div className="w-8 h-1 bg-gray-300 rounded-full" />
      </div>
      <div className="overflow-y-auto" style={{ maxHeight: `calc(100% - 20px)` }}>
        {children}
      </div>
    </motion.div>
  )
}
