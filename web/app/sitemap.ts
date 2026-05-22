import type { MetadataRoute } from 'next'
import { getAllServicePages, getAllExchangePages } from '@/lib/strapi'

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://www.steinbergvalentino.com'

/* Static pages that always exist */
const STATIC_ROUTES: MetadataRoute.Sitemap = [
  {
    url: BASE_URL,
    lastModified: new Date(),
    changeFrequency: 'weekly',
    priority: 1.0,
  },
  {
    url: `${BASE_URL}/about`,
    lastModified: new Date(),
    changeFrequency: 'monthly',
    priority: 0.8,
  },
  {
    url: `${BASE_URL}/how-it-works`,
    lastModified: new Date(),
    changeFrequency: 'monthly',
    priority: 0.8,
  },
  {
    url: `${BASE_URL}/capabilities`,
    lastModified: new Date(),
    changeFrequency: 'monthly',
    priority: 0.8,
  },
  {
    url: `${BASE_URL}/industry-expertise`,
    lastModified: new Date(),
    changeFrequency: 'monthly',
    priority: 0.7,
  },
  {
    url: `${BASE_URL}/services`,
    lastModified: new Date(),
    changeFrequency: 'monthly',
    priority: 0.9,
  },
  {
    url: `${BASE_URL}/contact`,
    lastModified: new Date(),
    changeFrequency: 'yearly',
    priority: 0.6,
  },
  {
    url: `${BASE_URL}/sitemap`,
    lastModified: new Date(),
    changeFrequency: 'monthly',
    priority: 0.3,
  },
]

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  /* Dynamic service pages */
  let serviceRoutes: MetadataRoute.Sitemap = []
  try {
    const services = await getAllServicePages()
    serviceRoutes = services.map((s) => ({
      url: `${BASE_URL}/services/${s.slug}`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.8,
    }))
  } catch {
    /* Strapi offline — skip dynamic routes */
  }

  /* Dynamic exchange pages */
  let exchangeRoutes: MetadataRoute.Sitemap = []
  try {
    const exchanges = await getAllExchangePages()
    exchangeRoutes = exchanges.map((e) => ({
      url: `${BASE_URL}/exchanges/${e.slug}`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.7,
    }))
  } catch {
    /* Strapi offline — skip dynamic routes */
  }

  return [...STATIC_ROUTES, ...serviceRoutes, ...exchangeRoutes]
}
