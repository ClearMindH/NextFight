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

/**
 * Décode les entités HTML courantes (ex. « O&#039;Malley » → « O'Malley »).
 * Indispensable avant de dériver un slug/ID : une entité non décodée corrompt
 * l'identifiant et casse l'enrichissement (URL erronée).
 */
export function decodeHtmlEntities(raw: string): string {
  return raw
    .replace(/&#0?39;|&apos;|&rsquo;|&lsquo;/g, "'")
    .replace(/&quot;|&#34;|&ldquo;|&rdquo;/g, '"')
    .replace(/&amp;|&#38;/g, '&')
    .replace(/&nbsp;|&#160;/g, ' ')
    .replace(/&#(\d+);/g, (_, code) => String.fromCharCode(Number(code)))
}

/** Surnom affiché sous le portrait (sans guillemets parasites). */
export function formatFighterNickname(raw?: string | null): string | null {
  if (!raw?.trim()) return null
  const cleaned = decodeHtmlEntities(raw.trim()).replace(/^["']+|["']+$/g, '')
  return cleaned || null
}
