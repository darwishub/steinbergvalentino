import { SafeImage as Image } from '@/components/safe-image'
import Link from 'next/link'
import type { Metadata } from 'next'
import { getAllServicePages, getServicePage } from '@/lib/strapi'
import { BlocksContent } from '@/components/blocks-content'
import { notFound } from 'next/navigation'
import { getScrapedServiceContent } from '@/lib/scraped-content'

export const revalidate = 3600

interface Props {
  params: Promise<{ slug: string }>
}

export async function generateStaticParams() {
  try {
    const services = await getAllServicePages()
    return services.map((s) => ({ slug: s.slug }))
  } catch {
    return []
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  try {
    const page = await getServicePage(slug)
    if (!page) return { title: 'Service | SteinbergValentino Group' }
    return {
      title: page.meta_title ?? `${page.title} | SteinbergValentino Group`,
      description:
        page.meta_description ?? page.hero_subheading ?? `Learn about our ${page.title} services.`,
    }
  } catch {
    return { title: 'Service | SteinbergValentino Group' }
  }
}

export default async function ServiceDetailPage({ params }: Props) {
  const { slug } = await params

  let page = null
  const scrapedPage = getScrapedServiceContent(slug)
  try {
    page = await getServicePage(slug)
  } catch {
    /* offline */
  }

  if (!page && !scrapedPage) notFound()

  const resolvedPage = page
    ? {
        hero_heading: page.hero_heading,
        hero_subheading: page.hero_subheading,
        hero_image: page.hero_image,
        body_content: page.body_content,
        sections: page.sections,
        faq_items: page.faq_items,
        title: page.title,
      }
    : {
        hero_heading: scrapedPage!.heroHeading,
        hero_subheading: scrapedPage!.heroSubheading,
        hero_image: null,
        body_content: scrapedPage!.bodyContent,
        sections: scrapedPage!.sections,
        faq_items: [],
        title: scrapedPage!.heroHeading,
      }

  return (
    <>
      {/* ── Hero ────────────────────────────────────────────────────────── */}
      <section className="sv-page-hero">
        {resolvedPage.hero_image ? (
          <Image
            src={
              resolvedPage.hero_image.url.startsWith('http')
                ? resolvedPage.hero_image.url
                : `http://127.0.0.1:1337${resolvedPage.hero_image.url}`
            }
            alt={resolvedPage.hero_image.alternativeText ?? resolvedPage.title}
            fill
            sizes="100vw"
            priority
            style={{ objectFit: 'cover' }}
          />
        ) : (
          <Image
            src="https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=2000&q=88"
            alt={resolvedPage.title}
            fill
            sizes="100vw"
            priority
            style={{ objectFit: 'cover', objectPosition: 'center 40%' }}
          />
        )}
        <div className="sv-page-hero-overlay" />

        <div className="sv-container sv-page-hero-content">
          {/* Breadcrumb */}
          <nav className="sv-breadcrumb" style={{ marginBottom: 'var(--sv-sp-24)' }}>
            <Link href="/services" className="sv-breadcrumb-link">Services</Link>
            <span style={{ color: 'rgba(255,255,255,0.22)', fontSize: '0.7rem' }}>›</span>
            <span className="sv-breadcrumb-current">{resolvedPage.title}</span>
          </nav>

          <h1
            className="sv-display"
            style={{ color: 'var(--color-sv-white)', maxWidth: '720px', marginBottom: 'var(--sv-sp-24)' }}
          >
            {resolvedPage.hero_heading}
          </h1>
          {resolvedPage.hero_subheading && (
            <p
              style={{
                fontSize: '1.0625rem',
                color: 'rgba(255,255,255,0.72)',
                lineHeight: 1.72,
                maxWidth: '560px',
                fontWeight: 300,
              }}
            >
              {resolvedPage.hero_subheading}
            </p>
          )}
        </div>
      </section>

      {/* ── Body ─────────────────────────────────────────────────────────── */}
      {resolvedPage.body_content && resolvedPage.body_content.length > 0 && (
        <section className="sv-section">
          <div
            className="sv-container"
            style={{
              display: 'grid',
              gridTemplateColumns: '2fr 1fr',
              gap: 'var(--sv-sp-80)',
              alignItems: 'start',
            }}
          >
            <div>
              <BlocksContent blocks={resolvedPage.body_content} />
            </div>
            {/* Sidebar CTA */}
            <aside
              style={{
                position: 'sticky',
                top: 'calc(var(--sv-nav-h) + 2rem)',
                padding: 'var(--sv-sp-32)',
                background: 'var(--color-sv-light)',
                display: 'flex',
                flexDirection: 'column',
                gap: 'var(--sv-sp-20)',
              }}
            >
              <div style={{ width: '2rem', height: '2px', background: 'var(--color-sv-gold)' }} />
              <h3
                style={{
                  fontFamily: 'var(--font-serif)',
                  fontWeight: 400,
                  fontSize: '1.25rem',
                  lineHeight: 1.3,
                }}
              >
                Interested in {resolvedPage.title}?
              </h3>
              <p
                style={{ fontSize: '0.9375rem', color: 'var(--color-sv-slate)', lineHeight: 1.65 }}
              >
                Speak with our team to learn how this service can be tailored to your company&apos;s
                needs and objectives.
              </p>
              <Link
                href="/contact"
                className="sv-btn sv-btn-primary"
                style={{ justifyContent: 'center' }}
              >
                Contact Us
              </Link>
              <Link
                href="/services"
                style={{
                  fontSize: '0.8125rem',
                  color: 'var(--color-sv-slate)',
                  textDecoration: 'none',
                  textAlign: 'center',
                }}
              >
                ← All Services
              </Link>
            </aside>
          </div>
          <style>{`@media (max-width: 1024px) { .body-grid { grid-template-columns: 1fr !important; } }`}</style>
        </section>
      )}

      {/* ── Content Sections ─────────────────────────────────────────────── */}
      {resolvedPage.sections?.map((section, i) => (
        <section key={section.id} className={`sv-section ${i % 2 === 0 ? 'sv-bg-light' : ''}`}>
          <div className="sv-container">
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: section.image ? '1fr 1fr' : '1fr',
                gap: 'var(--sv-sp-64)',
                alignItems: 'center',
                maxWidth: section.image ? 'none' : '760px',
              }}
              className="svc-section-grid"
            >
              <div>
                {section.heading && (
                  <h2
                    style={{
                      fontFamily: 'var(--font-serif)',
                      fontWeight: 400,
                      fontSize: 'clamp(1.5rem, 2.5vw, 2.25rem)',
                      lineHeight: 1.2,
                      marginBottom: 'var(--sv-sp-24)',
                    }}
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
              {section.image && (
                <div style={{ overflow: 'hidden' }}>
                  <Image
                    src={
                      section.image.url.startsWith('http')
                        ? section.image.url
                        : `http://127.0.0.1:1337${section.image.url}`
                    }
                    alt={section.image.alternativeText ?? section.heading ?? ''}
                    width={section.image.width || 800}
                    height={section.image.height || 600}
                    sizes="(max-width: 1024px) 100vw, 50vw"
                    style={{ width: '100%', height: 'auto', display: 'block' }}
                  />
                </div>
              )}
            </div>
          </div>
          <style>{`@media (max-width: 1024px) { .svc-section-grid { grid-template-columns: 1fr !important; } }`}</style>
        </section>
      ))}

      {/* ── FAQ ──────────────────────────────────────────────────────────── */}
      {resolvedPage.faq_items && resolvedPage.faq_items.length > 0 && (
        <section className="sv-section sv-bg-light">
          <div className="sv-container" style={{ maxWidth: '840px' }}>
            <p className="sv-eyebrow" style={{ marginBottom: 'var(--sv-sp-16)' }}>
              FAQ
            </p>
            <h2
              style={{
                fontFamily: 'var(--font-serif)',
                fontWeight: 400,
                fontSize: 'clamp(1.75rem, 3vw, 2.5rem)',
                marginBottom: 'var(--sv-sp-48)',
              }}
            >
              Frequently Asked Questions
            </h2>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
              {resolvedPage.faq_items.map((faq) => (
                <details
                  key={faq.id}
                  style={{
                    borderTop: '1px solid var(--color-sv-gray200)',
                    padding: 'var(--sv-sp-24) 0',
                  }}
                >
                  <summary
                    style={{
                      fontFamily: 'var(--font-sans)',
                      fontWeight: 500,
                      fontSize: '1.0625rem',
                      cursor: 'pointer',
                      listStyle: 'none',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      gap: '1rem',
                    }}
                  >
                    {faq.question}
                    <span
                      style={{ flexShrink: 0, fontSize: '1.25rem', color: 'var(--color-sv-gold)' }}
                    >
                      +
                    </span>
                  </summary>
                  <div style={{ marginTop: 'var(--sv-sp-16)' }}>
                    <BlocksContent blocks={faq.answer} />
                  </div>
                </details>
              ))}
            </div>
          </div>
        </section>
      )}

    </>
  )
}
