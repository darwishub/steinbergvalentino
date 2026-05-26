import { SafeImage as Image } from '@/components/safe-image'
import Link from 'next/link'
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
  const heroSubheading = page?.hero_subheading ?? scrapedPage?.heroSubheading ?? null
  const heroImage = page?.hero_image ?? null
  const sections = page?.sections?.length ? page.sections : (scrapedPage?.sections ?? [])
  const bodyContent = page?.body_content ?? scrapedPage?.bodyContent ?? null

  /* First 4 sections become the horizontal columns; remainder go to the timeline below */
  const colSections = sections.slice(0, 4)
  const extraSections = sections.slice(4)

  return (
    <>
      {/* ── Watermark Hero ───────────────────────────────────────────────── */}
      <section className="hiw-hero">
        {/* Ghost watermark text */}
        <div className="hiw-hero__watermark" aria-hidden="true">PROCESS</div>

        <div className="sv-container">
          <div className="hiw-hero__inner">
            <p className="sv-eyebrow hiw-hero__eyebrow">Our Process</p>
            <h1 className="hiw-hero__title">{heroHeading}</h1>
            {heroSubheading && (
              <p className="hiw-hero__deck">{heroSubheading}</p>
            )}
          </div>
        </div>

        {/* Right photo strip */}
        <div className="hiw-hero__img-strip" aria-hidden="true">
          <Image
            src={heroImage ? (getStrapiMedia(heroImage.url) ?? heroImage.url) : '/firm-hiw.jpg'}
            alt=""
            width={heroImage?.width || 480}
            height={heroImage?.height || 640}
            priority
            sizes="30vw"
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
          <div className="hiw-hero__img-strip-overlay" />
        </div>

        <div className="hiw-hero__rule" aria-hidden="true" />
      </section>

      {/* ── Intro body (from old site body_content) ─────────────────────── */}
      {bodyContent && bodyContent.length > 0 && (
        <section style={{ background: 'var(--color-sv-white)', padding: 'var(--sv-sp-80) 0' }}>
          <div className="sv-container">
            <div className="hiw-callout">
              <BlocksContent blocks={bodyContent} />
            </div>
          </div>
        </section>
      )}

      {/* ── Horizontal Process Columns ───────────────────────────────────── */}
      {colSections.length > 0 && (
        <section className="hiw-process">
          <div className="sv-container">
            <div className="hiw-process__label">
              <p className="sv-eyebrow hiw-process__eyebrow">Our Process</p>
            </div>

            <div className="hiw-process__cols">
              {colSections.map((section, i) => {
                const colImgSrc = section.image
                  ? getStrapiMedia(section.image.url) ?? section.image.url
                  : null
                return (
                  <div key={section.id ?? i} className="hiw-process-col">
                    <div className="hiw-process-col__num" aria-hidden="true">
                      {String(i + 1).padStart(2, '0')}
                    </div>
                    {section.heading && (
                      <h3 className="hiw-process-col__heading">{section.heading}</h3>
                    )}
                    {section.subheading && (
                      <p className="hiw-process-col__body">{section.subheading}</p>
                    )}
                    {section.body && (
                      <div className="hiw-process-col__body">
                        <BlocksContent blocks={section.body} />
                      </div>
                    )}
                    {colImgSrc && (
                      <div style={{ marginTop: '1.25rem', overflow: 'hidden' }}>
                        <Image
                          src={colImgSrc}
                          alt={section.image!.alternativeText ?? section.heading ?? ''}
                          width={section.image!.width || 480}
                          height={section.image!.height || 300}
                          sizes="(max-width: 768px) 100vw, 25vw"
                          style={{ width: '100%', height: 'auto', display: 'block' }}
                        />
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        </section>
      )}

      {/* ── Extra sections (5+) shown as vertical timeline ───────────────── */}
      {extraSections.length > 0 && (
        <section className="hiw-timeline-section">
          <div className="sv-container">
            <ol style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: 'var(--sv-sp-48)' }}>
              {extraSections.map((section, i) => {
                const imgSrc = section.image
                  ? getStrapiMedia(section.image.url) ?? section.image.url
                  : null
                return (
                  <li key={section.id ?? i} className="frm-hiw-step">
                    <div className="frm-hiw-step__left" aria-hidden="true">
                      <div className="frm-hiw-step__number">
                        <span>{String(colSections.length + i + 1).padStart(2, '0')}</span>
                      </div>
                      {i < extraSections.length - 1 && <div className="frm-hiw-step__rule" />}
                    </div>
                    <div className="frm-hiw-step__body">
                      {section.heading && (
                        <h3 className="frm-hiw-step__heading">{section.heading}</h3>
                      )}
                      {section.subheading && (
                        <p className="frm-hiw-step__sub">{section.subheading}</p>
                      )}
                      {section.body && (
                        <div className="frm-hiw-step__prose">
                          <BlocksContent blocks={section.body} />
                        </div>
                      )}
                      {imgSrc && (
                        <div style={{ marginTop: 'var(--sv-sp-32)', overflow: 'hidden' }}>
                          <Image
                            src={imgSrc}
                            alt={section.image!.alternativeText ?? section.heading ?? ''}
                            width={section.image!.width || 800}
                            height={section.image!.height || 450}
                            sizes="(max-width: 900px) 100vw, 760px"
                            style={{ width: '100%', height: 'auto', display: 'block' }}
                          />
                        </div>
                      )}
                    </div>
                  </li>
                )
              })}
            </ol>
          </div>
        </section>
      )}

      {/* ── Bottom CTA Band ──────────────────────────────────────────────── */}
      <section className="frm-cta-band">
        <div className="sv-container frm-cta-band__inner">
          <div>
            <p className="sv-eyebrow frm-cta-band__eyebrow">Start the Conversation</p>
            <h2 className="frm-cta-band__heading">
              Ready to see the process in action?
            </h2>
          </div>
          <Link href="/contact" className="sv-btn sv-btn-gold">
            Schedule a Consultation
          </Link>
        </div>
      </section>
    </>
  )
}
