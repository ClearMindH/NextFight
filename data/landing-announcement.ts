export interface LandingAnnouncementItem {
  label: string
  href: string
  dateLabel: string
}

/** Bannière temporaire d'accueil — désactiver ou dépasser `expiresAt` pour la retirer. */
export const LANDING_ANNOUNCEMENT = {
  enabled: true,
  expiresAt: '2026-07-19T10:00:00.000Z',
  title: 'Pronostics Oklahoma City',
  description:
    'Les pronostics complets pour UFC Fight Night : Du Plessis vs Usman sont en ligne.',
  items: [
    {
      label: 'Du Plessis vs Usman',
      href: '/ufc-pronostics',
      dateLabel: 'Samedi 18 juillet · 20h00 EDT',
    },
  ] satisfies LandingAnnouncementItem[],
} as const

export function isLandingAnnouncementActive(now: Date = new Date()): boolean {
  if (!LANDING_ANNOUNCEMENT.enabled) return false
  return now.getTime() <= new Date(LANDING_ANNOUNCEMENT.expiresAt).getTime()
}
