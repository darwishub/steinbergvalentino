/**
 * Seeds the "What We Do" block on the How It Works page, grounded in the
 * site's own original copy (web/data/analysis.json → how-it-works.html):
 *  - overview_eyebrow / overview_heading: label + large serif statement
 *  - overview_image: paired photo (from the existing media library, distinct
 *    from the page's hero_image — same source photo was picked earlier by mistake)
 *  - highlights: Partnership / People / Position (heading + body)
 *
 * Run with Node 18 from cms/ while Strapi is stopped:
 *   node scripts/seed-how-it-works-overview.js
 */
const Database = require('better-sqlite3')
const db = new Database('./database/.tmp/data.db')
db.pragma('foreign_keys = ON')

const OVERVIEW_EYEBROW = 'What We Do'
const OVERVIEW_HEADING =
  'We are a group of financial PR enthusiasts — your growth is our business, and our success depends on yours.'
const OVERVIEW_IMAGE_NAME = 'pexels-carousel-meeting'

const HIGHLIGHTS = [
  [
    'Partnership',
    "We don't chase prospects — we inspire them. Every partnership we build is rooted in your growth, because our success depends on yours.",
  ],
  [
    'People',
    'We have a dedicated team of analysts and PR professionals on hand, and when it comes to our relationships with financial media outlets — conventional and non-conventional alike — we are second to none.',
  ],
  [
    'Position',
    'Our social media financial PR team is already deployed and working on several fronts, keeping your story in front of the people who move markets.',
  ],
]

const page = db.prepare('SELECT id FROM how_it_works_pages LIMIT 1').get()
if (!page) throw new Error('how_it_works_pages: no row found')

db.prepare(
  'UPDATE how_it_works_pages SET overview_eyebrow = ?, overview_heading = ? WHERE id = ?'
).run(OVERVIEW_EYEBROW, OVERVIEW_HEADING, page.id)
console.log('overview_eyebrow + overview_heading set')

/* ── overview_image ───────────────────────────────────────────────────── */
const file = db.prepare('SELECT id FROM files WHERE name = ? ORDER BY id DESC LIMIT 1').get(OVERVIEW_IMAGE_NAME)
if (!file) throw new Error(`media file not found: ${OVERVIEW_IMAGE_NAME}`)

db.prepare(
  "DELETE FROM files_related_mph WHERE related_id = ? AND related_type = 'api::how-it-works-page.how-it-works-page' AND field = 'overview_image'"
).run(page.id)
db.prepare(
  `INSERT INTO files_related_mph (file_id, related_id, related_type, field, "order") VALUES (?, ?, 'api::how-it-works-page.how-it-works-page', 'overview_image', 1)`
).run(file.id, page.id)
console.log(`overview_image ← file ${file.id} (${OVERVIEW_IMAGE_NAME})`)

/* ── highlights (idempotent: clear previous links + orphans first) ──────── */
const getLinks = db.prepare(
  "SELECT cmp_id FROM how_it_works_pages_cmps WHERE entity_id = ? AND field = 'highlights'"
)
const delLinks = db.prepare(
  "DELETE FROM how_it_works_pages_cmps WHERE entity_id = ? AND field = 'highlights'"
)
const delHighlight = db.prepare('DELETE FROM components_shared_highlights WHERE id = ?')
const insHighlight = db.prepare(
  'INSERT INTO components_shared_highlights (heading, body) VALUES (?, ?)'
)
const insLink = db.prepare(
  `INSERT INTO how_it_works_pages_cmps (entity_id, cmp_id, component_type, field, "order")
   VALUES (?, ?, 'shared.highlight', 'highlights', ?)`
)

for (const { cmp_id } of getLinks.all(page.id)) delHighlight.run(cmp_id)
delLinks.run(page.id)

HIGHLIGHTS.forEach(([heading, body], i) => {
  const res = insHighlight.run(heading, body)
  insLink.run(page.id, res.lastInsertRowid, i + 1)
})
console.log(`highlights: ${HIGHLIGHTS.length} items`)

console.log('done')
