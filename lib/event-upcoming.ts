import type { Event } from '@/types'

/** Jour calendaire UTC de l’événement déjà passé (ex. carte du 7 juin masquée le 10). */
export function isPastEventDate(iso: string, now = new Date()): boolean {
  const d = new Date(iso)
  const eventDay = Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate())
  const today = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate())
  return eventDay < today
}

export function isUpcomingEvent(event: Event, now = new Date()): boolean {
  return event.status === 'upcoming' && !isPastEventDate(event.date, now)
}
