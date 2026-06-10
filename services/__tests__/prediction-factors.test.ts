import { describe, expect, it } from 'vitest'
import { getPredictionKeyFactors } from '@/lib/prediction-factors'
import type { Fight, Fighter } from '@/types'

function hexFighter(
  id: string,
  name: string,
  record: string,
  wins: number,
  losses: number,
  finishingRate: number,
): Fighter {
  return {
    id,
    name,
    record,
    wins,
    losses,
    draws: 0,
    country: 'France',
    weightClass: 'Flyweight',
    stats: {
      strikingAccuracy: 50,
      takedownAccuracy: 40,
      strikeDefense: 55,
      takedownDefense: 55,
      finishingRate,
      winStreak: 0,
    },
  }
}

function baseFight(red: Fighter, blue: Fighter): Fight {
  return {
    id: 'test-fight',
    eventId: 'test-event',
    order: 2,
    weightClass: 'Flyweight',
    isTitle: false,
    isMainEvent: false,
    scheduledRounds: 3,
    redCorner: red,
    blueCorner: blue,
    model: {
      redWinProbability: 57,
      confidence: 56,
      breakdown: {
        red: {
          compositeScore: 0.55,
          striking: 0.5,
          grappling: 0.5,
          physical: 0.5,
          momentum: 0.55,
          schedule: 0.5,
          recentForm: 0.45,
        },
        blue: {
          compositeScore: 0.52,
          striking: 0.5,
          grappling: 0.5,
          physical: 0.5,
          momentum: 0.58,
          schedule: 0.5,
          recentForm: 0.62,
        },
      },
    },
  }
}

describe('getPredictionKeyFactors', () => {
  it('favorise Sima (3-0) sur dynamique récente vs Barbosa (11-7)', () => {
    const fight = baseFight(
      hexFighter('hexagone-samba-sima', 'Samba Sima', '3-0-0', 3, 0, 100),
      hexFighter(
        'hexagone-leonardo-de-oliveira-barbosa',
        'Leonardo de Oliveira Barbosa',
        '11-7-0',
        11,
        7,
        82,
      ),
    )

    const factors = getPredictionKeyFactors(fight)
    const form = factors.find((f) => f.label === 'Dynamique récente')

    expect(form).toBeDefined()
    expect(form!.leaderName).toBe('Sima')
    expect(form!.leaderCorner).toBe('red')
    expect(form!.edge).toBeGreaterThanOrEqual(4)
  })

  it('favorise Sima sur KO power avec finishingRate 100 vs 82', () => {
    const fight = baseFight(
      hexFighter('hexagone-samba-sima', 'Samba Sima', '3-0-0', 3, 0, 100),
      hexFighter(
        'hexagone-leonardo-de-oliveira-barbosa',
        'Leonardo de Oliveira Barbosa',
        '11-7-0',
        11,
        7,
        82,
      ),
    )

    const factors = getPredictionKeyFactors(fight)
    const ko = factors.find((f) => f.label === 'KO power')

    expect(ko).toBeDefined()
    expect(ko!.leaderName).toBe('Sima')
  })

  it('ignore précision/défense quand les stats sont des placeholders identiques', () => {
    const fight = baseFight(
      hexFighter('a', 'Fighter A', '3-0-0', 3, 0, 100),
      hexFighter('b', 'Fighter B', '11-7-0', 11, 7, 82),
    )

    const factors = getPredictionKeyFactors(fight)
    const labels = factors.map((f) => f.label)

    expect(labels).not.toContain('Précision de frappe')
    expect(labels).not.toContain('Défense')
  })
})
