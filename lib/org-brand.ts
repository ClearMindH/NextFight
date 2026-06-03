import type { CSSProperties } from 'react'
import type { OrganizationId } from '@/types'

export interface OrgBrandStyle {
  /** Classes pour le nom court (UFC, PFL, …) */
  nameClass: string
  /** Typo wordmark (inclinaison, contour, tracking) */
  logoClass: string
  /** Ombre portée / contour type logo */
  nameStyle?: CSSProperties
  /** Bordure / fond carte au survol */
  accent: string
  accentMuted: string
  /** Label secondaire (nom complet) */
  taglineClass: string
  /** Cartes promotions — ambiance tableau de bord */
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
      surface: 'from-[#1a0808]/90 via-[#120606]/95 to-[#0a0505]',
      border: 'rgba(255, 60, 60, 0.18)',
      glow: 'rgba(210, 10, 10, 0.35)',
      pill: 'bg-[#ff3b3b]/15 text-[#ff8a8a] ring-[#ff3b3b]/25',
    },
  },
  pfl: {
    nameClass:
      'bg-gradient-to-b from-[#7ec8ff] via-[#1a5fb4] to-[#0a2d5c] bg-clip-text text-transparent',
    logoClass: 'org-wordmark-pfl',
    nameStyle: {
      textShadow:
        '2px 2px 0 #031428, -1px -1px 0 #031428, 0 0 22px rgba(26, 95, 180, 0.45)',
    },
    accent: 'rgba(26, 95, 180, 0.55)',
    accentMuted: 'rgba(26, 95, 180, 0.12)',
    taglineClass: 'text-[#5eb3ff]/70',
    card: {
      mesh: 'from-[#3d8bfd]/40 via-[#1a5fb4]/25 to-transparent',
      surface: 'from-[#081428]/90 via-[#060e1c]/95 to-[#040a14]',
      border: 'rgba(62, 139, 253, 0.2)',
      glow: 'rgba(26, 95, 180, 0.4)',
      pill: 'bg-[#3d8bfd]/15 text-[#8ec5ff] ring-[#3d8bfd]/25',
    },
  },
  ksw: {
    nameClass:
      'bg-gradient-to-b from-[#ff5c5c] via-[#e30613] to-[#9b0000] bg-clip-text text-transparent',
    logoClass: 'org-wordmark-ksw',
    nameStyle: {
      textShadow:
        '2px 2px 0 #1a0000, -1px -1px 0 #1a0000, 0 0 20px rgba(227, 6, 19, 0.45)',
    },
    accent: 'rgba(227, 6, 19, 0.55)',
    accentMuted: 'rgba(227, 6, 19, 0.12)',
    taglineClass: 'text-[#ff6b6b]/70',
    card: {
      mesh: 'from-[#ff4040]/35 via-[#e30613]/22 to-transparent',
      surface: 'from-[#180808]/90 via-[#100505]/95 to-[#080303]',
      border: 'rgba(255, 70, 70, 0.16)',
      glow: 'rgba(227, 6, 19, 0.38)',
      pill: 'bg-[#e30613]/15 text-[#ff7a7a] ring-[#e30613]/25',
    },
  },
  ares: {
    nameClass:
      'bg-gradient-to-b from-[#fff0b3] via-[#d4af37] to-[#7a5c10] bg-clip-text text-transparent',
    logoClass: 'org-wordmark-ares',
    nameStyle: {
      textShadow:
        '2px 2px 0 #1a1408, -1px -1px 0 #1a1408, 0 0 24px rgba(201, 162, 39, 0.5)',
    },
    accent: 'rgba(201, 162, 39, 0.55)',
    accentMuted: 'rgba(201, 162, 39, 0.12)',
    taglineClass: 'text-gold/70',
    card: {
      mesh: 'from-[#f5d76e]/40 via-[#c9a227]/25 to-transparent',
      surface: 'from-[#141008]/90 via-[#0e0c06]/95 to-[#080604]',
      border: 'rgba(201, 162, 39, 0.22)',
      glow: 'rgba(201, 162, 39, 0.35)',
      pill: 'bg-gold/15 text-[#f5e6a8] ring-gold/30',
    },
  },
  hexagone: {
    nameClass:
      'bg-gradient-to-b from-[#f5e6a8] via-[#c9a227] to-[#b91c1c] bg-clip-text text-transparent',
    logoClass: 'org-wordmark-hexagone',
    nameStyle: {
      textShadow: '2px 2px 0 #1a0a0a, 0 0 18px rgba(201, 162, 39, 0.35)',
    },
    accent: 'rgba(201, 162, 39, 0.5)',
    accentMuted: 'rgba(185, 28, 28, 0.1)',
    taglineClass: 'text-gold/60',
    card: {
      mesh: 'from-[#f0d78c]/35 via-[#c9a227]/20 to-[#b91c1c]/15',
      surface: 'from-[#14100a]/90 via-[#0e0c08]/95 to-[#0a0806]',
      border: 'rgba(201, 162, 39, 0.18)',
      glow: 'rgba(185, 28, 28, 0.25)',
      pill: 'bg-gold/12 text-[#f0d78c] ring-gold/25',
    },
  },
}

export function getOrgBrand(orgId: OrganizationId): OrgBrandStyle {
  return ORG_BRAND[orgId]
}
