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
  pfl: {
    src: '/images/orgs/pfl.png',
    alt: 'PFL',
    aspect: 1,
  },
  ksw: {
    src: '/images/orgs/ksw.png',
    alt: 'KSW',
    aspect: 800 / 310,
  },
  ares: {
    src: '/images/orgs/ares.png',
    alt: 'ARES Fighting Championship',
    aspect: 1,
  },
  hexagone: {
    src: '/images/orgs/hexagone.png',
    alt: 'Hexagone MMA',
    aspect: 181 / 167,
  },
}

export function getOrgLogo(orgId: OrganizationId): OrgLogoConfig {
  return ORG_LOGOS[orgId]
}
