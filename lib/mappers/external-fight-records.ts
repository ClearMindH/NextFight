/**
 * Enrichissement optionnel via Sherdog & Tapology (profils publics).
 * Utilisé quand le roster UFC est incomplet (0-0-0, pas d'historique récent).
 */

export type ExternalMethodCounts = {
  koWins: number
  subWins: number
  decWins: number
  koLosses: number
  subLosses: number
  decLosses: number
  wins: number
  losses: number
  source: 'sherdog' | 'tapology' | 'merged'
}

const cache = new Map<string, ExternalMethodCounts | null>()
const FETCH_TIMEOUT_MS = 8000

const UA =
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'

const FETCH_HEADERS: Record<string, string> = {
  'User-Agent': UA,
  Accept: 'text/html,application/xhtml+xml',
  'Accept-Language': 'en-US,en;q=0.9',
}

function normalizeName(name: string): string {
  return name
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase()
    .trim()
}

function methodFromLabel(label: string): 'ko' | 'sub' | 'dec' | null {
  const t = label.toLowerCase()
  if (/ko|tko|knockout/.test(t)) return 'ko'
  if (/sub|soumission|choke|armbar|triangle|guillotine/.test(t)) return 'sub'
  if (/dec|decision|unanimous|split|majority/.test(t)) return 'dec'
  return null
}

function emptyCounts(source: 'sherdog' | 'tapology'): ExternalMethodCounts {
  return {
    koWins: 0,
    subWins: 0,
    decWins: 0,
    koLosses: 0,
    subLosses: 0,
    decLosses: 0,
    wins: 0,
    losses: 0,
    source,
  }
}

async function fetchHtml(url: string): Promise<string | null> {
  const ctrl = new AbortController()
  const timer = setTimeout(() => ctrl.abort(), FETCH_TIMEOUT_MS)
  try {
    const res = await fetch(url, {
      signal: ctrl.signal,
      headers: FETCH_HEADERS,
      next: { revalidate: 86400 },
    })
    if (!res.ok) return null
    return await res.text()
  } catch {
    return null
  } finally {
    clearTimeout(timer)
  }
}

function addSherdogBout(
  out: ExternalMethodCounts,
  result: 'win' | 'loss',
  methodText: string,
): void {
  const kind = methodFromLabel(methodText) ?? 'dec'
  if (result === 'win') {
    out.wins += 1
    if (kind === 'ko') out.koWins += 1
    else if (kind === 'sub') out.subWins += 1
    else out.decWins += 1
  } else {
    out.losses += 1
    if (kind === 'ko') out.koLosses += 1
    else if (kind === 'sub') out.subLosses += 1
    else out.decLosses += 1
  }
}

/** Parse l'historique Sherdog (colonnes résultat + méthode). */
export function parseSherdogFightHistory(html: string): ExternalMethodCounts {
  const out = emptyCounts('sherdog')

  const modernTable = html.match(
    /class="new_table fighter"[\s\S]*?<\/table>/i,
  )?.[0]
  if (modernTable) {
    for (const row of modernTable.matchAll(/<tr>([\s\S]*?)<\/tr>/gi)) {
      const block = row[1]
      const result = block.match(/final_result\s+(win|loss)/i)?.[1]?.toLowerCase()
      if (result !== 'win' && result !== 'loss') continue

      const methodText =
        block.match(/class="winby"[^>]*>\s*<b>([^<]+)</i)?.[1] ??
        block.match(/<b>([^<]*(?:KO|TKO|Submission|Decision)[^<]*)</i)?.[1] ??
        ''
      addSherdogBout(out, result, methodText)
    }
  }

  if (out.wins + out.losses > 0) return out

  const rows = [
    ...html.matchAll(
      /<tr[^>]*class="[^"]*fight_history_row[^"]*"[^>]*>([\s\S]*?)<\/tr>/gi,
    ),
  ]
  for (const row of rows) {
    const block = row[1]
    const isWin =
      /class="[^"]*win[^"]*"/i.test(block) || />\s*W\s*</i.test(block)
    const isLoss =
      /class="[^"]*loss[^"]*"/i.test(block) || />\s*L\s*</i.test(block)
    if (!isWin && !isLoss) continue

    const methodCell =
      block.match(
        /<td[^>]*class="[^"]*sub_line[^"]*"[^>]*>([\s\S]*?)<\/td>/i,
      )?.[1] ??
      block.match(
        /<td[^>]*>([^<]*(?:KO|TKO|Submission|Decision)[^<]*)<\/td>/i,
      )?.[1] ??
      ''
    const methodText = methodCell
      .replace(/<[^>]+>/g, ' ')
      .replace(/\s+/g, ' ')
      .trim()
    addSherdogBout(out, isWin ? 'win' : 'loss', methodText)
  }

  return out
}

export async function fetchSherdogMethodCounts(
  fighterName: string,
): Promise<ExternalMethodCounts | null> {
  const searchUrl = `https://www.sherdog.com/stats/fightfinder?SearchTxt=${encodeURIComponent(fighterName)}`
  const searchHtml = await fetchHtml(searchUrl)
  if (!searchHtml) return null

  const target = normalizeName(fighterName)
  const links = [...searchHtml.matchAll(/href="(\/fighter\/[^"]+)"[^>]*>([^<]+)</gi)]
  const match =
    links.find((m) => normalizeName(m[2]) === target) ??
    links.find((m) => normalizeName(m[2]).includes(target.split(' ').pop() ?? ''))

  if (!match) return null

  const profileHtml = await fetchHtml(`https://www.sherdog.com${match[1]}`)
  if (!profileHtml) return null

  const parsed = parseSherdogFightHistory(profileHtml)
  return parsed.wins + parsed.losses > 0 ? parsed : null
}

/** Tapology : historique bouts (win/loss + méthode texte). */
export function parseTapologyFightHistory(html: string): ExternalMethodCounts {
  const out = emptyCounts('tapology')
  const bouts = [
    ...html.matchAll(
      /data-fighter-bout-result="(win|loss)"[\s\S]*?data-fighter-bout-method="([^"]+)"/gi,
    ),
  ]

  for (const bout of bouts) {
    const result = bout[1].toLowerCase()
    const kind = methodFromLabel(bout[2]) ?? 'dec'
    if (result === 'win') {
      out.wins += 1
      if (kind === 'ko') out.koWins += 1
      else if (kind === 'sub') out.subWins += 1
      else out.decWins += 1
    } else {
      out.losses += 1
      if (kind === 'ko') out.koLosses += 1
      else if (kind === 'sub') out.subLosses += 1
      else out.decLosses += 1
    }
  }

  if (out.wins + out.losses === 0) {
    const fallback = [
      ...html.matchAll(/<span[^>]*class="[^"]*result[^"]*"[^>]*>\s*(W|L)\s*<\/span>[\s\S]{0,400}?(KO\/TKO|Submission|Decision)/gi),
    ]
    for (const row of fallback) {
      const isWin = row[1] === 'W'
      const kind = methodFromLabel(row[2]) ?? 'dec'
      if (isWin) {
        out.wins += 1
        if (kind === 'ko') out.koWins += 1
        else if (kind === 'sub') out.subWins += 1
        else out.decWins += 1
      } else {
        out.losses += 1
        if (kind === 'ko') out.koLosses += 1
        else if (kind === 'sub') out.subLosses += 1
        else out.decLosses += 1
      }
    }
  }

  return out
}

export async function fetchTapologyMethodCounts(
  fighterName: string,
): Promise<ExternalMethodCounts | null> {
  const searchUrl = `https://www.tapology.com/search?term=${encodeURIComponent(fighterName)}`
  const searchHtml = await fetchHtml(searchUrl)
  if (!searchHtml) return null

  const target = normalizeName(fighterName)
  const links = [
    ...searchHtml.matchAll(/href="(\/fightcenter\/fighters\/[^"]+)"[^>]*>([^<]+)</gi),
  ]
  const match =
    links.find((m) => normalizeName(m[2]) === target) ??
    links.find((m) => normalizeName(m[2]).includes(target.split(' ').pop() ?? ''))

  if (!match) return null

  const profileHtml = await fetchHtml(`https://www.tapology.com${match[1]}`)
  if (!profileHtml) return null

  const parsed = parseTapologyFightHistory(profileHtml)
  return parsed.wins + parsed.losses > 0 ? parsed : null
}

function mergeExternal(
  a: ExternalMethodCounts,
  b: ExternalMethodCounts,
): ExternalMethodCounts {
  return {
    koWins: Math.max(a.koWins, b.koWins),
    subWins: Math.max(a.subWins, b.subWins),
    decWins: Math.max(a.decWins, b.decWins),
    koLosses: Math.max(a.koLosses, b.koLosses),
    subLosses: Math.max(a.subLosses, b.subLosses),
    decLosses: Math.max(a.decLosses, b.decLosses),
    wins: Math.max(a.wins, b.wins),
    losses: Math.max(a.losses, b.losses),
    source: 'merged',
  }
}

/** Sherdog + Tapology, mis en cache par nom. */
export async function fetchExternalMethodCounts(
  fighterName: string,
): Promise<ExternalMethodCounts | null> {
  const key = normalizeName(fighterName)
  if (cache.has(key)) return cache.get(key) ?? null

  const [sherdog, tapology] = await Promise.all([
    fetchSherdogMethodCounts(fighterName),
    fetchTapologyMethodCounts(fighterName),
  ])

  let merged: ExternalMethodCounts | null = null
  if (sherdog && tapology) merged = mergeExternal(sherdog, tapology)
  else merged = sherdog ?? tapology

  cache.set(key, merged)
  return merged
}
