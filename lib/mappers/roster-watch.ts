import type { Fighter, FighterStats } from '@/types'
import { slugifyId } from '@/lib/mappers/ufc-api'

const ROSTER_WATCH_URL = 'https://www.roster.watch/index.html'

export interface RosterWatchRow {
  name: string
  country: string
  dob?: string
  weightClasses: string[]
  wins: number
  losses: number
  draws: number
  streak: number
  rank?: number
  p4p?: number
}

function attrValue(tag: string, key: string): string | undefined {
  const quoted = tag.match(new RegExp(`data-${key}="([^"]*)"`))
  if (quoted) return quoted[1]
  const single = tag.match(new RegExp(`data-${key}='([^']*)'`))
  if (single) return single[1]
  const bare = tag.match(new RegExp(`data-${key}=([^\\s>]+)`))
  return bare?.[1]
}

function parseWeightClasses(raw?: string): string[] {
  if (!raw) return []
  try {
    const json = raw.replace(/'/g, '"')
    const arr = JSON.parse(json) as string[]
    return Array.isArray(arr) ? arr : []
  } catch {
    return []
  }
}

function formatWeightClass(slugs: string[]): string | undefined {
  if (slugs.length === 0) return undefined
  const label = (s: string) =>
    s
      .split('-')
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(' ')
  return label(slugs[0])
}

function ageFromDob(dob?: string): number {
  if (!dob) return 29
  const born = new Date(dob)
  if (Number.isNaN(born.getTime())) return 29
  const now = new Date()
  let age = now.getFullYear() - born.getFullYear()
  const m = now.getMonth() - born.getMonth()
  if (m < 0 || (m === 0 && now.getDate() < born.getDate())) age -= 1
  return Math.max(18, Math.min(50, age))
}

function countryFromRowSlice(slice: string): string {
  const titles: string[] = []
  const patterns = [
    /class=emoji title="([^"]+)"/g,
    /class=emoji title='([^']+)'/g,
    /class=emoji title=([^>\s]+)/g,
  ]
  for (const re of patterns) {
    let m: RegExpExecArray | null
    while ((m = re.exec(slice))) {
      const t = m[1].trim().replace(/^["']|["']$/g, '')
      if (t) titles.push(t)
    }
    if (titles.length > 0) break
  }
  if (titles.length === 0) return 'Unknown'
  const short: Record<string, string> = {
    Russia: 'RUS',
    'United States': 'USA',
    Brazil: 'BRA',
    Georgia: 'GEO',
    Spain: 'ESP',
    France: 'FRA',
    Nigeria: 'NGA',
    'New Zealand': 'NZL',
    Kazakhstan: 'KAZ',
    Armenia: 'ARM',
    Canada: 'CAN',
    Mexico: 'MEX',
    Australia: 'AUS',
    China: 'CHN',
    Japan: 'JPN',
    Poland: 'POL',
    Ireland: 'IRL',
    'United Kingdom': 'UK',
    England: 'UK',
    Scotland: 'UK',
    Wales: 'UK',
    Sweden: 'SWE',
    'United Arab Emirates': 'UAE',
  }
  return short[titles[0]] ?? titles[0].slice(0, 3).toUpperCase()
}

function defaultStats(age: number, streak: number): FighterStats {
  return {
    strikingAccuracy: 52,
    takedownAccuracy: 38,
    reachCm: 183,
    heightCm: 178,
    age,
    winStreak: streak,
    finishingRate: 45,
    strengthOfSchedule: 55,
  }
}

export function parseRosterWatchHtml(html: string): RosterWatchRow[] {
  const rows: RosterWatchRow[] = []
  const parts = html.split(/<tr\s+data-fighter=/)

  for (let i = 1; i < parts.length; i++) {
    const chunk = parts[i]
    let name = ''
    if (chunk.startsWith('"')) {
      const end = chunk.indexOf('"', 1)
      if (end < 1) continue
      name = chunk.slice(1, end).trim()
    } else if (chunk.startsWith("'")) {
      const end = chunk.indexOf("'", 1)
      if (end < 1) continue
      name = chunk.slice(1, end).trim()
    } else {
      continue
    }
    if (!name) continue

    const tagEnd = chunk.indexOf('>')
    const openTag = `data-fighter=${chunk.slice(0, tagEnd + 1)}`
    const rowSlice = chunk.slice(0, Math.min(chunk.length, 4000))

    const wins = Number(attrValue(openTag, 'wins') ?? 0)
    const losses = Number(attrValue(openTag, 'losses') ?? 0)
    const streak = Number(attrValue(openTag, 'streak') ?? 0)
    const rankRaw = Number(attrValue(openTag, 'rank') ?? 0)
    const p4pRaw = Number(attrValue(openTag, 'p4p') ?? 0)

    rows.push({
      name,
      country: countryFromRowSlice(rowSlice),
      dob: attrValue(openTag, 'dob'),
      weightClasses: parseWeightClasses(attrValue(openTag, 'weightclass')),
      wins,
      losses,
      draws: 0,
      streak,
      rank: rankRaw > 0 ? rankRaw : undefined,
      p4p: p4pRaw > 0 ? p4pRaw : undefined,
    })
  }

  return rows
}

export function mapRosterWatchRow(row: RosterWatchRow): Fighter {
  const age = ageFromDob(row.dob)
  const ranking = row.rank ?? row.p4p

  return {
    id: `ufc-${slugifyId(row.name)}`,
    organizationId: 'ufc',
    name: row.name,
    record: `${row.wins}-${row.losses}-${row.draws}`,
    wins: row.wins,
    losses: row.losses,
    draws: row.draws,
    country: row.country,
    weightClass: formatWeightClass(row.weightClasses),
    ranking,
    stats: defaultStats(age, row.streak),
    lastSyncedAt: new Date().toISOString(),
    source: 'merged',
  }
}

export async function fetchRosterWatchHtml(): Promise<string> {
  const res = await fetch(ROSTER_WATCH_URL, {
    headers: {
      'User-Agent': 'NextFight-RosterSync/1.0',
      Accept: 'text/html',
    },
    signal: AbortSignal.timeout(60000),
  })
  if (!res.ok) {
    throw new Error(`roster.watch HTTP ${res.status}`)
  }
  return res.text()
}

export function rosterWatchRowsToFighters(rows: RosterWatchRow[]): Fighter[] {
  const bySlug = new Map<string, Fighter>()
  for (const row of rows) {
    const fighter = mapRosterWatchRow(row)
    bySlug.set(slugifyId(row.name), fighter)
  }
  return Array.from(bySlug.values()).sort((a, b) => a.name.localeCompare(b.name))
}
