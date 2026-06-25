'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'

export const CONTACT_DRAWER_EVENT = 'sv:open-contact-drawer'

export interface ContactDrawerProps {
  email?: string | null
  phone?: string | null
  address?: string | null
  contactLabel?: string | null
  emailLabel?: string | null
  phoneLabel?: string | null
  officeLabel?: string | null
  ctaLabel?: string | null
}

export function ContactDrawer({
  email,
  phone,
  address,
  contactLabel = 'Contact Us',
  emailLabel = 'Email',
  phoneLabel = 'Phone',
  officeLabel = 'Office',
  ctaLabel = 'Send Us a Message',
}: ContactDrawerProps) {
  const [open, setOpen] = useState(false)
  const panelRef = useRef<HTMLDivElement>(null)
  const closeRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    const handler = () => setOpen(true)
    window.addEventListener(CONTACT_DRAWER_EVENT, handler)
    return () => window.removeEventListener(CONTACT_DRAWER_EVENT, handler)
  }, [])

  // Focus trap + close on Escape
  useEffect(() => {
    if (!open) return
    closeRef.current?.focus()
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [open])

  if (!open) return null

  return (
    <div
      className="sv-drawer-root"
      role="dialog"
      aria-modal="true"
      aria-label="Contact Us"
    >
      {/* Backdrop */}
      <div
        className="sv-drawer-backdrop"
        onClick={() => setOpen(false)}
        aria-hidden="true"
      />

      {/* Panel */}
      <div className="sv-drawer-panel" ref={panelRef}>
        {/* Close */}
        <button
          ref={closeRef}
          className="sv-drawer-close"
          onClick={() => setOpen(false)}
          aria-label="Close contact panel"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
            <path d="M1 1l14 14M15 1L1 15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
        </button>

        {/* Content */}
        <div className="sv-drawer-body">
          <h2 className="sv-drawer-title">{contactLabel}</h2>

          <div className="sv-drawer-info">
            {address && (
              <div className="sv-drawer-field">
                <span className="sv-drawer-label">{officeLabel}</span>
                <p className="sv-drawer-value" style={{ whiteSpace: 'pre-line' }}>{address}</p>
              </div>
            )}
            {phone && (
              <div className="sv-drawer-field">
                <span className="sv-drawer-label">{phoneLabel}</span>
                <a
                  href={`tel:${phone.replace(/[^\d+]/g, '')}`}
                  className="sv-drawer-value sv-drawer-link"
                >
                  {phone}
                </a>
              </div>
            )}
            {email && (
              <div className="sv-drawer-field">
                <span className="sv-drawer-label">{emailLabel}</span>
                <a href={`mailto:${email}`} className="sv-drawer-value sv-drawer-link">
                  {email}
                </a>
              </div>
            )}
          </div>

          <div className="sv-drawer-actions">
            <Link
              href="/contact"
              className="sv-btn sv-btn-primary"
              onClick={() => setOpen(false)}
            >
              {ctaLabel}
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

export function ContactTrigger({
  children,
  className,
}: {
  children: React.ReactNode
  className?: string
}) {
  const open = () => window.dispatchEvent(new CustomEvent(CONTACT_DRAWER_EVENT))
  return (
    <button type="button" onClick={open} className={className}>
      {children}
    </button>
  )
}
