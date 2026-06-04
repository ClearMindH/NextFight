import type { MetadataRoute } from 'next'
import { organizations } from '@/data/organizations'
import { getAllFightIds } from '@/lib/fights'

const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://nextfightsstats.com'

export default function sitemap(): MetadataRoute.Sitemap {
  const staticRoutes = ['', '/pricing', '/account', '/legal']
  const orgRoutesEn = organizations.map((o) => o.seoPath)
  const orgRoutesFr = organizations.map((o) => o.seoPathFr)
  const fightRoutes = getAllFightIds().map((id) => `/fight/${id}`)

  const allPaths = [...staticRoutes, ...orgRoutesEn, ...orgRoutesFr, ...fightRoutes]

  return allPaths.map((path) => ({
    url: `${baseUrl}${path}`,
    lastModified: new Date(),
    changeFrequency: path.includes('pronostics') || path.startsWith('/fight/')
      ? 'weekly'
      : path === ''
        ? 'weekly'
        : 'monthly',
    priority: path === ''
      ? 1
      : path.includes('pronostics')
        ? 0.9
        : path.startsWith('/fight/')
          ? 0.85
          : 0.8,
  }))
}
