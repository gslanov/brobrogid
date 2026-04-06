import { useState, useCallback } from 'react'
import { cn } from '@/shared/lib/utils'
import { Skeleton } from './Skeleton'

interface ImageWithFallbackProps {
  src: string | undefined
  alt: string
  fallbackText?: string
  aspectRatio?: string
  className?: string
  imgClassName?: string
}

export function ImageWithFallback({
  src,
  alt,
  fallbackText,
  aspectRatio,
  className,
  imgClassName,
}: ImageWithFallbackProps) {
  const [state, setState] = useState<'loading' | 'loaded' | 'error'>('loading')

  const onLoad = useCallback(() => setState('loaded'), [])
  const onError = useCallback(() => setState('error'), [])

  const showFallback = state === 'error' || !src

  return (
    <div className={cn('relative overflow-hidden bg-gray-100', className)} style={aspectRatio ? { aspectRatio } : undefined}>
      {state === 'loading' && !showFallback && (
        <Skeleton variant="rect" width="100%" height="100%" className="absolute inset-0 !rounded-none" />
      )}

      {showFallback ? (
        <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-gray-200 to-gray-300 p-3">
          <span className="text-sm font-medium text-gray-600 text-center line-clamp-2">
            {fallbackText || alt}
          </span>
        </div>
      ) : (
        (() => {
          const webpSrc = src?.replace(/\.(jpg|jpeg|png)$/i, '.webp')
          return (
            <picture>
              {webpSrc && webpSrc !== src && (
                <source srcSet={webpSrc} type="image/webp" />
              )}
              <img
                src={src}
                alt={alt}
                onLoad={onLoad}
                onError={onError}
                loading="lazy"
                className={cn(
                  'w-full h-full object-cover transition-opacity',
                  state === 'loaded' ? 'opacity-100 duration-200' : 'opacity-0',
                  imgClassName,
                )}
              />
            </picture>
          )
        })()
      )}
    </div>
  )
}
