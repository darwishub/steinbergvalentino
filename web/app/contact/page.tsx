'use client'

import { SafeImage as Image } from '@/components/safe-image'
import { useState } from 'react'

const CONTACT_ITEMS = [
  {
    label: 'Address',
    value: 'SteinbergValentino Group\n100 Church Street, Suite 8010,\nManhattan, New York, 10007',
    href: null,
  },
  {
    label: 'Email',
    value: 'contact@steinbergvalentino.com',
    href: 'mailto:contact@steinbergvalentino.com',
  },
  {
    label: 'Phone',
    value: '(646) 535-3995',
    href: 'tel:+16465353995',
  },
]

export default function ContactPage() {
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    message: '',
  })
  const [submitted, setSubmitted] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSubmitting(true)
    await new Promise((resolve) => setTimeout(resolve, 1200))
    setSubmitted(true)
    setSubmitting(false)
  }

  const inputStyle: React.CSSProperties = {
    display: 'block',
    width: '100%',
    padding: '0.875rem 1rem',
    fontFamily: 'var(--font-sans)',
    fontSize: '0.9375rem',
    color: 'var(--color-sv-black)',
    background: 'var(--color-sv-white)',
    border: '1px solid var(--color-sv-gray200)',
    outline: 'none',
    transition: 'border-color 0.2s',
    borderRadius: 0,
    appearance: 'none' as const,
  }

  const labelStyle: React.CSSProperties = {
    display: 'block',
    fontSize: '0.75rem',
    fontFamily: 'var(--font-sans)',
    fontWeight: 500,
    letterSpacing: '0.08em',
    textTransform: 'uppercase',
    color: 'var(--color-sv-slate)',
    marginBottom: '0.5rem',
  }

  return (
    <>
      <section className="sv-page-hero" style={{ minHeight: '32rem' }}>
        <Image
          src="https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?auto=format&fit=crop&w=2000&q=88"
          alt="Contact SteinbergValentino Group"
          fill
          sizes="100vw"
          priority
          style={{ objectFit: 'cover', objectPosition: 'center 60%' }}
        />
        <div className="sv-page-hero-overlay" />
        <div className="sv-container sv-page-hero-content">
          <p className="sv-eyebrow" style={{ color: 'var(--color-sv-gold)', marginBottom: 'var(--sv-sp-16)' }}>
            Get in Touch
          </p>
          <h1
            className="sv-display"
            style={{ color: 'var(--color-sv-white)', maxWidth: '600px', marginBottom: 'var(--sv-sp-16)' }}
          >
            Start a Confidential Consultation
          </h1>
          <p style={{ fontSize: '1.0625rem', color: 'rgba(255,255,255,0.72)', lineHeight: 1.72, maxWidth: '520px', fontWeight: 300 }}>
            Schedule a call to explore how SteinbergValentino Group can elevate your company&apos;s capital markets profile.
          </p>
        </div>
      </section>

      <section className="sv-section">
        <div className="sv-container">
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '4fr 5fr',
              gap: 'var(--sv-sp-80)',
              alignItems: 'start',
            }}
            className="contact-grid"
          >
            <div>
              <h2
                style={{
                  fontFamily: 'var(--font-serif)',
                  fontWeight: 400,
                  fontSize: 'clamp(1.5rem, 2.5vw, 2.25rem)',
                  lineHeight: 1.25,
                  marginBottom: 'var(--sv-sp-32)',
                }}
              >
                We Always Appreciate Your Feedback
              </h2>
              <p
                style={{
                  fontSize: '1rem',
                  color: 'var(--color-sv-slate)',
                  lineHeight: 1.75,
                  marginBottom: 'var(--sv-sp-32)',
                }}
              >
                Our support Hotline is available 24 Hours a day: (646) 535-3995
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sv-sp-24)' }}>
                {CONTACT_ITEMS.map((item) => (
                  <div
                    key={item.label}
                    style={{
                      borderTop: '1px solid var(--color-sv-gray200)',
                      paddingTop: 'var(--sv-sp-20)',
                    }}
                  >
                    <p className="sv-eyebrow" style={{ marginBottom: '0.5rem' }}>
                      {item.label}
                    </p>
                    {item.href ? (
                      <a
                        href={item.href}
                        style={{
                          fontSize: '1rem',
                          color: 'var(--color-sv-black)',
                          textDecoration: 'none',
                        }}
                      >
                        {item.value}
                      </a>
                    ) : (
                      <p
                        style={{
                          fontSize: '1rem',
                          color: 'var(--color-sv-slate)',
                          lineHeight: 1.7,
                          whiteSpace: 'pre-line',
                          margin: 0,
                        }}
                      >
                        {item.value}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div>
              {submitted ? (
                <div
                  style={{
                    padding: 'var(--sv-sp-56)',
                    background: 'var(--color-sv-light)',
                    textAlign: 'center',
                  }}
                >
                  <h3
                    style={{
                      fontFamily: 'var(--font-serif)',
                      fontWeight: 400,
                      fontSize: '1.75rem',
                      marginBottom: '1rem',
                    }}
                  >
                    Thank you
                  </h3>
                  <p style={{ color: 'var(--color-sv-slate)', margin: 0 }}>
                    Your message has been received.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '1rem' }}>
                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: '1fr 1fr',
                      gap: '1rem',
                    }}
                    className="contact-form-row"
                  >
                    <div>
                      <label htmlFor="first_name" style={labelStyle}>
                        First Name
                      </label>
                      <input
                        id="first_name"
                        name="first_name"
                        type="text"
                        required
                        value={formData.first_name}
                        onChange={handleChange}
                        style={inputStyle}
                      />
                    </div>
                    <div>
                      <label htmlFor="last_name" style={labelStyle}>
                        Last Name
                      </label>
                      <input
                        id="last_name"
                        name="last_name"
                        type="text"
                        required
                        value={formData.last_name}
                        onChange={handleChange}
                        style={inputStyle}
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="email" style={labelStyle}>
                      Email
                    </label>
                    <input
                      id="email"
                      name="email"
                      type="email"
                      required
                      value={formData.email}
                      onChange={handleChange}
                      style={inputStyle}
                    />
                  </div>

                  <div>
                    <label htmlFor="message" style={labelStyle}>
                      Message
                    </label>
                    <textarea
                      id="message"
                      name="message"
                      required
                      value={formData.message}
                      onChange={handleChange}
                      rows={7}
                      style={{ ...inputStyle, resize: 'vertical' }}
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={submitting}
                    className="sv-btn sv-btn-primary"
                    style={{ justifySelf: 'start' }}
                  >
                    {submitting ? 'Sending...' : 'Submit'}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
        <style>{`
          @media (max-width: 1024px) { .contact-grid { grid-template-columns: 1fr !important; } }
          @media (max-width: 640px)  { .contact-form-row { grid-template-columns: 1fr !important; } }
        `}</style>
      </section>
    </>
  )
}
