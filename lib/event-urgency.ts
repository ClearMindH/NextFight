/** Fin de visibilité de la bannière UFC Freedom 250 (jour après l’événement). */
export const UFC_FREEDOM_250_BANNER_END = new Date('2026-06-16T00:00:00.000Z')

export const EVENT_URGENCY_BANNER_HEIGHT_PX = 40

export function isEventUrgencyBannerActive(now: Date = new Date()): boolean {
  return now < UFC_FREEDOM_250_BANNER_END
}
