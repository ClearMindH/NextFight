import type { OrganizationId } from '@/types'

export interface ScrapedFighterRef {
  slug?: string
  fullName: string
  profileUrl?: string
  /** Classement division (1–15), extrait de la carte officielle si disponible. */
  ranking?: number
}

export interface ScrapedFight {
  red: ScrapedFighterRef
  blue: ScrapedFighterRef
  weightClass: string
  isTitle?: boolean
  isMainEvent?: boolean
  scheduledRounds?: number
  order?: number
}

export interface ScrapedEvent {
  sourceId: string
  organizationId: OrganizationId
  name: string
  date: string
  venue: string
  city: string
  country: string
  status: 'upcoming'
  fights: ScrapedFight[]
  scrapeUrl?: string
}

export interface EventSyncResult {
  events: ScrapedEvent[]
  warnings: string[]
}
