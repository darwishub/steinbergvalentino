const Database = require('better-sqlite3')

const db = new Database('./database/.tmp/data.db')

const row = db.prepare('SELECT id, homepage_sections FROM homepages ORDER BY id LIMIT 1').get()

if (!row) {
  console.error('No homepage row found.')
  process.exit(1)
}

const sections = JSON.parse(row.homepage_sections || '{}')
sections.newsletter_heading = 'Sign up for our latest insights and firm announcements.'

db.prepare('UPDATE homepages SET homepage_sections = ? WHERE id = ?').run(
  JSON.stringify(sections),
  row.id
)

console.log('✓ newsletter_heading saved to homepage_sections.')
db.close()
