import type { OrganizationId } from '@/types'

export interface OrgFlagMeta {
  emoji: string
  regionLabel: string
}

/** Drapeau affiché pour les événements / hubs (pas de logo image). */
export const ORG_EVENT_FLAG: Record<OrganizationId, OrgFlagMeta> = {
  ufc: { emoji: '🇺🇸', regionLabel: 'États-Unis' },
  pfl: { emoji: '🌍', regionLabel: 'International' },
  ksw: { emoji: '🇵🇱', regionLabel: 'Pologne' },
  ares: { emoji: '🇫🇷', regionLabel: 'France' },
  hexagone: { emoji: '🇫🇷', regionLabel: 'France' },
}

export function getOrgEventFlag(orgId: OrganizationId): OrgFlagMeta {
  return ORG_EVENT_FLAG[orgId]
}
