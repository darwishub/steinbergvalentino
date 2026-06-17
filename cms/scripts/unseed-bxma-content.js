/**
 * Removes the fabricated BXMA demo content (stats, quote, media-band image)
 * from the 4 BXMA pages. Leaves the schema fields in place so real data can
 * be entered in Strapi later — the frontend bands only render when populated.
 *
 * Run with Node 18 from cms/ while Strapi is stopped:
 *   node scripts/unseed-bxma-content.js
 */
const Database = require('better-sqlite3')
const db = new Database('./database/.tmp/data.db')
db.pragma('foreign_keys = ON')

const slugs = ['market-entry', 'media-relations', 'media-strategy', 'multicultural-engagement']

const getPage = db.prepare('SELECT id FROM service_pages WHERE slug = ? LIMIT 1')
const clearFields = db.prepare(
  `UPDATE service_pages
   SET stat_headline_label = NULL, stat_headline_value = NULL,
       quote_text = NULL, quote_author = NULL, quote_role = NULL
   WHERE id = ?`
)
const getStatLinks = db.prepare(
  "SELECT cmp_id FROM service_pages_cmps WHERE entity_id = ? AND field = 'stats'"
)
const delStatLinks = db.prepare(
  "DELETE FROM service_pages_cmps WHERE entity_id = ? AND field = 'stats'"
)
const delStat = db.prepare('DELETE FROM components_shared_stats WHERE id = ?')
const delMedia = db.prepare(
  "DELETE FROM files_related_mph WHERE related_id = ? AND related_type = 'api::service-page.service-page' AND field IN ('media_band_image','quote_image')"
)

for (const slug of slugs) {
  const page = getPage.get(slug)
  if (!page) {
    console.log(`SKIP ${slug}`)
    continue
  }
  clearFields.run(page.id)
  for (const { cmp_id } of getStatLinks.all(page.id)) delStat.run(cmp_id)
  delStatLinks.run(page.id)
  delMedia.run(page.id)
  console.log(`${slug}: cleared stats, quote, media-band + quote images`)
}

console.log('done')
