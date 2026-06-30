'use client'

import { useState } from 'react'

interface Props {
  heading?: string | null
}

const COUNTRIES = [
  'United States', 'United Kingdom', 'Canada', 'Australia', 'Germany',
  'France', 'Switzerland', 'Singapore', 'Hong Kong', 'Japan',
  'United Arab Emirates', 'Netherlands', 'Sweden', 'Norway', 'Denmark',
  'Israel', 'Brazil', 'Mexico', 'South Africa', 'Other',
]

export function NewsletterSignup({ heading }: Props) {
  const [fields, setFields] = useState({
    email: '', firstName: '', lastName: '', company: '', jobTitle: '', country: '',
  })
  const [consent, setConsent] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
    setFields((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!consent) return
    setSubmitting(true)
    setError(null)
    try {
      const res = await fetch('/api/newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(fields),
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.error ?? 'Submission failed')
      }
      setSubmitted(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <section className="sv-newsletter">
      <div className="sv-container sv-newsletter__inner">
        {/* Left — headline */}
        <div className="sv-newsletter__left">
          <h2 className="sv-newsletter__headline">
            {heading?.trim() || 'Sign up for our latest insights and firm announcements.'}
          </h2>
        </div>

        {/* Right — form */}
        <div className="sv-newsletter__right">
          {submitted ? (
            <div className="sv-newsletter__success">
              <p className="sv-newsletter__success-heading">Thank you for subscribing.</p>
              <p className="sv-newsletter__success-body">
                You&apos;ll receive our latest insights and firm announcements directly to your inbox.
              </p>
            </div>
          ) : (
            <form className="sv-newsletter__form" onSubmit={handleSubmit} noValidate>
              <div className="sv-newsletter__field">
                <input
                  id="nl-email" name="email" type="email" required
                  placeholder="Email Address *"
                  value={fields.email} onChange={handleChange}
                  className="sv-newsletter__input"
                />
              </div>

              <div className="sv-newsletter__field">
                <input
                  id="nl-firstName" name="firstName" type="text" required
                  placeholder="First Name *"
                  value={fields.firstName} onChange={handleChange}
                  className="sv-newsletter__input"
                />
              </div>

              <div className="sv-newsletter__field">
                <input
                  id="nl-lastName" name="lastName" type="text" required
                  placeholder="Last Name *"
                  value={fields.lastName} onChange={handleChange}
                  className="sv-newsletter__input"
                />
              </div>

              <div className="sv-newsletter__field">
                <input
                  id="nl-company" name="company" type="text"
                  placeholder="Company"
                  value={fields.company} onChange={handleChange}
                  className="sv-newsletter__input"
                />
              </div>

              <div className="sv-newsletter__field">
                <input
                  id="nl-jobTitle" name="jobTitle" type="text"
                  placeholder="Job Title"
                  value={fields.jobTitle} onChange={handleChange}
                  className="sv-newsletter__input"
                />
              </div>

              <div className="sv-newsletter__field">
                <select
                  id="nl-country" name="country" required
                  value={fields.country} onChange={handleChange}
                  className="sv-newsletter__input sv-newsletter__select"
                >
                  <option value="" disabled>Country *</option>
                  {COUNTRIES.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              <div className="sv-newsletter__consent">
                <button
                  type="button"
                  role="checkbox"
                  aria-checked={consent}
                  className={`sv-newsletter__checkbox${consent ? ' sv-newsletter__checkbox--checked' : ''}`}
                  onClick={() => setConsent((v) => !v)}
                />
                <p className="sv-newsletter__consent-text">
                  By submitting this request, you consent to receive email from SteinbergValentino Group.
                  For information on our privacy practices see our{' '}
                  <a href="/privacy" className="sv-newsletter__privacy-link">Privacy Policy</a>.
                </p>
              </div>

              {error && <p className="sv-newsletter__error">{error}</p>}

              <div className="sv-newsletter__submit-row">
                <button
                  type="submit"
                  disabled={submitting || !consent}
                  className="sv-btn sv-btn-gold sv-newsletter__submit"
                >
                  <span>{submitting ? 'Submitting…' : 'Submit'}</span>
                  <span className="sv-newsletter__submit-icon" aria-hidden="true">
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                      <circle cx="10" cy="10" r="9.5" stroke="currentColor" />
                      <path d="M7.5 10h5M10 7.5l2.5 2.5-2.5 2.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </span>
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </section>
  )
}
