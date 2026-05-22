import type { Metadata } from 'next'
import { SafeImage as Image } from '@/components/safe-image'
import { getContactPage, getGlobalSettings, getStrapiMedia } from '@/lib/strapi'
import { ContactForm } from '@/components/contact-form'

export const revalidate = 3600

export async function generateMetadata(): Promise<Metadata> {
  try {
    const page = await getContactPage()
    return {
      title: page.meta_title ?? 'Contact Us | SteinbergValentino Group',
      description: page.meta_description ?? 'Get in touch with SteinbergValentino Group.',
    }
  } catch {
    return { title: 'Contact Us | SteinbergValentino Group' }
  }
}

export default async function ContactPage() {
  let page = null
  let globalSettings = null

  try {
    ;[page, globalSettings] = await Promise.all([getContactPage(), getGlobalSettings()])
  } catch {
    /* Strapi offline */
  }

  const heroBg = getStrapiMedia(page?.hero_image?.url) ?? '/fallbacks/office-tower.webp'

  const address = page?.address ?? globalSettings?.address ?? null
  const phone   = page?.phone   ?? globalSettings?.contact_phone ?? null
  const email   = page?.email   ?? globalSettings?.contact_email ?? null

  return (
    <>
      <section className="sv-page-hero" style={{ minHeight: '32rem' }}>
        <Image
          src={heroBg}
          alt="Contact SteinbergValentino Group"
          fill
          sizes="100vw"
          priority
          style={{ objectFit: 'cover', objectPosition: 'center 60%' }}
        />
        <div className="sv-page-hero-overlay" />
        <div className="sv-container sv-page-hero-content">
          <p className="sv-eyebrow" style={{ color: 'var(--color-sv-gold)', marginBottom: 'var(--sv-sp-16)' }}>
            Get in Touch
          </p>
          <h1
            className="sv-display"
            style={{ color: 'var(--color-sv-white)', maxWidth: '600px', marginBottom: 'var(--sv-sp-16)' }}
          >
            {page?.hero_heading ?? 'Start a Confidential Consultation'}
          </h1>
          <p style={{ fontSize: '1.0625rem', color: 'rgba(255,255,255,0.72)', lineHeight: 1.72, maxWidth: '520px', fontWeight: 300 }}>
            {page?.hero_subheading ?? 'Schedule a call to explore how SteinbergValentino Group can elevate your company\'s capital markets profile.'}
          </p>
        </div>
      </section>

      <ContactForm address={address} phone={phone} email={email} />
    </>
  )
}
