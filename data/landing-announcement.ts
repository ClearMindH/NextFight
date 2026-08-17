export interface LandingAnnouncementItem {
  label: string
  href: string
  dateLabel: string
}

/** Bannière temporaire d'accueil — désactiver ou dépasser `expiresAt` pour la retirer. */
export const LANDING_ANNOUNCEMENT = {
  enabled: true,
  expiresAt: '2026-08-23T10:00:00.000Z',
  title: 'Pronostics Sacramento',
  description:
    'Les pronostics complets pour UFC Fight Night : Hernandez vs Rodrigues sont en ligne.',
  items: [
    {
      label: 'Hernandez vs Rodrigues',
      href: '/ufc-pronostics',
      dateLabel: 'Samedi 22 août · 20h00 EDT',
    },
  ] satisfies LandingAnnouncementItem[],
} as const

export function isLandingAnnouncementActive(now: Date = new Date()): boolean {
  if (!LANDING_ANNOUNCEMENT.enabled) return false
  return now.getTime() <= new Date(LANDING_ANNOUNCEMENT.expiresAt).getTime()
}
