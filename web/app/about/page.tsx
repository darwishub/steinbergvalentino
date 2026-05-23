import { SafeImage as Image } from '@/components/safe-image'
import type { Metadata } from 'next'
import { getAboutPage, getGlobalSettings, getStrapiMedia } from '@/lib/strapi'
import { BlocksContent } from '@/components/blocks-content'
import { ContactForm } from '@/components/contact-form'
import { getScrapedPageContent } from '@/lib/scraped-content'

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

  const heroHeading    = page?.hero_heading    ?? scrapedPage?.heroHeading    ?? 'About SteinbergValentino Group'
  const heroSubheading = page?.hero_subheading ?? scrapedPage?.heroSubheading ?? null
  const heroImage      = page?.hero_image      ?? null
  const sections       = page?.sections?.length ? page.sections : (scrapedPage?.sections ?? [])
  const bodyContent    = page?.body_content    ?? scrapedPage?.bodyContent    ?? null

  /* Contact form */
  const showForm            = page?.show_contact_form ?? true
  const contactFormHeading  = page?.contact_form_heading    ?? null
  const contactFormSubhead  = page?.contact_form_subheading ?? null
  const contactAddress      = globalSettings?.address       ?? null
  const contactPhone        = globalSettings?.contact_phone ?? null
  const contactEmail        = globalSettings?.contact_email ?? null

  return (
    <>
      {/* ── Split-Screen Hero ─────────────────────────────────────────────── */}
      <section className="ab-hero">
        {/* Left: dark content panel */}
        <div className="ab-hero__left">
          <p className="sv-eyebrow ab-hero__eyebrow">About the Firm</p>
          <h1 className="ab-hero__title">{heroHeading}</h1>
          {heroSubheading && (
            <p className="ab-hero__deck">{heroSubheading}</p>
          )}
        </div>

        {/* Right: full-bleed photo */}
        <div className="ab-hero__right">
          <Image
            src={heroImage ? (getStrapiMedia(heroImage.url) ?? heroImage.url) : '/firm-about.png'}
            alt="SteinbergValentino Group — investor relations professionals"
            width={heroImage?.width || 960}
            height={heroImage?.height || 720}
            priority
            sizes="50vw"
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
          <div className="ab-hero__right-overlay" aria-hidden="true" />
        </div>

        <div className="ab-hero__rule" aria-hidden="true" />
      </section>

      {/* ── Body prose ───────────────────────────────────────────────────── */}
      {bodyContent && bodyContent.length > 0 && (
        <section className="ab-body">
          <div className="sv-container">
            <div className="ab-body__prose">
              <BlocksContent blocks={bodyContent} />
            </div>
          </div>
        </section>
      )}

      {/* ── Editorial Sections ───────────────────────────────────────────── */}
      {sections.map((section, i) => {
        const imgSrc = section.image
          ? getStrapiMedia(section.image.url) ?? section.image.url
          : null
        const isDark = i % 2 === 1

        return (
          <section
            key={section.id ?? i}
            className="ab-section"
            style={{ background: isDark ? 'var(--color-sv-dark)' : 'var(--color-sv-white)' }}
          >
            <div className="sv-container">
              {imgSrc ? (
                <div className="ab-section__grid">
                  <div>
                    {section.heading && (
                      <h2 className={`ab-section__heading${isDark ? ' ab-section__heading--light' : ''}`}>
                        {section.heading}
                      </h2>
                    )}
                    {section.subheading && (
                      <p className={`ab-section__sub${isDark ? ' ab-section__sub--light' : ''}`}>
                        {section.subheading}
                      </p>
                    )}
                    {section.body && (
                      <div className={isDark ? 'sv-prose-light' : ''}>
                        <BlocksContent blocks={section.body} />
                      </div>
                    )}
                  </div>
                  <div className="ab-section__img-wrap">
                    <Image
                      src={imgSrc}
                      alt={section.image!.alternativeText ?? section.heading ?? ''}
                      width={section.image!.width || 800}
                      height={section.image!.height || 600}
                      sizes="(max-width: 900px) 100vw, 50vw"
                    />
                  </div>
                </div>
              ) : (
                <div style={{ maxWidth: '760px' }}>
                  {section.heading && (
                    <h2 className={`ab-section__heading${isDark ? ' ab-section__heading--light' : ''}`}>
                      {section.heading}
                    </h2>
                  )}
                  {section.subheading && (
                    <p className={`ab-section__sub${isDark ? ' ab-section__sub--light' : ''}`}>
                      {section.subheading}
                    </p>
                  )}
                  {section.body && (
                    <div className={isDark ? 'sv-prose-light' : ''}>
                      <BlocksContent blocks={section.body} />
                    </div>
                  )}
                </div>
              )}
            </div>
          </section>
        )
      })}

      {/* ── Contact Form (from old site) ────────────────────────────────── */}
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
