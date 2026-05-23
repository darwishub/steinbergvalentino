import { SafeImage as Image } from '@/components/safe-image'
import Link from 'next/link'
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

/* ── Per-card SVG icons (indexed by position) ───────────────────────────── */
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
    <rect x="2" y="3" width="20" height="14" rx="2" ry="2"/>
    <line x1="8" y1="21" x2="16" y2="21"/>
    <line x1="12" y1="17" x2="12" y2="21"/>
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
  const heroSubheading = page?.hero_subheading ?? scrapedPage?.heroSubheading ?? null
  const sections = page?.sections?.length ? page.sections : (scrapedPage?.sections ?? [])
  const bodyContent = page?.body_content ?? scrapedPage?.bodyContent ?? null
  const heroImage = page?.hero_image ?? null

  return (
    <>
      {/* ── Dot-Grid Hero ─────────────────────────────────────────────────── */}
      <section className="cap-hero">
        <div className="sv-container">
          <div className="cap-hero__inner">
            <div className="cap-hero__text">
              <p className="sv-eyebrow cap-hero__eyebrow">What We Do</p>
              <h1 className="cap-hero__title">{heroHeading}</h1>
              {heroSubheading && (
                <p className="cap-hero__deck">{heroSubheading}</p>
              )}
            </div>

            {heroImage && (
              <div className="cap-hero__img-wrap">
                <Image
                  src={getStrapiMedia(heroImage.url) ?? heroImage.url}
                  alt={heroImage.alternativeText ?? heroHeading}
                  width={heroImage.width || 640}
                  height={heroImage.height || 480}
                  priority
                  sizes="(max-width: 1024px) 0px, 480px"
                  style={{ width: '100%', height: 'auto', objectFit: 'cover', borderRadius: '4px' }}
                />
              </div>
            )}
          </div>
        </div>
        <div className="cap-hero__rule" aria-hidden="true" />
      </section>

      {/* ── Intro prose (light) ───────────────────────────────────────────── */}
      {bodyContent && bodyContent.length > 0 && (
        <section className="cap-intro">
          <div className="sv-container">
            <div className="cap-intro__prose">
              <BlocksContent blocks={bodyContent} />
            </div>
          </div>
        </section>
      )}

      {/* ── Dark Card Grid ────────────────────────────────────────────────── */}
      {sections.length > 0 && (
        <section className="cap-grid-section">
          <div className="sv-container">
            <div className="cap-card-grid">
              {sections.map((section, i) => (
                <article key={section.id ?? i} className="cap-card">
                  <div className="cap-card__icon">
                    {CARD_ICONS[i % CARD_ICONS.length]}
                  </div>

                  <span className="cap-card__num" aria-hidden="true">
                    {String(i + 1).padStart(2, '0')}
                  </span>

                  {section.heading && (
                    <h3 className="cap-card__heading">{section.heading}</h3>
                  )}

                  {section.subheading && (
                    <p className="cap-card__sub">{section.subheading}</p>
                  )}

                  {section.body && (
                    <div className="cap-card__sub">
                      <BlocksContent blocks={section.body} />
                    </div>
                  )}

                  {section.image && (
                    <Image
                      className="cap-card__img"
                      src={getStrapiMedia(section.image.url) ?? section.image.url}
                      alt={section.image.alternativeText ?? section.heading ?? ''}
                      width={section.image.width || 600}
                      height={section.image.height || 160}
                      sizes="(max-width: 768px) 100vw, 50vw"
                    />
                  )}
                </article>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── Light CTA (inverted) ─────────────────────────────────────────── */}
      <section className="cap-cta">
        <div className="sv-container">
          <div className="cap-cta__inner">
            <div>
              <p className="sv-eyebrow cap-cta__eyebrow">Work With Us</p>
              <h2 className="cap-cta__heading">
                Ready to build your investor relations program?
              </h2>
            </div>
            <Link href="/contact" className="sv-btn sv-btn-dark">
              Contact the Firm
            </Link>
          </div>
        </div>
      </section>
    </>
  )
}
