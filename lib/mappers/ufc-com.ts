import type { Fighter, FighterStats } from '@/types'
import { slugifyId } from '@/lib/mappers/ufc-api'

const UFC_BASE = 'https://www.ufc.com'
const ACTIVE_STATUS_ID = '23'

export interface UfcJsonApiAthlete {
  type: string
  id: string
  attributes: {
    title: string
    nickname?: string | null
    dob?: string | null
    age?: number | null
    rank?: number | null
    rank_previous?: number | null
    pfp_rank?: number | null
    pfp_rank_previous?: number | null
    stats_height?: string | null
    stats_reach_arm?: string | null
    stats_weight?: string | null
    path?: { alias?: string }
    origin?: { country_code?: string | null }
    name?: {
      given?: string
      family?: string
    }
  }
  relationships?: {
    athlete_stat?: {
      data?: {
        id?: string
        meta?: { drupal_internal__target_id?: number }
      } | null
      links?: {
        related?: { href?: string }
        self?: { href?: string }
      }
    }
  }
}

export interface UfcAthleteStat {
  attributes: {
    drupal_internal__fightmetric_id?: number
    win_streak?: number
    career_wins?: number
    career_losses?: number
    career_draws?: number
    career_no_contest?: number
    sig_strikes_accuracy?: string | number
    takedown_acuracy?: string | number
    takedown_defense?: string | number
    sig_str_def?: string | number
    takedown_average?: string | number
    submission_average?: string | number
    sig_str_land_min?: string | number
    sig_str_abs_min?: string | number
  }
}

export interface UfcHtmlAthlete {
  slug: string
  name: string
  nickname?: string
  record: string
  wins: number
  losses: number
  draws: number
  weightClass?: string
  imageUrl?: string
}

const COUNTRY_MAP: Record<string, string> = {
  US: 'USA',
  GB: 'UK',
  BR: 'BRA',
  RU: 'RUS',
  GE: 'GEO',
  ES: 'ESP',
  FR: 'FRA',
  NG: 'NGA',
  NZ: 'NZL',
  KZ: 'KAZ',
  AM: 'ARM',
  CA: 'CAN',
  MX: 'MEX',
  AU: 'AUS',
  CN: 'CHN',
  JP: 'JPN',
  PL: 'POL',
  IE: 'IRL',
  SE: 'SWE',
  AE: 'UAE',
}

function parseRecord(record: string): { wins: number; losses: number; draws: number; record: string } {
  const m = record.match(/(\d+)-(\d+)-(\d+)/)
  if (!m) return { wins: 0, losses: 0, draws: 0, record: '0-0-0' }
  const wins = Number(m[1])
  const losses = Number(m[2])
  const draws = Number(m[3])
  return { wins, losses, draws, record: `${wins}-${losses}-${draws}` }
}

function inchesToCm(inches: number): number {
  return Math.round(inches * 2.54)
}

function weightClassFromLbs(lbs: number): string | undefined {
  if (!lbs || lbs <= 0) return undefined
  if (lbs <= 125) return 'Flyweight'
  if (lbs <= 135) return 'Bantamweight'
  if (lbs <= 145) return 'Featherweight'
  if (lbs <= 155) return 'Lightweight'
  if (lbs <= 170) return 'Welterweight'
  if (lbs <= 185) return 'Middleweight'
  if (lbs <= 205) return 'Light Heavyweight'
  return 'Heavyweight'
}

function ageFromDob(dob?: string | null, fallback?: number | null): number {
  if (fallback != null && fallback > 0) return fallback
  if (!dob) return 29
  const born = new Date(dob)
  if (Number.isNaN(born.getTime())) return 29
  const now = new Date()
  let age = now.getFullYear() - born.getFullYear()
  const m = now.getMonth() - born.getMonth()
  if (m < 0 || (m === 0 && now.getDate() < born.getDate())) age -= 1
  return Math.max(18, Math.min(55, age))
}

function pct(value?: string | number | null, fallback = 50): number {
  if (value == null || value === '') return fallback
  const n = typeof value === 'number' ? value : parseFloat(String(value))
  return Number.isFinite(n) ? Math.round(n) : fallback
}

function buildStats(
  attrs: UfcJsonApiAthlete['attributes'],
  stat?: UfcAthleteStat['attributes'],
): FighterStats {
  const heightIn = parseFloat(attrs.stats_height ?? '0') || 70
  const reachIn = parseFloat(attrs.stats_reach_arm ?? '0') || heightIn + 2

  return {
    strikingAccuracy: pct(stat?.sig_strikes_accuracy, 52),
    strikeDefense: pct(stat?.sig_str_def, 52),
    takedownAccuracy: pct(stat?.takedown_acuracy, 38),
    takedownDefense: pct(stat?.takedown_defense, 65),
    reachCm: inchesToCm(reachIn),
    heightCm: inchesToCm(heightIn),
    age: ageFromDob(attrs.dob, attrs.age),
    winStreak: stat?.win_streak ?? 0,
    slpm: stat?.sig_str_land_min != null ? parseFloat(String(stat.sig_str_land_min)) : undefined,
    sapm: stat?.sig_str_abs_min != null ? parseFloat(String(stat.sig_str_abs_min)) : undefined,
    tdAvg: stat?.takedown_average != null ? parseFloat(String(stat.takedown_average)) : undefined,
    subAvg: stat?.submission_average != null ? parseFloat(String(stat.submission_average)) : undefined,
  }
}

export function mapUfcJsonAthlete(
  node: UfcJsonApiAthlete,
  stat?: UfcAthleteStat['attributes'],
  html?: UfcHtmlAthlete,
): Fighter {
  const attrs = node.attributes
  const name = attrs.title?.trim() || html?.name || 'Unknown'
  const slug = html?.slug || attrs.path?.alias?.replace(/^\/athlete\//, '') || slugifyId(name)

  const recordSource = html?.record ?? (stat
    ? `${stat.career_wins ?? 0}-${stat.career_losses ?? 0}-${stat.career_draws ?? 0}`
    : '0-0-0')
  const { wins, losses, draws, record } = parseRecord(recordSource)

  const lbs = parseFloat(attrs.stats_weight ?? '0')
  const countryCode = attrs.origin?.country_code?.toUpperCase()
  const country = countryCode ? (COUNTRY_MAP[countryCode] ?? countryCode) : 'Unknown'

  const ranking =
    attrs.rank != null && attrs.rank > 0
      ? attrs.rank
      : attrs.pfp_rank != null && attrs.pfp_rank > 0
        ? attrs.pfp_rank
        : undefined

  return {
    id: `ufc-${slug}`,
    organizationId: 'ufc',
    name,
    nickname: attrs.nickname?.trim() || html?.nickname || undefined,
    record,
    wins: html?.wins ?? wins,
    losses: html?.losses ?? losses,
    draws: html?.draws ?? draws,
    country,
    weightClass:
      html?.weightClass ??
      weightClassFromLbs(lbs) ??
      undefined,
    ranking,
    imageUrl: html?.imageUrl,
    stats: buildStats(attrs, stat),
    lastSyncedAt: new Date().toISOString(),
    source: 'ufc-api',
  }
}

export function parseUfcAthletesHtml(html: string): UfcHtmlAthlete[] {
  const results: UfcHtmlAthlete[] = []
  const blocks = html.split('c-listing-athlete-flipcard')

  for (const block of blocks) {
    if (!block.includes('c-listing-athlete__name')) continue

    const nameMatch = block.match(/c-listing-athlete__name">\s*([^<]+?)\s*</)
    const nickMatch = block.match(/c-listing-athlete__nickname">\s*([^<]+?)\s*</)
    const recordMatch = block.match(/c-listing-athlete__record">([0-9]+-[0-9]+-[0-9]+)/)
    const wcMatch = block.match(/stats-weight-class[\s\S]*?field__item">([^<]+)</)
    const imgMatch = block.match(/<img src="([^"]+)"/)

    if (!nameMatch) continue

    const name = nameMatch[1].trim()
    const slug = slugifyId(name)
    const record = recordMatch?.[1] ?? '0-0-0'
    const parsed = parseRecord(record)

    results.push({
      slug,
      name,
      nickname: nickMatch?.[1]?.trim() || undefined,
      record: parsed.record,
      wins: parsed.wins,
      losses: parsed.losses,
      draws: parsed.draws,
      weightClass: wcMatch?.[1]?.trim(),
      imageUrl: imgMatch?.[1]?.replace(/&amp;/g, '&'),
    })
  }

  return results
}

export function activeAthletesApiUrl(offset = 0, limit = 50): string {
  const params = new URLSearchParams({
    'filter[active][condition][path]': 'athlete_status.meta.drupal_internal__target_id',
    'filter[active][condition][value]': ACTIVE_STATUS_ID,
    'page[limit]': String(limit),
    'page[offset]': String(offset),
  })
  return `${UFC_BASE}/jsonapi/node/athlete?${params.toString()}`
}

export function athletesAllActiveHtmlUrl(page: number): string {
  const params = new URLSearchParams({
    'filters[0]': 'status:23',
    page: String(page),
  })
  return `${UFC_BASE}/athletes/all?${params.toString()}`
}
