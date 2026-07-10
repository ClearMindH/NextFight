import { describe, expect, it } from 'vitest'
import { loadEventsHydrated } from '@/lib/events-store'
import {
  buildMatchupAdvantage,
  buildPredictionAdjustment,
  detectFactorVerdictMismatch,
} from '@/lib/prediction-adjustment'
import { getPredictionKeyFactors } from '@/lib/prediction-factors'
import { PredictionEngine } from '@/services/PredictionEngine'

function findFight(id: string) {
  const fight = loadEventsHydrated()
    .flatMap((event) => event.fights)
    .find((item) => item.id === id)
  if (!fight) throw new Error(`Fight not found: ${id}`)
  return fight
}

describe('prediction-adjustment', () => {
  it.skip('affiche une lecture matchup pour Pereira vs Gane', () => {
    const fight = findFight('ufc-freedom-250-f2')
    expect(fight.model.adjustmentNote).toMatch(/Notre lecture du matchup :/)
    expect(fight.model.adjustmentNote).toMatch(/Gane/)
    expect(fight.model.adjustmentNote).not.toMatch(/cotes marché/i)
  })

  it.skip('affiche une lecture matchup pour O\'Malley vs Zahabi', () => {
    const fight = findFight('ufc-freedom-250-f3')
    expect(fight.model.adjustmentNote).toMatch(/O'Malley/)
    expect(fight.model.adjustmentNote).toMatch(/Zahabi/)
    expect(fight.model.adjustmentNote).not.toMatch(/bookmaker|cotes marché/i)
  })

  it.skip('affiche une lecture matchup pour Nickal vs Daukaus sans facteur matchup', () => {
    const fight = findFight('ufc-freedom-250-f6')
    const raw = PredictionEngine.predict({
      fighterA: fight.redCorner,
      fighterB: fight.blueCorner,
      scheduledRounds: fight.scheduledRounds,
    })
    const adjustment = buildPredictionAdjustment(fight, raw.fighterAProbability)

    expect(adjustment?.kind).toBe('matchup')
    expect(adjustment?.note).toMatch(/Nickal/)
    expect(adjustment?.note).toMatch(/lutte|grappling|transitions|au sol/i)
    expect(adjustment?.note).not.toMatch(/cotes marché/i)

    const factors = getPredictionKeyFactors(fight)
    expect(factors.some((factor) => factor.label === 'Avantage matchup')).toBe(false)
  })

  it.skip('ajoute un avantage matchup pour les combats en décalage facteurs / pronostic', () => {
    for (const fightId of [
      'ufc-freedom-250-f2',
      'ufc-freedom-250-f3',
      'ufc-freedom-250-f7',
    ]) {
      const fight = findFight(fightId)
      const statFactors = getPredictionKeyFactors(fight).filter(
        (factor) => factor.label !== 'Avantage matchup',
      )
      const mismatch = detectFactorVerdictMismatch(
        fight,
        statFactors.map((factor) => factor.leaderCorner),
      )
      const factors = getPredictionKeyFactors(fight)
      const matchup = factors.find((factor) => factor.label === 'Avantage matchup')

      expect(mismatch).toBe(true)
      expect(matchup).toBeDefined()
      expect(matchup!.detail).toBeTruthy()
      expect(factors[0]?.label).toBe('Avantage matchup')
    }
  })

  it.skip('affiche une lecture matchup pour Topuria, Hokit et Ruffy même sans gros écart marché', () => {
    for (const fightId of [
      'ufc-freedom-250-f1',
      'ufc-freedom-250-f4',
      'ufc-freedom-250-f5',
    ]) {
      const fight = findFight(fightId)
      expect(fight.model.adjustmentNote).toMatch(/Notre lecture du matchup :/)
      expect(fight.model.adjustmentNote).not.toMatch(/cotes marché/i)
    }
  })

  it.skip('construit un avantage matchup pour Gane avec raison éditoriale', () => {
    const fight = findFight('ufc-freedom-250-f2')
    const statCorners = getPredictionKeyFactors(fight)
      .filter((factor) => factor.label !== 'Avantage matchup')
      .map((factor) => factor.leaderCorner)
    const matchup = buildMatchupAdvantage(fight, statCorners)

    expect(matchup?.leaderName).toBe('Gane')
    expect(matchup?.leaderCorner).toBe('blue')
    expect(matchup?.detail).toMatch(/mobilité|distance/i)
  })
})
