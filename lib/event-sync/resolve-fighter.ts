import {
  canonicalizeFighterId,
  normalizeUfcAthleteSlug,
  slugMatchesFighterName,
} from '@/lib/fighter-id-canonical'
import { slugifyId } from '@/lib/mappers/ufc-api'
import { loadRoster } from '@/lib/roster-store'
import type { OrganizationId } from '@/types'
import type { ScrapedFighterRef } from './types'

function normalizeName(name: string): string {
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]/g, '')
}

function slugFromProfileUrl(url: string): string | undefined {
  const match = url.match(/\/athlete\/([^/?#]+)/i)
  return match?.[1]
}

export function resolveFighterId(
  orgId: OrganizationId,
  ref: ScrapedFighterRef,
): string | null {
  const roster = loadRoster(orgId)
  const prefix = `${orgId}-`

  const target = normalizeName(ref.fullName)
  const exact = roster.fighters.find((f) => normalizeName(f.name) === target)
  if (exact) return canonicalizeFighterId(exact.id)

  const rawSlugs = [
    ref.slug,
    ref.profileUrl ? slugFromProfileUrl(ref.profileUrl) : undefined,
  ].filter((s): s is string => Boolean(s))

  const slugCandidates = [
    ...rawSlugs.map((s) =>
      orgId === 'ufc' ? normalizeUfcAthleteSlug(s, ref.fullName) : s,
    ),
    slugifyId(ref.fullName),
  ].filter((s): s is string => Boolean(s))

  const uniqueSlugs = [...new Set(slugCandidates)]

  for (const slug of uniqueSlugs) {
    if (ref.fullName && !slugMatchesFighterName(slug, ref.fullName)) continue
    const id = canonicalizeFighterId(
      slug.startsWith(prefix) ? slug : `${prefix}${slug}`,
    )
    if (roster.fighters.some((f) => canonicalizeFighterId(f.id) === id)) return id
  }

  const parts = ref.fullName.trim().split(/\s+/)
  const last = parts[parts.length - 1]
  if (last && last.length > 2) {
    const lastNorm = normalizeName(last)
    const byLast = roster.fighters.filter((f) => normalizeName(f.name).includes(lastNorm))
    if (byLast.length === 1) return canonicalizeFighterId(byLast[0].id)
    if (parts[0]) {
      const firstNorm = normalizeName(parts[0])
      const narrow = byLast.filter((f) => normalizeName(f.name).includes(firstNorm))
      if (narrow.length === 1) return canonicalizeFighterId(narrow[0].id)
    }
  }

  return null
}
