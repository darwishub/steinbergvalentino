# Strapi Content Types
# SteinbergValentino.com — Strapi v5 Schema

> Derived from analysis of 24 HTML pages, visual inspection of screenshots,
> and full heading/content inventory.

---

## Single Types

### GlobalSettings
_Site-wide settings shared by all pages (navbar, footer, contact info)._

```
logo                  : Media (single, required)      ← svgroup-logo-1.png
site_name             : Text                          ← "SteinbergValentino Group"
tagline               : Text                          ← "The Best IR Firm For Small & Mid-Cap Businesses"
contact_phone         : Text                          ← "(646) 535-3995"
contact_email         : Email                         ← "contact@steinbergvalentino.com"
address               : Text                          ← "100 Church Street, Suite 8010, Manhattan, NY 10007"
business_hours_weekday: Text                          ← "9am to 5pm"
business_hours_saturday: Text                         ← "10am to 2pm"
business_hours_sunday : Text                          ← "Closed"
footer_quick_links    : Component[FooterLink] (repeatable)
footer_copyright      : Text                          ← "© Copyright 2025 - SteinbergValentino Group"
social_facebook       : Text (URL)
social_twitter        : Text (URL)
social_pinterest      : Text (URL)
social_instagram      : Text (URL)
social_linkedin       : Text (URL)
sidebar_nav_links     : Component[FooterLink] (repeatable)  ← the right sidebar navigation
default_meta_title    : Text
default_meta_description : Text
gtm_id               : Text                          ← (not in original, add for analytics)
recaptcha_site_key    : Text
```

---

### Homepage
_Content for the `/` route. Full-width, no sidebar._

```
─── Hero section ───────────────────────────────────────────────
hero_heading          : Text (required)   ← "SteinbergValentino Group The Best IR Firm..."
hero_subheading       : Text              ← "Lucrative Returns & Revenue / We Make Retail Markets..."
hero_background_image : Media (single)    ← banner.webp
hero_cta_primary_label: Text              ← "Our Capabilities"
hero_cta_primary_url  : Text              ← "/capabilities"
hero_cta_secondary_label: Text            ← "Talk to An Expert"
hero_cta_secondary_url: Text              ← "/contact"
hero_show_mini_form   : Boolean           ← true (email + phone "Let's Get Started" form)

─── Why SV Group section ───────────────────────────────────────
why_heading           : Text              ← "Why You Need An IR Firm"
why_body              : RichText
why_image             : Media (single)

─── Services overview ──────────────────────────────────────────
services_heading      : Text              ← "SVG More Than an Investor Relations Firm"
services_subheading   : Text

─── Company overview ───────────────────────────────────────────
overview_heading      : Text              ← "SteinbergValentino Group The Best IR Firm..."
overview_body         : RichText
overview_image        : Media (single)
investment_strategies_heading : Text      ← "Our Investment Strategies"
investment_strategies_body    : RichText
perks_heading         : Text              ← "Perks of Choosing SVG as Your IR Solutions"
perks_body            : RichText

─── Stats ──────────────────────────────────────────────────────
stats                 : Component[Stat] (repeatable)

─── Testimonials ───────────────────────────────────────────────
testimonials_heading  : Text              ← "What Our Clients Say"
testimonials          : Component[Testimonial] (repeatable)   ← 5 items

─── CTA strip ──────────────────────────────────────────────────
cta_strip_heading     : Text
cta_strip_button_label: Text
cta_strip_button_url  : Text

─── SEO ────────────────────────────────────────────────────────
meta_title            : Text              ← "SteinbergValentino Group – IR Firm: Investor Relations..."
meta_description      : Text              ← "SteinbergValentino is the leading IR firm..."
```

---

### AboutPage
_`/about`. Interior layout with sidebar. ⚠️ Content thin in export — recreate with client._

```
hero_heading          : Text (required)   ← "About SteinbergValentino Group"
hero_subheading       : Text
hero_image            : Media (single)    ← Stein-7.png (person + buildings)
body_content          : RichText          ← Company story, mission, values
sections              : Component[ContentSection] (repeatable)
cta_strip_heading     : Text
cta_strip_button_label: Text
meta_title            : Text
meta_description      : Text
```

---

### HowItWorksPage
_`/how-it-works`. Interior layout. 20 content sub-sections, all using bold-paragraph headings._

```
hero_heading          : Text              ← "SV Group: The Hub of Innovation and Entrepreneurial Success"
intro_text            : RichText
sections              : Component[ContentSection] (repeatable)
  ─ includes sections:
    "We don't chase prospects – We inspire them!"
    "SV Group – Usually, Fueled By Innovation"
    "Financial PR Building for the 21st Century starts here!"
    "Do we have Enough Eggs Available in our Pocket?"
    "We don't just, but we do perform well"
    "Financial Seduction Originates Here"
    "Underprivileged Entities and SV Group"
    "Let us portray you better!"
    "Partnering or not would Love to have a cup of coffee together?"
sign_off_text         : RichText          ← "Believe in your infinite potential..." + "Team, SV Group"
meta_title            : Text
meta_description      : Text
```

---

### CapabilitiesPage
_`/capabilities`. Interior layout. 5 sub-sections._

```
hero_heading          : Text (required)   ← "SV Group – Single Solution for Financial IR Building"
hero_image            : Media (single)    ← capabilites.jpg
intro_text            : RichText
sections              : Component[ContentSection] (repeatable)
  ─ "Sure Access to Small / Mid Cap Investment Community" + bullet list
  ─ "Productive Investor Communications" + bullet list
  ─ "Excellent Branding Solutions" + body
  ─ "Safe crises Handling" + bullet list
  ─ "The Integration of Digital Communications" + body
meta_title            : Text              ← "Everything You Need to Know About IR | Steinberg Valentino"
meta_description      : Text
```

---

### IndustryExpertisePage
_`/industry-expertise`. Interior layout. 4 sub-sections._

```
hero_heading          : Text              ← "SV Group – Enriched Industry Experience gets you going!"
hero_subheading       : Text              ← "SV Group's Client Specific Approach"
hero_image            : Media (single)
intro_text            : RichText
sections              : Component[ContentSection] (repeatable)
  ─ "Our Invention – Harmonized Investor Relation Programs"
  ─ "Quality Assurance At SV Group - It's as simple as R³"
  ─ "SV Group – On The Move"
meta_title            : Text
meta_description      : Text
```

---

### ContactPage
_`/contact`. Full-width. No sidebar._

```
hero_heading          : Text (required)   ← "Feel Free To Contact Us"
hero_subheading       : Text              ← "We Always Appreciate Your Feedback"
address               : Text              ← "100 Church Street, Suite 8010, Manhattan, NY 10007"
phone                 : Text              ← "(646) 535-3995"
email                 : Email             ← "contact@steinbergvalentino.com"
form_submit_button_text: Text             ← "SUBMIT"
meta_title            : Text
meta_description      : Text
```

---

## Collection Types

### ServicePage
_11 routes: advisory, strategic-advisory, transactional-advisory, capital-formation,
strategic-communications, financial-marketing, media-relations, media-strategy,
multicultural-engagement, market-entry, crises-management, litigation-communications._

```
title                 : Text (required)
slug                  : UID (from title, required)
category              : Enumeration [advisory, communications, market-access]
nav_parent            : Enumeration [About, Advisory, Market Entry]

─── Hero ───────────────────────────────────────────────────────
hero_heading          : Text (required)   ← H1 of the page
hero_subheading       : Text              ← first H2
hero_image            : Media (single)    ← featured image (varies per page)

─── Content ────────────────────────────────────────────────────
intro_text            : RichText          ← body content before first sub-section
sections              : Component[ContentSection] (repeatable)
  ─ Each section maps to a <strong> or H2 heading in the original page

─── Related ────────────────────────────────────────────────────
related_services      : Relation → ServicePage (many-to-many)
show_contact_form     : Boolean (default: true)
cta_strip_heading     : Text
cta_strip_button_label: Text

─── SEO ────────────────────────────────────────────────────────
meta_title            : Text
meta_description      : Text

─── Section count reference (from export) ──────────────────────
advisory              : 4 sections
strategic-advisory    : 4 sections  (Strategic Advisory for a Complete Revamp, etc.)
transactional-advisory: 4 sections  (Acquisition and Mergers, IPO, Comms Infrastructure, etc.)
capital-formation     : 4 sections  (Integrated Financing, Business Planning, Consultancy, etc.)
strategic-comms       : 5 sections  (Roadshows, Virtual Roadshows, Marketing Material, Media)
financial-marketing   : 6 sections  (5 sub-sections incl. Message Dev, Marketing Materials, etc.)
media-relations       : 4 sections  (Journalists, 4 Types of Media, Creating Selling Media, etc.)
media-strategy        : 4 sections  (Common Elements, Catchy Content, Social Media, etc.)
multicultural         : 4 sections  (Focal Points, Demographics, Improved Reachability, etc.)
market-entry          : 3 sections  (Insights, Materialization/Planning/Implementation, etc.)
crises-management     : 5 sections  (Rep Emergencies, Comms is Key, For Individuals to Conglom.)
litigation-comms      : 3 sections  (Instruments, How we handle, etc.)
```

---

### ExchangePage
_5 routes: nasdaq-small-cap, otc-markets, canadian-tsx, canadian-cse, german-frankfurt._

```
title                 : Text (required)
slug                  : UID (from title, required)
exchange_name         : Text (required)   ← "NASDAQ Small Cap", "OTC Markets", etc.
country               : Text              ← "USA", "Canada", "Germany"

─── Hero ───────────────────────────────────────────────────────
hero_heading          : Text (required)   ← H1 (uppercase on exchange pages)
hero_subheading       : Text              ← H2

─── Content ────────────────────────────────────────────────────
overview_text         : RichText
sections              : Component[ContentSection] (repeatable)
  ─ Exchange pages use H3–H6 hierarchy for sub-sections (deep nesting)
  ─ nasdaq-small-cap: 5 sections (Young Entrepreneurs, Limelight, Benefits, How It Works)
  ─ otc-markets:      6 sections (What is OTC PR, Efficiency Methods, Connects Companies, etc.)
  ─ canadian-tsx:     8 sections (100% Promise, Hub of Innovation, Advantages for Investors, etc.)
  ─ canadian-cse:     9 sections (Money-back mentality, Groundbreaking, Greatest Advantages, etc.)
  ─ german-frankfurt: 13 sections (Best!, Joint Venture, Why Choose, Main Focus, etc.)

─── FAQ ────────────────────────────────────────────────────────
faq_items             : Component[FAQItem] (repeatable)   ← present on exchange pages

─── Industry list ──────────────────────────────────────────────
client_industries     : Component[IndustryItem] (repeatable)   ← OTC Markets industry list

─── Related ────────────────────────────────────────────────────
show_contact_form     : Boolean (default: true)
cta_strip_heading     : Text

─── SEO ────────────────────────────────────────────────────────
meta_title            : Text
meta_description      : Text
```

---

## Reusable Components

### ContentSection
```
heading               : Text (required)
subheading            : Text
body                  : RichText
image                 : Media (single)
image_position        : Enumeration [left, right, none]  (default: right)
bullet_list           : Component[BulletItem] (repeatable)
cta_label             : Text
cta_url               : Text
background_style      : Enumeration [white, light-gray, dark, gold]
```

### Stat
```
number                : Text (required)   ← "500+", "200+", "$2B+"
label                 : Text (required)   ← "Retail Investors", "Companies", etc.
icon                  : Text              ← icon class or SVG name
```

### Testimonial
```
quote                 : RichText (required)
author_name           : Text
author_title          : Text
author_company        : Text
author_photo          : Media (single)
```

### FAQItem
```
question              : Text (required)
answer                : RichText (required)
```

### FooterLink
```
label                 : Text (required)
url                   : Text (required)
open_in_new_tab       : Boolean (default: false)
```

### BulletItem
```
text                  : Text (required)
```

### IndustryItem
```
name                  : Text (required)
description           : Text
icon                  : Media (single)
```

---

## Permissions (recommended)

| Role | Permissions |
|------|------------|
| Public | `find` on all collection types, `find` on all single types |
| Public | Upload not allowed (media library protected) |
| Authenticated | Full CRUD (for CMS admin users) |

---

## Query patterns (Next.js fetch)

```typescript
// Service page (ISR)
const res = await fetchAPI(`/api/service-pages?filters[slug][$eq]=${slug}&populate=*`)

// Homepage with nested components
const res = await fetchAPI(`/api/homepage?populate[stats][populate]=*&populate[testimonials][populate]=*`)

// Global settings (cached for all pages)
const settings = await unstable_cache(
  () => fetchAPI('/api/global-setting?populate=*'),
  ['global-settings'],
  { revalidate: 3600 }
)()

// All services for sitemap/sidebar
const res = await fetchAPI('/api/service-pages?fields[0]=title&fields[1]=slug&sort=title:asc')
```

---

## Migration notes

1. **Content entry order** — Enter GlobalSettings first (logo, nav, footer). Then Single Types
   (Homepage, ContactPage, etc.). Then Collection Types (ServicePage, ExchangePage).

2. **about.html is thin** — The static export did not render the full WordPress About page.
   Recreate this content with the client. Suggested structure: Company story, founding, mission,
   team intro → CTA.

3. **how-it-works.html** — Very content-rich (20 sub-sections). Map to `HowItWorksPage` Single
   Type with a large `sections` component array. Consider splitting into 2-3 focused sections
   for Strapi manageability.

4. **Exchange pages heading depth** — Original pages use H1→H2→H3→H4→H5→H6 hierarchy.
   In Strapi, flatten to `ContentSection` components — the heading depth was an SEO pattern,
   not a design requirement.

5. **Images** — 20 local images in `./steinbergvalentino.com/images/`. Upload all to Strapi
   media library (or Cloudinary in production) and update references. All images are either
   stock photos or the SVG logo.

6. **Forms** — Replace WordPress Elementor form + `send_mail.php` endpoint with:
   - Next.js Server Action
   - Resend for transactional email
   - reCAPTCHA v3 (invisible) replacing current broken v2 key
