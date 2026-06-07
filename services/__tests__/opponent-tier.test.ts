import { describe, it, expect } from 'vitest'
import { tierFromFighter, tierFromRecord } from '@/lib/opponent-tier'
import { tierFromExternalCounts } from '@/lib/external-opponent-tier'
import type { Fighter } from '@/types'

function fighter(p: {
  wins?: number
  losses?: number
  draws?: number
  ranking?: number
  winStreak?: number
  finishingRate?: number
}): Fighter {
  return {
    wins: p.wins,
    losses: p.losses,
    draws: p.draws,
    ranking: p.ranking,
    stats: {
      winStreak: p.winStreak ?? 0,
      finishingRate: p.finishingRate,
    },
  } as unknown as Fighter
}

describe('tierFromFighter', () => {
  it('classe le champion (#1) au sommet', () => {
    const t = tierFromFighter(fighter({ wins: 24, losses: 3, ranking: 1 }))
    expect(t).toBeGreaterThanOrEqual(92)
  })

  it('est monotone décroissant selon le rang', () => {
    const r1 = tierFromFighter(fighter({ wins: 20, losses: 2, ranking: 1 }))
    const r5 = tierFromFighter(fighter({ wins: 18, losses: 4, ranking: 5 }))
    const r15 = tierFromFighter(fighter({ wins: 14, losses: 6, ranking: 15 }))
    expect(r1).toBeGreaterThan(r5)
    expect(r5).toBeGreaterThan(r15)
  })

  it('garde un classé #15 au-dessus d’un journalier non classé', () => {
    const ranked15 = tierFromFighter(fighter({ wins: 14, losses: 6, ranking: 15 }))
    const journeyman = tierFromFighter(fighter({ wins: 8, losses: 9 }))
    expect(ranked15).toBeGreaterThan(journeyman)
    expect(ranked15).toBeGreaterThanOrEqual(66)
  })

  it('récompense un meilleur palmarès chez les non classés', () => {
    const strong = tierFromFighter(fighter({ wins: 18, losses: 1 }))
    const weak = tierFromFighter(fighter({ wins: 4, losses: 8 }))
    expect(strong).toBeGreaterThan(weak)
  })

  it('reste dans la plage 20–99', () => {
    const elite = tierFromFighter(fighter({ wins: 30, losses: 0, ranking: 1, winStreak: 12, finishingRate: 90 }))
    const poor = tierFromFighter(fighter({ wins: 0, losses: 12 }))
    expect(elite).toBeLessThanOrEqual(99)
    expect(poor).toBeGreaterThanOrEqual(20)
  })

  it('donne une note neutre sans palmarès', () => {
    const t = tierFromFighter(fighter({}))
    expect(t).toBeGreaterThan(40)
    expect(t).toBeLessThan(60)
  })
})

describe('tierFromRecord', () => {
  it('récompense un meilleur ratio victoires', () => {
    const strong = tierFromRecord({ wins: 20, losses: 1 })
    const weak = tierFromRecord({ wins: 5, losses: 10 })
    expect(strong).toBeGreaterThan(weak)
  })

  it('reste borné 20–99', () => {
    expect(tierFromRecord({ wins: 40, losses: 0, finishingRate: 95, winStreak: 15 })).toBeLessThanOrEqual(99)
    expect(tierFromRecord({ wins: 0, losses: 20 })).toBeGreaterThanOrEqual(20)
  })
})

describe('tierFromExternalCounts', () => {
  it('dérive un tier depuis un palmarès externe', () => {
    const t = tierFromExternalCounts({
      koWins: 6,
      subWins: 2,
      decWins: 2,
      koLosses: 0,
      subLosses: 1,
      decLosses: 0,
      wins: 10,
      losses: 1,
      source: 'sherdog',
    })
    expect(t).toBeGreaterThan(55)
    expect(t).toBeLessThanOrEqual(99)
  })

  it('note bas un palmarès négatif', () => {
    const t = tierFromExternalCounts({
      koWins: 1,
      subWins: 0,
      decWins: 1,
      koLosses: 4,
      subLosses: 2,
      decLosses: 2,
      wins: 2,
      losses: 8,
      source: 'sherdog',
    })
    expect(t).toBeLessThan(50)
  })
})
