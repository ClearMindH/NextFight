import { describe, it, expect } from 'vitest'
import { scoreFight, summarize, getTrackRecord } from '@/lib/track-record'
import type { Event, Fight, OrganizationId } from '@/types'

function fight(
  id: string,
  opts: {
    predicted?: string
    actual?: string | null
    confidence?: number
  },
): Pick<Fight, 'id' | 'eventId' | 'predictionSnapshot' | 'result'> {
  const { predicted, actual, confidence = 70 } = opts
  return {
    id,
    eventId: 'evt-1',
    predictionSnapshot: predicted
      ? {
          predictedWinnerId: predicted,
          redWinProbability: confidence,
          confidence,
          capturedAt: '2026-01-01T00:00:00.000Z',
        }
      : undefined,
    result: actual !== undefined ? { winnerId: actual } : undefined,
  }
}

function event(
  id: string,
  organizationId: OrganizationId,
  fights: ReturnType<typeof fight>[],
): Pick<Event, 'id' | 'organizationId' | 'fights'> {
  return { id, organizationId, fights: fights as unknown as Fight[] }
}

describe('scoreFight', () => {
  it('note un pronostic correct', () => {
    const s = scoreFight(fight('f1', { predicted: 'a', actual: 'a' }), 'ufc')
    expect(s?.correct).toBe(true)
  })

  it('note un pronostic raté', () => {
    const s = scoreFight(fight('f1', { predicted: 'a', actual: 'b' }), 'ufc')
    expect(s?.correct).toBe(false)
  })

  it('ignore un combat sans pronostic figé', () => {
    expect(scoreFight(fight('f1', { actual: 'a' }), 'ufc')).toBeNull()
  })

  it('ignore un combat sans résultat', () => {
    expect(scoreFight(fight('f1', { predicted: 'a' }), 'ufc')).toBeNull()
  })

  it('ignore un nul (winnerId null)', () => {
    expect(scoreFight(fight('f1', { predicted: 'a', actual: null }), 'ufc')).toBeNull()
  })
})

describe('summarize', () => {
  it('calcule la précision', () => {
    const events = [
      event('e1', 'ufc', [
        fight('f1', { predicted: 'a', actual: 'a' }),
        fight('f2', { predicted: 'a', actual: 'b' }),
        fight('f3', { predicted: 'a', actual: 'a' }),
        fight('f4', { actual: 'a' }), // non noté
      ]),
    ]
    const tr = getTrackRecord(events)
    expect(tr.summary.total).toBe(3)
    expect(tr.summary.correct).toBe(2)
    expect(tr.summary.accuracy).toBe(67)
  })

  it('renvoie 0 sans combat noté', () => {
    expect(summarize([])).toEqual({ total: 0, correct: 0, accuracy: 0 })
  })
})

describe('getTrackRecord', () => {
  it('ventile par organisation et par confiance', () => {
    const events = [
      event('e1', 'ufc', [fight('f1', { predicted: 'a', actual: 'a', confidence: 85 })]),
      event('e2', 'ufc', [fight('f2', { predicted: 'a', actual: 'b', confidence: 55 })]),
    ]
    const tr = getTrackRecord(events)
    expect(tr.byOrg.ufc?.accuracy).toBe(50)
    const strong = tr.byConfidence.find((b) => b.label === 'Forte conviction')
    expect(strong?.total).toBe(1)
    expect(strong?.correct).toBe(1)
  })
})
