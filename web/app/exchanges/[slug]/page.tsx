import { SafeImage as Image } from '@/components/safe-image'
import Link from 'next/link'
import type { Metadata } from 'next'
import { getAllExchangePages, getExchangePage, getStrapiMedia } from '@/lib/strapi'
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

/* ── Per-exchange configuration ─────────────────────────────────────────── */
const EXCHANGE_CONFIG: Record<string, {
  flag: string
  country: string
  market_tag: string
  hero_image: string
}> = {
  'nasdaq-small-cap': {
    flag: '🇺🇸',
    country: 'United States',
    market_tag: 'US Equity Market',
    hero_image: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=1600&auto=format&fit=crop&q=80',
  },
  'otc-markets': {
    flag: '🇺🇸',
    country: 'United States',
    market_tag: 'OTC Marketplace',
    hero_image: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=1600&auto=format&fit=crop&q=80',
  },
  'canadian-tsx': {
    flag: '🇨🇦',
    country: 'Canada',
    market_tag: 'Toronto Stock Exchange',
    hero_image: 'https://images.unsplash.com/photo-1517935706615-2717063c2225?w=1600&auto=format&fit=crop&q=80',
  },
  'canadian-cse': {
    flag: '🇨🇦',
    country: 'Canada',
    market_tag: 'Canadian Securities Exchange',
    hero_image: 'https://images.unsplash.com/photo-1569406125624-98ee19b01d4a?w=1600&auto=format&fit=crop&q=80',
  },
  'german-frankfurt': {
    flag: '🇩🇪',
    country: 'Germany',
    market_tag: 'Frankfurt Stock Exchange',
    hero_image: 'https://images.unsplash.com/photo-1467269204594-9661b134dd2b?w=1600&auto=format&fit=crop&q=80',
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

  const cfg = EXCHANGE_CONFIG[slug as keyof typeof EXCHANGE_CONFIG]

  /* key_facts and faq_items come from Strapi only */
  const keyFacts: string[] = page?.key_facts?.length ? page.key_facts : []
  const faqItems = page?.faq_items ?? []

  const resolvedPage = page
    ? {
        hero_heading:    page.hero_heading,
        hero_subheading: page.hero_subheading,
        hero_image:      page.hero_image,
        body_content:    page.body_content,
        sections:        page.sections,
        exchange_name:   page.exchange_name,
        country:         page.country,
      }
    : {
        hero_heading:    scrapedPage!.heroHeading,
        hero_subheading: scrapedPage!.heroSubheading,
        hero_image:      null,
        body_content:    scrapedPage!.bodyContent,
        sections:        scrapedPage!.sections,
        exchange_name:   scrapedPage!.heroHeading,
        country:         cfg?.country ?? '',
      }

  /* Hero background: prefer Strapi hero_image, then config fallback, then static banner */
  const strapiHeroImg = resolvedPage.hero_image
  const heroImgSrc = strapiHeroImg
    ? (getStrapiMedia(strapiHeroImg.url) ?? strapiHeroImg.url)
    : (cfg?.hero_image ?? '/exchange-banner.webp')

  return (
    <>
      {/* ── Premium Full-Bleed Image Hero ─────────────────────────────────── */}
      <section className="exc2-hero">
        {/* Background image */}
        <div className="exc2-hero__bg" aria-hidden="true">
          <Image
            src={heroImgSrc}
            alt=""
            width={strapiHeroImg?.width || 1600}
            height={strapiHeroImg?.height || 900}
            priority
            sizes="100vw"
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
          <div className="exc2-hero__overlay" />
        </div>

        {/* Main content */}
        <div className="exc2-hero__content">
          <div className="sv-container">
            {/* Breadcrumb */}
            <nav className="exc2-hero__breadcrumb sv-breadcrumb">
              <Link href="/services/market-entry" className="sv-breadcrumb-link">Market Entry</Link>
              <span style={{ color: 'rgba(255,255,255,0.22)', fontSize: '0.7rem' }}>›</span>
              <span className="sv-breadcrumb-current">
                {cfg?.flag ?? ''} {resolvedPage.exchange_name}
              </span>
            </nav>

            {/* Flag + market tag */}
            <div className="exc2-hero__meta">
              {cfg?.flag && (
                <span className="exc2-hero__flag" aria-hidden="true">{cfg.flag}</span>
              )}
              {cfg?.market_tag && (
                <span className="exc2-hero__market-tag">{cfg.market_tag}</span>
              )}
            </div>

            <p className="sv-eyebrow exc2-hero__eyebrow">Exchange Support</p>
            <h1 className="exc2-hero__title">{resolvedPage.hero_heading}</h1>
            {resolvedPage.hero_subheading && (
              <p className="exc2-hero__deck">{resolvedPage.hero_subheading}</p>
            )}
          </div>
        </div>

      </section>

      {/* ── Exchange Body ─────────────────────────────────────────────────── */}
      <section className="exc2-body">
        <div className="sv-container">
          <div className="exc2-body__grid">
            {/* Main content */}
            <div>
              {resolvedPage.body_content && resolvedPage.body_content.length > 0 && (
                <BlocksContent blocks={resolvedPage.body_content} className="exc2-prose" />
              )}
            </div>

            {/* Sidebar */}
            <aside className="exc2-sidebar">
              <div className="exc2-sidebar__card">
                <span style={{ fontSize: '2rem' }} aria-hidden="true">
                  {cfg?.flag ?? '🏛️'}
                </span>
                <h3 className="exc2-sidebar__exchange-name">{resolvedPage.exchange_name}</h3>
                <p className="exc2-sidebar__country">
                  {resolvedPage.country || cfg?.country}
                </p>

                {keyFacts.length > 0 && (
                  <>
                    <hr className="exc2-sidebar__divider" />
                    <p className="sv-eyebrow" style={{ color: 'var(--color-sv-gold)', marginBottom: '1rem', fontSize: '0.7rem', letterSpacing: '0.14em' }}>
                      Key Facts
                    </p>
                    <ul className="exc2-sidebar__facts">
                      {keyFacts.map((fact) => (
                        <li key={fact} className="exc2-sidebar__fact">
                          <span className="exc2-sidebar__fact-bullet">—</span>
                          <span className="exc2-sidebar__fact-text">{fact}</span>
                        </li>
                      ))}
                    </ul>
                  </>
                )}

                <hr className="exc2-sidebar__divider" />
                <Link href="/contact" className="exc2-sidebar__cta">
                  Discuss Your Listing
                </Link>
              </div>
            </aside>
          </div>
        </div>
      </section>

      {/* ── Content Sections from Strapi ──────────────────────────────────── */}
      {resolvedPage.sections?.map((section, i) => {
        const imgSrc = section.image
          ? getStrapiMedia(section.image.url) ?? section.image.url
          : null
        const isDark = i % 2 === 1

        return (
          <section
            key={section.id}
            className="exc2-section"
            style={{ background: isDark ? 'var(--color-sv-dark)' : 'var(--color-sv-white)' }}
          >
            <div className="sv-container">
              {imgSrc ? (
                <div className="exc2-section__grid">
                  <div>
                    {section.heading && (
                      <h2 className={`exc2-section__heading${isDark ? ' exc2-section__heading--light' : ''}`}>
                        {section.heading}
                      </h2>
                    )}
                    {section.subheading && (
                      <p className="exc2-section__sub">{section.subheading}</p>
                    )}
                    {section.body && (
                      <BlocksContent blocks={section.body} className="exc2-prose" />
                    )}
                  </div>
                  <div className="exc2-section__img-wrap">
                    <Image
                      src={imgSrc}
                      alt={section.image!.alternativeText ?? section.heading ?? ''}
                      width={section.image!.width || 800}
                      height={section.image!.height || 600}
                      sizes="(max-width: 1024px) 100vw, 50vw"
                    />
                  </div>
                </div>
              ) : (
                <div style={{ maxWidth: '760px' }}>
                  {section.heading && (
                    <h2 className={`exc2-section__heading${isDark ? ' exc2-section__heading--light' : ''}`}>
                      {section.heading}
                    </h2>
                  )}
                  {section.subheading && (
                    <p className="exc2-section__sub">{section.subheading}</p>
                  )}
                  {section.body && (
                    <BlocksContent blocks={section.body} className="exc2-prose" />
                  )}
                </div>
              )}
            </div>
          </section>
        )
      })}

      {/* ── FAQ ──────────────────────────────────────────────────────────── */}
      {faqItems.length > 0 && (
        <section className="exc2-faq">
          <div className="sv-container">
            <div className="exc2-faq__head">
              <p className="sv-eyebrow exc2-faq__eyebrow">FAQ</p>
              <h2 className="exc2-faq__title">Frequently Asked Questions</h2>
            </div>
            <div className="svc-faq-list">
              {faqItems.map((faq) => (
                <details key={faq.id} className="svc-faq-item">
                  <summary>
                    {faq.question}
                    <span className="svc-faq-item__toggle">+</span>
                  </summary>
                  <div className="svc-faq-item__answer">
                    <BlocksContent blocks={faq.answer} />
                  </div>
                </details>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── CTA ──────────────────────────────────────────────────────────── */}
      <section className="exc2-cta">
        <div className="sv-container">
          <div className="exc2-cta__inner">
            <div>
              <p className="sv-eyebrow exc2-cta__eyebrow">Ready to List?</p>
              <h2 className="exc2-cta__heading">
                Let us guide your {resolvedPage.exchange_name} listing journey.
              </h2>
            </div>
            <Link href="/contact" className="sv-btn sv-btn-gold">
              Contact the Firm
            </Link>
          </div>
        </div>
      </section>
    </>
  )
}
