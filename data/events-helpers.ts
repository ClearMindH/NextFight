import type { Event, OrganizationId } from '@/types'
import { getEvents, getEventsByOrg } from '@/data/events'
import {
  isEventPredictionsPublished,
  isEventPredictionsPreparing,
} from '@/lib/event-predictions'

function sortByDate(events: Event[]): Event[] {
  return [...events].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
}

export function getUpcomingEventsSorted(limit?: number): Event[] {
  const list = sortByDate(getEvents().filter((e) => e.status === 'upcoming'))
  return limit != null ? list.slice(0, limit) : list
}

export function getUpcomingEventsByOrg(orgId: OrganizationId): Event[] {
  return sortByDate(getEventsByOrg(orgId).filter((e) => e.status === 'upcoming'))
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
