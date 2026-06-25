import Link from 'next/link'
import type { Metadata } from 'next'
import { DEFAULT_GLOBAL_SETTINGS } from '@/lib/defaults'
import {
  getAllExchangePages,
  getAllServicePages,
  getGlobalSettings,
} from '@/lib/strapi'
import type { ExchangePage, ServicePage, SiteLink } from '@/lib/types'

export const revalidate = 3600


export async function generateMetadata(): Promise<Metadata> {
  try {
    const settings = await getGlobalSettings()
    return {
      title: settings.sitemap_meta_title ?? DEFAULT_GLOBAL_SETTINGS.sitemap_meta_title ?? undefined,
      description:
        settings.sitemap_meta_description ??
        DEFAULT_GLOBAL_SETTINGS.sitemap_meta_description ??
        undefined,
    }
  } catch {
    return {
      title: DEFAULT_GLOBAL_SETTINGS.sitemap_meta_title ?? undefined,
      description: DEFAULT_GLOBAL_SETTINGS.sitemap_meta_description ?? undefined,
    }
  }
}

function PageColumn({
  title,
  items,
}: {
  title: string
  items: SiteLink[]
}) {
  return (
    <section
      style={{
        padding: 'var(--sv-sp-32)',
        background: 'var(--color-sv-white)',
        border: '1px solid var(--color-sv-gray200)',
      }}
    >
      <p className="sv-eyebrow" style={{ marginBottom: 'var(--sv-sp-16)' }}>
        {title}
      </p>
      <ul
        style={{
          listStyle: 'none',
          margin: 0,
          padding: 0,
          display: 'flex',
          flexDirection: 'column',
          gap: '0.875rem',
        }}
      >
        {items.map((item) => (
          <li key={item.href}>
            <Link
              href={item.href}
              style={{
                color: 'var(--color-sv-black)',
                textDecoration: 'none',
                fontSize: '1rem',
                lineHeight: 1.5,
              }}
            >
              {item.label}
            </Link>
          </li>
        ))}
      </ul>
    </section>
  )
}

export default async function SitemapPage() {
  const [settings, services, exchanges] = await Promise.all([
    getGlobalSettings().catch(() => null),
    getAllServicePages().catch(() => [] as ServicePage[]),
    getAllExchangePages().catch(() => [] as ExchangePage[]),
  ])

  const resolvedSettings = settings ?? DEFAULT_GLOBAL_SETTINGS
  const G = DEFAULT_GLOBAL_SETTINGS

  const firmItems =
    resolvedSettings.footer_quick_links ??
    G.footer_quick_links ??
    []

  const serviceItems =
    services.length > 0
      ? services.map((service) => ({
          label: service.title,
          href: `/services/${service.slug}`,
        }))
      : (resolvedSettings.footer_service_links ??
          DEFAULT_GLOBAL_SETTINGS.footer_service_links ??
          [])
  const exchangeItems =
    exchanges.length > 0
      ? exchanges.map((exchange) => ({
          label: exchange.exchange_name,
          href: `/exchanges/${exchange.slug}`,
        }))
      : (resolvedSettings.footer_exchange_links ??
          DEFAULT_GLOBAL_SETTINGS.footer_exchange_links ??
          [])

  return (
    <>
      <section className="sv-section sv-bg-light">
        <div className="sv-container" style={{ maxWidth: '960px' }}>
          <p className="sv-eyebrow" style={{ marginBottom: 'var(--sv-sp-16)' }}>
            {resolvedSettings.sitemap_eyebrow ?? G.sitemap_eyebrow}
          </p>
          <h1 className="sv-display" style={{ marginBottom: 'var(--sv-sp-24)' }}>
            {resolvedSettings.sitemap_heading ?? DEFAULT_GLOBAL_SETTINGS.sitemap_heading}
          </h1>
          <p
            style={{
              fontSize: '1.0625rem',
              color: 'var(--color-sv-slate)',
              lineHeight: 1.7,
              maxWidth: '720px',
            }}
          >
            {resolvedSettings.sitemap_intro ?? DEFAULT_GLOBAL_SETTINGS.sitemap_intro}
          </p>
        </div>
      </section>

      <section className="sv-section">
        <div className="sv-container">
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
              gap: 'var(--sv-sp-32)',
              alignItems: 'start',
            }}
            className="sitemap-grid"
          >
            <PageColumn title={resolvedSettings.sitemap_firm_heading ?? G.sitemap_firm_heading!} items={firmItems} />
            <PageColumn title={resolvedSettings.sitemap_services_heading ?? G.sitemap_services_heading!} items={serviceItems} />
            <PageColumn title={resolvedSettings.sitemap_exchanges_heading ?? G.sitemap_exchanges_heading!} items={exchangeItems} />
          </div>
        </div>
        <style>{`
          @media (max-width: 1024px) {
            .sitemap-grid {
              grid-template-columns: 1fr !important;
            }
          }
        `}</style>
      </section>
    </>
  )
}
