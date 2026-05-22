'use client'

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
}: FooterProps) {
  const resolvedQuickLinks = quickLinks?.length
    ? quickLinks
    : (DEFAULT_GLOBAL_SETTINGS.footer_quick_links ?? [])
  const resolvedServiceLinks = serviceLinks?.length
    ? serviceLinks
    : (DEFAULT_GLOBAL_SETTINGS.footer_service_links ?? [])
  const resolvedExchangeLinks = exchangeLinks?.length
    ? exchangeLinks
    : (DEFAULT_GLOBAL_SETTINGS.footer_exchange_links ?? [])
  const resolvedLegalLinks = legalLinks?.length
    ? legalLinks
    : (DEFAULT_GLOBAL_SETTINGS.footer_legal_links ?? [])
  const resolvedBlurb = blurb ?? DEFAULT_GLOBAL_SETTINGS.footer_blurb
  const resolvedEmail = email ?? DEFAULT_GLOBAL_SETTINGS.contact_email
  const resolvedPhone = phone ?? DEFAULT_GLOBAL_SETTINGS.contact_phone
  const resolvedAddress = address ?? DEFAULT_GLOBAL_SETTINGS.address
  const resolvedCopyright = copyright ?? DEFAULT_GLOBAL_SETTINGS.footer_copyright

  return (
    <footer style={{ backgroundColor: '#0c0d10', color: 'var(--color-sv-white)' }}>
      {/* ── Gold accent rule ─────────────────────────────────────────────── */}
      <div style={{ height: '3px', background: 'linear-gradient(90deg, var(--color-sv-gold) 0%, rgba(176,141,87,0.3) 60%, transparent 100%)' }} />
      {/* ── Top section — mirrors Blackstone .site-footer__top ──────────── */}
      <div
        className="sv-container"
        style={{
          borderBottom: '1px solid rgba(255,255,255,0.07)',
          paddingTop: 'var(--sv-sp-80)',
          paddingBottom: 'var(--sv-sp-80)',
        }}
      >
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr 1fr 1fr',
            gap: 'var(--sv-sp-64)',
            alignItems: 'start',
          }}
          className="footer-grid"
        >
          {/* Brand column */}
          <div style={{ gridColumn: 'span 1' }}>
            <Link
              href="/"
              style={{
                textDecoration: 'none',
                display: 'inline-block',
                marginBottom: 'var(--sv-sp-24)',
              }}
            >
              <span
                style={{
                  fontFamily: 'var(--font-serif)',
                  fontWeight: 400,
                  fontSize: '1.0625rem',
                  letterSpacing: '0.14em',
                  textTransform: 'uppercase',
                  color: 'var(--color-sv-white)',
                  lineHeight: 1.2,
                  display: 'block',
                }}
              >
                Steinberg<span style={{ color: 'var(--color-sv-gold)' }}>Valentino</span>
                <span
                  style={{
                    display: 'block',
                    fontFamily: 'var(--font-sans)',
                    fontSize: '0.625rem',
                    fontWeight: 400,
                    letterSpacing: '0.2em',
                    color: 'var(--color-sv-gray)',
                    marginTop: '0.1rem',
                  }}
                >
                  GROUP
                </span>
              </span>
            </Link>
            <p
              style={{
                fontSize: '0.8125rem',
                lineHeight: 1.7,
                color: 'var(--color-sv-gray)',
                marginBottom: 'var(--sv-sp-32)',
                maxWidth: '240px',
              }}
            >
              {resolvedBlurb}
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
              <a
                href={`mailto:${resolvedEmail}`}
                style={{
                  fontSize: '0.8125rem',
                  color: 'var(--color-sv-gray)',
                  textDecoration: 'none',
                }}
              >
                {resolvedEmail}
              </a>
              <a
                href={`tel:${resolvedPhone?.replace(/[^\d+]/g, '') ?? ''}`}
                style={{
                  fontSize: '0.8125rem',
                  color: 'var(--color-sv-gray)',
                  textDecoration: 'none',
                }}
              >
                {resolvedPhone}
              </a>
              <p style={{ fontSize: '0.8125rem', color: 'var(--color-sv-gray)', margin: 0 }}>
                {resolvedAddress}
              </p>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <p
              className="sv-eyebrow"
              style={{ color: 'var(--color-sv-white)', marginBottom: 'var(--sv-sp-24)' }}
            >
              The Firm
            </p>
            <ul
              style={{
                listStyle: 'none',
                margin: 0,
                padding: 0,
                display: 'flex',
                flexDirection: 'column',
                gap: '0.625rem',
              }}
            >
              {resolvedQuickLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    style={{
                      fontSize: '0.8125rem',
                      color: 'var(--color-sv-gray)',
                      textDecoration: 'none',
                      transition: 'color 0.2s',
                    }}
                    onMouseEnter={(e) =>
                      ((e.currentTarget as HTMLAnchorElement).style.color = 'var(--color-sv-white)')
                    }
                    onMouseLeave={(e) =>
                      ((e.currentTarget as HTMLAnchorElement).style.color = 'var(--color-sv-gray)')
                    }
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Services */}
          <div>
            <p
              className="sv-eyebrow"
              style={{ color: 'var(--color-sv-white)', marginBottom: 'var(--sv-sp-24)' }}
            >
              Services
            </p>
            <ul
              style={{
                listStyle: 'none',
                margin: 0,
                padding: 0,
                display: 'flex',
                flexDirection: 'column',
                gap: '0.625rem',
              }}
            >
              {resolvedServiceLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    style={{
                      fontSize: '0.8125rem',
                      color: 'var(--color-sv-gray)',
                      textDecoration: 'none',
                      transition: 'color 0.2s',
                    }}
                    onMouseEnter={(e) =>
                      ((e.currentTarget as HTMLAnchorElement).style.color = 'var(--color-sv-white)')
                    }
                    onMouseLeave={(e) =>
                      ((e.currentTarget as HTMLAnchorElement).style.color = 'var(--color-sv-gray)')
                    }
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Exchanges */}
          <div>
            <p
              className="sv-eyebrow"
              style={{ color: 'var(--color-sv-white)', marginBottom: 'var(--sv-sp-24)' }}
            >
              Exchanges
            </p>
            <ul
              style={{
                listStyle: 'none',
                margin: 0,
                padding: 0,
                display: 'flex',
                flexDirection: 'column',
                gap: '0.625rem',
              }}
            >
              {resolvedExchangeLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    style={{
                      fontSize: '0.8125rem',
                      color: 'var(--color-sv-gray)',
                      textDecoration: 'none',
                      transition: 'color 0.2s',
                    }}
                    onMouseEnter={(e) =>
                      ((e.currentTarget as HTMLAnchorElement).style.color = 'var(--color-sv-white)')
                    }
                    onMouseLeave={(e) =>
                      ((e.currentTarget as HTMLAnchorElement).style.color = 'var(--color-sv-gray)')
                    }
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* ── Bottom bar ───────────────────────────────────────────────────── */}
      <div
        className="sv-container"
        style={{ paddingTop: 'var(--sv-sp-32)', paddingBottom: 'var(--sv-sp-32)', borderTop: '1px solid rgba(255,255,255,0.07)' }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '1rem',
          }}
        >
          <p style={{ fontSize: '0.75rem', color: 'var(--color-sv-gray)', margin: 0 }}>
            {resolvedCopyright}
          </p>
          {resolvedLegalLinks.length > 0 && (
            <div style={{ display: 'flex', gap: '1.5rem' }}>
              {resolvedLegalLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  style={{
                    fontSize: '0.75rem',
                    color: 'var(--color-sv-gray)',
                    textDecoration: 'none',
                    transition: 'color 0.2s',
                  }}
                  onMouseEnter={(e) =>
                    ((e.currentTarget as HTMLAnchorElement).style.color = 'var(--color-sv-white)')
                  }
                  onMouseLeave={(e) =>
                    ((e.currentTarget as HTMLAnchorElement).style.color = 'var(--color-sv-gray)')
                  }
                >
                  {link.label}
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Responsive footer grid */}
      <style>{`
        @media (max-width: 1024px) {
          .footer-grid {
            grid-template-columns: 1fr 1fr !important;
          }
        }
        @media (max-width: 640px) {
          .footer-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </footer>
  )
}
