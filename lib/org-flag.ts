import type { OrganizationId } from '@/types'

export interface OrgFlagMeta {
  emoji: string
  regionLabel: string
}

export const ORG_EVENT_FLAG: Record<OrganizationId, OrgFlagMeta> = {
  ufc: { emoji: '🇺🇸', regionLabel: 'États-Unis' },
}

export function getOrgEventFlag(orgId: OrganizationId): OrgFlagMeta {
  return ORG_EVENT_FLAG[orgId]
}
