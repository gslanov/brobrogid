import { formatRating } from '@/shared/lib/utils'

interface RatingProps {
  value: number
  count?: number
  size?: 'sm' | 'md' | 'lg'
}

export function Rating({ value, count, size = 'md' }: RatingProps) {
  const stars = Math.round(value)
  const textSize = size === 'sm' ? 'text-xs' : size === 'lg' ? 'text-base' : 'text-sm'

  return (
    <div className={`flex items-center gap-1 ${textSize}`}>
      <div className="flex">
        {[1, 2, 3, 4, 5].map((i) => (
          <span key={i} className={i <= stars ? 'text-yellow-500' : 'text-gray-300'}>★</span>
        ))}
      </div>
      <span className="font-semibold">{formatRating(value)}</span>
      {count !== undefined && <span className="text-[var(--color-text-secondary)]">({count})</span>}
    </div>
  )
}
