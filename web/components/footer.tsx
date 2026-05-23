import Link from 'next/link'
import { DEFAULT_GLOBAL_SETTINGS } from '@/lib/defaults'
import type { SiteLink } from '@/lib/types'

interface FooterProps {
  quickLinks?: SiteLink[] | null
  serviceLinks?: SiteLink[] | null
  exchangeLinks?: SiteLink[] | null
  legalLinks?: SiteLink[] | null
  blurb?: string | null
  email?: string | null
  phone?: string | null
  address?: string | null
  copyright?: string | null
  socialFacebook?: string | null
  socialTwitter?: string | null
  socialInstagram?: string | null
  socialLinkedin?: string | null
  socialPinterest?: string | null
}

export function Footer({
  quickLinks,
  serviceLinks,
  exchangeLinks,
  legalLinks,
  blurb,
  email,
  phone,
  address,
  copyright,
  socialFacebook,
  socialTwitter,
  socialInstagram,
  socialLinkedin,
  socialPinterest,
}: FooterProps) {
  const resolvedQuickLinks    = quickLinks?.length    ? quickLinks    : (DEFAULT_GLOBAL_SETTINGS.footer_quick_links ?? [])
  const resolvedServiceLinks  = serviceLinks?.length  ? serviceLinks  : (DEFAULT_GLOBAL_SETTINGS.footer_service_links ?? [])
  const resolvedExchangeLinks = exchangeLinks?.length ? exchangeLinks : (DEFAULT_GLOBAL_SETTINGS.footer_exchange_links ?? [])
  const resolvedLegalLinks    = legalLinks?.length    ? legalLinks    : (DEFAULT_GLOBAL_SETTINGS.footer_legal_links ?? [])
  const resolvedBlurb     = blurb     ?? DEFAULT_GLOBAL_SETTINGS.footer_blurb
  const resolvedEmail     = email     ?? DEFAULT_GLOBAL_SETTINGS.contact_email
  const resolvedPhone     = phone     ?? DEFAULT_GLOBAL_SETTINGS.contact_phone
  const resolvedAddress   = address   ?? DEFAULT_GLOBAL_SETTINGS.address
  const resolvedCopyright = copyright ?? DEFAULT_GLOBAL_SETTINGS.footer_copyright

  /* Split services into two even columns */
  const mid = Math.ceil(resolvedServiceLinks.length / 2)
  const serviceLinksA = resolvedServiceLinks.slice(0, mid)
  const serviceLinksB = resolvedServiceLinks.slice(mid)

  const hasSocial = socialLinkedin || socialTwitter || socialFacebook || socialInstagram || socialPinterest

  return (
    <footer className="sv-footer">

      {/* ── Gradient gold rule ──────────────────────────────────────────── */}
      <div className="sv-footer__accent" aria-hidden="true" />

      {/* ── Brand statement band ────────────────────────────────────────── */}
      <div className="sv-footer__statement">
        <Link href="/" className="sv-footer__logo" aria-label="SteinbergValentino Group — home">
          <span>
            Steinberg<span className="sv-footer__logo-gold">Valentino</span>
          </span>
          <span className="sv-footer__logo-sub">Group</span>
        </Link>
        {resolvedBlurb && (
          <p className="sv-footer__tagline">{resolvedBlurb}</p>
        )}
      </div>

      {/* ── Main columns grid ───────────────────────────────────────────── */}
      <div className="sv-container sv-footer__top">
        <div className="sv-footer__grid footer-grid">

          {/* ── Contact column ────────────────────────────────────────── */}
          <div className="sv-footer__contact-col">
            <p className="sv-footer__section-title">Contact</p>
            <div className="sv-footer__contact">
              {resolvedEmail && (
                <a href={`mailto:${resolvedEmail}`} className="sv-footer__contact-link">
                  <span className="sv-footer__contact-label">Email</span>
                  {resolvedEmail}
                </a>
              )}
              {resolvedPhone && (
                <a
                  href={`tel:${resolvedPhone.replace(/[^\d+]/g, '')}`}
                  className="sv-footer__contact-link"
                >
                  <span className="sv-footer__contact-label">Phone</span>
                  {resolvedPhone}
                </a>
              )}
              {resolvedAddress && (
                <p className="sv-footer__address">
                  <span className="sv-footer__contact-label">Office</span>
                  {resolvedAddress}
                </p>
              )}
            </div>

            {/* Social icons */}
            {hasSocial && (
              <div className="sv-footer__social">
                {socialLinkedin && (
                  <a href={socialLinkedin} target="_blank" rel="noopener noreferrer"
                     aria-label="LinkedIn" className="sv-footer__social-link">
                    <svg width="17" height="17" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                    </svg>
                  </a>
                )}
                {socialTwitter && (
                  <a href={socialTwitter} target="_blank" rel="noopener noreferrer"
                     aria-label="X / Twitter" className="sv-footer__social-link">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.746l7.73-8.835L1.254 2.25H8.08l4.253 5.622 5.91-5.622zm-1.161 17.52h1.833L7.084 4.126H5.117L17.083 19.77z"/>
                    </svg>
                  </a>
                )}
                {socialFacebook && (
                  <a href={socialFacebook} target="_blank" rel="noopener noreferrer"
                     aria-label="Facebook" className="sv-footer__social-link">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                    </svg>
                  </a>
                )}
                {socialInstagram && (
                  <a href={socialInstagram} target="_blank" rel="noopener noreferrer"
                     aria-label="Instagram" className="sv-footer__social-link">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/>
                    </svg>
                  </a>
                )}
                {socialPinterest && (
                  <a href={socialPinterest} target="_blank" rel="noopener noreferrer"
                     aria-label="Pinterest" className="sv-footer__social-link">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                      <path d="M12 0C5.373 0 0 5.373 0 12c0 5.084 3.163 9.426 7.627 11.174-.105-.949-.2-2.405.042-3.441.218-.937 1.407-5.965 1.407-5.965s-.359-.719-.359-1.782c0-1.668.967-2.914 2.171-2.914 1.023 0 1.518.769 1.518 1.69 0 1.029-.655 2.568-.994 3.995-.283 1.194.599 2.169 1.777 2.169 2.133 0 3.772-2.249 3.772-5.495 0-2.873-2.064-4.882-5.012-4.882-3.414 0-5.418 2.561-5.418 5.207 0 1.031.397 2.138.893 2.738a.36.36 0 01.083.345l-.333 1.36c-.053.22-.174.267-.402.161-1.499-.698-2.436-2.889-2.436-4.649 0-3.785 2.75-7.262 7.929-7.262 4.163 0 7.398 2.967 7.398 6.931 0 4.136-2.607 7.464-6.227 7.464-1.216 0-2.359-.632-2.75-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0z"/>
                    </svg>
                  </a>
                )}
              </div>
            )}
          </div>

          {/* ── The Firm ──────────────────────────────────────────────── */}
          <div className="sv-footer__nav-col">
            <p className="sv-footer__section-title">The Firm</p>
            <ul className="sv-footer__list">
              {resolvedQuickLinks.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="footer-link">{link.label}</Link>
                </li>
              ))}
            </ul>
          </div>

          {/* ── Services A ────────────────────────────────────────────── */}
          <div className="sv-footer__nav-col">
            <p className="sv-footer__section-title">Services</p>
            <ul className="sv-footer__list">
              {serviceLinksA.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="footer-link">{link.label}</Link>
                </li>
              ))}
            </ul>
          </div>

          {/* ── Services B (continuation) ─────────────────────────────── */}
          <div className="sv-footer__nav-col">
            {/* Invisible spacer header to align with other columns */}
            <p className="sv-footer__section-title" aria-hidden="true" style={{ opacity: 0, pointerEvents: 'none' }}>
              &nbsp;
            </p>
            <ul className="sv-footer__list">
              {serviceLinksB.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="footer-link">{link.label}</Link>
                </li>
              ))}
            </ul>
          </div>

          {/* ── Exchanges ─────────────────────────────────────────────── */}
          <div className="sv-footer__nav-col">
            <p className="sv-footer__section-title">Exchanges</p>
            <ul className="sv-footer__list">
              {resolvedExchangeLinks.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="footer-link">{link.label}</Link>
                </li>
              ))}
            </ul>
          </div>

        </div>
      </div>

      {/* ── Bottom bar ──────────────────────────────────────────────────── */}
      <div className="sv-footer__bottom">
        <div className="sv-container sv-footer__bottom-row">
          <p className="sv-footer__copyright">{resolvedCopyright}</p>
          {resolvedLegalLinks.length > 0 && (
            <div className="sv-footer__legal">
              {resolvedLegalLinks.map((link) => (
                <Link key={link.href} href={link.href} className="footer-link footer-link--sm">
                  {link.label}
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>

    </footer>
  )
}
