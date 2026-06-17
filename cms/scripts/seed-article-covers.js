/**
 * Gives each article a real, topical cover image from the existing media
 * library, so the News & Insights card renders a real photo (like the
 * Blackstone template) instead of a text placeholder.
 *
 * Run with Node 18 from cms/ while Strapi is stopped:
 *   node scripts/seed-article-covers.js
 */
const Database = require('better-sqlite3')
const db = new Database('./database/.tmp/data.db')
db.pragma('foreign_keys = ON')

// article slug → existing media file name (topical match)
const covers = {
  'retail-investor-networks-small-cap-liquidity': 'forex-trade-graph-chart-concept_53876-132317.jpg',
  'dual-listed-companies-nasdaq-frankfurt': 'exch-frankfurt.webp',
  '5-signs-your-company-needs-ir-firm': 'svc-advisory.webp',
  'otc-markets-vs-nasdaq-small-cap': 'exch-nasdaq.webp',
  'sv-group-expands-frankfurt-coverage': 'services-hero.webp',
  'regulatory-changes-small-cap-ir-2026': 'svc-litigation.webp',
}

const getArticle = db.prepare('SELECT id FROM articles WHERE slug = ? LIMIT 1')
const getFile = db.prepare('SELECT id FROM files WHERE name = ? ORDER BY id DESC LIMIT 1')
const unlink = db.prepare(
  "DELETE FROM files_related_mph WHERE related_id = ? AND related_type = 'api::article.article' AND field = 'cover_image'"
)
const link = db.prepare(
  "INSERT INTO files_related_mph (file_id, related_id, related_type, field, \"order\") VALUES (?, ?, 'api::article.article', 'cover_image', 1)"
)

for (const [slug, fileName] of Object.entries(covers)) {
  const article = getArticle.get(slug)
  const file = getFile.get(fileName)
  if (!article || !file) {
    console.log(`SKIP ${slug}: article=${!!article} file=${!!file}`)
    continue
  }
  unlink.run(article.id)
  link.run(file.id, article.id)
  console.log(`${slug} ← ${fileName} (file ${file.id})`)
}

console.log('done')
