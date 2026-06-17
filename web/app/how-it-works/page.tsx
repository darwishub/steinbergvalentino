import type { Metadata } from 'next'
import { getHowItWorksPage } from '@/lib/strapi'
import { getScrapedPageContent } from '@/lib/scraped-content'
import { BsxTemplate } from '@/components/bsx-template'

export const revalidate = 3600

export async function generateMetadata(): Promise<Metadata> {
  try {
    const page = await getHowItWorksPage()
    return {
      title: page.meta_title ?? 'How It Works | SteinbergValentino Group',
      description:
        page.meta_description ??
        'Discover how SteinbergValentino Group builds and executes investor relations programs for public companies.',
    }
  } catch {
    return {
      title: 'How It Works | SteinbergValentino Group',
      description:
        'Discover how SteinbergValentino Group builds and executes investor relations programs for public companies.',
    }
  }
}

export default async function HowItWorksPage() {
  let page = null
  const scrapedPage = getScrapedPageContent('how-it-works.html')
  try {
    page = await getHowItWorksPage()
  } catch {
    /* static fallback */
  }

  const heroHeading = page?.hero_heading ?? scrapedPage?.heroHeading ?? 'How It Works'
  const heroSubheading = page?.hero_subheading ?? scrapedPage?.heroSubheading ?? null
  const heroImage = page?.hero_image ?? null
  const sections = page?.sections?.length ? page.sections : (scrapedPage?.sections ?? [])
  const bodyContent = page?.body_content ?? scrapedPage?.bodyContent ?? null

  return (
    <BsxTemplate
      eyebrow={page?.hero_eyebrow ?? ''}
      title={heroHeading}
      deck={heroSubheading}
      heroImage={heroImage}
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
