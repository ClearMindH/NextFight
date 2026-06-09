import type { Fighter } from '@/types'
import { isValidImageSrc } from '@/lib/image-url'

/** Silhouette générique (toutes orgs) quand aucune photo roster */
export const FIGHTER_PORTRAIT_PLACEHOLDER = '/fighters/fighter-placeholder.svg'

/** Photos tierces (UFC, etc.) désactivées sur le site public. */
export const DISPLAY_FIGHTER_PHOTOS = false

export function hasFighterPortrait(fighter: Fighter): boolean {
  if (!DISPLAY_FIGHTER_PHOTOS) return false
  const url = fighter.imageUrl?.trim()
  return Boolean(url && isValidImageSrc(url))
}

export function isFighterPortraitPlaceholder(src: string): boolean {
  return src === FIGHTER_PORTRAIT_PLACEHOLDER || src.endsWith('/fighter-placeholder.svg')
}

export function getFighterPortraitUrl(fighter: Fighter): string {
  if (hasFighterPortrait(fighter)) return fighter.imageUrl!.trim()
  return FIGHTER_PORTRAIT_PLACEHOLDER
}

export function getFighterInitials(name: string): string {
  return name
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('')
}
