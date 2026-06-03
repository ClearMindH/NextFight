'use client'

import { useCallback, useEffect, useState } from 'react'
import type { Prediction } from '@/types'
import {
  loadPredictions,
  removePrediction as removeStored,
  upsertPrediction as upsertStored,
} from '@/services/predictions'

export function usePredictions() {
  const [predictions, setPredictions] = useState<Prediction[]>([])
  const [ready, setReady] = useState(false)

  useEffect(() => {
    setPredictions(loadPredictions())
    setReady(true)
  }, [])

  const upsertPrediction = useCallback((prediction: Prediction) => {
    setPredictions((prev) => upsertStored(prediction, prev))
  }, [])

  const removePrediction = useCallback((fightId: string) => {
    setPredictions((prev) => removeStored(fightId, prev))
  }, [])

  const getByFight = useCallback(
    (fightId: string) => predictions.find((p) => p.fightId === fightId),
    [predictions],
  )

  return { predictions, upsertPrediction, removePrediction, getByFight, ready }
}
