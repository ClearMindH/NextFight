import type { Fighter, FighterStats, OrganizationId } from '@/types'

export const KSW_ROSTER_URL = 'https://www.kswmma.com/zawodnicy'
export const KSW_FILTERS_URL = 'https://www.kswmma.com/filters'
export const KSW_BASE = 'https://www.kswmma.com'

export interface KswHtmlFighter {
  slug: string
  profileUrl: string
  name: string
  weightClassLabel: string
  weightClass?: string
  ranking?: number
  imageUrl?: string
}

const WEIGHT_CLASS_MAP: Record<string, string> = {
  CIĘŻKA: 'Heavyweight',
  'PÓŁCIĘŻKA': 'Light Heavyweight',
  ŚREDNIA: 'Middleweight',
  'PÓŁŚREDNIA': 'Welterweight',
  LEKKA: 'Lightweight',
  'PIÓRKOWA': 'Featherweight',
  KOGUCIA: 'Bantamweight',
  MUSZA: "Women's Flyweight",
  'SŁOMKOWA': "Women's Strawweight",
  'KOGUCIA KOBIET': "Women's Bantamweight",
}

const POLISH_COUNTRY: Record<string, string> = {
  polska: 'Poland',
  francja: 'France',
  'wielka brytania': 'UK',
  chorwacja: 'Croatia',
  czechy: 'Czech Republic',
  niemcy: 'Germany',
  usa: 'USA',
  brazylia: 'Brazil',
  rosja: 'Russia',
  ukraina: 'Ukraine',
  gruzja: 'Georgia',
  irlandia: 'Ireland',
  szwecja: 'Sweden',
  norwegia: 'Norway',
  holandia: 'Netherlands',
  belgia: 'Belgium',
  austria: 'Austria',
  szwajcaria: 'Switzerland',
  hiszpania: 'Spain',
  włochy: 'Italy',
  wlochy: 'Italy',
  portugalia: 'Portugal',
  rumunia: 'Romania',
  wegry: 'Hungary',
  slowacja: 'Slovakia',
  litwa: 'Lithuania',
  łotwa: 'Latvia',
  lotwa: 'Latvia',
  estonia: 'Estonia',
  białoruś: 'Belarus',
  bialorus: 'Belarus',
  kazachstan: 'Kazakhstan',
  azerbejdżan: 'Azerbaijan',
  azerbejdzan: 'Azerbaijan',
  armenia: 'Armenia',
  turcja: 'Turkey',
  algieria: 'Algeria',
  maroko: 'Morocco',
  tunezja: 'Tunisia',
  rpa: 'South Africa',
  australia: 'Australia',
  kanada: 'Canada',
  meksyk: 'Mexico',
  argentyna: 'Argentina',
}

const FLAG_COUNTRY: Record<string, string> = {
  pl: 'Poland',
  cr: 'Croatia',
  cz: 'Czech Republic',
  fr: 'France',
  gb: 'UK',
  de: 'Germany',
  us: 'USA',
  br: 'Brazil',
  ru: 'Russia',
  ua: 'Ukraine',
  ge: 'Georgia',
  ie: 'Ireland',
  se: 'Sweden',
  no: 'Norway',
  nl: 'Netherlands',
  be: 'Belgium',
  at: 'Austria',
  ch: 'Switzerland',
  es: 'Spain',
  it: 'Italy',
  pt: 'Portugal',
  ro: 'Romania',
  hu: 'Hungary',
  sk: 'Slovakia',
  lt: 'Lithuania',
  lv: 'Latvia',
  ee: 'Estonia',
  by: 'Belarus',
  kz: 'Kazakhstan',
  az: 'Azerbaijan',
  am: 'Armenia',
  tr: 'Turkey',
  dz: 'Algeria',
  ma: 'Morocco',
  tn: 'Tunisia',
  za: 'South Africa',
  au: 'Australia',
  ca: 'Canada',
  mx: 'Mexico',
  ar: 'Argentina',
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

export function weightClassFromPolish(label: string): string | undefined {
  const upper = label.toUpperCase()
  for (const [key, en] of Object.entries(WEIGHT_CLASS_MAP)) {
    if (upper.includes(key.toUpperCase())) return en
  }
  const enRank = label.match(/HEAVYWEIGHT|LIGHTWEIGHT|FEATHERWEIGHT|BANTAMWEIGHT|WELTERWEIGHT|MIDDLEWEIGHT|FLYWEIGHT|STRAWWEIGHT/i)
  if (enRank) {
    const w = enRank[0].toLowerCase()
    return w.charAt(0).toUpperCase() + w.slice(1)
  }
  return undefined
}

function absUrl(src?: string): string | undefined {
  if (!src) return undefined
  if (src.startsWith('http')) return src
  return `${KSW_BASE}${src.startsWith('/') ? '' : '/'}${src}`
}

export function parseKswFighterCardsHtml(html: string): KswHtmlFighter[] {
  const results: KswHtmlFighter[] = []
  const blocks = html.split('class="fighter-card')

  for (const block of blocks) {
    if (!block.includes('fighter-btn')) continue

    const linkMatch = block.match(/href="(https:\/\/www\.kswmma\.com\/zawodnik\/[^"]+)"/)
    if (!linkMatch) continue

    const profileUrl = linkMatch[1]
    const slugMatch = profileUrl.match(/\/zawodnik\/([^/?#]+)/)
    if (!slugMatch) continue
    const slug = slugMatch[1]

    const altMatch = block.match(/alt="([^"]*)"/)
    const nameFromAlt = altMatch?.[1]?.trim()

    const firstMatch = block.match(
      /<div class="fighter-name mb-2">[\s\S]*?<div[^>]*>([^<]*)<\/div>[\s\S]*?<div[^>]*font-weight:\s*bold[^>]*>([^<]+)<\/div>/,
    )
    const firstName = firstMatch?.[1]?.trim() ?? ''
    const lastName = firstMatch?.[2]?.trim() ?? ''
    const name =
      nameFromAlt && nameFromAlt.length > 1
        ? nameFromAlt
        : `${firstName} ${lastName}`.replace(/\s+/g, ' ').trim()

    if (!name) continue

    const wcMatch = block.match(
      /<div class="fighter-data mb-2">[\s\S]*?<div[^>]*>([^<]+)<\/div>/,
    )
    const weightClassLabel = wcMatch?.[1]?.trim() ?? ''

    const rankMatch = block.match(/#\s*(\d+)/)
    const ranking = rankMatch ? Number(rankMatch[1]) : undefined

    const imgMatch = block.match(/<img[^>]+src="([^"]+)"/)

    results.push({
      slug,
      profileUrl,
      name,
      weightClassLabel,
      weightClass: weightClassFromPolish(weightClassLabel),
      ranking,
      imageUrl: absUrl(imgMatch?.[1]),
    })
  }

  return results
}

export function parseLastPage(html: string): number {
  const m = html.match(/class="last-page"[^>]*>\s*(\d+)/)
  return m ? Number(m[1]) : 1
}

export function parseKswProfileHtml(html: string): Partial<{
  record: string
  country: string
  weightClass: string
  ranking: number
  stats: Partial<FighterStats>
}> {
  const recordMatch = html.match(/Rekord KSW<\/p>[\s\S]*?<div[^>]*>\s*([\d]+-[\d]+-[\d]+)/i)
  const record = recordMatch?.[1]?.trim()

  const flagMatch = html.match(/\/storage\/flag2\/([a-z]{2})\.png/i)
  const countryText = html.match(/\/storage\/flag2\/[a-z]{2}\.png"[^>]*>[\s\S]*?<span[^>]*>([^<]+)<\/span>/i)
  const rawCountry = countryText?.[1]?.trim()
  const country =
    (rawCountry && POLISH_COUNTRY[rawCountry.toLowerCase()]) ||
    rawCountry ||
    (flagMatch ? (FLAG_COUNTRY[flagMatch[1].toLowerCase()] ?? flagMatch[1].toUpperCase()) : undefined)

  const wcMatch = html.match(/weight-category">Kategoria\s*([^<]+)</i)
  const weightClass = wcMatch ? weightClassFromPolish(wcMatch[1].trim()) : undefined

  const rankMatch = html.match(/ranking-pos">[^#]*#?\s*(\d+)/i)
  const ranking = rankMatch ? Number(rankMatch[1]) : undefined

  const ageMatch = html.match(/Wiek<\/span>[\s\S]*?fighter-data">\s*([^<]+)/i)
  const heightMatch = html.match(/Wzrost<\/span>[\s\S]*?fighter-data">\s*([^<]+)/i)
  const ageRaw = ageMatch?.[1]?.trim()
  const heightRaw = heightMatch?.[1]?.trim()

  const age =
    ageRaw && ageRaw !== 'N/A' ? Number.parseInt(ageRaw, 10) : undefined
  let heightCm: number | undefined
  if (heightRaw && heightRaw !== 'N/A') {
    const cm = heightRaw.match(/(\d+)\s*cm/i)
    if (cm) heightCm = Number(cm[1])
    else {
      const m = heightRaw.match(/(\d+)\s*m/i)
      if (m) heightCm = Math.round(Number(m[1]) * 100)
    }
  }

  return {
    record,
    country: country ?? 'Unknown',
    weightClass,
    ranking,
    stats: {
      age: age && age > 0 ? age : undefined,
      heightCm,
    },
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

export function mapKswHtmlToFighter(
  row: KswHtmlFighter,
  orgId: OrganizationId = 'ksw',
  profile?: ReturnType<typeof parseKswProfileHtml>,
): Fighter {
  const recordSource = profile?.record ?? '0-0-0'
  const { wins, losses, draws, record } = parseRecord(recordSource)

  return {
    id: `${orgId}-${row.slug}`,
    organizationId: orgId,
    name: row.name,
    record,
    wins,
    losses,
    draws,
    country: profile?.country ?? 'Unknown',
    weightClass: profile?.weightClass ?? row.weightClass,
    ranking: profile?.ranking ?? row.ranking,
    imageUrl: row.imageUrl,
    stats: defaultStats({
      age: profile?.stats?.age,
      heightCm: profile?.stats?.heightCm,
    }),
    lastSyncedAt: new Date().toISOString(),
    source: 'merged',
  }
}
