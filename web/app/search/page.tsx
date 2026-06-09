import Link from 'next/link'
import type { Metadata } from 'next'
import { DEFAULT_GLOBAL_SETTINGS } from '@/lib/defaults'
import { getGlobalSettings } from '@/lib/strapi'
import { getSearchIndex, runSearch } from '@/lib/search'

export const revalidate = 3600

interface Props {
  searchParams: Promise<{ q?: string | string[] }>
}

function firstParam(value: string | string[] | undefined): string {
  if (Array.isArray(value)) return value[0] ?? ''
  return value ?? ''
}

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const q = firstParam((await searchParams).q).trim()
  let settings = null
  try {
    settings = await getGlobalSettings()
  } catch {
    /* offline — fall back to defaults */
  }
  const base =
    settings?.search_meta_title ??
    DEFAULT_GLOBAL_SETTINGS.search_meta_title ??
    'Search | SteinbergValentino Group'
  return {
    title: q ? `${q} — ${base}` : base,
    description:
      settings?.search_meta_description ??
      DEFAULT_GLOBAL_SETTINGS.search_meta_description ??
      undefined,
    robots: { index: false, follow: true },
  }
}

const TYPE_LABEL: Record<string, string> = {
  Page: 'Page',
  Service: 'Service',
  Exchange: 'Exchange',
}

export default async function SearchPage({ searchParams }: Props) {
  const query = firstParam((await searchParams).q).trim()

  let settings = null
  try {
    settings = await getGlobalSettings()
  } catch {
    /* offline — fall back to defaults */
  }

  const heading =
    settings?.search_heading ?? DEFAULT_GLOBAL_SETTINGS.search_heading ?? 'Search'
  const placeholder =
    settings?.search_placeholder ??
    DEFAULT_GLOBAL_SETTINGS.search_placeholder ??
    'Search the site…'

  const results = query ? runSearch(await getSearchIndex(), query) : []

  return (
    <section className="sv-section sv-bg-light">
      <div className="sv-container" style={{ maxWidth: '820px' }}>
        <p className="sv-eyebrow" style={{ marginBottom: 'var(--sv-sp-16)' }}>
          Site Search
        </p>
        <h1 className="sv-display" style={{ marginBottom: 'var(--sv-sp-24)' }}>
          {heading}
        </h1>

        {/* Self-contained GET form — works without JS and is shareable */}
        <form
          action="/search"
          method="get"
          role="search"
          style={{ display: 'flex', gap: '0.75rem', marginBottom: 'var(--sv-sp-32)' }}
        >
          <input
            type="search"
            name="q"
            defaultValue={query}
            placeholder={placeholder}
            aria-label="Search the site"
            autoFocus
            style={{
              flex: 1,
              minWidth: 0,
              padding: '0.85rem 1.1rem',
              fontSize: '1rem',
              fontFamily: 'var(--font-manrope), system-ui, sans-serif',
              color: 'var(--color-sv-black)',
              background: 'var(--color-sv-white)',
              border: '1px solid var(--color-sv-gray200)',
              outline: 'none',
            }}
          />
          <button
            type="submit"
            style={{
              flexShrink: 0,
              padding: '0.85rem 1.6rem',
              fontSize: '0.78rem',
              fontWeight: 600,
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
              color: 'var(--color-sv-dark)',
              background: 'var(--color-sv-gold)',
              border: 'none',
              cursor: 'pointer',
            }}
          >
            Search
          </button>
        </form>

        {query && (
          <p
            style={{
              fontSize: '0.95rem',
              color: 'var(--color-sv-slate)',
              marginBottom: 'var(--sv-sp-24)',
            }}
          >
            {results.length > 0
              ? `${results.length} result${results.length === 1 ? '' : 's'} for "${query}"`
              : `No results for "${query}". Try a different term.`}
          </p>
        )}

        {!query && (
          <p style={{ fontSize: '1.0625rem', color: 'var(--color-sv-slate)', lineHeight: 1.7 }}>
            Enter a term above to search across our services, exchanges, and firm pages.
          </p>
        )}

        {results.length > 0 && (
          <ul
            style={{
              listStyle: 'none',
              margin: 0,
              padding: 0,
              display: 'flex',
              flexDirection: 'column',
              gap: 'var(--sv-sp-16)',
            }}
          >
            {results.map((result) => (
              <li key={result.url}>
                <Link
                  href={result.url}
                  style={{
                    display: 'block',
                    padding: 'var(--sv-sp-24)',
                    background: 'var(--color-sv-white)',
                    border: '1px solid var(--color-sv-gray200)',
                    textDecoration: 'none',
                  }}
                >
                  <span
                    className="sv-eyebrow"
                    style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.65rem' }}
                  >
                    {TYPE_LABEL[result.type] ?? result.type}
                  </span>
                  <span
                    style={{
                      display: 'block',
                      fontFamily: 'var(--font-cormorant), Georgia, serif',
                      fontSize: '1.35rem',
                      fontWeight: 600,
                      color: 'var(--color-sv-black)',
                      marginBottom: '0.4rem',
                    }}
                  >
                    {result.title}
                  </span>
                  {result.snippet && (
                    <span
                      style={{
                        display: 'block',
                        fontSize: '0.95rem',
                        color: 'var(--color-sv-slate)',
                        lineHeight: 1.6,
                      }}
                    >
                      {result.snippet}
                    </span>
                  )}
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  )
}
