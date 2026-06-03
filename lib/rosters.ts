import type { Fighter, OrganizationId, OrganizationRoster } from '@/types'
import { organizations } from '@/data/organizations'

import ufcRoster from '@/data/rosters/ufc.json'
import pflRoster from '@/data/rosters/pfl.json'
import kswRoster from '@/data/rosters/ksw.json'
import aresRoster from '@/data/rosters/ares.json'
import hexagoneRoster from '@/data/rosters/hexagone.json'

const rosters: Record<OrganizationId, OrganizationRoster> = {
  ufc: ufcRoster as OrganizationRoster,
  pfl: pflRoster as OrganizationRoster,
  ksw: kswRoster as OrganizationRoster,
  ares: aresRoster as OrganizationRoster,
  hexagone: hexagoneRoster as OrganizationRoster,
}

export function getRoster(orgId: OrganizationId): OrganizationRoster {
  return rosters[orgId]
}

export function getAllRosters(): OrganizationRoster[] {
  return organizations.map((o) => rosters[o.id])
}

export function getFighterById(id: string): Fighter | undefined {
  for (const roster of Object.values(rosters)) {
    const found = roster.fighters.find((f) => f.id === id)
    if (found) return found
  }
  return undefined
}

export function getAllFighters(): Fighter[] {
  return Object.values(rosters).flatMap((r) => r.fighters)
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
