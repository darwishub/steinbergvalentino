/**
 * Finalize: patches analysis.json with accurate heading/section data
 * sourced from raw HTML (including <strong>-as-heading pattern)
 */
const fs = require('fs');
const path = require('path');

const SITE_DIR = path.resolve('./steinbergvalentino.com');
const OUTPUT_DIR = path.resolve('./output');

function stripTags(html) {
  return html
    .replace(/<[^>]+>/g, ' ')
    .replace(/&[a-z#0-9]+;/gi, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

const SKIP_HEADINGS = new Set(['About', 'Search', 'ABOUT', 'SEARCH', 'Recent Posts', 'Recent Comments', 'Archives', 'Tags', 'Categories']);
const SKIP_STRONGS  = new Set(['Monday-Friday:', 'Saturday:', 'Sunday:', 'SteinbergValentino Group']);

function getAllHeadings(html) {
  return [...html.matchAll(/<(h[1-6])[^>]*>([\s\S]*?)<\/\1>/gi)]
    .map(m => ({ tag: m[1], text: stripTags(m[2]) }))
    .filter(x => x.text.length > 3 && !SKIP_HEADINGS.has(x.text));
}

function getAllStrongs(html) {
  return [...html.matchAll(/<strong[^>]*>([\s\S]*?)<\/strong>/gi)]
    .map(m => stripTags(m[1]))
    .filter(t => t.length > 8 && t.length < 150 && !SKIP_STRONGS.has(t));
}

function getAllParagraphs(html) {
  return [...html.matchAll(/<p[^>]*>([\s\S]*?)<\/p>/gi)]
    .map(m => stripTags(m[1]))
    .filter(t => t.length > 25 && !t.startsWith('[contact-form'))
    .slice(0, 12);
}

function getAllListItems(html) {
  return [...html.matchAll(/<li[^>]*>([\s\S]*?)<\/li>/gi)]
    .map(m => stripTags(m[1]))
    .filter(t => t.length > 3 && t.length < 200)
    .slice(0, 15);
}

function getAllImages(html) {
  const imgs = new Set();
  for (const m of html.matchAll(/\bsrc=["']([^"']+\.(jpg|jpeg|png|webp|gif|svg))[^"']*["']/gi))
    if (!m[1].startsWith('data:') && !m[1].includes('/fonts/') && !m[1].includes('/css/')) imgs.add(m[1]);
  for (const m of html.matchAll(/\bdata-(?:src|lazy-src|bg)=["']([^"']+)["']/gi))
    if (m[1].match(/\.(jpg|jpeg|png|webp|gif)/i)) imgs.add(m[1]);
  for (const m of html.matchAll(/background(?:-image)?:\s*url\(["']?([^"')]+)["']?\)/gi))
    if (m[1].match(/\.(jpg|jpeg|png|webp|gif)/i) && !m[1].startsWith('data:')) imgs.add(m[1]);
  return Array.from(imgs);
}

function buildSections(headings, strongs, paragraphs) {
  const sections = [];
  let order = 1;

  // Determine the actual page hero heading
  const h1 = headings.find(h => h.tag === 'h1');
  const sidebarH1s = ['Feel Free To Contact Us']; // known sidebar artifacts
  const heroHeading = h1 && !sidebarH1s.includes(h1.text) ? h1.text : null;

  if (heroHeading) {
    const firstH2 = headings.find(h => h.tag === 'h2');
    sections.push({
      order: order++,
      type: 'hero',
      heading: heroHeading,
      subheading: firstH2?.text || '',
      body_text: paragraphs[0] || '',
      cta_buttons: [],
      is_dynamic: true,
    });
  }

  // Remaining headings after H1/H2 (H3-H6)
  const subHeadings = headings.filter(h => h.tag !== 'h1' && h.tag !== 'h2');
  subHeadings.forEach((h, i) => {
    const type = h.text.toLowerCase().includes('faq') ? 'faq'
               : h.text.toLowerCase().includes('benefit') ? 'content'
               : 'content';
    sections.push({
      order: order++,
      type,
      heading: h.text,
      subheading: '',
      body_text: paragraphs[i + 1] || '',
      cta_buttons: [],
      is_dynamic: false,
    });
  });

  // Strong-as-headings (service pages)
  const contentStrongs = strongs.filter(s =>
    !s.startsWith('•') &&
    !s.toLowerCase().includes('contact') &&
    !s.includes('family today') &&
    !s.includes('make your business successful')
  );
  contentStrongs.forEach((s, i) => {
    sections.push({
      order: order++,
      type: 'content',
      heading: s,
      subheading: '',
      body_text: paragraphs[subHeadings.length + i + 1] || '',
      cta_buttons: [],
      is_dynamic: false,
    });
  });

  // Special: how-it-works.html has no H1 but all strongs are section headings
  if (!heroHeading && strongs.length > 0) {
    strongs.slice(0, 8).forEach((s, i) => {
      sections.push({
        order: order++,
        type: 'content',
        heading: s,
        subheading: '',
        body_text: paragraphs[i] || '',
        cta_buttons: [],
        is_dynamic: false,
      });
    });
  }

  return sections;
}

function processPage(filename) {
  const filepath = path.join(SITE_DIR, filename);
  if (!fs.existsSync(filepath)) return null;
  const html = fs.readFileSync(filepath, 'utf-8');

  const headings  = getAllHeadings(html);
  const strongs   = getAllStrongs(html);
  const paragraphs = getAllParagraphs(html);
  const listItems  = getAllListItems(html);
  const images     = getAllImages(html);
  const sections   = buildSections(headings, strongs, paragraphs);

  // Extract CTAs
  const ctaButtons = [];
  for (const m of html.matchAll(/<a[^>]+class=["'][^"']*elementor-button[^"']*["'][^>]*href=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi)) {
    const text = stripTags(m[2]);
    if (text && m[1]) ctaButtons.push({ text, href: m[1] });
  }

  // Meta
  const title  = (html.match(/<title[^>]*>([^<]+)<\/title>/i) || [])[1]?.trim() || '';
  const desc   = (html.match(/<meta[^>]+name=["']description["'][^>]+content=["']([^"']+)["']/i) || [])[1]?.trim() || '';
  const canon  = (html.match(/<link[^>]+rel=["']canonical["'][^>]+href=["']([^"']+)["']/i) || [])[1]?.trim() || '';

  // Check for FAQ
  const hasFaq = headings.some(h => h.text.toLowerCase().includes('faq')) ||
    html.toLowerCase().includes('frequently asked');

  // Check for sidebar (all interior pages except home/contact/sitemap)
  const noSidebar = ['index.html','contact.html','user-sitemap.html'].includes(filename);

  return {
    filename,
    meta: { title, description: desc, canonical: canon },
    headings_raw: headings,
    strong_section_headings: strongs.filter(s =>
      !s.startsWith('•') &&
      !s.includes('family today') &&
      !s.toLowerCase().includes('make your business successful in no time')
    ),
    paragraphs_preview: paragraphs.slice(0, 6),
    list_items_preview: listItems,
    images,
    cta_buttons: ctaButtons,
    sections,
    has_faq: hasFaq,
    has_sidebar: !noSidebar,
    section_count: sections.length,
  };
}

// ─── Main ─────────────────────────────────────────────────────────────────────

function main() {
  console.log('Building final analysis.json...\n');
  const base = JSON.parse(fs.readFileSync(path.join(OUTPUT_DIR, 'analysis.json'), 'utf-8'));

  const pageMap = {};
  base.pages.forEach(p => { pageMap[p.file] = p; });

  const HTML_FILES = fs.readdirSync(SITE_DIR).filter(f => f.endsWith('.html')).sort();
  const allImages = new Set();
  const enriched = [];

  for (const filename of HTML_FILES) {
    const raw = processPage(filename);
    if (!raw) continue;
    raw.images.forEach(i => allImages.add(i));

    const existing = pageMap[filename] || {};
    // Merge: keep existing page metadata, replace sections/headings with enriched
    enriched.push({
      ...existing,
      meta: raw.meta,
      headings: {
        h1: raw.headings_raw.filter(h => h.tag === 'h1').map(h => h.text),
        h2: raw.headings_raw.filter(h => h.tag === 'h2').map(h => h.text),
        h3_h6: raw.headings_raw.filter(h => !['h1','h2'].includes(h.tag)).map(h => `${h.tag}: ${h.text}`),
        strong_headings: raw.strong_section_headings,
      },
      sections: raw.sections,
      section_count: raw.sections.length,
      cta_buttons: raw.cta_buttons.length > 0 ? raw.cta_buttons : existing.cta_buttons,
      paragraphs_preview: raw.paragraphs_preview,
      list_items_preview: raw.list_items_preview,
      images: raw.images,
      has_faq: raw.has_faq,
      has_sidebar: raw.has_sidebar,
      strapi_fields: existing.strapi_fields || [],
    });

    const sectionNames = raw.sections.map(s => s.heading || '(no heading)').slice(0, 6).join(' → ');
    console.log(`  ${filename.padEnd(38)} ${raw.sections.length} sections | ${sectionNames.substring(0, 80)}`);
  }

  // Update the footer with fully verified data
  base.shared_components.footer = {
    ...base.shared_components.footer,
    address: '100 Church Street, Suite 8010, Manhattan, New York, 10007',
    phone: '(646) 535-3995',
    email: 'contact@steinbergvalentino.com',
    business_hours: {
      monday_friday: '9am to 5pm',
      saturday: '10am to 2pm',
      sunday: 'Closed',
    },
    copyright: '© Copyright 2025 - SteinbergValentino Group',
    quick_links: [
      { text: 'How It Works',       href: '/how-it-works' },
      { text: 'About Us',           href: '/about' },
      { text: 'Capabilities',       href: '/capabilities' },
      { text: 'Industry Expertise', href: '/industry-expertise' },
      { text: 'Media Strategy',     href: '/media-strategy' },
      { text: 'Media Relations',    href: '/media-relations' },
      { text: 'User Sitemap',       href: '/sitemap' },
    ],
  };

  // Images inventory — strip file:// prefix and normalize
  const normalizedImages = Array.from(allImages).map(img =>
    img.replace(/^file:\/\/[^/]+/, '').replace(/.*\/images\//, 'images/')
  );

  const finalReport = {
    ...base,
    pages: enriched,
    images_inventory: {
      total_unique: allImages.size,
      local_images_dir: 'steinbergvalentino.com/images/',
      local_files: fs.readdirSync(path.join(SITE_DIR, 'images')),
      all_referenced: normalizedImages,
    },
  };

  fs.writeFileSync(path.join(OUTPUT_DIR, 'analysis.json'), JSON.stringify(finalReport, null, 2));

  const totalSections = enriched.reduce((s, p) => s + p.section_count, 0);
  console.log(`\n✓ Final analysis.json written`);
  console.log(`  Pages: ${enriched.length} | Total sections: ${totalSections} | Images: ${allImages.size}`);
}

main();
