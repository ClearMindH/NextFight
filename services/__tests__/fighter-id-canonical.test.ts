import { describe, expect, it } from 'vitest'
import {
  canonicalizeFighterId,
  normalizeUfcAthleteSlug,
  slugMatchesFighterName,
} from '@/lib/fighter-id-canonical'

describe('fighter-id-canonical', () => {
  it('maps known UFC typo slug to canonical athlete slug', () => {
    expect(normalizeUfcAthleteSlug('etomen-shiyahashian', 'Edmen Shahbazyan')).toBe(
      'edmen-shahbazyan',
    )
    expect(canonicalizeFighterId('ufc-etomen-shiyahashian')).toBe('ufc-edmen-shahbazyan')
  })

  it('detects slug mismatch vs fighter name', () => {
    expect(slugMatchesFighterName('etomen-shiyahashian', 'Edmen Shahbazyan')).toBe(true)
    expect(slugMatchesFighterName('brendan-allen', 'Brendan Allen')).toBe(true)
    expect(slugMatchesFighterName('etomen-shiyahashian', 'Brendan Allen')).toBe(false)
  })
})
