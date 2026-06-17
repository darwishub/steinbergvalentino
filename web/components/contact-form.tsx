'use client'

import { useState } from 'react'
import { DEFAULT_GLOBAL_SETTINGS as G } from '@/lib/defaults'

interface ContactFormLabels {
  firstName?: string | null
  lastName?: string | null
  email?: string | null
  message?: string | null
  submit?: string | null
  submitting?: string | null
  successHeading?: string | null
  successBody?: string | null
}

interface ContactFormProps {
  address?: string | null
  phone?: string | null
  email?: string | null
  heading?: string | null
  subheading?: string | null
  labels?: ContactFormLabels
}

export function ContactForm({ address, phone, email, heading, subheading, labels }: ContactFormProps) {
  const L = {
    firstName: labels?.firstName ?? G.form_first_name_label,
    lastName: labels?.lastName ?? G.form_last_name_label,
    email: labels?.email ?? G.form_email_label,
    message: labels?.message ?? G.form_message_label,
    submit: labels?.submit ?? G.form_submit_label,
    submitting: labels?.submitting ?? G.form_submitting_label,
    successHeading: labels?.successHeading ?? G.form_success_heading,
    successBody: labels?.successBody ?? G.form_success_body,
  }
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    message: '',
  })
  const [submitted, setSubmitted] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSubmitting(true)
    setError(null)
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Something went wrong')
      setSubmitted(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.')
    } finally {
      setSubmitting(false)
    }
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

  const contactItems = [
    address ? { label: 'Address', value: address, href: null } : null,
    email   ? { label: 'Email',   value: email,   href: `mailto:${email}` } : null,
    phone   ? { label: 'Phone',   value: phone,   href: `tel:${phone.replace(/[^+\d]/g, '')}` } : null,
  ].filter(Boolean) as { label: string; value: string; href: string | null }[]

  return (
    <section className="sv-section">
      <div className="sv-container">
        <div
          style={{ display: 'grid', gridTemplateColumns: '4fr 5fr', gap: 'var(--sv-sp-80)', alignItems: 'start' }}
          className="contact-grid"
        >
          <div>
            {(heading || subheading) && (
              <div style={{ marginBottom: 'var(--sv-sp-32)' }}>
                {heading && (
                  <h2
                    style={{
                      fontFamily: 'var(--font-serif)',
                      fontWeight: 400,
                      fontSize: 'clamp(1.5rem, 2.5vw, 2.25rem)',
                      lineHeight: 1.25,
                      marginBottom: subheading ? '0.5rem' : 0,
                    }}
                  >
                    {heading}
                  </h2>
                )}
                {subheading && (
                  <p style={{ fontSize: '1.0625rem', color: 'var(--color-sv-slate)', margin: 0 }}>
                    {subheading}
                  </p>
                )}
              </div>
            )}


            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sv-sp-24)' }}>
              {contactItems.map((item) => (
                <div
                  key={item.label}
                  style={{ borderTop: '1px solid var(--color-sv-gray200)', paddingTop: 'var(--sv-sp-20)' }}
                >
                  <p className="sv-eyebrow" style={{ marginBottom: '0.5rem' }}>{item.label}</p>
                  {item.href ? (
                    <a href={item.href} style={{ fontSize: '1rem', color: 'var(--color-sv-black)', textDecoration: 'none' }}>
                      {item.value}
                    </a>
                  ) : (
                    <p style={{ fontSize: '1rem', color: 'var(--color-sv-slate)', lineHeight: 1.7, whiteSpace: 'pre-line', margin: 0 }}>
                      {item.value}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div>
            {submitted ? (
              <div style={{ padding: 'var(--sv-sp-56)', background: 'var(--color-sv-light)', textAlign: 'center' }}>
                <h3 style={{ fontFamily: 'var(--font-serif)', fontWeight: 400, fontSize: '1.75rem', marginBottom: '1rem' }}>
                  {L.successHeading}
                </h3>
                <p style={{ color: 'var(--color-sv-slate)', margin: 0 }}>{L.successBody}</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '1rem' }}>
                <div
                  style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}
                  className="contact-form-row"
                >
                  <div>
                    <label htmlFor="first_name" style={labelStyle}>{L.firstName}</label>
                    <input id="first_name" name="first_name" type="text" required value={formData.first_name} onChange={handleChange} style={inputStyle} />
                  </div>
                  <div>
                    <label htmlFor="last_name" style={labelStyle}>{L.lastName}</label>
                    <input id="last_name" name="last_name" type="text" required value={formData.last_name} onChange={handleChange} style={inputStyle} />
                  </div>
                </div>

                <div>
                  <label htmlFor="email" style={labelStyle}>{L.email}</label>
                  <input id="email" name="email" type="email" required value={formData.email} onChange={handleChange} style={inputStyle} />
                </div>

                <div>
                  <label htmlFor="message" style={labelStyle}>{L.message}</label>
                  <textarea id="message" name="message" required value={formData.message} onChange={handleChange} rows={7} style={{ ...inputStyle, resize: 'vertical' }} />
                </div>

                {error && (
                  <p style={{ fontSize: '0.875rem', color: '#b91c1c', margin: 0 }}>{error}</p>
                )}
                <button type="submit" disabled={submitting} className="sv-btn sv-btn-primary" style={{ justifySelf: 'start' }}>
                  {submitting ? L.submitting : L.submit}
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
  )
}
