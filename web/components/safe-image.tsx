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

/* Bypass Next.js optimizer only for local dev Strapi (http, no CDN).
   On Railway/production the Strapi URL is https — optimizer works fine.
   Normalize localhost ↔ 127.0.0.1 — strapi.ts replaces localhost→127.0.0.1
   in fetched URLs, so the src may differ from NEXT_PUBLIC_STRAPI_URL. */
const STRAPI_ORIGIN = process.env.NEXT_PUBLIC_STRAPI_URL ?? 'http://127.0.0.1:1337'
function shouldBypassOptimizer(src: string): boolean {
  if (!STRAPI_ORIGIN.startsWith('http://')) return false
  const normOrigin = STRAPI_ORIGIN.replace('localhost', '127.0.0.1')
  const normSrc    = src.replace('localhost', '127.0.0.1')
  return normSrc.startsWith(normOrigin)
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
