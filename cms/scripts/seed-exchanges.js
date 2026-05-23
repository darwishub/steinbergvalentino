const Database = require('better-sqlite3')

const db = new Database('./database/.tmp/data.db')
db.pragma('foreign_keys = ON')

const now = new Date().toISOString()

const p = (text) => ({ type: 'paragraph', children: [{ type: 'text', text }] })

const exchanges = [
  {
    documentId: 'exchange-nasdaq-small-cap',
    title: 'NASDAQ Small Cap Market',
    slug: 'nasdaq-small-cap',
    exchangeName: 'NASDAQ Small Cap Market',
    country: 'United States',
    heroHeading: 'List on the NASDAQ Small Cap Market',
    heroSubheading: 'Access to the world\'s largest technology-focused exchange with a global investor base.',
    body: [
      p('The NASDAQ Small Cap Market (NASDAQ: SCM) provides emerging growth companies with access to a deep pool of institutional and retail investors in the world\'s premier technology and growth exchange.'),
      p('SV Group guides companies through the entire NASDAQ listing process, from initial eligibility assessment to post-listing investor relations support.'),
    ],
    keyFacts: ['Global investor reach', 'Technology sector depth', 'Dual listing eligibility', 'Strong retail investor participation'],
  },
  {
    documentId: 'exchange-otc-markets',
    title: 'OTC Markets',
    slug: 'otc-markets',
    exchangeName: 'OTC Markets',
    country: 'United States',
    heroHeading: 'Trade on OTC Markets',
    heroSubheading: 'A flexible entry point into the US capital markets for emerging public companies.',
    body: [
      p('OTC Markets provides a cost-effective pathway to US investor access for small and micro-cap companies. The OTCQB and OTCQX tiers offer meaningful visibility with institutional and retail investors.'),
      p('We help companies navigate OTC compliance requirements, build their investor base, and develop a clear pathway to uplisting on major exchanges.'),
    ],
    keyFacts: ['Lower listing costs', 'OTCQB and OTCQX tiers', 'Uplisting pathway', 'Active retail investor community'],
  },
  {
    documentId: 'exchange-canadian-tsx',
    title: 'Toronto Stock Exchange (TSX)',
    slug: 'canadian-tsx',
    exchangeName: 'Toronto Stock Exchange (TSX)',
    country: 'Canada',
    heroHeading: 'List on the Toronto Stock Exchange',
    heroSubheading: 'Canada\'s premier exchange and a gateway to North American and global institutional capital.',
    body: [
      p('The Toronto Stock Exchange is Canada\'s senior exchange and one of the largest in the world by market capitalization. TSX-listed companies benefit from strong institutional coverage and a sophisticated investor base.'),
      p('SV Group provides comprehensive TSX listing advisory, including regulatory preparation, investor outreach, and post-listing IR programs tailored to the Canadian capital markets ecosystem.'),
    ],
    keyFacts: ['Senior exchange status', 'Strong institutional coverage', 'Cross-listing options', 'Resource and technology sector strength'],
  },
  {
    documentId: 'exchange-canadian-cse',
    title: 'Canadian Securities Exchange (CSE)',
    slug: 'canadian-cse',
    exchangeName: 'Canadian Securities Exchange (CSE)',
    country: 'Canada',
    heroHeading: 'List on the Canadian Securities Exchange',
    heroSubheading: 'A streamlined listing process for growth-stage companies seeking North American investor access.',
    body: [
      p('The Canadian Securities Exchange offers an efficient, cost-effective listing process for early-stage and growth companies. The CSE is known for its regulatory flexibility and strong support for innovative sectors.'),
      p('With SV Group\'s guidance, companies can efficiently navigate CSE listing requirements and build an engaged investor base from day one.'),
    ],
    keyFacts: ['Streamlined listing process', 'Lower compliance costs', 'Innovative sector strength', 'Rapid time to listing'],
  },
  {
    documentId: 'exchange-german-frankfurt',
    title: 'Frankfurt Stock Exchange',
    slug: 'german-frankfurt',
    exchangeName: 'Frankfurt Stock Exchange',
    country: 'Germany',
    heroHeading: 'List on the Frankfurt Stock Exchange',
    heroSubheading: 'Access to European institutional investors through Germany\'s leading capital market.',
    body: [
      p('The Frankfurt Stock Exchange (Frankfurter Wertpapierbörse) is Europe\'s largest trading centre and a major gateway to German and broader European institutional capital.'),
      p('SV Group provides Frankfurt listing advisory for North American companies seeking European investor diversification, including regulatory coordination, investor roadshows, and ongoing European IR support.'),
    ],
    keyFacts: ['European investor access', 'Major institutional market', 'Dual listing capability', 'Strong German and European IR network'],
  },
]

const upsert = db.transaction(() => {
  for (const ex of exchanges) {
    const existing = db
      .prepare('SELECT id FROM exchange_pages WHERE slug = ? LIMIT 1')
      .get(ex.slug)

    if (existing) {
      db.prepare(`
        UPDATE exchange_pages SET
          document_id = ?, title = ?, exchange_name = ?, country = ?,
          hero_heading = ?, hero_subheading = ?, body_content = ?,
          key_facts = ?, updated_at = ?, published_at = ?
        WHERE id = ?
      `).run(
        ex.documentId, ex.title, ex.exchangeName, ex.country,
        ex.heroHeading, ex.heroSubheading, JSON.stringify(ex.body),
        JSON.stringify(ex.keyFacts), now, now,
        existing.id
      )
    } else {
      db.prepare(`
        INSERT INTO exchange_pages (
          document_id, title, slug, exchange_name, country,
          hero_heading, hero_subheading, body_content, key_facts,
          created_at, updated_at, published_at
        ) VALUES (?,?,?,?,?,?,?,?,?,?,?,?)
      `).run(
        ex.documentId, ex.title, ex.slug, ex.exchangeName, ex.country,
        ex.heroHeading, ex.heroSubheading, JSON.stringify(ex.body),
        JSON.stringify(ex.keyFacts), now, now, now
      )
    }
  }
})

upsert()

const count = db.prepare('SELECT COUNT(*) as n FROM exchange_pages').get()
console.log(`Exchange pages seeded: ${count.n} total`)
