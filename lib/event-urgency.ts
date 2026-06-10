/**
 * UFC Freedom 250 — heure de début de la carte principale.
 * Source officielle : https://www.ufc.com/event/ufc-freedom-250
 * Dimanche 14 juin 2026 · 20h00 EDT (Washington) = lundi 15 juin · 2h00 CEST (Paris).
 */
export const UFC_FREEDOM_250_EVENT_START = new Date('2026-06-15T00:00:00.000Z')

/** Fin de visibilité bannière / countdown (~4 h après le coup d’envoi). */
export const UFC_FREEDOM_250_BANNER_END = new Date('2026-06-15T04:00:00.000Z')

export const UFC_FREEDOM_250_DATE_LABEL = 'Dimanche 14 juin'
export const UFC_FREEDOM_250_TIME_LABEL = '20h00 EDT · 2h00 lundi (Paris)'
export const UFC_FREEDOM_250_EVENT_LABEL = `${UFC_FREEDOM_250_DATE_LABEL} · ${UFC_FREEDOM_250_TIME_LABEL}`

export const EVENT_URGENCY_BANNER_HEIGHT_PX = 40

export function isEventUrgencyBannerActive(now: Date = new Date()): boolean {
  return now < UFC_FREEDOM_250_BANNER_END
}

export function isEventCountdownActive(now: Date = new Date()): boolean {
  return now < UFC_FREEDOM_250_BANNER_END
}
