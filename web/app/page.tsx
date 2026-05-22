import { SafeImage as Image } from '@/components/safe-image'
import Link from 'next/link'
import { getHomepage, getAllServicePages, getAllExchangePages, getGlobalSettings, getStrapiMedia } from '@/lib/strapi'
import { BlocksContent } from '@/components/blocks-content'
import { HeroVideo } from '@/components/hero-video'
import type { ServicePage, ExchangePage } from '@/lib/types'

export const revalidate = 3600

/* ─── Hero video (set NEXT_PUBLIC_HERO_VIDEO_URL in Vercel/Railway env) ── */
const HERO_VIDEO_URL = process.env.NEXT_PUBLIC_HERO_VIDEO_URL ?? null

/* ─── Testimonials — real clients from old site ─────────────────────────── */
const TESTIMONIALS = [
  {
    name: 'Abraham Mirman',
    quote:
      "My company is a new player in the stock market, so I've been having trouble getting investors interested in my company. I needed to find a way to promote my stock so I can improve its value, which is why I got a hold of SV Group. Through a series of aggressive campaigns, I've been able to get my stock value up even higher than I expected, and it looks like it will continue in the months ahead. I'm very satisfied with what they've done, and I look forward to a bright future.",
  },
  {
    name: 'Paul Tavis McKenzie',
    quote:
      "After taking my company public, it was a challenge to get investors aware of what we have to offer, but I needed to increase the value of my stock so I could move forward. That was when I got in touch with SV Group. My exposure in the market has increased, and I've been seeing my stock value go up higher than I expected. I feel confident that my company will become a major player in my industry, and I believe I could eventually move into major exchanges.",
  },
  {
    name: 'Yat Man Lai',
    quote:
      "I just went public earlier this year, and I've been having trouble getting investors interested in my stock. I've heard about investor awareness companies like SV Group, so I decided to get some more information about what they could do for me. After an extended conversation with someone at their office, I decided to give them a try. Their campaigns have been extremely helpful in getting me more market exposure, and my stock's value has gone up more than I expected.",
  },
  {
    name: 'Susanne Wilke',
    quote:
      "I felt like it was time for me to take my company public because I needed to raise more capital so I can expand my business, but it was hard to get market liquidity up so I can raise the value of my stock. I heard about how investor awareness companies like SV Group can help new public companies get more exposure on the market, so I decided reach out to them. So far, I've been happy with what they've done, and I've been able to increase the value of my stock.",
  },
  {
    name: 'Mark Munro',
    quote:
      "I just filed my IPO this year, so I don't have the market exposure of many of my larger competitors. I needed to improve market liquidity so I could have more value on the market, which is why I went to SV Group. Their campaigns have brought more investors to my stock, and I have been able to raise the capital I need to expand my business. Now the value of my stock has more than doubled, and I expect it to go higher by the end of the fiscal year.",
  },
]

/* ─── Flag map ──────────────────────────────────────────────────────────── */
const COUNTRY_FLAG: Record<string, string> = {
  'United States': '🇺🇸',
  Canada: '🇨🇦',
  Germany: '🇩🇪',
  UK: '🇬🇧',
  Australia: '🇦🇺',
}
const exchangeFlag = (c: string) => COUNTRY_FLAG[c] ?? '🏛️'

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
    /* Strapi offline — render static shell */
  }

  /* Global settings fetched separately so a 404 doesn't kill the whole page */
  globalSettings = await getGlobalSettings().catch(() => null)

  const heroHeading =
    page?.hero_heading ?? 'We Make Retail Markets For Publicly Traded Small Cap Stocks'
  const heroSubheading =
    page?.hero_subheading ??
    'SteinbergValentino Group is a premier investor relations firm serving small and mid-cap public companies across the US, Canada, and international exchanges.'

  const ctaPrimary = {
    label: page?.hero_cta_primary_label ?? 'Our Capabilities',
    url: page?.hero_cta_primary_url ?? '/capabilities',
  }
  const ctaSecondary = {
    label: page?.hero_cta_secondary_label ?? 'How It Works',
    url: page?.hero_cta_secondary_url ?? '/how-it-works',
  }

  const heroBackground = page?.hero_background
  const heroBgUrl = getStrapiMedia(heroBackground?.url)
  const homepageHeroSrc = heroBgUrl ?? '/fallbacks/office-tower.webp'

  const sections = page?.sections ?? []

  /* Split services: first 6 for featured grid, rest for listing */
  const featuredServices = services.slice(0, 6)

  return (
    <>
      {/* ══════════════════════════════════════════════════════════════════════
          1 · HERO — full-bleed dark, large serif headline, stats bar
      ══════════════════════════════════════════════════════════════════════ */}
      <section className="hp-hero">
        {/* Background — poster image always loads instantly (LCP-safe) */}
        <Image
          src={homepageHeroSrc}
          alt="SteinbergValentino Group — Capital Markets"
          fill
          sizes="100vw"
          priority
          style={{ objectFit: 'cover', objectPosition: 'center 20%' }}
        />

        {/* Video overlaid on top — lazy-loads only after hero enters viewport */}
        {HERO_VIDEO_URL && (
          <HeroVideo src={HERO_VIDEO_URL} poster={homepageHeroSrc} />
        )}

        {/* Overlay */}
        <div className="hp-hero__overlay" />

        {/* Thin gold left rule */}
        <div className="hp-hero__gold-rule" />

        {/* Copy */}
        <div className="sv-container hp-hero__body">
          <div className="hp-hero__eyebrow-row">
            <span className="hp-hero__eyebrow-line" />
            <span className="sv-eyebrow hp-hero__eyebrow-text">
              Investor Relations · Capital Markets
            </span>
          </div>

          <h1 className="sv-hero-title hp-hero__title">{heroHeading}</h1>

          <p className="hp-hero__sub">{heroSubheading}</p>

          <div className="hp-hero__ctas">
            <Link href={ctaPrimary.url} className="sv-btn sv-btn-outline-white">
              {ctaPrimary.label}
            </Link>
            <Link href={ctaSecondary.url} className="hp-hero__cta-ghost">
              {ctaSecondary.label}
              <span className="hp-hero__cta-arrow">→</span>
            </Link>
          </div>
        </div>

        {/* ── Keyword band ──────────────────────────────────────────── */}
        <div className="hp-hero__kw-band" role="presentation" aria-hidden="true">
          <div className="sv-container hp-hero__kw-inner">
            {[
              'Investor Relations',
              'Capital Formation',
              'Exchange Listings',
              'Media & Communications',
              'Market Making',
            ].map((kw, i, arr) => (
              <span key={kw} className="hp-hero__kw-group">
                <span className="hp-hero__kw">{kw}</span>
                {i < arr.length - 1 && <span className="hp-hero__kw-sep">·</span>}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════════
          2 · ABOUT THE FIRM — dark, two-column (Blackstone "offerings" style)
      ══════════════════════════════════════════════════════════════════════ */}
      <section className="hp-about sv-bg-dark">
        <div className="sv-container hp-about__inner">
          {/* Left column */}
          <div className="hp-about__col-left">
            <p className="sv-eyebrow hp-about__eyebrow">The Firm</p>
            <h2 className="sv-display hp-about__headline">
              {sections[0]?.heading ?? 'SteinbergValentino Group — The Best IR Firm For Small & Mid-Cap Businesses'}
            </h2>

            {sections[0]?.body ? (
              <div className="sv-rich-text hp-about__body">
                <BlocksContent blocks={sections[0].body} />
              </div>
            ) : (
              <p className="hp-about__body-text">
                SteinbergValentino is a small-cap company&apos;s best choice in investor relations firms.
                SV Group goes above and beyond to serve its client companies with the best possible
                IR mediation along with an array of other equally fundamental services. SV Group is
                known worldwide not only for its supreme IR service but also for possessing diverse
                capabilities.
              </p>
            )}

            <Link href="/about" className="sv-btn sv-btn-outline-white hp-about__cta">
              About the Firm
            </Link>
          </div>

          {/* Right column — key credentials */}
          <div className="hp-about__col-right">
            <div className="hp-about__credentials">
              {[
                { label: 'Investor Relations Strategy', desc: 'Bespoke IR programs built for your sector and investor base' },
                { label: 'Capital Formation', desc: 'Structured financing advisory for growth and expansion rounds' },
                { label: 'Exchange Listings', desc: 'NASDAQ, OTC, TSX, CSE, Frankfurt — we know every market' },
                { label: 'Media & Communications', desc: 'Strategic press relations across financial and trade media' },
              ].map((item) => (
                <div key={item.label} className="hp-about__cred-item">
                  <span className="hp-about__cred-rule" />
                  <div>
                    <p className="hp-about__cred-label">{item.label}</p>
                    <p className="hp-about__cred-desc">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════════
          2b · MANIFESTO STRIP — centered brand positioning statement
      ══════════════════════════════════════════════════════════════════════ */}
      <section className="hp-manifesto">
        <div className="sv-container">
          <div className="hp-manifesto__inner">
            <div className="hp-manifesto__rule-row" aria-hidden="true">
              <span className="hp-manifesto__rule-line" />
              <span className="hp-manifesto__gem">◆</span>
              <span className="hp-manifesto__rule-line" />
            </div>
            <p className="hp-manifesto__quote">
              Where institutional strategy meets retail market development.
            </p>
            <div className="hp-manifesto__rule-row" aria-hidden="true">
              <span className="hp-manifesto__rule-line" />
              <span className="hp-manifesto__gem">◆</span>
              <span className="hp-manifesto__rule-line" />
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════════
          3 · SERVICES — light, clean 3-col grid (no images, Blackstone style)
      ══════════════════════════════════════════════════════════════════════ */}
      {featuredServices.length > 0 && (
        <section className="hp-services sv-section">
          <div className="sv-container">
            {/* Section header */}
            <div className="hp-services__header">
              <div>
                <p className="sv-eyebrow hp-services__eyebrow">What We Do</p>
                <h2 className="sv-display hp-services__headline">
                  Integrated investor relations services
                </h2>
              </div>
              <Link href="/capabilities" className="sv-link-arrow hp-services__all-link">
                All Capabilities
              </Link>
            </div>

            {/* Services grid */}
            <div className="hp-services__grid">
              {featuredServices.map((svc, i) => (
                <Link
                  key={svc.slug}
                  href={`/services/${svc.slug}`}
                  className="hp-svc-card"
                >
                  <span className="hp-svc-card__index" aria-hidden="true">{String(i + 1).padStart(2, '0')}</span>
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
                    Learn More <span className="hp-svc-card__arrow">→</span>
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ══════════════════════════════════════════════════════════════════════
          4 · BODY CONTENT from Strapi (secondary sections / feature highlights)
      ══════════════════════════════════════════════════════════════════════ */}
      {sections.length > 1 && (
        <section className="hp-features sv-section" style={{ backgroundColor: '#0c0d10' }}>
          <div className="sv-container">
            <div className="hp-features__header">
              <p className="sv-eyebrow hp-features__eyebrow">Why SteinbergValentino</p>
              <h2 className="sv-display hp-features__headline">
                The investor relations firm built for results
              </h2>
            </div>

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
          5 · EXCHANGES — dark, full-width grid
      ══════════════════════════════════════════════════════════════════════ */}
      {exchanges.length > 0 && (
        <section className="hp-exchanges sv-bg-dark">
          <div className="sv-container">
            <div className="hp-exchanges__header">
              <div>
                <p className="sv-eyebrow hp-exchanges__eyebrow">Exchange Coverage</p>
                <h2 className="sv-display hp-exchanges__headline">
                  We list and support companies on {exchanges.length} major exchanges
                </h2>
              </div>
              <Link href="/services/market-entry" className="sv-btn sv-btn-outline-white">
                Market Entry Services
              </Link>
            </div>

            <div className="hp-exchanges__grid">
              {exchanges.map((ex) => (
                <Link key={ex.slug} href={`/exchanges/${ex.slug}`} className="hp-exchange-item">
                  <span className="hp-exchange-item__flag">{exchangeFlag(ex.country)}</span>
                  <span className="hp-exchange-item__name">{ex.exchange_name}</span>
                  <span className="hp-exchange-item__country">{ex.country}</span>
                  <span className="hp-exchange-item__link">View details →</span>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ══════════════════════════════════════════════════════════════════════
          6 · TESTIMONIALS — light cream, client quotes carousel
      ══════════════════════════════════════════════════════════════════════ */}
      <section className="hp-testimonials sv-section">
        <div className="sv-container">
          <div className="hp-testimonials__header">
            <p className="sv-eyebrow hp-testimonials__eyebrow">Client Testimonials</p>
            <h2 className="sv-display hp-testimonials__headline">
              What Our Clients Say
            </h2>
          </div>

          <div className="hp-testimonials__grid">
            {TESTIMONIALS.map((t) => (
              <div key={t.name} className="hp-testi-card">
                <span className="hp-testi-card__quote-mark">&ldquo;</span>
                <p className="hp-testi-card__body">{t.quote}</p>
                <div className="hp-testi-card__rule" />
                <p className="hp-testi-card__name">{t.name}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════════
          7 · CONTACT CTA — dark, two-column (Blackstone "two-up" style)
      ══════════════════════════════════════════════════════════════════════ */}
      <section className="hp-cta">
        <div className="sv-container hp-cta__inner">
          {/* Left */}
          <div className="hp-cta__col-left">
            <p className="sv-eyebrow hp-cta__eyebrow">Start Your Engagement</p>
            <h2 className="sv-display hp-cta__headline">
              Ready to strengthen your investor relations program?
            </h2>
            <p className="hp-cta__body">
              Schedule a confidential consultation to explore how SteinbergValentino Group can
              elevate your company&apos;s capital markets profile.
            </p>
            <div className="hp-cta__actions">
              <Link href="/contact" className="sv-btn sv-btn-gold">
                Contact Us
              </Link>
              <Link href="/how-it-works" className="sv-link-arrow sv-link-arrow-white">
                How It Works
              </Link>
            </div>
          </div>

          {/* Right — contact details + service list */}
          <div className="hp-cta__col-right">
            <div className="hp-cta__contact-block">
              <p className="hp-cta__contact-label">New Business</p>
              {globalSettings?.contact_email && (
                <a href={`mailto:${globalSettings.contact_email}`} className="hp-cta__contact-link">
                  {globalSettings.contact_email}
                </a>
              )}
              {globalSettings?.contact_phone && (
                <a
                  href={`tel:${globalSettings.contact_phone.replace(/[^+\d]/g, '')}`}
                  className="hp-cta__contact-link"
                >
                  {globalSettings.contact_phone}
                </a>
              )}
            </div>

            {services.length > 0 && (
              <div className="hp-cta__svc-list">
                <p className="hp-cta__svc-list-label">Core Services</p>
                <ul className="hp-cta__svc-items">
                  {services.slice(0, 6).map((svc) => (
                    <li key={svc.slug}>
                      <Link href={`/services/${svc.slug}`} className="hp-cta__svc-link">
                        <span className="hp-cta__svc-rule" />
                        {svc.title}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      </section>
    </>
  )
}
