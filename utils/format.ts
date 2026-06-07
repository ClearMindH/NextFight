import type { FightMethod } from '@/types'

export function formatEventDate(iso: string): string {
  return new Intl.DateTimeFormat('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date(iso))
}

export function formatShortDate(iso: string): string {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date(iso))
}

export const methodLabels: Record<FightMethod, string> = {
  ko_tko: 'KO / TKO',
  submission: 'Soumission',
  decision: 'Décision',
  draw: 'Match nul',
}

export function formatPercent(value: number): string {
  return `${Math.round(value)}%`
}

/** Délai depuis un combat passé (évite « 6m » lu comme minutes). */
export function formatMonthsAgo(months: number): string {
  if (months <= 0) return 'Récent'
  if (months === 1) return '1 mois'
  return `${months} mois`
}

/** Surnom affiché sous le portrait (sans guillemets parasites). */
export function formatFighterNickname(raw?: string | null): string | null {
  if (!raw?.trim()) return null
  const cleaned = raw
    .trim()
    .replace(/&#039;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/&amp;/g, '&')
    .replace(/^["']+|["']+$/g, '')
  return cleaned || null
}
