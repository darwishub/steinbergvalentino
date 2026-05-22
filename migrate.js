#!/usr/bin/env node
/**
 * SteinbergValentino — Content Migration Script
 * Reads output/analysis.json, uploads images and POSTs content to Strapi v5.
 *
 * Usage:
 *   node migrate.js              — full migration
 *   node migrate.js --dry-run    — show what would be sent, no writes
 *   node migrate.js --images-only — only upload images, skip content
 *   node migrate.js --page about.html — migrate one page only
 *   node migrate.js --reset      — delete all collection entries before migrating
 */

'use strict';

const fs   = require('fs');
const path = require('path');

// ─── Config ──────────────────────────────────────────────────────────────────

const STRAPI_URL = 'http://127.0.0.1:1337';
const IMAGES_DIR = path.resolve('./steinbergvalentino.com/images');
const ANALYSIS   = path.resolve('./output/analysis.json');
const REPORT_OUT = path.resolve('./output/migrate-report.json');

const LEGACY_ROUTE_MAP = {
  '/': '/',
  '/index.html': '/',
  '/about.html': '/about',
  '/about/': '/about',
  '/how-it-works.html': '/how-it-works',
  '/how-it-works/': '/how-it-works',
  '/capabilities.html': '/capabilities',
  '/capabilities/': '/capabilities',
  '/industry-expertise.html': '/industry-expertise',
  '/industry-expertise/': '/industry-expertise',
  '/contact.html': '/contact',
  '/contact/': '/contact',
  '/user-sitemap.html': '/sitemap',
  '/sitemap/': '/sitemap',
  '/advisory.html': '/services/advisory',
  '/business-development/': '/services/advisory',
  '/strategic-advisory.html': '/services/strategic-advisory',
  '/strategic-advisory/': '/services/strategic-advisory',
  '/transactional-advisory.html': '/services/transactional-advisory',
  '/transactional-advisory/': '/services/transactional-advisory',
  '/capital-formation.html': '/services/capital-formation',
  '/capital-formation/': '/services/capital-formation',
  '/strategic-communications.html': '/services/strategic-communications',
  '/strategic-communications/': '/services/strategic-communications',
  '/financial-marketing.html': '/services/financial-marketing',
  '/financial-marketing/': '/services/financial-marketing',
  '/media-relations.html': '/services/media-relations',
  '/media-relations/': '/services/media-relations',
  '/media-strategy.html': '/services/media-strategy',
  '/media-strategy/': '/services/media-strategy',
  '/multicultural-engagement.html': '/services/multicultural-engagement',
  '/multicultural-engagement/': '/services/multicultural-engagement',
  '/market-entry.html': '/services/market-entry',
  '/market-entry/': '/services/market-entry',
  '/crises-management.html': '/services/crises-management',
  '/crises-management/': '/services/crises-management',
  '/litigation-communications.html': '/services/litigation-communications',
  '/litigation-communications/': '/services/litigation-communications',
  '/nasdaq-small-cap.html': '/exchanges/nasdaq-small-cap',
  '/nasdaq-small-cap-investor-relations-firm/': '/exchanges/nasdaq-small-cap',
  '/otc-markets.html': '/exchanges/otc-markets',
  '/otc-markets-investor-relations-firm/': '/exchanges/otc-markets',
  '/canadian-tsx.html': '/exchanges/canadian-tsx',
  '/canadian-tsx-investor-relations-firm/': '/exchanges/canadian-tsx',
  '/canadian-cse.html': '/exchanges/canadian-cse',
  '/canadian-cse-investor-relations-firm/': '/exchanges/canadian-cse',
  '/german-frankfurt.html': '/exchanges/german-frankfurt',
  '/german-frankfurt-stock-exchange-investor-relations-firm/': '/exchanges/german-frankfurt',
};

// Read API token from web/.env.local
function loadToken() {
  const envFile = path.resolve('./web/.env.local');
  if (!fs.existsSync(envFile)) throw new Error('web/.env.local not found');
  const token = fs.readFileSync(envFile, 'utf-8')
    .split('\n')
    .find(l => l.startsWith('STRAPI_API_TOKEN='))
    ?.split('=').slice(1).join('=').trim();
  if (!token || token.startsWith('#') || token === '') {
    throw new Error('STRAPI_API_TOKEN not set in web/.env.local');
  }
  return token;
}

// ─── CLI flags ───────────────────────────────────────────────────────────────

const args      = process.argv.slice(2);
const DRY_RUN   = args.includes('--dry-run');
const IMG_ONLY  = args.includes('--images-only');
const RESET     = args.includes('--reset');
const PAGE_FILTER = args.includes('--page') ? args[args.indexOf('--page') + 1] : null;

// ─── Logging ─────────────────────────────────────────────────────────────────

const c = {
  green:  s => `\x1b[32m${s}\x1b[0m`,
  red:    s => `\x1b[31m${s}\x1b[0m`,
  yellow: s => `\x1b[33m${s}\x1b[0m`,
  cyan:   s => `\x1b[36m${s}\x1b[0m`,
  bold:   s => `\x1b[1m${s}\x1b[0m`,
  dim:    s => `\x1b[2m${s}\x1b[0m`,
};

const log = {
  info:    msg => console.log(`  ${c.cyan('ℹ')}  ${msg}`),
  ok:      msg => console.log(`  ${c.green('✓')}  ${msg}`),
  warn:    msg => console.log(`  ${c.yellow('⚠')}  ${msg}`),
  error:   msg => console.log(`  ${c.red('✗')}  ${msg}`),
  section: msg => console.log(`\n${c.bold(msg)}`),
  dim:     msg => console.log(`     ${c.dim(msg)}`),
};

// ─── HTTP helpers ─────────────────────────────────────────────────────────────

async function strapiGet(endpoint, token) {
  const res = await fetch(`${STRAPI_URL}/api${endpoint}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error(`GET ${endpoint} → ${res.status}`);
  return res.json();
}

async function strapiPost(endpoint, body, token) {
  const res = await fetch(`${STRAPI_URL}/api${endpoint}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ data: body }),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(`POST ${endpoint} → ${res.status}: ${JSON.stringify(json?.error || json)}`);
  return json;
}

async function strapiPut(endpoint, body, token) {
  const res = await fetch(`${STRAPI_URL}/api${endpoint}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ data: body }),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(`PUT ${endpoint} → ${res.status}: ${JSON.stringify(json?.error || json)}`);
  return json;
}

async function strapiDelete(endpoint, token) {
  const res = await fetch(`${STRAPI_URL}/api${endpoint}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error(`DELETE ${endpoint} → ${res.status}`);
}

function mapLegacyHrefToFrontendRoute(href) {
  if (!href) return href;
  if (/^(mailto:|tel:|#|javascript:)/i.test(href)) return href;
  if (/^https?:\/\//i.test(href) && !href.includes('steinbergvalentino.com')) return href;

  const normalized = href
    .replace(/^https?:\/\/(www\.)?steinbergvalentino\.com/i, '')
    .replace(/\/index\.html$/i, '/')
    .trim();

  const withLeadingSlash = normalized.startsWith('/') ? normalized : `/${normalized}`;
  return LEGACY_ROUTE_MAP[withLeadingSlash] || LEGACY_ROUTE_MAP[`${withLeadingSlash}/`] || withLeadingSlash;
}

// ─── Image upload ─────────────────────────────────────────────────────────────

const imageCache = new Map(); // filename → strapi media id

function mimeType(filename) {
  const ext = path.extname(filename).toLowerCase();
  return { '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.png': 'image/png',
           '.webp': 'image/webp', '.gif': 'image/gif', '.svg': 'image/svg+xml' }[ext] || 'image/jpeg';
}

async function uploadImage(filename, token) {
  if (imageCache.has(filename)) return imageCache.get(filename);

  const filepath = path.join(IMAGES_DIR, filename);
  if (!fs.existsSync(filepath)) {
    log.warn(`Image not found locally: ${filename}`);
    return null;
  }

  if (DRY_RUN) {
    log.dim(`[dry-run] would upload: ${filename}`);
    imageCache.set(filename, 999); // fake id
    return 999;
  }

  try {
    const buffer  = fs.readFileSync(filepath);
    const blob    = new Blob([buffer], { type: mimeType(filename) });
    const form    = new FormData();
    form.append('files', blob, filename);
    form.append('fileInfo', JSON.stringify({ name: filename, caption: filename }));

    const res = await fetch(`${STRAPI_URL}/api/upload`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: form,
    });

    if (!res.ok) {
      const err = await res.text();
      throw new Error(`upload ${filename} → ${res.status}: ${err}`);
    }

    const [uploaded] = await res.json();
    imageCache.set(filename, uploaded.id);
    log.ok(`Uploaded image: ${filename} (id ${uploaded.id})`);
    return uploaded.id;
  } catch (e) {
    log.error(`Image upload failed for ${filename}: ${e.message}`);
    return null;
  }
}

// ─── Content helpers ──────────────────────────────────────────────────────────

/** Convert an array of plain-text strings to Strapi v5 blocks format */
function toBlocks(texts) {
  if (!texts || texts.length === 0) return [];
  return texts
    .filter(t => t && String(t).trim().length > 0)
    .map(t => ({
      type: 'paragraph',
      children: [{ type: 'text', text: String(t).trim() }],
    }));
}

/** Convert sections array to Strapi v5 blocks (heading + paragraph per section) */
function sectionsToBlocks(sections) {
  const blocks = [];
  for (const s of (sections || [])) {
    if (s.heading) {
      blocks.push({ type: 'heading', level: 2, children: [{ type: 'text', text: s.heading }] });
    }
    if (s.body_text) {
      blocks.push({ type: 'paragraph', children: [{ type: 'text', text: s.body_text }] });
    }
  }
  return blocks;
}

/**
 * Build ContentSection components for the `sections` repeatable field.
 * Uses page.sections (type=content) which contain the real body_text.
 * Filters out sections where body_text is a repeat of the heading (scraper artifact).
 */
function buildSections(pageData) {
  const rawSections = pageData.sections || [];
  return rawSections
    .filter(s => {
      if (s.type !== 'content') return false;                 // skip hero/etc
      if (!s.heading) return false;                           // must have heading
      if (!s.body_text) return false;                         // must have body
      const bt = s.body_text.trim();
      if (bt === s.heading.trim()) return false;              // skip heading duplicates
      if (bt.length < 40) return false;                       // skip stub sections
      return true;
    })
    .map(s => ({
      heading:    s.heading,
      subheading: s.subheading || '',
      body: [{ type: 'paragraph', children: [{ type: 'text', text: s.body_text.trim() }] }],
    }));
}

/** Derive slug from filename: strategic-advisory.html → strategic-advisory */
function slugFrom(filename) {
  return filename.replace('.html', '');
}

/** Pick the first local image filename from a page's image list */
function pickLocalImage(images) {
  if (!images) return null;
  for (const img of images) {
    const name = path.basename(img.replace(/\\/g, '/').split('?')[0]);
    const localPath = path.join(IMAGES_DIR, name);
    if (fs.existsSync(localPath) && !name.includes('favicon') && !name.includes('logo')) {
      return name;
    }
  }
  return null;
}

function normalizeLinks(links = []) {
  return links
    .filter(link => link && (link.label || link.text) && link.href)
    .map(link => ({
      label: String(link.label || link.text).trim(),
      href: mapLegacyHrefToFrontendRoute(String(link.href).trim()),
    }));
}

function buildGlobalSettingsPayload(analysis) {
  const footer = analysis.shared_components?.footer || {};
  const nav = analysis.shared_components?.navbar?.menu || [];

  const primaryNavigation = normalizeLinks(
    nav.map(item => ({
      label: item.label,
      href: mapLegacyHrefToFrontendRoute(item.href),
      children: normalizeLinks(item.children || []),
    }))
  ).map(item => ({
    ...item,
    children: normalizeLinks((nav.find(navItem => navItem.label === item.label)?.children) || []),
  }));

  const footerQuickLinks = normalizeLinks(
    (footer.quick_links || []).map(link => ({
      label: link.text || link.label,
      href: link.href,
    }))
  );

  const footerServiceLinks = [
    { label: 'Advisory', href: '/services/advisory' },
    { label: 'Strategic Advisory', href: '/services/strategic-advisory' },
    { label: 'Strategic Communications', href: '/services/strategic-communications' },
    { label: 'Transactional Advisory', href: '/services/transactional-advisory' },
    { label: 'Capital Formation', href: '/services/capital-formation' },
    { label: 'Crises Management', href: '/services/crises-management' },
    { label: 'Market Entry', href: '/services/market-entry' },
    { label: 'Media Relations', href: '/services/media-relations' },
    { label: 'Media Strategy', href: '/services/media-strategy' },
    { label: 'Multicultural Engagement', href: '/services/multicultural-engagement' },
    { label: 'Financial Marketing', href: '/services/financial-marketing' },
    { label: 'Litigation Communications', href: '/services/litigation-communications' },
  ];

  const footerExchangeLinks = [
    { label: 'NASDAQ Small Cap', href: '/exchanges/nasdaq-small-cap' },
    { label: 'OTC Markets', href: '/exchanges/otc-markets' },
    { label: 'Canadian TSX', href: '/exchanges/canadian-tsx' },
    { label: 'Canadian CSE', href: '/exchanges/canadian-cse' },
    { label: 'German Frankfurt', href: '/exchanges/german-frankfurt' },
  ];

  return {
    site_name: analysis.site_overview?.name || 'SteinbergValentino Group',
    tagline: analysis.site_overview?.tagline || 'The Best IR Firm For Small & Mid-Cap Businesses',
    footer_blurb:
      'The premier investor relations firm for small and mid-cap public companies.',
    contact_phone: analysis.shared_components?.navbar?.topbar?.phone || footer.phone || '(646) 535-3995',
    contact_email: footer.email || 'contact@steinbergvalentino.com',
    address: footer.address || '100 Church Street, Suite 8010, Manhattan, New York 10007',
    footer_copyright:
      footer.copyright || `© ${new Date().getFullYear()} SteinbergValentino Group. All rights reserved.`,
    primary_navigation: primaryNavigation,
    footer_quick_links: footerQuickLinks,
    footer_service_links: footerServiceLinks,
    footer_exchange_links: footerExchangeLinks,
    footer_legal_links: [],
    sitemap_heading: 'Sitemap',
    sitemap_intro:
      'Browse every migrated SteinbergValentino page in the rebuilt Next.js and Strapi experience.',
    sitemap_meta_title: 'Sitemap | SteinbergValentino Group',
    sitemap_meta_description:
      'Browse the full SteinbergValentino site structure, including firm pages, services, and exchange support pages.',
  };
}

async function migrateGlobalSettings(analysis, token) {
  const payload = buildGlobalSettingsPayload(analysis);

  if (DRY_RUN) {
    log.dim('[dry-run] PUT /global-setting → site-wide navigation, footer, sitemap metadata');
    return { documentId: 'dry-run' };
  }

  const result = await strapiPut('/global-setting', payload, token);
  return result.data || result;
}

// ─── Per-content-type migration ───────────────────────────────────────────────

async function migrateCollectionPage(page, endpoint, token) {
  const slug = slugFrom(page.file);
  const h1   = page.headings?.h1?.[0] || page.page_name;
  const h2   = page.headings?.h2?.[0] || '';

  // body_content = only intro paragraphs (rich content goes into sections repeatable)
  const bodyBlocks = toBlocks(page.paragraphs_preview?.slice(0, 3) || []);

  // Upload hero image
  const imgFilename = pickLocalImage(page.images);
  let heroImageId = null;
  if (imgFilename) {
    heroImageId = await uploadImage(imgFilename, token);
  }

  const payload = {
    title:           h1,
    slug:            slug,
    hero_heading:    h1,
    hero_subheading: h2,
    ...(heroImageId ? { hero_image: heroImageId } : {}),
    body_content:    bodyBlocks.length ? bodyBlocks : null,
    sections:        buildSections(page),
    meta_title:       page.meta?.title || h1,
    meta_description: page.meta?.description || '',
  };

  // Exchange pages get extra fields
  if (page.strapi?.name === 'ExchangePage') {
    const exchangeNames = {
      'nasdaq-small-cap': 'NASDAQ Small Cap',
      'otc-markets':      'OTC Markets',
      'canadian-tsx':     'Canadian TSX',
      'canadian-cse':     'Canadian CSE',
      'german-frankfurt': 'German Frankfurt',
    };
    const countries = {
      'nasdaq-small-cap': 'United States', 'otc-markets': 'United States',
      'canadian-tsx': 'Canada', 'canadian-cse': 'Canada',
      'german-frankfurt': 'Germany',
    };
    payload.exchange_name = exchangeNames[slug] || h1;
    payload.country       = countries[slug] || '';
  }

  if (DRY_RUN) {
    log.dim(`[dry-run] POST ${endpoint} → slug="${slug}", sections=${payload.sections.length}, blocks=${bodyBlocks.length}`);
    return { documentId: 'dry-run', slug };
  }

  // Check if already exists (by slug filter) and delete if reset mode
  try {
    const existing = await strapiGet(`${endpoint}?filters[slug][$eq]=${slug}`, token);
    if (existing.data?.length > 0) {
      if (RESET) {
        const docId = existing.data[0].documentId;
        await strapiDelete(`${endpoint}/${docId}`, token);
        log.warn(`Deleted existing: ${slug}`);
      } else {
        log.warn(`Skipping (already exists): ${slug} — use --reset to overwrite`);
        return { skipped: true, slug };
      }
    }
  } catch (_) {}

  const result = await strapiPost(endpoint, payload, token);
  return result.data || result;
}

async function migrateSingleType(page, endpoint, token) {
  const heroSection = (page.sections || []).find(section => section.type === 'hero');
  const h1 =
    heroSection?.heading ||
    page.headings?.h1?.[0] ||
    page.headings?.strong_headings?.[0] ||
    page.page_name;
  const h2 =
    heroSection?.subheading ||
    page.headings?.h2?.[0] ||
    page.key_content_sections?.[0]?.heading ||
    '';

  const introParagraphs = [
    heroSection?.body_text,
    ...(page.paragraphs_preview || []),
  ].filter((text, index, arr) => {
    const normalized = String(text || '').trim();
    if (!normalized) return false;
    return arr.findIndex(candidate => String(candidate || '').trim() === normalized) === index;
  });

  // body_content = intro paragraphs only; rich sections go into sections repeatable
  const bodyBlocks = toBlocks(introParagraphs);

  const imgFilename = pickLocalImage(page.images);
  let heroImageId = null;
  if (imgFilename) {
    heroImageId = await uploadImage(imgFilename, token);
  }

  // Contact page schema has no body_content/sections/hero_image
  if (page.file === 'contact.html') {
    const base = {
      hero_heading: h1,
      hero_subheading: h2,
      address: '100 Church Street, Suite 8010, Manhattan, New York, 10007',
      phone:   '(646) 535-3995',
      email:   'contact@steinbergvalentino.com',
      meta_title:       page.meta?.title || h1,
      meta_description: page.meta?.description || '',
    };
    if (DRY_RUN) {
      log.dim(`[dry-run] PUT ${endpoint} → sections=0, blocks=0`);
      return { documentId: 'dry-run' };
    }
    const result = await strapiPut(endpoint, base, token);
    return result.data || result;
  }

  // Homepage uses hero_background (not hero_image) and has CTAs
  if (page.file === 'index.html') {
    const bannerId = await uploadImage('banner.webp', token);
    const base = {
      hero_heading: h1,
      hero_subheading: h2,
      ...(bannerId ? { hero_background: bannerId } : {}),
      hero_cta_primary_label:   'Our Capabilities',
      hero_cta_primary_url:     '/capabilities',
      hero_cta_secondary_label: 'Talk to An Expert',
      hero_cta_secondary_url:   '/contact',
      body_content:    bodyBlocks.length ? bodyBlocks : null,
      sections:        buildSections(page),
      meta_title:       page.meta?.title || h1,
      meta_description: page.meta?.description || '',
    };
    if (DRY_RUN) {
      log.dim(`[dry-run] PUT ${endpoint} → sections=${base.sections.length}, blocks=${bodyBlocks.length}`);
      return { documentId: 'dry-run' };
    }
    const result = await strapiPut(endpoint, base, token);
    return result.data || result;
  }

  const base = {
    hero_heading:    h1,
    hero_subheading: h2,
    ...(heroImageId ? { hero_image: heroImageId } : {}),
    body_content:    bodyBlocks.length ? bodyBlocks : null,
    sections:        buildSections(page),
    meta_title:       page.meta?.title || h1,
    meta_description: page.meta?.description || '',
  };

  if (DRY_RUN) {
    log.dim(`[dry-run] PUT ${endpoint} → sections=${base.sections.length}, blocks=${bodyBlocks.length}`);
    return { documentId: 'dry-run' };
  }

  const result = await strapiPut(endpoint, base, token);
  return result.data || result;
}

// ─── Endpoint map ─────────────────────────────────────────────────────────────

const ENDPOINT_MAP = {
  'index.html':                    { kind: 'single',     endpoint: '/homepage' },
  'about.html':                    { kind: 'single',     endpoint: '/about-page' },
  'how-it-works.html':             { kind: 'single',     endpoint: '/how-it-works-page' },
  'capabilities.html':             { kind: 'single',     endpoint: '/capabilities-page' },
  'industry-expertise.html':       { kind: 'single',     endpoint: '/industry-expertise-page' },
  'contact.html':                  { kind: 'single',     endpoint: '/contact-page' },
  'advisory.html':                 { kind: 'collection', endpoint: '/service-pages' },
  'strategic-advisory.html':       { kind: 'collection', endpoint: '/service-pages' },
  'transactional-advisory.html':   { kind: 'collection', endpoint: '/service-pages' },
  'capital-formation.html':        { kind: 'collection', endpoint: '/service-pages' },
  'strategic-communications.html': { kind: 'collection', endpoint: '/service-pages' },
  'financial-marketing.html':      { kind: 'collection', endpoint: '/service-pages' },
  'media-relations.html':          { kind: 'collection', endpoint: '/service-pages' },
  'media-strategy.html':           { kind: 'collection', endpoint: '/service-pages' },
  'multicultural-engagement.html': { kind: 'collection', endpoint: '/service-pages' },
  'market-entry.html':             { kind: 'collection', endpoint: '/service-pages' },
  'crises-management.html':        { kind: 'collection', endpoint: '/service-pages' },
  'litigation-communications.html':{ kind: 'collection', endpoint: '/service-pages' },
  'nasdaq-small-cap.html':         { kind: 'collection', endpoint: '/exchange-pages' },
  'otc-markets.html':              { kind: 'collection', endpoint: '/exchange-pages' },
  'canadian-tsx.html':             { kind: 'collection', endpoint: '/exchange-pages' },
  'canadian-cse.html':             { kind: 'collection', endpoint: '/exchange-pages' },
  'german-frankfurt.html':         { kind: 'collection', endpoint: '/exchange-pages' },
  'user-sitemap.html':             { kind: 'skip',       endpoint: null },
};

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  console.log(c.bold('\n╔══════════════════════════════════════════════╗'));
  console.log(c.bold('║   SteinbergValentino — Content Migration     ║'));
  console.log(c.bold('╚══════════════════════════════════════════════╝\n'));

  if (DRY_RUN)  log.warn('DRY RUN — no writes will be made\n');
  if (RESET)    log.warn('RESET mode — existing collection entries will be deleted first\n');
  if (IMG_ONLY) log.info('Images-only mode — skipping content migration\n');

  // 1. Load token
  let token;
  try {
    token = loadToken();
    log.ok(`API token loaded (${token.slice(0, 12)}...)`);
  } catch (e) {
    log.error(e.message);
    process.exit(1);
  }

  // 2. Check Strapi is running
  try {
    const res = await fetch(`${STRAPI_URL}/_health`);
    if (!res.ok) throw new Error(`health check ${res.status}`);
    log.ok(`Strapi is running at ${STRAPI_URL}`);
  } catch (e) {
    log.error(`Strapi not reachable: ${e.message}`);
    log.error('Start it first: cd cms && nvm use 18 && npm run develop');
    process.exit(1);
  }

  // 3. Verify token works
  try {
    await strapiGet('/service-pages?pagination[pageSize]=1', token);
    log.ok('API token is valid\n');
  } catch (e) {
    // Content type might not exist yet (first run after schema creation), that's OK
    if (e.message.includes('404') || e.message.includes('not found')) {
      log.warn('Content types not registered yet — Strapi may need a restart after schema files were added\n');
    } else {
      log.error(`Token validation failed: ${e.message}`);
      log.error('Go to Strapi Admin → Settings → API Tokens and create a Full Access token');
      process.exit(1);
    }
  }

  // 4. Load analysis
  if (!fs.existsSync(ANALYSIS)) {
    log.error(`analysis.json not found at ${ANALYSIS}`);
    process.exit(1);
  }
  const analysis = JSON.parse(fs.readFileSync(ANALYSIS, 'utf-8'));
  const pages    = analysis.pages.filter(p =>
    (!PAGE_FILTER || p.file === PAGE_FILTER) &&
    ENDPOINT_MAP[p.file]?.kind !== 'skip'
  );
  log.ok(`Loaded ${pages.length} pages from analysis.json`);

  // 5. Upload all images first
  log.section('── Step 1: Image Upload ─────────────────────────');
  const localImages = fs.readdirSync(IMAGES_DIR).filter(f =>
    f.match(/\.(jpg|jpeg|png|webp|gif)$/i) &&
    !f.includes('favicon') &&
    !f.includes('cropped')
  );
  log.info(`Found ${localImages.length} uploadable images in ${IMAGES_DIR}`);

  for (const img of localImages) {
    await uploadImage(img, token);
  }

  if (IMG_ONLY) {
    log.ok('\nImages-only mode complete.');
    return;
  }

  log.section('── Step 2: Global Settings ─────────────────────');
  try {
    const result = await migrateGlobalSettings(analysis, token);
    log.ok(`Updated global settings (${result?.documentId || 'ok'})`);
  } catch (e) {
    log.error(`Global settings migration failed: ${e.message}`);
  }

  // 6. Migrate each page
  log.section('── Step 3: Content Migration ────────────────────');

  const report = { success: [], failed: [], skipped: [], timestamp: new Date().toISOString() };

  for (const page of pages) {
    const mapped = ENDPOINT_MAP[page.file];
    if (!mapped || mapped.kind === 'skip') {
      log.dim(`skip: ${page.file}`);
      report.skipped.push({ file: page.file, reason: 'not mapped' });
      continue;
    }

    process.stdout.write(`  ${c.dim('→')} ${page.file.padEnd(42)}`);

    try {
      let result;
      if (mapped.kind === 'single') {
        result = await migrateSingleType(page, mapped.endpoint, token);
      } else {
        result = await migrateCollectionPage(page, mapped.endpoint, token);
      }

      if (result?.skipped) {
        process.stdout.write(c.yellow('skipped (exists)\n'));
        report.skipped.push({ file: page.file, endpoint: mapped.endpoint });
      } else {
        process.stdout.write(c.green(`✓ ${mapped.kind === 'single' ? 'updated' : `created (${result?.documentId || 'ok'})`}\n`));
        report.success.push({ file: page.file, endpoint: mapped.endpoint, documentId: result?.documentId });
      }
    } catch (e) {
      process.stdout.write(c.red(`✗ ${e.message}\n`));
      report.failed.push({ file: page.file, endpoint: mapped.endpoint, error: e.message });
    }
  }

  // 7. Summary
  log.section('── Summary ──────────────────────────────────────');
  log.ok(`  Success:  ${report.success.length}`);
  if (report.skipped.length) log.warn(`  Skipped:  ${report.skipped.length} (already exist — use --reset to overwrite)`);
  if (report.failed.length)  log.error(`  Failed:   ${report.failed.length}`);

  if (report.failed.length) {
    console.log('\n  Failed pages:');
    report.failed.forEach(f => log.error(`  ${f.file}: ${f.error}`));
  }

  // 8. Save report
  fs.writeFileSync(REPORT_OUT, JSON.stringify(report, null, 2));
  log.ok(`\nReport saved: output/migrate-report.json`);

  // 9. Next steps
  console.log(c.bold('\n── Next steps ───────────────────────────────────'));
  console.log(`  1. Open Strapi Admin → Settings → Users & Permissions → Roles → Public`);
  console.log(`     Enable find + findOne for: service-page, exchange-page,`);
  console.log(`     homepage, about-page, how-it-works-page, capabilities-page, global-setting,`);
  console.log(`     industry-expertise-page, contact-page`);
  console.log(`  2. Test: curl http://localhost:1337/api/service-pages`);
  console.log(`  3. Start Next.js: cd web && npm run dev`);
}

main().catch(e => {
  log.error(`Fatal: ${e.message}`);
  console.error(e);
  process.exit(1);
});
