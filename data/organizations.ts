import type { Organization } from '@/types'

export const organizations: Organization[] = [
  {
    id: 'ufc',
    name: 'UFC',
    fullName: 'Ultimate Fighting Championship',
    slug: 'ufc',
    seoPath: '/ufc-predictions',
    seoPathFr: '/ufc-pronostics',
    description: 'Global flagship MMA promotion with ranked divisions and championship belts.',
    descriptionFr:
      'Pronostics statistiques carte par carte : co-main gratuit, reste de la carte en Premium.',
  },
]

export function getOrganization(id: string): Organization | undefined {
  if (id !== 'ufc') return undefined
  return organizations[0]
}

export function getOrganizationByFrenchPath(path: string): Organization | undefined {
  return organizations.find((o) => o.seoPathFr === path)
}
