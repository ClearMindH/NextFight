import { describe, expect, it } from 'vitest'
import {
  getDivisionRankingBadge,
  isTopRankedInDivision,
} from '@/lib/fighter-ranking'

describe('fighter-ranking', () => {
  it('accepts ranks 1–15 only', () => {
    expect(isTopRankedInDivision(1)).toBe(true)
    expect(isTopRankedInDivision(15)).toBe(true)
    expect(isTopRankedInDivision(16)).toBe(false)
    expect(isTopRankedInDivision(undefined)).toBe(false)
  })

  it('formats badge labels', () => {
    expect(getDivisionRankingBadge(1)).toBe('#1')
    expect(getDivisionRankingBadge(1, true)).toBe('C')
    expect(getDivisionRankingBadge(8)).toBe('#8')
    expect(getDivisionRankingBadge(20)).toBeNull()
  })
})
