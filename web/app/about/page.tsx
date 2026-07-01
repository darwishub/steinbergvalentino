import type { Metadata } from 'next'
import { getAboutPage, getGlobalSettings } from '@/lib/strapi'
import { ContactForm } from '@/components/contact-form'
import { getScrapedPageContent } from '@/lib/scraped-content'
import { BsxTemplate } from '@/components/bsx-template'

export const revalidate = 3600

export async function generateMetadata(): Promise<Metadata> {
  try {
    const page = await getAboutPage()
    return {
      title: page.meta_title ?? 'About the Firm | SteinbergValentino Group',
      description:
        page.meta_description ??
        'Learn about SteinbergValentino Group — the premier investor relations firm for small and mid-cap public companies.',
    }
  } catch {
    return {
      title: 'About the Firm | SteinbergValentino Group',
      description:
        'Learn about SteinbergValentino Group — the premier investor relations firm for small and mid-cap public companies.',
    }
  }
}

export default async function AboutPage() {
  let page = null
  let globalSettings = null
  const scrapedPage = getScrapedPageContent('about.html')
  try {
    ;[page, globalSettings] = await Promise.all([getAboutPage(), getGlobalSettings()])
  } catch {
    /* static fallback */
  }

  const heroHeading = page?.hero_heading ?? scrapedPage?.heroHeading ?? 'About SteinbergValentino Group'
  const heroSubheading = page?.hero_subheading ?? null
  const heroImage = page?.hero_image ?? null
  const sections = page?.sections?.length ? page.sections : (scrapedPage?.sections ?? [])
  const bodyContent = page?.body_content ?? scrapedPage?.bodyContent ?? null

  /* Contact form (preserved from the previous about layout) */
  const showForm = page?.show_contact_form ?? true
  const contactFormHeading = page?.contact_form_heading ?? null
  const contactFormSubhead = page?.contact_form_subheading ?? null
  const contactAddress = globalSettings?.address ?? null
  const contactPhone = globalSettings?.contact_phone ?? null
  const contactEmail = globalSettings?.contact_email ?? null

  return (
    <>
      <BsxTemplate
        eyebrow={page?.hero_eyebrow ?? ''}
        title={heroHeading}
        deck={heroSubheading}
        heroImage={heroImage}
        bodyContent={bodyContent}
        sections={sections}
        expandSections
        cta={{ eyebrow: '', heading: '', label: '', href: '/contact' }}
      />

      {showForm && (
        <ContactForm
          heading={contactFormHeading}
          subheading={contactFormSubhead}
          address={contactAddress}
          phone={contactPhone}
          email={contactEmail}
        />
      )}
    </>
  )
}
