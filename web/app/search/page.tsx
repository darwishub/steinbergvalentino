import Link from 'next/link'
import type { Metadata } from 'next'
import { DEFAULT_GLOBAL_SETTINGS } from '@/lib/defaults'
import { getGlobalSettings } from '@/lib/strapi'
import { getSearchIndex, runSearch } from '@/lib/search'

export const revalidate = 3600

const PER_PAGE = 10

interface Props {
  searchParams: Promise<{ q?: string | string[]; page?: string | string[] }>
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

export default async function SearchPage({ searchParams }: Props) {
  const sp = await searchParams
  const query = firstParam(sp.q).trim()
  const currentPage = Math.max(1, parseInt(firstParam(sp.page) || '1', 10))

  let settings = null
  try {
    settings = await getGlobalSettings()
  } catch {
    /* offline — fall back to defaults */
  }
  const G = DEFAULT_GLOBAL_SETTINGS
  const s = <K extends keyof typeof G>(k: K) => settings?.[k] ?? G[k]

  const heading   = s('search_heading')
  const placeholder = s('search_placeholder')
  const emptyText = s('search_empty_text')

  const allResults  = query ? runSearch(await getSearchIndex(), query) : []
  const totalPages  = Math.ceil(allResults.length / PER_PAGE)
  const safePage    = Math.min(currentPage, Math.max(totalPages, 1))
  const results     = allResults.slice((safePage - 1) * PER_PAGE, safePage * PER_PAGE)

  const pageUrl = (p: number) =>
    `/search?q=${encodeURIComponent(query)}&page=${p}`

  return (
    <section className="bsx-search__page">
      <div className="sv-container">

        {/* Large "Search" heading */}
        <h1 className="bsx-search__title">{heading}</h1>

        {/* Full-width bordered input — search icon inside left */}
        <form action="/search" method="get" role="search" className="bsx-search__form">
          <span className="bsx-search__icon" aria-hidden="true">
            <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="10.5" cy="10.5" r="6.5" />
              <path d="M20 20l-4.5-4.5" />
            </svg>
          </span>
          <input
            type="search"
            name="q"
            defaultValue={query}
            placeholder={placeholder ?? undefined}
            aria-label="Search the site"
            autoFocus
            className="bsx-search__input"
          />
        </form>

        {/* "Results (N)" count */}
        {query && (
          <p className="bsx-search__meta">
            {allResults.length > 0
              ? `Results (${allResults.length})`
              : `No results for "${query}". Try a different term.`}
          </p>
        )}

        {/* Empty-state hint */}
        {!query && <p className="bsx-search__empty">{emptyText}</p>}

        {/* Results list — hairline rows */}
        {results.length > 0 && (
          <ul className="bsx-search__list">
            {results.map((result) => (
              <li key={result.url} className="bsx-search__item">
                <Link href={result.url} className="bsx-search__link">
                  <span className="bsx-search__headline">{result.title}</span>
                  {result.snippet && (
                    <span className="bsx-search__snippet">{result.snippet}</span>
                  )}
                </Link>
              </li>
            ))}
          </ul>
        )}

        {/* Pagination — only when multiple pages */}
        {totalPages > 1 && (
          <nav className="bsx-search__pagination" aria-label="Search results pages">
            {/* Prev arrow */}
            {safePage > 1 && (
              <Link href={pageUrl(safePage - 1)} className="bsx-search__pag-arrow bsx-search__pag-arrow--prev" aria-label="Previous page">
                <svg viewBox="0 0 16 16" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                  <path d="M10 3L5 8l5 5" />
                </svg>
              </Link>
            )}

            {/* Page numbers */}
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) =>
              p === safePage ? (
                <span key={p} className="bsx-search__pag-item bsx-search__pag-item--active" aria-current="page">
                  {p}
                </span>
              ) : (
                <Link key={p} href={pageUrl(p)} className="bsx-search__pag-item">
                  {p}
                </Link>
              )
            )}

            {/* Next arrow */}
            {safePage < totalPages && (
              <Link href={pageUrl(safePage + 1)} className="bsx-search__pag-arrow" aria-label="Next page">
                <svg viewBox="0 0 16 16" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                  <path d="M6 3l5 5-5 5" />
                </svg>
              </Link>
            )}
          </nav>
        )}

      </div>
    </section>
  )
}
