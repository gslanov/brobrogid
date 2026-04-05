import { motion } from 'framer-motion'
import { useDataStore } from '@/data/stores/data-store'

interface FavoriteButtonProps {
  poiId: string
  size?: 'sm' | 'md'
}

export function FavoriteButton({ poiId, size = 'md' }: FavoriteButtonProps) {
  const collections = useDataStore((s) => s.collections)
  const toggleFavorite = useDataStore((s) => s.toggleFavorite)

  const isFav = collections.find((c) => c.id === 'favorites')?.poiIds.includes(poiId) ?? false
  const sizeClass = size === 'sm' ? 'w-8 h-8' : 'w-10 h-10'

  return (
    <motion.button
      whileTap={{ scale: 0.8 }}
      onClick={(e) => { e.stopPropagation(); e.preventDefault(); toggleFavorite(poiId) }}
      className={`${sizeClass} rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center shadow-sm`}
    >
      <svg
        className={`${size === 'sm' ? 'w-4 h-4' : 'w-5 h-5'} transition-colors`}
        fill={isFav ? '#ef4444' : 'none'}
        stroke={isFav ? '#ef4444' : '#64748b'}
        viewBox="0 0 24 24"
        strokeWidth={2}
      >
        <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
      </svg>
    </motion.button>
  )
}
