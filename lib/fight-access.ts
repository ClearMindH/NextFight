import {
  getFreePreviewFight,
  getMainFight,
  isMainEventFight,
} from '@/lib/event-helpers'
import type { Event, Fight } from '@/types'

/** Pronostic complet (modèle + stats + breakdown) pour ce combat. */
export function canAccessFightPrediction(
  fight: Fight,
  event: Event,
  isPremium: boolean,
): boolean {
  if (isPremium) return true
  const freeFight = getFreePreviewFight(event)
  return freeFight?.id === fight.id
}

export function getFightAccessMessage(
  fight: Fight,
  event: Event,
  isPremium: boolean,
): string | null {
  if (canAccessFightPrediction(fight, event, isPremium)) return null
  if (isMainEventFight(event, fight)) {
    const free = getFreePreviewFight(event)
    if (free) {
      return `Le pronostic du main event est réservé aux abonnés Premium. Consultez gratuitement le co-main : ${free.redCorner.name} vs ${free.blueCorner.name}.`
    }
    return 'Ce combat est réservé aux abonnés Premium.'
  }
  return 'Ce combat est réservé aux abonnés Premium. Le pronostic gratuit couvre le co-main de la carte.'
}

export { getMainFight, getFreePreviewFight }
