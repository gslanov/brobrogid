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
    <div
      className={cn('relative overflow-hidden', className)}
      style={{ background: 'var(--surface-2)', ...(aspectRatio ? { aspectRatio } : {}) }}
    >
      {state === 'loading' && !showFallback && (
        <Skeleton variant="rect" width="100%" height="100%" className="absolute inset-0 !rounded-none" />
      )}

      {showFallback ? (
        <div
          className="absolute inset-0 flex items-center justify-center p-3"
          style={{ background: 'linear-gradient(150deg, var(--surface-2), var(--surface-1))' }}
        >
          <span className="text-[13px] font-medium text-center line-clamp-2" style={{ color: 'var(--text-3)' }}>
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
                loading="eager"
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
