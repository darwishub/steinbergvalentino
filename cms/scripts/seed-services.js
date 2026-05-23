const Database = require('better-sqlite3')

const db = new Database('./database/.tmp/data.db')
db.pragma('foreign_keys = ON')

const now = new Date().toISOString()

const p = (text) => ({ type: 'paragraph', children: [{ type: 'text', text }] })

const services = [
  {
    documentId: 'service-advisory',
    title: 'Advisory',
    slug: 'advisory',
    heroHeading: 'Investor Relations Advisory',
    heroSubheading: 'Strategic guidance and IR program development for public companies seeking sustained market recognition.',
    body: [
      p('Our advisory practice provides the strategic foundation every public company needs to build credibility with investors, analysts, and market participants.'),
      p('We design and execute investor relations programs that align your equity story with your business objectives, ensuring consistent and compelling communication across all channels.'),
    ],
  },
  {
    documentId: 'service-strategic-advisory',
    title: 'Strategic Advisory',
    slug: 'strategic-advisory',
    heroHeading: 'Strategic Advisory',
    heroSubheading: 'Long-term strategic counsel to align your business narrative with capital market expectations.',
    body: [
      p('SteinbergValentino Group provides strategic advisory services that help management teams articulate their value proposition clearly and consistently to the investment community.'),
      p('We work closely with boards and executive leadership to develop robust investor engagement frameworks that drive valuation and shareholder value.'),
    ],
  },
  {
    documentId: 'service-strategic-communications',
    title: 'Strategic Communications',
    slug: 'strategic-communications',
    heroHeading: 'Strategic Communications',
    heroSubheading: 'Integrated communications programs that build institutional confidence and market visibility.',
    body: [
      p('Effective communication is the cornerstone of investor confidence. Our strategic communications team crafts targeted messaging that resonates with institutional and retail investors alike.'),
      p('From earnings call preparation to analyst day management, we ensure your story is heard clearly across all touch points.'),
    ],
  },
  {
    documentId: 'service-transactional-advisory',
    title: 'Transactional Advisory',
    slug: 'transactional-advisory',
    heroHeading: 'Transactional Advisory',
    heroSubheading: 'Expert guidance through M&A, financing, and other material corporate transactions.',
    body: [
      p('Transactions require flawless investor communications. We provide end-to-end advisory support for mergers, acquisitions, secondary offerings, and other material events.'),
      p('Our team ensures that transaction-related communications meet regulatory requirements while maximizing investor understanding and support.'),
    ],
  },
  {
    documentId: 'service-capital-formation',
    title: 'Capital Formation',
    slug: 'capital-formation',
    heroHeading: 'Capital Formation',
    heroSubheading: 'Access to capital through targeted investor outreach and institutional relationship building.',
    body: [
      p('Raising capital in today\'s markets requires a disciplined, relationship-driven approach. We connect small and mid-cap companies with the right investors at the right time.'),
      p('Our extensive network of institutional investors, family offices, and high-net-worth individuals provides our clients with access to capital that would otherwise be difficult to reach.'),
    ],
  },
  {
    documentId: 'service-crises-management',
    title: 'Crises Management',
    slug: 'crises-management',
    heroHeading: 'Crisis Management',
    heroSubheading: 'Rapid-response communications support to protect shareholder value during critical events.',
    body: [
      p('When a crisis strikes, the speed and quality of your response determines how investors and the market perceive your company. Our crisis communications team is available around the clock.'),
      p('We develop crisis response protocols, draft rapid communications, and coordinate with legal counsel to ensure your messaging is accurate, compliant, and confidence-inspiring.'),
    ],
  },
  {
    documentId: 'service-market-entry',
    title: 'Market Entry',
    slug: 'market-entry',
    heroHeading: 'Market Entry Services',
    heroSubheading: 'End-to-end listing and market entry support for companies entering new capital markets.',
    body: [
      p('Entering a new capital market requires expert knowledge of listing requirements, regulatory frameworks, and investor expectations. SV Group has guided companies through listings on NASDAQ, TSX, CSE, and Frankfurt.'),
      p('We manage the full listing process, from exchange selection and documentation to investor roadshows and aftermarket support.'),
    ],
  },
  {
    documentId: 'service-media-relations',
    title: 'Media Relations',
    slug: 'media-relations',
    heroHeading: 'Media Relations',
    heroSubheading: 'Proactive media engagement to amplify your investor story to a broader audience.',
    body: [
      p('Earned media coverage drives awareness and credibility with retail investors, analysts, and potential institutional shareholders. Our media relations team places your story in the publications that matter.'),
      p('We maintain relationships with leading financial journalists, wire services, and digital financial media to ensure your announcements receive the coverage they deserve.'),
    ],
  },
  {
    documentId: 'service-media-strategy',
    title: 'Media Strategy',
    slug: 'media-strategy',
    heroHeading: 'Media Strategy',
    heroSubheading: 'A coordinated media approach that builds your brand and investor base simultaneously.',
    body: [
      p('We develop comprehensive media strategies that align your public narrative with your investor relations objectives, ensuring consistent messaging across all platforms and publications.'),
      p('From social media to trade publications to mainstream financial press, we map the optimal media ecosystem for your company and industry.'),
    ],
  },
  {
    documentId: 'service-multicultural-engagement',
    title: 'Multicultural Engagement',
    slug: 'multicultural-engagement',
    heroHeading: 'Multicultural Investor Engagement',
    heroSubheading: 'Targeted outreach to diverse investor communities across North America and international markets.',
    body: [
      p('Multicultural investor communities represent a significant and growing segment of the retail investing population. We specialize in authentic engagement programs that resonate with these audiences.'),
      p('Our multicultural engagement practice brings linguistic, cultural, and community expertise to help you build a diverse and loyal shareholder base.'),
    ],
  },
  {
    documentId: 'service-financial-marketing',
    title: 'Financial Marketing',
    slug: 'financial-marketing',
    heroHeading: 'Financial Marketing',
    heroSubheading: 'Data-driven marketing programs that increase retail investor awareness and trading volume.',
    body: [
      p('Retail investor awareness is a critical driver of liquidity and valuation for small-cap companies. Our financial marketing programs combine digital advertising, content marketing, and investor targeting to build your retail shareholder base.'),
      p('We use proprietary investor targeting platforms and proven retail marketing methodologies to efficiently grow your investor audience.'),
    ],
  },
  {
    documentId: 'service-litigation-communications',
    title: 'Litigation Communications',
    slug: 'litigation-communications',
    heroHeading: 'Litigation Communications',
    heroSubheading: 'Careful, compliant communications counsel during regulatory investigations and shareholder litigation.',
    body: [
      p('Litigation and regulatory matters require precision communications that protect your legal position while maintaining investor confidence. Our litigation communications team works alongside your legal counsel.'),
      p('We develop messaging frameworks, prepare management for investor questions, and coordinate disclosure timing to minimize market disruption during sensitive legal proceedings.'),
    ],
  },
]

const upsert = db.transaction(() => {
  for (const svc of services) {
    const existing = db
      .prepare('SELECT id FROM service_pages WHERE slug = ? LIMIT 1')
      .get(svc.slug)

    if (existing) {
      db.prepare(`
        UPDATE service_pages SET
          document_id = ?, title = ?, hero_heading = ?, hero_subheading = ?,
          body_content = ?, updated_at = ?, published_at = ?
        WHERE id = ?
      `).run(
        svc.documentId, svc.title, svc.heroHeading, svc.heroSubheading,
        JSON.stringify(svc.body), now, now,
        existing.id
      )
    } else {
      db.prepare(`
        INSERT INTO service_pages (
          document_id, title, slug, hero_heading, hero_subheading,
          body_content, created_at, updated_at, published_at
        ) VALUES (?,?,?,?,?,?,?,?,?)
      `).run(
        svc.documentId, svc.title, svc.slug, svc.heroHeading, svc.heroSubheading,
        JSON.stringify(svc.body), now, now, now
      )
    }
  }
})

upsert()

const count = db.prepare('SELECT COUNT(*) as n FROM service_pages').get()
console.log(`Service pages seeded: ${count.n} total`)
