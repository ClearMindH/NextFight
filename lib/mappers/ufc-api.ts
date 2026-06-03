import type { Fighter, FighterStats } from '@/types'

export interface UfcApiFighter {
  id: string
  name: string
  nickname?: string | null
  record?: string
  wins?: number
  losses?: number
  draws?: number
  country?: string
  weight_class?: string
  weightClass?: string
  ranking?: number
  stance?: string
  height?: string
  reach?: string
  str_acc?: number
  td_acc?: number
  slpm?: number
  sapm?: number
  str_def?: number
  td_avg?: number
  td_def?: number
  sub_avg?: number
  win_streak?: number
  age?: number
}

function parseHeightCm(height?: string): number {
  if (!height) return 180
  const match = height.match(/(\d+)\s*'\s*(\d+)/)
  if (!match) return 180
  const feet = Number(match[1])
  const inches = Number(match[2])
  return Math.round((feet * 12 + inches) * 2.54)
}

function parseReachCm(reach?: string): number {
  if (!reach) return 183
  const inch = reach.match(/([\d.]+)/)
  if (!inch) return 183
  return Math.round(Number(inch[1]) * 2.54)
}

function parseRecord(record?: string, wins?: number, losses?: number, draws?: number) {
  if (wins != null && losses != null) {
    return {
      record: `${wins}-${losses}-${draws ?? 0}`,
      wins,
      losses,
      draws: draws ?? 0,
    }
  }
  if (!record) return { record: '0-0-0', wins: 0, losses: 0, draws: 0 }
  const parts = record.split('-').map(Number)
  return {
    record,
    wins: parts[0] ?? 0,
    losses: parts[1] ?? 0,
    draws: parts[2] ?? 0,
  }
}

export function mapUfcApiFighter(raw: UfcApiFighter): Fighter {
  const { record, wins, losses, draws } = parseRecord(
    raw.record,
    raw.wins,
    raw.losses,
    raw.draws,
  )
  const strAcc = raw.str_acc != null ? Math.round(raw.str_acc * 100) : 50
  const tdAcc = raw.td_acc != null ? Math.round(raw.td_acc * 100) : 35

  const stats: FighterStats = {
    strikingAccuracy: strAcc,
    takedownAccuracy: tdAcc,
    reachCm: parseReachCm(raw.reach),
    heightCm: parseHeightCm(raw.height),
    age: raw.age ?? 29,
    winStreak: raw.win_streak ?? 0,
    slpm: raw.slpm,
    sapm: raw.sapm,
    strDef: raw.str_def != null ? Math.round(raw.str_def * 100) : undefined,
    tdAvg: raw.td_avg,
    tdDef: raw.td_def != null ? Math.round(raw.td_def * 100) : undefined,
    subAvg: raw.sub_avg,
  }

  return {
    id: `ufc-${raw.id}`,
    organizationId: 'ufc',
    name: raw.name,
    nickname: raw.nickname ?? undefined,
    record,
    wins,
    losses,
    draws,
    country: raw.country ?? 'Unknown',
    weightClass: raw.weight_class ?? raw.weightClass,
    ranking: raw.ranking,
    stance: raw.stance,
    stats,
    lastSyncedAt: new Date().toISOString(),
    source: 'ufc-api',
  }
}

export function slugifyId(name: string): string {
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}
