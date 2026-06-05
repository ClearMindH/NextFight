import type { Fighter } from '@/types'
import { buildFighterMethodProfile } from '@/services/prediction/method-profile'

export interface StatComparisonRow {
  key: string
  label: string
  red: number
  blue: number
  unit: '%' | 'cm' | '' | 'yrs'
  higherIsBetter: boolean
  format?: 'percent' | 'integer' | 'decimal'
}

function num(value: number | undefined, fallback: number): number {
  return value ?? fallback
}

function strikeDefense(f: Fighter): number {
  return num(f.stats.strikeDefense ?? f.stats.strDef, 52)
}

function takedownDefense(f: Fighter): number {
  return num(f.stats.takedownDefense ?? f.stats.tdDef, 40)
}

export type StatComparisonLevel = 'full' | 'compact' | 'minimal'

export function buildStatComparisons(
  red: Fighter,
  blue: Fighter,
  level: StatComparisonLevel = 'full',
): StatComparisonRow[] {
  const technical: StatComparisonRow[] = [
    {
      key: 'strikeAcc',
      label: 'Précision striking',
      red: red.stats.strikingAccuracy,
      blue: blue.stats.strikingAccuracy,
      unit: '%',
      higherIsBetter: true,
      format: 'percent',
    },
    {
      key: 'strikeDef',
      label: 'Défense striking',
      red: strikeDefense(red),
      blue: strikeDefense(blue),
      unit: '%',
      higherIsBetter: true,
      format: 'percent',
    },
    {
      key: 'tdAcc',
      label: 'Précision takedown',
      red: red.stats.takedownAccuracy,
      blue: blue.stats.takedownAccuracy,
      unit: '%',
      higherIsBetter: true,
      format: 'percent',
    },
    {
      key: 'tdDef',
      label: 'Défense takedown',
      red: takedownDefense(red),
      blue: takedownDefense(blue),
      unit: '%',
      higherIsBetter: true,
      format: 'percent',
    },
    {
      key: 'reach',
      label: 'Allonge',
      red: red.stats.reachCm,
      blue: blue.stats.reachCm,
      unit: 'cm',
      higherIsBetter: true,
      format: 'integer',
    },
    {
      key: 'height',
      label: 'Taille',
      red: red.stats.heightCm,
      blue: blue.stats.heightCm,
      unit: 'cm',
      higherIsBetter: true,
      format: 'integer',
    },
    {
      key: 'age',
      label: 'Âge',
      red: red.stats.age,
      blue: blue.stats.age,
      unit: 'yrs',
      higherIsBetter: false,
      format: 'integer',
    },
    {
      key: 'streak',
      label: 'Série victoires',
      red: red.stats.winStreak,
      blue: blue.stats.winStreak,
      unit: '',
      higherIsBetter: true,
      format: 'integer',
    },
  ]

  if (level === 'minimal') {
    return buildMethodComparisonRows(red, blue).filter((r) =>
      ['koWins', 'subWins', 'decWins'].includes(r.key),
    )
  }

  if (level === 'compact') {
    const compactKeys = new Set(['strikeAcc', 'strikeDef', 'tdAcc', 'reach'])
    const methodWins = buildMethodComparisonRows(red, blue).filter((r) =>
      ['koWins', 'subWins', 'decWins'].includes(r.key),
    )
    return [...technical.filter((r) => compactKeys.has(r.key)), ...methodWins]
  }

  return [...technical, ...buildMethodComparisonRows(red, blue)]
}

function buildMethodComparisonRows(red: Fighter, blue: Fighter): StatComparisonRow[] {
  const r = buildFighterMethodProfile(red)
  const b = buildFighterMethodProfile(blue)

  return [
    {
      key: 'koWins',
      label: 'Victoires KO/TKO',
      red: r.koWins,
      blue: b.koWins,
      unit: '',
      higherIsBetter: true,
      format: 'integer',
    },
    {
      key: 'subWins',
      label: 'Victoires soumission',
      red: r.subWins,
      blue: b.subWins,
      unit: '',
      higherIsBetter: true,
      format: 'integer',
    },
    {
      key: 'decWins',
      label: 'Victoires décision',
      red: r.decWins,
      blue: b.decWins,
      unit: '',
      higherIsBetter: true,
      format: 'integer',
    },
    {
      key: 'koLosses',
      label: 'Défaites KO/TKO',
      red: r.koLosses,
      blue: b.koLosses,
      unit: '',
      higherIsBetter: false,
      format: 'integer',
    },
    {
      key: 'subLosses',
      label: 'Défaites soumission',
      red: r.subLosses,
      blue: b.subLosses,
      unit: '',
      higherIsBetter: false,
      format: 'integer',
    },
    {
      key: 'decLosses',
      label: 'Défaites décision',
      red: r.decLosses,
      blue: b.decLosses,
      unit: '',
      higherIsBetter: false,
      format: 'integer',
    },
  ]
}

export function formatStatValue(row: StatComparisonRow, value: number): string {
  if (row.format === 'percent') return `${Math.round(value)}%`
  if (row.unit === 'cm') return `${Math.round(value)} cm`
  if (row.unit === 'yrs') return `${Math.round(value)} yrs`
  return String(Math.round(value))
}

function effectiveStat(value: number, higherIsBetter: boolean): number {
  return higherIsBetter ? value : Math.max(1, 120 - value)
}

/** Red corner share of a single comparison bar (0–100) */
export function statRedShare(red: number, blue: number, higherIsBetter: boolean): number {
  const r = effectiveStat(red, higherIsBetter)
  const b = effectiveStat(blue, higherIsBetter)
  const total = r + b || 1
  return (r / total) * 100
}
