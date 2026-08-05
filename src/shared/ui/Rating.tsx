import { formatRating } from '@/shared/lib/utils'
import { Star } from 'lucide-react'

interface RatingProps {
  value: number
  count?: number
  size?: 'sm' | 'md' | 'lg'
}

const STAR_SIZE = { sm: 12, md: 14, lg: 16 } as const

export function Rating({ value, count, size = 'md' }: RatingProps) {
  const stars = Math.round(value)
  const textSize = size === 'sm' ? 'text-xs' : size === 'lg' ? 'text-base' : 'text-sm'
  const iconSize = STAR_SIZE[size]

  return (
    <div className={`flex items-center gap-1 ${textSize}`}>
      <div className="flex">
        {[1, 2, 3, 4, 5].map((i) => (
          <Star
            key={i}
            size={iconSize}
            style={{
              color: i <= stars ? 'var(--terra-hot)' : 'var(--surface-3)',
              fill: i <= stars ? 'var(--terra-hot)' : 'var(--surface-3)',
            }}
          />
        ))}
      </div>
      <span className="font-semibold">{formatRating(value)}</span>
      {count !== undefined && <span style={{ color: 'var(--text-3)' }}>({count})</span>}
    </div>
  )
}
