import { SafeImage as Image } from '@/components/safe-image'
import Link from 'next/link'
import type { Metadata } from 'next'
import { getAllExchangePages, getExchangePage } from '@/lib/strapi'
import { BlocksContent } from '@/components/blocks-content'
import { notFound } from 'next/navigation'
import { getScrapedExchangeContent } from '@/lib/scraped-content'

export const revalidate = 3600

interface Props {
  params: Promise<{ slug: string }>
}

export async function generateStaticParams() {
  try {
    const exchanges = await getAllExchangePages()
    return exchanges.map((e) => ({ slug: e.slug }))
  } catch {
    return []
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  try {
    const page = await getExchangePage(slug)
    if (!page) return { title: 'Exchange | SteinbergValentino Group' }
    return {
      title: page.meta_title ?? `${page.exchange_name} Listing Support | SteinbergValentino Group`,
      description:
        page.meta_description ??
        page.hero_subheading ??
        `SteinbergValentino Group supports companies listing on ${page.exchange_name}.`,
    }
  } catch {
    return { title: 'Exchange | SteinbergValentino Group' }
  }
}

const EXCHANGE_FEATURES = {
  'nasdaq-small-cap': {
    flag: '🇺🇸',
    country: 'United States',
    facts: [
      'Min $5M stockholders equity',
      'Listing fee from $55,000',
      'Real-time market data',
      'SEC reporting required',
    ],
  },
  'otc-markets': {
    flag: '🇺🇸',
    country: 'United States',
    facts: [
      '3 tiers: OTCQX, OTCQB, Pink',
      'Lower listing requirements',
      'No minimum market cap',
      'OTC Disclosure required',
    ],
  },
  'canadian-tsx': {
    flag: '🇨🇦',
    country: 'Canada',
    facts: [
      'Min $4M stockholders equity',
      'Listing fee from C$10,000',
      'Mining & tech focus',
      'SEDAR+ reporting',
    ],
  },
  'canadian-cse': {
    flag: '🇨🇦',
    country: 'Canada',
    facts: [
      "Streamlined for growth co's",
      'Lower compliance cost',
      'Cannabis sector strength',
      'SEDAR+ reporting',
    ],
  },
  'german-frankfurt': {
    flag: '🇩🇪',
    country: 'Germany',
    facts: [
      'Access to European capital',
      'EUR denomination option',
      'No minimum market cap',
      'Prospectus required',
    ],
  },
}

export default async function ExchangeDetailPage({ params }: Props) {
  const { slug } = await params

  let page = null
  const scrapedPage = getScrapedExchangeContent(slug)
  try {
    page = await getExchangePage(slug)
  } catch {
    /* offline */
  }

  if (!page && !scrapedPage) notFound()
  const exchangeInfo = EXCHANGE_FEATURES[slug as keyof typeof EXCHANGE_FEATURES]

  const resolvedPage = page
    ? {
        hero_heading: page.hero_heading,
        hero_subheading: page.hero_subheading,
        hero_image: page.hero_image,
        body_content: page.body_content,
        sections: page.sections,
        exchange_name: page.exchange_name,
        country: page.country,
      }
    : {
        hero_heading: scrapedPage!.heroHeading,
        hero_subheading: scrapedPage!.heroSubheading,
        hero_image: null,
        body_content: scrapedPage!.bodyContent,
        sections: scrapedPage!.sections,
        exchange_name: scrapedPage!.heroHeading,
        country: exchangeInfo?.country ?? '',
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
            alt={resolvedPage.hero_image.alternativeText ?? resolvedPage.exchange_name}
            fill
            sizes="100vw"
            priority
            style={{ objectFit: 'cover' }}
          />
        ) : (
          <Image
            src="/fallbacks/hero-market.webp"
            alt={resolvedPage.exchange_name}
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
            <Link href="/services/market-entry" className="sv-breadcrumb-link">Market Entry</Link>
            <span style={{ color: 'rgba(255,255,255,0.22)', fontSize: '0.7rem' }}>›</span>
            <span className="sv-breadcrumb-current">{exchangeInfo?.flag ?? ''} {resolvedPage.exchange_name}</span>
          </nav>

          <p className="sv-eyebrow" style={{ color: 'var(--color-sv-gold)', marginBottom: 'var(--sv-sp-16)' }}>
            Exchange Support
          </p>
          <h1
            className="sv-display"
            style={{ color: 'var(--color-sv-white)', maxWidth: '720px', marginBottom: 'var(--sv-sp-24)' }}
          >
            {resolvedPage.hero_heading}
          </h1>
          {resolvedPage.hero_subheading && (
            <p style={{ fontSize: '1.0625rem', color: 'rgba(255,255,255,0.72)', lineHeight: 1.72, maxWidth: '560px', fontWeight: 300 }}>
              {resolvedPage.hero_subheading}
            </p>
          )}
        </div>
      </section>

      {/* ── Exchange Overview ─────────────────────────────────────────────── */}
      <section className="sv-section">
        <div className="sv-container">
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '2fr 1fr',
              gap: 'var(--sv-sp-80)',
              alignItems: 'start',
            }}
            className="exchange-body-grid"
          >
            {/* Main content */}
            <div>
              {resolvedPage.body_content && resolvedPage.body_content.length > 0 ? (
                <BlocksContent blocks={resolvedPage.body_content} />
              ) : (
                <>
                  <p className="sv-eyebrow" style={{ marginBottom: 'var(--sv-sp-24)' }}>
                    About This Exchange
                  </p>
                  <p
                    style={{
                      fontFamily: 'var(--font-serif)',
                      fontWeight: 400,
                      fontSize: 'clamp(1.5rem, 2.5vw, 2rem)',
                      lineHeight: 1.25,
                      marginBottom: 'var(--sv-sp-24)',
                    }}
                  >
                    Listing on {resolvedPage.exchange_name}
                  </p>
                  <p
                    style={{
                      fontSize: '1.0625rem',
                      color: 'var(--color-sv-slate)',
                      lineHeight: 1.7,
                      marginBottom: 'var(--sv-sp-24)',
                    }}
                  >
                    SteinbergValentino Group provides end-to-end support for companies seeking to
                    list or maintain their listing on {resolvedPage.exchange_name}. Our team guides you
                    through every stage — from pre-listing preparation and compliance to
                    post-listing investor relations.
                  </p>
                  <p
                    style={{
                      fontSize: '1.0625rem',
                      color: 'var(--color-sv-slate)',
                      lineHeight: 1.7,
                    }}
                  >
                    With deep knowledge of {exchangeInfo?.country ?? resolvedPage.country} capital markets
                    regulations and extensive relationships with market participants, we give your
                    listing the best possible foundation for long-term success.
                  </p>
                </>
              )}
            </div>

            {/* Sidebar: exchange info */}
            <aside>
              <div
                style={{
                  background: 'var(--color-sv-dark)',
                  padding: 'var(--sv-sp-32)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 'var(--sv-sp-24)',
                  position: 'sticky',
                  top: 'calc(var(--sv-nav-h) + 2rem)',
                }}
              >
                <div>
                  <span style={{ fontSize: '2.5rem' }}>{exchangeInfo?.flag ?? '🏛️'}</span>
                  <h3
                    style={{
                      fontFamily: 'var(--font-serif)',
                      fontWeight: 400,
                      fontSize: '1.25rem',
                      color: 'var(--color-sv-white)',
                      marginTop: '0.75rem',
                    }}
                  >
                    {resolvedPage.exchange_name}
                  </h3>
                  <p style={{ fontSize: '0.875rem', color: 'var(--color-sv-gray)' }}>
                    {resolvedPage.country || exchangeInfo?.country}
                  </p>
                </div>

                {exchangeInfo?.facts && (
                  <div
                    style={{
                      borderTop: '1px solid rgba(255,255,255,0.1)',
                      paddingTop: 'var(--sv-sp-20)',
                    }}
                  >
                    <p
                      className="sv-eyebrow"
                      style={{ color: 'var(--color-sv-gold)', marginBottom: 'var(--sv-sp-16)' }}
                    >
                      Key Facts
                    </p>
                    <ul
                      style={{
                        listStyle: 'none',
                        padding: 0,
                        margin: 0,
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '0.625rem',
                      }}
                    >
                      {exchangeInfo.facts.map((fact) => (
                        <li
                          key={fact}
                          style={{
                            display: 'flex',
                            alignItems: 'flex-start',
                            gap: '0.625rem',
                            fontSize: '0.875rem',
                            color: 'var(--color-sv-gray)',
                            lineHeight: 1.5,
                          }}
                        >
                          <span
                            style={{
                              flexShrink: 0,
                              color: 'var(--color-sv-gold)',
                              marginTop: '0.125rem',
                            }}
                          >
                            —
                          </span>
                          {fact}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                <div
                  style={{
                    borderTop: '1px solid rgba(255,255,255,0.1)',
                    paddingTop: 'var(--sv-sp-20)',
                  }}
                >
                  <Link
                    href="/contact"
                    className="sv-btn sv-btn-gold"
                    style={{ width: '100%', justifyContent: 'center' }}
                  >
                    Discuss Your Listing
                  </Link>
                </div>
              </div>
            </aside>
          </div>
        </div>
        <style>{`@media (max-width: 1024px) { .exchange-body-grid { grid-template-columns: 1fr !important; } }`}</style>
      </section>

      {/* ── Content Sections from Strapi ──────────────────────────────────── */}
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
              className="exc-section-grid"
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
          <style>{`@media (max-width: 1024px) { .exc-section-grid { grid-template-columns: 1fr !important; } }`}</style>
        </section>
      ))}

    </>
  )
}
