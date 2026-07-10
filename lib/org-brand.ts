import type { CSSProperties } from 'react'
import type { OrganizationId } from '@/types'

export interface OrgBrandStyle {
  nameClass: string
  cleanNameClass: string
  logoClass: string
  nameStyle?: CSSProperties
  accent: string
  accentMuted: string
  taglineClass: string
  card: {
    mesh: string
    surface: string
    border: string
    glow: string
    pill: string
  }
}

export const ORG_BRAND: Record<OrganizationId, OrgBrandStyle> = {
  ufc: {
    nameClass:
      'bg-gradient-to-b from-[#ff4545] via-[#d20a0a] to-[#8b0000] bg-clip-text text-transparent',
    cleanNameClass: 'text-[#ff5a5a]',
    logoClass: 'org-wordmark-ufc',
    nameStyle: {
      textShadow:
        '3px 3px 0 #0a0a0a, -2px -2px 0 #0a0a0a, 2px -2px 0 #0a0a0a, -2px 2px 0 #0a0a0a, 0 0 28px rgba(210, 10, 10, 0.5)',
    },
    accent: 'rgba(210, 10, 10, 0.55)',
    accentMuted: 'rgba(210, 10, 10, 0.12)',
    taglineClass: 'text-[#ff6b6b]/70',
    card: {
      mesh: 'from-[#ff2d2d]/35 via-[#d20a0a]/20 to-transparent',
      surface: 'from-[#2a1818] via-[#1f1414] to-[#1a1212]',
      border: 'rgba(255, 80, 80, 0.28)',
      glow: 'rgba(210, 10, 10, 0.35)',
      pill: 'bg-[#ff3b3b]/15 text-[#ff8a8a] ring-[#ff3b3b]/25',
    },
  },
}

export function getOrgBrand(orgId: OrganizationId): OrgBrandStyle {
  return ORG_BRAND[orgId]
}
