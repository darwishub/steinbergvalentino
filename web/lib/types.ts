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

export interface Testimonial {
  id: number
  name: string
  quote: string
}

export interface HomepageVideoConfig {
  src: string | null
  poster: string | null
}

export interface HomepageSectionsConfig {
  hero_video: HomepageVideoConfig | null
  offerings_eyebrow: string | null
  offerings_title: string | null
  offerings_cta_label: string | null
  offerings_cta_url: string | null
  offerings_stat_value: string | null
  offerings_stat_label: string | null
  capital_markets_eyebrow: string | null
  capital_markets_title: string | null
  capital_markets_body: string | null
  capital_markets_cta_label: string | null
  capital_markets_cta_url: string | null
  featured_services_eyebrow: string | null
  featured_services_title: string | null
  featured_services_cta_label: string | null
  featured_services_cta_url: string | null
  exchanges_eyebrow: string | null
  exchanges_title: string | null
  exchanges_cta_label: string | null
  exchanges_cta_url: string | null
  offerings_subheading: string | null
  offerings_body: string | null
  offerings_stat_note: string | null
  features_eyebrow: string | null
  features_title: string | null
  testimonials_eyebrow: string | null
  testimonials_title: string | null
  contact_eyebrow: string | null
  contact_title: string | null
  contact_body: string | null
  contact_cta_label: string | null
  contact_cta_url: string | null
  contact_secondary_cta_label: string | null
  contact_secondary_cta_url: string | null
  contact_lead_label: string | null
  contact_services_label: string | null
  carousel_slides: Array<{
    image_url: string
    title: string
    blurb: string
    cta_label: string
    cta_url: string
  }> | null
  exchanges_item_link_label: string | null
  marquee_text: string | null
  marquee_disclaimer: string | null
  newsletter_heading: string | null
}

export interface Sector {
  id: number
  label: string
  icon: string | null
}

export interface Highlight {
  id: number
  heading: string | null
  body: string | null
}

export interface Stat {
  id: number
  label: string | null
  value: string | null
}

export interface ContentSection {
  id: number
  eyebrow?: string | null
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
  hero_eyebrow: string | null
  hero_heading: string
  hero_subheading: string | null
  keyword_band: string[] | null
  hero_background: StrapiMedia | null
  hero_cta_primary_label: string | null
  hero_cta_primary_url: string | null
  hero_cta_secondary_label: string | null
  hero_cta_secondary_url: string | null
  body_content: StrapiBlock[] | null
  homepage_sections: HomepageSectionsConfig | null
  sections: ContentSection[]
  testimonials: Testimonial[]
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
  show_contact_form: boolean | null
  contact_form_heading: string | null
  contact_form_subheading: string | null
  hero_eyebrow: string | null
}

/** Shared microcopy fields present on the band-template single-type pages */
interface PageMicrocopy {
  hero_eyebrow: string | null
  approach_title: string | null
  cta_eyebrow: string | null
  cta_heading: string | null
  cta_label: string | null
}

export interface HowItWorksPage extends PageMicrocopy {
  id: number
  documentId: string
  hero_heading: string
  hero_subheading: string | null
  hero_image: StrapiMedia | null
  body_content: StrapiBlock[] | null
  sections: ContentSection[]
  overview_eyebrow: string | null
  overview_heading: string | null
  overview_image: StrapiMedia | null
  highlights: Highlight[]
  meta_title: string | null
  meta_description: string | null
}

export interface CapabilitiesPage extends PageMicrocopy {
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

export interface IndustryExpertisePage extends PageMicrocopy {
  id: number
  documentId: string
  hero_heading: string
  hero_subheading: string | null
  hero_image: StrapiMedia | null
  body_content: StrapiBlock[] | null
  sections: ContentSection[]
  sectors: Sector[]
  meta_title: string | null
  meta_description: string | null
  sectors_eyebrow: string | null
}

export interface ContactPage {
  id: number
  documentId: string
  hero_heading: string
  hero_subheading: string | null
  hero_image: StrapiMedia | null
  address: string | null
  phone: string | null
  email: string | null
  meta_title: string | null
  meta_description: string | null
  hero_eyebrow: string | null
  form_eyebrow: string | null
}

export interface ServicesListingPage {
  id: number
  documentId: string
  hero_heading: string | null
  hero_subheading: string | null
  hero_image: StrapiMedia | null
  approach_image: StrapiMedia | null
  meta_title: string | null
  meta_description: string | null
  hero_eyebrow: string | null
  card_cta_label: string | null
  cta_eyebrow: string | null
  cta_heading: string | null
  cta_label: string | null
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
  search_placeholder: string | null
  search_heading: string | null
  search_meta_title: string | null
  search_meta_description: string | null
  social_facebook: string | null
  social_twitter: string | null
  social_instagram: string | null
  social_linkedin: string | null
  social_pinterest: string | null
  /* ── UI microcopy (CMS-driven labels) ── */
  nav_cta_label: string | null
  footer_contact_heading: string | null
  footer_email_label: string | null
  footer_phone_label: string | null
  footer_office_label: string | null
  footer_firm_heading: string | null
  footer_services_heading: string | null
  footer_exchanges_heading: string | null
  faq_eyebrow: string | null
  faq_title: string | null
  search_eyebrow: string | null
  search_button_label: string | null
  search_empty_text: string | null
  search_type_page: string | null
  search_type_service: string | null
  search_type_exchange: string | null
  search_results_singular: string | null
  search_results_plural: string | null
  form_first_name_label: string | null
  form_last_name_label: string | null
  form_email_label: string | null
  form_message_label: string | null
  form_submit_label: string | null
  form_submitting_label: string | null
  form_success_heading: string | null
  form_success_body: string | null
  label_read_more: string | null
  label_all_services: string | null
  label_view_details: string | null
  service_overview_eyebrow: string | null
  service_overview_band_eyebrow: string | null
  service_engage_heading: string | null
  service_engage_body: string | null
  service_engage_cta_label: string | null
  service_back_label: string | null
  service_approach_title: string | null
  service_cta_eyebrow: string | null
  service_cta_heading: string | null
  service_cta_label: string | null
  service_news_eyebrow: string | null
  service_news_heading: string | null
  service_news_cta_label: string | null
  exchange_hero_eyebrow: string | null
  exchange_breadcrumb_label: string | null
  exchange_approach_title: string | null
  exchange_keyfacts_eyebrow: string | null
  exchange_cta_eyebrow: string | null
  exchange_cta_heading: string | null
  exchange_cta_label: string | null
  service_breadcrumb_label: string | null
  sitemap_eyebrow: string | null
  sitemap_firm_heading: string | null
  sitemap_services_heading: string | null
  sitemap_exchanges_heading: string | null
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
  overview_image?: StrapiMedia | null
  overview_heading?: string | null
  body_content: StrapiBlock[] | null
  highlights?: Highlight[]
  stat_headline_label?: string | null
  stat_headline_value?: string | null
  stats?: Stat[]
  media_band_image?: StrapiMedia | null
  quote_text?: string | null
  quote_author?: string | null
  quote_role?: string | null
  quote_image?: StrapiMedia | null
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
  key_facts: string[] | null
  faq_items?: { id: number; question: string; answer: StrapiBlock[] }[]
  meta_title: string | null
  meta_description: string | null
}

export interface Article {
  id: number
  documentId: string
  title: string
  slug: string
  category: string | null
  excerpt: string | null
  publishedAt: string | null
  cover_image: StrapiMedia | null
  body_content: StrapiBlock[] | null
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
