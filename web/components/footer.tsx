import Link from 'next/link'
import { DEFAULT_GLOBAL_SETTINGS } from '@/lib/defaults'
import type { SiteLink } from '@/lib/types'
import { ContactTrigger } from '@/components/contact-drawer'

interface FooterProps {
  quickLinks?: SiteLink[] | null
  legalLinks?: SiteLink[] | null
  email?: string | null
  phone?: string | null
  address?: string | null
  copyright?: string | null
  socialFacebook?: string | null
  socialTwitter?: string | null
  socialInstagram?: string | null
  socialLinkedin?: string | null
  socialPinterest?: string | null
  contactHeading?: string | null
  emailLabel?: string | null
  phoneLabel?: string | null
  officeLabel?: string | null
  firmHeading?: string | null
  servicesHeading?: string | null
}

export function Footer({
  quickLinks,
  legalLinks,
  email,
  phone,
  address,
  copyright,
  socialFacebook,
  socialTwitter,
  socialInstagram,
  socialLinkedin,
  socialPinterest,
  contactHeading,
  emailLabel,
  phoneLabel,
  officeLabel,
  firmHeading,
  servicesHeading,
}: FooterProps) {
  const G = DEFAULT_GLOBAL_SETTINGS
  const lblContact = contactHeading ?? G.footer_contact_heading
  const lblEmail = emailLabel ?? G.footer_email_label
  const lblPhone = phoneLabel ?? G.footer_phone_label
  const lblOffice = officeLabel ?? G.footer_office_label
  const lblFirm = firmHeading ?? G.footer_firm_heading
  const lblSocial = servicesHeading ?? G.footer_services_heading
  const resolvedQuickLinks    = quickLinks?.length    ? quickLinks    : (DEFAULT_GLOBAL_SETTINGS.footer_quick_links ?? [])
  const resolvedLegalLinks    = legalLinks?.length    ? legalLinks    : (DEFAULT_GLOBAL_SETTINGS.footer_legal_links ?? [])
  const resolvedEmail     = email     ?? DEFAULT_GLOBAL_SETTINGS.contact_email
  const resolvedPhone     = phone     ?? DEFAULT_GLOBAL_SETTINGS.contact_phone
  const resolvedAddress   = address   ?? DEFAULT_GLOBAL_SETTINGS.address
  const resolvedCopyright = copyright ?? DEFAULT_GLOBAL_SETTINGS.footer_copyright

  /* Platform name is structural metadata tied to which URL field is set — not editorial copy */
  const socialLinks = [
    { label: 'LinkedIn', href: socialLinkedin },
    { label: 'X (Twitter)', href: socialTwitter },
    { label: 'Instagram', href: socialInstagram },
    { label: 'Facebook', href: socialFacebook },
    { label: 'Pinterest', href: socialPinterest },
  ].filter((s): s is { label: string; href: string } => Boolean(s.href))

  return (
    <footer className="sv-footer">

      {/* ── Gradient gold rule ──────────────────────────────────────────── */}
      <div className="sv-footer__accent" aria-hidden="true" />

      {/* ── Main columns grid ───────────────────────────────────────────── */}
      <div className="sv-container sv-footer__top">
        <div className="sv-footer__grid footer-grid">

          {/* ── Brand / logo column — inline with the other headings ───── */}
          <div className="sv-footer__brand-col">
            <Link href="/" className="sv-logo-box" aria-label="SteinbergValentino Group — home" style={{ textDecoration: 'none' }}>
              <span className="sv-wordmark-title">
                Steinberg<span style={{ color: 'var(--color-sv-gold)' }}>Valentino</span>
              </span>
              <span className="sv-wordmark-meta">Group</span>
            </Link>
          </div>

          {/* ── Quick Links ───────────────────────────────────────────── */}
          <div className="sv-footer__nav-col">
            <p className="sv-footer__section-title">{lblFirm}</p>
            <ul className="sv-footer__list">
              {resolvedQuickLinks.map((link) =>
                link.href === '/contact' ? (
                  <li key={link.href}>
                    <ContactTrigger className="footer-link footer-link--btn">
                      {link.label}
                    </ContactTrigger>
                  </li>
                ) : (
                  <li key={link.href}>
                    <Link href={link.href} className="footer-link">{link.label}</Link>
                  </li>
                )
              )}
            </ul>
          </div>

          {/* ── Social ────────────────────────────────────────────────── */}
          {socialLinks.length > 0 && (
            <div className="sv-footer__nav-col">
              <p className="sv-footer__section-title">{lblSocial}</p>
              <ul className="sv-footer__list">
                {socialLinks.map((s) => (
                  <li key={s.label}>
                    <a href={s.href} target="_blank" rel="noopener noreferrer" className="footer-link">
                      {s.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* ── Get in Touch ──────────────────────────────────────────── */}
          <div className="sv-footer__contact-col">
            <p className="sv-footer__section-title">{lblContact}</p>
            <div className="sv-footer__contact">
              {resolvedEmail && (
                <a href={`mailto:${resolvedEmail}`} className="sv-footer__contact-link">
                  <span className="sv-footer__contact-label">{lblEmail}</span>
                  {resolvedEmail}
                </a>
              )}
              {resolvedPhone && (
                <a
                  href={`tel:${resolvedPhone.replace(/[^\d+]/g, '')}`}
                  className="sv-footer__contact-link"
                >
                  <span className="sv-footer__contact-label">{lblPhone}</span>
                  {resolvedPhone}
                </a>
              )}
              {resolvedAddress && (
                <p className="sv-footer__address">
                  <span className="sv-footer__contact-label">{lblOffice}</span>
                  {resolvedAddress}
                </p>
              )}
            </div>
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
