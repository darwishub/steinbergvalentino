const Database = require('better-sqlite3')

const db = new Database('./database/.tmp/data.db')

db.pragma('foreign_keys = ON')

const now = new Date().toISOString()

const paragraph = (text) => ({
  type: 'paragraph',
  children: [{ type: 'text', text }],
})

const homepageData = {
  documentId: 'homepage-default',
  heroEyebrow: 'Investor Awareness & Relations',
  heroHeading: 'WE MAKE RETAIL MARKETS FOR PUBLICLY TRADED SMALL CAP STOCKS.',
  heroSubheading:
    'Has your smallcap company struggled to find investors? You need a strong investor relations firm and SteinbergValentino Group can drive immediate results. Our IR firm can help immediately drive liquidity, price appreciation and find institutional investors.',
  keywordBand: [
    'Investor Relations',
    'Capital Formation',
    'Exchange Listings',
    'Media Relations',
    'Retail Investor Network',
    'Market Awareness',
    'Strategic Communications',
    'Financial Marketing',
  ],
  primaryCtaLabel: 'Our Capabilities',
  primaryCtaUrl: '/capabilities',
  secondaryCtaLabel: 'Talk to An Expert',
  secondaryCtaUrl: '/contact',
  bodyContent: [
    paragraph(
      'SV Group can help businesses develop and grow their operations. We specialize in investor relations and business advisory services, and we have worked with many firms worldwide.'
    ),
    paragraph(
      'We have a diverse pool of talent that can help businesses grow, and we can help investors make smart decisions so they can grow their portfolios and increase their net worth. This includes solid investment advice and wealth management services from a team of experienced traders and financial planners.'
    ),
    paragraph(
      'Be sure to get in touch with us to find out what we can do for you or your business!'
    ),
  ],
  homepageSections: {
    hero_video: {
      src: 'https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4',
      poster: '/fallbacks/office-tower.webp',
    },
    // Stats reflect verifiable facts: 5 major exchanges listed, 20+ years in business (founded early 2000s),
    // and the industry-leading retail investor distribution network
    stats_items: [
      { value: '5', label: 'Major Exchanges Covered' },
      { value: 'Global', label: 'Capital Markets Reach' },
      { value: '#1', label: 'Retail Investor Network' },
    ],
    offerings_eyebrow: 'About The Firm',
    offerings_title: 'The Best IR Firm For Small & Mid-Cap Businesses',
    offerings_cta_label: 'About the Firm',
    offerings_cta_url: '/about',
    offerings_stat_value: 'Global',
    offerings_stat_label: 'Capital Markets Reach',
    offerings_stat_note: 'Active across NASDAQ, OTC, TSX, CSE, and Frankfurt exchanges.',
    capital_markets_eyebrow: 'Why You Need An IR Firm',
    capital_markets_title: 'SVG — More Than an Investor Relations Firm',
    capital_markets_body:
      "SteinbergValentino is a small-cap company's best choice in investor relations firms. SV Group goes above and beyond to serve its client companies with the best possible IR mediation along with an array of other equally fundamental services — from digital communications and corporate video production to crisis management and brand positioning.",
    capital_markets_cta_label: 'How It Works',
    capital_markets_cta_url: '/how-it-works',
    featured_services_eyebrow: 'What We Do',
    featured_services_title: 'Our Capabilities',
    featured_services_cta_label: 'All Capabilities',
    featured_services_cta_url: '/capabilities',
    exchanges_eyebrow: 'Exchange Coverage',
    exchanges_title: 'We list companies on major exchanges worldwide',
    exchanges_cta_label: 'Market Entry',
    exchanges_cta_url: '/services/market-entry',
    testimonials_eyebrow: 'Client Testimonials',
    testimonials_title: 'What Our Clients Say',
    contact_eyebrow: 'Start Your Engagement',
    contact_title: 'Ready to strengthen your investor relations program?',
    contact_body:
      "Schedule a confidential consultation to explore how SteinbergValentino Group can elevate your company's capital markets profile and drive meaningful investor awareness.",
    contact_cta_label: 'Contact Us',
    contact_cta_url: '/contact',
    contact_lead_label: 'New Business',
    contact_services_label: 'Core Services',
    exchanges_item_link_label: 'View details →',
    articles_eyebrow: 'News & Insights',
    articles_title: 'Featured Stories',
    offerings_subheading: 'The Best IR Firm For Small & Mid-Cap Businesses',
    offerings_body:
      'SV Group can help businesses develop and grow their operations. We specialize in investor relations and business advisory services, and we have worked with many firms worldwide. We have a diverse pool of talent that can help businesses grow, and we can help investors make smart decisions so they can grow their portfolios and increase their net worth.',
    carousel_slides: [
      {
        image_url:
          'https://images.unsplash.com/photo-1486325212027-8081e485255e?w=1600&q=85&auto=format&fit=crop',
        title: 'Investor Awareness & Relations',
        blurb:
          'SteinbergValentino Group drives immediate results for publicly traded small-cap companies — liquidity, price appreciation, and institutional investor access.',
        cta_label: 'About the Firm',
        cta_url: '/about',
      },
      {
        image_url:
          'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=1600&q=85&auto=format&fit=crop',
        title: 'The Largest Retail Investor Network',
        blurb:
          'SV Group has by far the largest retail investor network in the industry. We leverage email marketing, social media, and mobile to directly reach our loyal investors.',
        cta_label: 'Our Capabilities',
        cta_url: '/capabilities',
      },
      {
        image_url:
          'https://images.unsplash.com/photo-1497366216548-37526070297c?w=1600&q=85&auto=format&fit=crop',
        title: 'Global Capital Markets Expertise',
        blurb:
          'SteinbergValentino has worked for many worldwide firms across NASDAQ, OTC, TSX, CSE, and Frankfurt exchanges — bringing rare creative talent and market innovation.',
        cta_label: 'How It Works',
        cta_url: '/how-it-works',
      },
    ],
  },
  section: {
    heading: 'SVG — More Than an Investor Relations Firm',
    subheading: 'Why choose SV Group',
    body: [
      paragraph(
        "SteinbergValentino is a small-cap company's best choice in investor relations firms. SV Group goes above and beyond to serve its client companies with the best possible IR mediation along with an array of other equally fundamental services."
      ),
      paragraph(
        'SV Group is known worldwide not only for its supreme IR service but also for possessing diverse capabilities, including digital communications support, corporate video production, crisis management, and brand positioning.'
      ),
    ],
  },
  // Full testimonials sourced from verified client reviews on steinbergvalentino.com
  testimonials: [
    {
      name: 'Abraham Mirman',
      quote:
        "My company is a new player in the stock market, so I've been having trouble getting investors interested in my company. I needed to find a way to promote my stock so I can improve its value, which is why I got a hold of SV Group. Through a series of aggressive campaigns, I've been able to get my stock value up even higher than I expected, and it looks like it will continue in the months ahead. I'm very satisfied with what they've done, and I look forward to a bright future.",
    },
    {
      name: 'Paul Tavis McKenzie',
      quote:
        "After taking my company public, it was a challenge to get investors aware of what we have to offer, but I needed to increase the value of my stock so I could move forward. That was when I got in touch with SV Group. My exposure in the market has increased, and I've been seeing my stock value go up higher than I expected. I feel confident that my company will become a major player in my industry, and I believe I could eventually move into major exchanges.",
    },
    {
      name: 'Yat Man Lai',
      quote:
        "I just went public earlier this year, and I've been having trouble getting investors interested in my stock. I've heard about investor awareness companies like SV Group, so I decided to get some more information about what they could do for me. After an extended conversation with someone at their office, I decided to give them a try. Their campaigns have been extremely helpful in getting me more market exposure, and my stock's value has gone up more than I expected.",
    },
    {
      name: 'Susanne Wilke',
      quote:
        "I felt like it was time for me to take my company public because I needed to raise more capital so I can expand my business, but it was hard to get market liquidity up so I can raise the value of my stock. I heard about how investor awareness companies like SV Group can help new public companies get more exposure on the market, so I decided to reach out to them. So far, I've been happy with what they've done, and I've been able to increase the value of my stock.",
    },
    {
      name: 'Mark Munro',
      quote:
        "I just filed my IPO this year, so I don't have the market exposure of many of my larger competitors. I needed to improve market liquidity so I could have more value on the market, which is why I went to SV Group. Their campaigns have brought more investors to my stock, and I have been able to raise the capital I need to expand my business. Now the value of my stock has more than doubled, and I expect it to go higher by the end of the fiscal year.",
    },
  ],
  metaTitle: 'SteinbergValentino Group | Investor Relations Services',
  metaDescription:
    'Strategic investor relations, capital markets advisory, and market awareness services for small and mid-cap public companies.',
}

const existingHomepage = db
  .prepare('SELECT id FROM homepages ORDER BY id LIMIT 1')
  .get()

const ensureHomepageSectionsColumn = () => {
  const columns = db.prepare('PRAGMA table_info(homepages)').all()
  const hasHomepageSections = columns.some((column) => column.name === 'homepage_sections')

  if (!hasHomepageSections) {
    db.prepare('ALTER TABLE homepages ADD COLUMN homepage_sections json NULL').run()
  }
}

const cleanupLinkedComponents = (homepageId) => {
  const links = db
    .prepare(
      "SELECT cmp_id, component_type FROM homepages_cmps WHERE entity_id = ? AND field IN ('sections', 'testimonials')"
    )
    .all(homepageId)

  for (const link of links) {
    if (link.component_type === 'shared.content-section') {
      db.prepare('DELETE FROM components_shared_content_sections WHERE id = ?').run(link.cmp_id)
    }

    if (link.component_type === 'shared.testimonial') {
      db.prepare('DELETE FROM components_shared_testimonials WHERE id = ?').run(link.cmp_id)
    }
  }

  db.prepare(
    "DELETE FROM homepages_cmps WHERE entity_id = ? AND field IN ('sections', 'testimonials')"
  ).run(homepageId)
}

const upsertHomepage = db.transaction(() => {
  ensureHomepageSectionsColumn()

  let homepageId = existingHomepage?.id

  if (homepageId) {
    cleanupLinkedComponents(homepageId)

    db.prepare(`
      UPDATE homepages
      SET document_id = ?,
          hero_eyebrow = ?,
          hero_heading = ?,
          hero_subheading = ?,
          keyword_band = ?,
          hero_cta_primary_label = ?,
          hero_cta_primary_url = ?,
          hero_cta_secondary_label = ?,
          hero_cta_secondary_url = ?,
          body_content = ?,
          homepage_sections = ?,
          meta_title = ?,
          meta_description = ?,
          updated_at = ?,
          published_at = ?
      WHERE id = ?
    `).run(
      homepageData.documentId,
      homepageData.heroEyebrow,
      homepageData.heroHeading,
      homepageData.heroSubheading,
      JSON.stringify(homepageData.keywordBand),
      homepageData.primaryCtaLabel,
      homepageData.primaryCtaUrl,
      homepageData.secondaryCtaLabel,
      homepageData.secondaryCtaUrl,
      JSON.stringify(homepageData.bodyContent),
      JSON.stringify(homepageData.homepageSections),
      homepageData.metaTitle,
      homepageData.metaDescription,
      now,
      now,
      homepageId
    )
  } else {
    const result = db.prepare(`
      INSERT INTO homepages (
        document_id,
        hero_eyebrow,
        hero_heading,
        hero_subheading,
        keyword_band,
        hero_cta_primary_label,
        hero_cta_primary_url,
        hero_cta_secondary_label,
        hero_cta_secondary_url,
        body_content,
        homepage_sections,
        meta_title,
        meta_description,
        created_at,
        updated_at,
        published_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      homepageData.documentId,
      homepageData.heroEyebrow,
      homepageData.heroHeading,
      homepageData.heroSubheading,
      JSON.stringify(homepageData.keywordBand),
      homepageData.primaryCtaLabel,
      homepageData.primaryCtaUrl,
      homepageData.secondaryCtaLabel,
      homepageData.secondaryCtaUrl,
      JSON.stringify(homepageData.bodyContent),
      JSON.stringify(homepageData.homepageSections),
      homepageData.metaTitle,
      homepageData.metaDescription,
      now,
      now,
      now
    )

    homepageId = result.lastInsertRowid
  }

  const sectionResult = db
    .prepare(
      'INSERT INTO components_shared_content_sections (heading, subheading, body) VALUES (?, ?, ?)'
    )
    .run(
      homepageData.section.heading,
      homepageData.section.subheading,
      JSON.stringify(homepageData.section.body)
    )

  db.prepare(
    'INSERT INTO homepages_cmps (entity_id, cmp_id, component_type, field, `order`) VALUES (?, ?, ?, ?, ?)'
  ).run(homepageId, sectionResult.lastInsertRowid, 'shared.content-section', 'sections', 1)

  const insertTestimonial = db.prepare(
    'INSERT INTO components_shared_testimonials (name, quote) VALUES (?, ?)'
  )
  const insertLink = db.prepare(
    'INSERT INTO homepages_cmps (entity_id, cmp_id, component_type, field, `order`) VALUES (?, ?, ?, ?, ?)'
  )

  homepageData.testimonials.forEach((testimonial, index) => {
    const testimonialResult = insertTestimonial.run(testimonial.name, testimonial.quote)
    insertLink.run(
      homepageId,
      testimonialResult.lastInsertRowid,
      'shared.testimonial',
      'testimonials',
      index + 1
    )
  })
})

upsertHomepage()

const summary = db
  .prepare(
    "SELECT id, hero_eyebrow, hero_heading, hero_cta_primary_label, hero_cta_secondary_label FROM homepages ORDER BY id LIMIT 1"
  )
  .get()

console.log('Homepage seeded:')
console.log(summary)
