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
          src={heroBg ?? 'https://images.unsplash.com/photo-1444653389962-8149286c578a?auto=format&fit=crop&w=2000&q=88'}
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

      {/* ── Body Content from Strapi ─────────────────────────────────────── */}
      {bodyContent && bodyContent.length > 0 && (
        <section className="sv-section">
          <div className="sv-container" style={{ maxWidth: '800px' }}>
            <BlocksContent blocks={bodyContent} />
          </div>
        </section>
      )}

      {/* ── Sections from Strapi ─────────────────────────────────────────── */}
      {sections.map((section, i) => {
        const imgSrc = section.image
          ? getStrapiMedia(section.image.url) ?? section.image.url
          : null
        return (
          <section
            key={section.id ?? i}
            className={`sv-section ${i % 2 === 0 ? 'sv-bg-light' : ''}`}
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
                className="cap-section-grid"
              >
                <div>
                  {section.heading && (
                    <h2 className="sv-display" style={{ marginBottom: 'var(--sv-sp-24)' }}>
                      {section.heading}
                    </h2>
                  )}
                  {section.subheading && (
                    <p
                      style={{
                        fontSize: '1.125rem',
                        color: 'var(--color-sv-slate)',
                        marginBottom: 'var(--sv-sp-24)',
                      }}
                    >
                      {section.subheading}
                    </p>
                  )}
                  {section.body && <BlocksContent blocks={section.body} />}
                </div>
                {imgSrc && (
                  <Image
                    src={imgSrc}
                    alt={section.image!.alternativeText ?? section.heading ?? ''}
                    width={section.image!.width || 800}
                    height={section.image!.height || 600}
                    sizes="(max-width: 1024px) 100vw, 50vw"
                    style={{ width: '100%', height: 'auto', display: 'block' }}
                  />
                )}
              </div>
            </div>
            <style>{`@media (max-width: 1024px) { .cap-section-grid { grid-template-columns: 1fr !important; } }`}</style>
          </section>
        )
      })}

    </>
  )
}
