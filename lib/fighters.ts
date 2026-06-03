import { getFighterById, getFightersByOrg } from '@/lib/rosters'
import type { Fighter } from '@/types'

export function getFeaturedFighters(): { red: Fighter; blue: Fighter } {
  const red = getFighterById('ufc-jon-jones')
  const blue = getFighterById('ufc-tom-aspinall')
  if (!red || !blue) {
    const ufc = getFightersByOrg('ufc')
    return { red: ufc[0], blue: ufc[1] }
  }
  return { red, blue }
}
