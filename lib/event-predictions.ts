import type { Event } from '@/types'

/** Pronostics publiés vs carte visible mais analyses en cours. */
export type EventPredictionsStatus = 'published' | 'preparing'

const MS_PER_DAY = 86_400_000

/**
 * Résout le statut affiché :
 * - `event.predictionsStatus` dans events.json prime toujours (contrôle éditorial)
 * - sinon règle automatique : ≤8 jours → publié, 9–21 jours → en préparation, au-delà → en préparation
 */
export function resolveEventPredictionsStatus(
  event: Event,
  now: Date = new Date(),
): EventPredictionsStatus {
  if (event.predictionsStatus === 'published' || event.predictionsStatus === 'preparing') {
    return event.predictionsStatus
  }

  const daysUntil = (new Date(event.date).getTime() - now.getTime()) / MS_PER_DAY
  if (daysUntil <= 8) return 'published'
  return 'preparing'
}

export function isEventPredictionsPublished(event: Event, now?: Date): boolean {
  return resolveEventPredictionsStatus(event, now) === 'published'
}

export function isEventPredictionsPreparing(event: Event, now?: Date): boolean {
  return resolveEventPredictionsStatus(event, now) === 'preparing'
}

export function predictionsStatusLabel(status: EventPredictionsStatus): string {
  return status === 'published' ? 'Pronostics disponibles' : 'Pronostics en préparation'
}
