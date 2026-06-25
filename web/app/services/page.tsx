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
  let services: {
    title: string
    slug: string
    hero_subheading?: string | null
    hero_image?: {
      url: string
      width?: number
      height?: number
      alternativeText?: string | null
    } | null
  }[] = []
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

  const heading = listingPage?.hero_heading ?? 'Services'

  /* ── Blackstone "In the News" listing pattern — slim title + card grid.
       No hero, no closing band. Each card links straight to its page. ── */
  return (
    <section className="bsx-band svc-news">
      <div className="sv-container">
        {listingPage?.hero_eyebrow && <p className="bsx-eyebrow">{listingPage.hero_eyebrow}</p>}
        <h1 className="svc-news__title">{heading}</h1>

        <div className="svc-news__grid">
          {services.map((svc) => (
            <Link key={svc.slug} href={`/services/${svc.slug}`} className="svc-news__card">
              {svc.hero_image && (
                <div className="svc-news__media">
                  <Image
                    src={getStrapiMedia(svc.hero_image.url) ?? svc.hero_image.url}
                    alt={svc.hero_image.alternativeText ?? svc.title}
                    width={svc.hero_image.width || 800}
                    height={svc.hero_image.height || 600}
                    sizes="(max-width: 600px) 100vw, (max-width: 1100px) 50vw, 25vw"
                  />
                </div>
              )}
              <h3 className="svc-news__card-title">{svc.title}</h3>
              {svc.hero_subheading && <p className="svc-news__card-meta">{svc.hero_subheading}</p>}
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
