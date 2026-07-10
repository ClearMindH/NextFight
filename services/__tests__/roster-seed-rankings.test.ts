import { describe, expect, it } from 'vitest'
import { getSeedRanking, mergeSeedRanking } from '@/lib/roster-seed-rankings'
import type { Fighter } from '@/types'

const base: Fighter = {
  id: 'ufc-jon-jones',
  organizationId: 'ufc',
  name: 'Jon Jones',
  record: '28-1-0',
  wins: 28,
  losses: 1,
  draws: 0,
  country: 'USA',
  weightClass: 'Heavyweight',
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
  it('returns champion seed for UFC heavyweight #1', () => {
    expect(getSeedRanking('ufc', 'Jon Jones', 'Heavyweight')).toBe(1)
  })

  it('merges seed ranking when roster has none', () => {
    expect(mergeSeedRanking(base).ranking).toBe(1)
  })

  it('does not replace an existing top-15 ranking', () => {
    const ranked = { ...base, ranking: 3 }
    expect(mergeSeedRanking(ranked).ranking).toBe(3)
  })

  it('leaves unranked fighters without badge data', () => {
    const unranked = { ...base, name: 'Unknown Fighter', id: 'ufc-unknown-fighter' }
    expect(mergeSeedRanking(unranked).ranking).toBeUndefined()
  })

  it('does not apply LHW seed ranking when fighter is listed at heavyweight', () => {
    const pereiraHw: Fighter = {
      ...base,
      id: 'ufc-alex-pereira',
      name: 'Alex Pereira',
      weightClass: 'Heavyweight',
    }
    expect(getSeedRanking('ufc', 'Alex Pereira', 'Heavyweight')).toBeUndefined()
    expect(getSeedRanking('ufc', 'Alex Pereira', 'Light Heavyweight')).toBe(1)
    expect(mergeSeedRanking(pereiraHw).ranking).toBeUndefined()
  })
})
