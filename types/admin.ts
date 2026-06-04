import type { OrganizationId } from '@/types'
import type { PlanId, SubscriptionStatus } from '@/types/subscription'

export interface FightInput {
  id: string
  eventId: string
  order: number
  weightClass: string
  isTitle: boolean
  isMainEvent: boolean
  scheduledRounds: number
  redId: string
  blueId: string
}

export interface EventInput {
  id: string
  organizationId: OrganizationId
  name: string
  date: string
  venue: string
  city: string
  country: string
  status: 'upcoming' | 'live' | 'completed'
  predictionsStatus?: 'published' | 'preparing'
  communityPredictions: number
  fights: FightInput[]
}

export interface EventsStoreFile {
  events: EventInput[]
  updatedAt: string
}

export interface FighterUpsertPayload {
  id?: string
  organizationId: OrganizationId
  name: string
  nickname?: string
  record: string
  wins: number
  losses: number
  draws: number
  country: string
  weightClass?: string
  ranking?: number
  /** URL https ou chemin local ex. /fighters/jones.jpg (fichier dans public/) */
  imageUrl?: string
  stats: {
    strikingAccuracy: number
    strikeDefense?: number
    takedownAccuracy: number
    takedownDefense?: number
    reachCm: number
    heightCm: number
    age: number
    winStreak: number
    finishingRate?: number
    strengthOfSchedule?: number
  }
}

export interface SubscriptionAdminUpdate {
  email: string
  plan: PlanId
  status: SubscriptionStatus
}
