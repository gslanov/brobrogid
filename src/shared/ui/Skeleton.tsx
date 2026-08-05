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
  const shell = {
    background: 'var(--surface-1)',
    border: '1px solid var(--color-border)',
  }

  if (variant === 'horizontal') {
    return (
      <div
        className="flex-shrink-0 w-[228px] rounded-[var(--radius-lg)] overflow-hidden"
        style={shell}
      >
        <Skeleton variant="rect" height={152} className="!rounded-none" />
        <div className="px-3 h-[38px] flex items-center">
          <Skeleton variant="text" width="55%" height={12} />
        </div>
      </div>
    )
  }

  return (
    <div className="flex rounded-[var(--radius-lg)] overflow-hidden w-full" style={shell}>
      <Skeleton variant="rect" width={118} height={118} className="!rounded-none flex-shrink-0" />
      <div className="flex-1 p-3 space-y-2">
        <Skeleton variant="text" width="40%" height={12} />
        <Skeleton variant="text" width="80%" />
        <Skeleton variant="text" width="60%" height={12} />
      </div>
    </div>
  )
}
