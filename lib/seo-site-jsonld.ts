import { getSiteName, getSiteUrl } from '@/lib/site'

/** Logo carré ≥112 px requis par Google pour le rich result « logo de site ». */
export const SITE_LOGO_PATH = '/brand/nextfight-logo-128.png'
export const SITE_LOGO_SIZE = 128

/**
 * Schéma Organization + WebSite pour toutes les pages (logo de marque, nom de site).
 * @see https://developers.google.com/search/docs/appearance/site-names
 */
export function buildSiteJsonLd(): Record<string, unknown> {
  const siteUrl = getSiteUrl()
  const siteName = getSiteName()
  const orgId = `${siteUrl}/#organization`
  const websiteId = `${siteUrl}/#website`
  const logoUrl = `${siteUrl}${SITE_LOGO_PATH}`

  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Organization',
        '@id': orgId,
        name: siteName,
        url: siteUrl,
        logo: {
          '@type': 'ImageObject',
          '@id': `${siteUrl}/#logo`,
          url: logoUrl,
          contentUrl: logoUrl,
          width: SITE_LOGO_SIZE,
          height: SITE_LOGO_SIZE,
          caption: siteName,
        },
        image: logoUrl,
      },
      {
        '@type': 'WebSite',
        '@id': websiteId,
        url: siteUrl,
        name: siteName,
        inLanguage: 'fr-FR',
        publisher: { '@id': orgId },
      },
    ],
  }
}
