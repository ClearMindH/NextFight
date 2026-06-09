import type { Organization } from '@/types'

export const organizations: Organization[] = [
  {
    id: 'ufc',
    name: 'UFC',
    fullName: 'Ultimate Fighting Championship',
    slug: 'ufc',
    seoPath: '/ufc-predictions',
    seoPathFr: '/ufc-pronostics',
    description: 'Global flagship MMA promotion with ranked divisions and championship belts.',
    descriptionFr:
      'La référence mondiale du MMA : divisions officielles, ceintures et cartes pay-per-view analysées par notre modèle statistique.',
  },
  {
    id: 'pfl',
    name: 'PFL',
    fullName: 'Professional Fighters League',
    slug: 'pfl',
    seoPath: '/pfl-predictions',
    seoPathFr: '/pfl-pronostics',
    description: 'Season format with regular-season points and playoff finals per weight class.',
    descriptionFr:
      'Format saisonnier avec points en phase régulière et finales par catégorie de poids — prédictions adaptées au système de qualification.',
  },
  {
    id: 'ksw',
    name: 'KSW',
    fullName: 'Konfrontacja Sztuk Walki',
    slug: 'ksw',
    seoPath: '/ksw-predictions',
    seoPathFr: '/ksw-pronostics',
    description: 'Europe’s leading promotion with stadium events and elite regional talent.',
    descriptionFr:
      'Leader européen du MMA : événements en stade et talents d’élite — analyses et pronostics pour chaque carte KSW.',
  },
  {
    id: 'ares',
    name: 'ARES',
    fullName: 'ARES Fighting Championship',
    slug: 'ares',
    seoPath: '/ares-predictions',
    seoPathFr: '/ares-pronostics',
    description: 'French promotion building continental stars with high-production cards.',
    descriptionFr:
      'Promotion française au rayonnement continental : cartes premium et étoiles montantes — pronostics ARES détaillés.',
  },
  {
    id: 'hexagone',
    name: 'Hexagone MMA',
    fullName: 'Hexagone MMA',
    slug: 'hexagone-mma',
    seoPath: '/hexagone-mma-predictions',
    seoPathFr: '/hexagone-mma-pronostics',
    description: 'French promotion with arena events and a growing European roster.',
    descriptionFr:
      'Promotion française : cartes en arène, talents locaux et internationaux — pronostics et analyses Hexagone MMA.',
  },
]

export function getOrganization(id: string): Organization | undefined {
  return organizations.find((o) => o.id === id || o.slug === id)
}

export function getOrganizationByFrenchPath(path: string): Organization | undefined {
  return organizations.find((o) => o.seoPathFr === path)
}
