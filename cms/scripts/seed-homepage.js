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
      'We have a diverse pool of talent that can help businesses grow, and we can help investors make smart decisions so they can grow their portfolios and increase their net worth.'
    ),
    paragraph(
      'Be sure to get in touch with us to find out what we can do for you or your business!'
    ),
  ],
  section: {
    heading: 'Unmatched expertise in small-cap IR',
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
  testimonials: [
    {
      name: 'Abrahram Mirman',
      quote:
        "My company is a new player in the stock market, so I needed a way to improve awareness and stock value. Through a series of aggressive campaigns by SV Group, I've been able to get my stock value up even higher than I expected, and it looks like it will continue in the months ahead.",
    },
    {
      name: 'Paul Tavis McKenzie',
      quote:
        "After taking my company public, it was a challenge to get investors aware of what we have to offer. My exposure in the market has increased, and I've been seeing my stock value go up higher than I expected.",
    },
    {
      name: 'Yat Man Lai',
      quote:
        "Their campaigns have been extremely helpful in getting me more market exposure, and my stock's value has gone up more than I expected. I've been happy with them so far, and I look forward to growing my company.",
    },
  ],
  metaTitle: 'SteinbergValentino Group | Investor Relations Services',
  metaDescription:
    'Strategic investor relations, capital markets advisory, and market awareness services for small and mid-cap public companies.',
}

const existingHomepage = db
  .prepare('SELECT id FROM homepages ORDER BY id LIMIT 1')
  .get()

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
