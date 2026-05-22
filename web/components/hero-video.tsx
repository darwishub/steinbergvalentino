'use client'

import { useEffect, useRef } from 'react'

interface HeroVideoProps {
  src: string
  poster: string
}

/**
 * Lazy-loaded hero background video.
 *
 * Performance rules (per NodeJS_Performance_Standards.pdf):
 *  - video must NEVER autoplay on page load (kills LCP + TBT)
 *  - video must be lazy-loaded (preload="none" until in-viewport)
 *
 * Strategy:
 *  1. Render a <video> with preload="none" — zero bytes fetched on load
 *  2. IntersectionObserver fires when hero enters viewport
 *  3. Set src → load() → play() at that point
 *  4. Fade in via opacity transition once canplay fires
 *  5. Poster image is always shown as instant fallback
 */
export function HeroVideo({ src, poster }: HeroVideoProps) {
  const videoRef = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return
        // Defer actual load until hero is visible
        video.src = src
        video.load()
        video.play().catch(() => {
          /* autoplay blocked (e.g. data-saver mode) — poster stays visible */
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
      preload="none"          // ← critical: nothing loaded on page paint
      aria-hidden="true"
      style={{
        position: 'absolute',
        inset: 0,
        width: '100%',
        height: '100%',
        objectFit: 'cover',
        objectPosition: 'center 20%',
        opacity: 0,
        transition: 'opacity 1.2s ease',
      }}
      onCanPlay={(e) => {
        // Smooth fade-in once first frame is decoded
        ;(e.currentTarget as HTMLVideoElement).style.opacity = '1'
      }}
    />
  )
}
