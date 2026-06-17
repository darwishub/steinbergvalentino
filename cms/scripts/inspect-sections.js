const Database = require('better-sqlite3')
const db = new Database('./database/.tmp/data.db', { readonly: true })

const rows = db
  .prepare(
    `SELECT sp.slug, sp.id entity_id, c.cmp_id, cs.heading, cs.subheading, c."order" ord
     FROM service_pages sp
     JOIN service_pages_cmps c ON c.entity_id = sp.id AND c.field = 'sections'
     JOIN components_shared_content_sections cs ON cs.id = c.cmp_id
     ORDER BY sp.id, c."order"`
  )
  .all()
rows.forEach((r) => console.log(r.slug, '|', r.cmp_id, '|', r.heading, '|', r.subheading || ''))

console.log('--- existing content-section image links:')
console.log(
  db
    .prepare(`SELECT * FROM files_related_mph WHERE related_type LIKE '%content-section%' LIMIT 5`)
    .all()
)

console.log('--- service page ids:')
db.prepare('SELECT id, slug FROM service_pages ORDER BY id')
  .all()
  .forEach((r) => console.log(r.id, r.slug))
