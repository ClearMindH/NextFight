/**
 * Carte UFC mise en avant — UFC 329 (McGregor vs Holloway 2).
 * Source : https://www.ufc.com/event/ufc-329
 * Samedi 11 juillet 2026 · 21h00 EDT = dimanche 12 juillet · 3h00 CEST (Paris).
 */
export const FEATURED_UFC_EVENT_ID = 'ufc-329'
export const FEATURED_UFC_FREE_FIGHT_ID = 'ufc-329-f2'

export const FEATURED_UFC_EVENT_START_ISO = '2026-07-12T01:00:00.000Z'

/** Fin de visibilité bannière rouge (fin de soirée événement, heure US). */
export const FEATURED_UFC_BANNER_END_ISO = '2026-07-12T10:00:00.000Z'

export const FEATURED_UFC_DATE_LABEL = 'Samedi 11 juillet'
export const FEATURED_UFC_TIME_LABEL = '21h00 EDT · 3h00 dimanche (Paris)'
export const FEATURED_UFC_EVENT_LABEL = `${FEATURED_UFC_DATE_LABEL} · ${FEATURED_UFC_TIME_LABEL}`

export const EVENT_URGENCY_BANNER_HEIGHT_PX = 40

export function getFeaturedUfcEventStart(): Date {
  return new Date(FEATURED_UFC_EVENT_START_ISO)
}

export function getFeaturedUfcBannerEnd(): Date {
  return new Date(FEATURED_UFC_BANNER_END_ISO)
}

export function isEventUrgencyBannerActive(now: Date = new Date()): boolean {
  return now.getTime() < getFeaturedUfcBannerEnd().getTime()
}

/** Affiche le countdown tant que la carte n’a pas commencé. */
export function isEventCountdownActive(now: Date = new Date()): boolean {
  return now.getTime() < getFeaturedUfcEventStart().getTime()
}

/** @deprecated Préférer FEATURED_UFC_* — conservé pour imports existants. */
export const UFC_FREEDOM_250_EVENT_START_ISO = FEATURED_UFC_EVENT_START_ISO
export const UFC_FREEDOM_250_BANNER_END_ISO = FEATURED_UFC_BANNER_END_ISO
export const UFC_FREEDOM_250_DATE_LABEL = FEATURED_UFC_DATE_LABEL
export const UFC_FREEDOM_250_TIME_LABEL = FEATURED_UFC_TIME_LABEL
export const UFC_FREEDOM_250_EVENT_LABEL = FEATURED_UFC_EVENT_LABEL
export const getUfcFreedom250EventStart = getFeaturedUfcEventStart
export const getUfcFreedom250BannerEnd = getFeaturedUfcBannerEnd
export const UFC_FREEDOM_250_EVENT_START = getFeaturedUfcEventStart()
export const UFC_FREEDOM_250_BANNER_END = getFeaturedUfcBannerEnd()
