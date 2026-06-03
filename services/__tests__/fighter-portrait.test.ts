import { describe, expect, it } from 'vitest'
import type { Fighter } from '@/types'
import {
  FIGHTER_PORTRAIT_PLACEHOLDER,
  getFighterPortraitUrl,
  hasFighterPortrait,
} from '@/lib/fighter-portrait'

const base: Fighter = {
  id: 'test-1',
  name: 'Test Fighter',
  orgId: 'ufc',
  weightClass: 'Lightweight',
  record: '10-2-0',
  country: 'FR',
  stance: 'Orthodox',
  reachCm: 180,
  heightCm: 175,
  age: 28,
  source: 'roster',
}

describe('fighter-portrait', () => {
  it('uses placeholder when imageUrl is missing', () => {
    expect(getFighterPortraitUrl(base)).toBe(FIGHTER_PORTRAIT_PLACEHOLDER)
    expect(hasFighterPortrait(base)).toBe(false)
  })

  it('uses roster image when imageUrl is set', () => {
    const withPhoto = { ...base, imageUrl: 'https://ufc.com/photo.jpg' }
    expect(getFighterPortraitUrl(withPhoto)).toBe('https://ufc.com/photo.jpg')
    expect(hasFighterPortrait(withPhoto)).toBe(true)
  })
})
