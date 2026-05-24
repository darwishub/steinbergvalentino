import Image from 'next/image'
import Link from 'next/link'
import {
  getHomepage,
  getAllServicePages,
  getAllExchangePages,
  getGlobalSettings,
  getStrapiMedia,
} from '@/lib/strapi'
import { BlocksContent } from '@/components/blocks-content'
import { PromoCarousel } from '@/components/promo-carousel'
import { TestimonialSlider } from '@/components/testimonial-slider'
import { DEFAULT_GLOBAL_SETTINGS } from '@/lib/defaults'
import type { ServicePage, ExchangePage } from '@/lib/types'

export const revalidate = 3600

/* ─── Minimal structural fallbacks (UI cannot be empty) ─────────────────── */
// Testimonials: real client quotes, kept as static fallback when Strapi offline
const FALLBACK_TESTIMONIALS = [
  {
    id: 1,
    name: 'Abraham Mirman',
    quote:
      "My company is a new player in the stock market, so I've been having trouble getting investors interested in my company. I needed to find a way to promote my stock so I can improve its value, which is why I got a hold of SV Group. Through a series of aggressive campaigns, I've been able to get my stock value up even higher than I expected, and it looks like it will continue in the months ahead. I'm very satisfied with what they've done, and I look forward to a bright future.",
  },
  {
    id: 2,
    name: 'Paul Tavis McKenzie',
    quote:
      "After taking my company public, it was a challenge to get investors aware of what we have to offer, but I needed to increase the value of my stock so I could move forward. That was when I got in touch with SV Group. My exposure in the market has increased, and I've been seeing my stock value go up higher than I expected. I feel confident that my company will become a major player in my industry, and I believe I could eventually move into major exchanges.",
  },
  {
    id: 3,
    name: 'Yat Man Lai',
    quote:
      "I just went public earlier this year, and I've been having trouble getting investors interested in my stock. I've heard about investor awareness companies like SV Group, so I decided to get some more information about what they could do for me. After an extended conversation with someone at their office, I decided to give them a try. Their campaigns have been extremely helpful in getting me more market exposure, and my stock's value has gone up more than I expected.",
  },
  {
    id: 4,
    name: 'Susanne Wilke',
    quote:
      "I felt like it was time for me to take my company public because I needed to raise more capital so I can expand my business, but it was hard to get market liquidity up so I can raise the value of my stock. I heard about how investor awareness companies like SV Group can help new public companies get more exposure on the market, so I decided reach out to them. So far, I've been happy with what they've done, and I've been able to increase the value of my stock.",
  },
  {
    id: 5,
    name: 'Mark Munro',
    quote:
      "I just filed my IPO this year, so I don't have the market exposure of many of my larger competitors. I needed to improve market liquidity so I could have more value on the market, which is why I went to SV Group. Their campaigns have brought more investors to my stock, and I have been able to raise the capital I need to expand my business. Now the value of my stock has more than doubled, and I expect it to go higher by the end of the fiscal year.",
  },
]

// Contact info: business data that rarely changes — from Strapi or DEFAULT_GLOBAL_SETTINGS
const FALLBACK_EMAIL = DEFAULT_GLOBAL_SETTINGS.contact_email!
const FALLBACK_PHONE = DEFAULT_GLOBAL_SETTINGS.contact_phone!

// Services: used only when Strapi services collection is empty/offline
const FALLBACK_SERVICES = DEFAULT_GLOBAL_SETTINGS.footer_service_links!.slice(0, 6).map((l) => ({
  slug: l.href.replace('/services/', ''),
  title: l.label,
}))

function splitEditorialHeading(heading: string) {
  const words = heading.trim().split(/\s+/).filter(Boolean)

  if (words.length <= 4) return [heading]
  if (words.length <= 7) {
    const midpoint = Math.ceil(words.length / 2)
    return [words.slice(0, midpoint).join(' '), words.slice(midpoint).join(' ')]
  }

  const firstBreak = Math.ceil(words.length * 0.4)
  const secondBreak = Math.ceil(words.length * 0.7)

  return [
    words.slice(0, firstBreak).join(' '),
    words.slice(firstBreak, secondBreak).join(' '),
    words.slice(secondBreak).join(' '),
  ]
}

/* ─── Circle-arrow SVG (reused in several places) ───────────────────────── */
function CircleArrow({ size = 36 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <circle cx="20" cy="20" r="19.25" stroke="currentColor" strokeWidth="1.5" />
      <path d="M17 14l6 6-6 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

export default async function HomePage() {
  let page = null
  let services: ServicePage[] = []
  let exchanges: ExchangePage[] = []
  let globalSettings = null

  try {
    ;[page, services, exchanges] = await Promise.all([
      getHomepage(),
      getAllServicePages(),
      getAllExchangePages(),
    ])
  } catch {
    /* Strapi offline — render with fallbacks */
  }

  /* Global settings: separate fetch for the same reason */
  globalSettings = await getGlobalSettings().catch(() => null)

  /* Convenience shorthands */
  const sections = page?.sections ?? []
  const hs = page?.homepage_sections
  const testimonials = page?.testimonials?.length ? page.testimonials : FALLBACK_TESTIMONIALS

  /* Services: first 8 for features grid (8 cards fills 3×3 with first card span-2), first 5 for The Firm dark card */
  const featuredServices = services.slice(0, 8)
  const firmServices = services.length > 0 ? services.slice(0, 5) : FALLBACK_SERVICES

  /* Contact: prefer Strapi global settings, fall back to defaults */
  const contactEmail = globalSettings?.contact_email ?? FALLBACK_EMAIL
  const contactPhone = globalSettings?.contact_phone ?? FALLBACK_PHONE
  const ctaServices = services.length > 0 ? services.slice(0, 6) : FALLBACK_SERVICES
  const heroHeading = page?.hero_heading ?? 'Strategic investor relations for public companies'
  const heroLines = splitEditorialHeading(heroHeading)

  /* First carousel image — preload for LCP improvement on mobile */
  const firstSlideUrl = hs?.carousel_slides?.[0]?.image_url
    ?? 'https://images.unsplash.com/photo-1486325212027-8081e485255e?w=960&q=80&auto=format&fit=crop'

  return (
    <>
      {/* Preload first carousel image — the LCP element on mobile */}
      <link
        rel="preload"
        as="image"
        href={firstSlideUrl}
        imageSrcSet={
          firstSlideUrl.includes('unsplash.com')
            ? [
                `${firstSlideUrl.replace(/[?&]w=\d+/, '')}?w=640&q=75&auto=format&fit=crop 640w`,
                `${firstSlideUrl.replace(/[?&]w=\d+/, '')}?w=960&q=80&auto=format&fit=crop 960w`,
                `${firstSlideUrl.replace(/[?&]w=\d+/, '')}?w=1200&q=80&auto=format&fit=crop 1200w`,
              ].join(', ')
            : undefined
        }
        imageSizes="100vw"
      />

      {/* ══════════════════════════════════════════════════════════════════════
          1 · PROMO HEADER — dark text block (Blackstone bx-promo-header style)
      ══════════════════════════════════════════════════════════════════════ */}
      <section className="sv-promo-header">
        <div className="sv-container sv-promo-header__inner">
          <div className="sv-promo-header__col-headline">
            {page?.hero_eyebrow && (
              <div className="sv-promo-header__eyebrow-row">
                <span className="sv-promo-header__eyebrow-rule" aria-hidden="true" />
                <p className="sv-promo-header__eyebrow">{page.hero_eyebrow}</p>
              </div>
            )}
            <h1 className="sv-promo-header__heading">
              <span className="sv-promo-header__line sv-promo-header__line--lg">
                {heroHeading}
              </span>
              <span className="sv-promo-header__line sv-promo-header__line--brand">
                Steinberg<span className="sv-promo-header__gold">Valentino</span>
              </span>
            </h1>
          </div>
          <div className="sv-promo-header__col-body">
            {page?.hero_subheading && (
              <p className="sv-promo-header__desc">{page.hero_subheading}</p>
            )}
            <div className="sv-promo-header__ctas">
              {(page?.hero_cta_primary_label || page?.hero_cta_primary_url) && (
                <Link
                  href={page.hero_cta_primary_url ?? '/about'}
                  className="sv-promo-header__cta"
                >
                  {page.hero_cta_primary_label ?? 'About the Firm'}
                </Link>
              )}
              {(page?.hero_cta_secondary_label || page?.hero_cta_secondary_url) && (
                <Link
                  href={page.hero_cta_secondary_url ?? '/contact'}
                  className="sv-promo-header__cta sv-promo-header__cta--ghost"
                >
                  {page.hero_cta_secondary_label ?? 'Contact Us'}
                </Link>
              )}
            </div>
          </div>
        </div>

        {/* Keyword band — from Strapi homepage.keyword_band */}
        {page?.keyword_band && page.keyword_band.length > 0 && (
          <div className="hp-hero__kw-band">
            <div className="hp-hero__kw-inner">
              {(page.keyword_band as string[]).map((kw: string, i: number) => (
                <span key={kw} className="hp-hero__kw-group">
                  <span className="hp-hero__kw">{kw}</span>
                  {i < (page.keyword_band as string[]).length - 1 && (
                    <span className="hp-hero__kw-sep" aria-hidden="true">◆</span>
                  )}
                </span>
              ))}
            </div>
          </div>
        )}
      </section>

      {/* ══════════════════════════════════════════════════════════════════════
          2 · PROMO CAROUSEL — full-width image slider
      ══════════════════════════════════════════════════════════════════════ */}
      <PromoCarousel slides={hs?.carousel_slides} />

      {/* ══════════════════════════════════════════════════════════════════════
          2b · WHY CHOOSE SV — white section, centered top + two-col body
      ══════════════════════════════════════════════════════════════════════ */}
      <section className="sv-why">
        <div className="sv-container sv-why__top">
          <span className="sv-why__rule" aria-hidden="true" />
          {hs?.offerings_eyebrow && (
            <p className="sv-why__eyebrow">{hs.offerings_eyebrow}</p>
          )}
          {hs?.offerings_title && (
            <h2 className="sv-why__heading">{hs.offerings_title}</h2>
          )}
        </div>

        <div className="sv-container sv-why__body">
          {/* Left col: subheading + body from Strapi */}
          <div className="sv-why__col-left">
            {hs?.offerings_subheading && (
              <h3 className="sv-why__subheading">{hs.offerings_subheading}</h3>
            )}
            {hs?.offerings_body && (
              <p className="sv-why__text">{hs.offerings_body}</p>
            )}
            <Link
              href={hs?.offerings_cta_url ?? '/about'}
              className="sv-why__cta"
            >
              {hs?.offerings_cta_label ?? 'About SV Group'}
              <CircleArrow />
            </Link>
          </div>

          {/* Right col: stat from Strapi */}
          <div className="sv-why__col-right">
            {hs?.offerings_stat_value && (
              <p className="sv-why__stat">{hs.offerings_stat_value}</p>
            )}
            {hs?.offerings_stat_label && (
              <p className="sv-why__stat-label">{hs.offerings_stat_label}</p>
            )}
            {hs?.offerings_stat_note && (
              <p className="sv-why__stat-note">{hs.offerings_stat_note}</p>
            )}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════════
          3 · THE FIRM — dark, two-col: serif left / service list dark card right
      ══════════════════════════════════════════════════════════════════════ */}
      <section className="hp-about sv-bg-dark">
        <div className="sv-container hp-about__inner">

          {/* ── Left ─────────────────────────────────────────────────────── */}
          <div className="hp-about__col-left">
            <div className="hp-about__eyebrow-row">
              {hs?.capital_markets_eyebrow && (
                <p className="sv-eyebrow hp-about__eyebrow">{hs.capital_markets_eyebrow}</p>
              )}
              <span className="hp-about__eyebrow-line" aria-hidden="true" />
            </div>

            {(sections[0]?.heading || hs?.capital_markets_title) && (
              <h2 className="sv-display hp-about__headline">
                {sections[0]?.heading ?? hs?.capital_markets_title}
              </h2>
            )}

            {sections[0]?.body ? (
              <div className="sv-rich-text hp-about__body-text">
                <BlocksContent blocks={sections[0].body} />
              </div>
            ) : hs?.capital_markets_body ? (
              <p className="hp-about__body-text">{hs.capital_markets_body}</p>
            ) : null}

            <Link
              href={hs?.capital_markets_cta_url ?? '/about'}
              className="hp-about__cta-arrow"
            >
              {hs?.capital_markets_cta_label ?? 'Learn More'}
              <CircleArrow />
            </Link>
          </div>

          {/* ── Right: service list pulled from Strapi (not hardcoded) ──── */}
          <div className="hp-about__col-right">
            <div className="hp-about__card">
              {firmServices.map((svc) => (
                <Link
                  key={svc.slug}
                  href={`/services/${svc.slug}`}
                  className="hp-about__card-item"
                >
                  <span className="hp-about__card-label">{svc.title}</span>
                  <span className="hp-about__card-arrow" aria-hidden="true">
                    <CircleArrow size={32} />
                  </span>
                </Link>
              ))}
            </div>
          </div>

        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════════
          4 · SERVICES — clean grid from Strapi service-pages collection
      ══════════════════════════════════════════════════════════════════════ */}
      {featuredServices.length > 0 && (
        <section className="hp-services sv-section">
          <div className="sv-container">
            <div className="hp-services__header">
              <div>
                {hs?.featured_services_eyebrow && (
                  <p className="sv-eyebrow hp-services__eyebrow">{hs.featured_services_eyebrow}</p>
                )}
                {hs?.featured_services_title && (
                  <h2 className="sv-display hp-services__headline">{hs.featured_services_title}</h2>
                )}
              </div>
              <Link
                href={hs?.featured_services_cta_url ?? '/capabilities'}
                className="sv-link-arrow hp-services__all-link"
              >
                {hs?.featured_services_cta_label ?? 'All Capabilities'}
              </Link>
            </div>

            <div className="hp-services__grid">
              {featuredServices.map((svc, i) => (
                <Link
                  key={svc.slug}
                  href={`/services/${svc.slug}`}
                  className="hp-svc-card"
                >
                  <span className="hp-svc-card__index" aria-hidden="true">
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <span className="hp-svc-card__rule" />
                  <h3 className="hp-svc-card__title">{svc.title}</h3>
                  {svc.hero_subheading && (
                    <p className="hp-svc-card__desc">
                      {svc.hero_subheading.length > 100
                        ? svc.hero_subheading.slice(0, 100) + '…'
                        : svc.hero_subheading}
                    </p>
                  )}
                  <span className="hp-svc-card__cta">
                    <CircleArrow size={30} />
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ══════════════════════════════════════════════════════════════════════
          5 · FEATURE HIGHLIGHTS — additional content sections from Strapi
      ══════════════════════════════════════════════════════════════════════ */}
      {sections.length > 1 && (
        <section className="hp-features sv-section" style={{ backgroundColor: '#0c0d10' }}>
          <div className="sv-container">
            {(hs?.features_eyebrow || hs?.features_title) && (
              <div className="hp-features__header">
                {hs.features_eyebrow && (
                  <p className="sv-eyebrow hp-features__eyebrow">{hs.features_eyebrow}</p>
                )}
                {hs.features_title && (
                  <h2 className="sv-display hp-features__headline">{hs.features_title}</h2>
                )}
              </div>
            )}

            <div className="hp-features__grid">
              {sections.slice(1, 4).map((section, i) => (
                <div key={section.id ?? i} className="hp-feat-card">
                  <p className="hp-feat-card__num">0{i + 1}</p>
                  {section.heading && (
                    <h3 className="hp-feat-card__title">{section.heading}</h3>
                  )}
                  {section.subheading && (
                    <p className="hp-feat-card__sub">{section.subheading}</p>
                  )}
                  {section.body && (
                    <div className="sv-rich-text hp-feat-card__body">
                      <BlocksContent blocks={section.body} />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ══════════════════════════════════════════════════════════════════════
          6 · EXCHANGES — from Strapi exchange-pages collection
      ══════════════════════════════════════════════════════════════════════ */}
      {exchanges.length > 0 && (
        <section className="hp-exchanges sv-bg-dark">
          <div className="sv-container">
            <div className="hp-exchanges__header">
              <div>
                {hs?.exchanges_eyebrow && (
                  <p className="sv-eyebrow hp-exchanges__eyebrow">{hs.exchanges_eyebrow}</p>
                )}
                {hs?.exchanges_title && (
                  <h2 className="sv-display hp-exchanges__headline">{hs.exchanges_title}</h2>
                )}
              </div>
              {(hs?.exchanges_cta_label || hs?.exchanges_cta_url) && (
                <Link
                  href={hs?.exchanges_cta_url ?? '/services/market-entry'}
                  className="sv-link-arrow sv-link-arrow-white"
                >
                  {hs?.exchanges_cta_label ?? 'Market Entry Services'}
                </Link>
              )}
            </div>

            <div className="hp-exchanges__grid">
              {exchanges.map((ex, index) => (
                <Link key={ex.slug} href={`/exchanges/${ex.slug}`} className="hp-exchange-item">
                  <span className="hp-exchange-item__index">
                    {String(index + 1).padStart(2, '0')}
                  </span>
                  <span className="hp-exchange-item__name">{ex.exchange_name}</span>
                  <span className="hp-exchange-item__country">{ex.country}</span>
                  <span className="hp-exchange-item__link">
                    {hs?.exchanges_item_link_label ?? 'View details →'}
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}


      {/* ══════════════════════════════════════════════════════════════════════
          7 · TESTIMONIALS — premium dark slider, data from Strapi
      ══════════════════════════════════════════════════════════════════════ */}
      <TestimonialSlider testimonials={testimonials} />

      {/* ══════════════════════════════════════════════════════════════════════
          8 · CONTACT CTA — all text + links from Strapi homepage_sections
      ══════════════════════════════════════════════════════════════════════ */}
      <section className="hp-cta">
        <div className="sv-container hp-cta__inner">
          {/* Left */}
          <div className="hp-cta__col-left">
            {hs?.contact_eyebrow && (
              <p className="sv-eyebrow hp-cta__eyebrow">{hs.contact_eyebrow}</p>
            )}
            {hs?.contact_title && (
              <h2 className="sv-display hp-cta__headline">{hs.contact_title}</h2>
            )}
            {hs?.contact_body && (
              <p className="hp-cta__body">{hs.contact_body}</p>
            )}
            <div className="hp-cta__actions">
              {(hs?.contact_cta_label || hs?.contact_cta_url) && (
                <Link
                  href={hs?.contact_cta_url ?? '/contact'}
                  className="sv-btn sv-btn-outline-white"
                >
                  {hs?.contact_cta_label ?? 'Contact Us'}
                </Link>
              )}
              {(hs?.contact_secondary_cta_label || hs?.contact_secondary_cta_url) && (
                <Link
                  href={hs?.contact_secondary_cta_url ?? '/how-it-works'}
                  className="sv-link-arrow sv-link-arrow-white"
                >
                  {hs?.contact_secondary_cta_label ?? 'How It Works'}
                </Link>
              )}
            </div>
          </div>

          {/* Right — contact details (Strapi global settings) + service links */}
          <div className="hp-cta__col-right">
            <div className="hp-cta__contact-block">
              {hs?.contact_lead_label && (
                <p className="hp-cta__contact-label">{hs.contact_lead_label}</p>
              )}
              <a href={`mailto:${contactEmail}`} className="hp-cta__contact-link">
                {contactEmail}
              </a>
              <a
                href={`tel:${contactPhone.replace(/[^+\d]/g, '')}`}
                className="hp-cta__contact-link"
              >
                {contactPhone}
              </a>
            </div>

            <div className="hp-cta__svc-list">
              {hs?.contact_services_label && (
                <p className="hp-cta__svc-list-label">{hs.contact_services_label}</p>
              )}
              <ul className="hp-cta__svc-items">
                {ctaServices.map((svc) => (
                  <li key={svc.slug}>
                    <Link href={`/services/${svc.slug}`} className="hp-cta__svc-link">
                      <span className="hp-cta__svc-rule" />
                      {svc.title}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
