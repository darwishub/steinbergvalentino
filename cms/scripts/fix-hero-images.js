/**
 * Relinks each service page's hero_image to its matching svc-<slug>.webp file.
 * Heroes were originally linked by sequential id, mismatching most pages.
 * Run with Node 18 from cms/ while Strapi is stopped.
 */
const Database = require('better-sqlite3')
const db = new Database('./database/.tmp/data.db')
db.pragma('foreign_keys = ON')

const slugToFile = {
  advisory: 'svc-advisory.webp',
  'strategic-advisory': 'svc-strategic-advisory.webp',
  'strategic-communications': 'svc-strategic-comms.webp',
  'transactional-advisory': 'svc-transactional.webp',
  'capital-formation': 'svc-capital-formation.webp',
  'crises-management': 'svc-crises-management.webp',
  'market-entry': 'svc-market-entry.webp',
  'media-relations': 'svc-media-relations.webp',
  'media-strategy': 'svc-media-strategy.webp',
  'multicultural-engagement': 'svc-multicultural.webp',
  'financial-marketing': 'svc-financial-marketing.webp',
  'litigation-communications': 'svc-litigation.webp',
}

const getFile = db.prepare('SELECT id FROM files WHERE name = ? ORDER BY id DESC LIMIT 1')
const getPage = db.prepare('SELECT id FROM service_pages WHERE slug = ? LIMIT 1')
const unlink = db.prepare(
  "DELETE FROM files_related_mph WHERE related_id = ? AND related_type = 'api::service-page.service-page' AND field = 'hero_image'"
)
const link = db.prepare(
  "INSERT INTO files_related_mph (file_id, related_id, related_type, field, \"order\") VALUES (?, ?, 'api::service-page.service-page', 'hero_image', 1)"
)

for (const [slug, fileName] of Object.entries(slugToFile)) {
  const page = getPage.get(slug)
  const file = getFile.get(fileName)
  if (!page || !file) {
    console.log(`SKIP ${slug}: page=${!!page} file=${!!file}`)
    continue
  }
  unlink.run(page.id)
  link.run(file.id, page.id)
  console.log(`hero: ${slug} ← ${fileName} (file ${file.id})`)
}
console.log('done')
