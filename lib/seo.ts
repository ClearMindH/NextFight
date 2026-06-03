import type { Metadata } from 'next'
import type { Organization } from '@/types'

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://nextfight.io'

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

export const siteMetadata: Metadata = {
  title: {
    default: 'NextFight — Pronostics MMA',
    template: '%s | NextFight',
  },
  description:
    'Pronostics MMA pour UFC, PFL, KSW, ARES et Hexagone MMA. Analyses statistiques, outil informatif sans paris sportifs.',
  metadataBase: new URL(siteUrl),
}
