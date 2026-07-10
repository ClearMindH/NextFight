import type { Fighter, OrganizationId, OrganizationRoster } from '@/types'
import { organizations } from '@/data/organizations'

import ufcRoster from '@/data/rosters/ufc.json'

const rosters: Record<OrganizationId, OrganizationRoster> = {
  ufc: ufcRoster as OrganizationRoster,
}

export function getRoster(orgId: OrganizationId): OrganizationRoster {
  return rosters[orgId]
}

export function getAllRosters(): OrganizationRoster[] {
  return organizations.map((o) => rosters[o.id])
}

export function getFighterById(id: string): Fighter | undefined {
  return rosters.ufc.fighters.find((f) => f.id === id)
}

export function getAllFighters(): Fighter[] {
  return rosters.ufc.fighters
}

export function getFightersByOrg(orgId: OrganizationId): Fighter[] {
  return rosters[orgId].fighters
}

export function getRosterSummary() {
  return organizations.map((org) => ({
    organization: org,
    meta: rosters[org.id].meta,
  }))
}
