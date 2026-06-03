import { readFileSync, writeFileSync, existsSync } from 'fs'
import path from 'path'
import type { Fighter, OrganizationId, OrganizationRoster } from '@/types'

const ROSTER_DIR = path.join(process.cwd(), 'data', 'rosters')

const ORG_IDS: OrganizationId[] = ['ufc', 'pfl', 'ksw', 'ares', 'hexagone']

function rosterPath(orgId: OrganizationId): string {
  return path.join(ROSTER_DIR, `${orgId}.json`)
}

export function loadRoster(orgId: OrganizationId): OrganizationRoster {
  const file = rosterPath(orgId)
  if (!existsSync(file)) {
    return {
      meta: {
        organizationId: orgId,
        fighterCount: 0,
        lastSyncedAt: new Date().toISOString(),
        source: 'admin',
      },
      fighters: [],
    }
  }
  return JSON.parse(readFileSync(file, 'utf-8')) as OrganizationRoster
}

export function saveRoster(orgId: OrganizationId, roster: OrganizationRoster): void {
  const next: OrganizationRoster = {
    ...roster,
    meta: {
      ...roster.meta,
      organizationId: orgId,
      fighterCount: roster.fighters.length,
      lastSyncedAt: new Date().toISOString(),
    },
  }
  writeFileSync(rosterPath(orgId), JSON.stringify(next, null, 2), 'utf-8')
}

export function getFighterFromStore(id: string): Fighter | undefined {
  for (const orgId of ORG_IDS) {
    const roster = loadRoster(orgId)
    const found = roster.fighters.find((f) => f.id === id)
    if (found) return found
  }
  return undefined
}

export function getAllFightersFromStore(): Fighter[] {
  return ORG_IDS.flatMap((orgId) => loadRoster(orgId).fighters)
}

export function upsertFighterInStore(fighter: Fighter): Fighter {
  const roster = loadRoster(fighter.organizationId)
  const index = roster.fighters.findIndex((f) => f.id === fighter.id)
  const next = [...roster.fighters]
  if (index >= 0) next[index] = fighter
  else next.push(fighter)
  saveRoster(fighter.organizationId, { ...roster, fighters: next })
  return fighter
}

export function slugifyFighterId(orgId: OrganizationId, name: string): string {
  const slug = name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
  return `${orgId}-${slug}`
}

export { ORG_IDS }
