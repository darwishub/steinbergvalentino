'use client'

import { useMemo, useState } from 'react'
import NextImage, { type ImageProps } from 'next/image'

type SafeImageProps = ImageProps & {
  fallbackSrc?: string
}

const DEFAULT_FALLBACK = '/fallbacks/office-tower.webp'

function normalizeSrc(src: ImageProps['src']): string {
  if (typeof src === 'string') return src
  if ('src' in src) return src.src
  return ''
}

function pickFallbackFromAlt(alt: string, explicitFallback?: string): string {
  if (explicitFallback) return explicitFallback

  const text = alt.toLowerCase()

  if (text.includes('contact') || text.includes('team') || text.includes('about')) {
    return '/fallbacks/teamwork.webp'
  }

  if (
    text.includes('exchange') ||
    text.includes('market') ||
    text.includes('nasdaq') ||
    text.includes('tsx') ||
    text.includes('cse') ||
    text.includes('frankfurt')
  ) {
    return '/fallbacks/market-data.webp'
  }

  if (
    text.includes('capabilities') ||
    text.includes('services') ||
    text.includes('industry') ||
    text.includes('investor')
  ) {
    return '/fallbacks/hero-market.webp'
  }

  return DEFAULT_FALLBACK
}

function shouldBypassOptimizer(src: string): boolean {
  return src.startsWith('http://127.0.0.1:1337')
}

export function SafeImage({ src, alt, fallbackSrc, onError, ...props }: SafeImageProps) {
  const normalizedSrc = normalizeSrc(src)
  const resolvedFallback = useMemo(
    () => pickFallbackFromAlt(alt || '', fallbackSrc),
    [alt, fallbackSrc]
  )
  const [failedSrc, setFailedSrc] = useState<string | null>(null)
  const currentSrc = failedSrc === normalizedSrc ? resolvedFallback : normalizedSrc

  return (
    <NextImage
      {...props}
      alt={alt}
      src={currentSrc}
      quality={props.quality ?? 80}
      unoptimized={shouldBypassOptimizer(currentSrc)}
      onError={(event) => {
        onError?.(event)

        if (currentSrc !== resolvedFallback) {
          setFailedSrc(normalizedSrc)
        }
      }}
    />
  )
}
