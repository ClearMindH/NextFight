/** Début de l’événement — dimanche 16 juin 2026, 22h (Paris). */
export const UFC_FREEDOM_250_EVENT_START = new Date('2026-06-16T20:00:00.000Z')

/** Fin de visibilité bannière / countdown (jour après l’événement). */
export const UFC_FREEDOM_250_BANNER_END = new Date('2026-06-17T00:00:00.000Z')

export const EVENT_URGENCY_BANNER_HEIGHT_PX = 40

export function isEventUrgencyBannerActive(now: Date = new Date()): boolean {
  return now < UFC_FREEDOM_250_BANNER_END
}

export function isEventCountdownActive(now: Date = new Date()): boolean {
  return now < UFC_FREEDOM_250_BANNER_END
}
