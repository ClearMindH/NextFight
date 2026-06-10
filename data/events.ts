import type { Event } from '@/types'
import { loadEventsHydrated } from '@/lib/events-store'

export function getEvents(): Event[] {
  return loadEventsHydrated()
}

export function getEventsByOrg(orgId: string): Event[] {
  return getEvents().filter((e) => e.organizationId === orgId)
}

export function getEvent(id: string): Event | undefined {
  return getEvents().find((e) => e.id === id)
}

import { isUpcomingEvent } from '@/lib/event-upcoming'

export function getUpcomingEvents(limit = 6): Event[] {
  return [...getEvents()]
    .filter((e) => isUpcomingEvent(e))
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .slice(0, limit)
}

export {
  getCoMainFight,
  getFreePreviewFight,
  getMainFight,
} from '@/lib/event-helpers'
