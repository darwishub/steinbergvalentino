import { NextRequest, NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'

/**
 * On-demand revalidation endpoint — called by a Strapi webhook on every
 * content save / publish / delete.
 *
 * Webhook URL (set in Strapi admin):
 *   https://<your-domain>/api/revalidate?secret=<REVALIDATE_SECRET>
 *
 * Strapi sends a POST with JSON body, e.g.:
 *   { "event": "entry.update", "model": "homepage", "uid": "api::homepage.homepage", ... }
 *
 * We revalidate the root layout which cascades to all pages, because
 * global-setting changes (nav/footer) affect every page.
 */

// Which Strapi model UIDs map to which Next.js paths.
// global-setting is excluded here — it falls through to the "all pages" revalidation.
const MODEL_PATHS: Record<string, string[]> = {
  'api::homepage.homepage':                               ['/'],
  'api::about-page.about-page':                          ['/about'],
  'api::how-it-works-page.how-it-works-page':            ['/how-it-works'],
  'api::capabilities-page.capabilities-page':            ['/capabilities'],
  'api::industry-expertise-page.industry-expertise-page': ['/industry-expertise'],
  'api::contact-page.contact-page':                      ['/contact'],
  'api::services-listing-page.services-listing-page':    ['/services'],
  'api::service-page.service-page':                      ['/services', '/services/[slug]'],
  'api::exchange-page.exchange-page':                    ['/exchanges/[slug]'],
  'api::article.article':                                ['/'],
}

// Models that require all pages to be flushed (nav / footer appear everywhere)
const GLOBAL_MODELS = new Set([
  'api::global-setting.global-setting',
  'plugin::upload.file',        // media library changes
])

export async function POST(request: NextRequest) {
  // ── 1. Authenticate ────────────────────────────────────────────────────────
  const secret = request.nextUrl.searchParams.get('secret')
  if (!process.env.REVALIDATE_SECRET || secret !== process.env.REVALIDATE_SECRET) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
  }

  // ── 2. Parse Strapi webhook payload ───────────────────────────────────────
  let uid: string | undefined
  let event: string | undefined
  try {
    const body = await request.json()
    uid   = body?.uid   as string | undefined   // e.g. "api::homepage.homepage"
    event = body?.event as string | undefined   // e.g. "entry.update"
  } catch {
    // Strapi sometimes sends an empty body on ping — treat as full revalidation
  }

  // ── 3. Revalidate ──────────────────────────────────────────────────────────
  const revalidatedPaths: string[] = []

  if (!uid || GLOBAL_MODELS.has(uid)) {
    // Unknown model or global content (nav, footer, media) — flush everything
    revalidatePath('/', 'layout')
    revalidatedPaths.push('/ (all pages via root layout)')
  } else {
    const paths = MODEL_PATHS[uid]
    if (paths?.length) {
      for (const p of paths) {
        if (p.includes('[')) {
          // Dynamic segment — revalidate the whole route group
          revalidatePath(p.split('/[')[0] || '/', 'page')
        } else {
          revalidatePath(p, 'page')
        }
        revalidatedPaths.push(p)
      }
    } else {
      // Unrecognised model — safe fallback: flush all
      revalidatePath('/', 'layout')
      revalidatedPaths.push('/ (all pages via root layout — unknown model)')
    }
  }

  return NextResponse.json({
    revalidated: true,
    event,
    uid: uid ?? 'unknown',
    paths: revalidatedPaths,
    timestamp: new Date().toISOString(),
  })
}

// Strapi pings the webhook URL with GET to verify it exists — return 200
export async function GET(request: NextRequest) {
  const secret = request.nextUrl.searchParams.get('secret')
  if (!process.env.REVALIDATE_SECRET || secret !== process.env.REVALIDATE_SECRET) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
  }
  return NextResponse.json({ ok: true })
}
