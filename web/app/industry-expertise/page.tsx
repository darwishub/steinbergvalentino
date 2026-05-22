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

  const heroBg = page?.hero_image
    ? getStrapiMedia(page.hero_image.url)
    : null

  const sections = page?.sections?.length ? page.sections : (scrapedPage?.sections ?? [])
  const bodyContent = page?.body_content ?? scrapedPage?.bodyContent ?? null

  return (
    <>
      {/* ── Hero ────────────────────────────────────────────────────────── */}
      <section className="sv-page-hero">
        <Image
          src={heroBg ?? 'https://images.unsplash.com/photo-1434626881859-194d67b2b86f?auto=format&fit=crop&w=2000&q=88'}
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

      {/* ── Body Content from Strapi ─────────────────────────────────────── */}
      {bodyContent && bodyContent.length > 0 && (
        <section className="sv-section">
          <div className="sv-container" style={{ maxWidth: '800px' }}>
            <BlocksContent blocks={bodyContent} />
          </div>
        </section>
      )}

      {/* ── Sections from Strapi ─────────────────────────────────────────── */}
      {sections.length > 0 ? (
        <>
          {sections.map((section, i) => {
            const imgSrc = section.image
              ? getStrapiMedia(section.image.url) ?? section.image.url
              : null
            const isDark = i % 2 === 1

            return (
              <section
                key={section.id ?? i}
                className={`sv-section ${isDark ? 'sv-bg-dark' : 'sv-bg-light'}`}
              >
                <div className="sv-container">
                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: imgSrc ? '1fr 1fr' : '1fr',
                      gap: 'var(--sv-sp-64)',
                      alignItems: 'center',
                      maxWidth: imgSrc ? '100%' : '800px',
                    }}
                    className="ind-section-grid"
                  >
                    {/* Alternate: image on left for even-indexed sections */}
                    {imgSrc && i % 2 === 1 && (
                      <div style={{ position: 'relative', overflow: 'hidden' }}>
                        <Image
                          src={imgSrc}
                          alt={section.image!.alternativeText ?? section.heading ?? ''}
                          width={section.image!.width || 800}
                          height={section.image!.height || 600}
                          sizes="(max-width: 1024px) 100vw, 50vw"
                          style={{ width: '100%', height: 'auto', display: 'block' }}
                        />
                      </div>
                    )}

                    <div>
                      {section.heading && (
                        <h2
                          className="sv-display"
                          style={{
                            marginBottom: 'var(--sv-sp-24)',
                            color: isDark ? 'var(--color-sv-white)' : undefined,
                          }}
                        >
                          {section.heading}
                        </h2>
                      )}
                      {section.subheading && (
                        <p
                          style={{
                            fontSize: '1.125rem',
                            color: isDark ? 'var(--color-sv-gray)' : 'var(--color-sv-slate)',
                            marginBottom: 'var(--sv-sp-24)',
                            lineHeight: 1.6,
                          }}
                        >
                          {section.subheading}
                        </p>
                      )}
                      {section.body && <BlocksContent blocks={section.body} />}
                    </div>

                    {imgSrc && i % 2 === 0 && (
                      <div style={{ position: 'relative', overflow: 'hidden' }}>
                        <Image
                          src={imgSrc}
                          alt={section.image!.alternativeText ?? section.heading ?? ''}
                          width={section.image!.width || 800}
                          height={section.image!.height || 600}
                          sizes="(max-width: 1024px) 100vw, 50vw"
                          style={{ width: '100%', height: 'auto', display: 'block' }}
                        />
                      </div>
                    )}
                  </div>
                </div>
                <style>{`@media (max-width: 1024px) { .ind-section-grid { grid-template-columns: 1fr !important; } }`}</style>
              </section>
            )
          })}
        </>
      ) : null}
    </>
  )
}
