import { organizations } from '@/data/organizations'

/** Routes fréquentes — préchargées au repos pour navigation instantanée. */
export const PREFETCH_ROUTES = [
  '/',
  '/pricing',
  '/resultats',
  '/login',
  '/account',
  '/contact',
  ...organizations.map((o) => o.seoPathFr),
] as const
