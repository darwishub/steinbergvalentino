'use client'

import { useState, useEffect, useRef, startTransition } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { DEFAULT_GLOBAL_SETTINGS } from '@/lib/defaults'
import type { GlobalNavItem } from '@/lib/types'

interface NavProps {
  items?: GlobalNavItem[] | null
  phone?: string | null
  tagline?: string | null
}

export function Nav({ items, phone, tagline }: NavProps) {
  const pathname = usePathname()
  const [scrolled, setScrolled] = useState(false)
  const [showScrollTop, setShowScrollTop] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null)
  const [mobileExpanded, setMobileExpanded] = useState<string | null>(null)
  const leaveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const rawItems = items?.length ? items : (DEFAULT_GLOBAL_SETTINGS.primary_navigation ?? [])
  /* Strip any standalone "Contact Us" link — it's always shown as the CTA button */
  const navItems = rawItems.filter((i) => i.href !== '/contact' || !!i.children?.length)

  /* scroll: shadow + nav grow + scroll-to-top visibility */
  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY
      setScrolled(y > 80)
      setShowScrollTop(y > 400)
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  /* close mobile on route change — startTransition avoids synchronous-setState-in-effect lint */
  useEffect(() => {
    startTransition(() => {
      setMobileOpen(false)
      setMobileExpanded(null)
    })
  }, [pathname])

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
      <header className="sv-site-header" data-scrolled={scrolled ? 'true' : undefined}>

        {/* ── Main nav ─────────────────────────────────────────────────── */}
        <div className="sv-container sv-site-nav" role="navigation">

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
