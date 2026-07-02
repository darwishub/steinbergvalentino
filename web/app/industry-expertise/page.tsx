import type { Metadata } from 'next'
import { getIndustryExpertisePage } from '@/lib/strapi'
import { getScrapedPageContent } from '@/lib/scraped-content'
import { BsxTemplate } from '@/components/bsx-template'

export const revalidate = 3600

export async function generateMetadata(): Promise<Metadata> {
  try {
    const page = await getIndustryExpertisePage()
    return {
      title: page.meta_title ?? 'Industry Expertise | SteinbergValentino Group',
      description:
        page.meta_description ??
        'SteinbergValentino Group brings deep sector knowledge across technology, natural resources, healthcare, financial services, and more.',
    }
  } catch {
    return {
      title: 'Industry Expertise | SteinbergValentino Group',
      description: 'Deep sector knowledge across the industries we serve.',
    }
  }
}

export default async function IndustryExpertisePage() {
  let page = null
  const scrapedPage = getScrapedPageContent('industry-expertise.html')
  try {
    page = await getIndustryExpertisePage()
  } catch {
    /* static fallback */
  }

  const heroHeading = page?.hero_heading ?? scrapedPage?.heroHeading ?? 'Industry Expertise'
  const heroSubheading = page?.hero_subheading ?? scrapedPage?.heroSubheading ?? null
  const heroImage = page?.hero_image ?? null
  const sections = page?.sections?.length ? page.sections : (scrapedPage?.sections ?? [])
  const bodyContent = page?.body_content ?? scrapedPage?.bodyContent ?? null
  const sectors: Array<{ id: number; label: string; icon?: string | null }> =
    page?.sectors?.length ? page.sectors : []

  return (
    <BsxTemplate
      eyebrow={page?.hero_eyebrow ?? ''}
      title={heroHeading}
      deck={heroSubheading}
      heroImage={heroImage}
      tightTop
      approachTitle={page?.approach_title ?? undefined}
      bodyContent={bodyContent}
      sections={sections}
      extra={
        sectors.length > 0 ? (
          <section className="bsx-band bsx-band--dark">
            <div className="sv-container">
              {page?.sectors_eyebrow && <p className="bsx-eyebrow">{page.sectors_eyebrow}</p>}
              <ul className="bsx-sectors">
                {sectors.map((sector) => (
                  <li key={sector.id} className="bsx-sectors__item">
                    {sector.label}
                  </li>
                ))}
              </ul>
            </div>
          </section>
        ) : null
      }
      cta={{
        eyebrow: page?.cta_eyebrow ?? '',
        heading: page?.cta_heading ?? '',
        label: page?.cta_label ?? '',
        href: '/contact',
      }}
    />
  )
}
