'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'

interface Slide {
  image_url: string
  title: string
  blurb: string
  cta_label: string
  cta_url: string
}

interface Props {
  slides?: Slide[] | null
}

const FALLBACK_SLIDES: Slide[] = [
  {
    image_url:
      'https://images.unsplash.com/photo-1486325212027-8081e485255e?w=1200&q=80&auto=format&fit=crop',
    title: 'Premier Investor Relations for Public Companies',
    blurb:
      'SteinbergValentino Group delivers institutional-grade IR strategy and capital markets expertise to small and mid-cap public companies worldwide.',
    cta_label: 'About the Firm',
    cta_url: '/about',
  },
  {
    image_url:
      'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=1200&q=80&auto=format&fit=crop',
    title: 'Capital Markets Advisory',
    blurb:
      'Strategic financing solutions and exchange listing expertise — from NASDAQ and NYSE to TSX, CSE, and Frankfurt.',
    cta_label: 'Our Services',
    cta_url: '/capabilities',
  },
  {
    image_url:
      'https://images.unsplash.com/photo-1497366216548-37526070297c?w=1200&q=80&auto=format&fit=crop',
    title: 'Global Capital Markets Expertise',
    blurb:
      'SteinbergValentino has worked for many worldwide firms across NASDAQ, OTC, TSX, CSE, and Frankfurt exchanges — bringing rare creative talent and market innovation.',
    cta_label: 'How It Works',
    cta_url: '/how-it-works',
  },
]

/**
 * Build a responsive srcSet for Unsplash and Strapi image URLs.
 * Unsplash supports ?w= param; Strapi serves static files so we only
 * return the single URL as a srcset hint.
 */
function buildSrcSet(url: string): string | undefined {
  if (!url.includes('unsplash.com')) return undefined
  try {
    const u = new URL(url)
    u.searchParams.delete('w')
    u.searchParams.delete('q')
    const base = u.toString()
    // 750 closes the gap between 640→960 for mid-range mobile (720–900px viewport)
    const widths = [640, 750, 960, 1200, 1600]
    const qualities: Record<number, number> = { 640: 72, 750: 75, 960: 78, 1200: 80, 1600: 80 }
    return widths
      .map((w) => {
        const variant = new URL(base)
        variant.searchParams.set('w', String(w))
        variant.searchParams.set('q', String(qualities[w]))
        variant.searchParams.set('auto', 'format')
        variant.searchParams.set('fit', 'crop')
        return `${variant.toString()} ${w}w`
      })
      .join(', ')
  } catch {
    return undefined
  }
}

function ArrowIcon({ dir }: { dir: 'left' | 'right' }) {
  return (
    <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="20" cy="20" r="19.25" stroke="currentColor" strokeWidth="1.5" />
      {dir === 'right' ? (
        <path d="M17 14l6 6-6 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      ) : (
        <path d="M23 14l-6 6 6 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      )}
    </svg>
  )
}

export function PromoCarousel({ slides: slidesProp }: Props) {
  const slides = slidesProp?.length ? slidesProp : FALLBACK_SLIDES
  const [current, setCurrent] = useState(0)
  const [locked, setLocked] = useState(false)

  const goTo = useCallback(
    (index: number) => {
      if (locked) return
      setLocked(true)
      setCurrent(index)
      setTimeout(() => setLocked(false), 700)
    },
    [locked],
  )

  const prev = useCallback(() => goTo((current - 1 + slides.length) % slides.length), [current, goTo, slides.length])
  const next = useCallback(() => goTo((current + 1) % slides.length), [current, goTo, slides.length])

  useEffect(() => {
    const id = setInterval(next, 6000)
    return () => clearInterval(id)
  }, [next])

  const slide = slides[current]

  return (
    <div className="sv-pcarousel">
      <div className="sv-container sv-pcarousel__media-wrap">
      <div className="sv-pcarousel__media">
        {slides.map((s, i) => (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            key={i}
            src={s.image_url}
            srcSet={buildSrcSet(s.image_url)}
            sizes="(min-width: 1469px) 1250px, (min-width: 1281px) calc(98vw - 190px), (min-width: 769px) calc(98vw - 100px), calc(98vw - 40px)"
            alt=""
            aria-hidden="true"
            /* First slide is the LCP element — load eagerly with high priority.
               All subsequent slides are hidden behind CSS; lazy-load them. */
            loading={i === 0 ? 'eager' : 'lazy'}
            fetchPriority={i === 0 ? 'high' : 'low'}
            decoding={i === 0 ? 'sync' : 'async'}
            className={`sv-pcarousel__img${i === current ? ' is-active' : ''}`}
          />
        ))}
        <div className="sv-pcarousel__scrim" aria-hidden="true" />
      </div>
      </div>

      <div className="sv-container sv-pcarousel__lower">
        <div className="sv-pcarousel__content">
          <div className="sv-pcarousel__col-title">
            <h3 className="sv-pcarousel__title">{slide.title}</h3>
          </div>
          <div className="sv-pcarousel__col-body">
            <p className="sv-pcarousel__blurb">{slide.blurb}</p>
            <Link href={slide.cta_url} className="sv-pcarousel__cta">
              <span>{slide.cta_label}</span>
              <svg width="40" height="40" viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg">
                <path d="M29 20c0-.2 0-.4-.2-.6l-4.4-4.6a1 1 0 0 0-1.2 0c-.3.3-.3.8 0 1.1l3.1 3.3H11.8a.8.8 0 1 0 0 1.6h14.5l-3 3.3c-.4.3-.4.8 0 1.2.3.3.8.2 1.1 0l4.4-4.7.2-.6Z" fill="currentColor" className="sv-pcarousel__cta-arrow" />
                <path d="M20 0a20 20 0 1 0 0 40 20 20 0 0 0 0-40Zm0 1.5a18.5 18.5 0 1 1 0 37 18.5 18.5 0 0 1 0-37Z" fill="currentColor" className="sv-pcarousel__cta-fill" />
              </svg>
            </Link>
          </div>
        </div>

        <div className="sv-pcarousel__nav">
          <button onClick={prev} className="sv-pcarousel__nav-btn" aria-label="Previous slide">
            <ArrowIcon dir="left" />
          </button>
          <div className="sv-pcarousel__dots" role="tablist">
            {slides.map((_, i) => (
              <button
                key={i}
                role="tab"
                aria-selected={i === current}
                aria-label={`Go to slide ${i + 1}`}
                onClick={() => goTo(i)}
                className={`sv-pcarousel__dot${i === current ? ' is-active' : ''}`}
              />
            ))}
          </div>
          <button onClick={next} className="sv-pcarousel__nav-btn" aria-label="Next slide">
            <ArrowIcon dir="right" />
          </button>
        </div>
      </div>
    </div>
  )
}
