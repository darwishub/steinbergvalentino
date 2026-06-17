import type {
  Homepage,
  AboutPage,
  HowItWorksPage,
  CapabilitiesPage,
  IndustryExpertisePage,
  ContactPage,
  ServicesListingPage,
  GlobalSettings,
  ServicePage,
  ExchangePage,
  Article,
  StrapiListResponse,
  StrapiSingleResponse,
} from './types'

// Use 127.0.0.1 to avoid IPv6 localhost resolution issues in Node 18+
const STRAPI_URL =
  process.env.STRAPI_URL ||
  process.env.NEXT_PUBLIC_STRAPI_URL?.replace('localhost', '127.0.0.1') ||
  'http://127.0.0.1:1337'
const STRAPI_TOKEN = process.env.STRAPI_API_TOKEN || ''

/** Base fetch with caching */
export async function fetchAPI<T>(path: string, revalidate = 3600): Promise<T> {
  const url = `${STRAPI_URL}/api${path}`
  const res = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      ...(STRAPI_TOKEN ? { Authorization: `Bearer ${STRAPI_TOKEN}` } : {}),
    },
    next: { revalidate },
  })
  if (!res.ok) {
    throw new Error(`Strapi ${res.status} @ ${path}`)
  }
  return res.json() as Promise<T>
}

/** Full media URL (handles relative Strapi paths and normalises localhost absolute URLs) */
export function getStrapiMedia(url: string | null | undefined): string | null {
  if (!url) return null
  // Normalise absolute localhost/127.0.0.1 URLs that were saved during local development
  if (url.startsWith('http://localhost:') || url.startsWith('http://127.0.0.1:')) {
    // Extract the path portion and rebuild with the configured STRAPI_URL
    try {
      const { pathname } = new URL(url)
      return `${STRAPI_URL}${pathname}`
    } catch {
      /* fall through */
    }
  }
  if (url.startsWith('http')) return url
  return `${STRAPI_URL}${url}`
}

/* ─── Typed fetchers ─────────────────────────────────────────────────────── */

export async function getHomepage(): Promise<Homepage> {
  const res = await fetchAPI<StrapiSingleResponse<Homepage>>(
    '/homepage?populate[sections][populate]=image&populate[testimonials]=*&populate[hero_background][fields][0]=url&populate[hero_background][fields][1]=width&populate[hero_background][fields][2]=height&populate[hero_background][fields][3]=alternativeText'
  )
  return res.data
}

export async function getAboutPage(): Promise<AboutPage> {
  const res = await fetchAPI<StrapiSingleResponse<AboutPage>>(
    '/about-page?populate[hero_image][fields][0]=url&populate[hero_image][fields][1]=width&populate[hero_image][fields][2]=height&populate[hero_image][fields][3]=alternativeText&populate[sections][populate]=image'
  )
  return res.data
}

export async function getHowItWorksPage(): Promise<HowItWorksPage> {
  const res = await fetchAPI<StrapiSingleResponse<HowItWorksPage>>(
    '/how-it-works-page?populate[hero_image][fields][0]=url&populate[hero_image][fields][1]=width&populate[hero_image][fields][2]=height&populate[hero_image][fields][3]=alternativeText&populate[sections][populate]=image'
  )
  return res.data
}

export async function getCapabilitiesPage(): Promise<CapabilitiesPage> {
  const res = await fetchAPI<StrapiSingleResponse<CapabilitiesPage>>(
    '/capabilities-page?populate[hero_image][fields][0]=url&populate[hero_image][fields][1]=width&populate[hero_image][fields][2]=height&populate[hero_image][fields][3]=alternativeText&populate[sections][populate]=image'
  )
  return res.data
}

export async function getIndustryExpertisePage(): Promise<IndustryExpertisePage> {
  const res = await fetchAPI<StrapiSingleResponse<IndustryExpertisePage>>(
    '/industry-expertise-page?populate[hero_image][fields][0]=url&populate[hero_image][fields][1]=width&populate[hero_image][fields][2]=height&populate[hero_image][fields][3]=alternativeText&populate[sections][populate]=image&populate[sectors]=*'
  )
  return res.data
}

export async function getContactPage(): Promise<ContactPage> {
  const res = await fetchAPI<StrapiSingleResponse<ContactPage>>(
    '/contact-page?populate[hero_image][fields][0]=url&populate[hero_image][fields][1]=width&populate[hero_image][fields][2]=height&populate[hero_image][fields][3]=alternativeText'
  )
  return res.data
}

export async function getServicesListingPage(): Promise<ServicesListingPage> {
  const res = await fetchAPI<StrapiSingleResponse<ServicesListingPage>>(
    '/services-listing-page?populate[hero_image][fields][0]=url&populate[hero_image][fields][1]=width&populate[hero_image][fields][2]=height&populate[hero_image][fields][3]=alternativeText&populate[approach_image][fields][0]=url&populate[approach_image][fields][1]=width&populate[approach_image][fields][2]=height&populate[approach_image][fields][3]=alternativeText'
  )
  return res.data
}

export async function getGlobalSettings(): Promise<GlobalSettings> {
  const res = await fetchAPI<StrapiSingleResponse<GlobalSettings>>('/global-setting')
  return res.data
}

export async function getAllServicePages(): Promise<ServicePage[]> {
  const res = await fetchAPI<StrapiListResponse<ServicePage>>(
    '/service-pages?pagination[pageSize]=25&populate[hero_image][fields][0]=url&populate[hero_image][fields][1]=width&populate[hero_image][fields][2]=height&populate[hero_image][fields][3]=alternativeText&populate[sections][populate]=image&sort=title:asc'
  )
  return res.data
}

export async function getServicePage(slug: string): Promise<ServicePage | null> {
  const res = await fetchAPI<StrapiListResponse<ServicePage>>(
    `/service-pages?filters[slug][$eq]=${slug}&populate[hero_image][fields][0]=url&populate[hero_image][fields][1]=width&populate[hero_image][fields][2]=height&populate[hero_image][fields][3]=alternativeText&populate[overview_image][fields][0]=url&populate[overview_image][fields][1]=width&populate[overview_image][fields][2]=height&populate[overview_image][fields][3]=alternativeText&populate[media_band_image][fields][0]=url&populate[media_band_image][fields][1]=width&populate[media_band_image][fields][2]=height&populate[media_band_image][fields][3]=alternativeText&populate[quote_image][fields][0]=url&populate[quote_image][fields][1]=width&populate[quote_image][fields][2]=height&populate[quote_image][fields][3]=alternativeText&populate[stats]=*&populate[highlights]=*&populate[sections][populate]=image&populate[faq_items]=*`
  )
  return res.data[0] ?? null
}

// One article for the "News & Insights" card — prefer a category match, else newest.
export async function getRelatedArticle(category?: string | null): Promise<Article | null> {
  const base =
    'populate[cover_image][fields][0]=url&populate[cover_image][fields][1]=width&populate[cover_image][fields][2]=height&populate[cover_image][fields][3]=alternativeText&fields[0]=title&fields[1]=slug&fields[2]=category&fields[3]=excerpt&sort=publishedAt:desc&pagination[pageSize]=1'

  if (category) {
    const matched = await fetchAPI<StrapiListResponse<Article>>(
      `/articles?filters[category][$eqi]=${encodeURIComponent(category)}&${base}`
    )
    if (matched.data[0]) return matched.data[0]
  }

  const latest = await fetchAPI<StrapiListResponse<Article>>(`/articles?${base}`)
  return latest.data[0] ?? null
}

export async function getAllExchangePages(): Promise<ExchangePage[]> {
  const res = await fetchAPI<StrapiListResponse<ExchangePage>>(
    '/exchange-pages?pagination[pageSize]=10&populate[hero_image][fields][0]=url&populate[hero_image][fields][1]=width&populate[hero_image][fields][2]=height&populate[hero_image][fields][3]=alternativeText&populate[sections][populate]=image&sort=exchange_name:asc'
  )
  return res.data
}

export async function getExchangePage(slug: string): Promise<ExchangePage | null> {
  const res = await fetchAPI<StrapiListResponse<ExchangePage>>(
    `/exchange-pages?filters[slug][$eq]=${slug}&populate[hero_image][fields][0]=url&populate[hero_image][fields][1]=width&populate[hero_image][fields][2]=height&populate[hero_image][fields][3]=alternativeText&populate[sections][populate]=image&populate[faq_items]=*`
  )
  return res.data[0] ?? null
}
