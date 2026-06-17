/**
 * Seeds Blackstone-style presentation data onto service pages:
 *  - eyebrow label per content section (requires the `eyebrow` column,
 *    migrated by starting Strapi once after the schema change)
 *  - image on every other content section (files_related_mph)
 *  - overview_image per service page (paired with body_content in the dark band)
 *
 * Run with Node 18 from cms/: node scripts/seed-section-eyebrows-images.js
 */
const Database = require('better-sqlite3')
const db = new Database('./database/.tmp/data.db')
db.pragma('foreign_keys = ON')

/* ── eyebrow per section (cmp_id → label) ──────────────────────────────── */
const eyebrows = {
  // advisory
  25: 'Our Approach',
  26: 'Storytelling',
  27: 'Building Trust',
  // strategic-advisory
  103: 'Why It Matters',
  28: 'What We Do',
  29: 'Our Capabilities',
  30: 'Our Network',
  // strategic-communications
  105: 'Full Service',
  106: 'Roadshows',
  107: 'Innovation',
  108: 'Collateral',
  109: 'Financial Media',
  // transactional-advisory
  111: 'Restructuring',
  112: 'Mergers & Acquisitions',
  113: 'Public Offerings',
  114: 'Infrastructure',
  // capital-formation
  68: 'Financing',
  69: 'Planning',
  70: 'Consultancy',
  // crises-management
  71: 'Reputation',
  72: 'Communication',
  73: 'Full Spectrum',
  74: 'Your Partner',
  // market-entry
  88: 'Getting Started',
  89: 'Market Insights',
  90: 'Execution',
  // media-relations
  92: 'Our Strategy',
  93: 'Press Network',
  94: 'Media Mix',
  95: 'Owned Media',
  // media-strategy
  97: 'Foundations',
  98: 'Focus Areas',
  99: 'Content',
  100: 'Social',
  // multicultural-engagement
  101: 'Why It Matters',
  58: 'Focal Points',
  59: 'Demographics',
  60: 'Reach',
  // litigation-communications
  85: 'Our Toolkit',
  86: 'Our Process',
}

/* ── generic image pool (webp/jpg from the media library) ──────────────── */
/* names resolved to ids at runtime so duplicate uploads don't matter */
const POOL_NAMES = [
  'homepage.webp',
  'about.webp',
  'capabilities.webp',
  'how-it-works.webp',
  'industry-expertise.webp',
  'contact.webp',
  'services-hero.webp',
  'services-approach.webp',
  '222 (1).webp',
  'business-woman-talking-with-two-businessmen (1).jpg',
  'GettyImages-1209420474-35dd7632869948e08f7a4273aa5d3e9f.jpg',
  'Capital-Advisory-1030x687.jpg',
]

const pool = POOL_NAMES.map((name) => {
  const row = db.prepare('SELECT id FROM files WHERE name = ? ORDER BY id DESC LIMIT 1').get(name)
  if (!row) throw new Error(`media file not found: ${name}`)
  return row.id
})

let cursor = 0
const nextImage = () => pool[cursor++ % pool.length]

/* ── apply eyebrows ────────────────────────────────────────────────────── */
const setEyebrow = db.prepare('UPDATE components_shared_content_sections SET eyebrow = ? WHERE id = ?')
let eyebrowCount = 0
for (const [cmpId, label] of Object.entries(eyebrows)) {
  const res = setEyebrow.run(label, Number(cmpId))
  eyebrowCount += res.changes
}
console.log(`eyebrows set: ${eyebrowCount}`)

/* ── link helpers ──────────────────────────────────────────────────────── */
const unlink = db.prepare('DELETE FROM files_related_mph WHERE related_id = ? AND related_type = ? AND field = ?')
const link = db.prepare(
  'INSERT INTO files_related_mph (file_id, related_id, related_type, field, "order") VALUES (?, ?, ?, ?, 1)'
)
const relink = (fileId, relatedId, relatedType, field) => {
  unlink.run(relatedId, relatedType, field)
  link.run(fileId, relatedId, relatedType, field)
}

/* ── overview_image per service page ───────────────────────────────────── */
const pages = db
  .prepare(`SELECT id, slug FROM service_pages ORDER BY id`)
  .all()

for (const page of pages) {
  const fileId = nextImage()
  relink(fileId, page.id, 'api::service-page.service-page', 'overview_image')
  console.log(`overview_image: ${page.slug} ← file ${fileId}`)
}

/* ── section images: every other section (1st, 3rd, 5th…) per page ─────── */
const sections = db
  .prepare(
    `SELECT sp.slug, c.cmp_id, c."order" ord
     FROM service_pages sp
     JOIN service_pages_cmps c ON c.entity_id = sp.id AND c.field = 'sections'
     ORDER BY sp.id, c."order"`
  )
  .all()

const bySlug = {}
for (const s of sections) (bySlug[s.slug] ??= []).push(s)

for (const [slug, secs] of Object.entries(bySlug)) {
  secs.forEach((sec, i) => {
    if (i % 2 !== 0) return
    const fileId = nextImage()
    relink(fileId, sec.cmp_id, 'shared.content-section', 'image')
    console.log(`section image: ${slug}#${i} (cmp ${sec.cmp_id}) ← file ${fileId}`)
  })
}

console.log('done')
