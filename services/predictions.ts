import type { Prediction } from '@/types'

const STORAGE_KEY = 'nextfight:predictions:v1'

export function loadPredictions(): Prediction[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    return JSON.parse(raw) as Prediction[]
  } catch {
    return []
  }
}

export function savePredictions(predictions: Prediction[]): void {
  if (typeof window === 'undefined') return
  localStorage.setItem(STORAGE_KEY, JSON.stringify(predictions))
}

export function upsertPrediction(prediction: Prediction, existing: Prediction[]): Prediction[] {
  const next = existing.filter((p) => p.fightId !== prediction.fightId)
  next.push(prediction)
  savePredictions(next)
  return next
}

export function removePrediction(fightId: string, existing: Prediction[]): Prediction[] {
  const next = existing.filter((p) => p.fightId !== fightId)
  savePredictions(next)
  return next
}
