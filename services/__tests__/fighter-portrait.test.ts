import { describe, expect, it } from 'vitest'
import type { Fighter } from '@/types'
import {
  DISPLAY_FIGHTER_PHOTOS,
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

  it('does not expose UFC photos on the public site', () => {
    const withPhoto = { ...base, imageUrl: 'https://ufc.com/photo.jpg' }
    expect(DISPLAY_FIGHTER_PHOTOS).toBe(false)
    expect(getFighterPortraitUrl(withPhoto)).toBe(FIGHTER_PORTRAIT_PLACEHOLDER)
    expect(hasFighterPortrait(withPhoto)).toBe(false)
  })
})
