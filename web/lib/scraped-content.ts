import analysis from '../data/analysis.json'
import type { ContentSection, StrapiBlock } from './types'

type RawPage = (typeof analysis.pages)[number]

interface ScrapedPageContent {
  metaTitle: string | null
  metaDescription: string | null
  heroHeading: string
  heroSubheading: string | null
  bodyContent: StrapiBlock[] | null
  sections: ContentSection[]
}

const SERVICE_FILE_BY_SLUG: Record<string, string> = {
  advisory: 'advisory.html',
  'strategic-advisory': 'strategic-advisory.html',
  'transactional-advisory': 'transactional-advisory.html',
  'capital-formation': 'capital-formation.html',
  'strategic-communications': 'strategic-communications.html',
  'financial-marketing': 'financial-marketing.html',
  'media-relations': 'media-relations.html',
  'media-strategy': 'media-strategy.html',
  'multicultural-engagement': 'multicultural-engagement.html',
  'market-entry': 'market-entry.html',
  'crises-management': 'crises-management.html',
  'litigation-communications': 'litigation-communications.html',
}

const EXCHANGE_FILE_BY_SLUG: Record<string, string> = {
  'nasdaq-small-cap': 'nasdaq-small-cap.html',
  'otc-markets': 'otc-markets.html',
  'canadian-tsx': 'canadian-tsx.html',
  'canadian-cse': 'canadian-cse.html',
  'german-frankfurt': 'german-frankfurt.html',
}

/** Patterns that indicate scraped text is a placeholder / footer artifact, not real page content */
const ARTIFACT_PATTERNS = [
  /Company overview and introduction section/i,
  /WordPress shortcodes not rendered/i,
  /featured image section/i,
  /Contact form section.*artifact/i,
  // Address / contact info lines scraped from footer
  /100 Church Street.*Suite/i,
  /support Hotline is available/i,
  /\(646\)\s*535-3995/,
]

function isArtifact(text: string): boolean {
  return ARTIFACT_PATTERNS.some((re) => re.test(text))
}

function uniqueParagraphs(texts: Array<string | undefined | null>) {
  const seen = new Set<string>()
  return texts
    .map((text) => text?.trim())
    .filter((text): text is string => typeof text === 'string' && Boolean(text) && !isArtifact(text))
    .filter((text) => {
      if (seen.has(text)) return false
      seen.add(text)
      return true
    })
}

function toBlocks(texts: string[]): StrapiBlock[] {
  return texts.map((text) => ({
    type: 'paragraph',
    children: [{ type: 'text', text }],
  }))
}

function buildSections(page: RawPage): ContentSection[] {
  return (page.sections ?? [])
    .filter((section) => section.type === 'content')
    .map((section, index) => ({
      id: index + 1,
      heading: section.heading || null,
      subheading: section.subheading || null,
      body: section.body_text?.trim()
        ? toBlocks([section.body_text.trim()])
        : null,
      image: null,
    }))
    .filter((section) => {
      if (!section.heading && !section.body?.length) return false
      const text = section.body?.[0]
      if (text?.type !== 'paragraph') return true
      const paragraph = text.children?.[0]?.text?.trim()
      if (!paragraph) return false
      return paragraph !== section.heading?.trim()
    })
}

function buildScrapedPageContent(page: RawPage): ScrapedPageContent {
  const heroSection = page.sections?.find((section) => section.type === 'hero')
  const heroHeading =
    heroSection?.heading?.trim() ||
    page.headings?.h1?.[0]?.trim() ||
    page.headings?.strong_headings?.[0]?.trim() ||
    page.page_name
  const heroSubheading =
    heroSection?.subheading?.trim() ||
    page.headings?.h2?.[0]?.trim() ||
    page.key_content_sections?.[0]?.heading?.trim() ||
    null
  /* Skip hero body_text when the section is flagged as dynamic/placeholder */
  const heroBodyText =
    heroSection && (heroSection as Record<string, unknown>).is_dynamic
      ? undefined
      : heroSection?.body_text

  const bodyParagraphs = uniqueParagraphs([
    heroBodyText,
    ...(page.paragraphs_preview ?? []),
  ])

  return {
    metaTitle: page.meta?.title ?? null,
    metaDescription: page.meta?.description ?? null,
    heroHeading,
    heroSubheading,
    bodyContent: bodyParagraphs.length ? toBlocks(bodyParagraphs) : null,
    sections: buildSections(page),
  }
}

function getPageByFile(file: string) {
  return analysis.pages.find((page) => page.file === file) ?? null
}

export function getScrapedPageContent(file: string): ScrapedPageContent | null {
  const page = getPageByFile(file)
  return page ? buildScrapedPageContent(page) : null
}

export function getScrapedServiceContent(slug: string): ScrapedPageContent | null {
  const file = SERVICE_FILE_BY_SLUG[slug]
  return file ? getScrapedPageContent(file) : null
}

export function getScrapedExchangeContent(slug: string): ScrapedPageContent | null {
  const file = EXCHANGE_FILE_BY_SLUG[slug]
  return file ? getScrapedPageContent(file) : null
}

export function getScrapedContactFormFields() {
  const page = getPageByFile('contact.html')
  return page?.form_fields?.fields ?? []
}
