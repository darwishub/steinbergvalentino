import type { Metadata } from 'next'
import { getCapabilitiesPage } from '@/lib/strapi'
import { getScrapedPageContent } from '@/lib/scraped-content'
import { BsxTemplate } from '@/components/bsx-template'

export const revalidate = 3600

export async function generateMetadata(): Promise<Metadata> {
  try {
    const page = await getCapabilitiesPage()
    return {
      title: page.meta_title ?? 'Capabilities | SteinbergValentino Group',
      description:
        page.meta_description ??
        'Explore the full range of investor relations and capital markets capabilities offered by SteinbergValentino Group.',
    }
  } catch {
    return {
      title: 'Capabilities | SteinbergValentino Group',
      description:
        'Explore the full range of investor relations and capital markets capabilities offered by SteinbergValentino Group.',
    }
  }
}

export default async function CapabilitiesPage() {
  let page = null
  const scrapedPage = getScrapedPageContent('capabilities.html')
  try {
    page = await getCapabilitiesPage()
  } catch {
    /* static fallback */
  }

  const heroHeading = page?.hero_heading ?? scrapedPage?.heroHeading ?? 'Capabilities'
  const heroSubheading = page?.hero_subheading ?? scrapedPage?.heroSubheading ?? null
  const sections = page?.sections?.length ? page.sections : (scrapedPage?.sections ?? [])
  const bodyContent = page?.body_content ?? scrapedPage?.bodyContent ?? null
  const heroImage = page?.hero_image ?? null

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
      cta={{
        eyebrow: page?.cta_eyebrow ?? '',
        heading: page?.cta_heading ?? '',
        label: page?.cta_label ?? '',
        href: '/contact',
      }}
    />
  )
}
