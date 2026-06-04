import type { Metadata } from 'next'
import type { Event, Fight, Organization } from '@/types'

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://nextfightsstats.com'

export function buildPronosticsMetadata(org: Organization): Metadata {
  const title = `Pronostics ${org.name} — Analyses MMA | NextFight`
  const description = `Pronostics ${org.fullName} : probabilités de victoire, méthode, round et analyses détaillées. ${org.descriptionFr}`

  return {
    title,
    description,
    keywords: [
      `pronostics ${org.name}`,
      `pronostic MMA ${org.name}`,
      `prédictions ${org.name}`,
      'analyse combat MMA',
      'pronostics combat MMA',
      org.fullName,
    ],
    openGraph: {
      title,
      description,
      type: 'website',
      url: `${siteUrl}${org.seoPathFr}`,
      locale: 'fr_FR',
      siteName: 'NextFight',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
    },
    alternates: {
      canonical: `${siteUrl}${org.seoPathFr}`,
      languages: {
        'fr-FR': `${siteUrl}${org.seoPathFr}`,
        en: `${siteUrl}${org.seoPath}`,
      },
    },
    robots: {
      index: true,
      follow: true,
    },
  }
}

export function buildPronosticsJsonLd(
  org: Organization,
  featuredFight: Fight | null,
  featuredEvent: Event | null,
) {
  const pageUrl = `${siteUrl}${org.seoPathFr}`

  const graph: Record<string, unknown>[] = [
    {
      '@type': 'WebSite',
      '@id': `${siteUrl}/#website`,
      name: 'NextFight',
      url: siteUrl,
      description: 'Analyses MMA et pronostics basés sur un moteur statistique.',
      inLanguage: ['fr-FR', 'en'],
    },
    {
      '@type': 'WebPage',
      '@id': `${pageUrl}#webpage`,
      url: pageUrl,
      name: `Pronostics ${org.name} | NextFight`,
      description: org.descriptionFr,
      isPartOf: { '@id': `${siteUrl}/#website` },
      inLanguage: 'fr-FR',
      breadcrumb: { '@id': `${pageUrl}#breadcrumb` },
    },
    {
      '@type': 'BreadcrumbList',
      '@id': `${pageUrl}#breadcrumb`,
      itemListElement: [
        {
          '@type': 'ListItem',
          position: 1,
          name: 'Accueil',
          item: siteUrl,
        },
        {
          '@type': 'ListItem',
          position: 2,
          name: `Pronostics ${org.name}`,
          item: pageUrl,
        },
      ],
    },
    {
      '@type': 'SportsOrganization',
      name: org.fullName,
      alternateName: org.name,
      sport: 'Mixed Martial Arts',
      url: pageUrl,
    },
    {
      '@type': 'SoftwareApplication',
      name: 'NextFight Prediction Engine',
      applicationCategory: 'SportsApplication',
      operatingSystem: 'Web',
      description:
        'Moteur statistique de pronostics MMA : probabilités, méthode, round et analyses de combat.',
      offers: {
        '@type': 'Offer',
        price: '0',
        priceCurrency: 'EUR',
      },
    },
  ]

  if (featuredFight && featuredEvent) {
    graph.push({
      '@type': 'SportsEvent',
      name: `${featuredFight.redCorner.name} vs ${featuredFight.blueCorner.name}`,
      description: `Pronostic NextFight (co-main gratuit) — ${featuredEvent.name}`,
      sport: 'Mixed Martial Arts',
      startDate: featuredEvent.date,
      eventStatus: 'https://schema.org/EventScheduled',
      location: {
        '@type': 'Place',
        name: featuredEvent.venue,
        address: {
          '@type': 'PostalAddress',
          addressLocality: featuredEvent.city,
          addressCountry: featuredEvent.country,
        },
      },
      organizer: {
        '@type': 'SportsOrganization',
        name: org.fullName,
      },
      url: `${siteUrl}/fight/${featuredFight.id}`,
    })
  }

  return {
    '@context': 'https://schema.org',
    '@graph': graph,
  }
}
