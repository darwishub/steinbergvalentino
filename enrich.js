/**
 * Enrichment pass: reads raw HTML to extract all sub-sections,
 * then merges with the Puppeteer JSON and writes the final report.
 */
const fs = require('fs');
const path = require('path');

const SITE_DIR = path.resolve('./steinbergvalentino.com');
const OUTPUT_DIR = path.resolve('./output');

// ─── Helpers ─────────────────────────────────────────────────────────────────

function stripTags(html) {
  return html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
}

function extractAll(html, regex) {
  return [...html.matchAll(regex)].map(m => m[1] ? stripTags(m[1]).trim() : '');
}

function extractContent(filename) {
  const filepath = path.join(SITE_DIR, filename);
  const html = fs.readFileSync(filepath, 'utf-8');

  const title   = (html.match(/<title[^>]*>([^<]+)<\/title>/i) || [])[1]?.trim() || '';
  const desc    = (html.match(/<meta[^>]+name=["']description["'][^>]+content=["']([^"']+)["']/i) || [])[1]?.trim() || '';
  const canon   = (html.match(/<link[^>]+rel=["']canonical["'][^>]+href=["']([^"']+)["']/i) || [])[1]?.trim() || '';

  const h1s = extractAll(html, /<h1[^>]*>([\s\S]*?)<\/h1>/gi).filter(Boolean);
  const h2s = extractAll(html, /<h2[^>]*>([\s\S]*?)<\/h2>/gi).filter(t => t && !['ABOUT','SEARCH','RECENT POSTS','RECENT COMMENTS','ARCHIVES','TAGS','CATEGORIES'].includes(t.toUpperCase().trim()));
  const h3s = extractAll(html, /<h3[^>]*>([\s\S]*?)<\/h3>/gi).filter(t => t && !['ABOUT','SEARCH','RECENT POSTS','RECENT COMMENTS'].includes(t.toUpperCase().trim()));

  const paragraphs = extractAll(html, /<p[^>]*>([\s\S]*?)<\/p>/gi)
    .filter(t => t && t.length > 20 && !t.startsWith('[contact-form'))
    .slice(0, 12);

  // Extract ALL images: <img src + data-src + CSS background inline
  const imgSrcs = new Set();
  for (const m of html.matchAll(/\bsrc=["']([^"']*\.(jpg|jpeg|png|webp|gif|svg))[^"']*["']/gi)) {
    const src = m[1];
    if (!src.startsWith('data:') && !src.includes('/css/') && !src.includes('/fonts/')) imgSrcs.add(src);
  }
  for (const m of html.matchAll(/\bdata-(?:src|lazy-src|bg)=["']([^"']+)["']/gi)) {
    const src = m[1];
    if (!src.startsWith('data:') && src.match(/\.(jpg|jpeg|png|webp|gif)/i)) imgSrcs.add(src);
  }
  for (const m of html.matchAll(/background(?:-image)?:\s*url\(["']?([^"')]+)["']?\)/gi)) {
    const src = m[1];
    if (!src.startsWith('data:') && src.match(/\.(jpg|jpeg|png|webp|gif)/i)) imgSrcs.add(src);
  }

  // Form fields (visible only)
  const formFields = [];
  for (const m of html.matchAll(/<input[^>]+>/gi)) {
    const tag = m[0];
    const type = (tag.match(/type=["']([^"']+)["']/) || [])[1] || 'text';
    if (['hidden','submit'].includes(type)) continue;
    const name = (tag.match(/name=["']([^"']+)["']/) || [])[1] || '';
    const placeholder = (tag.match(/placeholder=["']([^"']+)["']/) || [])[1] || '';
    const required = /required/.test(tag);
    formFields.push({ tag: 'input', type, name, placeholder, required });
  }
  for (const m of html.matchAll(/<textarea[^>]*>/gi)) {
    const tag = m[0];
    const name = (tag.match(/name=["']([^"']+)["']/) || [])[1] || '';
    const placeholder = (tag.match(/placeholder=["']([^"']+)["']/) || [])[1] || '';
    if (name === 'g-recaptcha-response') continue;
    formFields.push({ tag: 'textarea', type: 'textarea', name, placeholder, required: /required/.test(tag) });
  }

  // Bullet lists (li items) — capture service feature lists
  const listItems = extractAll(html, /<li[^>]*>([\s\S]*?)<\/li>/gi)
    .filter(t => t && t.length > 5 && t.length < 200)
    .slice(0, 20);

  // Links
  const links = [];
  for (const m of html.matchAll(/<a[^>]+href=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi)) {
    const href = m[1], text = stripTags(m[2]).trim();
    if (href && href !== '#' && !href.startsWith('javascript:') && text) {
      links.push({ text: text.substring(0, 80), href });
    }
  }

  // CTA buttons — anchors with elementor-button or btn classes
  const ctaButtons = [];
  for (const m of html.matchAll(/<a[^>]+class=["'][^"']*(?:elementor-button|wp-block-button__link|btn)[^"']*["'][^>]*href=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi)) {
    const href = m[1], text = stripTags(m[2]).trim();
    if (text && href) ctaButtons.push({ text, href });
  }

  // Build logical sections from H2 headings (for interior pages)
  const sections = [];
  // Hero is always order 1
  if (h1s[0]) {
    sections.push({
      order: 1,
      type: 'hero',
      heading: h1s[0],
      subheading: h2s[0] || '',
      body_text: paragraphs[0] || '',
      images: Array.from(imgSrcs).filter(s => !s.includes('logo') && !s.includes('favicon')).slice(0, 2),
      cta_buttons: ctaButtons.slice(0, 3),
      is_dynamic: ctaButtons.length > 0 || imgSrcs.size > 0,
    });
  }
  // Content sections from remaining H2s
  h2s.slice(1).forEach((heading, i) => {
    sections.push({
      order: i + 2,
      type: heading.toLowerCase().includes('faq') ? 'faq'
          : heading.toLowerCase().includes('testimonial') || heading.toLowerCase().includes('client') ? 'testimonial'
          : heading.toLowerCase().includes('contact') ? 'form'
          : 'content',
      heading,
      subheading: h3s[i] || '',
      body_text: paragraphs[i + 1] || '',
      images: [],
      cta_buttons: [],
      is_dynamic: false,
    });
  });

  // For the home page, treat each section individually
  // (already captured by Puppeteer; this is for enrichment only)

  return {
    filename,
    meta: { title, description: desc, canonical: canon },
    h1s, h2s, h3s,
    paragraphs,
    images: Array.from(imgSrcs),
    listItems,
    links,
    ctaButtons,
    formFields,
    sections,
  };
}

// ─── Known good data from screenshots / visual analysis ──────────────────────

const FOOTER_VERIFIED = {
  quick_links: [
    { text: 'How It Works', href: '/how-it-works' },
    { text: 'About Us',     href: '/about' },
    { text: 'Capabilities', href: '/capabilities' },
    { text: 'Industry Expertise', href: '/industry-expertise' },
    { text: 'Media Strategy', href: '/media-strategy' },
    { text: 'Media Relations', href: '/media-relations' },
    { text: 'User Sitemap', href: '/sitemap' },
  ],
  address:  '100 Church Street, Suite 8010, Manhattan, New York, 10007',
  phone:    '(646) 535-3995',
  email:    'contact@steinbergvalentino.com',
  business_hours: {
    monday_friday: '9am to 5pm',
    saturday:      '10am to 2pm',
    sunday:        'Closed',
  },
  copyright: '© Copyright 2025 - SteinbergValentino Group',
};

const TOPBAR_VERIFIED = {
  phone: '(646) 535-3995',
  social: [
    { platform: 'Facebook',  href: '#' },
    { platform: 'Twitter',   href: '#' },
    { platform: 'Pinterest', href: '#' },
    { platform: 'Instagram', href: '#' },
    { platform: 'LinkedIn',  href: '#' },
  ],
};

const NAVBAR_VERIFIED = {
  logo: './steinbergvalentino.com/images/svgroup-logo-1.png',
  logo_alt: 'SteinbergValentino Group',
  topbar: TOPBAR_VERIFIED,
  menu: [
    { label: 'Home', href: '/', children: [] },
    {
      label: 'About',
      href: '/about',
      children: [
        { label: 'How It Works',      href: '/how-it-works' },
        { label: 'About Us',          href: '/about' },
        { label: 'Capabilities',      href: '/capabilities' },
        { label: 'Industry Expertise',href: '/industry-expertise' },
        { label: 'Financial Marketing',href: '/financial-marketing' },
      ],
    },
    {
      label: 'Advisory',
      href: '/advisory',
      children: [
        { label: 'Strategic Advisory',        href: '/strategic-advisory' },
        { label: 'Strategic Communications',  href: '/strategic-communications' },
        { label: 'Transactional Advisory',    href: '/transactional-advisory' },
        { label: 'Capital Formation',         href: '/capital-formation' },
        { label: 'Crises Management',         href: '/crises-management' },
        { label: 'Litigation Communications', href: '/litigation-communications' },
      ],
    },
    {
      label: 'Market Entry',
      href: '/market-entry',
      children: [
        { label: 'Media Relations',        href: '/media-relations' },
        { label: 'Media Strategy',         href: '/media-strategy' },
        { label: 'Multicultural Engagement', href: '/multicultural-engagement' },
      ],
    },
    {
      label: 'Exchanges',
      href: '/exchanges',
      children: [
        { label: 'OTC Markets',       href: '/otc-markets' },
        { label: 'NASDAQ Small Cap',  href: '/nasdaq-small-cap' },
        { label: 'Canadian CSE',      href: '/canadian-cse' },
        { label: 'Canadian TSX',      href: '/canadian-tsx' },
        { label: 'German Frankfurt',  href: '/german-frankfurt' },
      ],
    },
    { label: 'Contact Us', href: '/contact', children: [] },
  ],
};

const CONTACT_FORM_VERIFIED = {
  action: 'https://steinbergvalentino.com/send_mail.php',
  method: 'POST',
  has_recaptcha: true,
  fields: [
    { tag: 'input',    type: 'text',     name: 'first_name', placeholder: 'First Name',     required: true  },
    { tag: 'input',    type: 'text',     name: 'last_name',  placeholder: 'Last Name',      required: true  },
    { tag: 'input',    type: 'email',    name: 'email',      placeholder: 'Email Address',  required: true  },
    { tag: 'textarea', type: 'textarea', name: 'message',    placeholder: 'Message',        required: true  },
  ],
  submit_button_text: 'SUBMIT',
  submit_button_style: 'green full-width',
};

// Mini form (used in sidebar/home)
const MINI_FORM_VERIFIED = {
  action: 'https://steinbergvalentino.com/send_mail.php',
  method: 'POST',
  fields: [
    { tag: 'input', type: 'email', name: 'form_fields[email]', placeholder: 'Your Email',   required: true },
    { tag: 'input', type: 'tel',   name: 'form_fields[field_e1fc1c5]', placeholder: 'Phone', required: true },
  ],
  submit_button_text: 'Get More Information',
};

// SITEMAP from user-sitemap.html (verified visually)
const SITEMAP_VERIFIED = {
  About: [
    { label: 'How It Works',       href: '/how-it-works' },
    { label: 'Capabilities',       href: '/capabilities' },
    { label: 'Industry Expertise', href: '/industry-expertise' },
    { label: 'Financial Marketing',href: '/financial-marketing' },
  ],
  Advisory: [
    { label: 'Strategic Advisory',         href: '/strategic-advisory' },
    { label: 'Strategic Communications',   href: '/strategic-communications' },
    { label: 'Transactional Advisory',     href: '/transactional-advisory' },
    { label: 'Capital Formation',          href: '/capital-formation' },
    { label: 'Crises Management',          href: '/crises-management' },
    { label: 'Litigation Communications',  href: '/litigation-communications' },
  ],
  'Market Entry': [
    { label: 'Media Relations',          href: '/media-relations' },
    { label: 'Media Strategy',           href: '/media-strategy' },
    { label: 'Multicultural Engagement', href: '/multicultural-engagement' },
  ],
  Exchanges: [
    { label: 'OTC Markets',      href: '/otc-markets' },
    { label: 'Nasdaq',           href: '/nasdaq-small-cap' },
    { label: 'Canadian CSE',     href: '/canadian-cse' },
    { label: 'Canadian TSX',     href: '/canadian-tsx' },
    { label: 'German Frankfurt', href: '/german-frankfurt' },
  ],
  'Contact Us': [{ label: 'Contact Us', href: '/contact' }],
};

// ─── Page metadata (corrections / overrides) ─────────────────────────────────
// about.html and how-it-works.html have confusing filenames — confirmed by screenshots

const PAGE_OVERRIDES = {
  'about.html': {
    // The about.html file (title: "How The Top Firm Works") actually shows
    // the "about the company" philosophy page. H1 "Feel Free To Contact Us"
    // is a sidebar/footer artifact — the real content comes from paragraphs.
    page_name: 'About Us',
    new_route: '/about',
    template_type: 'about',
    note: 'about.html title is "How The Top Firm Works for The Best". Main content is company philosophy. The H1 shown is a sidebar contact CTA, NOT the page hero.',
  },
  'how-it-works.html': {
    // how-it-works.html (title: "Hub of Innovation") is the detailed "About SV Group"
    // philosophy page — no H1 because it uses H2 headings directly.
    page_name: 'How It Works',
    new_route: '/how-it-works',
    template_type: 'about',
    note: 'Sections: We don\'t chase prospects | SV Group Usually Fueled By Innovation | Financial PR Building for the 21st Century | Do we have Enough Eggs | We don\'t just but we do perform well | Financial Seduction Originates Here | Underprivileged Entities | Let us portray you better | Partnering.',
  },
};

// Design system (verified from screenshots)
const DESIGN_SYSTEM = {
  colors: {
    brand_gold: '#dca840',
    brand_dark: '#222222',
    background_white: '#ffffff',
    footer_bg: '#2b2b2b',
    text_primary: '#333333',
    text_muted: '#777777',
  },
  typography: {
    font_family: 'Roboto (Google Fonts)',
    heading_color: '#dca840 (gold on service pages) / #333 on home',
    body_size: '16px',
  },
  layout: {
    home_page: 'Full-width Elementor sections, no sidebar',
    interior_pages: '2-column: main content (left ~65%) + sidebar (right ~30%)',
    sidebar_content: 'Navigation links to all service pages (styled as gold links)',
    breadcrumb: 'You are here: Home / PageName (above main content)',
    max_width: '1200px container',
  },
  topbar: 'Black bar: social icons left + phone right',
  header: 'White header: logo left + main nav right + mobile hamburger',
  footer: '3-column dark footer: Quick Links | Our Address | Business Hours + copyright strip',
};

// ─── Main ─────────────────────────────────────────────────────────────────────

function suggestStrapiContentType(filename) {
  const map = {
    'index.html':                   { type: 'Single Type', name: 'Homepage' },
    'about.html':                   { type: 'Single Type', name: 'AboutPage' },
    'how-it-works.html':            { type: 'Single Type', name: 'HowItWorksPage' },
    'capabilities.html':            { type: 'Single Type', name: 'CapabilitiesPage' },
    'industry-expertise.html':      { type: 'Single Type', name: 'IndustryExpertisePage' },
    'contact.html':                 { type: 'Single Type', name: 'ContactPage' },
    'user-sitemap.html':            { type: 'auto-generated', name: 'Sitemap' },
    'advisory.html':                { type: 'Collection Type', name: 'ServicePage', slug: 'advisory' },
    'strategic-advisory.html':      { type: 'Collection Type', name: 'ServicePage', slug: 'strategic-advisory' },
    'transactional-advisory.html':  { type: 'Collection Type', name: 'ServicePage', slug: 'transactional-advisory' },
    'capital-formation.html':       { type: 'Collection Type', name: 'ServicePage', slug: 'capital-formation' },
    'strategic-communications.html':{ type: 'Collection Type', name: 'ServicePage', slug: 'strategic-communications' },
    'financial-marketing.html':     { type: 'Collection Type', name: 'ServicePage', slug: 'financial-marketing' },
    'media-relations.html':         { type: 'Collection Type', name: 'ServicePage', slug: 'media-relations' },
    'media-strategy.html':          { type: 'Collection Type', name: 'ServicePage', slug: 'media-strategy' },
    'multicultural-engagement.html':{ type: 'Collection Type', name: 'ServicePage', slug: 'multicultural-engagement' },
    'market-entry.html':            { type: 'Collection Type', name: 'ServicePage', slug: 'market-entry' },
    'crises-management.html':       { type: 'Collection Type', name: 'ServicePage', slug: 'crises-management' },
    'litigation-communications.html':{ type: 'Collection Type', name: 'ServicePage', slug: 'litigation-communications' },
    'nasdaq-small-cap.html':        { type: 'Collection Type', name: 'ExchangePage', slug: 'nasdaq-small-cap' },
    'otc-markets.html':             { type: 'Collection Type', name: 'ExchangePage', slug: 'otc-markets' },
    'canadian-tsx.html':            { type: 'Collection Type', name: 'ExchangePage', slug: 'canadian-tsx' },
    'canadian-cse.html':            { type: 'Collection Type', name: 'ExchangePage', slug: 'canadian-cse' },
    'german-frankfurt.html':        { type: 'Collection Type', name: 'ExchangePage', slug: 'german-frankfurt' },
  };
  return map[filename] || { type: 'Single Type', name: 'Page' };
}

function strapiFields(filename, data) {
  const base = [
    { field_name: 'title',            field_type: 'text (required)' },
    { field_name: 'slug',             field_type: 'uid (from title)' },
    { field_name: 'meta_title',       field_type: 'text' },
    { field_name: 'meta_description', field_type: 'text' },
  ];
  const hasHero   = data.h1s.length > 0;
  const hasImages = data.images.length > 0;
  const hasForm   = data.formFields.length > 0;
  const hasFAQ    = data.h2s.some(h => h.toLowerCase().includes('faq'));

  if (hasHero) {
    base.push({ field_name: 'hero_heading',    field_type: 'text (required)' });
    base.push({ field_name: 'hero_subheading', field_type: 'text' });
    base.push({ field_name: 'hero_image',      field_type: 'media (single)' });
    base.push({ field_name: 'hero_cta_label',  field_type: 'text' });
    base.push({ field_name: 'hero_cta_url',    field_type: 'text' });
  }
  base.push({ field_name: 'body_content',   field_type: 'richtext' });
  base.push({ field_name: 'sections',       field_type: 'component[ContentSection] (repeatable)' });
  if (hasImages) base.push({ field_name: 'featured_image', field_type: 'media (single)' });
  if (hasFAQ)   base.push({ field_name: 'faq_items', field_type: 'component[FAQItem] (repeatable)' });
  if (hasForm)  base.push({ field_name: 'show_contact_form', field_type: 'boolean (default true)' });
  base.push({ field_name: 'cta_strip_heading',      field_type: 'text' });
  base.push({ field_name: 'cta_strip_button_label', field_type: 'text' });

  return base;
}

function main() {
  console.log('Enriching analysis with raw HTML extraction + visual corrections...\n');

  const HTML_FILES = fs.readdirSync(SITE_DIR).filter(f => f.endsWith('.html')).sort();
  const allImages = new Set();
  const allLinks  = [];

  const pages = HTML_FILES.map(filename => {
    const data = extractContent(filename);
    data.images.forEach(i => allImages.add(i));
    data.links.forEach(l => allLinks.push({ ...l, source: filename }));

    const overrides = PAGE_OVERRIDES[filename] || {};
    const strapiMeta = suggestStrapiContentType(filename);

    // Derive page name from filename if not overridden
    const pageName = overrides.page_name || filename
      .replace('.html', '')
      .replace(/-/g, ' ')
      .replace(/\b\w/g, c => c.toUpperCase());

    const newRoute = overrides.new_route ||
      (filename === 'index.html' ? '/' :
       filename === 'user-sitemap.html' ? '/sitemap' :
       '/' + filename.replace('.html', ''));

    const templateType = overrides.template_type ||
      (filename === 'index.html' ? 'home' :
       filename === 'contact.html' ? 'contact' :
       filename === 'user-sitemap.html' ? 'sitemap' :
       ['nasdaq-small-cap.html','otc-markets.html','canadian-tsx.html','canadian-cse.html','german-frankfurt.html'].includes(filename) ? 'exchange' :
       ['about.html','how-it-works.html','capabilities.html','industry-expertise.html'].includes(filename) ? 'about' :
       'service');

    console.log(`  ${filename}: ${data.h2s.length} content sections, ${data.images.length} images`);

    return {
      file: filename,
      new_route: newRoute,
      page_name: pageName,
      template_type: templateType,
      meta: data.meta,
      headings: {
        h1: data.h1s,
        h2: data.h2s,
        h3: data.h3s.slice(0, 10),
      },
      key_content_sections: data.h2s.map((h, i) => ({
        order: i + 1,
        heading: h,
        subheading: data.h3s[i] || '',
        preview_text: data.paragraphs[i + 1]?.substring(0, 200) || '',
      })),
      paragraphs_preview: data.paragraphs.slice(0, 6),
      list_items_preview: data.listItems.slice(0, 10),
      images: data.images,
      cta_buttons: data.ctaButtons,
      has_form: data.formFields.length > 0,
      form_fields: filename === 'contact.html' ? CONTACT_FORM_VERIFIED : (
        data.formFields.length > 0 ? {
          fields: data.formFields.filter(f => !['hidden','submit'].includes(f.type)),
          note: 'mini lead-capture form (email + phone)',
        } : null
      ),
      strapi: strapiMeta,
      strapi_fields: strapiFields(filename, data),
      ...(overrides.note ? { analysis_note: overrides.note } : {}),
    };
  });

  // Broken internal links check
  const brokenLinks = [];
  allLinks.forEach(({ source, text, href }) => {
    if (!href.startsWith('http') && !href.startsWith('mailto:') && !href.startsWith('tel:') && !href.startsWith('#') && !href.includes('javascript:')) {
      const resolved = href.split('?')[0].split('#')[0].replace(/^\//, '');
      if (resolved && !fs.existsSync(path.join(SITE_DIR, resolved)) && !resolved.startsWith('wp-') && !resolved.startsWith('cdn-cgi')) {
        brokenLinks.push({ source, text, href });
      }
    }
  });

  const report = {
    generated_at: new Date().toISOString(),
    site_overview: {
      name: 'SteinbergValentino Group',
      tagline: 'The Best IR Firm For Small & Mid-Cap Businesses',
      original_url: 'https://www.steinbergvalentino.com',
      original_stack: 'WordPress + Elementor (static HTML export)',
      rebuild_stack: 'Next.js 14 (App Router) + Strapi v5 + Tailwind CSS + Shadcn/UI',
      total_pages: pages.length,
      design_system: DESIGN_SYSTEM,
    },
    shared_components: {
      navbar: NAVBAR_VERIFIED,
      footer: FOOTER_VERIFIED,
      contact_form_full: CONTACT_FORM_VERIFIED,
      contact_form_mini: MINI_FORM_VERIFIED,
      sitemap_structure: SITEMAP_VERIFIED,
      sidebar: {
        type: 'sticky right sidebar',
        appears_on: 'all interior pages except home and contact',
        content: 'Navigation links to all service/exchange pages, styled as gold links on dark/light background',
        note: 'In Next.js rebuild, this becomes an <InPageSidebar> component in the interior layout',
      },
    },
    pages,
    page_categories: {
      home: ['index.html'],
      about_section: ['about.html', 'how-it-works.html', 'capabilities.html', 'industry-expertise.html'],
      advisory_services: ['advisory.html', 'strategic-advisory.html', 'transactional-advisory.html', 'capital-formation.html', 'crises-management.html', 'litigation-communications.html'],
      market_entry_services: ['market-entry.html', 'financial-marketing.html', 'media-relations.html', 'media-strategy.html', 'multicultural-engagement.html'],
      exchange_pages: ['nasdaq-small-cap.html', 'otc-markets.html', 'canadian-tsx.html', 'canadian-cse.html', 'german-frankfurt.html'],
      utility: ['contact.html', 'user-sitemap.html'],
    },
    templates: {
      home: {
        description: 'Full-width Elementor sections, no sidebar. Sections: Hero (banner + h1 + CTA strip + email/phone form) → Why SV Group (content + image) → Services overview → How It Works intro → SteinbergValentino Group overview → More Than An IR Firm (content sections) → Stats/counters → Testimonials carousel → Footer',
        next_js_component: 'app/page.tsx (standalone, no sidebar layout)',
        key_sections: ['Hero','WhySVGroup','ServicesGrid','HowItWorksIntro','CompanyOverview','Stats','Testimonials'],
        cta_buttons: [
          { text: 'Our Capabilities', href: '/capabilities' },
          { text: 'Talk to An Expert', href: '/contact' },
          { text: 'About SV Group', href: '/about' },
        ],
        mini_form: true,
      },
      service: {
        description: 'Interior 2-column layout: breadcrumb → H1 hero (gold) → richtext body with multiple H2 subsections → right sidebar with service navigation. No standalone CTA strip.',
        next_js_component: 'app/[service-slug]/page.tsx using InteriorLayout (main + sidebar)',
        key_sections: ['Breadcrumb','Hero H1','Body richtext (H2 subsections)','Sidebar nav'],
        sidebar: true,
      },
      exchange: {
        description: 'Same as service template but with FAQ section at bottom. H1 in gold uppercase. Multiple H2 sections covering: Why choose this exchange, Young entrepreneurs, How the IR firm helps, Benefits, How it works, FAQs.',
        next_js_component: 'app/[exchange-slug]/page.tsx using InteriorLayout',
        key_sections: ['Breadcrumb','Hero H1','Content sections','FAQ accordion','Sidebar nav'],
        has_faq: true,
        sidebar: true,
      },
      about: {
        description: 'Interior layout with company philosophy / process content. Multiple H2 sections with body text. No images beyond sidebar. Minimal CTA.',
        next_js_component: 'app/about/page.tsx or app/how-it-works/page.tsx using InteriorLayout',
        sidebar: true,
      },
      contact: {
        description: 'Full-width contact form (First Name, Last Name, Email, Message, reCAPTCHA, Submit). No sidebar. Footer shows address/phone/email.',
        next_js_component: 'app/contact/page.tsx (full-width, no sidebar)',
        sidebar: false,
      },
    },
    missing_pages: [
      { page: 'privacy-policy', note: 'Linked in footer but not in export' },
      { page: 'terms-condition', note: 'Linked in footer but not in export' },
      { page: '404', note: 'Not present; needs custom Next.js not-found.tsx' },
    ],
    broken_links: brokenLinks.slice(0, 20),
    images_inventory: {
      total: allImages.size,
      local_images_dir: './steinbergvalentino.com/images/',
      local_image_files: fs.readdirSync(path.join(SITE_DIR, 'images')),
      all_referenced_images: Array.from(allImages),
    },
    rebuild_notes: {
      forms: 'Replace Elementor forms + send_mail.php with Resend (transactional email) or Formspree. reCAPTCHA v3 or hCaptcha.',
      fonts: 'Roboto loaded from Google Fonts. Self-host via next/font for performance.',
      images: 'All images in /images/ are local. Upload to Strapi media library or Cloudinary.',
      sidebar: 'Sidebar nav is static — build as a server component from GlobalSettings Strapi single type.',
      seo: 'Each page has unique title + description. Canonical points to steinbergvalentino.com. Rebuild with Next.js generateMetadata().',
      analytics: 'No GA/GTM detected in static export. Add via @next/third-parties/google.',
      recaptcha: 'reCAPTCHA shows "Invalid domain" in local export — will work with correct domain key in prod.',
    },
  };

  fs.writeFileSync(path.join(OUTPUT_DIR, 'analysis.json'), JSON.stringify(report, null, 2));
  console.log('\n✓ Saved: output/analysis.json');

  // Count totals
  const totalH2s = pages.reduce((sum, p) => sum + (p.headings?.h2?.length || 0), 0);
  console.log(`\nSummary:`);
  console.log(`  Pages:               ${pages.length}`);
  console.log(`  Total H2 sections:   ${totalH2s}`);
  console.log(`  Total images:        ${allImages.size}`);
  console.log(`  Broken links:        ${brokenLinks.length}`);
  console.log(`  Missing pages:       3 (privacy-policy, terms, 404)`);
}

main();
