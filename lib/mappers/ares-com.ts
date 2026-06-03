import type { Fighter, FighterStats, OrganizationId } from '@/types'
import { slugifyId } from '@/lib/mappers/ufc-api'

export const ARES_ROSTER_URL = 'https://www.aresfighting.com/fr/athletes/?gender=all'
export const ARES_AJAX_URL = 'https://www.aresfighting.com/wp-admin/admin-ajax.php'
export const ARES_BASE = 'https://www.aresfighting.com'

export interface AresCategory {
  categoryId: number
  gender: 'men' | 'women'
  weightClass: string
}

export interface AresHtmlFighter {
  fighterId: string
  slug: string
  name: string
  nickname?: string
  record: string
  country: string
  age?: number
  heightCm?: number
  ranking?: number
  isChampion?: boolean
  imageUrl?: string
  weightClass: string
  gender: 'men' | 'women'
}

const FRENCH_COUNTRY: Record<string, string> = {
  france: 'France',
  cameroun: 'Cameroon',
  suisse: 'Switzerland',
  belgique: 'Belgium',
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
  turquie: 'Turkey',
  géorgie: 'Georgia',
  georgie: 'Georgia',
  hongrie: 'Hungary',
  autriche: 'Austria',
  allemagne: 'Germany',
  'pays-bas': 'Netherlands',
  paysbas: 'Netherlands',
  russie: 'Russia',
  ukraine: 'Ukraine',
  canada: 'Canada',
  mexique: 'Mexico',
  argentine: 'Argentina',
  portugal: 'Portugal',
  irlande: 'Ireland',
  norvège: 'Norway',
  norvege: 'Norway',
  suède: 'Sweden',
  suede: 'Sweden',
  danemark: 'Denmark',
  croatie: 'Croatia',
  serbie: 'Serbia',
  bulgarie: 'Bulgaria',
  grèce: 'Greece',
  grece: 'Greece',
  japon: 'Japan',
  chine: 'China',
  australie: 'Australia',
  'afrique du sud': 'South Africa',
  'côte d\'ivoire': 'Ivory Coast',
  "cote d'ivoire": 'Ivory Coast',
}

export function parseRecord(record: string): {
  wins: number
  losses: number
  draws: number
  record: string
} {
  const m = record.trim().match(/(\d+)-(\d+)-(\d+)/)
  if (!m) return { wins: 0, losses: 0, draws: 0, record: '0-0-0' }
  const wins = Number(m[1])
  const losses = Number(m[2])
  const draws = Number(m[3])
  return { wins, losses, draws, record: `${wins}-${losses}-${draws}` }
}

export function normalizeCountry(raw?: string): string {
  if (!raw) return 'Unknown'
  const trimmed = raw.trim()
  if (!trimmed || trimmed === '-') return 'Unknown'
  return FRENCH_COUNTRY[trimmed.toLowerCase()] ?? trimmed
}

function parseHeightCm(raw?: string): number | undefined {
  if (!raw || raw === '-') return undefined
  const m = raw.match(/(\d+)\s*cm/i)
  return m ? Number(m[1]) : undefined
}

function parseAge(raw?: string): number | undefined {
  if (!raw || raw === '-') return undefined
  const n = Number.parseInt(raw, 10)
  return n > 0 ? n : undefined
}

function parseRanking(rankLabel?: string): { ranking?: number; isChampion?: boolean } {
  if (!rankLabel) return {}
  const label = rankLabel.trim().toUpperCase()
  if (label === '#C' || label === 'C') return { isChampion: true, ranking: 1 }
  const m = label.match(/#?(\d+)/)
  return m ? { ranking: Number(m[1]) } : {}
}

function titleCaseName(name: string): string {
  return name
    .trim()
    .split(/\s+/)
    .map((w) => (w.length <= 2 ? w : w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()))
    .join(' ')
}

export function parseAresCategoriesHtml(html: string): AresCategory[] {
  const results: AresCategory[] = []
  const re =
    /href="\/fr\/athletes\?_p=fighters-list&category=(\d+)&gender=(men|women)"[^>]*>[\s\S]*?<p class="title is-4[^"]*"[^>]*>([^<]+)<\/p>/g

  let m: RegExpExecArray | null
  while ((m = re.exec(html)) !== null) {
    results.push({
      categoryId: Number(m[1]),
      gender: m[2] as 'men' | 'women',
      weightClass: m[3].trim(),
    })
  }

  return results
}

export function parseAresFighterRowsHtml(
  html: string,
  weightClass: string,
  gender: 'men' | 'women',
): AresHtmlFighter[] {
  const results: AresHtmlFighter[] = []
  const blocks = html.split(/<div class="no-trad columns rank/)

  for (const block of blocks) {
    if (!block.includes('name-block') || !block.includes('_fighter=')) continue

    const fighterId = block.match(/_fighter=(\d+)/)?.[1]
    if (!fighterId) continue

    const rankLabel = block.match(
      /(?:rank-one-block|rank-block)[^>]*>([^<]*)</,
    )?.[1]
    const { ranking, isChampion } = parseRanking(rankLabel)

    const imgMatch = block.match(/<img[^>]+src="([^"]+)"[^>]*alt="([^"]*)"/)
    const altSlug = imgMatch?.[2]?.trim() || ''

    const nameBlock = block.match(/class="column name-block">([\s\S]*?)<\/div>/)?.[1] ?? ''
    const nameParts = [...nameBlock.matchAll(/<p>([^<]*)<\/p>/g)].map((x) => x[1].trim())
    const name = titleCaseName(nameParts[0] ?? '')
    if (!name) continue

    let nickname: string | undefined
    const nickRaw = nameParts[1]?.replace(/^"|"$/g, '').trim()
    if (nickRaw) nickname = nickRaw

    const columns = [...block.matchAll(/<div class="left-border"><\/div>\s*<div class="column[^"]*">([^<]*)<\/div>/g)].map(
      (x) => x[1].trim(),
    )

    const country = normalizeCountry(columns[0])
    const age = parseAge(columns[1])
    const heightCm = parseHeightCm(columns[2])
    const record = columns[3]?.match(/\d+-\d+-\d+/)?.[0] ?? columns[3] ?? '0-0-0'

    const slug = altSlug || slugifyId(name)

    results.push({
      fighterId,
      slug,
      name,
      nickname,
      record,
      country,
      age,
      heightCm,
      ranking,
      isChampion,
      imageUrl: imgMatch?.[1],
      weightClass,
      gender,
    })
  }

  return results
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

export function mapAresHtmlToFighter(
  row: AresHtmlFighter,
  orgId: OrganizationId = 'ares',
): Fighter {
  const { wins, losses, draws, record } = parseRecord(row.record)

  return {
    id: `${orgId}-${row.slug}`,
    organizationId: orgId,
    name: row.name,
    nickname: row.nickname,
    record,
    wins,
    losses,
    draws,
    country: row.country,
    weightClass: row.weightClass,
    ranking: row.isChampion ? 1 : row.ranking,
    imageUrl: row.imageUrl,
    stats: defaultStats({
      age: row.age,
      heightCm: row.heightCm,
    }),
    lastSyncedAt: new Date().toISOString(),
    source: 'merged',
  }
}
