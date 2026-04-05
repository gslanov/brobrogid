import { cn } from '@/shared/lib/utils'

interface SkeletonProps {
  variant?: 'text' | 'rect' | 'circle'
  width?: string | number
  height?: string | number
  size?: number
  className?: string
}

export function Skeleton({ variant = 'text', width, height, size, className }: SkeletonProps) {
  const style: React.CSSProperties = {}

  if (variant === 'circle') {
    const s = size || 48
    style.width = s
    style.height = s
    style.borderRadius = '50%'
  } else if (variant === 'rect') {
    style.width = width || '100%'
    style.height = height || 130
    style.borderRadius = 'var(--radius-sm)'
  } else {
    style.width = width || '80%'
    style.height = height || 16
    style.borderRadius = 'var(--radius-sm)'
  }

  return (
    <div
      className={cn('skeleton-shimmer', className)}
      style={style}
      aria-hidden="true"
    />
  )
}

export function POICardSkeleton({ variant = 'horizontal' }: { variant?: 'horizontal' | 'vertical' }) {
  if (variant === 'horizontal') {
    return (
      <div className="flex-shrink-0 w-[200px] bg-white rounded-2xl border border-[var(--color-border)] overflow-hidden">
        <Skeleton variant="rect" height={130} className="!rounded-none" />
        <div className="p-3 space-y-2">
          <Skeleton variant="text" width="75%" />
          <Skeleton variant="text" width="50%" height={12} />
        </div>
      </div>
    )
  }

  return (
    <div className="flex bg-white rounded-2xl border border-[var(--color-border)] overflow-hidden w-full">
      <Skeleton variant="rect" width={120} height={120} className="!rounded-none flex-shrink-0" />
      <div className="flex-1 p-3 space-y-2">
        <Skeleton variant="text" width="40%" height={12} />
        <Skeleton variant="text" width="80%" />
        <Skeleton variant="text" width="60%" height={12} />
      </div>
    </div>
  )
}
