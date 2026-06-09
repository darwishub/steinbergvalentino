import {
  getHomepage,
  getAboutPage,
  getHowItWorksPage,
  getCapabilitiesPage,
  getIndustryExpertisePage,
  getContactPage,
  getServicesListingPage,
  getAllServicePages,
  getAllExchangePages,
} from './strapi'
import type { ContentSection, StrapiBlock } from './types'

/* ─── Searchable document model ──────────────────────────────────────────── */

export interface SearchDoc {
  title: string
  url: string
  type: 'Page' | 'Service' | 'Exchange'
  /** Short human-readable blurb shown under the result title */
  description: string
  /** Lower-cased title, used for ranking */
  titleLc: string
  /** Lower-cased concatenation of everything searchable, used for ranking */
  haystackLc: string
  /** Original-case body text, used to build a contextual snippet around a match */
  body: string
}

export interface SearchResult {
  title: string
  url: string
  type: SearchDoc['type']
  snippet: string
}

/* ─── Text extraction helpers ────────────────────────────────────────────── */

/** Flatten Strapi blocks (paragraphs, headings, lists, quotes) into plain text. */
export function blocksToPlainText(blocks: StrapiBlock[] | null | undefined): string {
  if (!blocks?.length) return ''
  const out: string[] = []
  const walk = (children: unknown[]) => {
    for (const child of children) {
      if (!child || typeof child !== 'object') continue
      const node = child as { text?: unknown; children?: unknown }
      if (typeof node.text === 'string') out.push(node.text)
      if (Array.isArray(node.children)) walk(node.children)
    }
  }
  for (const block of blocks) {
    const children = (block as { children?: unknown }).children
    if (Array.isArray(children)) walk(children)
  }
  return normalize(out.join(' '))
}

function sectionsText(sections?: ContentSection[] | null): string {
  if (!sections?.length) return ''
  return sections
    .map((s) => [s.heading, s.subheading, blocksToPlainText(s.body)].filter(Boolean).join(' '))
    .join(' ')
}

function faqText(
  faq?: { question: string; answer: StrapiBlock[] }[] | null,
): string {
  if (!faq?.length) return ''
  return faq
    .map((f) => [f.question, blocksToPlainText(f.answer)].filter(Boolean).join(' '))
    .join(' ')
}

function normalize(text: string): string {
  return text.replace(/\s+/g, ' ').trim()
}

function makeDoc(args: {
  title: string
  url: string
  type: SearchDoc['type']
  description?: string | null
  body: string
  extra?: Array<string | null | undefined>
}): SearchDoc {
  const { title, url, type, description, body, extra = [] } = args
  const haystack = normalize([title, ...extra, body].filter(Boolean).join(' '))
  return {
    title,
    url,
    type,
    description: normalize(description || body).slice(0, 180),
    titleLc: title.toLowerCase(),
    haystackLc: haystack.toLowerCase(),
    body: normalize(body),
  }
}

/* ─── Index builder ──────────────────────────────────────────────────────── */

/**
 * Aggregate every public page + collection entry into a flat, searchable index.
 * Each fetch is independently guarded so a single Strapi failure degrades
 * gracefully (that document is simply omitted) rather than breaking search.
 */
export async function getSearchIndex(): Promise<SearchDoc[]> {
  const [home, about, how, capabilities, industry, contact, servicesListing, services, exchanges] =
    await Promise.all([
      getHomepage().catch(() => null),
      getAboutPage().catch(() => null),
      getHowItWorksPage().catch(() => null),
      getCapabilitiesPage().catch(() => null),
      getIndustryExpertisePage().catch(() => null),
      getContactPage().catch(() => null),
      getServicesListingPage().catch(() => null),
      getAllServicePages().catch(() => []),
      getAllExchangePages().catch(() => []),
    ])

  const docs: SearchDoc[] = []

  /* Core single-type pages — labels match the nav / sitemap */
  docs.push(
    makeDoc({
      title: 'Home',
      url: '/',
      type: 'Page',
      description: home?.meta_description ?? home?.hero_subheading,
      body: [
        home?.hero_heading,
        home?.hero_subheading,
        blocksToPlainText(home?.body_content),
        sectionsText(home?.sections),
      ]
        .filter(Boolean)
        .join(' '),
      extra: [home?.meta_title, home?.hero_eyebrow, ...(home?.keyword_band ?? [])],
    }),
  )

  if (about) {
    docs.push(
      makeDoc({
        title: 'About',
        url: '/about',
        type: 'Page',
        description: about.meta_description ?? about.hero_subheading,
        body: [
          about.hero_heading,
          about.hero_subheading,
          blocksToPlainText(about.body_content),
          sectionsText(about.sections),
        ]
          .filter(Boolean)
          .join(' '),
        extra: [about.meta_title],
      }),
    )
  }

  if (how) {
    docs.push(
      makeDoc({
        title: 'How It Works',
        url: '/how-it-works',
        type: 'Page',
        description: how.meta_description ?? how.hero_subheading,
        body: [
          how.hero_heading,
          how.hero_subheading,
          blocksToPlainText(how.body_content),
          sectionsText(how.sections),
        ]
          .filter(Boolean)
          .join(' '),
        extra: [how.meta_title],
      }),
    )
  }

  if (capabilities) {
    docs.push(
      makeDoc({
        title: 'Capabilities',
        url: '/capabilities',
        type: 'Page',
        description: capabilities.meta_description ?? capabilities.hero_subheading,
        body: [
          capabilities.hero_heading,
          capabilities.hero_subheading,
          blocksToPlainText(capabilities.body_content),
          sectionsText(capabilities.sections),
        ]
          .filter(Boolean)
          .join(' '),
        extra: [capabilities.meta_title],
      }),
    )
  }

  if (industry) {
    docs.push(
      makeDoc({
        title: 'Industry Expertise',
        url: '/industry-expertise',
        type: 'Page',
        description: industry.meta_description ?? industry.hero_subheading,
        body: [
          industry.hero_heading,
          industry.hero_subheading,
          blocksToPlainText(industry.body_content),
          sectionsText(industry.sections),
        ]
          .filter(Boolean)
          .join(' '),
        extra: [industry.meta_title, ...(industry.sectors?.map((s) => s.label) ?? [])],
      }),
    )
  }

  if (contact) {
    docs.push(
      makeDoc({
        title: 'Contact Us',
        url: '/contact',
        type: 'Page',
        description: contact.meta_description ?? contact.hero_subheading,
        body: [contact.hero_heading, contact.hero_subheading, contact.address, contact.email, contact.phone]
          .filter(Boolean)
          .join(' '),
        extra: [contact.meta_title],
      }),
    )
  }

  docs.push(
    makeDoc({
      title: 'Services',
      url: '/services',
      type: 'Page',
      description: servicesListing?.meta_description ?? servicesListing?.hero_subheading,
      body: [servicesListing?.hero_heading, servicesListing?.hero_subheading].filter(Boolean).join(' '),
      extra: [servicesListing?.meta_title],
    }),
  )

  docs.push(
    makeDoc({
      title: 'Sitemap',
      url: '/sitemap',
      type: 'Page',
      description: 'A complete index of all pages on the SteinbergValentino Group website.',
      body: 'Sitemap site index all pages',
    }),
  )

  /* Service collection */
  for (const service of services) {
    docs.push(
      makeDoc({
        title: service.title,
        url: `/services/${service.slug}`,
        type: 'Service',
        description: service.meta_description ?? service.hero_subheading,
        body: [
          service.hero_heading,
          service.hero_subheading,
          blocksToPlainText(service.body_content),
          sectionsText(service.sections),
          faqText(service.faq_items),
        ]
          .filter(Boolean)
          .join(' '),
        extra: [service.meta_title],
      }),
    )
  }

  /* Exchange collection */
  for (const exchange of exchanges) {
    docs.push(
      makeDoc({
        title: exchange.exchange_name || exchange.title,
        url: `/exchanges/${exchange.slug}`,
        type: 'Exchange',
        description: exchange.meta_description ?? exchange.hero_subheading,
        body: [
          exchange.title,
          exchange.country,
          exchange.hero_heading,
          exchange.hero_subheading,
          ...(exchange.key_facts ?? []),
          blocksToPlainText(exchange.body_content),
          sectionsText(exchange.sections),
          faqText(exchange.faq_items),
        ]
          .filter(Boolean)
          .join(' '),
        extra: [exchange.meta_title],
      }),
    )
  }

  return docs
}

/* ─── Ranking ────────────────────────────────────────────────────────────── */

/**
 * Rank documents against a query. Scoring favours, in order:
 * full-phrase title match, full-phrase body match, per-token title hits,
 * then per-token body frequency (capped). Docs with no token hit are dropped.
 */
export function runSearch(docs: SearchDoc[], rawQuery: string): SearchResult[] {
  const phrase = rawQuery.trim().toLowerCase()
  if (!phrase) return []
  const tokens = Array.from(new Set(phrase.split(/\s+/).filter((t) => t.length > 1)))
  if (!tokens.length) return []

  const scored = docs
    .map((doc) => {
      let score = 0
      if (doc.titleLc === phrase) score += 50
      else if (doc.titleLc.includes(phrase)) score += 25
      if (phrase.includes(' ') && doc.haystackLc.includes(phrase)) score += 10

      for (const token of tokens) {
        if (doc.titleLc.includes(token)) score += 10
        const occurrences = doc.haystackLc.split(token).length - 1
        if (occurrences > 0) score += 1 + Math.min(occurrences, 4)
      }
      return { doc, score }
    })
    .filter((s) => s.score > 0)

  scored.sort((a, b) => b.score - a.score || a.doc.title.localeCompare(b.doc.title))

  return scored.map(({ doc }) => ({
    title: doc.title,
    url: doc.url,
    type: doc.type,
    snippet: buildSnippet(doc, tokens),
  }))
}

/** Build a ~180-char snippet, preferring a window centred on the first token match. */
function buildSnippet(doc: SearchDoc, tokens: string[]): string {
  const source = doc.body || doc.description
  if (!source) return doc.description
  const lower = source.toLowerCase()
  let idx = -1
  for (const token of tokens) {
    const found = lower.indexOf(token)
    if (found !== -1 && (idx === -1 || found < idx)) idx = found
  }
  if (idx === -1) return doc.description || source.slice(0, 180)

  const radius = 90
  const start = Math.max(0, idx - radius)
  const end = Math.min(source.length, idx + radius)
  let snippet = source.slice(start, end).trim()
  if (start > 0) snippet = `…${snippet}`
  if (end < source.length) snippet = `${snippet}…`
  return snippet
}
