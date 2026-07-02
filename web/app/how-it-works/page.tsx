import type { Metadata } from 'next'
import Link from 'next/link'
import { getHowItWorksPage, getGlobalSettings, getRelatedArticle, getStrapiMedia } from '@/lib/strapi'
import { getScrapedPageContent } from '@/lib/scraped-content'
import { BsxTemplate } from '@/components/bsx-template'
import { SafeImage as Image } from '@/components/safe-image'
import { DEFAULT_GLOBAL_SETTINGS } from '@/lib/defaults'
import type { Article, GlobalSettings, Highlight, StrapiMedia } from '@/lib/types'

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

function WhatWeDo({
  eyebrow,
  heading,
  image,
  highlights,
}: {
  eyebrow: string | null
  heading: string | null
  image: StrapiMedia | null
  highlights: Highlight[]
}) {
  if (!heading && highlights.length === 0) return null

  return (
    <section className="bsx-band bsx-band--dark">
      <div className="sv-container">
        {eyebrow && <p className="bsx-eyebrow">{eyebrow}</p>}
        {heading && <h2 className="bsx-statement">{heading}</h2>}

        <div className={image ? 'bsx-overview bsx-overview--media' : 'bsx-overview'}>
          {image && (
            <div className="bsx-overview__media">
              <Image
                src={getStrapiMedia(image.url) ?? image.url}
                alt={image.alternativeText ?? ''}
                width={image.width || 1200}
                height={image.height || 800}
                sizes="(max-width: 1024px) 100vw, 45vw"
              />
            </div>
          )}

          <div className="bsx-overview__col">
            {highlights.length > 0 && (
              <div className="bsx-highlights">
                {highlights.map((h) => (
                  <div key={h.id} className="bsx-highlight">
                    {h.heading && <h3 className="bsx-highlight__heading">{h.heading}</h3>}
                    {h.body && <p className="bsx-highlight__body">{h.body}</p>}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}

function NewsInsights({
  gs,
  article,
  heading,
  fallbackImage,
}: {
  gs: GlobalSettings
  article: Article | null
  heading: string
  fallbackImage: StrapiMedia | null
}) {
  if (!article) return null

  const cover = article.cover_image ?? fallbackImage

  return (
    <section className="bsx-band bxma-news">
      <div className="sv-container">
        {gs.service_news_eyebrow && <p className="bsx-eyebrow">{gs.service_news_eyebrow}</p>}
        {gs.service_news_heading && (
          <h2 className="bxma-news__title">{gs.service_news_heading.replace('{service}', heading)}</h2>
        )}

        <Link href={`/search?q=${encodeURIComponent(article.title)}`} className="bxma-news__card">
          <div className="bxma-news__body">
            {article.category && <p className="bxma-news__cat">{article.category}</p>}
            <h3 className="bxma-news__headline">{article.title}</h3>
            {article.excerpt && <p className="bxma-news__excerpt">{article.excerpt}</p>}
            <span className="bxma-news__cta">
              {gs.service_news_cta_label}
              <span className="bsx-arrowlink__circle" aria-hidden="true">
                →
              </span>
            </span>
          </div>
          {cover && (
            <div className="bxma-news__media">
              <Image
                src={getStrapiMedia(cover.url) ?? cover.url}
                alt={article.cover_image?.alternativeText ?? article.title}
                width={cover.width || 800}
                height={cover.height || 600}
                sizes="(max-width: 1024px) 100vw, 50vw"
              />
            </div>
          )}
        </Link>
      </div>
    </section>
  )
}

export default async function HowItWorksPage() {
  let page = null
  const scrapedPage = getScrapedPageContent('how-it-works.html')
  try {
    page = await getHowItWorksPage()
  } catch {
    /* static fallback */
  }

  let gs = DEFAULT_GLOBAL_SETTINGS
  let article: Article | null = null
  try {
    gs = await getGlobalSettings()
    article = await getRelatedArticle()
  } catch {
    /* no news band */
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
      tightTop
      approachTitle={page?.approach_title ?? undefined}
      bodyContent={bodyContent}
      sections={sections}
      extra={
        <>
          <WhatWeDo
            eyebrow={page?.overview_eyebrow ?? null}
            heading={page?.overview_heading ?? null}
            image={page?.overview_image ?? null}
            highlights={page?.highlights ?? []}
          />
          <NewsInsights
            gs={gs}
            article={article}
            heading={page?.hero_eyebrow || 'How It Works'}
            fallbackImage={heroImage}
          />
        </>
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
