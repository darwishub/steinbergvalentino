# Next.js App Router — Folder Structure
# SteinbergValentino.com Rebuild

> Based on deep analysis of 24 HTML pages, Puppeteer screenshots, and Elementor DOM structure.

---

## Project root

```
steinbergvalentino-next/
├── app/
├── components/
├── lib/
├── types/
├── public/
├── styles/
├── next.config.ts
├── tailwind.config.ts
└── package.json
```

---

## app/ — Page routes (App Router)

```
app/
│
├── layout.tsx                         ← RootLayout: TopBar + Navbar + Footer
│                                        Wraps ALL pages. Pulls GlobalSettings from Strapi.
│
├── page.tsx                           ← / (Home)
│                                        Full-width sections. NO sidebar.
│                                        Sections: Hero, Why SV Group, Services Grid,
│                                        How It Works intro, Company Overview, Stats, Testimonials
│
├── about/
│   └── page.tsx                       ← /about  (Interior layout + sidebar)
│                                        ⚠️ Main content thin in static export — recreate from client
│
├── how-it-works/
│   └── page.tsx                       ← /how-it-works  (Interior layout + sidebar)
│                                        20 content sections (all <strong> headings):
│                                        "We don't chase prospects" → "Fueled By Innovation" →
│                                        "Financial PR Building" → etc.
│
├── capabilities/
│   └── page.tsx                       ← /capabilities  (Interior layout + sidebar)
│                                        5 sections: Hero → Sure Access to Small/Mid Cap →
│                                        Productive Investor Comms → Excellent Branding →
│                                        Safe Crises Handling → Digital Comms Integration
│
├── industry-expertise/
│   └── page.tsx                       ← /industry-expertise  (Interior + sidebar, 4 sections)
│
├── advisory/
│   └── page.tsx                       ← /advisory  (Business Development overview, 4 sections)
│
├── strategic-advisory/
│   └── page.tsx                       ← /strategic-advisory  (4 sections)
│
├── transactional-advisory/
│   └── page.tsx                       ← /transactional-advisory  (4 sections)
│
├── capital-formation/
│   └── page.tsx                       ← /capital-formation  (4 sections)
│
├── strategic-communications/
│   └── page.tsx                       ← /strategic-communications  (5 sections)
│
├── financial-marketing/
│   └── page.tsx                       ← /financial-marketing  (6 sections)
│
├── media-relations/
│   └── page.tsx                       ← /media-relations  (4 sections)
│
├── media-strategy/
│   └── page.tsx                       ← /media-strategy  (4 sections)
│
├── multicultural-engagement/
│   └── page.tsx                       ← /multicultural-engagement  (4 sections)
│
├── market-entry/
│   └── page.tsx                       ← /market-entry  (3 sections)
│
├── crises-management/
│   └── page.tsx                       ← /crises-management  (5 sections)
│
├── litigation-communications/
│   └── page.tsx                       ← /litigation-communications  (3 sections)
│
├── nasdaq-small-cap/
│   └── page.tsx                       ← /nasdaq-small-cap  (5 sections + FAQ)
│                                        Exchange template — H1–H5 heading hierarchy
│
├── otc-markets/
│   └── page.tsx                       ← /otc-markets  (6 sections + industry list)
│
├── canadian-tsx/
│   └── page.tsx                       ← /canadian-tsx  (8 sections)
│
├── canadian-cse/
│   └── page.tsx                       ← /canadian-cse  (9 sections)
│
├── german-frankfurt/
│   └── page.tsx                       ← /german-frankfurt  (13 sections)
│
├── contact/
│   └── page.tsx                       ← /contact  (Full-width. NO sidebar.)
│                                        Form: First Name + Last Name + Email + Message + reCAPTCHA
│
├── sitemap/
│   └── page.tsx                       ← /sitemap  (auto-generated from Strapi data)
│                                        Grouped by category — replaces user-sitemap.html
│
└── not-found.tsx                      ← Custom 404 page (missing from original site)
```

---

## Two layout patterns

### Pattern A — Home page and Contact (full-width, no sidebar)
```
app/layout.tsx
  └── <TopBar />
  └── <Navbar />
  └── {children}          ← page.tsx renders full-width sections directly
  └── <Footer />
```

### Pattern B — All 19 interior pages (content + sticky sidebar)
```
app/layout.tsx
  └── <TopBar />
  └── <Navbar />
  └── <InteriorLayout>    ← components/layout/InteriorLayout.tsx
       ├── <Breadcrumb />
       ├── <main>         ← richtext content + section headings
       └── <Sidebar />    ← sticky right sidebar with service nav links
  └── <Footer />
```

---

## components/ — UI component tree

```
components/
│
├── layout/
│   ├── TopBar.tsx               ← Black bar: social icons (FB/TW/PIN/IG/LI) + phone (646) 535-3995
│   ├── Navbar.tsx               ← White header: SVG logo + main nav + mobile hamburger
│   ├── NavDropdown.tsx          ← Dropdown (About: 5 items, Advisory: 6, Market Entry: 3, Exchanges: 5)
│   ├── Footer.tsx               ← Dark 3-col: Quick Links | Our Address | Business Hours + copyright
│   ├── InteriorLayout.tsx       ← 2-col: <main> (~65%) + <Sidebar> (~30%), max-width 1200px
│   ├── Sidebar.tsx              ← Sticky sidebar: gold nav links to all service/exchange pages
│   └── Breadcrumb.tsx           ← "You are here: Home / PageName"
│
├── home/                        ← Home page only (used in app/page.tsx)
│   ├── HomeHero.tsx             ← Full-width: banner.webp bg + H1 + mini email+phone form + 2 CTAs
│   ├── WhySVGroup.tsx           ← "Why You Need An IR Firm" + body + image
│   ├── ServicesGrid.tsx         ← Cards grid → service pages
│   ├── CompanyOverview.tsx      ← "SVG More Than an Investor Relations Firm"
│   ├── StatsSection.tsx         ← Animated counters
│   └── TestimonialsCarousel.tsx ← "What Our Clients Say" — 5 client quotes
│
├── sections/                    ← Reusable section components (interior pages)
│   ├── PageHero.tsx             ← Interior H1 hero: gold heading + subheading + optional image
│   ├── RichTextSection.tsx      ← Renders Strapi richtext (body content with subsections)
│   ├── ContentWithImage.tsx     ← Text + image (left/right)
│   ├── BulletList.tsx           ← Styled bullet lists from Strapi
│   ├── FAQSection.tsx           ← Accordion FAQ (exchange pages only)
│   ├── CTAStrip.tsx             ← Full-width CTA banner
│   └── ExchangeDetails.tsx      ← Exchange: requirements table, advantages, industry list
│
├── contact/
│   ├── ContactForm.tsx          ← Full form: First/Last/Email/Message/reCAPTCHA/SUBMIT
│   └── MiniContactForm.tsx      ← Email + Phone only (home hero + sidebar)
│
└── ui/                          ← Shadcn + custom primitives
    ├── CTAButton.tsx            ← Primary (gold #dca840) / Secondary (outline)
    ├── SectionWrapper.tsx       ← Consistent section padding + max-width container
    └── RichText.tsx             ← @strapi/blocks-react-renderer wrapper
```

---

## lib/ — API + utilities

```
lib/
├── strapi.ts            ← fetchAPI(endpoint, options) — base Strapi REST helper, ISR headers
├── queries/
│   ├── global.ts        ← fetchGlobalSettings() — unstable_cache, rarely changes
│   ├── homepage.ts      ← fetchHomepage()
│   ├── services.ts      ← fetchService(slug), fetchAllServices()
│   ├── exchanges.ts     ← fetchExchange(slug), fetchAllExchanges()
│   └── pages.ts         ← fetchAbout(), fetchCapabilities(), fetchHowItWorks(), etc.
├── recaptcha.ts         ← verifyRecaptcha(token) server-side
├── email.ts             ← sendContactEmail() via Resend
└── utils.ts             ← slugify(), formatPhone(), truncateText()
```

---

## types/ — TypeScript interfaces

```
types/
├── strapi.ts            ← StrapiResponse<T>, StrapiData<T>, StrapiMeta, StrapiImage
├── global.ts            ← GlobalSettings, NavItem, FooterLink, BusinessHours
├── homepage.ts          ← Homepage, HomeStat, Testimonial, MiniFormData
├── service.ts           ← ServicePage, ContentSection, ServiceCategory
├── exchange.ts          ← ExchangePage, FAQItem, Requirement, AdvantageItem
├── pages.ts             ← AboutPage, HowItWorksPage, CapabilitiesPage, IndustryExpertisePage
└── index.ts             ← re-exports all types
```

---

## public/ — Static assets

```
public/
├── images/
│   ├── logo.png                         ← svgroup-logo-1.png (white header logo)
│   ├── banner.webp                      ← home hero full-width background
│   ├── Capital-Advisory-1030x687.jpg    ← strategic-advisory featured image
│   ├── GettyImages-1209420474.jpg       ← general IR/business stock photo
│   ├── Stein-7.png                      ← person/building illustration (about page)
│   ├── capabilites.jpg
│   ├── vision-450x281.jpg
│   ├── leadership-teamwork-concept.jpg
│   ├── real-estate-building-icon-concept.jpg
│   ├── business-woman-talking.jpg
│   ├── business-man-holding-clipboard.jpg
│   ├── forex-trade-graph-chart.jpg
│   └── 2900445_25461.jpg
└── favicon.ico                          ← cropped-favicon-32x32.jpg
```

---

## Config

```
next.config.ts
  images.remotePatterns: [strapi domain, cloudinary]
  redirects: [
    { source: '/user-sitemap', destination: '/sitemap', permanent: true },
    { source: '/:slug.html', destination: '/:slug', permanent: true },
  ]

tailwind.config.ts
  theme.extend.colors:
    brand.gold:  '#dca840'
    brand.dark:  '#222222'
    footer.bg:   '#2b2b2b'
  theme.extend.fontFamily:
    sans: ['var(--font-roboto)', 'sans-serif']

.env.local
  NEXT_PUBLIC_STRAPI_URL=http://localhost:1337
  STRAPI_API_TOKEN=...
  RESEND_API_KEY=...
  NEXT_PUBLIC_RECAPTCHA_SITE_KEY=...
  RECAPTCHA_SECRET_KEY=...
  NEXT_PUBLIC_GA_MEASUREMENT_ID=...     (add GTM/GA — not present in original export)
```

---

## Route → Strapi content type mapping

| Old file | New route | Strapi type | Sections |
|---|---|---|---|
| index.html | `/` | Homepage (Single) | 6 |
| about.html | `/about` | AboutPage (Single) | 2 ⚠️ thin |
| how-it-works.html | `/how-it-works` | HowItWorksPage (Single) | 20 |
| capabilities.html | `/capabilities` | CapabilitiesPage (Single) | 5 |
| industry-expertise.html | `/industry-expertise` | IndustryExpertisePage (Single) | 4 |
| advisory.html | `/advisory` | ServicePage (Collection) | 4 |
| strategic-advisory.html | `/strategic-advisory` | ServicePage | 4 |
| transactional-advisory.html | `/transactional-advisory` | ServicePage | 4 |
| capital-formation.html | `/capital-formation` | ServicePage | 4 |
| strategic-communications.html | `/strategic-communications` | ServicePage | 5 |
| financial-marketing.html | `/financial-marketing` | ServicePage | 6 |
| media-relations.html | `/media-relations` | ServicePage | 4 |
| media-strategy.html | `/media-strategy` | ServicePage | 4 |
| multicultural-engagement.html | `/multicultural-engagement` | ServicePage | 4 |
| market-entry.html | `/market-entry` | ServicePage | 3 |
| crises-management.html | `/crises-management` | ServicePage | 5 |
| litigation-communications.html | `/litigation-communications` | ServicePage | 3 |
| nasdaq-small-cap.html | `/nasdaq-small-cap` | ExchangePage (Collection) | 5 + FAQ |
| otc-markets.html | `/otc-markets` | ExchangePage | 6 |
| canadian-tsx.html | `/canadian-tsx` | ExchangePage | 8 |
| canadian-cse.html | `/canadian-cse` | ExchangePage | 9 |
| german-frankfurt.html | `/german-frankfurt` | ExchangePage | 13 |
| contact.html | `/contact` | ContactPage (Single) | 2 |
| user-sitemap.html | `/sitemap` | Auto-generated | — |

---

## Key implementation notes

1. **Sidebar** — All 19 interior pages share the same sticky right sidebar with gold nav links.
   Build as a Server Component: fetch `GlobalSettings.sidebar_links` from Strapi once per request.

2. **Home mini form** — Email + Phone fields. Replace WordPress `send_mail.php` with a Next.js
   Server Action and Resend for transactional email.

3. **Exchange pages are long** — german-frankfurt has 13 sections. Use `generateStaticParams()`
   with `revalidate: 3600` so they pre-render at build time.

4. **Font** — Roboto via `next/font/google`. Apply via CSS variable to `tailwind.config.ts`.

5. **Redirects** — Add `user-sitemap → sitemap` and all `.html` → clean-URL redirects in
   `next.config.ts` to preserve any inbound links.

6. **SEO** — All 24 pages have unique title + description + canonical. Use `generateMetadata()`
   in each `page.tsx` pulling `meta_title` and `meta_description` from Strapi.

7. **reCAPTCHA** — The contact form uses reCAPTCHA v2 (broken in local export — invalid domain).
   Replace with reCAPTCHA v3 (invisible) or hCaptcha for better GDPR compliance.

8. **about.html is thin** — The static HTML export shows only a contact form for this page.
   The real "About Us" content needs to be written fresh or sourced from the client. The
   `how-it-works.html` file actually contains the rich company philosophy content.
