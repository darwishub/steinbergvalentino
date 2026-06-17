import Link from 'next/link'
import type { Metadata } from 'next'
import { SafeImage as Image } from '@/components/safe-image'
import { getAllServicePages, getServicesListingPage, getStrapiMedia } from '@/lib/strapi'

export const revalidate = 3600

export async function generateMetadata(): Promise<Metadata> {
  try {
    const page = await getServicesListingPage()
    return {
      title: page.meta_title ?? 'Services | SteinbergValentino Group',
      description:
        page.meta_description ??
        'Explore the full suite of investor relations and capital markets services offered by SteinbergValentino Group.',
    }
  } catch {
    return {
      title: 'Services | SteinbergValentino Group',
      description:
        'Explore the full suite of investor relations and capital markets services offered by SteinbergValentino Group.',
    }
  }
}

const STATIC_SERVICES = [
  { title: 'Advisory',                 slug: 'advisory' },
  { title: 'Strategic Advisory',       slug: 'strategic-advisory' },
  { title: 'Transactional Advisory',   slug: 'transactional-advisory' },
  { title: 'Capital Formation',        slug: 'capital-formation' },
  { title: 'Strategic Communications', slug: 'strategic-communications' },
  { title: 'Financial Marketing',      slug: 'financial-marketing' },
  { title: 'Media Relations',          slug: 'media-relations' },
  { title: 'Media Strategy',           slug: 'media-strategy' },
  { title: 'Multicultural Engagement', slug: 'multicultural-engagement' },
  { title: 'Market Entry',             slug: 'market-entry' },
  { title: 'Crisis Management',        slug: 'crises-management' },
  { title: 'Litigation Communications',slug: 'litigation-communications' },
]

export default async function ServicesIndexPage() {
  let services: { title: string; slug: string; hero_subheading?: string | null }[] = []
  let listingPage = null

  try {
    ;[services, listingPage] = await Promise.all([getAllServicePages(), getServicesListingPage()])
  } catch {
    /* ignore */
  }

  /* Fall back to static if Strapi returned empty */
  if (!services || services.length === 0) {
    services = STATIC_SERVICES
  }

  const heroHeading    = listingPage?.hero_heading ?? null
  const heroSubheading = listingPage?.hero_subheading ?? null
  const heroImage      = listingPage?.hero_image ?? null
  const approachImage  = listingPage?.approach_image ?? null

  return (
    <>
      {/* ── Intro header — white, eyebrow + title left / deck right ───────── */}
      <section className="bsx-intro">
        <div className="sv-container">
          {listingPage?.hero_eyebrow && <p className="bsx-eyebrow">{listingPage.hero_eyebrow}</p>}
          <div className="bsx-intro__grid">
            {heroHeading && <h1 className="bsx-intro__title">{heroHeading}</h1>}
            {heroSubheading && <p className="bsx-intro__deck">{heroSubheading}</p>}
          </div>
        </div>
      </section>

      {/* ── Full-bleed hero media ────────────────────────────────────────── */}
      {heroImage && (
        <section className="bsx-media">
          <div className="sv-container">
            <div className="bsx-media__frame">
              <Image
                src={getStrapiMedia(heroImage.url) ?? heroImage.url}
                alt=""
                width={heroImage.width || 1600}
                height={heroImage.height || 900}
                priority
                sizes="100vw"
              />
            </div>
          </div>
        </section>
      )}

      {/* ── Services grid — monochrome hairline cards ────────────────────── */}
      <section className="bsx-band">
        <div className="sv-container">
          <div className="svc-index">
            {services.map((svc, i) => (
              <Link key={svc.slug} href={`/services/${svc.slug}`} className="svc-index__item">
                <span className="svc-index__num" aria-hidden="true">
                  {String(i + 1).padStart(2, '0')}
                </span>
                <h3 className="svc-index__title">{svc.title}</h3>
                {svc.hero_subheading && <p className="svc-index__desc">{svc.hero_subheading}</p>}
                {listingPage?.card_cta_label && (
                  <span className="svc-index__cta">
                    {listingPage.card_cta_label.replace(/[→\s]+$/, '')}
                    <span className="svc-index__cta-circle" aria-hidden="true">
                      →
                    </span>
                  </span>
                )}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── Approach image band ──────────────────────────────────────────── */}
      {approachImage && (
        <section className="bsx-media bsx-media--tight">
          <div className="sv-container">
            <div className="bsx-media__frame">
              <Image
                src={getStrapiMedia(approachImage.url) ?? approachImage.url}
                alt=""
                width={approachImage.width || 1920}
                height={approachImage.height || 1080}
                sizes="100vw"
              />
            </div>
          </div>
        </section>
      )}

      {/* ── CTA — dark band ──────────────────────────────────────────────── */}
      {(listingPage?.cta_eyebrow || listingPage?.cta_heading || listingPage?.cta_label) && (
        <section className="bsx-band bsx-band--dark bsx-cta">
          <div className="sv-container bsx-cta__grid">
            <div>
              {listingPage?.cta_eyebrow && <p className="bsx-eyebrow">{listingPage.cta_eyebrow}</p>}
              {listingPage?.cta_heading && (
                <h2 className="bsx-cta__heading">{listingPage.cta_heading}</h2>
              )}
            </div>
            {listingPage?.cta_label && (
              <Link href="/contact" className="bsx-btn">
                {listingPage.cta_label}
              </Link>
            )}
          </div>
        </section>
      )}
    </>
  )
}
