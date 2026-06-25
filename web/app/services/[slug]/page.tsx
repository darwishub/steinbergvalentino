import { SafeImage as Image } from '@/components/safe-image'
import Link from 'next/link'
import type { Metadata } from 'next'
import {
  getAllServicePages,
  getServicePage,
  getRelatedArticle,
  getGlobalSettings,
  getStrapiMedia,
} from '@/lib/strapi'
import { DEFAULT_GLOBAL_SETTINGS } from '@/lib/defaults'
import { BlocksContent } from '@/components/blocks-content'
import { notFound } from 'next/navigation'
import { getScrapedServiceContent } from '@/lib/scraped-content'
import { BxmaService, BXMA_SLUGS } from '@/components/bxma-service'

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

  let gs = DEFAULT_GLOBAL_SETTINGS
  try {
    gs = await getGlobalSettings()
  } catch {
    /* offline fallback */
  }

  // The 4 BXMA-template pages use their own layout (live CMS data only).
  if (page && BXMA_SLUGS.has(slug)) {
    let article = null
    try {
      article = await getRelatedArticle(page.title)
    } catch {
      /* offline */
    }
    const enrichedPage = {
      ...page,
      hero_subheading: page.hero_subheading || scrapedPage?.heroSubheading || null,
    }
    return <BxmaService page={enrichedPage} article={article} gs={gs} />
  }

  const resolvedPage = page
    ? {
        hero_heading: page.hero_heading,
        hero_subheading: page.hero_subheading || scrapedPage?.heroSubheading || null,
        hero_image: page.hero_image,
        overview_image: page.overview_image ?? null,
        overview_heading: page.overview_heading ?? null,
        body_content: page.body_content?.length ? page.body_content : (scrapedPage?.bodyContent ?? null),
        highlights: page.highlights ?? [],
        sections: page.sections?.length ? page.sections : (scrapedPage?.sections ?? []),
        faq_items: page.faq_items,
        title: page.title,
      }
    : {
        hero_heading: scrapedPage!.heroHeading,
        hero_subheading: scrapedPage!.heroSubheading,
        hero_image: null,
        overview_image: null,
        overview_heading: null,
        body_content: scrapedPage!.bodyContent,
        highlights: [],
        sections: scrapedPage!.sections,
        faq_items: [],
        title: scrapedPage!.heroHeading,
      }

  return (
    <>
      {/* ── Intro Header — white, title left / deck right ─────────────────── */}
      <section className="bsx-intro">
        <div className="sv-container">
          <nav className="bsx-breadcrumb">
            <Link href="/services">Services</Link>
            <span aria-hidden="true">›</span>
            <span>{resolvedPage.title}</span>
          </nav>

          <div className="bsx-intro__grid">
            <h1 className="bsx-intro__title">{resolvedPage.hero_heading}</h1>
            {resolvedPage.hero_subheading && (
              <p className="bsx-intro__deck">{resolvedPage.hero_subheading}</p>
            )}
          </div>
        </div>
      </section>

      {/* ── Full-bleed Media Band ─────────────────────────────────────────── */}
      {resolvedPage.hero_image && (
        <section className="bsx-media">
          <div className="sv-container">
            <div className="bsx-media__frame">
              <Image
                src={getStrapiMedia(resolvedPage.hero_image.url) ?? resolvedPage.hero_image.url}
                alt=""
                width={resolvedPage.hero_image.width || 1600}
                height={resolvedPage.hero_image.height || 900}
                priority
                sizes="100vw"
              />
            </div>
          </div>
        </section>
      )}

      {/* ── What We Do — black band: statement + image + highlights ──────── */}
      {(resolvedPage.overview_heading ||
        (resolvedPage.highlights && resolvedPage.highlights.length > 0)) && (
        <section className="bsx-band bsx-band--dark">
          <div className="sv-container">
            {gs.service_overview_eyebrow && (
              <p className="bsx-eyebrow">{gs.service_overview_eyebrow}</p>
            )}

            {resolvedPage.overview_heading && (
              <h2 className="bsx-statement">{resolvedPage.overview_heading}</h2>
            )}

            <div
              className={
                resolvedPage.overview_image ? 'bsx-overview bsx-overview--media' : 'bsx-overview'
              }
            >
              {resolvedPage.overview_image && (
                <div className="bsx-overview__media">
                  <Image
                    src={
                      getStrapiMedia(resolvedPage.overview_image.url) ??
                      resolvedPage.overview_image.url
                    }
                    alt={resolvedPage.overview_image.alternativeText ?? ''}
                    width={resolvedPage.overview_image.width || 1200}
                    height={resolvedPage.overview_image.height || 800}
                    sizes="(max-width: 1024px) 100vw, 45vw"
                  />
                </div>
              )}

              <div className="bsx-overview__col">
                {resolvedPage.highlights && resolvedPage.highlights.length > 0 && (
                  <div className="bsx-highlights">
                    {resolvedPage.highlights.map((h) => (
                      <div key={h.id} className="bsx-highlight">
                        {h.heading && <h3 className="bsx-highlight__heading">{h.heading}</h3>}
                        {h.body && <p className="bsx-highlight__body">{h.body}</p>}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="bsx-engage">
              {gs.service_engage_heading && (
                <h3 className="bsx-engage__heading">
                  {gs.service_engage_heading.replace('{service}', resolvedPage.title)}
                </h3>
              )}
              <div className="bsx-engage__body">
                {gs.service_engage_body && <p>{gs.service_engage_body}</p>}
                <div className="bsx-engage__actions">
                  {gs.service_engage_cta_label && (
                    <Link href="/contact" className="bsx-arrowlink">
                      <span>{gs.service_engage_cta_label}</span>
                      <span className="bsx-arrowlink__circle" aria-hidden="true">
                        →
                      </span>
                    </Link>
                  )}
                  {gs.service_back_label && (
                    <Link href="/services" className="bsx-backlink">
                      {gs.service_back_label}
                    </Link>
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ── Overview prose — white band (preserves body_content) ──────────── */}
      {resolvedPage.body_content && resolvedPage.body_content.length > 0 && (
        <section className="bsx-band bsx-overview-band">
          <div className="sv-container">
            {gs.service_overview_band_eyebrow && (
              <p className="bsx-eyebrow">{gs.service_overview_band_eyebrow}</p>
            )}
            <div className="bsx-overview-band__prose">
              <BlocksContent blocks={resolvedPage.body_content} className="bsx-prose" />
            </div>
          </div>
        </section>
      )}

      {/* ── Content Sections — alternating white / black bands ───────────── */}
      {resolvedPage.sections?.map((section, i) => {
        const hasOverviewBand =
          !!resolvedPage.body_content && resolvedPage.body_content.length > 0
        const dark = (i + (hasOverviewBand ? 1 : 0)) % 2 === 1
        const priorImages = resolvedPage.sections!.slice(0, i).filter((s) => s.image).length
        const mediaClass = section.image
          ? `bsx-feature bsx-feature--media${priorImages % 2 === 1 ? ' bsx-feature--media-right' : ''}`
          : 'bsx-feature'
        return (
          <section key={section.id} className={`bsx-band ${dark ? 'bsx-band--dark' : ''}`}>
            <div className="sv-container">
              {section.eyebrow && <p className="bsx-eyebrow">{section.eyebrow}</p>}

              <div className={mediaClass}>
                {section.image && (
                  <div className="bsx-feature__media">
                    <Image
                      src={getStrapiMedia(section.image.url) ?? section.image.url}
                      alt={section.image.alternativeText ?? section.heading ?? ''}
                      width={section.image.width || 800}
                      height={section.image.height || 600}
                      sizes="(max-width: 1024px) 100vw, 50vw"
                    />
                  </div>
                )}

                <div className="bsx-feature__head">
                  {section.heading && (
                    <h2 className="bsx-feature__heading">{section.heading}</h2>
                  )}
                </div>

                <div className="bsx-feature__body">
                  {section.subheading && <p className="bsx-feature__sub">{section.subheading}</p>}
                  {section.body && <BlocksContent blocks={section.body} className="bsx-copy" />}
                </div>
              </div>
            </div>
          </section>
        )
      })}

      {/* ── FAQ — hairline accordion ──────────────────────────────────────── */}
      {resolvedPage.faq_items && resolvedPage.faq_items.length > 0 && (
        <section className="bsx-band">
          <div className="sv-container">
            <div className="bsx-faq__head">
              {gs.faq_eyebrow && <p className="bsx-eyebrow">{gs.faq_eyebrow}</p>}
              {gs.faq_title && <h2 className="bsx-faq__title">{gs.faq_title}</h2>}
            </div>

            <div className="bsx-faq__list">
              {resolvedPage.faq_items.map((faq) => (
                <details key={faq.id} className="bsx-faq__item">
                  <summary>
                    {faq.question}
                    <span className="bsx-faq__chev" aria-hidden="true" />
                  </summary>
                  <div className="bsx-faq__answer">
                    <BlocksContent blocks={faq.answer} />
                  </div>
                </details>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── Bottom CTA — black band ───────────────────────────────────────── */}
      <section className="bsx-band bsx-band--dark bsx-cta">
        <div className="sv-container bsx-cta__grid">
          <div>
            {gs.service_cta_eyebrow && <p className="bsx-eyebrow">{gs.service_cta_eyebrow}</p>}
            {gs.service_cta_heading && (
              <h2 className="bsx-cta__heading">
                {gs.service_cta_heading.replace('{service}', resolvedPage.title)}
              </h2>
            )}
          </div>
          {gs.service_cta_label && (
            <Link href="/contact" className="bsx-btn">
              {gs.service_cta_label}
            </Link>
          )}
        </div>
      </section>
    </>
  )
}
