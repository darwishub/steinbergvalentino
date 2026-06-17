/**
 * Seeds the Blackstone-style "What We Do" block on every service page:
 *  - overview_heading: a large serif statement
 *  - highlights: 3 titled items (heading + body) shown beside the overview image
 *
 * Copy is grounded in each page's existing section themes.
 * Run with Node 18 from cms/ while Strapi is stopped:
 *   node scripts/seed-overview-highlights.js
 */
const Database = require('better-sqlite3')
const db = new Database('./database/.tmp/data.db')
db.pragma('foreign_keys = ON')

const data = {
  advisory: {
    heading: 'We build the B2B relationships that move small-cap companies forward.',
    highlights: [
      ['Realistic Engagements', 'We pursue only the partnerships that hold. Every introduction is grounded in genuine market interest, not volume for its own sake.'],
      ['Compelling Storytelling', 'We craft the narrative that makes investors and partners pay attention, building campaigns around a durable, emotional perception.'],
      ['Unshakeable Trust', 'Trust is the asset that compounds. We help you earn it and defend it with every stakeholder, through every cycle.'],
    ],
  },
  'strategic-advisory': {
    heading: 'We sharpen what makes your company distinct — and put it in front of the right people.',
    highlights: [
      ['Protected Identity', 'We make sure your uniqueness is never compromised, preserving the qualities that set you apart in a crowded market.'],
      ['Complete Revamp', 'When your positioning needs a reset, we rebuild it end to end — aligning message, market and momentum.'],
      ['Access to Decision-Makers', 'Our network opens doors to policy makers and business communities that most firms simply cannot reach.'],
    ],
  },
  'strategic-communications': {
    heading: 'We run communications across every channel that shapes how the market sees you.',
    highlights: [
      ['Across-the-Board Service', 'From media to messaging, our communications program is built to cover every front at once.'],
      ['Investor Roadshows', 'We create meaningful, high-profile interactions — in person and through innovation-inspired virtual roadshows.'],
      ['Financial Media That Lands', 'Stunning marketing material and serious financial-media relationships put your story on the right tables.'],
    ],
  },
  'transactional-advisory': {
    heading: 'We guide companies through the transactions that define their future.',
    highlights: [
      ['Restructuring & Recovery', 'We help you see the light through bankruptcies, turning difficult positions into a clear path forward.'],
      ['Mergers & Acquisitions', 'From first conversation to close, we manage the communications that keep deals on track.'],
      ['Public Offerings', 'A fantastic launching pad for IPOs, backed by a communication infrastructure that is our real strength.'],
    ],
  },
  'capital-formation': {
    heading: 'We connect cash-hungry businesses with the capital and structure to grow.',
    highlights: [
      ['Integrated Financing', 'We bring together the financing channels that match your stage, your sector and your goals.'],
      ['Planning & Strategy', 'Sound business planning and strategy development turn raised capital into durable results.'],
      ['Consultancy Across Outsourcing', 'We advise across outsourcing decisions so resources go where they create the most value.'],
    ],
  },
  'crises-management': {
    heading: 'We protect the reputation that your investors and stakeholders trust.',
    highlights: [
      ['Reputation Emergencies', 'We identify reputational risks early and mitigate them before they reach the market.'],
      ['Communication is the Key', 'Clear, coordinated communication is the difference between a managed event and a full-blown crisis.'],
      ['From Individuals to Conglomerates', 'Whatever the scale, we stand as your tactical partner against possible misconduct and fallout.'],
    ],
  },
  'market-entry': {
    heading: 'We pave the way into new markets — from first insight to full launch.',
    highlights: [
      ['We Pave Your Way', 'SV Group clears the path into unfamiliar markets so you can move with confidence.'],
      ['Market Insights', 'Decisions are grounded in real insight drawn directly from the market in question.'],
      ['Materialization & Implementation', 'The final round — planning and execution that turns strategy into presence on the ground.'],
    ],
  },
  'media-relations': {
    heading: 'We turn media coverage into a reliable driver of awareness and trust.',
    highlights: [
      ['A Deliberate Strategy', 'Our media relations are built on strategy, not luck — every placement serves a clear purpose.'],
      ['Top-Tier Journalists', 'We cultivate genuine, mutual relationships with the journalists who matter to your story.'],
      ['Every Type of Media', 'We capitalize on all four types of media, including the owned channels that sell on your behalf.'],
    ],
  },
  'media-strategy': {
    heading: 'We design the media strategy that keeps your company continuously visible.',
    highlights: [
      ['Built on Media Relations', 'Media relations form the pillar of a strategy designed for sustained, credible exposure.'],
      ['Catchy, Lasting Content', 'We help create the content that earns attention and keeps it over time.'],
      ['Social Media', 'We use social channels for branding, lead generation and a sharper public profile.'],
    ],
  },
  'multicultural-engagement': {
    heading: 'We help you engage the audiences other firms overlook.',
    highlights: [
      ['Filling the Gaps', 'We reach the communities and segments that are too often left out of the conversation.'],
      ['Demographics-Driven', 'A demographics-led approach makes sure every message meets its audience where they are.'],
      ['Improved Reachability', 'We extend your reach across cultures, languages and channels for broader engagement.'],
    ],
  },
  'financial-marketing': {
    heading: 'We tell the financial story that grows your capital.',
    highlights: [
      ['Storytelling That Sells', 'Financial marketing is storytelling. We tell the brilliant things, and your capital follows.'],
      ['Built to Last', 'We design marketing schemes for durable growth, never just short-term goals.'],
      ["For Today's Investor", 'Our marketing labs craft messaging sharp enough for an investor who already knows the landscape.'],
    ],
  },
  'litigation-communications': {
    heading: 'We keep stakeholders informed when the story moves outside the courtroom.',
    highlights: [
      ['The Right Instruments', 'We deploy the litigation-communications tools that keep your message accurate and controlled.'],
      ['A Proven Process', 'We manage disclosure timing and messaging to minimize disruption during sensitive proceedings.'],
      ['Protecting Perception', "Information flows out of court — we make sure it doesn't shape a false impression of your firm."],
    ],
  },
}

const getPage = db.prepare('SELECT id FROM service_pages WHERE slug = ? LIMIT 1')
const setHeading = db.prepare('UPDATE service_pages SET overview_heading = ? WHERE id = ?')

// existing highlight links for a page (to clean before reseeding)
const getLinks = db.prepare(
  "SELECT cmp_id FROM service_pages_cmps WHERE entity_id = ? AND field = 'highlights'"
)
const delLinks = db.prepare(
  "DELETE FROM service_pages_cmps WHERE entity_id = ? AND field = 'highlights'"
)
const delHighlight = db.prepare('DELETE FROM components_shared_highlights WHERE id = ?')
const insHighlight = db.prepare(
  'INSERT INTO components_shared_highlights (heading, body) VALUES (?, ?)'
)
const insLink = db.prepare(
  `INSERT INTO service_pages_cmps (entity_id, cmp_id, component_type, field, "order")
   VALUES (?, ?, 'shared.highlight', 'highlights', ?)`
)

let pages = 0
let items = 0
for (const [slug, { heading, highlights }] of Object.entries(data)) {
  const page = getPage.get(slug)
  if (!page) {
    console.log(`SKIP ${slug}: page not found`)
    continue
  }

  setHeading.run(heading, page.id)

  // clean previous highlights for idempotency
  for (const { cmp_id } of getLinks.all(page.id)) delHighlight.run(cmp_id)
  delLinks.run(page.id)

  highlights.forEach(([h, b], i) => {
    const res = insHighlight.run(h, b)
    insLink.run(page.id, res.lastInsertRowid, i + 1)
    items++
  })

  pages++
  console.log(`${slug}: heading + ${highlights.length} highlights`)
}

console.log(`done — ${pages} pages, ${items} highlights`)
