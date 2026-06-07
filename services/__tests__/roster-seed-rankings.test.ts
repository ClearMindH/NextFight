import { describe, expect, it } from 'vitest'
import { getSeedRanking, mergeSeedRanking } from '@/lib/roster-seed-rankings'
import type { Fighter } from '@/types'

const base: Fighter = {
  id: 'pfl-renan-ferreira',
  organizationId: 'pfl',
  name: 'Renan Ferreira',
  record: '14-2-0',
  wins: 14,
  losses: 2,
  draws: 0,
  country: 'Brazil',
  stats: {
    strikingAccuracy: 50,
    takedownAccuracy: 40,
    reachCm: 200,
    heightCm: 193,
    age: 30,
    winStreak: 0,
  },
  lastSyncedAt: '2026-01-01',
  source: 'merged',
}

describe('roster-seed-rankings', () => {
  it('returns champion seed for PFL heavyweight #1', () => {
    expect(getSeedRanking('pfl', 'Renan Ferreira')).toBe(1)
  })

  it('merges seed ranking when roster has none', () => {
    expect(mergeSeedRanking(base).ranking).toBe(1)
  })

  it('does not replace an existing top-15 ranking', () => {
    const ranked = { ...base, ranking: 3 }
    expect(mergeSeedRanking(ranked).ranking).toBe(3)
  })

  it('leaves unranked fighters without badge data', () => {
    const unranked = { ...base, name: 'Abraham Bably', id: 'pfl-abraham-bably' }
    expect(mergeSeedRanking(unranked).ranking).toBeUndefined()
  })

  it('does not apply LHW seed ranking when fighter is listed at heavyweight', () => {
    const pereiraHw: Fighter = {
      ...base,
      id: 'ufc-alex-pereira',
      organizationId: 'ufc',
      name: 'Alex Pereira',
      weightClass: 'Heavyweight',
    }
    expect(getSeedRanking('ufc', 'Alex Pereira', 'Heavyweight')).toBeUndefined()
    expect(getSeedRanking('ufc', 'Alex Pereira', 'Light Heavyweight')).toBe(1)
    expect(mergeSeedRanking(pereiraHw).ranking).toBeUndefined()
  })
})
