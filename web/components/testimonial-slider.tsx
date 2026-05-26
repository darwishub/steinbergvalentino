'use client'

import { useState, useEffect, useCallback, useRef } from 'react'

interface Testimonial {
  id: number
  name: string
  quote: string
}

interface Props {
  testimonials: Testimonial[]
  eyebrow?: string | null
  title?: string | null
}

function ArrowBtn({ dir, onClick }: { dir: 'left' | 'right'; onClick: () => void }) {
  return (
    <button onClick={onClick} className="sv-tslider__nav-btn" aria-label={dir === 'left' ? 'Previous testimonial' : 'Next testimonial'}>
      <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="20" cy="20" r="19.25" stroke="currentColor" strokeWidth="1.5" />
        {dir === 'right' ? (
          <path d="M17 14l6 6-6 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        ) : (
          <path d="M23 14l-6 6 6 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        )}
      </svg>
    </button>
  )
}

export function TestimonialSlider({ testimonials, eyebrow, title }: Props) {
  const [current, setCurrent] = useState(0)
  const [visible, setVisible] = useState(true)
  const lockRef = useRef(false)

  const goTo = useCallback((idx: number) => {
    if (lockRef.current) return
    lockRef.current = true
    setVisible(false)
    setTimeout(() => {
      setCurrent(idx)
      setVisible(true)
      setTimeout(() => { lockRef.current = false }, 100)
    }, 350)
  }, [])

  const prev = useCallback(
    () => goTo((current - 1 + testimonials.length) % testimonials.length),
    [current, goTo, testimonials.length]
  )
  const next = useCallback(
    () => goTo((current + 1) % testimonials.length),
    [current, goTo, testimonials.length]
  )

  useEffect(() => {
    const id = setInterval(next, 9000)
    return () => clearInterval(id)
  }, [next])

  const t = testimonials[current]

  return (
    <div className="sv-tslider">
      <div className="sv-container sv-tslider__inner">

        {/* Optional eyebrow + title from Strapi */}
        {(eyebrow || title) && (
          <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
            {eyebrow && (
              <p className="sv-eyebrow" style={{ color: 'var(--color-sv-gold)', marginBottom: '0.75rem' }}>
                {eyebrow}
              </p>
            )}
            {title && (
              <h2 style={{ fontFamily: 'var(--font-serif)', fontWeight: 400, fontSize: 'clamp(1.5rem, 3vw, 2.25rem)', color: '#fff', lineHeight: 1.25 }}>
                {title}
              </h2>
            )}
          </div>
        )}

        {/* Decorative open-quote */}
        <span className="sv-tslider__deco" aria-hidden="true">&ldquo;</span>

        {/* Quote — fades on change */}
        <blockquote
          className="sv-tslider__quote"
          style={{ opacity: visible ? 1 : 0, transition: 'opacity 0.35s ease' }}
        >
          {t.quote}
        </blockquote>

        {/* Author */}
        <p
          className="sv-tslider__name"
          style={{ opacity: visible ? 1 : 0, transition: 'opacity 0.35s ease 0.05s' }}
        >
          — {t.name}
        </p>

        {/* Nav: ← dots → */}
        <div className="sv-tslider__nav">
          <ArrowBtn dir="left" onClick={prev} />

          <div className="sv-tslider__dots" role="tablist">
            {testimonials.map((_, i) => (
              <button
                key={i}
                role="tab"
                aria-selected={i === current}
                aria-label={`Testimonial ${i + 1}`}
                onClick={() => goTo(i)}
                className={`sv-tslider__dot${i === current ? ' is-active' : ''}`}
              />
            ))}
          </div>

          <ArrowBtn dir="right" onClick={next} />
        </div>

      </div>
    </div>
  )
}
