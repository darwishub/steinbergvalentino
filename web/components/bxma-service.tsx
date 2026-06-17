import { SafeImage as Image } from '@/components/safe-image'
import Link from 'next/link'
import { getStrapiMedia } from '@/lib/strapi'
import { BlocksContent } from '@/components/blocks-content'
import type { Article, ServicePage, GlobalSettings } from '@/lib/types'

/**
 * BXMA-style service layout (Blackstone Multi-Asset Investing template).
 * Used only for the slugs listed in BXMA_SLUGS — every other service page
 * keeps the standard layout in page.tsx.
 */
export const BXMA_SLUGS = new Set([
  'market-entry',
  'media-relations',
  'media-strategy',
  'multicultural-engagement',
])

export function BxmaService({
  page,
  article,
  gs,
}: {
  page: ServicePage
  article: Article | null
  gs: GlobalSettings
}) {
  const heroImg = page.hero_image
  const overviewImg = page.overview_image
  const mediaImg = page.media_band_image
  const quoteImg = page.quote_image
  const stats = page.stats ?? []
  const highlights = page.highlights ?? []
  const sections = page.sections ?? []

  return (
    <>
      {/* ── Intro header ─────────────────────────────────────────────────── */}
      <section className="bsx-intro">
        <div className="sv-container">
          <nav className="bsx-breadcrumb">
            <Link href="/services">Services</Link>
            <span aria-hidden="true">›</span>
            <span>{page.title}</span>
          </nav>

          <div className="bsx-intro__grid">
            <h1 className="bsx-intro__title">{page.hero_heading}</h1>
            {page.hero_subheading && <p className="bsx-intro__deck">{page.hero_subheading}</p>}
          </div>
        </div>
      </section>

      {/* ── Full-bleed hero media ────────────────────────────────────────── */}
      {heroImg && (
        <section className="bsx-media">
          <div className="sv-container">
            <div className="bsx-media__frame">
              <Image
                src={getStrapiMedia(heroImg.url) ?? heroImg.url}
                alt=""
                width={heroImg.width || 1600}
                height={heroImg.height || 900}
                priority
                sizes="100vw"
              />
            </div>
          </div>
        </section>
      )}

      {/* ── Stats band ───────────────────────────────────────────────────── */}
      {(page.stat_headline_value || stats.length > 0) && (
        <section className="bxma-stats">
          <div className="sv-container bxma-stats__grid">
            {page.stat_headline_value && (
              <div className="bxma-stats__headline">
                {page.stat_headline_label && (
                  <p className="bxma-stats__label">{page.stat_headline_label}</p>
                )}
                <p className="bxma-stats__value">{page.stat_headline_value}</p>
              </div>
            )}

            {stats.length > 0 && (
              <div className="bxma-stats__list">
                {stats.map((s) => (
                  <div key={s.id} className="bxma-stat">
                    <p className="bxma-stat__label">{s.label}</p>
                    <p className="bxma-stat__value">{s.value}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
      )}

      {/* ── What We Do — dark statement + image + highlights ─────────────── */}
      {(page.overview_heading || highlights.length > 0) && (
        <section className="bsx-band bsx-band--dark">
          <div className="sv-container">
            {gs.service_overview_eyebrow && (
              <p className="bsx-eyebrow">{gs.service_overview_eyebrow}</p>
            )}

            {page.overview_heading && <h2 className="bsx-statement">{page.overview_heading}</h2>}

            <div className={overviewImg ? 'bsx-overview bsx-overview--media' : 'bsx-overview'}>
              {overviewImg && (
                <div className="bsx-overview__media">
                  <Image
                    src={getStrapiMedia(overviewImg.url) ?? overviewImg.url}
                    alt={overviewImg.alternativeText ?? ''}
                    width={overviewImg.width || 1200}
                    height={overviewImg.height || 800}
                    sizes="(max-width: 1024px) 100vw, 45vw"
                  />
                </div>
              )}

              <div className="bsx-overview__col">
                {highlights.length > 0 && (
                  <div className="bsx-highlights">
                    {highlights.map((h) => (
                      <div key={h.id} className="bsx-highlight">
                        {h.heading && <h3 className="bsx-highlight__heading">{h.heading}</h3>}
                        {h.body && <p className="bsx-highlight__body">{h.body}</p>}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ── Full-bleed media band with play affordance ───────────────────── */}
      {mediaImg && (
        <section className="bxma-feature">
          <div className="bxma-feature__frame">
            <Image
              src={getStrapiMedia(mediaImg.url) ?? mediaImg.url}
              alt={mediaImg.alternativeText ?? ''}
              width={mediaImg.width || 1920}
              height={mediaImg.height || 1080}
              sizes="100vw"
            />
            <span className="bxma-feature__play" aria-hidden="true">
              <svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor">
                <path d="M8 5v14l11-7z" />
              </svg>
            </span>
          </div>
        </section>
      )}

      {/* ── Our Approach — intro prose + accordion of sections ───────────── */}
      {(sections.length > 0 || (page.body_content && page.body_content.length > 0)) && (
        <section className="bsx-band bxma-approach">
          <div className="sv-container">
            {gs.service_approach_title && (
              <h2 className="bxma-approach__title">{gs.service_approach_title}</h2>
            )}

            {page.body_content && page.body_content.length > 0 && (
              <div className="bxma-approach__lead">
                <BlocksContent blocks={page.body_content} className="bsx-prose" />
              </div>
            )}

            {sections.length > 0 && (
              <div className="bsx-faq__list bxma-accordion">
                {sections.map((s) => (
                  <details key={s.id} className="bsx-faq__item">
                    <summary>
                      {s.heading}
                      <span className="bsx-faq__chev" aria-hidden="true" />
                    </summary>
                    <div className="bsx-faq__answer">
                      {s.subheading && <p className="bxma-accordion__sub">{s.subheading}</p>}
                      {s.body && <BlocksContent blocks={s.body} />}
                    </div>
                  </details>
                ))}
              </div>
            )}
          </div>
        </section>
      )}

      {/* ── News & Insights ──────────────────────────────────────────────── */}
      {article && (
        <section className="bsx-band bxma-news">
          <div className="sv-container">
            {gs.service_news_eyebrow && <p className="bsx-eyebrow">{gs.service_news_eyebrow}</p>}
            {gs.service_news_heading && (
              <h2 className="bxma-news__title">
                {gs.service_news_heading.replace('{service}', page.title)}
              </h2>
            )}

            <Link href={`/search?q=${encodeURIComponent(article.title)}`} className="bxma-news__card">
              <div className="bxma-news__body">
                {article.category && <p className="bxma-news__cat">{article.category}</p>}
                <h3 className="bxma-news__headline">{article.title}</h3>
                {article.excerpt && <p className="bxma-news__excerpt">{article.excerpt}</p>}
                <span className="bxma-news__cta">
                  {gs.service_news_cta_label}
                  <span className="bsx-arrowlink__circle" aria-hidden="true">
                    →
                  </span>
                </span>
              </div>
              {(() => {
                const cover = article.cover_image ?? heroImg
                if (!cover) return null
                return (
                  <div className="bxma-news__media">
                    <Image
                      src={getStrapiMedia(cover.url) ?? cover.url}
                      alt={article.cover_image?.alternativeText ?? article.title}
                      width={cover.width || 800}
                      height={cover.height || 600}
                      sizes="(max-width: 1024px) 100vw, 50vw"
                    />
                  </div>
                )
              })()}
            </Link>
          </div>
        </section>
      )}

      {/* ── Quote band ───────────────────────────────────────────────────── */}
      {page.quote_text && (
        <section className="bsx-band bsx-band--dark bxma-quote">
          <div className="sv-container bxma-quote__grid">
            {quoteImg && (
              <div className="bxma-quote__media">
                <Image
                  src={getStrapiMedia(quoteImg.url) ?? quoteImg.url}
                  alt={page.quote_author ?? ''}
                  width={quoteImg.width || 600}
                  height={quoteImg.height || 600}
                  sizes="(max-width: 1024px) 100vw, 33vw"
                />
              </div>
            )}
            <figure className="bxma-quote__figure">
              <blockquote className="bxma-quote__text">
                &ldquo;{page.quote_text}&rdquo;
              </blockquote>
              {(page.quote_author || page.quote_role) && (
                <figcaption className="bxma-quote__cite">
                  {page.quote_author && <span className="bxma-quote__author">{page.quote_author}</span>}
                  {page.quote_role && <span className="bxma-quote__role">{page.quote_role}</span>}
                </figcaption>
              )}
            </figure>
          </div>
        </section>
      )}
    </>
  )
}
