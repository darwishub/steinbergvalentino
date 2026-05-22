import Link from 'next/link'
import {
  getHomepage,
  getAllServicePages,
  getAllExchangePages,
  getGlobalSettings,
} from '@/lib/strapi'
import { BlocksContent } from '@/components/blocks-content'
import { HeroVideoLoader } from '@/components/hero-video-loader'
import type { ServicePage, ExchangePage } from '@/lib/types'

export const revalidate = 3600

/* ─── Hardcoded hero video (swap src once a real asset is uploaded) ──────── */
const HERO_VIDEO_SRC =
  'https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4'
const HERO_VIDEO_POSTER = '/fallbacks/office-tower.webp'

/* ─── Fallbacks ──────────────────────────────────────────────────────────── */
const FALLBACK_TESTIMONIALS = [
  { id: 1, name: 'Abraham Mirman',    quote: "My company is a new player in the stock market. Through a series of aggressive campaigns by SV Group, I've been able to get my stock value up even higher than I expected, and it looks like it will continue in the months ahead." },
  { id: 2, name: 'Paul Tavis McKenzie', quote: "After taking my company public, it was a challenge to get investors aware of what we have to offer. SV Group's campaigns have increased my market exposure and I've been seeing my stock value go up higher than I expected." },
  { id: 3, name: 'Yat Man Lai',       quote: "Their campaigns have been extremely helpful in getting me more market exposure, and my stock's value has gone up more than I expected. I'd recommend SV Group to any company looking to grow their investor base." },
]

const FALLBACK_KEYWORDS = [
  'Investor Relations', 'Capital Formation', 'Exchange Listings',
  'Media & Communications', 'Market Making', 'IPO Advisory',
  'Retail Market Development', 'Financial Communications',
]

const FALLBACK_SERVICES = [
  { slug: 'investor-relations',   title: 'Investor Relations Strategy', desc: 'Bespoke IR programs built for your sector and investor base.' },
  { slug: 'capital-formation',    title: 'Capital Formation',           desc: 'Structured financing advisory for growth and expansion rounds.' },
  { slug: 'exchange-listings',    title: 'Exchange Listings',           desc: 'NASDAQ, OTC, TSX, CSE, Frankfurt — we know every market.' },
  { slug: 'media-communications', title: 'Media & Communications',      desc: 'Strategic press relations across financial and trade media.' },
]

const COUNTRY_FLAG: Record<string, string> = {
  'United States': '🇺🇸', Canada: '🇨🇦', Germany: '🇩🇪', UK: '🇬🇧', Australia: '🇦🇺',
}

/* ─── Split hero heading into two stagger lines ──────────────────────────── */
function splitHeroHeading(heading: string): [string, string] {
  const words = heading.trim().split(/\s+/)
  if (words.length <= 2) return ['', heading]
  const mid = Math.ceil(words.length / 2)
  return [words.slice(0, mid).join(' '), words.slice(mid).join(' ')]
}

/* ─── Singular Link — exact Blackstone 3-path SVG ───────────────────────── */
function BxSingularLink({ href, label, white }: { href: string; label: string; white?: boolean }) {
  return (
    <Link
      href={href}
      className="bx-singular-link_frontend"
      style={white ? { color: '#fff' } : undefined}
      aria-label={label}
    >
      <span className="bx-singular-link__label">{label}</span>
      <svg className="bx-singular-link__icon" width="40" height="40" viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg">
        <path className="bx-singular-link__icon-arrow" d="M29 20c0-.2 0-.4-.2-.6l-4.4-4.6a1 1 0 0 0-1.2 0c-.3.3-.3.8 0 1.1l3.1 3.3H11.8a.8.8 0 1 0 0 1.6h14.5l-3 3.3c-.4.3-.4.8 0 1.2.3.3.8.2 1.1 0l4.4-4.7.2-.6Z" fill="currentColor" />
        <path className="bx-singular-link__icon-fill" d="M20 0a20 20 0 1 1 0 40 20 20 0 0 1 0-40Zm3.2 14.8c-.3.3-.3.8 0 1.1l3.1 3.3H11.8a.8.8 0 1 0 0 1.6h14.5l-3 3.3c-.4.3-.4.8 0 1.2.3.3.8.2 1.1 0l4.4-4.7.2-.6c0-.2 0-.4-.2-.6l-4.4-4.6a1 1 0 0 0-1.2 0Z" fill="currentColor" />
        <path className="bx-singular-link__icon-border" fill="currentColor" d="M20 0a20 20 0 1 0 0 40 20 20 0 0 0 0-40Zm0 1.5a18.5 18.5 0 1 1 0 37 18.5 18.5 0 0 1 0-37Z" />
      </svg>
    </Link>
  )
}

/* ─── Inline arrow SVG link (for service rows in panels) ─────────────────── */
function ArrowSvg() {
  return (
    <svg className="bx-singular-link__icon" width="40" height="40" viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg">
      <path className="bx-singular-link__icon-arrow" d="M29 20c0-.2 0-.4-.2-.6l-4.4-4.6a1 1 0 0 0-1.2 0c-.3.3-.3.8 0 1.1l3.1 3.3H11.8a.8.8 0 1 0 0 1.6h14.5l-3 3.3c-.4.3-.4.8 0 1.2.3.3.8.2 1.1 0l4.4-4.7.2-.6Z" fill="currentColor" />
      <path className="bx-singular-link__icon-fill" d="M20 0a20 20 0 1 1 0 40 20 20 0 0 1 0-40Zm3.2 14.8c-.3.3-.3.8 0 1.1l3.1 3.3H11.8a.8.8 0 1 0 0 1.6h14.5l-3 3.3c-.4.3-.4.8 0 1.2.3.3.8.2 1.1 0l4.4-4.7.2-.6c0-.2 0-.4-.2-.6l-4.4-4.6a1 1 0 0 0-1.2 0Z" fill="currentColor" />
      <path className="bx-singular-link__icon-border" fill="currentColor" d="M20 0a20 20 0 1 0 0 40 20 20 0 0 0 0-40Zm0 1.5a18.5 18.5 0 1 1 0 37 18.5 18.5 0 0 1 0-37Z" />
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
  } catch { /* Strapi offline — all sections fall back gracefully */ }

  globalSettings = await getGlobalSettings().catch(() => null)

  /* ── Hero fields ─────────────────────────────────────────────────────── */
  const heroEyebrow   = page?.hero_eyebrow   ?? null
  const heroHeading   = page?.hero_heading   ?? 'Build with SteinbergValentino'
  const heroSubheading = page?.hero_subheading ?? 'SteinbergValentino Group is the premier investor relations firm for small and mid-cap public companies.'
  const ctaPrimary   = { label: page?.hero_cta_primary_label  ?? 'Our Capabilities', url: page?.hero_cta_primary_url  ?? '/capabilities' }
  const ctaSecondary = { label: page?.hero_cta_secondary_label ?? 'How It Works',     url: page?.hero_cta_secondary_url ?? '/how-it-works' }

  const [heroLine1, heroLine2] = splitHeroHeading(heroHeading)

  /* ── Section content ─────────────────────────────────────────────────── */
  const sections     = page?.sections ?? []
  const testimonials = page?.testimonials?.length ? page.testimonials : FALLBACK_TESTIMONIALS
  const keywords     = page?.keyword_band?.length ? page.keyword_band : FALLBACK_KEYWORDS
  const tickerItems  = [...keywords, ...keywords, ...keywords]

  // Section 0 → Offerings ("About the Firm") block
  const offeringsSection  = sections[0] ?? null
  // Body content as fallback copy for offerings
  const bodyContent = page?.body_content ?? null

  const svcCards = (services.length > 0
    ? services.slice(0, 4).map(s => ({ slug: s.slug, title: s.title, desc: s.hero_subheading ?? '' }))
    : FALLBACK_SERVICES)

  const svcLinks = (services.length > 0 ? services : FALLBACK_SERVICES).slice(0, 5)

  const contactEmail = globalSettings?.contact_email ?? 'info@steinbergvalentino.com'
  const contactPhone = globalSettings?.contact_phone ?? null

  return (
    <>
      {/* ── Blackstone CSS loaded locally — all bx-* classes powered by this ── */}
      <link rel="stylesheet" href="/bx/frontend.css" precedence="default" />

      {/* ════════════════════════════════════════════════════════════════════
          1 · PROMO HEADER  (dark bg, full-bleed video background)
      ════════════════════════════════════════════════════════════════════ */}
      <section
        className="bx-block-component bx-promo-header alignfull bx-stacked-component-header-padding-top bx-stacked-component-header-padding-bottom is-color-theme-dark"
        style={{ position: 'relative', overflow: 'hidden' }}
      >
        {/* Lazy-loaded background video — hardcoded src for testing */}
        <HeroVideoLoader src={HERO_VIDEO_SRC} poster={HERO_VIDEO_POSTER} />

        {/* Dark scrim so text stays readable */}
        <div
          aria-hidden="true"
          style={{
            position: 'absolute', inset: 0,
            background: 'linear-gradient(160deg, rgba(12,14,18,0.82) 0%, rgba(18,19,23,0.65) 100%)',
            zIndex: 1,
          }}
        />

        <div className="bx-promo-header__inner" style={{ position: 'relative', zIndex: 2 }}>

          {heroEyebrow && (
            <p
              className="bx-promo-header__eyebrow is-style-eyebrow"
              style={{ color: 'rgba(220,168,64,0.9)', marginBottom: '1.5rem' }}
              aria-hidden="true"
            >
              {heroEyebrow}
            </p>
          )}

          <h1 className="bx-promo-header__title animated">
            {heroLine1 && <span className="bx-promo-header__title-1">{heroLine1}</span>}
            <span className="bx-promo-header__title-2">{heroLine2 || heroHeading}</span>
          </h1>

          <div className="bx-promo-header__description animated">
            <p>{heroSubheading}</p>
            <div style={{ display: 'flex', gap: '2.5rem', marginTop: '2.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
              <BxSingularLink href={ctaPrimary.url}   label={ctaPrimary.label}   white />
              <BxSingularLink href={ctaSecondary.url} label={ctaSecondary.label} white />
            </div>
          </div>

        </div>
      </section>

      {/* ════════════════════════════════════════════════════════════════════
          2 · STATS BAND  (dark, 3 key SV numbers)
      ════════════════════════════════════════════════════════════════════ */}
      <section
        className="bx-block-component alignfull is-color-theme-dark bx-component-base-padding-top bx-component-base-padding-bottom"
        style={{ background: '#121317' }}
      >
        <div
          className="bx-table-comp"
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '1px',
            background: 'rgba(255,255,255,0.08)',
          }}
        >
          {[
            { value: '500+', label: 'Client Companies Served' },
            { value: '15+',  label: 'Years of Capital Markets Expertise' },
            { value: '8',    label: 'Major Exchanges Covered' },
          ].map(stat => (
            <div key={stat.value} style={{ background: '#121317', padding: '3rem 2rem' }}>
              <p style={{ fontFamily: 'Sanomat, serif', fontSize: 'var(--fs-56, 3.5rem)', fontWeight: 300, lineHeight: 1, letterSpacing: '-0.03em', color: '#fff', margin: '0 0 0.5rem' }}>
                {stat.value}
              </p>
              <p style={{ fontSize: 'var(--fs-16, 1rem)', color: 'rgba(255,255,255,0.6)', margin: 0 }}>
                {stat.label}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════════════════
          3 · OFFERINGS  (light bg, CMS section[0])
      ════════════════════════════════════════════════════════════════════ */}
      <section className="bx-block-component bx-offerings alignfull bx-component-base-padding-top bx-component-base-padding-bottom">
        <div className="bx-offerings__inner bx-table-comp">

          <div className="bx-offerings__heading bx-offerings-heading has-text-align-center">
            <p className="bx-offerings-heading__eyebrow" aria-hidden="true">ABOUT The Firm</p>
            <h2 className="bx-offerings-heading__title">
              <span className="visually-hidden">ABOUT The Firm: </span>
              Delivering for Investors
            </h2>
          </div>

          <div className="bx-offerings__main bx-offerings-main">

            <h3 className="bx-offerings-main__title">
              {offeringsSection?.heading ?? 'Unmatched expertise in small-cap IR'}
            </h3>

            <div className="bx-offerings-main__content">
              <div className="bx-offerings-main__copy">
                {/* Prefer section body, fall back to page body_content, then static text */}
                {offeringsSection?.body && offeringsSection.body.length > 0 ? (
                  <div className="sv-rich-text"><BlocksContent blocks={offeringsSection.body} /></div>
                ) : bodyContent && bodyContent.length > 0 ? (
                  <div className="sv-rich-text"><BlocksContent blocks={bodyContent} /></div>
                ) : (
                  <p>SteinbergValentino Group is a small-cap company&apos;s best choice in investor relations firms. SV Group goes above and beyond to serve its client companies with the best possible IR mediation along with an array of other equally fundamental services — known worldwide not only for its supreme IR service but also for possessing diverse capabilities.</p>
                )}
              </div>
              <div className="bx-offerings-main__cta">
                <BxSingularLink href="/about" label="About the Firm" />
              </div>
            </div>

            <div className="bx-offerings-main__stat">
              <p className="bx-offerings-main__stat-value">500+</p>
              <div className="bx-offerings-main__stat-subtext">
                <p>Client Companies Served</p>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════════════════
          4 · TWO-UP CONTENT  (dark, services links panel)
      ════════════════════════════════════════════════════════════════════ */}
      <section className="bx-block-component bx-two-up-content alignfull is-color-theme-dark bx-component-base-padding-top bx-component-base-padding-bottom">
        <div className="bx-two-up-content__inner bx-table-comp">

          <p className="bx-two-up-content__eyebrow is-style-eyebrow">Capital Markets</p>

          <h3 className="bx-two-up-content__title">
            Institutional quality for individual investors
          </h3>

          <div className="bx-two-up-content__copy">
            <p>We deliver the same rigorous IR strategy and capital markets expertise to growth companies that institutional firms bring to large-cap clients — bespoke programs built for your sector and investor base.</p>
          </div>

          <div className="bx-two-up-content__cta">
            <BxSingularLink href="/how-it-works" label="How It Works" white />
          </div>

          <div className="bx-two-up-content__links has-feature-five">
            <div className="bx-two-up-content__links-inner">
              {svcLinks.map(svc => (
                <div key={svc.slug} className="bx-two-up-content__link">
                  <div className="bx-two-up-content__link-col">
                    <p className="bx-two-up-content__link-label">{svc.title}</p>
                  </div>
                  <Link
                    href={`/services/${svc.slug}`}
                    className="bx-singular-link_frontend"
                    aria-label={svc.title}
                  >
                    <span className="bx-singular-link__label" />
                    <ArrowSvg />
                  </Link>
                </div>
              ))}
            </div>
          </div>

        </div>
      </section>

      {/* ════════════════════════════════════════════════════════════════════
          5 · TICKERTAPE  (dark strip, scrolling keywords from CMS)
      ════════════════════════════════════════════════════════════════════ */}
      <div
        className="bx-block-component bx-block-no-spacing bx-tickertape alignfull is-color-theme-dark bx-ticker-tape-stack-padding-top bx-ticker-tape-stack-padding-bottom"
        role="presentation"
        aria-hidden="true"
      >
        <div className="bx-tickertape__inner bx-table-comp">
          <div className="bx-tickertape__ticker">
            {tickerItems.map((kw, i) => (
              <div key={`${kw}-${i}`} className="bx-tickertape__ticker-item">
                <p className="bx-tickertape__title">{kw}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ════════════════════════════════════════════════════════════════════
          6 · FEATURED SERVICES  (CMS service pages → bx-content-card grid)
      ════════════════════════════════════════════════════════════════════ */}
      <section className="bx-block-component bx-featured-news alignfull bx-component-stacked-same-theme-padding-top bx-component-base-padding-bottom" id="services">
        <div className="bx-featured-news__inner bx-table-comp">

          <p className="bx-featured-news__eyebrow is-style-eyebrow" aria-hidden="true">What We Do</p>
          <h2 className="bx-featured-news__title">
            <span className="visually-hidden">What We Do: </span>
            Our Capabilities
          </h2>

          <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'flex-end' }}>
            <BxSingularLink href="/capabilities" label="All Capabilities" />
          </div>

          <div className="bx-featured-news__cards">
            {svcCards.map((svc, i) => (
              <div key={svc.slug} className="bx-featured-news__card">
                <article className="bx-content-card">

                  {/* Media: gradient card — no external images */}
                  <div
                    className="bx-content-card__media"
                    style={{
                      background: 'linear-gradient(160deg, #1a1d23 0%, #121317 100%)',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '1rem',
                    }}
                  >
                    <div className="bx-content-card__curtain" />
                    <span style={{
                      fontFamily: 'Sanomat, serif',
                      fontSize: 'var(--fs-96, 6rem)',
                      fontWeight: 300,
                      lineHeight: 1,
                      color: 'rgba(220,168,64,0.25)',
                      userSelect: 'none',
                    }}>
                      {String(i + 1).padStart(2, '0')}
                    </span>
                    <span style={{ width: '2rem', height: '1px', background: 'rgba(220,168,64,0.6)', display: 'block' }} />
                  </div>

                  <div className="bx-content-card__main">
                    <h3 className="bx-content-card__title">
                      <Link href={`/services/${svc.slug}`} className="bx-content-card__title-link">
                        {svc.title}
                      </Link>
                    </h3>
                    {svc.desc && (
                      <p className="bx-content-card__description" style={{ fontSize: 'var(--fs-14, 0.875rem)', color: 'var(--c-copy)', marginTop: '0.5rem' }}>
                        {svc.desc}
                      </p>
                    )}
                  </div>

                  <div className="bx-content-card__footer">
                    <p className="bx-content-card__meta">
                      <Link href={`/services/${svc.slug}`}>Services</Link>
                    </p>
                  </div>

                </article>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* ════════════════════════════════════════════════════════════════════
          7 · EXCHANGES  (dark, 4-col grid — CMS exchange pages)
      ════════════════════════════════════════════════════════════════════ */}
      {exchanges.length > 0 && (
        <section className="bx-block-component alignfull is-color-theme-dark bx-component-base-padding-top bx-component-base-padding-bottom">
          <div className="bx-table-comp">
            <div style={{ marginBottom: '3.5rem', display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: '2rem' }}>
              <div>
                <p
                  className="is-style-eyebrow"
                  style={{ fontSize: 'var(--fs-14)', fontWeight: 400, letterSpacing: '.08em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.55)', marginBottom: '1rem' }}
                >
                  Exchange Coverage
                </p>
                <h2 style={{ fontFamily: 'Sanomat, serif', fontWeight: 300, fontSize: 'var(--fs-40, 2.5rem)', lineHeight: 1.1, color: '#fff', margin: 0 }}>
                  We list companies on {exchanges.length} major exchanges
                </h2>
              </div>
              <BxSingularLink href="/services/market-entry" label="Market Entry" white />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1px', background: 'rgba(255,255,255,0.08)' }}>
              {exchanges.map(ex => (
                <Link
                  key={ex.slug}
                  href={`/exchanges/${ex.slug}`}
                  style={{ background: '#121317', padding: '2rem', display: 'flex', flexDirection: 'column', gap: '0.4rem', textDecoration: 'none', color: '#fff' }}
                >
                  <span style={{ fontSize: '1.75rem' }}>{COUNTRY_FLAG[ex.country] ?? '🏛️'}</span>
                  <span style={{ fontFamily: 'Sanomat, serif', fontSize: '1.0625rem' }}>{ex.exchange_name}</span>
                  <span style={{ fontSize: '0.8125rem', color: 'rgba(255,255,255,0.42)' }}>{ex.country}</span>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ════════════════════════════════════════════════════════════════════
          8 · TESTIMONIALS  (light two-up, CMS testimonials)
      ════════════════════════════════════════════════════════════════════ */}
      <section className="bx-block-component bx-two-up-content alignfull bx-component-base-padding-top bx-component-base-padding-bottom">
        <div className="bx-two-up-content__inner bx-table-comp">

          <p className="bx-two-up-content__eyebrow is-style-eyebrow">Client Testimonials</p>
          <h3 className="bx-two-up-content__title">What Our Clients Say</h3>

          <div className="bx-two-up-content__links has-feature-three">
            <div className="bx-two-up-content__links-inner">
              {testimonials.slice(0, 3).map(t => (
                <div key={t.id} className="bx-two-up-content__link" style={{ display: 'block', padding: '1.5rem 0' }}>
                  <p style={{ fontFamily: 'Sanomat, serif', fontSize: 'var(--fs-20)', lineHeight: 1.6, color: 'var(--c-copy, #0f1115)', margin: '0 0 0.75rem' }}>
                    &ldquo;{t.quote}&rdquo;
                  </p>
                  <p style={{ fontSize: 'var(--fs-14)', fontWeight: 500, letterSpacing: '.06em', textTransform: 'uppercase', color: 'var(--c-graphics, #dca840)', margin: 0 }}>
                    — {t.name}
                  </p>
                </div>
              ))}
            </div>
          </div>

        </div>
      </section>

      {/* ════════════════════════════════════════════════════════════════════
          9 · CTA  (dark two-up + contact panel from GlobalSettings)
      ════════════════════════════════════════════════════════════════════ */}
      <section className="bx-block-component bx-two-up-content alignfull is-color-theme-dark bx-component-base-padding-top bx-component-base-padding-bottom">
        <div className="bx-two-up-content__inner bx-table-comp">

          <p className="bx-two-up-content__eyebrow is-style-eyebrow">Start Your Engagement</p>

          <h3 className="bx-two-up-content__title">
            Ready to strengthen your investor relations program?
          </h3>

          <div className="bx-two-up-content__copy">
            <p>Schedule a confidential consultation to explore how SteinbergValentino Group can elevate your company&apos;s capital markets profile and drive meaningful investor awareness.</p>
          </div>

          <div className="bx-two-up-content__cta">
            <BxSingularLink href="/contact" label="Contact Us" white />
          </div>

          <div className="bx-two-up-content__links has-feature-five">
            <div className="bx-two-up-content__links-inner">

              {/* Contact details from GlobalSettings */}
              <div style={{ marginBottom: '2rem' }}>
                <p style={{ fontSize: 'var(--fs-14)', fontWeight: 400, letterSpacing: '.08em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.42)', marginBottom: '0.5rem' }}>
                  New Business
                </p>
                <a
                  href={`mailto:${contactEmail}`}
                  style={{ fontFamily: 'Sanomat, serif', fontSize: '1.0625rem', color: '#fff', textDecoration: 'none', display: 'block' }}
                >
                  {contactEmail}
                </a>
                {contactPhone && (
                  <a
                    href={`tel:${contactPhone.replace(/[^+\d]/g, '')}`}
                    style={{ fontFamily: 'Sanomat, serif', fontSize: '1.0625rem', color: '#fff', textDecoration: 'none', display: 'block', marginTop: '0.25rem' }}
                  >
                    {contactPhone}
                  </a>
                )}
              </div>

              {/* Core services list */}
              <p style={{ fontSize: 'var(--fs-14)', fontWeight: 400, letterSpacing: '.08em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.42)', marginBottom: '1rem' }}>
                Core Services
              </p>
              {svcLinks.map(svc => (
                <div key={svc.slug} className="bx-two-up-content__link">
                  <div className="bx-two-up-content__link-col">
                    <p className="bx-two-up-content__link-label">{svc.title}</p>
                  </div>
                  <Link href={`/services/${svc.slug}`} className="bx-singular-link_frontend" aria-label={svc.title}>
                    <span className="bx-singular-link__label" />
                    <ArrowSvg />
                  </Link>
                </div>
              ))}

            </div>
          </div>

        </div>
      </section>
    </>
  )
}
