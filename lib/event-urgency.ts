/**
 * Carte UFC mise en avant — UFC Fight Night Oklahoma City.
 * Source : https://www.ufc.com/event/ufc-fight-night-july-18-2026
 * Samedi 18 juillet 2026 · 20h00 EDT = dimanche 19 juillet · 2h00 CEST (Paris).
 */
export const FEATURED_UFC_EVENT_ID = 'ufc-fight-night-july-18-2026'
export const FEATURED_UFC_FREE_FIGHT_ID = 'ufc-fight-night-july-18-2026-f2'

export const FEATURED_UFC_EVENT_START_ISO = '2026-07-19T00:00:00.000Z'

/** Fin de visibilité bannière rouge (fin de soirée événement, heure US). */
export const FEATURED_UFC_BANNER_END_ISO = '2026-07-19T10:00:00.000Z'

export const FEATURED_UFC_DATE_LABEL = 'Samedi 18 juillet'
export const FEATURED_UFC_TIME_LABEL = '20h00 EDT · 2h00 dimanche (Paris)'
export const FEATURED_UFC_EVENT_LABEL = `${FEATURED_UFC_DATE_LABEL} · ${FEATURED_UFC_TIME_LABEL}`

/** Libellés courts pour hero / CTA (sans recharger l'événement côté client). */
export const FEATURED_UFC_MAIN_EVENT_LABEL = 'Du Plessis vs Usman'
export const FEATURED_UFC_FREE_FIGHT_LABEL = 'Cannonier vs Duncan'

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

/** Affiche le countdown tant que la carte n'a pas commencé. */
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
