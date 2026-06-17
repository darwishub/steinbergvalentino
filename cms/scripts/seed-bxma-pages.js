/**
 * Seeds the BXMA-style template data for the 4 service pages that follow it:
 * market-entry, media-relations, media-strategy, multicultural-engagement.
 *
 * Adds: stat headline + stats, a full-bleed media band image, and a quote block.
 * (overview_heading + highlights + sections already seeded separately.)
 *
 * Run with Node 18 from cms/ while Strapi is stopped:
 *   node scripts/seed-bxma-pages.js
 */
const Database = require('better-sqlite3')
const db = new Database('./database/.tmp/data.db')
db.pragma('foreign_keys = ON')

const data = {
  'market-entry': {
    statLabel: 'Markets We Help You Enter',
    statValue: '25+',
    stats: [
      ['Track Record', '30+ Years'],
      ['Investor Network', '40,000+'],
    ],
    mediaImage: 'about.webp',
    quote:
      "Entering a new market is never just about being present — it's about being understood. Our job is to make sure the right people know you, trust you, and act.",
    author: 'Daniel Steinberg',
    role: 'Managing Partner, SteinbergValentino Group',
    quoteImage: 'business-man-holding-clipboard-with-why-choose-us-question_23-2148932318.jpg',
  },
  'media-relations': {
    statLabel: 'Media Placements Secured',
    statValue: '1,200+',
    stats: [
      ['Top-Tier Outlets', '150+'],
      ['Track Record', '30+ Years'],
    ],
    mediaImage: 'capabilities.webp',
    quote:
      "Coverage is only valuable when it's intentional. Every relationship we build with a journalist is built to serve our clients' story for years, not headlines for a day.",
    author: 'Marcus Valentino',
    role: 'Head of Media, SteinbergValentino Group',
    quoteImage: 'business-woman-talking-with-two-businessmen (1).jpg',
  },
  'media-strategy': {
    statLabel: 'Campaigns Delivered',
    statValue: '500+',
    stats: [
      ['Continued Exposure', '12 Months+'],
      ['Investor Network', '40,000+'],
    ],
    mediaImage: 'how-it-works.webp',
    quote:
      'A great media strategy keeps a company visible long after the news cycle moves on. That continuity is what turns attention into trust.',
    author: 'Elena Hart',
    role: 'Director of Strategy, SteinbergValentino Group',
    quoteImage: 'business-man-holding-clipboard-with-why-choose-us-question_23-2148932318.jpg',
  },
  'multicultural-engagement': {
    statLabel: 'Communities Reached',
    statValue: '30+',
    stats: [
      ['Languages Covered', '12'],
      ['Track Record', '30+ Years'],
    ],
    mediaImage: 'industry-expertise.webp',
    quote:
      'The audiences other firms overlook are often the ones that matter most. Meeting people in their own language and context is how real engagement begins.',
    author: 'Priya Nair',
    role: 'Head of Engagement, SteinbergValentino Group',
    quoteImage: 'business-woman-talking-with-two-businessmen (1).jpg',
  },
}

const getPage = db.prepare('SELECT id FROM service_pages WHERE slug = ? LIMIT 1')
const getFile = db.prepare('SELECT id FROM files WHERE name = ? ORDER BY id DESC LIMIT 1')
const setFields = db.prepare(
  `UPDATE service_pages
   SET stat_headline_label = ?, stat_headline_value = ?,
       quote_text = ?, quote_author = ?, quote_role = ?
   WHERE id = ?`
)

// stats component helpers
const getStatLinks = db.prepare(
  "SELECT cmp_id FROM service_pages_cmps WHERE entity_id = ? AND field = 'stats'"
)
const delStatLinks = db.prepare(
  "DELETE FROM service_pages_cmps WHERE entity_id = ? AND field = 'stats'"
)
const delStat = db.prepare('DELETE FROM components_shared_stats WHERE id = ?')
const insStat = db.prepare('INSERT INTO components_shared_stats (label, value) VALUES (?, ?)')
const insStatLink = db.prepare(
  `INSERT INTO service_pages_cmps (entity_id, cmp_id, component_type, field, "order")
   VALUES (?, ?, 'shared.stat', 'stats', ?)`
)

// media link helpers
const unlinkMedia = db.prepare(
  "DELETE FROM files_related_mph WHERE related_id = ? AND related_type = 'api::service-page.service-page' AND field = ?"
)
const linkMedia = db.prepare(
  "INSERT INTO files_related_mph (file_id, related_id, related_type, field, \"order\") VALUES (?, ?, 'api::service-page.service-page', ?, 1)"
)
const relinkMedia = (fileName, pageId, field) => {
  const f = getFile.get(fileName)
  if (!f) throw new Error(`media not found: ${fileName}`)
  unlinkMedia.run(pageId, field)
  linkMedia.run(f.id, pageId, field)
}

for (const [slug, d] of Object.entries(data)) {
  const page = getPage.get(slug)
  if (!page) {
    console.log(`SKIP ${slug}: not found`)
    continue
  }

  setFields.run(d.statLabel, d.statValue, d.quote, d.author, d.role, page.id)

  // reseed stats
  for (const { cmp_id } of getStatLinks.all(page.id)) delStat.run(cmp_id)
  delStatLinks.run(page.id)
  d.stats.forEach(([label, value], i) => {
    const res = insStat.run(label, value)
    insStatLink.run(page.id, res.lastInsertRowid, i + 1)
  })

  relinkMedia(d.mediaImage, page.id, 'media_band_image')
  relinkMedia(d.quoteImage, page.id, 'quote_image')

  console.log(`${slug}: stats(${d.stats.length}) + media + quote`)
}

console.log('done')
