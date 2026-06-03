import type { Fighter, FighterStats, OrganizationId } from '@/types'
import { slugifyId } from '@/lib/mappers/ufc-api'

export const HEXAGONE_ROSTER_URL = 'https://hexagonemma.fr/combattants/'
export const HEXAGONE_WP_API = 'https://hexagonemma.fr/wp-json/wp/v2/combattant'

export interface HexListingFighter {
  slug?: string
  profileUrl?: string
  name: string
  record?: string
  heightLabel?: string
  weightClassLabel?: string
  imageUrl?: string
  flagUrl?: string
  rosterGroup: 'active' | 'alumni'
}

export interface HexWpCombattant {
  slug: string
  link: string
  title: { rendered: string }
  ptb_metabox?: {
    ptb_drapeau?: [string, string]
    ptb_combattant_taille?: string
    ptb_combattant_palmares?: string
  }
  ptb_taxonomy?: {
    category?: Array<{ name: string }>
    pays?: Array<{ name: string }>
  }
  ptb_featured_image?: { url?: string }
}

const FR_WEIGHT_CLASS: Record<string, string> = {
  'poids plume': 'Featherweight',
  'poids léger': 'Lightweight',
  'poids leger': 'Lightweight',
  'poids coq': 'Bantamweight',
  'poids mouche': 'Flyweight',
  'poids paille': 'Strawweight',
  'poids welter': 'Welterweight',
  'poids mi-moyen': 'Welterweight',
  'poids moyen': 'Middleweight',
  'poids mi-lourd': 'Light Heavyweight',
  'poids lourd': 'Heavyweight',
  'poids mi-lourd femmes': "Women's Light Heavyweight",
  'poids mouche femmes': "Women's Flyweight",
  'poids coq femmes': "Women's Bantamweight",
}

const COUNTRY_NAMES: Record<string, string> = {
  france: 'France',
  canada: 'Canada',
  'côte d\'ivoire': 'Ivory Coast',
  "cote d'ivoire": 'Ivory Coast',
  belgique: 'Belgium',
  suisse: 'Switzerland',
  maroc: 'Morocco',
  algérie: 'Algeria',
  algerie: 'Algeria',
  tunisie: 'Tunisia',
  sénégal: 'Senegal',
  senegal: 'Senegal',
  brésil: 'Brazil',
  bresil: 'Brazil',
  roumanie: 'Romania',
  pologne: 'Poland',
  italie: 'Italy',
  espagne: 'Spain',
  'royaume-uni': 'UK',
  'grande-bretagne': 'UK',
  usa: 'USA',
  'états-unis': 'USA',
  etatsunis: 'USA',
  egypte: 'Egypt',
  égypte: 'Egypt',
  georgie: 'Georgia',
  géorgie: 'Georgia',
  hongrie: 'Hungary',
  autriche: 'Austria',
  allemagne: 'Germany',
  paysbas: 'Netherlands',
  'pays-bas': 'Netherlands',
}

export function parseRecord(record: string): {
  wins: number
  losses: number
  draws: number
  record: string
} {
  const m = record.match(/(\d+)-(\d+)-(\d+)/)
  if (!m) return { wins: 0, losses: 0, draws: 0, record: '0-0-0' }
  const wins = Number(m[1])
  const losses = Number(m[2])
  const draws = Number(m[3])
  return { wins, losses, draws, record: `${wins}-${losses}-${draws}` }
}

export function normalizeCountryName(raw?: string): string {
  if (!raw) return 'Unknown'
  const key = raw.trim().toLowerCase()
  return COUNTRY_NAMES[key] ?? raw.trim()
}

export function weightClassFromFrench(label?: string): string | undefined {
  if (!label) return undefined
  const key = label.trim().toLowerCase()
  if (FR_WEIGHT_CLASS[key]) return FR_WEIGHT_CLASS[key]
  for (const [fr, en] of Object.entries(FR_WEIGHT_CLASS)) {
    if (key.includes(fr)) return en
  }
  return undefined
}

function parseHeightCm(label?: string, fallbackCm?: string): number | undefined {
  if (label) {
    const m = label.match(/(\d+)\s*cm/i)
    if (m) return Number(m[1])
  }
  if (fallbackCm) {
    const n = Number.parseInt(fallbackCm, 10)
    if (n > 0) return n
  }
  return undefined
}

function countryFromFlagUrl(flagUrl?: string): string | undefined {
  if (!flagUrl) return undefined
  const file = flagUrl.split('/').pop()?.replace(/\.[^.]+$/, '') ?? ''
  const map: Record<string, string> = {
    france: 'France',
    'france-1': 'France',
    canada: 'Canada',
    egypt: 'Egypt',
    brazil: 'Brazil',
    poland: 'Poland',
    georgia: 'Georgia',
    morocco: 'Morocco',
    algeria: 'Algeria',
    tunisia: 'Tunisia',
    uk: 'UK',
    usa: 'USA',
  }
  return map[file.toLowerCase()] ?? undefined
}

function titleCaseName(name: string): string {
  return name
    .trim()
    .split(/\s+/)
    .map((w) => (w.length <= 2 ? w : w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()))
    .join(' ')
}

export function isFrenchCombattantLink(link: string): boolean {
  return (
    link.includes('hexagonemma.fr/combattant/') && !link.includes('/en/')
  )
}

export function parseHexagoneListingHtml(html: string): HexListingFighter[] {
  const activeMarker = 'bde-advanced-tabs-content-1521-212'
  const [activePart, alumniPart = ''] = html.split(activeMarker)

  const active = parseActiveTabArticles(activePart)
  const alumni = parseAlumniTabArticles(alumniPart)

  const byKey = new Map<string, HexListingFighter>()
  for (const row of [...active, ...alumni]) {
    const key = row.slug ?? slugifyId(row.name)
    if (!byKey.has(key)) byKey.set(key, row)
  }
  return [...byKey.values()]
}

function parseActiveTabArticles(html: string): HexListingFighter[] {
  const results: HexListingFighter[] = []
  const articles = html.split('bde-loop-item ee-post').slice(1)

  for (const block of articles) {
    if (!block.includes('bde-heading-10026-111')) continue

    const linkMatch = block.match(/href="(https:\/\/hexagonemma\.fr\/combattant\/[^"]+)"/)
    if (!linkMatch) continue

    const profileUrl = linkMatch[1]
    const slug = profileUrl.match(/\/combattant\/([^/?#]+)/)?.[1]

    const name = block.match(/bde-heading-10026-111[^>]*>\s*([^<]+)\s*<\/h2>/)?.[1]?.trim()
    if (!name) continue

    const record = block.match(/bde-shortcode-10026-118[^>]*>([^<]+)</)?.[1]?.trim()
    const heightLabel = block.match(/bde-shortcode-10026-119[^>]*>([^<]+)</)?.[1]?.trim()
    const weightClassLabel = block
      .match(/bde-text-10026-122[^>]*>\s*([^<]+)/)?.[1]
      ?.trim()
    const imageUrl = block.match(/class="[^"]*img-fighter[^"]*"[^>]+src="([^"]+)"/)?.[1]
    const flagUrl = block.match(/bde-shortcode-10026-109[^>]*><img src="([^"]+)"/)?.[1]

    results.push({
      slug,
      profileUrl,
      name: titleCaseName(name),
      record,
      heightLabel,
      weightClassLabel,
      imageUrl,
      flagUrl,
      rosterGroup: 'active',
    })
  }

  return results
}

function parseAlumniTabArticles(html: string): HexListingFighter[] {
  const results: HexListingFighter[] = []
  const articles = html.split('bde-loop-item ee-post').slice(1)

  for (const block of articles) {
    if (!block.includes('bde-heading-10289-111')) continue

    const name = block.match(/bde-heading-10289-111[^>]*>\s*([^<]+)\s*<\/h2>/i)?.[1]?.trim()
    if (!name) continue

    const weightClassLabel = block
      .match(/bde-text-10289-122[^>]*>\s*([^<]+)/)?.[1]
      ?.trim()
    const imageUrl = block.match(/bde-image2-10289-104[^>]+src="([^"]+)"/)?.[1]
    const flagUrl = block.match(/bde-shortcode-10289-109[^>]*><img src="([^"]+)"/)?.[1]

    results.push({
      name: titleCaseName(name),
      weightClassLabel,
      imageUrl,
      flagUrl,
      rosterGroup: 'alumni',
    })
  }

  return results
}

export function mapWpCombattantToPartial(
  node: HexWpCombattant,
): Partial<HexListingFighter> & { country?: string; heightCm?: number } {
  const pays = node.ptb_taxonomy?.pays?.[0]?.name
  const flagUrl = node.ptb_metabox?.ptb_drapeau?.[1]

  return {
    slug: node.slug,
    profileUrl: node.link,
    name: titleCaseName(node.title.rendered),
    record: node.ptb_metabox?.ptb_combattant_palmares,
    weightClassLabel: node.ptb_taxonomy?.category?.[0]?.name,
    imageUrl: node.ptb_featured_image?.url,
    flagUrl,
    country: normalizeCountryName(pays) || countryFromFlagUrl(flagUrl),
    heightCm: parseHeightCm(undefined, node.ptb_metabox?.ptb_combattant_taille),
  }
}

function defaultStats(overrides?: Partial<FighterStats>): FighterStats {
  return {
    strikingAccuracy: 50,
    takedownAccuracy: 38,
    reachCm: 183,
    heightCm: 178,
    age: 29,
    winStreak: 0,
    ...overrides,
  }
}

export function mapHexagoneToFighter(
  row: HexListingFighter,
  wp?: ReturnType<typeof mapWpCombattantToPartial>,
  orgId: OrganizationId = 'hexagone',
): Fighter {
  const slug = row.slug ?? wp?.slug ?? slugifyId(row.name)
  const recordSource = row.record ?? wp?.record ?? '0-0-0'
  const { wins, losses, draws, record } = parseRecord(recordSource)

  const weightClass =
    weightClassFromFrench(row.weightClassLabel) ||
    weightClassFromFrench(wp?.weightClassLabel) ||
    (wp?.weightClassLabel && !wp.weightClassLabel.toLowerCase().includes('poids')
      ? wp.weightClassLabel
      : undefined)

  const country =
    (wp?.country && wp.country !== 'Unknown' ? wp.country : undefined) ||
    countryFromFlagUrl(row.flagUrl ?? wp?.flagUrl) ||
    'Unknown'

  const heightCm = parseHeightCm(row.heightLabel) ?? wp?.heightCm

  return {
    id: `${orgId}-${slug}`,
    organizationId: orgId,
    name: row.name || wp?.name || slug,
    record,
    wins,
    losses,
    draws,
    country,
    weightClass,
    imageUrl: row.imageUrl ?? wp?.imageUrl,
    stats: defaultStats({ heightCm }),
    lastSyncedAt: new Date().toISOString(),
    source: 'merged',
  }
}
