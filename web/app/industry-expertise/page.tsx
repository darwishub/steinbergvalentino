import { SafeImage as Image } from '@/components/safe-image'
import Link from 'next/link'
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

export default async function IndustryExpertisePage() {
  let page = null
  const scrapedPage = getScrapedPageContent('industry-expertise.html')
  try {
    page = await getIndustryExpertisePage()
  } catch {
    /* static fallback */
  }

  const heroHeading = page?.hero_heading ?? scrapedPage?.heroHeading ?? 'Industry Expertise'
  const heroSubheading = page?.hero_subheading ?? scrapedPage?.heroSubheading ?? null
  const heroImage = page?.hero_image ?? null
  const sections = page?.sections?.length ? page.sections : (scrapedPage?.sections ?? [])
  const bodyContent = page?.body_content ?? scrapedPage?.bodyContent ?? null
  const sectors: Array<{ id: number; label: string; icon?: string | null }> =
    page?.sectors?.length ? page.sectors : []

  return (
    <>
      {/* ── Full-Bleed Image Hero with Ticker Strip ───────────────────────── */}
      <section className="ind-hero">
        {/* Background photo */}
        <div className="ind-hero__bg" aria-hidden="true">
          <Image
            src={heroImage ? (getStrapiMedia(heroImage.url) ?? heroImage.url) : '/firm-industry.jpg'}
            alt=""
            width={heroImage?.width || 1920}
            height={heroImage?.height || 800}
            priority
            sizes="100vw"
            style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center 60%' }}
          />
          <div className="ind-hero__bg-overlay" />
        </div>

        {/* Content */}
        <div className="ind-hero__content">
          <p className="sv-eyebrow ind-hero__eyebrow">Sector Knowledge</p>
          <h1 className="ind-hero__title">{heroHeading}</h1>
          {heroSubheading && (
            <p className="ind-hero__deck">{heroSubheading}</p>
          )}
        </div>

        {/* Ticker strip — only renders when sectors are available */}
        {sectors.length > 0 && (
          <div className="ind-hero__ticker" aria-hidden="true">
            <div className="ind-hero__ticker-track">
              {sectors.map((sector, i) => (
                <span
                  key={sector.id}
                  className={`ind-hero__ticker-item${i % 3 === 1 ? ' ind-hero__ticker-item--gold' : ''}`}
                >
                  {sector.label}
                </span>
              ))}
              {/* Duplicate for visual continuity */}
              {sectors.map((sector, i) => (
                <span
                  key={`${sector.id}-2`}
                  className={`ind-hero__ticker-item${i % 3 === 1 ? ' ind-hero__ticker-item--gold' : ''}`}
                >
                  {sector.label}
                </span>
              ))}
            </div>
          </div>
        )}
      </section>

      {/* ── Intro body text ──────────────────────────────────────────────── */}
      {bodyContent && bodyContent.length > 0 && (
        <section className="ind-intro">
          <div className="sv-container">
            <div className="ind-intro__prose">
              <BlocksContent blocks={bodyContent} />
            </div>
          </div>
        </section>
      )}

      {/* ── Sector Grid (dark) ── only shown when sectors data is available ── */}
      {sectors.length > 0 && (
        <section className="ind-sector-section">
          <div className="sv-container">
            <ul className="ind-sector-grid">
              {sectors.map((sector) => (
                <li key={sector.id} className="ind-sector-chip">
                  {sector.icon && (
                    <span className="ind-sector-chip__icon" aria-hidden="true">
                      {sector.icon}
                    </span>
                  )}
                  <span className="ind-sector-chip__label">{sector.label}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}

      {/* ── Editorial Magazine Strips ────────────────────────────────────── */}
      {sections.map((section, i) => {
        const imgSrc = section.image
          ? getStrapiMedia(section.image.url) ?? section.image.url
          : null
        const isLight = i % 2 === 0

        return (
          <section
            key={section.id ?? i}
            className="ind-strip"
            style={{ background: isLight ? 'var(--color-sv-white)' : 'var(--color-sv-light)' }}
          >
            <div className="sv-container">
              <div className="ind-strip__grid">
                {/* Text block */}
                <div>
                  <div className="ind-strip__marker" aria-hidden="true">
                    <span className="ind-strip__marker-line" />
                    <span className="ind-strip__marker-num">
                      {String(i + 1).padStart(2, '0')}
                    </span>
                  </div>

                  {section.heading && (
                    <h2 className="ind-strip__heading">{section.heading}</h2>
                  )}
                  {section.subheading && (
                    <p className="ind-strip__sub">{section.subheading}</p>
                  )}
                  {section.body && (
                    <div className="ind-strip__prose">
                      <BlocksContent blocks={section.body} />
                    </div>
                  )}
                </div>

                {/* Right column: image or decorative initial */}
                <div>
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
                    <div className="ind-strip__decorative" aria-hidden="true">
                      <span className="ind-strip__decorative-letter">
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

      {/* ── Bottom CTA Band ──────────────────────────────────────────────── */}
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
