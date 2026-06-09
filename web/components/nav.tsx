'use client'

import { useState, useEffect, useRef, startTransition } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { DEFAULT_GLOBAL_SETTINGS } from '@/lib/defaults'
import type { GlobalNavItem } from '@/lib/types'

interface NavProps {
  items?: GlobalNavItem[] | null
  phone?: string | null
  searchPlaceholder?: string | null
}

export function Nav({ items, phone, searchPlaceholder }: NavProps) {
  const pathname = usePathname()
  const router = useRouter()
  const [scrolled, setScrolled] = useState(false)
  const [hidden, setHidden] = useState(false)
  const [showScrollTop, setShowScrollTop] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null)
  const [mobileExpanded, setMobileExpanded] = useState<string | null>(null)
  const [searchOpen, setSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const leaveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const headerRef = useRef<HTMLElement>(null)
  const lastScrollYRef = useRef(0)
  const searchInputRef = useRef<HTMLInputElement>(null)
  const placeholder = searchPlaceholder || 'Search the site…'

  /* The CSS sets --sv-nav-h: 4.75rem and .sv-site-nav{height:var(--sv-nav-h)}.
     The nav row's height is pinned to the base value via an inline style. */
  const BASE_NAV_H = '4.75rem'
  useEffect(() => {
    document.documentElement.style.setProperty('--sv-nav-h', BASE_NAV_H)
  }, [])
  const rawItems = items?.length ? items : (DEFAULT_GLOBAL_SETTINGS.primary_navigation ?? [])
  /* Strip any standalone "Contact Us" link — it's always shown as the CTA button */
  const navItems = rawItems.filter((i) => i.href !== '/contact' || !!i.children?.length)

  /* scroll: shadow + hide-on-scroll-down + scroll-to-top visibility */
  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY
      const prev = lastScrollYRef.current
      lastScrollYRef.current = y

      setScrolled(y > 80)
      setShowScrollTop(y > 400)

      // Only start auto-hiding after the user scrolls past 120px
      if (y > 120) {
        setHidden(y > prev)
      } else {
        setHidden(false)
      }
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  /* close mobile + search on route change — startTransition avoids synchronous-setState-in-effect lint */
  useEffect(() => {
    startTransition(() => {
      setMobileOpen(false)
      setMobileExpanded(null)
      setSearchOpen(false)
    })
  }, [pathname])

  /* search overlay: focus input on open, close on Escape */
  useEffect(() => {
    if (!searchOpen) return
    searchInputRef.current?.focus()
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setSearchOpen(false)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [searchOpen])

  function submitSearch(e: React.FormEvent) {
    e.preventDefault()
    const q = searchQuery.trim()
    if (!q) return
    setSearchOpen(false)
    setMobileOpen(false)
    setSearchQuery('')
    router.push(`/search?q=${encodeURIComponent(q)}`)
  }

  /* keep dropdown open briefly on mouse-leave */
  function handleMouseEnter(label: string) {
    if (leaveTimerRef.current) clearTimeout(leaveTimerRef.current)
    setActiveDropdown(label)
  }
  function handleMouseLeave() {
    leaveTimerRef.current = setTimeout(() => setActiveDropdown(null), 130)
  }

  function isParentActive(item: GlobalNavItem) {
    if (!item.children) return false
    return item.children.some((c) => pathname === c.href || pathname.startsWith(c.href + '/'))
  }

  const hamburgerColor = scrolled ? 'rgba(0,0,0,0.8)' : 'rgba(255,255,255,0.85)'

  return (
    <>
      <header
        ref={headerRef}
        className="sv-site-header"
        data-scrolled={scrolled ? 'true' : undefined}
        data-hidden={hidden && !mobileOpen && !searchOpen ? 'true' : undefined}
      >

        {/* ── Main nav ─────────────────────────────────────────────────── */}
        <div className="sv-container sv-site-nav" role="navigation" style={{ height: BASE_NAV_H }}>

          {/* Logo box (Blackstone bordered wordmark style) */}
          <Link href="/" style={{ textDecoration: 'none', flexShrink: 0 }}>
            <span className="sv-logo-box">
              <span className="sv-wordmark-title">
                Steinberg<span style={{ color: 'var(--color-sv-gold)' }}>Valentino</span>
              </span>
              <span className="sv-wordmark-meta">Group</span>
            </span>
          </Link>

          {/* Desktop nav links */}
          <nav
            aria-label="Main navigation"
            style={{ display: 'flex', alignItems: 'center', gap: '0.125rem' }}
            className="desktop-nav"
          >
            {navItems.map((item) => {
              const isActive =
                pathname === item.href ||
                pathname.startsWith(item.href + '/') ||
                isParentActive(item)

              if (!item.children) {
                return (
                  <Link
                    key={item.label}
                    href={item.href}
                    className="sv-nav-link"
                    data-active={isActive}
                  >
                    {item.label}
                  </Link>
                )
              }

              const isOpen = activeDropdown === item.label

              return (
                <div
                  key={item.label}
                  style={{ position: 'relative' }}
                  onMouseEnter={() => handleMouseEnter(item.label)}
                  onMouseLeave={handleMouseLeave}
                >
                  <Link
                    href={item.href}
                    className="sv-nav-link"
                    data-active={isActive}
                    aria-expanded={isOpen}
                    aria-haspopup="true"
                    style={{ whiteSpace: 'nowrap' }}
                  >
                    {item.label}
                    <svg
                      width="8"
                      height="5"
                      viewBox="0 0 10 6"
                      fill="none"
                      aria-hidden="true"
                      style={{
                        transition: 'transform 0.2s',
                        transform: isOpen ? 'rotate(180deg)' : 'none',
                        flexShrink: 0,
                        opacity: 0.65,
                      }}
                    >
                      <path d="M1 1l4 4 4-4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </Link>

                  {/* Dropdown — CSS-animated via class toggle */}
                  <div
                    role="menu"
                    className={`sv-dropdown-panel${isOpen ? ' is-open' : ''}`}
                    style={{
                      position: 'absolute',
                      top: 'calc(100% + 6px)',
                      left: '50%',
                      transform: isOpen ? 'translateX(-50%) translateY(0)' : 'translateX(-50%) translateY(-8px)',
                      minWidth: '300px',
                      padding: '0.5rem 0',
                      zIndex: 100,
                    }}
                    onMouseEnter={() => handleMouseEnter(item.label)}
                    onMouseLeave={handleMouseLeave}
                  >
                    {item.children.map((child) => {
                      const childActive = pathname === child.href
                      return (
                        <Link
                          key={child.href}
                          href={child.href}
                          role="menuitem"
                          className="sv-dropdown-link"
                          data-active={childActive}
                        >
                          {child.label}
                        </Link>
                      )
                    })}
                  </div>
                </div>
              )
            })}

            {/* ── Blackstone-style CTA button ── */}
            <Link href="/contact" className="sv-nav-cta">
              Contact Us
            </Link>

            {/* ── Search trigger ── */}
            <button
              type="button"
              aria-label="Search"
              aria-haspopup="dialog"
              aria-expanded={searchOpen}
              onClick={() => setSearchOpen(true)}
              className="sv-nav-search"
            >
              <SearchIcon />
            </button>
          </nav>

          {/* Mobile hamburger */}
          <button
            aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={mobileOpen}
            onClick={() => setMobileOpen(!mobileOpen)}
            className="mobile-hamburger"
            style={{
              display: 'none',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '5px',
              width: '2rem',
              height: '2rem',
              border: 'none',
              background: 'transparent',
              cursor: 'pointer',
              flexShrink: 0,
              padding: 0,
            }}
          >
            {[
              mobileOpen ? 'translateY(6.5px) rotate(45deg)' : 'none',
              null,
              mobileOpen ? 'translateY(-6.5px) rotate(-45deg)' : 'none',
            ].map((transform, i) =>
              transform === null ? (
                <span
                  key={i}
                  style={{
                    display: 'block',
                    width: '22px',
                    height: '1.5px',
                    backgroundColor: hamburgerColor,
                    opacity: mobileOpen ? 0 : 1,
                    transition: 'opacity 0.3s, background-color 0.38s',
                  }}
                />
              ) : (
                <span
                  key={i}
                  style={{
                    display: 'block',
                    width: '22px',
                    height: '1.5px',
                    backgroundColor: hamburgerColor,
                    transition: 'transform 0.3s, background-color 0.38s',
                    transform,
                  }}
                />
              )
            )}
          </button>

        </div>{/* /sv-site-nav */}
      </header>

      {/* ── Search overlay ────────────────────────────────────────────── */}
      {searchOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Site search"
          className="sv-search-overlay"
          onClick={() => setSearchOpen(false)}
        >
          <form
            onSubmit={submitSearch}
            onClick={(e) => e.stopPropagation()}
            role="search"
            className="sv-search-box"
          >
            <SearchIcon size={20} />
            <input
              ref={searchInputRef}
              type="search"
              name="q"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={placeholder}
              aria-label="Search the site"
              className="sv-search-input"
            />
            <button type="submit" className="sv-search-submit">
              Search
            </button>
            <button
              type="button"
              aria-label="Close search"
              onClick={() => setSearchOpen(false)}
              className="sv-search-close"
            >
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
                <path d="M5 5l10 10M15 5L5 15" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
              </svg>
            </button>
          </form>
        </div>
      )}

      {/* ── Mobile drawer ─────────────────────────────────────────────── */}
      <div
        aria-hidden={!mobileOpen}
        style={{
          position: 'fixed',
          top: 'var(--sv-nav-h)',
          left: 0,
          right: 0,
          bottom: 0,
          background: '#0b0c0f',
          zIndex: 49,
          overflowY: 'auto',
          transform: mobileOpen ? 'translateX(0)' : 'translateX(100%)',
          transition: 'transform 0.32s cubic-bezier(0.4,0,0.2,1)',
          padding: '0.5rem 0 4rem',
        }}
        className="mobile-drawer"
      >
        {/* Search field (mobile) */}
        <form
          onSubmit={submitSearch}
          role="search"
          style={{
            display: 'flex',
            gap: '0.5rem',
            padding: '0.75rem var(--sv-pad-sm) 1rem',
            borderBottom: '1px solid rgba(255,255,255,0.06)',
          }}
        >
          <input
            type="search"
            name="q"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={placeholder}
            aria-label="Search the site"
            style={{
              flex: 1,
              minWidth: 0,
              padding: '0.7rem 0.9rem',
              fontSize: '0.875rem',
              color: '#fff',
              background: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(255,255,255,0.12)',
              outline: 'none',
            }}
          />
          <button
            type="submit"
            aria-label="Search"
            style={{
              flexShrink: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '2.75rem',
              border: 'none',
              background: 'var(--color-sv-gold)',
              color: 'var(--color-sv-dark)',
              cursor: 'pointer',
            }}
          >
            <SearchIcon size={18} />
          </button>
        </form>

        {navItems.map((item) => {
          const isActive = pathname === item.href || isParentActive(item)
          const isExpanded = mobileExpanded === item.label

          return (
            <div key={item.label} style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  paddingLeft: 'var(--sv-pad-sm)',
                  paddingRight: 'var(--sv-pad-sm)',
                }}
              >
                <Link
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  style={{
                    flex: 1,
                    display: 'block',
                    padding: '0.95rem 0',
                    fontSize: '0.8125rem',
                    fontWeight: isActive ? 500 : 400,
                    letterSpacing: '0.1em',
                    textTransform: 'uppercase',
                    textDecoration: 'none',
                    color: isActive ? 'var(--color-sv-gold)' : 'rgba(255,255,255,0.8)',
                  }}
                >
                  {item.label}
                </Link>

                {item.children && (
                  <button
                    aria-expanded={isExpanded}
                    onClick={() => setMobileExpanded(isExpanded ? null : item.label)}
                    style={{
                      border: 'none',
                      background: 'transparent',
                      cursor: 'pointer',
                      padding: '0.5rem',
                      color: 'rgba(255,255,255,0.4)',
                      display: 'flex',
                      alignItems: 'center',
                    }}
                  >
                    <svg
                      width="12"
                      height="8"
                      viewBox="0 0 12 8"
                      fill="none"
                      aria-hidden="true"
                      style={{ transition: 'transform 0.22s', transform: isExpanded ? 'rotate(180deg)' : 'none' }}
                    >
                      <path d="M1 1l5 5 5-5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </button>
                )}
              </div>

              {item.children && isExpanded && (
                <div
                  style={{
                    paddingBottom: '0.5rem',
                    paddingLeft: 'var(--sv-pad-sm)',
                    paddingRight: 'var(--sv-pad-sm)',
                    background: 'rgba(220,168,64,0.04)',
                    borderTop: '1px solid rgba(220,168,64,0.1)',
                  }}
                >
                  {item.children.map((child) => {
                    const childActive = pathname === child.href
                    return (
                      <Link
                        key={child.href}
                        href={child.href}
                        onClick={() => setMobileOpen(false)}
                        style={{
                          display: 'block',
                          padding: '0.625rem 0 0.625rem 1rem',
                          fontSize: '0.8125rem',
                          letterSpacing: '0.06em',
                          textTransform: 'uppercase',
                          textDecoration: 'none',
                          color: childActive ? 'var(--color-sv-gold)' : 'rgba(255,255,255,0.55)',
                          borderLeft: `2px solid ${childActive ? 'var(--color-sv-gold)' : 'transparent'}`,
                        }}
                      >
                        {child.label}
                      </Link>
                    )
                  })}
                </div>
              )}
            </div>
          )
        })}

        <div
          style={{
            paddingLeft: 'var(--sv-pad-sm)',
            paddingRight: 'var(--sv-pad-sm)',
            marginTop: '1.5rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.75rem',
          }}
        >
          <Link
            href="/contact"
            onClick={() => setMobileOpen(false)}
            style={{
              display: 'block',
              textAlign: 'center',
              padding: '0.9rem',
              fontSize: '0.78rem',
              fontWeight: 600,
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
              textDecoration: 'none',
              color: 'var(--color-sv-dark)',
              background: 'var(--color-sv-gold)',
            }}
          >
            Contact Us
          </Link>
          {phone && (
            <a
              href={`tel:${phone.replace(/[^\d+]/g, '')}`}
              style={{
                display: 'block',
                textAlign: 'center',
                padding: '0.6rem',
                fontSize: '0.8125rem',
                letterSpacing: '0.04em',
                textDecoration: 'none',
                color: 'rgba(255,255,255,0.55)',
                borderTop: '1px solid rgba(255,255,255,0.06)',
              }}
            >
              {phone}
            </a>
          )}
        </div>
      </div>

      {pathname !== '/' && <div className="sv-page-offset" />}

      {/* ── Scroll-to-top button ────────────────────────────────────────── */}
      <button
        aria-label="Scroll to top"
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        style={{
          position: 'fixed',
          bottom: '1.75rem',
          right: '1.75rem',
          width: '2.875rem',
          height: '2.875rem',
          background: 'linear-gradient(135deg, #dca840 0%, #b08d57 100%)',
          border: '1px solid rgba(220,168,64,0.35)',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          zIndex: 48,
          boxShadow: '0 4px 20px rgba(176,141,87,0.4), 0 1px 4px rgba(0,0,0,0.45)',
          opacity: showScrollTop ? 1 : 0,
          pointerEvents: showScrollTop ? 'auto' : 'none',
          transform: showScrollTop ? 'translateY(0)' : 'translateY(0.625rem)',
          transition: 'opacity 0.35s ease, transform 0.35s ease',
          outline: 'none',
          padding: 0,
        }}
      >
        <svg width="15" height="15" viewBox="0 0 16 16" fill="none" aria-hidden="true">
          <path d="M8 12V4M4 7.5 8 3.5l4 4" stroke="#0b0c0f" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

    </>
  )
}

function SearchIcon({ size = 18 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 20 20"
      fill="none"
      aria-hidden="true"
    >
      <circle cx="9" cy="9" r="6.25" stroke="currentColor" strokeWidth="1.6" />
      <path d="M13.6 13.6L17.5 17.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  )
}
