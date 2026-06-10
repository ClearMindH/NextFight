import type { Metadata } from 'next'
import { Bebas_Neue, Inter } from 'next/font/google'
import { GeistSans } from 'geist/font/sans'
import { GoogleAnalytics } from '@next/third-parties/google'
import { MicrosoftClarity } from '@/components/analytics/MicrosoftClarity'
import { OrgJsonLd } from '@/components/seo/OrgJsonLd'
import { siteMetadata } from '@/lib/seo'
import { buildSiteJsonLd } from '@/lib/seo-site-jsonld'
import './globals.css'

/** ID de mesure GA4 (ex. G-XXXXXXXXXX). Vide en local → aucun script chargé. */
const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_ID

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
})

/** Condensed display face — proche des wordmarks promotionnels (UFC, PFL, …) */
const bebasNeue = Bebas_Neue({
  weight: '400',
  subsets: ['latin'],
  variable: '--font-logo',
})

export const metadata: Metadata = siteMetadata

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="fr" className={`${inter.variable} ${GeistSans.variable} ${bebasNeue.variable}`}>
      <body className="font-sans antialiased">
        <OrgJsonLd data={buildSiteJsonLd()} />
        {children}
      </body>
      {GA_MEASUREMENT_ID && <GoogleAnalytics gaId={GA_MEASUREMENT_ID} />}
      <MicrosoftClarity />
    </html>
  )
}
