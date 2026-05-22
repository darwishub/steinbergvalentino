import type { GlobalSettings } from './types'

export const DEFAULT_GLOBAL_SETTINGS: GlobalSettings = {
  id: 0,
  documentId: 'default-global-settings',
  site_name: 'SteinbergValentino Group',
  tagline: 'The Best IR Firm For Small & Mid-Cap Businesses',
  footer_blurb:
    'The premier investor relations firm for small and mid-cap public companies.',
  contact_phone: '(646) 535-3995',
  contact_email: 'contact@steinbergvalentino.com',
  address: '100 Church Street, Suite 8010, Manhattan, New York 10007',
  footer_copyright: `© ${new Date().getFullYear()} SteinbergValentino Group. All rights reserved.`,
  primary_navigation: [
    { label: 'Home', href: '/' },
    {
      label: 'About',
      href: '/about',
      children: [
        { label: 'How It Works', href: '/how-it-works' },
        { label: 'About Us', href: '/about' },
        { label: 'Capabilities', href: '/capabilities' },
        { label: 'Industry Expertise', href: '/industry-expertise' },
        { label: 'Financial Marketing', href: '/services/financial-marketing' },
      ],
    },
    {
      label: 'Advisory',
      href: '/services/advisory',
      children: [
        { label: 'Strategic Advisory', href: '/services/strategic-advisory' },
        { label: 'Strategic Communications', href: '/services/strategic-communications' },
        { label: 'Transactional Advisory', href: '/services/transactional-advisory' },
        { label: 'Capital Formation', href: '/services/capital-formation' },
        { label: 'Crises Management', href: '/services/crises-management' },
        { label: 'Litigation Communications', href: '/services/litigation-communications' },
      ],
    },
    {
      label: 'Market Entry',
      href: '/services/market-entry',
      children: [
        { label: 'Media Relations', href: '/services/media-relations' },
        { label: 'Media Strategy', href: '/services/media-strategy' },
        { label: 'Multicultural Engagement', href: '/services/multicultural-engagement' },
      ],
    },
    {
      label: 'Exchanges',
      href: '/exchanges/otc-markets',
      children: [
        { label: 'NASDAQ Small Cap', href: '/exchanges/nasdaq-small-cap' },
        { label: 'OTC Markets', href: '/exchanges/otc-markets' },
        { label: 'Canadian TSX', href: '/exchanges/canadian-tsx' },
        { label: 'Canadian CSE', href: '/exchanges/canadian-cse' },
        { label: 'German Frankfurt', href: '/exchanges/german-frankfurt' },
      ],
    },
  ],
  footer_quick_links: [
    { label: 'Home', href: '/' },
    { label: 'How It Works', href: '/how-it-works' },
    { label: 'About Us', href: '/about' },
    { label: 'Capabilities', href: '/capabilities' },
    { label: 'Industry Expertise', href: '/industry-expertise' },
    { label: 'Contact Us', href: '/contact' },
    { label: 'Sitemap', href: '/sitemap' },
  ],
  footer_service_links: [
    { label: 'Advisory', href: '/services/advisory' },
    { label: 'Strategic Advisory', href: '/services/strategic-advisory' },
    { label: 'Strategic Communications', href: '/services/strategic-communications' },
    { label: 'Transactional Advisory', href: '/services/transactional-advisory' },
    { label: 'Capital Formation', href: '/services/capital-formation' },
    { label: 'Crises Management', href: '/services/crises-management' },
    { label: 'Market Entry', href: '/services/market-entry' },
    { label: 'Media Relations', href: '/services/media-relations' },
    { label: 'Media Strategy', href: '/services/media-strategy' },
    { label: 'Multicultural Engagement', href: '/services/multicultural-engagement' },
    { label: 'Financial Marketing', href: '/services/financial-marketing' },
    { label: 'Litigation Communications', href: '/services/litigation-communications' },
  ],
  footer_exchange_links: [
    { label: 'NASDAQ Small Cap', href: '/exchanges/nasdaq-small-cap' },
    { label: 'OTC Markets', href: '/exchanges/otc-markets' },
    { label: 'Canadian TSX', href: '/exchanges/canadian-tsx' },
    { label: 'Canadian CSE', href: '/exchanges/canadian-cse' },
    { label: 'German Frankfurt', href: '/exchanges/german-frankfurt' },
  ],
  footer_legal_links: [],
  sitemap_heading: 'Sitemap',
  sitemap_intro:
    'Browse every migrated SteinbergValentino page in the rebuilt Next.js and Strapi experience.',
  sitemap_meta_title: 'Sitemap | SteinbergValentino Group',
  sitemap_meta_description:
    'Browse the full SteinbergValentino site structure, including firm pages, services, and exchange support pages.',
}
