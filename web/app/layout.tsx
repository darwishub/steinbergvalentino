import type { Metadata } from 'next'
import { Cormorant_Garamond, Manrope } from 'next/font/google'
import './globals.css'
import { Nav } from '@/components/nav'
import { Footer } from '@/components/footer'
import { DEFAULT_GLOBAL_SETTINGS } from '@/lib/defaults'
import { getGlobalSettings } from '@/lib/strapi'

/* ─── Fonts ──────────────────────────────────────────────────────────────── */
// Primary serif for display typography
const cormorant = Cormorant_Garamond({
  variable: '--font-cormorant',
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  style: ['normal', 'italic'],
  display: 'swap',
  preload: true,
})

// Primary sans for interface and body copy
const manrope = Manrope({
  variable: '--font-manrope',
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700', '800'],
  display: 'swap',
  preload: true,
})

export async function generateMetadata(): Promise<Metadata> {
  const globalSettings = await getGlobalSettings().catch(() => null)
  const siteName = globalSettings?.site_name ?? 'SteinbergValentino Group'

  return {
    metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? 'https://www.steinbergvalentino.com'),
    title: {
      /* No template — each page returns its own complete title from Strapi.
         The default applies only when a page has no generateMetadata at all. */
      absolute: `${siteName} — Investor Relations for Small & Mid-Cap Companies`,
      default: `${siteName} — Investor Relations for Small & Mid-Cap Companies`,
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
      siteName,
    },
    twitter: {
      card: 'summary_large_image',
    },
  }
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
        <Nav
          items={navigation}
          phone={globalSettings?.contact_phone}
          searchPlaceholder={globalSettings?.search_placeholder}
          searchHeading={globalSettings?.search_heading}
          ctaLabel={globalSettings?.nav_cta_label ?? DEFAULT_GLOBAL_SETTINGS.nav_cta_label}
        />
        <main className="flex-1">{children}</main>
        <Footer
          quickLinks={globalSettings?.footer_quick_links}
          serviceLinks={globalSettings?.footer_service_links}
          exchangeLinks={globalSettings?.footer_exchange_links}
          legalLinks={globalSettings?.footer_legal_links}
          blurb={globalSettings?.footer_blurb}
          tagline={globalSettings?.tagline}
          email={globalSettings?.contact_email}
          phone={globalSettings?.contact_phone}
          address={globalSettings?.address}
          copyright={globalSettings?.footer_copyright}
          contactHeading={globalSettings?.footer_contact_heading ?? DEFAULT_GLOBAL_SETTINGS.footer_contact_heading}
          emailLabel={globalSettings?.footer_email_label ?? DEFAULT_GLOBAL_SETTINGS.footer_email_label}
          phoneLabel={globalSettings?.footer_phone_label ?? DEFAULT_GLOBAL_SETTINGS.footer_phone_label}
          officeLabel={globalSettings?.footer_office_label ?? DEFAULT_GLOBAL_SETTINGS.footer_office_label}
          firmHeading={globalSettings?.footer_firm_heading ?? DEFAULT_GLOBAL_SETTINGS.footer_firm_heading}
          servicesHeading={globalSettings?.footer_services_heading ?? DEFAULT_GLOBAL_SETTINGS.footer_services_heading}
          exchangesHeading={globalSettings?.footer_exchanges_heading ?? DEFAULT_GLOBAL_SETTINGS.footer_exchanges_heading}
          socialFacebook={globalSettings?.social_facebook ?? DEFAULT_GLOBAL_SETTINGS.social_facebook}
          socialTwitter={globalSettings?.social_twitter ?? DEFAULT_GLOBAL_SETTINGS.social_twitter}
          socialInstagram={globalSettings?.social_instagram ?? DEFAULT_GLOBAL_SETTINGS.social_instagram}
          socialLinkedin={globalSettings?.social_linkedin ?? DEFAULT_GLOBAL_SETTINGS.social_linkedin}
          socialPinterest={globalSettings?.social_pinterest ?? DEFAULT_GLOBAL_SETTINGS.social_pinterest}
        />
      </body>
    </html>
  )
}
