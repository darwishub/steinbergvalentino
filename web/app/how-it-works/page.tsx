import { SafeImage as Image } from '@/components/safe-image'
import type { Metadata } from 'next'
import { getHowItWorksPage, getStrapiMedia } from '@/lib/strapi'
import { BlocksContent } from '@/components/blocks-content'
import { getScrapedPageContent } from '@/lib/scraped-content'

export const revalidate = 3600

export async function generateMetadata(): Promise<Metadata> {
  try {
    const page = await getHowItWorksPage()
    return {
      title: page.meta_title ?? 'How It Works | SteinbergValentino Group',
      description:
        page.meta_description ??
        'Discover how SteinbergValentino Group builds and executes investor relations programs for public companies.',
    }
  } catch {
    return {
      title: 'How It Works | SteinbergValentino Group',
      description:
        'Discover how SteinbergValentino Group builds and executes investor relations programs for public companies.',
    }
  }
}

export default async function HowItWorksPage() {
  let page = null
  const scrapedPage = getScrapedPageContent('how-it-works.html')
  try {
    page = await getHowItWorksPage()
  } catch {
    /* static fallback */
  }

  const heroHeading = page?.hero_heading ?? scrapedPage?.heroHeading ?? 'How It Works'
  const heroSubheading = page?.hero_subheading ?? scrapedPage?.heroSubheading ?? ''

  const heroBg = page?.hero_image ? getStrapiMedia(page.hero_image.url) : null
  const sections = page?.sections?.length ? page.sections : (scrapedPage?.sections ?? [])
  const bodyContent = page?.body_content ?? scrapedPage?.bodyContent ?? null

  return (
    <>
      {/* ── Hero ────────────────────────────────────────────────────────── */}
      <section className="sv-page-hero">
        <Image
          src={heroBg ?? 'https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&w=2000&q=88'}
          alt="How SteinbergValentino works"
          fill
          sizes="100vw"
          priority
          style={{ objectFit: 'cover', objectPosition: 'center 35%' }}
        />
        <div className="sv-page-hero-overlay" />
        <div className="sv-container sv-page-hero-content">
          <p className="sv-eyebrow" style={{ color: 'var(--color-sv-gold)', marginBottom: 'var(--sv-sp-16)' }}>
            Our Process
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
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          {sections.map((section, i) => {
            const imgSrc = section.image
              ? getStrapiMedia(section.image.url) ?? section.image.url
              : null
            const isLight = i % 2 === 0

            return (
              <section
                key={section.id ?? i}
                className={`sv-section ${isLight ? '' : 'sv-bg-light'}`}
                style={{ borderTop: '1px solid var(--color-sv-gray200)' }}
              >
                <div className="sv-container">
                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: imgSrc ? '1fr 1fr' : '3fr 2fr',
                      gap: 'var(--sv-sp-64)',
                      alignItems: 'center',
                    }}
                    className="hiw-section-grid"
                  >
                    {/* On even rows, if there's an image, show it on the right */}
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

                    {/* Phase number visual for sections without images */}
                    {!imgSrc && (
                      <div>
                        {section.heading && (
                          <h2
                            className="sv-display"
                            style={{ marginBottom: 'var(--sv-sp-24)' }}
                          >
                            {section.heading}
                          </h2>
                        )}
                        {section.subheading && (
                          <p
                            style={{
                              fontSize: '1.125rem',
                              color: 'var(--color-sv-slate)',
                              marginBottom: 'var(--sv-sp-24)',
                              lineHeight: 1.6,
                            }}
                          >
                            {section.subheading}
                          </p>
                        )}
                        {section.body && <BlocksContent blocks={section.body} />}
                      </div>
                    )}

                    {imgSrc && (
                      <div>
                        {section.heading && (
                          <h2
                            className="sv-display"
                            style={{ marginBottom: 'var(--sv-sp-24)' }}
                          >
                            {section.heading}
                          </h2>
                        )}
                        {section.subheading && (
                          <p
                            style={{
                              fontSize: '1.125rem',
                              color: 'var(--color-sv-slate)',
                              marginBottom: 'var(--sv-sp-24)',
                              lineHeight: 1.6,
                            }}
                          >
                            {section.subheading}
                          </p>
                        )}
                        {section.body && <BlocksContent blocks={section.body} />}
                      </div>
                    )}

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

                    {/* Phase number decoration for no-image sections */}
                    {!imgSrc && (
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          padding: 'var(--sv-sp-48)',
                          background: 'var(--color-sv-light)',
                        }}
                        className="hiw-phase-visual"
                      >
                        <p
                          style={{
                            fontFamily: 'var(--font-serif)',
                            fontWeight: 400,
                            fontSize: '7rem',
                            color: 'var(--color-sv-gold)',
                            lineHeight: 1,
                            opacity: 0.25,
                          }}
                        >
                          {String(i + 1).padStart(2, '0')}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
                <style>{`@media (max-width: 1024px) { .hiw-section-grid { grid-template-columns: 1fr !important; } .hiw-phase-visual { display: none !important; } }`}</style>
              </section>
            )
          })}
        </div>
      ) : null}
    </>
  )
}
