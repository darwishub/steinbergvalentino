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
      {/* ── Inner Hero ───────────────────────────────────────────────────── */}
      <section className="sv-page-hero">
        <Image
          src={heroBg ?? '/fallbacks/office-tower.webp'}
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

      {/* ── Intro body text ──────────────────────────────────────────────── */}
      {bodyContent && bodyContent.length > 0 && (
        <section className="sv-section sv-bg-light">
          <div className="sv-container" style={{ maxWidth: '760px' }}>
            <BlocksContent blocks={bodyContent} />
          </div>
        </section>
      )}

      {/* ── Vertical numbered timeline ───────────────────────────────────── */}
      {/*
        Template: vertical process timeline.
        Left column = large gold step number + connecting vertical rule.
        Right column = heading + subheading + body + optional image.
        Structurally distinct from About (image split) and Capabilities (card grid).
      */}
      {sections.length > 0 && (
        <section className="sv-section" style={{ backgroundColor: 'var(--color-sv-light)' }}>
          <div className="sv-container" style={{ maxWidth: '900px' }}>

            {/* Section label */}
            <div style={{ marginBottom: 'var(--sv-sp-64)' }}>
              <p className="sv-eyebrow" style={{ color: 'var(--color-sv-gold)', marginBottom: 'var(--sv-sp-16)' }}>
                Step by Step
              </p>
              <h2 className="sv-display" style={{ maxWidth: '520px' }}>
                A Proven Path to Investor Confidence
              </h2>
            </div>

            {/* Timeline list */}
            <ol style={{ listStyle: 'none', margin: 0, padding: 0 }} className="hiw-timeline">
              {sections.map((section, i) => {
                const imgSrc = section.image
                  ? getStrapiMedia(section.image.url) ?? section.image.url
                  : null
                const isLast = i === sections.length - 1

                return (
                  <li key={section.id ?? i} className="hiw-step">
                    {/* ── Left: step number + vertical rule ── */}
                    <div className="hiw-step-left" aria-hidden="true">
                      <div className="hiw-step-number">
                        <span>{String(i + 1).padStart(2, '0')}</span>
                      </div>
                      {!isLast && <div className="hiw-step-rule" />}
                    </div>

                    {/* ── Right: content ── */}
                    <div className="hiw-step-body">
                      {section.heading && (
                        <h3
                          style={{
                            fontFamily: 'var(--font-serif)',
                            fontSize: '1.5rem',
                            fontWeight: 400,
                            lineHeight: 1.25,
                            marginBottom: 'var(--sv-sp-16)',
                            color: 'var(--color-sv-navy)',
                          }}
                        >
                          {section.heading}
                        </h3>
                      )}
                      {section.subheading && (
                        <p
                          style={{
                            fontSize: '1rem',
                            color: 'var(--color-sv-slate)',
                            lineHeight: 1.65,
                            marginBottom: section.body ? 'var(--sv-sp-16)' : 0,
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

      {/* ── Bottom CTA ───────────────────────────────────────────────────── */}
      <section
        className="sv-section"
        style={{ backgroundColor: '#0c0d10', borderTop: '1px solid rgba(255,255,255,0.07)' }}
      >
        <div className="sv-container" style={{ textAlign: 'center', maxWidth: '600px' }}>
          <p className="sv-eyebrow" style={{ color: 'var(--color-sv-gold)', marginBottom: 'var(--sv-sp-16)' }}>
            Start the Conversation
          </p>
          <h2
            className="sv-display"
            style={{ color: 'var(--color-sv-white)', marginBottom: 'var(--sv-sp-32)' }}
          >
            Ready to see the process in action?
          </h2>
          <a href="/contact" className="sv-btn sv-btn-primary">
            Schedule a Consultation
          </a>
        </div>
      </section>

      <style>{`
        /* Timeline layout */
        .hiw-timeline {
          display: flex;
          flex-direction: column;
        }
        .hiw-step {
          display: grid;
          grid-template-columns: 80px 1fr;
          gap: 0 var(--sv-sp-48);
          align-items: start;
        }
        .hiw-step-left {
          display: flex;
          flex-direction: column;
          align-items: center;
        }
        .hiw-step-number {
          width: 56px;
          height: 56px;
          border: 2px solid var(--color-sv-gold);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          background: #fff;
        }
        .hiw-step-number span {
          font-family: var(--font-serif);
          font-size: 1.125rem;
          font-weight: 400;
          color: var(--color-sv-gold);
          line-height: 1;
        }
        .hiw-step-rule {
          width: 2px;
          flex: 1;
          min-height: 40px;
          background: linear-gradient(to bottom, var(--color-sv-gold), rgba(176,141,87,0.15));
          margin-top: 0;
        }
        .hiw-step-body {
          padding-bottom: var(--sv-sp-64);
          padding-top: 12px;
        }
        @media (max-width: 640px) {
          .hiw-step { grid-template-columns: 48px 1fr; gap: 0 var(--sv-sp-24); }
          .hiw-step-number { width: 40px; height: 40px; }
          .hiw-step-number span { font-size: 0.9rem; }
          .hiw-step-body { padding-bottom: var(--sv-sp-48); }
        }
      `}</style>
    </>
  )
}
