import type { Metadata } from 'next'
import type { Organization } from '@/types'
import { getSiteName, getSiteUrl } from '@/lib/site'

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
    default: `${siteName} — Prédictions UFC, KSW, Hexagone MMA, PFL`,
    template: `%s | ${siteName}`,
  },
  description:
    'Prédictions MMA basées sur les statistiques pour l\'UFC, KSW, Hexagone MMA, ARES et PFL. Outil informatif sans paris sportifs.',
  keywords: [
    'prédictions UFC',
    'pronostics MMA',
    'KSW predictions',
    'Hexagone MMA',
    'PFL picks',
  ],
  metadataBase: new URL(siteUrl),
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
}
