import type { Event, OrganizationId } from '@/types'
import { getEvents, getEventsByOrg } from '@/data/events'
import {
  isEventPredictionsPublished,
  isEventPredictionsPreparing,
} from '@/lib/event-predictions'
import { isUpcomingEvent } from '@/lib/event-upcoming'

export { isPastEventDate, isUpcomingEvent } from '@/lib/event-upcoming'

function sortByDate(events: Event[]): Event[] {
  return [...events].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
}

export function getUpcomingEventsSorted(limit?: number): Event[] {
  const list = sortByDate(getEvents().filter((e) => isUpcomingEvent(e)))
  return limit != null ? list.slice(0, limit) : list
}

export function getUpcomingEventsByOrg(orgId: OrganizationId): Event[] {
  return sortByDate(getEventsByOrg(orgId).filter((e) => isUpcomingEvent(e)))
}

export function isCompletedEvent(e: Event): boolean {
  return e.status === 'completed'
}

/** Événements terminés, du plus récent au plus ancien. */
export function getCompletedEventsSorted(limit?: number): Event[] {
  const list = sortByDate(getEvents().filter(isCompletedEvent)).reverse()
  return limit != null ? list.slice(0, limit) : list
}

export function getCompletedEventsByOrg(orgId: OrganizationId): Event[] {
  return sortByDate(getEventsByOrg(orgId).filter(isCompletedEvent)).reverse()
}

export function partitionEventsByPredictions(events: Event[]) {
  const published: Event[] = []
  const preparing: Event[] = []
  for (const e of events) {
    if (isEventPredictionsPublished(e)) published.push(e)
    else if (isEventPredictionsPreparing(e)) preparing.push(e)
  }
  return { published, preparing }
}
