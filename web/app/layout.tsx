import type { Metadata } from 'next'
import { Cormorant_Garamond, Manrope } from 'next/font/google'
import './globals.css'
import { Nav } from '@/components/nav'
import { Footer } from '@/components/footer'
import { DEFAULT_GLOBAL_SETTINGS } from '@/lib/defaults'
import { getGlobalSettings } from '@/lib/strapi'

/* ─── Fonts ──────────────────────────────────────────────────────────────── */
// Sanomat (Blackstone serif) → Cormorant Garamond — hairline strokes, old-money gravitas
const cormorant = Cormorant_Garamond({
  variable: '--font-cormorant',
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  style: ['normal', 'italic'],
  display: 'swap',
  preload: true,
})

// UI / body sans → Manrope — humanist geometric, premium fintech feel
const manrope = Manrope({
  variable: '--font-manrope',
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700', '800'],
  display: 'swap',
  preload: true,
})

export const metadata: Metadata = {
  title: {
    template: '%s | SteinbergValentino Group',
    default: 'SteinbergValentino Group — Investor Relations for Small & Mid-Cap Companies',
  },
  description:
    'SteinbergValentino Group is a premier investor relations firm serving small and mid-cap public companies. We help businesses build institutional confidence, access capital, and achieve sustainable market recognition.',
  keywords: [
    'investor relations',
    'IR firm',
    'small cap',
    'mid cap',
    'capital markets',
    'strategic advisory',
    'financial communications',
  ],
  openGraph: {
    type: 'website',
    siteName: 'SteinbergValentino Group',
  },
}

export default async function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const globalSettings = await getGlobalSettings().catch(() => null)

  const navigation =
    globalSettings?.primary_navigation?.length
      ? globalSettings.primary_navigation
      : DEFAULT_GLOBAL_SETTINGS.primary_navigation

  /* Preconnect to Strapi origin so hero image fetch starts immediately */
  const strapiOrigin = process.env.NEXT_PUBLIC_STRAPI_URL
    ? new URL(process.env.NEXT_PUBLIC_STRAPI_URL).origin
    : null

  return (
    <html lang="en" data-scroll-behavior="smooth" className={`${cormorant.variable} ${manrope.variable} antialiased`}>
      <head>
        {strapiOrigin && <link rel="preconnect" href={strapiOrigin} />}
      </head>
      <body className="flex min-h-screen flex-col">
        <Nav items={navigation} phone={globalSettings?.contact_phone} />
        <main className="flex-1">{children}</main>
        <Footer
          quickLinks={globalSettings?.footer_quick_links}
          serviceLinks={globalSettings?.footer_service_links}
          exchangeLinks={globalSettings?.footer_exchange_links}
          legalLinks={globalSettings?.footer_legal_links}
          blurb={globalSettings?.footer_blurb}
          email={globalSettings?.contact_email}
          phone={globalSettings?.contact_phone}
          address={globalSettings?.address}
          copyright={globalSettings?.footer_copyright}
          socialFacebook={globalSettings?.social_facebook}
          socialTwitter={globalSettings?.social_twitter}
          socialInstagram={globalSettings?.social_instagram}
          socialLinkedin={globalSettings?.social_linkedin}
          socialPinterest={globalSettings?.social_pinterest}
        />
      </body>
    </html>
  )
}
