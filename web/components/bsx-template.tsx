import { SafeImage as Image } from '@/components/safe-image'
import Link from 'next/link'
import type { ReactNode } from 'react'
import { getStrapiMedia } from '@/lib/strapi'
import { BlocksContent } from '@/components/blocks-content'
import type { StrapiBlock, StrapiMedia, ContentSection } from '@/lib/types'

/**
 * Shared Blackstone-style page layout (the BXMA / advisory template).
 * Data-driven: a band only renders when its real content exists — no
 * fabricated stats/quotes. Used by how-it-works, capabilities,
 * industry-expertise and exchange detail pages.
 */
interface BsxTemplateProps {
  eyebrow: string
  title: string
  deck?: string | null
  breadcrumb?: { label: string; href: string }
  heroImage?: StrapiMedia | null
  approachTitle?: string
  bodyContent?: StrapiBlock[] | null
  sections?: ContentSection[]
  /** when true, sections render as open article content instead of a collapsed accordion */
  expandSections?: boolean
  /** when true, tightens the gap between the hero media and the approach band */
  tightTop?: boolean
  /** extra bands rendered between the approach section and the FAQ/CTA */
  extra?: ReactNode
  faqItems?: { id: number; question: string; answer: StrapiBlock[] }[]
  faqEyebrow?: string | null
  faqTitle?: string | null
  cta: { eyebrow: string; heading: string; label: string; href: string }
}

export function BsxTemplate({
  eyebrow,
  title,
  deck,
  breadcrumb,
  heroImage,
  approachTitle,
  bodyContent,
  sections,
  expandSections = false,
  tightTop = false,
  extra,
  faqItems,
  faqEyebrow,
  faqTitle,
  cta,
}: BsxTemplateProps) {
  const hasBody = !!bodyContent && bodyContent.length > 0
  const hasSections = !!sections && sections.length > 0
  const hasFaq = !!faqItems && faqItems.length > 0

  return (
    <>
      {/* ── Intro header ─────────────────────────────────────────────────── */}
      <section className="bsx-intro">
        <div className="sv-container">
          {breadcrumb && (
            <nav className="bsx-breadcrumb">
              <Link href={breadcrumb.href}>{breadcrumb.label}</Link>
              <span aria-hidden="true">›</span>
              <span>{title}</span>
            </nav>
          )}

          {eyebrow && <p className="bsx-eyebrow">{eyebrow}</p>}
          <div className="bsx-intro__grid">
            <h1 className="bsx-intro__title">{title}</h1>
            {deck && <p className="bsx-intro__deck">{deck}</p>}
          </div>
        </div>
      </section>

      {/* ── Full-bleed hero media ────────────────────────────────────────── */}
      {heroImage && (
        <section className={tightTop ? 'bsx-media bsx-media--tight' : 'bsx-media'}>
          <div className="sv-container">
            <div className="bsx-media__frame">
              <Image
                src={getStrapiMedia(heroImage.url) ?? heroImage.url}
                alt=""
                width={heroImage.width || 1600}
                height={heroImage.height || 900}
                priority
                sizes="100vw"
              />
            </div>
          </div>
        </section>
      )}

      {/* ── Our Approach — intro prose + sections accordion ──────────────── */}
      {(hasBody || hasSections) && (
        <section
          className={
            tightTop ? 'bsx-band bxma-approach bxma-approach--tight' : 'bsx-band bxma-approach'
          }
        >
          <div className="sv-container">
            {approachTitle && <h2 className="bxma-approach__title">{approachTitle}</h2>}

            {hasBody && (
              <div className="bxma-approach__lead">
                <BlocksContent blocks={bodyContent!} className="bsx-prose" />
              </div>
            )}

            {hasSections &&
              (expandSections ? (
                <div className="bsx-article">
                  {sections!.map((s) => (
                    <article key={s.id} className="bsx-article__item">
                      {s.heading && <h3 className="bsx-article__heading">{s.heading}</h3>}
                      {s.subheading && <p className="bsx-article__sub">{s.subheading}</p>}
                      {s.body && <BlocksContent blocks={s.body} className="bsx-prose" />}
                    </article>
                  ))}
                </div>
              ) : (
                <div className="bsx-faq__list bxma-accordion">
                  {sections!.map((s) => (
                    <details key={s.id} className="bsx-faq__item">
                      <summary>
                        {s.heading}
                        <span className="bsx-faq__chev" aria-hidden="true" />
                      </summary>
                      <div className="bsx-faq__answer">
                        {s.subheading && <p className="bxma-accordion__sub">{s.subheading}</p>}
                        {s.body && <BlocksContent blocks={s.body} />}
                      </div>
                    </details>
                  ))}
                </div>
              ))}
          </div>
        </section>
      )}

      {extra}

      {/* ── FAQ ──────────────────────────────────────────────────────────── */}
      {hasFaq && (
        <section className="bsx-band">
          <div className="sv-container">
            <div className="bsx-faq__head">
              {faqEyebrow && <p className="bsx-eyebrow">{faqEyebrow}</p>}
              {faqTitle && <h2 className="bsx-faq__title">{faqTitle}</h2>}
            </div>
            <div className="bsx-faq__list">
              {faqItems!.map((f) => (
                <details key={f.id} className="bsx-faq__item">
                  <summary>
                    {f.question}
                    <span className="bsx-faq__chev" aria-hidden="true" />
                  </summary>
                  <div className="bsx-faq__answer">
                    <BlocksContent blocks={f.answer} />
                  </div>
                </details>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── CTA band ─────────────────────────────────────────────────────── */}
      {(cta.eyebrow || cta.heading || cta.label) && (
        <section className="bsx-band bsx-band--dark bsx-cta">
          <div className="sv-container bsx-cta__grid">
            <div>
              {cta.eyebrow && <p className="bsx-eyebrow">{cta.eyebrow}</p>}
              {cta.heading && <h2 className="bsx-cta__heading">{cta.heading}</h2>}
            </div>
            {cta.label && (
              <Link href={cta.href} className="bsx-btn">
                {cta.label}
              </Link>
            )}
          </div>
        </section>
      )}
    </>
  )
}
