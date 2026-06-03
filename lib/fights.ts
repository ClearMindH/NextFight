import { getEvents, getEventsByOrg } from '@/data/events'
import { getOrganization } from '@/data/organizations'
import type { Event, Fight, Organization } from '@/types'

export interface FightPageData {
  fight: Fight
  event: Event
  organization: Organization
  orgEvents: Event[]
}

export function getAllFightIds(): string[] {
  return getEvents().flatMap((e) => e.fights.map((f) => f.id))
}

export function getFightById(fightId: string): Fight | undefined {
  for (const event of getEvents()) {
    const fight = event.fights.find((f) => f.id === fightId)
    if (fight) return fight
  }
  return undefined
}

export function getFightPageData(fightId: string): FightPageData | undefined {
  for (const event of getEvents()) {
    const fight = event.fights.find((f) => f.id === fightId)
    if (!fight) continue
    const organization = getOrganization(event.organizationId)
    if (!organization) return undefined
    return {
      fight,
      event,
      organization,
      orgEvents: getEventsByOrg(event.organizationId),
    }
  }
  return undefined
}
