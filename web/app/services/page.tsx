import { SafeImage as Image } from '@/components/safe-image'
import Link from 'next/link'
import type { Metadata } from 'next'
import { getAllServicePages, getServicesListingPage, getStrapiMedia } from '@/lib/strapi'

export const revalidate = 3600

export const metadata: Metadata = {
  title: 'Services | SteinbergValentino Group',
  description:
    'Explore the full suite of investor relations and capital markets services offered by SteinbergValentino Group.',
}

const STATIC_SERVICES = [
  {
    title: 'Advisory',
    slug: 'advisory',
    description:
      'Strategic guidance on capital markets positioning, investor messaging, and long-term growth.',
  },
  {
    title: 'Strategic Advisory',
    slug: 'strategic-advisory',
    description:
      'Bespoke strategic counsel for critical corporate decisions, M&A, and transformative events.',
  },
  {
    title: 'Transactional Advisory',
    slug: 'transactional-advisory',
    description:
      'Expert guidance through mergers, acquisitions, divestitures, and other complex transactions.',
  },
  {
    title: 'Capital Formation',
    slug: 'capital-formation',
    description:
      'End-to-end support for private placements, public offerings, and investor roadshows.',
  },
  {
    title: 'Strategic Communications',
    slug: 'strategic-communications',
    description:
      'Crafting the financial narrative that resonates with institutional and retail investors.',
  },
  {
    title: 'Financial Marketing',
    slug: 'financial-marketing',
    description:
      'Targeted investor marketing campaigns across digital, print, and broadcast channels.',
  },
  {
    title: 'Media Relations',
    slug: 'media-relations',
    description:
      'High-impact media placements across financial news outlets, wire services, and digital platforms.',
  },
  {
    title: 'Media Strategy',
    slug: 'media-strategy',
    description:
      'Comprehensive media planning to ensure maximum coverage of your key investor milestones.',
  },
  {
    title: 'Multicultural Engagement',
    slug: 'multicultural-engagement',
    description:
      'Reaching diverse investor communities across language barriers and cultural contexts.',
  },
  {
    title: 'Market Entry',
    slug: 'market-entry',
    description:
      'Navigating exchange listing requirements and market structure for companies entering new markets.',
  },
  {
    title: 'Crisis Management',
    slug: 'crises-management',
    description:
      'Rapid-response communications for regulatory, litigation, and adverse market events.',
  },
  {
    title: 'Litigation Communications',
    slug: 'litigation-communications',
    description:
      'Strategic communications support for companies navigating active litigation and regulatory investigations.',
  },
]

export default async function ServicesIndexPage() {
  let services: { title: string; slug: string; hero_subheading?: string | null }[] = []
  let listingPage = null

  try {
    ;[services, listingPage] = await Promise.all([getAllServicePages(), getServicesListingPage()])
  } catch {
    /* ignore */
  }

  /* Fall back to static if Strapi returned empty */
  if (!services || services.length === 0) {
    services = STATIC_SERVICES
  }

  const heroSrc      = getStrapiMedia(listingPage?.hero_image?.url)     ?? '/fallbacks/office-tower.webp'
  const approachSrc  = getStrapiMedia(listingPage?.approach_image?.url) ?? '/fallbacks/teamwork.webp'

  return (
    <>
      {/* ── Hero ────────────────────────────────────────────────────────── */}
      <section className="sv-page-hero">
        <Image
          src={heroSrc}
          alt={listingPage?.hero_heading ?? 'SteinbergValentino Services'}
          fill
          sizes="100vw"
          priority
          style={{ objectFit: 'cover', objectPosition: 'center 25%' }}
        />
        <div className="sv-page-hero-overlay" />
        <div className="sv-container sv-page-hero-content">
          <p className="sv-eyebrow" style={{ color: 'var(--color-sv-gold)', marginBottom: 'var(--sv-sp-16)' }}>
            Services
          </p>
          <h1
            className="sv-display"
            style={{ color: 'var(--color-sv-white)', maxWidth: '680px', marginBottom: 'var(--sv-sp-24)' }}
          >
            A complete suite of investor relations services
          </h1>
          <p style={{ fontSize: '1.0625rem', color: 'rgba(255,255,255,0.72)', lineHeight: 1.72, maxWidth: '560px', fontWeight: 300 }}>
            From initial strategy through ongoing investor engagement, SteinbergValentino Group
            provides every service a public company needs to build and maintain a strong capital
            markets presence.
          </p>
        </div>
      </section>

      {/* ── Service Grid ─────────────────────────────────────────────────── */}
      <section className="sv-section">
        <div className="sv-container">
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: '1px',
              background: 'var(--color-sv-gray200)',
            }}
            className="services-listing-grid"
          >
            {services.map((svc) => (
              <Link
                key={svc.slug}
                href={`/services/${svc.slug}`}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  padding: '2rem',
                  background: 'var(--color-sv-white)',
                  textDecoration: 'none',
                  color: 'inherit',
                  borderTop: '2px solid transparent',
                  transition: 'border-top-color 0.2s, background-color 0.2s',
                  gap: '0.75rem',
                }}
                className="svc-listing-link"
              >
                <h3
                  style={{
                    fontFamily: 'var(--font-serif)',
                    fontWeight: 400,
                    fontSize: '1.25rem',
                    lineHeight: 1.3,
                    color: 'var(--color-sv-black)',
                  }}
                >
                  {svc.title}
                </h3>
                {svc.hero_subheading && (
                  <p
                    style={{
                      fontSize: '0.9375rem',
                      color: 'var(--color-sv-slate)',
                      lineHeight: 1.6,
                    }}
                  >
                    {svc.hero_subheading}
                  </p>
                )}
                <span
                  style={{
                    marginTop: 'auto',
                    fontSize: '0.8125rem',
                    fontWeight: 500,
                    letterSpacing: '0.06em',
                    textTransform: 'uppercase',
                    color: 'var(--color-sv-gold)',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.375rem',
                  }}
                >
                  Learn More →
                </span>
              </Link>
            ))}
          </div>
        </div>
        <style>{`
          @media (max-width: 1024px) { .services-listing-grid { grid-template-columns: repeat(2, 1fr) !important; } }
          @media (max-width: 640px)  { .services-listing-grid { grid-template-columns: 1fr !important; } }
          .svc-listing-link:hover { border-top-color: var(--color-sv-gold) !important; background-color: var(--color-sv-light) !important; }
        `}</style>
      </section>

      {/* ── Approach ─────────────────────────────────────────────────────── */}
      <section className="sv-section sv-bg-dark">
        <div className="sv-container">
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: 'var(--sv-sp-80)',
              alignItems: 'center',
            }}
            className="approach-grid"
          >
            <div>
              <p
                className="sv-eyebrow"
                style={{ color: 'var(--color-sv-gold)', marginBottom: 'var(--sv-sp-24)' }}
              >
                Integrated Approach
              </p>
              <h2
                className="sv-display"
                style={{ color: 'var(--color-sv-white)', marginBottom: 'var(--sv-sp-32)' }}
              >
                Every service works in concert
              </h2>
              <p
                style={{
                  fontSize: '1.0625rem',
                  color: 'var(--color-sv-gray)',
                  lineHeight: 1.7,
                  marginBottom: 'var(--sv-sp-40)',
                }}
              >
                While clients may engage us for individual services, the full power of
                SteinbergValentino Group comes from integrating communications, capital formation,
                and advisory under one unified strategy. The result is a cohesive investor narrative
                that compounds over time.
              </p>
              <Link href="/how-it-works" className="sv-btn sv-btn-outline-white">
                How We Work
              </Link>
            </div>

            <div style={{ position: 'relative' }}>
              <Image
                src={approachSrc}
                alt="Integrated investor relations approach"
                width={700}
                height={500}
                sizes="(max-width: 1024px) 100vw, 50vw"
                style={{ width: '100%', height: 'auto', display: 'block', objectFit: 'cover' }}
              />
              <div
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  height: '3px',
                  background: 'var(--color-sv-gold)',
                }}
              />
            </div>
          </div>
        </div>
        <style>{`@media (max-width: 1024px) { .approach-grid { grid-template-columns: 1fr !important; } }`}</style>
      </section>

      {/* ── CTA ──────────────────────────────────────────────────────────── */}
      <section className="sv-section" style={{ textAlign: 'center' }}>
        <div className="sv-container" style={{ maxWidth: '640px' }}>
          <p className="sv-eyebrow" style={{ marginBottom: 'var(--sv-sp-16)' }}>
            Speak to Our Team
          </p>
          <h2 className="sv-display" style={{ marginBottom: 'var(--sv-sp-32)' }}>
            Discuss which services are right for your company
          </h2>
          <Link href="/contact" className="sv-btn sv-btn-primary">
            Contact Us
          </Link>
        </div>
      </section>
    </>
  )
}
