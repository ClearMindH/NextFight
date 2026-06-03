import type {
  ConsultedPrediction,
  FavoriteFighter,
  FollowedEvent,
  UserActivityState,
} from '@/types/user-activity'

const STORAGE_KEY = 'nextfight:user-activity:v1'

const EMPTY: UserActivityState = {
  consultedPredictions: [],
  followedEvents: [],
  favoriteFighters: [],
}

export function loadUserActivity(): UserActivityState {
  if (typeof window === 'undefined') return { ...EMPTY }
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return { ...EMPTY }
    const parsed = JSON.parse(raw) as UserActivityState
    return {
      consultedPredictions: parsed.consultedPredictions ?? [],
      followedEvents: parsed.followedEvents ?? [],
      favoriteFighters: parsed.favoriteFighters ?? [],
    }
  } catch {
    return { ...EMPTY }
  }
}

export function saveUserActivity(state: UserActivityState): void {
  if (typeof window === 'undefined') return
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
}

export function recordPredictionView(
  fightId: string,
  eventId: string,
  state: UserActivityState,
): UserActivityState {
  const filtered = state.consultedPredictions.filter((p) => p.fightId !== fightId)
  const entry: ConsultedPrediction = { fightId, eventId, viewedAt: new Date().toISOString() }
  const consultedPredictions = [entry, ...filtered].slice(0, 50)
  const next = { ...state, consultedPredictions }
  saveUserActivity(next)
  return next
}

export function toggleFollowedEvent(
  eventId: string,
  state: UserActivityState,
): UserActivityState {
  const exists = state.followedEvents.some((e) => e.eventId === eventId)
  const followedEvents = exists
    ? state.followedEvents.filter((e) => e.eventId !== eventId)
    : [{ eventId, followedAt: new Date().toISOString() }, ...state.followedEvents]
  const next = { ...state, followedEvents }
  saveUserActivity(next)
  return next
}

export function toggleFavoriteFighter(
  fighterId: string,
  state: UserActivityState,
): UserActivityState {
  const exists = state.favoriteFighters.some((f) => f.fighterId === fighterId)
  const favoriteFighters = exists
    ? state.favoriteFighters.filter((f) => f.fighterId !== fighterId)
    : [{ fighterId, addedAt: new Date().toISOString() }, ...state.favoriteFighters]
  const next = { ...state, favoriteFighters }
  saveUserActivity(next)
  return next
}

export function isEventFollowed(eventId: string, state: UserActivityState): boolean {
  return state.followedEvents.some((e) => e.eventId === eventId)
}

export function isFighterFavorite(fighterId: string, state: UserActivityState): boolean {
  return state.favoriteFighters.some((f) => f.fighterId === fighterId)
}
