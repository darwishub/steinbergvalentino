import Link from 'next/link'
import type { Metadata } from 'next'
import { SafeImage as Image } from '@/components/safe-image'
import { getAllServicePages, getServicesListingPage, getStrapiMedia } from '@/lib/strapi'

export const revalidate = 3600

export const metadata: Metadata = {
  title: 'Services | SteinbergValentino Group',
  description:
    'Explore the full suite of investor relations and capital markets services offered by SteinbergValentino Group.',
}

const STATIC_SERVICES = [
  { title: 'Advisory',                 slug: 'advisory' },
  { title: 'Strategic Advisory',       slug: 'strategic-advisory' },
  { title: 'Transactional Advisory',   slug: 'transactional-advisory' },
  { title: 'Capital Formation',        slug: 'capital-formation' },
  { title: 'Strategic Communications', slug: 'strategic-communications' },
  { title: 'Financial Marketing',      slug: 'financial-marketing' },
  { title: 'Media Relations',          slug: 'media-relations' },
  { title: 'Media Strategy',           slug: 'media-strategy' },
  { title: 'Multicultural Engagement', slug: 'multicultural-engagement' },
  { title: 'Market Entry',             slug: 'market-entry' },
  { title: 'Crisis Management',        slug: 'crises-management' },
  { title: 'Litigation Communications',slug: 'litigation-communications' },
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

  const heroHeading    = listingPage?.hero_heading ?? null
  const heroSubheading = listingPage?.hero_subheading ?? null
  const heroImage      = listingPage?.hero_image ?? null
  const approachImage  = listingPage?.approach_image ?? null

  return (
    <>
      {/* ── Hero ────────────────────────────────────────────────────────── */}
      <section className="frm-cta-band" style={{ paddingBlock: 'var(--sv-sp-80)', position: 'relative', overflow: 'hidden' }}>
        {heroImage && (
          <div className="exc2-hero__bg" aria-hidden="true">
            <Image
              src={getStrapiMedia(heroImage.url) ?? heroImage.url}
              alt=""
              width={heroImage.width || 1920}
              height={heroImage.height || 1080}
              priority
              sizes="100vw"
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
            <div className="exc2-hero__overlay" />
          </div>
        )}
        <div className="sv-container" style={{ position: 'relative', zIndex: 1 }}>
          <p className="sv-eyebrow frm-cta-band__eyebrow">Services</p>
          {heroHeading && (
            <h1 className="frm-cta-band__heading">{heroHeading}</h1>
          )}
          {heroSubheading && (
            <p style={{ color: 'rgba(255,255,255,0.72)', fontSize: '1.0625rem', marginTop: 'var(--sv-sp-16)' }}>
              {heroSubheading}
            </p>
          )}
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

      {/* ── Approach image banner ────────────────────────────────────────── */}
      {approachImage && (
        <section style={{ lineHeight: 0, overflow: 'hidden', maxHeight: '420px' }}>
          <Image
            src={getStrapiMedia(approachImage.url) ?? approachImage.url}
            alt="SteinbergValentino Group approach"
            width={approachImage.width || 1920}
            height={approachImage.height || 1080}
            sizes="100vw"
            style={{ width: '100%', height: '420px', objectFit: 'cover', objectPosition: 'center 40%' }}
          />
        </section>
      )}

      {/* ── CTA ──────────────────────────────────────────────────────────── */}
      <section className="frm-cta-band">
        <div className="sv-container frm-cta-band__inner">
          <div>
            <p className="sv-eyebrow frm-cta-band__eyebrow">Work With Us</p>
            <h2 className="frm-cta-band__heading">
              Ready to build your investor relations program?
            </h2>
          </div>
          <Link href="/contact" className="sv-btn sv-btn-gold">
            Contact the Firm
          </Link>
        </div>
      </section>
    </>
  )
}
