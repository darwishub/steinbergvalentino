import { SafeImage as Image } from '@/components/safe-image'
import type { Metadata } from 'next'
import { getCapabilitiesPage, getStrapiMedia } from '@/lib/strapi'
import { BlocksContent } from '@/components/blocks-content'
import { getScrapedPageContent } from '@/lib/scraped-content'

export const revalidate = 3600

export async function generateMetadata(): Promise<Metadata> {
  try {
    const page = await getCapabilitiesPage()
    return {
      title: page.meta_title ?? 'Capabilities | SteinbergValentino Group',
      description:
        page.meta_description ??
        'Explore the full range of investor relations and capital markets capabilities offered by SteinbergValentino Group.',
    }
  } catch {
    return {
      title: 'Capabilities | SteinbergValentino Group',
      description:
        'Explore the full range of investor relations and capital markets capabilities offered by SteinbergValentino Group.',
    }
  }
}

/* ── Per-card decorative icons (inline SVG, indexed by position) ────────── */
const CARD_ICONS = [
  /* 0 — Communications */
  <svg key="comms" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
  </svg>,
  /* 1 — Branding */
  <svg key="brand" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
  </svg>,
  /* 2 — Crisis */
  <svg key="crisis" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
  </svg>,
  /* 3 — Digital */
  <svg key="digital" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <rect x="2" y="3" width="20" height="14" rx="2" ry="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/>
  </svg>,
]

export default async function CapabilitiesPage() {
  let page = null
  const scrapedPage = getScrapedPageContent('capabilities.html')
  try {
    page = await getCapabilitiesPage()
  } catch {
    /* static fallback */
  }

  const heroHeading = page?.hero_heading ?? scrapedPage?.heroHeading ?? 'Capabilities'
  const heroSubheading = page?.hero_subheading ?? scrapedPage?.heroSubheading ?? ''
  const heroBg = page?.hero_image ? getStrapiMedia(page.hero_image.url) : null
  const sections = page?.sections?.length ? page.sections : (scrapedPage?.sections ?? [])
  const bodyContent = page?.body_content ?? scrapedPage?.bodyContent ?? null

  return (
    <>
      {/* ── Inner Hero ───────────────────────────────────────────────────── */}
      <section className="sv-page-hero">
        <Image
          src={heroBg ?? '/fallbacks/office-tower.webp'}
          alt="SteinbergValentino capabilities"
          fill
          sizes="100vw"
          priority
          style={{ objectFit: 'cover', objectPosition: 'center 55%' }}
        />
        <div className="sv-page-hero-overlay" />
        <div className="sv-container sv-page-hero-content">
          <p className="sv-eyebrow" style={{ color: 'var(--color-sv-gold)', marginBottom: 'var(--sv-sp-16)' }}>
            What We Do
          </p>
          <h1
            className="sv-display"
            style={{ color: 'var(--color-sv-white)', maxWidth: '700px', marginBottom: 'var(--sv-sp-24)' }}
          >
            {heroHeading}
          </h1>
          {heroSubheading && (
            <p style={{ fontSize: '1.0625rem', color: 'rgba(255,255,255,0.72)', lineHeight: 1.72, maxWidth: '560px', fontWeight: 300 }}>
              {heroSubheading}
            </p>
          )}
        </div>
      </section>

      {/* ── Intro body text ──────────────────────────────────────────────── */}
      {bodyContent && bodyContent.length > 0 && (
        <section className="sv-section sv-bg-light">
          <div className="sv-container" style={{ maxWidth: '760px' }}>
            <BlocksContent blocks={bodyContent} />
          </div>
        </section>
      )}

      {/* ── Capability card grid ─────────────────────────────────────────── */}
      {/*
        Template: dark-background 2×2 card grid.
        Each card = gold icon + left-border accent + heading + body text.
        Structurally distinct from About (image+text split) and HIW (timeline).
      */}
      {sections.length > 0 && (
        <section
          className="sv-section"
          style={{ backgroundColor: '#0c0d10' }}
        >
          <div className="sv-container">
            {/* Section label */}
            <div style={{ textAlign: 'center', marginBottom: 'var(--sv-sp-64)' }}>
              <p className="sv-eyebrow" style={{ color: 'var(--color-sv-gold)', marginBottom: 'var(--sv-sp-16)' }}>
                Our Expertise
              </p>
              <h2
                className="sv-display"
                style={{ color: 'var(--color-sv-white)', maxWidth: '580px', margin: '0 auto' }}
              >
                Built for Capital Markets
              </h2>
            </div>

            {/* 2 × 2 card grid */}
            <div className="cap-card-grid">
              {sections.map((section, i) => (
                <article
                  key={section.id ?? i}
                  className="cap-card"
                  style={{
                    borderLeft: '3px solid var(--color-sv-gold)',
                    padding: 'var(--sv-sp-48) var(--sv-sp-48) var(--sv-sp-48) calc(var(--sv-sp-48) - 3px)',
                    backgroundColor: 'rgba(255,255,255,0.035)',
                    position: 'relative',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 'var(--sv-sp-24)',
                  }}
                >
                  {/* Icon */}
                  <div style={{ color: 'var(--color-sv-gold)' }}>
                    {CARD_ICONS[i % CARD_ICONS.length]}
                  </div>

                  {/* Heading */}
                  {section.heading && (
                    <h3
                      style={{
                        fontFamily: 'var(--font-serif)',
                        fontSize: '1.375rem',
                        fontWeight: 400,
                        lineHeight: 1.25,
                        color: 'var(--color-sv-white)',
                        margin: 0,
                      }}
                    >
                      {section.heading}
                    </h3>
                  )}

                  {/* Subheading */}
                  {section.subheading && (
                    <p style={{ fontSize: '0.9375rem', color: 'var(--color-sv-gray)', lineHeight: 1.65, margin: 0 }}>
                      {section.subheading}
                    </p>
                  )}

                  {/* Body blocks */}
                  {section.body && (
                    <div style={{ color: 'var(--color-sv-gray)', fontSize: '0.9rem' }}>
                      <BlocksContent blocks={section.body} />
                    </div>
                  )}

                  {/* Section image (small, bottom of card) */}
                  {section.image && (
                    <div style={{ marginTop: 'auto', overflow: 'hidden' }}>
                      <Image
                        src={getStrapiMedia(section.image.url) ?? section.image.url}
                        alt={section.image.alternativeText ?? section.heading ?? ''}
                        width={section.image.width || 600}
                        height={section.image.height || 340}
                        sizes="(max-width: 768px) 100vw, 50vw"
                        style={{ width: '100%', height: '180px', objectFit: 'cover', display: 'block' }}
                      />
                    </div>
                  )}
                </article>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── Bottom CTA strip ─────────────────────────────────────────────── */}
      <section
        className="sv-section"
        style={{
          borderTop: '1px solid var(--color-sv-gray200)',
          backgroundColor: 'var(--color-sv-light)',
        }}
      >
        <div
          className="sv-container"
          style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 'var(--sv-sp-32)' }}
        >
          <div>
            <p className="sv-eyebrow" style={{ color: 'var(--color-sv-gold)', marginBottom: 'var(--sv-sp-16)' }}>
              Ready to Get Started?
            </p>
            <h2
              className="sv-display"
              style={{ maxWidth: '480px', margin: 0 }}
            >
              Let&apos;s build your investor relations program.
            </h2>
          </div>
          <a href="/contact" className="sv-btn sv-btn-primary">
            Contact the Firm
          </a>
        </div>
      </section>

      <style>{`
        .cap-card-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: var(--sv-sp-2, 2px);
        }
        @media (max-width: 768px) {
          .cap-card-grid { grid-template-columns: 1fr; }
        }
      `}</style>
    </>
  )
}
