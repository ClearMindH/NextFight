export interface ConsultedPrediction {
  fightId: string
  eventId: string
  viewedAt: string
}

export interface FollowedEvent {
  eventId: string
  followedAt: string
}

export interface FavoriteFighter {
  fighterId: string
  addedAt: string
}

export interface UserActivityState {
  consultedPredictions: ConsultedPrediction[]
  followedEvents: FollowedEvent[]
  favoriteFighters: FavoriteFighter[]
}

export interface PersonalStats {
  predictionsViewed: number
  eventsFollowed: number
  favoritesCount: number
  viewsThisWeek: number
  picksSaved: number
  premiumAccuracy: number | null
}
