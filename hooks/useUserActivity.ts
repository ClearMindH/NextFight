'use client'

import { useCallback, useEffect, useState } from 'react'
import type { UserActivityState } from '@/types/user-activity'
import {
  loadUserActivity,
  recordPredictionView,
  toggleFavoriteFighter,
  toggleFollowedEvent,
  isEventFollowed,
  isFighterFavorite,
} from '@/services/user-activity'

export function useUserActivity() {
  const [activity, setActivity] = useState<UserActivityState>({
    consultedPredictions: [],
    followedEvents: [],
    favoriteFighters: [],
  })
  const [ready, setReady] = useState(false)

  useEffect(() => {
    setActivity(loadUserActivity())
    setReady(true)
  }, [])

  const trackPredictionView = useCallback((fightId: string, eventId: string) => {
    setActivity((prev) => recordPredictionView(fightId, eventId, prev))
  }, [])

  const toggleEventFollow = useCallback((eventId: string) => {
    setActivity((prev) => toggleFollowedEvent(eventId, prev))
  }, [])

  const toggleFighterFavorite = useCallback((fighterId: string) => {
    setActivity((prev) => toggleFavoriteFighter(fighterId, prev))
  }, [])

  const checkEventFollowed = useCallback(
    (eventId: string) => isEventFollowed(eventId, activity),
    [activity],
  )

  const checkFighterFavorite = useCallback(
    (fighterId: string) => isFighterFavorite(fighterId, activity),
    [activity],
  )

  return {
    activity,
    ready,
    trackPredictionView,
    toggleEventFollow,
    toggleFighterFavorite,
    isEventFollowed: checkEventFollowed,
    isFighterFavorite: checkFighterFavorite,
  }
}
