import type { NextConfig } from 'next'

/* Derive Strapi remote pattern from NEXT_PUBLIC_STRAPI_URL so the same
   next.config works for both local (http://127.0.0.1:1337) and Railway
   (https://xxx.railway.app) without any manual updates. */
function getStrapiRemotePattern() {
  const raw = process.env.NEXT_PUBLIC_STRAPI_URL ?? 'http://127.0.0.1:1337'
  try {
    const u = new URL(raw)
    return {
      protocol: u.protocol.replace(':', '') as 'http' | 'https',
      hostname: u.hostname,
      ...(u.port ? { port: u.port } : {}),
      pathname: '/uploads/**',
    }
  } catch {
    return { protocol: 'http' as const, hostname: '127.0.0.1', port: '1337', pathname: '/uploads/**' }
  }
}

const legacyRedirects = [
  // Legacy slug redirects (missing from original list)
  { source: '/sv-group/', destination: '/about', permanent: true },
  { source: '/contact-us/', destination: '/contact', permanent: true },
  // Core page .html redirects
  { source: '/about.html', destination: '/about', permanent: true },
  { source: '/how-it-works.html', destination: '/how-it-works', permanent: true },
  { source: '/capabilities.html', destination: '/capabilities', permanent: true },
  { source: '/industry-expertise.html', destination: '/industry-expertise', permanent: true },
  { source: '/contact.html', destination: '/contact', permanent: true },
  { source: '/user-sitemap.html', destination: '/sitemap', permanent: true },
  { source: '/sitemap/', destination: '/sitemap', permanent: true },
  { source: '/advisory.html', destination: '/services/advisory', permanent: true },
  { source: '/business-development/', destination: '/services/advisory', permanent: true },
  { source: '/strategic-advisory.html', destination: '/services/strategic-advisory', permanent: true },
  { source: '/strategic-advisory/', destination: '/services/strategic-advisory', permanent: true },
  {
    source: '/transactional-advisory.html',
    destination: '/services/transactional-advisory',
    permanent: true,
  },
  {
    source: '/transactional-advisory/',
    destination: '/services/transactional-advisory',
    permanent: true,
  },
  { source: '/capital-formation.html', destination: '/services/capital-formation', permanent: true },
  { source: '/capital-formation/', destination: '/services/capital-formation', permanent: true },
  {
    source: '/strategic-communications.html',
    destination: '/services/strategic-communications',
    permanent: true,
  },
  {
    source: '/strategic-communications/',
    destination: '/services/strategic-communications',
    permanent: true,
  },
  { source: '/financial-marketing.html', destination: '/services/financial-marketing', permanent: true },
  { source: '/financial-marketing/', destination: '/services/financial-marketing', permanent: true },
  { source: '/media-relations.html', destination: '/services/media-relations', permanent: true },
  { source: '/media-relations/', destination: '/services/media-relations', permanent: true },
  { source: '/media-strategy.html', destination: '/services/media-strategy', permanent: true },
  { source: '/media-strategy/', destination: '/services/media-strategy', permanent: true },
  {
    source: '/multicultural-engagement.html',
    destination: '/services/multicultural-engagement',
    permanent: true,
  },
  {
    source: '/multicultural-engagement/',
    destination: '/services/multicultural-engagement',
    permanent: true,
  },
  { source: '/market-entry.html', destination: '/services/market-entry', permanent: true },
  { source: '/market-entry/', destination: '/services/market-entry', permanent: true },
  { source: '/crises-management.html', destination: '/services/crises-management', permanent: true },
  { source: '/crises-management/', destination: '/services/crises-management', permanent: true },
  {
    source: '/litigation-communications.html',
    destination: '/services/litigation-communications',
    permanent: true,
  },
  {
    source: '/litigation-communications/',
    destination: '/services/litigation-communications',
    permanent: true,
  },
  { source: '/nasdaq-small-cap.html', destination: '/exchanges/nasdaq-small-cap', permanent: true },
  {
    source: '/nasdaq-small-cap-investor-relations-firm/',
    destination: '/exchanges/nasdaq-small-cap',
    permanent: true,
  },
  { source: '/otc-markets.html', destination: '/exchanges/otc-markets', permanent: true },
  {
    source: '/otc-markets-investor-relations-firm/',
    destination: '/exchanges/otc-markets',
    permanent: true,
  },
  { source: '/canadian-tsx.html', destination: '/exchanges/canadian-tsx', permanent: true },
  {
    source: '/canadian-tsx-investor-relations-firm/',
    destination: '/exchanges/canadian-tsx',
    permanent: true,
  },
  { source: '/canadian-cse.html', destination: '/exchanges/canadian-cse', permanent: true },
  {
    source: '/canadian-cse-investor-relations-firm/',
    destination: '/exchanges/canadian-cse',
    permanent: true,
  },
  { source: '/german-frankfurt.html', destination: '/exchanges/german-frankfurt', permanent: true },
  {
    source: '/german-frankfurt-stock-exchange-investor-relations-firm/',
    destination: '/exchanges/german-frankfurt',
    permanent: true,
  },
]

const nextConfig: NextConfig = {
  // Prevent Next.js from eating trailing slashes before our custom redirects match
  skipTrailingSlashRedirect: true,
  images: {
    remotePatterns: [
      getStrapiRemotePattern(),
      /* Also allow 127.0.0.1 — strapi.ts replaces localhost→127.0.0.1 in the
         returned image URLs even when NEXT_PUBLIC_STRAPI_URL uses localhost */
      { protocol: 'http', hostname: '127.0.0.1', port: '1337', pathname: '/uploads/**' },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'plus.unsplash.com',
      },
    ],
    formats: ['image/avif', 'image/webp'],
    qualities: [75, 80],
  },
  async redirects() {
    return legacyRedirects
  },
}

export default nextConfig
