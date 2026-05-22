import { SafeImage as Image } from '@/components/safe-image'
import type { Metadata } from 'next'
import { getIndustryExpertisePage, getStrapiMedia } from '@/lib/strapi'
import { BlocksContent } from '@/components/blocks-content'
import { getScrapedPageContent } from '@/lib/scraped-content'

export const revalidate = 3600

export async function generateMetadata(): Promise<Metadata> {
  try {
    const page = await getIndustryExpertisePage()
    return {
      title: page.meta_title ?? 'Industry Expertise | SteinbergValentino Group',
      description:
        page.meta_description ??
        'SteinbergValentino Group brings deep sector knowledge across technology, natural resources, healthcare, financial services, and more.',
    }
  } catch {
    return {
      title: 'Industry Expertise | SteinbergValentino Group',
      description: 'Deep sector knowledge across the industries we serve.',
    }
  }
}

/* ── Sector fallbacks (used only when Strapi has none) ───────────────────── */
const FALLBACK_SECTORS = [
  { id: 1,  label: 'Technology',           icon: '💻' },
  { id: 2,  label: 'Healthcare & Biotech', icon: '🔬' },
  { id: 3,  label: 'Natural Resources',    icon: '⛏️' },
  { id: 4,  label: 'Financial Services',   icon: '🏦' },
  { id: 5,  label: 'Clean Energy',         icon: '⚡' },
  { id: 6,  label: 'Real Estate',          icon: '🏢' },
  { id: 7,  label: 'Mining & Metals',      icon: '🪨' },
  { id: 8,  label: 'Cannabis',             icon: '🌿' },
  { id: 9,  label: 'Manufacturing',        icon: '⚙️' },
  { id: 10, label: 'Consumer Goods',       icon: '🛒' },
  { id: 11, label: 'Media & Entertainment',icon: '🎬' },
  { id: 12, label: 'Emerging Markets',     icon: '🌐' },
]

export default async function IndustryExpertisePage() {
  let page = null
  const scrapedPage = getScrapedPageContent('industry-expertise.html')
  try {
    page = await getIndustryExpertisePage()
  } catch {
    /* static fallback */
  }

  const heroHeading = page?.hero_heading ?? scrapedPage?.heroHeading ?? 'Industry Expertise'
  const heroSubheading = page?.hero_subheading ?? scrapedPage?.heroSubheading ?? ''
  const heroBg = page?.hero_image ? getStrapiMedia(page.hero_image.url) : null
  const sections = page?.sections?.length ? page.sections : (scrapedPage?.sections ?? [])
  const bodyContent = page?.body_content ?? scrapedPage?.bodyContent ?? null
  const sectors = page?.sectors?.length ? page.sectors : FALLBACK_SECTORS

  return (
    <>
      {/* ── Inner Hero ───────────────────────────────────────────────────── */}
      <section className="sv-page-hero">
        <Image
          src={heroBg ?? '/fallbacks/office-tower.webp'}
          alt="Industry expertise"
          fill
          sizes="100vw"
          priority
          style={{ objectFit: 'cover', objectPosition: 'center 50%' }}
        />
        <div className="sv-page-hero-overlay" />
        <div className="sv-container sv-page-hero-content">
          <p className="sv-eyebrow" style={{ color: 'var(--color-sv-gold)', marginBottom: 'var(--sv-sp-16)' }}>
            Sector Knowledge
          </p>
          <h1
            className="sv-display"
            style={{ color: 'var(--color-sv-white)', maxWidth: '680px', marginBottom: 'var(--sv-sp-24)' }}
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

      {/* ── Sector tag grid ──────────────────────────────────────────────── */}
      {/*
        Template: sector showcase grid.
        12 fixed industry chips in a masonry-style grid — scannable at a glance.
        Structurally distinct from About (image split), HIW (timeline), Capabilities (card grid).
      */}
      <section className="sv-section" style={{ backgroundColor: '#0c0d10' }}>
        <div className="sv-container">
          <div style={{ marginBottom: 'var(--sv-sp-56)' }}>
            <p className="sv-eyebrow" style={{ color: 'var(--color-sv-gold)', marginBottom: 'var(--sv-sp-16)' }}>
              Industries We Serve
            </p>
            <h2
              className="sv-display"
              style={{ color: 'var(--color-sv-white)', maxWidth: '520px' }}
            >
              Sector-fluent across capital markets
            </h2>
          </div>

          <ul className="ind-sector-grid" style={{ listStyle: 'none', margin: 0, padding: 0 }}>
            {sectors.map((sector) => (
              <li key={sector.id} className="ind-sector-chip">
                {sector.icon && (
                  <span className="ind-sector-chip-icon" aria-hidden="true">
                    {sector.icon}
                  </span>
                )}
                <span className="ind-sector-chip-label">{sector.label}</span>
              </li>
            ))}

          </ul>
        </div>
      </section>

      {/* ── Editorial strips from Strapi ─────────────────────────────────── */}
      {/*
        Full-width alternating editorial bands.
        Unlike About's 50/50 grid, these use a 3:2 text-heavy split with
        a large decorative serif initial on the right for visual rhythm.
      */}
      {sections.map((section, i) => {
        const imgSrc = section.image
          ? getStrapiMedia(section.image.url) ?? section.image.url
          : null
        const isLight = i % 2 === 0

        return (
          <section
            key={section.id ?? i}
            className="sv-section ind-editorial-strip"
            style={{
              backgroundColor: isLight ? 'var(--color-sv-light)' : '#fff',
              borderTop: '1px solid var(--color-sv-gray200)',
            }}
          >
            <div className="sv-container">
              <div className="ind-editorial-grid">
                {/* Text block — always on left for consistent reading flow */}
                <div className="ind-editorial-text">
                  {/* Gold index marker */}
                  <div
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      marginBottom: 'var(--sv-sp-24)',
                    }}
                  >
                    <span
                      style={{
                        display: 'inline-block',
                        width: '2rem',
                        height: '2px',
                        backgroundColor: 'var(--color-sv-gold)',
                      }}
                    />
                    <span
                      style={{
                        fontFamily: 'var(--font-serif)',
                        fontSize: '0.875rem',
                        color: 'var(--color-sv-gold)',
                        letterSpacing: '0.08em',
                      }}
                    >
                      {String(i + 1).padStart(2, '0')}
                    </span>
                  </div>

                  {section.heading && (
                    <h2
                      className="sv-display"
                      style={{ marginBottom: 'var(--sv-sp-24)', color: 'var(--color-sv-navy)' }}
                    >
                      {section.heading}
                    </h2>
                  )}
                  {section.subheading && (
                    <p
                      style={{
                        fontSize: '1.0625rem',
                        color: 'var(--color-sv-slate)',
                        lineHeight: 1.7,
                        marginBottom: 'var(--sv-sp-24)',
                      }}
                    >
                      {section.subheading}
                    </p>
                  )}
                  {section.body && (
                    <div style={{ color: 'var(--color-sv-slate)' }}>
                      <BlocksContent blocks={section.body} />
                    </div>
                  )}
                </div>

                {/* Right column: image or large decorative initial */}
                <div className="ind-editorial-aside">
                  {imgSrc ? (
                    <Image
                      src={imgSrc}
                      alt={section.image!.alternativeText ?? section.heading ?? ''}
                      width={section.image!.width || 640}
                      height={section.image!.height || 480}
                      sizes="(max-width: 1024px) 100vw, 40vw"
                      style={{ width: '100%', height: 'auto', display: 'block' }}
                    />
                  ) : (
                    /* Decorative large initial from heading */
                    <div
                      style={{
                        height: '100%',
                        minHeight: '220px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        background: isLight ? '#e8e8e6' : 'var(--color-sv-light)',
                        overflow: 'hidden',
                      }}
                    >
                      <span
                        style={{
                          fontFamily: 'var(--font-serif)',
                          fontSize: 'clamp(6rem, 14vw, 11rem)',
                          fontWeight: 400,
                          color: 'var(--color-sv-gold)',
                          opacity: 0.18,
                          lineHeight: 1,
                          userSelect: 'none',
                        }}
                        aria-hidden="true"
                      >
                        {section.heading?.charAt(0) ?? String(i + 1)}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </section>
        )
      })}

      <style>{`
        /* Sector chip grid */
        .ind-sector-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 1px;
          background-color: rgba(255,255,255,0.06);
          border: 1px solid rgba(255,255,255,0.06);
        }
        .ind-sector-chip {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: var(--sv-sp-24) var(--sv-sp-32);
          background-color: #0c0d10;
          transition: background 0.2s;
        }
        .ind-sector-chip:hover { background-color: rgba(176,141,87,0.08); }
        .ind-sector-chip-icon { font-size: 1.375rem; flex-shrink: 0; }
        .ind-sector-chip-label {
          font-family: var(--font-sans);
          font-size: 0.9375rem;
          font-weight: 500;
          color: var(--color-sv-gray);
          letter-spacing: 0.01em;
        }

        /* Editorial strip layout — 3:2 with aside */
        .ind-editorial-grid {
          display: grid;
          grid-template-columns: 3fr 2fr;
          gap: var(--sv-sp-64);
          align-items: center;
        }

        @media (max-width: 1024px) {
          .ind-sector-grid { grid-template-columns: repeat(3, 1fr); }
        }
        @media (max-width: 768px) {
          .ind-sector-grid { grid-template-columns: repeat(2, 1fr); }
          .ind-editorial-grid { grid-template-columns: 1fr; }
          .ind-editorial-aside { order: -1; }
        }
        @media (max-width: 480px) {
          .ind-sector-grid { grid-template-columns: 1fr; }
          .ind-sector-chip { padding: var(--sv-sp-16) var(--sv-sp-24); }
        }
      `}</style>
    </>
  )
}
