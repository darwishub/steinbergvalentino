const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

const SITE_DIR = path.resolve('./steinbergvalentino.com');
const OUTPUT_DIR = path.resolve('./output');
const SCREENSHOTS_DIR = path.join(OUTPUT_DIR, 'screenshots');

fs.mkdirSync(SCREENSHOTS_DIR, { recursive: true });

const HTML_FILES = [
  'index.html',
  'about.html',
  'how-it-works.html',
  'capabilities.html',
  'advisory.html',
  'strategic-advisory.html',
  'transactional-advisory.html',
  'capital-formation.html',
  'strategic-communications.html',
  'financial-marketing.html',
  'media-relations.html',
  'media-strategy.html',
  'multicultural-engagement.html',
  'industry-expertise.html',
  'market-entry.html',
  'crises-management.html',
  'litigation-communications.html',
  'nasdaq-small-cap.html',
  'otc-markets.html',
  'canadian-tsx.html',
  'canadian-cse.html',
  'german-frankfurt.html',
  'contact.html',
  'user-sitemap.html',
];

function fileToUrl(filename) {
  return `file://${path.join(SITE_DIR, filename)}`;
}

function slugToRoute(filename) {
  if (filename === 'index.html') return '/';
  if (filename === 'user-sitemap.html') return '/sitemap';
  return '/' + filename.replace('.html', '');
}

function slugToPageName(filename) {
  if (filename === 'index.html') return 'Home';
  return filename
    .replace('.html', '')
    .replace(/-/g, ' ')
    .replace(/\b\w/g, c => c.toUpperCase());
}

function guessTemplateType(filename) {
  if (filename === 'index.html') return 'home';
  if (filename === 'contact.html') return 'contact';
  if (filename === 'user-sitemap.html') return 'sitemap';
  if (['about.html', 'how-it-works.html', 'capabilities.html', 'industry-expertise.html'].includes(filename)) return 'about';
  if (['nasdaq-small-cap.html', 'otc-markets.html', 'canadian-tsx.html', 'canadian-cse.html', 'german-frankfurt.html'].includes(filename)) return 'exchange';
  return 'service';
}

async function analyzePage(page, filename) {
  const url = fileToUrl(filename);
  console.log(`  Rendering: ${filename}`);

  let renderError = null;
  try {
    await page.goto(url, { waitUntil: 'networkidle0', timeout: 30000 });
    await new Promise(r => setTimeout(r, 1500));
  } catch (e) {
    renderError = e.message;
    console.log(`  WARN: ${filename} render issue: ${e.message}`);
    try {
      await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 15000 });
    } catch (e2) {
      console.log(`  ERROR: fallback also failed for ${filename}`);
    }
  }

  // Screenshot
  try {
    await page.screenshot({
      path: path.join(SCREENSHOTS_DIR, filename.replace('.html', '.png')),
      fullPage: true,
    });
  } catch (e) {
    console.log(`  WARN: screenshot failed for ${filename}: ${e.message}`);
  }

  // Extract everything in-page
  const data = await page.evaluate(() => {
    // Meta
    const metaTitle = document.title || '';
    const metaDesc = document.querySelector('meta[name="description"]')?.content || '';
    const canonical = document.querySelector('link[rel="canonical"]')?.href || '';

    // Headings with hierarchy
    const headings = [];
    document.querySelectorAll('h1, h2, h3, h4').forEach(el => {
      const text = el.innerText.trim();
      if (text) headings.push({ tag: el.tagName.toLowerCase(), text });
    });

    // Paragraphs (sample)
    const paragraphs = [];
    document.querySelectorAll('p').forEach(el => {
      const text = el.innerText.trim();
      if (text && text.length > 15) paragraphs.push(text.substring(0, 300));
    });

    // All images: <img> + CSS backgrounds
    const images = new Set();
    document.querySelectorAll('img').forEach(el => {
      const src = el.src || el.getAttribute('data-src') || el.getAttribute('data-lazy-src');
      if (src && !src.startsWith('data:')) images.add(src);
    });
    // CSS background images
    document.querySelectorAll('*').forEach(el => {
      const bg = window.getComputedStyle(el).backgroundImage;
      if (bg && bg !== 'none' && bg.includes('url(')) {
        const match = bg.match(/url\(["']?([^"')]+)["']?\)/);
        if (match && match[1] && !match[1].startsWith('data:')) images.add(match[1]);
      }
    });

    // Links
    const links = [];
    document.querySelectorAll('a[href]').forEach(el => {
      const href = el.getAttribute('href');
      const text = el.innerText.trim();
      if (href && href !== '#' && !href.startsWith('javascript:')) {
        links.push({ text, href });
      }
    });

    // Forms
    const forms = [];
    document.querySelectorAll('form').forEach(form => {
      const fields = [];
      form.querySelectorAll('input, textarea, select').forEach(field => {
        fields.push({
          tag: field.tagName.toLowerCase(),
          type: field.type || '',
          name: field.name || '',
          placeholder: field.placeholder || '',
          required: field.required || false,
          label: field.id ? (document.querySelector(`label[for="${field.id}"]`)?.innerText?.trim() || '') : '',
        });
      });
      const submitBtn = form.querySelector('[type="submit"], button');
      forms.push({
        action: form.action || '',
        method: form.method || 'get',
        fields,
        submit_text: submitBtn?.innerText?.trim() || '',
      });
    });

    // CTA buttons
    const ctaButtons = [];
    document.querySelectorAll('a.elementor-button, a[class*="btn"], .elementor-button-wrapper a, .elementor-cta a, a.wp-block-button__link').forEach(el => {
      const text = el.innerText.trim();
      const href = el.getAttribute('href');
      if (text && href) ctaButtons.push({ text, href });
    });
    // Also grab buttons not caught above
    document.querySelectorAll('a[href]').forEach(el => {
      const cl = el.className || '';
      if (cl.includes('button') || cl.includes('btn') || cl.includes('cta')) {
        const text = el.innerText.trim();
        const href = el.getAttribute('href');
        if (text && href && !ctaButtons.find(b => b.text === text)) {
          ctaButtons.push({ text, href });
        }
      }
    });

    // Nav structure
    let navLogo = '';
    const navLogoEl = document.querySelector('.elementor-nav-menu img, header img, .site-logo img, nav img, .logo img');
    if (navLogoEl) navLogo = navLogoEl.src;

    const navItems = [];
    // Try Elementor nav first
    const navContainer = document.querySelector('.elementor-nav-menu, .e-n-menu, nav ul, #site-navigation ul, .nav-menu');
    if (navContainer) {
      navContainer.querySelectorAll(':scope > li, :scope > .menu-item').forEach(li => {
        const anchor = li.querySelector(':scope > a');
        const label = anchor?.innerText?.trim() || '';
        const href = anchor?.getAttribute('href') || '';
        const children = [];
        li.querySelectorAll('.sub-menu li a, .dropdown-menu li a').forEach(child => {
          children.push({ label: child.innerText.trim(), href: child.getAttribute('href') || '' });
        });
        if (label) navItems.push({ label, href, children });
      });
    }

    // Footer
    const footerEl = document.querySelector('footer, .elementor-location-footer, #colophon');
    let footerText = footerEl?.innerText?.trim() || '';
    const footerLinks = [];
    if (footerEl) {
      footerEl.querySelectorAll('a[href]').forEach(a => {
        footerLinks.push({ text: a.innerText.trim(), href: a.getAttribute('href') });
      });
    }

    // Sections
    const sections = [];
    const sectionEls = document.querySelectorAll('.elementor-section, .elementor-top-section, section.elementor-section, [data-element_type="section"], [data-element_type="container"]');
    sectionEls.forEach((sec, i) => {
      const heading = sec.querySelector('h1, h2, h3')?.innerText?.trim() || '';
      const subheading = sec.querySelector('h4, h5, .elementor-heading-title + p')?.innerText?.trim() || '';
      const bodyText = Array.from(sec.querySelectorAll('p')).map(p => p.innerText.trim()).filter(t => t.length > 10).join(' | ').substring(0, 500);
      const secImages = [];
      sec.querySelectorAll('img').forEach(img => {
        const src = img.src || img.getAttribute('data-src');
        if (src && !src.startsWith('data:')) secImages.push(src);
      });
      const bg = window.getComputedStyle(sec).backgroundImage;
      if (bg && bg !== 'none') {
        const m = bg.match(/url\(["']?([^"')]+)["']?\)/);
        if (m) secImages.push(m[1]);
      }
      const secCTAs = [];
      sec.querySelectorAll('a.elementor-button, a[class*="btn"]').forEach(a => {
        secCTAs.push({ text: a.innerText.trim(), href: a.getAttribute('href') });
      });

      // Guess section type
      let type = 'content';
      const secText = sec.innerText.toLowerCase();
      if (i === 0 && (heading.includes('we ') || secText.includes('hero') || sec.querySelector('h1'))) type = 'hero';
      else if (secText.includes('testimonial') || secText.includes('what our') || secText.includes('clients say')) type = 'testimonial';
      else if (secText.includes('contact us') || sec.querySelector('form')) type = 'form';
      else if (secText.includes('faq') || secText.includes('frequently asked')) type = 'faq';
      else if (secText.includes('our team') || secText.includes('leadership')) type = 'team';
      else if (sec.querySelectorAll('.elementor-counter, .counter').length > 0) type = 'stats';
      else if (secCTAs.length > 0 && !heading && bodyText.length < 100) type = 'cta';

      sections.push({
        order: i + 1,
        type,
        heading,
        subheading,
        body_text: bodyText,
        images: secImages,
        cta_buttons: secCTAs,
        is_dynamic: secCTAs.length > 0 || secImages.length > 0,
      });
    });

    return {
      meta: { title: metaTitle, description: metaDesc, canonical },
      headings,
      paragraphs,
      images: Array.from(images),
      links,
      forms,
      ctaButtons,
      navLogo,
      navItems,
      footerText,
      footerLinks,
      sections,
    };
  });

  return { filename, renderError, ...data };
}

// Simple HTML fallback parser
function parseHtmlFallback(filename) {
  const filepath = path.join(SITE_DIR, filename);
  const html = fs.readFileSync(filepath, 'utf-8');

  const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
  const descMatch = html.match(/<meta[^>]+name=["']description["'][^>]+content=["']([^"']+)["']/i);
  const h1Matches = [...html.matchAll(/<h1[^>]*>([\s\S]*?)<\/h1>/gi)].map(m => m[1].replace(/<[^>]+>/g, '').trim());
  const h2Matches = [...html.matchAll(/<h2[^>]*>([\s\S]*?)<\/h2>/gi)].map(m => m[1].replace(/<[^>]+>/g, '').trim());

  return {
    filename,
    renderError: 'puppeteer_failed_html_fallback',
    meta: {
      title: titleMatch ? titleMatch[1].trim() : '',
      description: descMatch ? descMatch[1].trim() : '',
      canonical: '',
    },
    headings: [
      ...h1Matches.map(t => ({ tag: 'h1', text: t })),
      ...h2Matches.map(t => ({ tag: 'h2', text: t })),
    ],
    paragraphs: [],
    images: [],
    links: [],
    forms: [],
    ctaButtons: [],
    navLogo: '',
    navItems: [],
    footerText: '',
    footerLinks: [],
    sections: [],
  };
}

// Derive shared navbar from all pages
function deriveNavbar(pages) {
  // Use the page with most nav items
  const best = pages.reduce((a, b) => (b.navItems.length > a.navItems.length ? b : a), pages[0]);
  return {
    logo: best.navLogo || './steinbergvalentino.com/images/svgroup-logo-1.png',
    menu: best.navItems,
  };
}

// Derive shared footer
function deriveFooter(pages) {
  const best = pages.reduce((a, b) => (b.footerLinks.length > a.footerLinks.length ? b : a), pages[0]);
  const text = best.footerText || '';
  const copyrightMatch = text.match(/copyright[^\n]*/i) || text.match(/©[^\n]*/);
  const phoneMatch = text.match(/\+?[\d\s\-().]{10,20}/);
  const emailMatch = text.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
  const addressMatch = text.match(/\d+[^,\n]+(?:Street|St|Ave|Avenue|Blvd|Road|Rd|Drive|Dr|Lane|Ln|Way)[^\n]*/i);
  return {
    links: best.footerLinks,
    copyright: copyrightMatch ? copyrightMatch[0].trim() : '',
    address: addressMatch ? addressMatch[0].trim() : '',
    phone: phoneMatch ? phoneMatch[0].trim() : '',
    email: emailMatch ? emailMatch[0].trim() : '',
  };
}

// Derive shared contact form
function deriveContactForm(pages) {
  const contactPage = pages.find(p => p.filename === 'contact.html');
  if (contactPage && contactPage.forms.length > 0) {
    return { fields: contactPage.forms[0].fields };
  }
  for (const page of pages) {
    if (page.forms.length > 0) return { fields: page.forms[0].fields };
  }
  return { fields: [] };
}

function suggestStrapiContentType(filename) {
  const map = {
    'index.html': 'Homepage',
    'about.html': 'AboutPage',
    'how-it-works.html': 'HowItWorksPage',
    'capabilities.html': 'CapabilitiesPage',
    'contact.html': 'ContactPage',
    'user-sitemap.html': 'SitemapPage',
    'advisory.html': 'ServicePage',
    'strategic-advisory.html': 'ServicePage',
    'transactional-advisory.html': 'ServicePage',
    'capital-formation.html': 'ServicePage',
    'strategic-communications.html': 'ServicePage',
    'financial-marketing.html': 'ServicePage',
    'media-relations.html': 'ServicePage',
    'media-strategy.html': 'ServicePage',
    'multicultural-engagement.html': 'ServicePage',
    'industry-expertise.html': 'IndustryPage',
    'market-entry.html': 'ServicePage',
    'crises-management.html': 'ServicePage',
    'litigation-communications.html': 'ServicePage',
    'nasdaq-small-cap.html': 'ExchangePage',
    'otc-markets.html': 'ExchangePage',
    'canadian-tsx.html': 'ExchangePage',
    'canadian-cse.html': 'ExchangePage',
    'german-frankfurt.html': 'ExchangePage',
  };
  return map[filename] || 'Page';
}

function suggestStrapiFields(filename, data) {
  const base = [
    { field_name: 'title', field_type: 'text' },
    { field_name: 'slug', field_type: 'uid' },
    { field_name: 'meta_title', field_type: 'text' },
    { field_name: 'meta_description', field_type: 'text' },
  ];
  const hasHero = data.sections.some(s => s.type === 'hero');
  const hasForm = data.forms.length > 0;
  const hasImages = data.images.length > 0;

  if (hasHero) {
    base.push({ field_name: 'hero_heading', field_type: 'text' });
    base.push({ field_name: 'hero_subheading', field_type: 'text' });
    base.push({ field_name: 'hero_image', field_type: 'media' });
    base.push({ field_name: 'hero_cta_label', field_type: 'text' });
    base.push({ field_name: 'hero_cta_url', field_type: 'text' });
  }
  base.push({ field_name: 'body_content', field_type: 'richtext' });
  if (hasImages) base.push({ field_name: 'featured_image', field_type: 'media' });
  base.push({ field_name: 'sections', field_type: 'component (repeatable)' });
  if (hasForm) base.push({ field_name: 'show_contact_form', field_type: 'boolean' });

  return base;
}

async function main() {
  console.log('Starting Puppeteer analysis...\n');

  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-web-security', '--allow-file-access-from-files'],
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });

  const pageResults = [];
  const allImages = new Set();
  const brokenLinks = [];

  for (const filename of HTML_FILES) {
    const filepath = path.join(SITE_DIR, filename);
    if (!fs.existsSync(filepath)) {
      console.log(`  SKIP: ${filename} not found`);
      continue;
    }

    let result;
    try {
      result = await analyzePage(page, filename);
    } catch (e) {
      console.log(`  ERROR: ${filename} puppeteer failed, using HTML fallback: ${e.message}`);
      result = parseHtmlFallback(filename);
    }

    // Collect all images
    result.images.forEach(img => allImages.add(img));

    // Check for broken internal links
    result.links.forEach(link => {
      if (link.href && !link.href.startsWith('http') && !link.href.startsWith('mailto') && !link.href.startsWith('tel') && !link.href.startsWith('#')) {
        const linkedFile = path.join(SITE_DIR, link.href.replace(/^\//, ''));
        if (!fs.existsSync(linkedFile) && !link.href.includes('?') && !link.href.includes('#')) {
          brokenLinks.push({ page: filename, link: link.href, text: link.text });
        }
      }
    });

    pageResults.push(result);
    console.log(`  ✓ ${filename} — ${result.sections.length} sections, ${result.images.length} images, ${result.forms.length} forms`);
  }

  await browser.close();
  console.log('\nBrowser closed. Building report...');

  // Build final report
  const navbar = deriveNavbar(pageResults);
  const footer = deriveFooter(pageResults);
  const contactForm = deriveContactForm(pageResults);

  const pages = pageResults.map(p => ({
    file: p.filename,
    new_route: slugToRoute(p.filename),
    page_name: slugToPageName(p.filename),
    template_type: guessTemplateType(p.filename),
    meta: p.meta,
    headings: p.headings,
    sections: p.sections,
    form_fields: p.forms,
    cta_buttons: p.ctaButtons,
    links: p.links,
    paragraphs: p.paragraphs.slice(0, 8),
    render_error: p.renderError || null,
    strapi_content_type: suggestStrapiContentType(p.filename),
    strapi_fields: suggestStrapiFields(p.filename, p),
  }));

  const report = {
    generated_at: new Date().toISOString(),
    shared_components: {
      navbar,
      footer,
      contact_form_mini: contactForm,
    },
    pages,
    templates: {
      home: 'Hero banner with headline + CTA → Services overview grid → How it works steps → Stats/counters → Contact CTA strip',
      service: 'Page hero with heading/subheading → Body content (richtext) → Supporting image → Related services → Contact CTA',
      exchange: 'Hero banner → Exchange overview content → Listing requirements → Why list here → CTA section',
      about: 'Hero → Company story → Team section → Values/mission → CTA',
      contact: 'Hero → Contact form → Office info (address, phone, email) → Map embed',
      sitemap: 'Simple hierarchical list of all pages with links',
    },
    missing_pages: ['privacy-policy', 'terms-of-service', '404'],
    broken_links: brokenLinks,
    images_inventory: {
      total: allImages.size,
      list: Array.from(allImages),
    },
  };

  fs.writeFileSync(path.join(OUTPUT_DIR, 'analysis.json'), JSON.stringify(report, null, 2));
  console.log(`\n✓ Saved: output/analysis.json`);

  // Generate Next.js structure
  const nextjsStructure = `# Next.js App Router Folder Structure
# SteinbergValentino.com → Next.js 14 Rebuild

\`\`\`
app/
├── layout.tsx                          ← RootLayout: Navbar + Footer + global styles
├── page.tsx                            ← Home (/)
├── about/
│   └── page.tsx
├── how-it-works/
│   └── page.tsx
├── capabilities/
│   └── page.tsx
├── contact/
│   └── page.tsx
├── sitemap/
│   └── page.tsx
│
├── advisory/                           ← Advisory overview
│   └── page.tsx
│
├── services/                           ← Service pages (dynamic route)
│   ├── [slug]/
│   │   └── page.tsx                   ← Renders any ServicePage from Strapi
│   └── page.tsx                        ← Services index
│
│   Individual service routes:
├── strategic-advisory/
│   └── page.tsx
├── transactional-advisory/
│   └── page.tsx
├── capital-formation/
│   └── page.tsx
├── strategic-communications/
│   └── page.tsx
├── financial-marketing/
│   └── page.tsx
├── media-relations/
│   └── page.tsx
├── media-strategy/
│   └── page.tsx
├── multicultural-engagement/
│   └── page.tsx
├── industry-expertise/
│   └── page.tsx
├── market-entry/
│   └── page.tsx
├── crises-management/
│   └── page.tsx
├── litigation-communications/
│   └── page.tsx
│
├── exchanges/                          ← Exchange listing pages (dynamic route)
│   ├── [slug]/
│   │   └── page.tsx
│   └── page.tsx
│
│   Individual exchange routes:
├── nasdaq-small-cap/
│   └── page.tsx
├── otc-markets/
│   └── page.tsx
├── canadian-tsx/
│   └── page.tsx
├── canadian-cse/
│   └── page.tsx
├── german-frankfurt/
│   └── page.tsx
│
components/
├── layout/
│   ├── Navbar.tsx                      ← Logo + nav menu + mobile hamburger
│   ├── NavDropdown.tsx                 ← Dropdown sub-menu
│   └── Footer.tsx                      ← Footer links + contact info + copyright
│
├── shared/
│   ├── ContactForm.tsx                 ← Reusable contact form (used on /contact + mini)
│   ├── CTAButton.tsx                   ← Styled CTA button (primary/secondary variants)
│   ├── CTAStrip.tsx                    ← Full-width CTA banner strip
│   ├── SectionWrapper.tsx              ← Consistent section padding/max-width
│   └── RichText.tsx                    ← Renders Strapi richtext (blocks renderer)
│
├── sections/
│   ├── HeroSection.tsx                 ← Full-width hero: heading, subheading, CTA, bg image
│   ├── ContentSection.tsx              ← Text + optional image (left/right layout)
│   ├── ServicesGrid.tsx                ← Cards grid for service overview
│   ├── HowItWorksSteps.tsx             ← Numbered steps / process flow
│   ├── StatsSection.tsx                ← Animated counters / key numbers
│   ├── TestimonialSection.tsx          ← Client quotes carousel/grid
│   ├── TeamSection.tsx                 ← Team member cards
│   ├── FAQSection.tsx                  ← Accordion FAQ
│   ├── ExchangeDetailsSection.tsx      ← Exchange-specific requirements table
│   └── IndustryExpertiseSection.tsx    ← Industry vertical cards
│
lib/
├── strapi.ts                           ← Strapi REST API helper (fetch + cache)
├── queries.ts                          ← Typed Strapi query functions per content type
└── utils.ts                            ← Helpers (slugify, formatDate, etc.)
│
types/
├── strapi.ts                           ← Base Strapi response types (StrapiResponse<T>)
├── homepage.ts
├── servicePage.ts
├── exchangePage.ts
├── globalSettings.ts
└── index.ts                            ← Re-exports all types
│
public/
├── images/                             ← Static images (logo, favicons)
│   ├── logo.png
│   └── favicon.ico
│
styles/
└── globals.css                         ← Tailwind base + custom CSS vars

tailwind.config.ts                      ← Brand colors, fonts (Roboto), custom utilities
next.config.ts                          ← Image domains (strapi), redirects for old URLs
\`\`\`

## Route Mapping (Old → New)

| Old File | New Route | Strapi Content Type |
|----------|-----------|---------------------|
| index.html | / | Homepage (Single) |
| about.html | /about | AboutPage (Single) |
| how-it-works.html | /how-it-works | HowItWorksPage (Single) |
| capabilities.html | /capabilities | CapabilitiesPage (Single) |
| advisory.html | /advisory | ServicePage (Collection) |
| strategic-advisory.html | /strategic-advisory | ServicePage (Collection) |
| transactional-advisory.html | /transactional-advisory | ServicePage (Collection) |
| capital-formation.html | /capital-formation | ServicePage (Collection) |
| strategic-communications.html | /strategic-communications | ServicePage (Collection) |
| financial-marketing.html | /financial-marketing | ServicePage (Collection) |
| media-relations.html | /media-relations | ServicePage (Collection) |
| media-strategy.html | /media-strategy | ServicePage (Collection) |
| multicultural-engagement.html | /multicultural-engagement | ServicePage (Collection) |
| industry-expertise.html | /industry-expertise | IndustryPage (Single) |
| market-entry.html | /market-entry | ServicePage (Collection) |
| crises-management.html | /crises-management | ServicePage (Collection) |
| litigation-communications.html | /litigation-communications | ServicePage (Collection) |
| nasdaq-small-cap.html | /nasdaq-small-cap | ExchangePage (Collection) |
| otc-markets.html | /otc-markets | ExchangePage (Collection) |
| canadian-tsx.html | /canadian-tsx | ExchangePage (Collection) |
| canadian-cse.html | /canadian-cse | ExchangePage (Collection) |
| german-frankfurt.html | /german-frankfurt | ExchangePage (Collection) |
| contact.html | /contact | ContactPage (Single) |
| user-sitemap.html | /sitemap | Auto-generated |
`;

  fs.writeFileSync(path.join(OUTPUT_DIR, 'nextjs-structure.md'), nextjsStructure);
  console.log(`✓ Saved: output/nextjs-structure.md`);

  // Generate Strapi content types
  const strapiTypes = `# Strapi Content Types
# SteinbergValentino.com — Strapi v5 Schema

---

## Single Types

### Homepage
\`\`\`
Fields:
- hero_heading          : Text (required)
- hero_subheading       : Text
- hero_body             : RichText
- hero_image            : Media (single)
- hero_cta_label        : Text
- hero_cta_url          : Text
- services_heading      : Text
- services_subheading   : Text
- how_it_works_heading  : Text
- stats                 : Component[Stat] (repeatable)
- testimonials          : Component[Testimonial] (repeatable)
- cta_strip_heading     : Text
- cta_strip_button_label: Text
- cta_strip_button_url  : Text
- meta_title            : Text
- meta_description      : Text
\`\`\`

### AboutPage
\`\`\`
Fields:
- hero_heading          : Text (required)
- hero_subheading       : Text
- hero_image            : Media (single)
- body_content          : RichText
- mission_heading       : Text
- mission_text          : RichText
- values                : Component[ValueItem] (repeatable)
- team_heading          : Text
- team_members          : Component[TeamMember] (repeatable)
- cta_strip_heading     : Text
- cta_strip_button_label: Text
- cta_strip_button_url  : Text
- meta_title            : Text
- meta_description      : Text
\`\`\`

### HowItWorksPage
\`\`\`
Fields:
- hero_heading          : Text (required)
- hero_subheading       : Text
- hero_image            : Media (single)
- intro_text            : RichText
- steps                 : Component[ProcessStep] (repeatable)
- cta_strip_heading     : Text
- cta_strip_button_label: Text
- meta_title            : Text
- meta_description      : Text
\`\`\`

### CapabilitiesPage
\`\`\`
Fields:
- hero_heading          : Text (required)
- hero_subheading       : Text
- hero_image            : Media (single)
- intro_text            : RichText
- capability_groups     : Component[CapabilityGroup] (repeatable)
- meta_title            : Text
- meta_description      : Text
\`\`\`

### IndustryExpertisePage
\`\`\`
Fields:
- hero_heading          : Text (required)
- hero_subheading       : Text
- hero_image            : Media (single)
- intro_text            : RichText
- industries            : Component[IndustryItem] (repeatable)
- meta_title            : Text
- meta_description      : Text
\`\`\`

### ContactPage
\`\`\`
Fields:
- hero_heading          : Text (required)
- hero_subheading       : Text
- address               : Text
- phone                 : Text
- email                 : Email
- office_hours          : Text
- map_embed_url         : Text
- form_heading          : Text
- meta_title            : Text
- meta_description      : Text
\`\`\`

### GlobalSettings
\`\`\`
Fields:
- site_name             : Text (required)
- logo                  : Media (single)
- favicon               : Media (single)
- contact_email         : Email
- contact_phone         : Text
- address               : Text
- footer_copyright      : Text
- footer_links          : Component[FooterLink] (repeatable)
- social_linkedin       : Text
- social_twitter        : Text
- gtm_id                : Text
- default_meta_title    : Text
- default_meta_description : Text
\`\`\`

---

## Collection Types

### ServicePage
\`\`\`
Fields:
- title                 : Text (required)
- slug                  : UID (from title, required)
- category              : Enumeration [advisory, communications, market-access]
- hero_heading          : Text (required)
- hero_subheading       : Text
- hero_image            : Media (single)
- hero_cta_label        : Text
- hero_cta_url          : Text
- intro_heading         : Text
- intro_text            : RichText
- featured_image        : Media (single)
- sections              : Component[ContentSection] (repeatable)
- related_services      : Relation → ServicePage (many-to-many)
- show_contact_form     : Boolean (default: true)
- cta_strip_heading     : Text
- cta_strip_button_label: Text
- meta_title            : Text
- meta_description      : Text
- published_at          : DateTime (auto)
\`\`\`

### ExchangePage
\`\`\`
Fields:
- title                 : Text (required)
- slug                  : UID (from title, required)
- exchange_name         : Text (required)
- country               : Text
- hero_heading          : Text (required)
- hero_subheading       : Text
- hero_image            : Media (single)
- overview_text         : RichText
- listing_requirements  : Component[Requirement] (repeatable)
- advantages            : Component[AdvantageItem] (repeatable)
- featured_image        : Media (single)
- sections              : Component[ContentSection] (repeatable)
- show_contact_form     : Boolean (default: true)
- cta_strip_heading     : Text
- meta_title            : Text
- meta_description      : Text
\`\`\`

---

## Reusable Components

### ContentSection
\`\`\`
- heading               : Text
- subheading            : Text
- body                  : RichText
- image                 : Media (single)
- image_position        : Enumeration [left, right, none]
- cta_label             : Text
- cta_url               : Text
- background            : Enumeration [white, light-gray, dark, brand]
\`\`\`

### Stat
\`\`\`
- number                : Text (e.g. "500+")
- label                 : Text
- icon                  : Text (icon name or SVG)
\`\`\`

### Testimonial
\`\`\`
- quote                 : RichText (required)
- author_name           : Text
- author_title          : Text
- author_company        : Text
- author_photo          : Media (single)
\`\`\`

### TeamMember
\`\`\`
- name                  : Text (required)
- title                 : Text
- bio                   : RichText
- photo                 : Media (single)
- linkedin_url          : Text
\`\`\`

### ProcessStep
\`\`\`
- step_number           : Integer
- heading               : Text (required)
- description           : RichText
- icon                  : Text
\`\`\`

### ValueItem
\`\`\`
- heading               : Text (required)
- description           : Text
- icon                  : Text
\`\`\`

### CapabilityGroup
\`\`\`
- group_name            : Text (required)
- items                 : Component[CapabilityItem] (repeatable)
\`\`\`

### CapabilityItem
\`\`\`
- label                 : Text (required)
- description           : Text
\`\`\`

### IndustryItem
\`\`\`
- name                  : Text (required)
- description           : RichText
- icon                  : Media (single)
\`\`\`

### Requirement
\`\`\`
- label                 : Text (required)
- value                 : Text
- notes                 : Text
\`\`\`

### AdvantageItem
\`\`\`
- heading               : Text (required)
- description           : Text
\`\`\`

### FooterLink
\`\`\`
- label                 : Text (required)
- url                   : Text (required)
- open_in_new_tab       : Boolean
\`\`\`

---

## Permissions Strategy

- Public role: find + findOne on ServicePage, ExchangePage
- Public role: find on GlobalSettings, HomePage, AboutPage, etc. (single types)
- ContactForm submissions → custom endpoint or third-party (Formspree / Resend)
- Media uploads → local provider in dev, Cloudinary/S3 in prod

## Notes

- Use \`populate=*\` or \`populate[sections][populate]=*\` for nested component queries
- Enable ISR (revalidate: 3600) for all page fetches in Next.js
- Use \`unstable_cache\` for GlobalSettings (rarely changes)
`;

  fs.writeFileSync(path.join(OUTPUT_DIR, 'strapi-content-types.md'), strapiTypes);
  console.log(`✓ Saved: output/strapi-content-types.md`);

  console.log('\n=== ANALYSIS COMPLETE ===');
  console.log(`Pages analyzed: ${pageResults.length}`);
  console.log(`Total images found: ${allImages.size}`);
  console.log(`Broken links found: ${brokenLinks.length}`);
  console.log(`Screenshots saved: output/screenshots/`);
}

main().catch(console.error);
