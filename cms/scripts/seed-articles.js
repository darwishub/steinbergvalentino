const Database = require('better-sqlite3')
const db = new Database('./database/.tmp/data.db')
db.pragma('foreign_keys = ON')

const now = new Date().toISOString()

const p = (text) => ({ type: 'paragraph', children: [{ type: 'text', text }] })
const h2 = (text) => ({ type: 'heading', level: 2, children: [{ type: 'text', text }] })

const articles = [
  /* ── FEATURE (1) ─────────────────────────────────────── */
  {
    title: 'How Retail Investor Networks Drive Small-Cap Liquidity',
    slug: 'retail-investor-networks-small-cap-liquidity',
    category: 'Market Insights',
    excerpt: 'A deep-dive into why a broad, loyal retail investor base is the single most powerful lever a small-cap company can pull to improve its trading volume and share price.',
    author: 'SteinbergValentino Research',
    read_time: 7,
    layout_style: 'feature',
    featured_quote: 'A company with 50,000 retail investors who check the ticker every morning is worth more than one with three institutional holders who review the position quarterly.',
    body_content: [
      h2('The Liquidity Problem Every Small-Cap Faces'),
      p('When a company first lists on a public exchange — whether NASDAQ, OTC, TSX, or CSE — the first question from management is invariably the same: where are the buyers? Institutional funds have mandates that exclude companies below a certain market cap. Algorithmic traders need volume that doesn\'t yet exist. The result is a chicken-and-egg trap that stalls price discovery.'),
      p('The solution is a large, engaged retail investor base. Not passive shareholders, but investors who follow company news, participate in offerings, and tell their networks. Building that base is exactly what SV Group has perfected over decades.'),
      h2('Why Retail Depth Matters More Than Institutional Headlines'),
      p('Institutional investors are important, but a single fund can exit a position in one block trade and collapse the share price. A distributed network of 40,000 retail investors smooths out that volatility. When one investor sells, another is already watching the ticker and sees an entry point.'),
      p('SV Group\'s proprietary database — the largest retail investor network in the IR industry — gives our client companies immediate access to investors who have opted in to receiving information about publicly traded small-cap opportunities. These are not cold leads. They are active market participants who respond.'),
      h2('The Mechanics of an Awareness Campaign'),
      p('A typical SV Group awareness campaign runs across three channels simultaneously: targeted email outreach to verified investors, social media amplification across LinkedIn, X, and financial communities, and mobile push notifications to our subscriber app. Each channel reinforces the others, creating a surround-sound effect that drives search volume, ticker visibility, and ultimately, buying interest.'),
      p('The key metric we track is not just volume — it is the quality of new shareholders. Investors who arrive through our network tend to hold longer, ask better questions on investor calls, and become brand advocates who recruit others.'),
      h2('Measuring the Results'),
      p('Across client engagements over the past decade, companies that have run full-scale SV Group awareness campaigns have seen average trading volume increases of 3x to 7x within the first 60 days. More meaningfully, bid-ask spreads compress — a reliable sign that market makers now see enough two-sided interest to quote tighter.'),
      p('Liquidity is not just a trading metric. It is a signal to institutional investors that the stock is safe to enter and exit. Once that signal is established, the institutional conversations become much easier to have.'),
    ],
  },

  /* ── FEATURE (2) ─────────────────────────────────────── */
  {
    title: 'Dual-Listed Companies: Unlocking Capital on Both Sides of the Atlantic',
    slug: 'dual-listed-companies-nasdaq-frankfurt',
    category: 'Capital Markets',
    excerpt: 'Companies that list simultaneously on NASDAQ and the Frankfurt Stock Exchange gain access to two of the world\'s deepest investor pools — and SV Group is one of the few IR firms with the expertise to manage both.',
    author: 'SteinbergValentino Group',
    read_time: 6,
    layout_style: 'feature',
    featured_quote: 'Frankfurt investors look for things that NASDAQ investors often overlook — steady earnings, conservative balance sheets, and industrial relevance. Dual listing lets you tell two different stories to two different audiences.',
    body_content: [
      h2('Why Dual Listing Is No Longer Just for Mega-Caps'),
      p('For years, dual listing was considered the domain of the S&P 500 — the Siemens, the SAPs, the companies with billion-dollar market caps and armies of IR professionals. That calculus has changed. Regulatory improvements on both the NASDAQ side and the Deutsche Börse have made it feasible for mid-cap companies with strong fundamentals to access European capital without prohibitive compliance costs.'),
      p('SV Group has guided several clients through simultaneous listings, and the results consistently exceed what either market could deliver alone.'),
      h2('What Frankfurt Investors Want'),
      p('European institutional investors, particularly in Germany, Austria, and Switzerland, have different risk profiles than their North American counterparts. They weight dividend history, earnings consistency, and ESG positioning more heavily. They are less influenced by growth narratives and more by verifiable fundamentals.'),
      p('This is not a disadvantage for most of our clients — it is an opportunity. A small-cap company that has been unfairly punished by momentum-driven NASDAQ sentiment can find a more receptive audience in Frankfurt, where analysts read the annual report cover to cover.'),
      h2('The IR Coordination Challenge'),
      p('The complexity of dual listing is not regulatory — it is communications. You need to run two investor relations programs in two time zones, in two languages, calibrated to two different investor cultures, while maintaining a single consistent narrative about the company.'),
      p('SV Group\'s Frankfurt desk manages this coordination. We ensure that earnings releases, material disclosures, and corporate events are timed and translated appropriately for both audiences, and that neither set of investors ever feels they are getting second-hand information.'),
    ],
  },

  /* ── INSIGHT (1) ──────────────────────────────────────── */
  {
    title: '5 Signs Your Company Needs a Dedicated IR Firm',
    slug: '5-signs-your-company-needs-ir-firm',
    category: 'Advisory',
    excerpt: 'Most public companies wait too long to hire professional investor relations support. Here are the five warning signs that you\'ve already waited too long.',
    author: 'SV Group Advisory Team',
    read_time: 5,
    layout_style: 'insight',
    featured_quote: 'The cost of poor investor relations is not an IR line item on your P&L. It shows up in your share price, your cost of capital, and your ability to close the next financing round.',
    body_content: [
      p('Going public is an achievement. Staying public — and building a healthy, growing shareholder base — is an ongoing discipline. Many companies treat IR as a box to check after their IPO or reverse merger, then wonder why liquidity never improves and institutional investors never call.'),
      h2('1. Your Trading Volume Has Been Flat for Six Months'),
      p('Low volume is not just an inconvenience. It signals to larger investors that the stock is untradeable at any meaningful size. If your average daily volume has been below 100,000 shares for more than a quarter, you need a structural intervention, not just a press release.'),
      h2('2. You Cannot Name Your Top 10 Shareholders'),
      p('Many small-cap executives are shocked to discover they don\'t know who owns their stock. A professional IR firm runs regular shareholder surveillance, identifying beneficial owners, tracking position changes, and mapping the register against your institutional target list.'),
      h2('3. Your Share Price Does Not Reflect Your Fundamentals'),
      p('If your company is generating revenue, has a clear growth path, and is trading at a discount to peers, the problem is awareness, not fundamentals. Investors who don\'t know about your company cannot price it. IR is the mechanism that closes that information gap.'),
      h2('4. Analysts Are Not Covering Your Stock'),
      p('Sell-side coverage is not automatic. You have to earn it, and earning it requires a disciplined IR outreach program, a compelling investor presentation, and a track record of meeting with buy-side investors consistently. SV Group has established relationships with analysts across the exchanges we cover.'),
      h2('5. Your Last Financing Round Was More Difficult Than the One Before'),
      p('If each successive capital raise is harder than the last, your investor story has a structural problem. That problem is almost never the business itself. It is the way the business is being communicated to the capital markets. A professional IR firm fixes that.'),
    ],
  },

  /* ── INSIGHT (2) ──────────────────────────────────────── */
  {
    title: 'OTC Markets vs NASDAQ: Choosing the Right Exchange for Your Company',
    slug: 'otc-markets-vs-nasdaq-small-cap',
    category: 'Market Entry',
    excerpt: 'OTC and NASDAQ serve very different investor bases and impose very different compliance demands. Here is how to think through which exchange is right for your stage of development.',
    author: 'SV Group Market Entry Desk',
    read_time: 6,
    layout_style: 'insight',
    featured_quote: 'Listing on the wrong exchange is not just a compliance problem — it\'s a marketing problem. The investors you attract depend entirely on where they find you.',
    body_content: [
      p('One of the first decisions a newly public company faces — and one of the most consequential — is which exchange to list on. For companies operating in the sub-$50M market cap range, the two most common choices in North America are the OTC Markets and NASDAQ Small Cap.'),
      h2('The Case for OTC'),
      p('OTC Markets, particularly the OTCQB and OTCQX tiers, offer a lower barrier to entry. Listing fees are modest, compliance requirements are manageable for early-stage companies, and the process of becoming current with your filings and transferring to the OTC is relatively fast.'),
      p('The OTC is not a lesser market — it is a different market. Many sophisticated retail investors and small-fund managers specifically look for opportunities in the OTC space, precisely because institutional analysts have not yet covered these companies. The information asymmetry is the opportunity.'),
      h2('The Case for NASDAQ'),
      p('NASDAQ Small Cap listing opens doors that OTC listing does not. Many institutional funds have mandates that explicitly exclude OTC-listed securities. Index inclusion, which can generate significant passive buying, requires NASDAQ or NYSE listing. And the branding value of being able to say "listed on NASDAQ" should not be underestimated in investor presentations.'),
      p('The compliance demands are real: minimum bid price, minimum shareholders of record, governance requirements. But these are also signals of company quality that the market rewards.'),
      h2('The SV Group Recommendation'),
      p('For companies that are pre-revenue or in early revenue stages, OTC provides the liquidity-building runway you need without the compliance overhead that would consume management bandwidth. Once you have established 90 days of consistent trading volume and have a clear path to NASDAQ minimums, a planned uplisting becomes a catalyst event in itself — and SV Group has managed more of those transitions than any firm we know of.'),
    ],
  },

  /* ── BRIEF (1) ────────────────────────────────────────── */
  {
    title: 'SV Group Expands Frankfurt Exchange Coverage for North American Small-Caps',
    slug: 'sv-group-expands-frankfurt-coverage',
    category: 'Firm News',
    excerpt: 'SteinbergValentino Group has deepened its Frankfurt Stock Exchange capabilities, now offering North American small-cap clients a full-service dual-listing program with dedicated European investor relations support.',
    author: 'SteinbergValentino Group',
    read_time: 2,
    layout_style: 'brief',
    featured_quote: 'Our European clients have been asking us to help their North American portfolio companies access Frankfurt capital. Now we can.',
    body_content: [
      p('SteinbergValentino Group has expanded its market entry capabilities to include a comprehensive Frankfurt Stock Exchange program for North American small and mid-cap issuers. The expansion adds a dedicated Frankfurt IR desk to the firm\'s existing coverage of NASDAQ, OTC Markets, Toronto Stock Exchange, and Canadian Securities Exchange.'),
      p('The Frankfurt program provides client companies with end-to-end listing support, including regulatory filing coordination, German-language investor communications, sell-side analyst introductions, and ongoing investor relations management with European institutions.'),
      h2('What This Means for Clients'),
      p('Companies already listed on NASDAQ or the TSX that are generating revenue and have a clear growth narrative can now pursue Frankfurt cross-listing as a capital diversification strategy, reducing dependence on North American market conditions and accessing European investors who value different qualities in a small-cap investment.'),
      p('For new issuers, SV Group can advise on the optimal sequencing of a multi-exchange listing strategy, typically beginning on OTC or CSE before expanding to Frankfurt and ultimately NASDAQ.'),
      p('Contact SV Group\'s market entry team to learn whether a Frankfurt listing is appropriate for your company\'s current stage of development.'),
    ],
  },

  /* ── BRIEF (2) ────────────────────────────────────────── */
  {
    title: 'Key Regulatory Changes Affecting Small-Cap Investor Relations in 2026',
    slug: 'regulatory-changes-small-cap-ir-2026',
    category: 'Compliance',
    excerpt: 'Three regulatory developments this year have material implications for how small-cap public companies must communicate with investors. Here is what IR teams need to know.',
    author: 'SV Group Compliance Advisory',
    read_time: 3,
    layout_style: 'brief',
    featured_quote: 'Regulatory compliance in IR is not about avoiding penalties. It is about building the trust that makes investors comfortable holding your stock long-term.',
    body_content: [
      p('The regulatory environment for small-cap investor relations continues to evolve. Three developments in 2026 have particular relevance for the companies SV Group advises.'),
      h2('1. Expanded Social Media Disclosure Requirements'),
      p('The SEC has clarified its guidance on material disclosures made via social media platforms. Companies that use X (formerly Twitter), LinkedIn, or Instagram to communicate news that could affect share price must ensure that these posts satisfy Regulation FD requirements and are cross-filed with their standard disclosure channels. IR teams that are not already treating social media as an official disclosure channel should update their communication policies immediately.'),
      h2('2. AI-Generated Content and Authenticity Standards'),
      p('Regulators in both the US and Canada have begun scrutinizing the use of AI-generated content in investor-facing materials. While AI-assisted drafting is not prohibited, companies must be able to attest that all forward-looking statements and factual claims have been reviewed and approved by a qualified human officer. SV Group\'s content production process has always maintained this standard.'),
      h2('3. Shortened Settlement Cycles and Liquidity Implications'),
      p('The move to T+1 settlement has compressed the window for correcting failed trades. For small-cap companies with less liquid stocks, this increases the importance of maintaining accurate transfer agent records and proactively communicating with your clearing broker about any anticipated high-volume trading events, such as earnings releases or major corporate announcements.'),
    ],
  },
]

// ── DB helpers ───────────────────────────────────────────────────────────────

const upsert = db.transaction(() => {
  const del  = db.prepare('DELETE FROM articles WHERE slug = ?')
  const ins  = db.prepare(`
    INSERT INTO articles
      (document_id, title, slug, category, excerpt, author, read_time, layout_style,
       body_content, featured_quote, meta_title, meta_description,
       created_at, updated_at, published_at, locale)
    VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)
  `)

  for (const a of articles) {
    del.run(a.slug)
    ins.run(
      `article-${a.slug}`,
      a.title,
      a.slug,
      a.category,
      a.excerpt,
      a.author,
      a.read_time,
      a.layout_style,
      JSON.stringify(a.body_content),
      a.featured_quote,
      `${a.title} | SteinbergValentino Group`,
      a.excerpt,
      now, now, now,
      'en'
    )
  }
})

upsert()

const rows = db.prepare('SELECT id, slug, layout_style, category FROM articles ORDER BY id').all()
console.log('Articles seeded:')
rows.forEach(r => console.log(` [${r.id}] ${r.slug}  (${r.layout_style} / ${r.category})`))
