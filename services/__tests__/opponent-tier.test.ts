import { describe, expect, it } from 'vitest'
import { resolveOpponentTier } from '@/lib/opponent-tier'

describe('opponent-tier', () => {
  it('resolves last-name match in same division', () => {
    const tier = resolveOpponentTier('Frevola', 'Lightweight')
    expect(tier).toBeGreaterThan(55)
  })

  it('resolves Davis in lightweight context', () => {
    const tier = resolveOpponentTier('Davis', 'Lightweight')
    expect(tier).toBeGreaterThanOrEqual(55)
  })
})
