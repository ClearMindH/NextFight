import type { OrganizationId } from '@/types'

export interface OrgLogoConfig {
  src: string
  alt: string
  /** Ratio largeur/hauteur du fichier source */
  aspect: number
}

export const ORG_LOGOS: Record<OrganizationId, OrgLogoConfig> = {
  ufc: {
    src: '/images/orgs/ufc.png',
    alt: 'UFC',
    aspect: 1675 / 580,
  },
}

export function getOrgLogo(orgId: OrganizationId): OrgLogoConfig {
  return ORG_LOGOS[orgId]
}
