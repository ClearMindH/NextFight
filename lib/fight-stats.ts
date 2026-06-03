import type { Fighter } from '@/types'

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

export function buildStatComparisons(red: Fighter, blue: Fighter): StatComparisonRow[] {
  return [
    {
      key: 'strikeAcc',
      label: 'Strike accuracy',
      red: red.stats.strikingAccuracy,
      blue: blue.stats.strikingAccuracy,
      unit: '%',
      higherIsBetter: true,
      format: 'percent',
    },
    {
      key: 'strikeDef',
      label: 'Strike defense',
      red: strikeDefense(red),
      blue: strikeDefense(blue),
      unit: '%',
      higherIsBetter: true,
      format: 'percent',
    },
    {
      key: 'tdAcc',
      label: 'Takedown accuracy',
      red: red.stats.takedownAccuracy,
      blue: blue.stats.takedownAccuracy,
      unit: '%',
      higherIsBetter: true,
      format: 'percent',
    },
    {
      key: 'tdDef',
      label: 'Takedown defense',
      red: takedownDefense(red),
      blue: takedownDefense(blue),
      unit: '%',
      higherIsBetter: true,
      format: 'percent',
    },
    {
      key: 'reach',
      label: 'Reach',
      red: red.stats.reachCm,
      blue: blue.stats.reachCm,
      unit: 'cm',
      higherIsBetter: true,
      format: 'integer',
    },
    {
      key: 'height',
      label: 'Height',
      red: red.stats.heightCm,
      blue: blue.stats.heightCm,
      unit: 'cm',
      higherIsBetter: true,
      format: 'integer',
    },
    {
      key: 'age',
      label: 'Age',
      red: red.stats.age,
      blue: blue.stats.age,
      unit: 'yrs',
      higherIsBetter: false,
      format: 'integer',
    },
    {
      key: 'streak',
      label: 'Win streak',
      red: red.stats.winStreak,
      blue: blue.stats.winStreak,
      unit: '',
      higherIsBetter: true,
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
