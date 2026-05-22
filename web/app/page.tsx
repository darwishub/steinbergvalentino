import { SafeImage as Image } from '@/components/safe-image'
import Link from 'next/link'
import { getHomepage, getAllServicePages, getAllExchangePages, getStrapiMedia } from '@/lib/strapi'
import { BlocksContent } from '@/components/blocks-content'
import type { ServicePage, ExchangePage } from '@/lib/types'

export const revalidate = 3600

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

  try {
    ;[page, services, exchanges] = await Promise.all([
      getHomepage(),
      getAllServicePages(),
      getAllExchangePages(),
    ])
  } catch {
    /* Strapi offline — render static shell */
  }

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
  /* Premium hero — glass-and-steel financial district, dark by nature so overlay reads clean */
  const PREMIUM_HERO =
    'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=2400&q=88'
  const homepageHeroSrc =
    heroBackground && heroBgUrl && heroBackground.width >= 1600 && heroBackground.height >= 900
      ? heroBgUrl
      : PREMIUM_HERO

  const sections = page?.sections ?? []

  /* Split services: first 6 for featured grid, rest for listing */
  const featuredServices = services.slice(0, 6)

  return (
    <>
      {/* ══════════════════════════════════════════════════════════════════════
          1 · HERO — full-bleed dark, large serif headline, stats bar
      ══════════════════════════════════════════════════════════════════════ */}
      <section className="hp-hero">
        {/* Background */}
        <Image
          src={homepageHeroSrc}
          alt="SteinbergValentino Group — Capital Markets"
          fill
          sizes="100vw"
          priority
          style={{ objectFit: 'cover', objectPosition: 'center 20%' }}
        />

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

        {/* Stats bar */}
        <div className="hp-hero__stats-bar">
          <div className="sv-container hp-hero__stats-inner">
            {[
              { stat: '20+', label: 'Years of Capital Markets Experience' },
              { stat: '150+', label: 'Public Companies Served' },
              { stat: '9', label: 'Major Exchange Listings Supported' },
            ].map(({ stat, label }) => (
              <div key={stat} className="hp-hero__stat-cell">
                <span className="sv-stat-number hp-hero__stat-num">{stat}</span>
                <span className="hp-hero__stat-label">{label}</span>
              </div>
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
              {sections[0]?.heading ?? 'Capital Markets Expertise for Growth-Stage Public Companies'}
            </h2>

            {sections[0]?.body ? (
              <div className="sv-rich-text hp-about__body">
                <BlocksContent blocks={sections[0].body} />
              </div>
            ) : (
              <p className="hp-about__body-text">
                SteinbergValentino Group brings institutional-grade investor relations strategy to
                small and mid-cap public companies. We build lasting investor confidence through
                disciplined storytelling, targeted outreach, and precise capital markets execution.
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
              {featuredServices.map((svc) => (
                <Link
                  key={svc.slug}
                  href={`/services/${svc.slug}`}
                  className="hp-svc-card"
                >
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
        <section className="hp-features sv-section sv-bg-light">
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
          6 · CONTACT CTA — dark, two-column (Blackstone "two-up" style)
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
              <a href="mailto:contact@steinbergvalentino.com" className="hp-cta__contact-link">
                contact@steinbergvalentino.com
              </a>
              <a href="tel:+16465353995" className="hp-cta__contact-link">
                (646) 535-3995
              </a>
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
