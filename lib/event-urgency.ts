/**
 * UFC Freedom 250 — heure de début de la carte principale.
 * Source officielle : https://www.ufc.com/event/ufc-freedom-250
 * Dimanche 14 juin 2026 · 20h00 EDT (Washington) = lundi 15 juin · 2h00 CEST (Paris).
 */
export const UFC_FREEDOM_250_EVENT_START_ISO = '2026-06-15T00:00:00.000Z'

/** Fin de visibilité bannière rouge (fin de soirée événement, heure US). */
export const UFC_FREEDOM_250_BANNER_END_ISO = '2026-06-15T08:00:00.000Z'

export const UFC_FREEDOM_250_DATE_LABEL = 'Dimanche 14 juin'
export const UFC_FREEDOM_250_TIME_LABEL = '20h00 EDT · 2h00 lundi (Paris)'
export const UFC_FREEDOM_250_EVENT_LABEL = `${UFC_FREEDOM_250_DATE_LABEL} · ${UFC_FREEDOM_250_TIME_LABEL}`

export const EVENT_URGENCY_BANNER_HEIGHT_PX = 40

export function getUfcFreedom250EventStart(): Date {
  return new Date(UFC_FREEDOM_250_EVENT_START_ISO)
}

export function getUfcFreedom250BannerEnd(): Date {
  return new Date(UFC_FREEDOM_250_BANNER_END_ISO)
}

/** @deprecated Préférer getUfcFreedom250EventStart() — conservé pour imports existants. */
export const UFC_FREEDOM_250_EVENT_START = getUfcFreedom250EventStart()

/** @deprecated Préférer getUfcFreedom250BannerEnd(). */
export const UFC_FREEDOM_250_BANNER_END = getUfcFreedom250BannerEnd()

export function isEventUrgencyBannerActive(now: Date = new Date()): boolean {
  return now.getTime() < getUfcFreedom250BannerEnd().getTime()
}

/** Affiche le countdown tant que la carte n’a pas commencé. */
export function isEventCountdownActive(now: Date = new Date()): boolean {
  return now.getTime() < getUfcFreedom250EventStart().getTime()
}
