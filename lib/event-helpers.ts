import type { Event, Fight } from '@/types'

/** Main event (order 1 / isMainEvent). */
export function getMainFight(event: Event): Fight | undefined {
  const sorted = sortFightsByCardOrder(event)
  return sorted.find((f) => f.isMainEvent) ?? sorted[0]
}

/**
 * Co-main : second combat le plus haut sur la carte (order 2 après tri).
 * C’est le pronostic exposé en gratuit pour les non-abonnés.
 */
export function getCoMainFight(event: Event): Fight | undefined {
  const sorted = sortFightsByCardOrder(event)
  if (sorted.length >= 2) return sorted[1]
  return sorted[0]
}

/** Combat accessible sans abonnement Premium. */
export function getFreePreviewFight(event: Event): Fight | undefined {
  return getCoMainFight(event)
}

export function sortFightsByCardOrder(event: Event): Fight[] {
  return [...event.fights].sort((a, b) => a.order - b.order)
}

export function isMainEventFight(event: Event, fight: Fight): boolean {
  const main = getMainFight(event)
  return main?.id === fight.id
}
