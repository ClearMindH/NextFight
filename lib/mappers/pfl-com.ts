import type { Fighter, FighterStats, OrganizationId } from '@/types'
import { slugifyId } from '@/lib/mappers/ufc-api'

export const PFL_WT_ROSTER_URL = 'https://pflmma.com/wt-fighter-roster'
export const PFL_QUERY_FIGHTERS_URL = 'https://pflmma.com/ajax/query_fighters'

export interface PflHtmlFighter {
  slug: string
  profileUrl: string
  name: string
  nickname?: string
  record: string
  wins: number
  losses: number
  draws: number
  country: string
  imageUrl?: string
  gender?: 'male' | 'female'
}

const COUNTRY_NAMES: Record<string, string> = {
  US: 'USA',
  GB: 'UK',
  BR: 'Brazil',
  RU: 'Russia',
  HU: 'Hungary',
  CI: 'Ivory Coast',
  GE: 'Georgia',
  PL: 'Poland',
  MX: 'Mexico',
  CA: 'Canada',
  AU: 'Australia',
  FR: 'France',
  DE: 'Germany',
  ES: 'Spain',
  IT: 'Italy',
  NL: 'Netherlands',
  SE: 'Sweden',
  NO: 'Norway',
  IE: 'Ireland',
  JP: 'Japan',
  CN: 'China',
  KR: 'South Korea',
  NG: 'Nigeria',
  ZA: 'South Africa',
  AR: 'Argentina',
  CL: 'Chile',
  CO: 'Colombia',
  PE: 'Peru',
  BE: 'Belgium',
  CH: 'Switzerland',
  AT: 'Austria',
  PT: 'Portugal',
  RO: 'Romania',
  UA: 'Ukraine',
  KZ: 'Kazakhstan',
  UZ: 'Uzbekistan',
  AM: 'Armenia',
  AZ: 'Azerbaijan',
  TR: 'Turkey',
  IL: 'Israel',
  AE: 'UAE',
  SA: 'Saudi Arabia',
  IN: 'India',
  TH: 'Thailand',
  PH: 'Philippines',
  ID: 'Indonesia',
  NZ: 'New Zealand',
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

function countryFromFlagUrl(flagUrl?: string): string {
  if (!flagUrl) return 'Unknown'
  const m = flagUrl.match(/\/flags\/backdrops\/([A-Z]{2})_BACKDROP/i)
  if (!m) return 'Unknown'
  const code = m[1].toUpperCase()
  return COUNTRY_NAMES[code] ?? code
}

function parseHeightCm(raw: string): number | undefined {
  const cleaned = raw.replace(/&#039;/g, "'").trim()
  const ftIn = cleaned.match(/(\d+)'(\d+)?"?/)
  if (ftIn) {
    const ft = Number(ftIn[1])
    const inches = Number(ftIn[2] || 0)
    return Math.round((ft * 12 + inches) * 2.54)
  }
  const cm = cleaned.match(/(\d+(?:\.\d+)?)\s*cm/i)
  if (cm) return Math.round(Number(cm[1]))
  return undefined
}

function parseInchesToCm(raw: string): number | undefined {
  const cleaned = raw.replace(/&#039;/g, "'").replace(/"/g, '').trim()
  const n = parseFloat(cleaned)
  return Number.isFinite(n) ? Math.round(n * 2.54) : undefined
}

function weightClassFromTitle(title: string): string | undefined {
  const m = title.match(/\|\s*([^(|]+?)\s*\(/)
  if (!m) return undefined
  const label = m[1].trim()
  if (label.toLowerCase().startsWith("women's")) {
    return label.replace(/\s*-\s*\d+.*$/i, '').trim()
  }
  return label.replace(/\s*-\s*\d+.*$/i, '').trim() || label
}

function defaultStats(overrides?: Partial<FighterStats>): FighterStats {
  return {
    strikingAccuracy: 50,
    takedownAccuracy: 40,
    reachCm: 183,
    heightCm: 178,
    age: 29,
    winStreak: 0,
    ...overrides,
  }
}

export function parsePflFighterCardsHtml(html: string): PflHtmlFighter[] {
  const results: PflHtmlFighter[] = []
  const linkRe =
    /<div class="col-md-3[^"]* fighter_(male|female)[^"]*"[^>]*>[\s\S]*?<a class="fighter-link" href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/g

  let m: RegExpExecArray | null
  while ((m = linkRe.exec(html)) !== null) {
    const gender = m[1] as 'male' | 'female'
    const profileUrl = m[2].replace(/&amp;/g, '&')
    const block = m[3]

    const slugMatch = profileUrl.match(/\/wt-fighter\/([^/?#]+)/i)
    if (!slugMatch) continue
    const slug = slugMatch[1]

    const h5 = block.match(/<h5 class="mb-0">([\s\S]*?)<\/h5>/)
    if (!h5) continue

    const h5Html = h5[1]
    const firstMatch = h5Html.match(/^([^<]+)/)
    const firstName = firstMatch?.[1]?.trim() ?? ''
    const lastMatch = h5Html.match(/<span class="d-block">([^<]+)<\/span>/)
    const lastName = lastMatch?.[1]?.trim() ?? ''
    const nickMatch = h5Html.match(/<small class="d-block">"?([^"<]*)"?\s*<\/small>/)
    const nickname = nickMatch?.[1]?.trim() || undefined

    const name = `${firstName} ${lastName}`.replace(/\s+/g, ' ').trim()
    if (!name) continue

    const recordMatch = block.match(
      /<p class="mb-2 mt-2 fighter-hovertext">([^<]+)<\/p>/,
    )
    const recordRaw = recordMatch?.[1]?.trim() ?? '0-0-0'
    const { wins, losses, draws, record } = parseRecord(recordRaw)

    const imgMatch = block.match(/<img class="fighter-img" src="([^"]+)"/)
    const flagMatch = block.match(/<img class="fighter-flag" src="([^"]+)"/)

    results.push({
      slug,
      profileUrl,
      name,
      nickname,
      record,
      wins,
      losses,
      draws,
      country: countryFromFlagUrl(flagMatch?.[1]),
      imageUrl: imgMatch?.[1]?.replace(/&amp;/g, '&'),
      gender,
    })
  }

  return results
}

export function parsePflProfileHtml(html: string): Partial<{
  weightClass: string
  stats: Partial<FighterStats>
  record: string
}> {
  const titleMatch = html.match(/<title>([^<]+)<\/title>/i)
  const weightClass = titleMatch ? weightClassFromTitle(titleMatch[1]) : undefined

  const boxes = [...html.matchAll(
    /<div class="fighter-info-box[^"]*">[\s\S]*?<h3>([^<]+)<\/h3>[\s\S]*?<h4>([^<]+)<\/h4>/g,
  )]
  const values: Record<string, string> = {}
  for (const box of boxes) {
    values[box[2].trim().toUpperCase()] = box[1].trim()
  }

  const age = values.AGE ? Number(values.AGE) : undefined
  const heightCm = values.HEIGHT ? parseHeightCm(values.HEIGHT) : undefined
  const reachCm = values['ARM REACH'] ? parseInchesToCm(values['ARM REACH']) : undefined

  const careerRecord = html.match(/Career Record:\s*([^<]+)/i)?.[1]?.trim()
  const pflRecord = html.match(/PFL Record:\s*([^<]+)/i)?.[1]?.trim()

  return {
    weightClass,
    record: pflRecord ?? careerRecord,
    stats: {
      age: age && age > 0 ? age : undefined,
      heightCm,
      reachCm,
    },
  }
}

export function mapPflHtmlToFighter(
  row: PflHtmlFighter,
  orgId: OrganizationId = 'pfl',
  profile?: ReturnType<typeof parsePflProfileHtml>,
): Fighter {
  const recordSource = profile?.record ?? row.record
  const { wins, losses, draws, record } = parseRecord(recordSource)

  const stats = defaultStats({
    age: profile?.stats?.age,
    heightCm: profile?.stats?.heightCm,
    reachCm: profile?.stats?.reachCm,
  })

  return {
    id: `${orgId}-${slugifyId(row.name)}`,
    organizationId: orgId,
    name: row.name,
    nickname: row.nickname,
    record,
    wins,
    losses,
    draws,
    country: row.country,
    weightClass: profile?.weightClass,
    imageUrl: row.imageUrl,
    stats,
    lastSyncedAt: new Date().toISOString(),
    source: 'merged',
  }
}
