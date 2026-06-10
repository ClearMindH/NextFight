export interface LandingAnnouncementItem {
  label: string
  href: string
  dateLabel: string
}

/** Bannière temporaire d’accueil — désactiver ou dépasser `expiresAt` pour la retirer. */
export const LANDING_ANNOUNCEMENT = {
  enabled: true,
  expiresAt: '2026-06-15T12:00:00.000Z',
  title: 'Pronostics disponibles',
  description:
    'Nous venons de publier les pronostics complets pour les deux prochaines cartes.',
  items: [
    {
      label: 'UFC Freedom 250',
      href: '/ufc-pronostics',
      dateLabel: 'Dimanche 14 juin · 20h00 EDT',
    },
    {
      label: 'Hexagone MMA 45',
      href: '/hexagone-mma-pronostics',
      dateLabel: '12 juin',
    },
  ] satisfies LandingAnnouncementItem[],
} as const

export function isLandingAnnouncementActive(now: Date = new Date()): boolean {
  if (!LANDING_ANNOUNCEMENT.enabled) return false
  return now.getTime() <= new Date(LANDING_ANNOUNCEMENT.expiresAt).getTime()
}
