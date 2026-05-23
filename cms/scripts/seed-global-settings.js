const Database = require('better-sqlite3')

const db = new Database('./database/.tmp/data.db')
db.pragma('foreign_keys = ON')

const now = new Date().toISOString()

const data = {
  documentId: 'global-settings-default',
  siteName: 'SteinbergValentino Group',
  tagline: 'The Best IR Firm For Small & Mid-Cap Businesses',
  utilityBarTagline: 'Strategic Investor Relations for Small & Mid-Cap Companies',
  footerBlurb: 'The premier investor relations firm for small and mid-cap public companies.',
  contactPhone: '(646) 535-3995',
  contactEmail: 'contact@steinbergvalentino.com',
  address: '100 Church Street, Suite 8010, Manhattan, New York 10007',
  footerCopyright: `© ${new Date().getFullYear()} SteinbergValentino Group. All rights reserved.`,
  primaryNavigation: [
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
  footerQuickLinks: [
    { label: 'Home', href: '/' },
    { label: 'How It Works', href: '/how-it-works' },
    { label: 'About Us', href: '/about' },
    { label: 'Capabilities', href: '/capabilities' },
    { label: 'Industry Expertise', href: '/industry-expertise' },
    { label: 'Contact Us', href: '/contact' },
    { label: 'Sitemap', href: '/sitemap' },
  ],
  footerServiceLinks: [
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
  footerExchangeLinks: [
    { label: 'NASDAQ Small Cap', href: '/exchanges/nasdaq-small-cap' },
    { label: 'OTC Markets', href: '/exchanges/otc-markets' },
    { label: 'Canadian TSX', href: '/exchanges/canadian-tsx' },
    { label: 'Canadian CSE', href: '/exchanges/canadian-cse' },
    { label: 'German Frankfurt', href: '/exchanges/german-frankfurt' },
  ],
  footerLegalLinks: [],
  sitemapHeading: 'Sitemap',
  sitemapIntro: 'A complete index of all pages on the SteinbergValentino Group website.',
  sitemapMetaTitle: 'Sitemap | SteinbergValentino Group',
  sitemapMetaDescription: 'Browse the full SteinbergValentino site structure, including firm pages, services, and exchange support pages.',
  socialFacebook: 'https://www.facebook.com/SteinbergValentinoGroup/',
  socialTwitter: 'https://twitter.com/SV__Group',
  socialInstagram: 'https://www.instagram.com/steinbergvalentinogroup',
  socialLinkedin: 'https://www.linkedin.com/company/steinberg-valentino-group/',
  socialPinterest: 'https://www.pinterest.com/SteinbergValentinoGroup',
}

const existing = db.prepare('SELECT id FROM global_settings ORDER BY id LIMIT 1').get()

const upsert = db.transaction(() => {
  if (existing) {
    db.prepare(`
      UPDATE global_settings SET
        document_id = ?, site_name = ?, tagline = ?, utility_bar_tagline = ?,
        footer_blurb = ?, contact_phone = ?, contact_email = ?, address = ?,
        footer_copyright = ?, primary_navigation = ?, footer_quick_links = ?,
        footer_service_links = ?, footer_exchange_links = ?, footer_legal_links = ?,
        sitemap_heading = ?, sitemap_intro = ?, sitemap_meta_title = ?,
        sitemap_meta_description = ?, social_facebook = ?, social_twitter = ?,
        social_instagram = ?, social_linkedin = ?, social_pinterest = ?,
        updated_at = ?, published_at = ?
      WHERE id = ?
    `).run(
      data.documentId, data.siteName, data.tagline, data.utilityBarTagline,
      data.footerBlurb, data.contactPhone, data.contactEmail, data.address,
      data.footerCopyright,
      JSON.stringify(data.primaryNavigation), JSON.stringify(data.footerQuickLinks),
      JSON.stringify(data.footerServiceLinks), JSON.stringify(data.footerExchangeLinks),
      JSON.stringify(data.footerLegalLinks),
      data.sitemapHeading, data.sitemapIntro, data.sitemapMetaTitle,
      data.sitemapMetaDescription, data.socialFacebook, data.socialTwitter,
      data.socialInstagram, data.socialLinkedin, data.socialPinterest,
      now, now,
      existing.id
    )
    console.log('Global settings updated, id:', existing.id)
  } else {
    const result = db.prepare(`
      INSERT INTO global_settings (
        document_id, site_name, tagline, utility_bar_tagline,
        footer_blurb, contact_phone, contact_email, address,
        footer_copyright, primary_navigation, footer_quick_links,
        footer_service_links, footer_exchange_links, footer_legal_links,
        sitemap_heading, sitemap_intro, sitemap_meta_title,
        sitemap_meta_description, social_facebook, social_twitter,
        social_instagram, social_linkedin, social_pinterest,
        created_at, updated_at, published_at
      ) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)
    `).run(
      data.documentId, data.siteName, data.tagline, data.utilityBarTagline,
      data.footerBlurb, data.contactPhone, data.contactEmail, data.address,
      data.footerCopyright,
      JSON.stringify(data.primaryNavigation), JSON.stringify(data.footerQuickLinks),
      JSON.stringify(data.footerServiceLinks), JSON.stringify(data.footerExchangeLinks),
      JSON.stringify(data.footerLegalLinks),
      data.sitemapHeading, data.sitemapIntro, data.sitemapMetaTitle,
      data.sitemapMetaDescription, data.socialFacebook, data.socialTwitter,
      data.socialInstagram, data.socialLinkedin, data.socialPinterest,
      now, now, now
    )
    console.log('Global settings inserted, id:', result.lastInsertRowid)
  }
})

upsert()
