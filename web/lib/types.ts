/* ─── Strapi v5 flat response types ─────────────────────────────────────── */

export interface StrapiMedia {
  id: number
  documentId: string
  name: string
  alternativeText: string | null
  url: string
  width: number
  height: number
  formats: {
    thumbnail?: { url: string; width: number; height: number }
    small?: { url: string; width: number; height: number }
    medium?: { url: string; width: number; height: number }
    large?: { url: string; width: number; height: number }
  } | null
}

export type StrapiBlock =
  | { type: 'paragraph'; children: StrapiInline[] }
  | { type: 'heading'; level: 1 | 2 | 3 | 4 | 5 | 6; children: StrapiInline[] }
  | { type: 'list'; format: 'ordered' | 'unordered'; children: StrapiListItem[] }
  | { type: 'quote'; children: StrapiInline[] }
  | { type: 'image'; image: StrapiMedia; children: StrapiInline[] }

export interface StrapiInline {
  type: 'text'
  text: string
  bold?: boolean
  italic?: boolean
  underline?: boolean
}

export interface StrapiListItem {
  type: 'list-item'
  children: StrapiInline[]
}

export interface ContentSection {
  id: number
  heading: string | null
  subheading: string | null
  body: StrapiBlock[] | null
  image?: StrapiMedia | null
}

export interface SiteLink {
  label: string
  href: string
}

export interface GlobalNavItem extends SiteLink {
  children?: SiteLink[]
}

/* ─── Single Types ───────────────────────────────────────────────────────── */

export interface Homepage {
  id: number
  documentId: string
  hero_heading: string
  hero_subheading: string | null
  hero_background: StrapiMedia | null
  hero_cta_primary_label: string | null
  hero_cta_primary_url: string | null
  hero_cta_secondary_label: string | null
  hero_cta_secondary_url: string | null
  body_content: StrapiBlock[] | null
  sections: ContentSection[]
  meta_title: string | null
  meta_description: string | null
}

export interface AboutPage {
  id: number
  documentId: string
  hero_heading: string
  hero_subheading: string | null
  hero_image: StrapiMedia | null
  body_content: StrapiBlock[] | null
  sections: ContentSection[]
  meta_title: string | null
  meta_description: string | null
}

export interface HowItWorksPage {
  id: number
  documentId: string
  hero_heading: string
  hero_subheading: string | null
  hero_image: StrapiMedia | null
  body_content: StrapiBlock[] | null
  sections: ContentSection[]
  meta_title: string | null
  meta_description: string | null
}

export interface CapabilitiesPage {
  id: number
  documentId: string
  hero_heading: string
  hero_subheading: string | null
  hero_image: StrapiMedia | null
  body_content: StrapiBlock[] | null
  sections: ContentSection[]
  meta_title: string | null
  meta_description: string | null
}

export interface IndustryExpertisePage {
  id: number
  documentId: string
  hero_heading: string
  hero_subheading: string | null
  hero_image: StrapiMedia | null
  body_content: StrapiBlock[] | null
  sections: ContentSection[]
  meta_title: string | null
  meta_description: string | null
}

export interface ContactPage {
  id: number
  documentId: string
  hero_heading: string
  hero_subheading: string | null
  address: string | null
  phone: string | null
  email: string | null
  meta_title: string | null
  meta_description: string | null
}

export interface GlobalSettings {
  id: number
  documentId: string
  site_name: string | null
  tagline: string | null
  footer_blurb: string | null
  contact_phone: string | null
  contact_email: string | null
  address: string | null
  footer_copyright: string | null
  primary_navigation: GlobalNavItem[] | null
  footer_quick_links: SiteLink[] | null
  footer_service_links: SiteLink[] | null
  footer_exchange_links: SiteLink[] | null
  footer_legal_links: SiteLink[] | null
  sitemap_heading: string | null
  sitemap_intro: string | null
  sitemap_meta_title: string | null
  sitemap_meta_description: string | null
}

/* ─── Collection Types ───────────────────────────────────────────────────── */

export interface ServicePage {
  id: number
  documentId: string
  title: string
  slug: string
  hero_heading: string
  hero_subheading: string | null
  hero_image: StrapiMedia | null
  body_content: StrapiBlock[] | null
  sections: ContentSection[]
  faq_items?: { id: number; question: string; answer: StrapiBlock[] }[]
  meta_title: string | null
  meta_description: string | null
}

export interface ExchangePage {
  id: number
  documentId: string
  title: string
  slug: string
  exchange_name: string
  country: string
  hero_heading: string
  hero_subheading: string | null
  hero_image: StrapiMedia | null
  body_content: StrapiBlock[] | null
  sections: ContentSection[]
  meta_title: string | null
  meta_description: string | null
}

export interface StrapiListResponse<T> {
  data: T[]
  meta: {
    pagination: {
      page: number
      pageSize: number
      pageCount: number
      total: number
    }
  }
}

export interface StrapiSingleResponse<T> {
  data: T
}
