import { describe, it, expect } from 'vitest'
import { deriveFightResult } from '@/lib/derive-fight-result'
import type { Fighter } from '@/types'
import type { FighterRecentBout } from '@/types/recent-form'

function fighter(id: string, name: string, bouts: Partial<FighterRecentBout>[]): Fighter {
  return {
    id,
    name,
    recentBouts: bouts.map((b) => ({
      opponentName: b.opponentName ?? 'Unknown',
      result: b.result ?? 'win',
      method: b.method ?? 'decision',
      round: b.round,
      opponentTier: b.opponentTier ?? 50,
      monthsAgo: b.monthsAgo ?? 1,
    })),
  } as unknown as Fighter
}

const red = (bouts: Partial<FighterRecentBout>[]) => fighter('red-1', 'Belal Muhammad', bouts)
const blue = (bouts: Partial<FighterRecentBout>[]) => fighter('blue-1', 'Gabriel Bonfim', bouts)

describe('deriveFightResult', () => {
  it('déduit le vainqueur quand le coin rouge a battu le bleu', () => {
    const r = deriveFightResult(
      red([{ opponentName: 'Bonfim', result: 'win', monthsAgo: 1 }]),
      blue([]),
    )
    expect(r?.winnerId).toBe('red-1')
    expect(r?.source).toBe('recent-bouts')
  })

  it('déduit le vainqueur depuis le coin bleu seul', () => {
    const r = deriveFightResult(
      red([]),
      blue([{ opponentName: 'Muhammad', result: 'win', monthsAgo: 2 }]),
    )
    expect(r?.winnerId).toBe('blue-1')
  })

  it('renvoie null si les deux coins se contredisent', () => {
    const r = deriveFightResult(
      red([{ opponentName: 'Bonfim', result: 'win', monthsAgo: 1 }]),
      blue([{ opponentName: 'Muhammad', result: 'win', monthsAgo: 1 }]),
    )
    expect(r).toBeNull()
  })

  it('renvoie null si le bout est trop ancien', () => {
    const r = deriveFightResult(
      red([{ opponentName: 'Bonfim', result: 'win', monthsAgo: 18 }]),
      blue([]),
    )
    expect(r).toBeNull()
  })

  it('renvoie null sans combat correspondant', () => {
    const r = deriveFightResult(
      red([{ opponentName: 'Someone Else', result: 'win', monthsAgo: 1 }]),
      blue([]),
    )
    expect(r).toBeNull()
  })

  it('gère un nul (winnerId null) sans planter', () => {
    const r = deriveFightResult(
      red([{ opponentName: 'Bonfim', result: 'draw', monthsAgo: 1 }]),
      blue([]),
    )
    expect(r).not.toBeNull()
    expect(r?.winnerId).toBeNull()
  })
})
