'use client'

import { useEffect, useRef } from 'react'

interface HeroVideoProps {
  src: string
  poster: string
}

/**
 * Lazy-loaded promo-feature background video.
 *
 * Strategy:
 *  1. Render <video> with preload="none" and NO src — zero bytes on paint.
 *     The poster attribute is immediately visible (opacity is not 0).
 *  2. IntersectionObserver fires when the element enters the viewport.
 *  3. Set src → load() → play(). The poster transitions naturally to video.
 */
export function HeroVideo({ src, poster }: HeroVideoProps) {
  const videoRef = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return
        video.src = src
        video.load()
        video.play().catch(() => {
          /* autoplay blocked — poster remains visible, that's fine */
        })
        observer.disconnect()
      },
      { threshold: 0.01 }
    )

    observer.observe(video)
    return () => observer.disconnect()
  }, [src])

  return (
    <video
      ref={videoRef}
      muted
      loop
      playsInline
      poster={poster}
      preload="none"
      aria-hidden="true"
      style={{
        position: 'absolute',
        inset: 0,
        width: '100%',
        height: '100%',
        objectFit: 'cover',
        objectPosition: 'center 30%',
        /* No opacity:0 here — poster must be visible immediately */
      }}
    />
  )
}
