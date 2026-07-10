import type { Metadata } from 'next'
import type { Organization } from '@/types'
import { getSiteName, getSiteUrl } from '@/lib/site'
import { SITE_LOGO_PATH, SITE_LOGO_SIZE } from '@/lib/seo-site-jsonld'

const siteUrl = getSiteUrl()

export function buildOrgMetadata(org: Organization): Metadata {
  const title = `${org.name} Predictions | NextFight`
  const description = `Fight predictions and pre-fight analysis for ${org.fullName}. ${org.description}`

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: 'website',
      url: `${siteUrl}${org.seoPath}`,
    },
    alternates: {
      canonical: `${siteUrl}${org.seoPath}`,
      languages: {
        en: `${siteUrl}${org.seoPath}`,
        'fr-FR': `${siteUrl}${org.seoPathFr}`,
      },
    },
  }
}

const siteName = getSiteName()

export const siteMetadata: Metadata = {
  title: {
    default: `${siteName} — Pronostics UFC`,
    template: `%s | ${siteName}`,
  },
  description:
    'Pronostics UFC carte par carte : co-main gratuit, analyses statistiques et probabilités de victoire. Outil informatif sans paris sportifs.',
  keywords: ['pronostics UFC', 'prédictions UFC', 'McGregor Holloway', 'analyses MMA'],
  metadataBase: new URL(siteUrl),
  applicationName: siteName,
  icons: {
    icon: [
      { url: '/icon.png', sizes: '32x32', type: 'image/png' },
      {
        url: SITE_LOGO_PATH,
        sizes: `${SITE_LOGO_SIZE}x${SITE_LOGO_SIZE}`,
        type: 'image/png',
      },
    ],
    apple: [{ url: SITE_LOGO_PATH, sizes: `${SITE_LOGO_SIZE}x${SITE_LOGO_SIZE}` }],
  },
  openGraph: {
    title: `${siteName} — Prédictions MMA`,
    description: 'Pronostics et analyses statistiques pour les grandes cartes MMA.',
    url: siteUrl,
    siteName,
    type: 'website',
    images: [
      {
        url: '/opengraph-image',
        width: 1200,
        height: 630,
        alt: `${siteName} — Prédictions MMA`,
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: `${siteName} — Prédictions MMA`,
    images: ['/opengraph-image'],
  },
  robots: { index: true, follow: true },
  alternates: { canonical: siteUrl },
  verification: {
    google: 'ftLvZblBcr_aWIfhgDEa2X1yxNi3cGJFPfsT1A4krp8',
  },
}
