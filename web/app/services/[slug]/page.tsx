import { SafeImage as Image } from '@/components/safe-image'
import Link from 'next/link'
import type { Metadata } from 'next'
import { getAllServicePages, getServicePage, getStrapiMedia } from '@/lib/strapi'
import { BlocksContent } from '@/components/blocks-content'
import { notFound } from 'next/navigation'
import { getScrapedServiceContent } from '@/lib/scraped-content'

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

  const resolvedPage = page
    ? {
        hero_heading: page.hero_heading,
        hero_subheading: page.hero_subheading,
        hero_image: page.hero_image,
        body_content: page.body_content,
        sections: page.sections,
        faq_items: page.faq_items,
        title: page.title,
      }
    : {
        hero_heading: scrapedPage!.heroHeading,
        hero_subheading: scrapedPage!.heroSubheading,
        hero_image: null,
        body_content: scrapedPage!.bodyContent,
        sections: scrapedPage!.sections,
        faq_items: [],
        title: scrapedPage!.heroHeading,
      }

  return (
    <>
      {/* ── Dark Cinematic Hero ──────────────────────────────────────────── */}
      <section className="svc-hero">
        {/* Background photo from Strapi hero_image */}
        {resolvedPage.hero_image && (
          <div className="exc2-hero__bg" aria-hidden="true">
            <Image
              src={getStrapiMedia(resolvedPage.hero_image.url) ?? resolvedPage.hero_image.url}
              alt=""
              width={resolvedPage.hero_image.width || 1600}
              height={resolvedPage.hero_image.height || 900}
              priority
              sizes="100vw"
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
            <div className="exc2-hero__overlay" />
          </div>
        )}

        <div className="sv-container svc-hero__inner" style={{ position: 'relative', zIndex: 1 }}>
          {/* Breadcrumb */}
          <nav className="sv-breadcrumb">
            <Link href="/services" className="sv-breadcrumb-link">Services</Link>
            <span style={{ color: 'rgba(255,255,255,0.22)', fontSize: '0.7rem' }}>›</span>
            <span className="sv-breadcrumb-current">{resolvedPage.title}</span>
          </nav>

          <p className="sv-eyebrow svc-hero__eyebrow">Our Services</p>
          <h1 className="svc-hero__title">{resolvedPage.hero_heading}</h1>
          {resolvedPage.hero_subheading && (
            <p className="svc-hero__deck">{resolvedPage.hero_subheading}</p>
          )}
        </div>
        <div className="svc-hero__rule" style={{ position: 'relative', zIndex: 1 }} />
      </section>

      {/* ── Body + Sidebar ────────────────────────────────────────────────── */}
      {resolvedPage.body_content && resolvedPage.body_content.length > 0 && (
        <section className="sv-section">
          <div className="sv-container">
            <div className="svc-body-grid">
              <div>
                <BlocksContent blocks={resolvedPage.body_content} className="svc-prose" />
              </div>

              {/* Sidebar CTA */}
              <aside className="svc-sidebar">
                <div className="svc-sidebar__rule" />
                <h3 className="svc-sidebar__heading">
                  Interested in {resolvedPage.title}?
                </h3>
                <p className="svc-sidebar__body">
                  Speak with our team to learn how this service can be tailored to your
                  company&apos;s needs and objectives.
                </p>
                <Link href="/contact" className="sv-btn sv-btn-primary svc-sidebar__btn">
                  Contact Us
                </Link>
                <Link href="/services" className="svc-sidebar__back">
                  ← All Services
                </Link>
              </aside>
            </div>
          </div>
        </section>
      )}

      {/* ── Content Sections ─────────────────────────────────────────────── */}
      {resolvedPage.sections?.map((section, i) => (
        <section key={section.id} className={`sv-section ${i % 2 === 0 ? 'sv-bg-light' : ''}`}>
          <div className="sv-container">
            <div
              className={
                section.image
                  ? 'svc-section-grid svc-section-grid--with-image'
                  : 'svc-section-grid svc-section-grid--full'
              }
            >
              <div>
                {section.heading && (
                  <h2 className="svc-section__heading">{section.heading}</h2>
                )}
                {section.subheading && (
                  <p className="svc-section__subheading">{section.subheading}</p>
                )}
                {section.body && <BlocksContent blocks={section.body} className="svc-prose" />}
              </div>

              {section.image && (
                <div className="svc-section__img-wrap">
                  <Image
                    src={getStrapiMedia(section.image.url) ?? section.image.url}
                    alt={section.image.alternativeText ?? section.heading ?? ''}
                    width={section.image.width || 800}
                    height={section.image.height || 600}
                    sizes="(max-width: 1024px) 100vw, 50vw"
                  />
                </div>
              )}
            </div>
          </div>
        </section>
      ))}

      {/* ── FAQ ──────────────────────────────────────────────────────────── */}
      {resolvedPage.faq_items && resolvedPage.faq_items.length > 0 && (
        <section className="sv-section sv-bg-light">
          <div className="sv-container">
            <div className="svc-faq-header">
              <p className="sv-eyebrow svc-faq-header__eyebrow">FAQ</p>
              <h2 className="svc-faq-header__title">Frequently Asked Questions</h2>
            </div>

            <div className="svc-faq-list">
              {resolvedPage.faq_items.map((faq) => (
                <details key={faq.id} className="svc-faq-item">
                  <summary>
                    {faq.question}
                    <span className="svc-faq-item__toggle">+</span>
                  </summary>
                  <div className="svc-faq-item__answer">
                    <BlocksContent blocks={faq.answer} />
                  </div>
                </details>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── Bottom CTA Band ──────────────────────────────────────────────── */}
      <section className="sv-bg-dark svc-cta-band">
        <div className="sv-container svc-cta-band__inner">
          <div>
            <p className="sv-eyebrow svc-cta-band__eyebrow">Next Step</p>
            <h2 className="svc-cta-band__heading">
              Ready to put {resolvedPage.title} to work for your company?
            </h2>
          </div>
          <Link href="/contact" className="sv-btn sv-btn-gold">
            Contact Our Team
          </Link>
        </div>
      </section>
    </>
  )
}
