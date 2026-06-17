import type { Metadata } from 'next'
import { getAllExchangePages, getExchangePage, getGlobalSettings } from '@/lib/strapi'
import { DEFAULT_GLOBAL_SETTINGS } from '@/lib/defaults'
import { notFound } from 'next/navigation'
import { getScrapedExchangeContent } from '@/lib/scraped-content'
import { BsxTemplate } from '@/components/bsx-template'

export const revalidate = 3600

interface Props {
  params: Promise<{ slug: string }>
}

export async function generateStaticParams() {
  try {
    const exchanges = await getAllExchangePages()
    return exchanges.map((e) => ({ slug: e.slug }))
  } catch {
    return []
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  try {
    const page = await getExchangePage(slug)
    if (!page) return { title: 'Exchange | SteinbergValentino Group' }
    return {
      title: page.meta_title ?? `${page.exchange_name} Listing Support | SteinbergValentino Group`,
      description:
        page.meta_description ??
        page.hero_subheading ??
        `SteinbergValentino Group supports companies listing on ${page.exchange_name}.`,
    }
  } catch {
    return { title: 'Exchange | SteinbergValentino Group' }
  }
}

export default async function ExchangeDetailPage({ params }: Props) {
  const { slug } = await params

  let page = null
  const scrapedPage = getScrapedExchangeContent(slug)
  try {
    page = await getExchangePage(slug)
  } catch {
    /* offline */
  }

  if (!page && !scrapedPage) notFound()

  const keyFacts: string[] = page?.key_facts?.length ? page.key_facts : []
  const faqItems = page?.faq_items ?? []

  let gs = DEFAULT_GLOBAL_SETTINGS
  try {
    gs = await getGlobalSettings()
  } catch {
    /* offline fallback */
  }

  const resolvedPage = page
    ? {
        hero_heading: page.hero_heading,
        hero_subheading: page.hero_subheading,
        hero_image: page.hero_image,
        body_content: page.body_content,
        sections: page.sections,
        exchange_name: page.exchange_name,
      }
    : {
        hero_heading: scrapedPage!.heroHeading,
        hero_subheading: scrapedPage!.heroSubheading,
        hero_image: null,
        body_content: scrapedPage!.bodyContent,
        sections: scrapedPage!.sections,
        exchange_name: scrapedPage!.heroHeading,
      }

  const fill = (tpl: string | null) =>
    (tpl ?? '').replace('{exchange}', resolvedPage.exchange_name ?? '')

  return (
    <BsxTemplate
      eyebrow={gs.exchange_hero_eyebrow ?? ''}
      title={resolvedPage.hero_heading}
      deck={resolvedPage.hero_subheading}
      breadcrumb={
        gs.exchange_breadcrumb_label
          ? { label: gs.exchange_breadcrumb_label, href: '/services/market-entry' }
          : undefined
      }
      heroImage={resolvedPage.hero_image}
      approachTitle={gs.exchange_approach_title ?? undefined}
      bodyContent={resolvedPage.body_content}
      sections={resolvedPage.sections}
      expandSections
      tightTop
      faqItems={faqItems}
      faqEyebrow={gs.faq_eyebrow}
      faqTitle={gs.faq_title}
      extra={
        keyFacts.length > 0 ? (
          <section className="bsx-band bsx-band--dark">
            <div className="sv-container">
              {gs.exchange_keyfacts_eyebrow && (
                <p className="bsx-eyebrow">{gs.exchange_keyfacts_eyebrow}</p>
              )}
              <ul className="bsx-keyfacts">
                {keyFacts.map((fact) => (
                  <li key={fact} className="bsx-keyfacts__item">
                    {fact}
                  </li>
                ))}
              </ul>
            </div>
          </section>
        ) : null
      }
      cta={{
        eyebrow: gs.exchange_cta_eyebrow ?? '',
        heading: fill(gs.exchange_cta_heading),
        label: gs.exchange_cta_label ?? '',
        href: '/contact',
      }}
    />
  )
}
