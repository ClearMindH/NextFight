import type { UfcAthleteStat, UfcJsonApiAthlete } from '@/lib/mappers/ufc-com'
import { mapUfcJsonAthlete } from '@/lib/mappers/ufc-com'
import { getAllFightersFromStore } from '@/lib/roster-store'
import type { FightMethod, Fighter } from '@/types'
import type { FighterRecentBout } from '@/types/recent-form'

const UFC_BASE = 'https://www.ufc.com'
const FETCH_TIMEOUT_MS = 25_000

async function fetchText(url: string): Promise<string> {
  const res = await fetch(url, {
    headers: { 'User-Agent': 'NextFight-Enrichment/1.0', Accept: 'text/html,application/json' },
    signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
  })
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  return res.text()
}

export async function fetchUfcAthleteStatAttributes(
  statRelatedUrl: string,
): Promise<UfcAthleteStat['attributes'] | undefined> {
  const res = await fetch(statRelatedUrl, {
    headers: { 'User-Agent': 'NextFight-Enrichment/1.0', Accept: 'application/vnd.api+json' },
    signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
  })
  if (!res.ok) return undefined
  const json = (await res.json()) as { data?: { attributes?: UfcAthleteStat['attributes'] } }
  return json.data?.attributes
}

export async function fetchUfcAthleteJsonNode(slug: string): Promise<UfcJsonApiAthlete | null> {
  const url = `${UFC_BASE}/jsonapi/node/athlete?filter[path.alias]=/athlete/${encodeURIComponent(slug)}`
  const res = await fetch(url, {
    headers: { 'User-Agent': 'NextFight-Enrichment/1.0', Accept: 'application/vnd.api+json' },
    signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
  })
  if (!res.ok) return null
  const json = (await res.json()) as { data?: UfcJsonApiAthlete[] }
  return json.data?.[0] ?? null
}

function parseMethod(raw: string): FightMethod {
  const t = raw.toLowerCase()
  if (/soum|sub/i.test(t)) return 'submission'
  if (/ko|tko|nock/i.test(t)) return 'ko_tko'
  return 'decision'
}

function opponentTierFromStore(opponentName: string): number {
  const norm = opponentName.toLowerCase().replace(/[^a-z0-9]/g, '')
  const hit = getAllFightersFromStore().find(
    (f) => f.name.toLowerCase().replace(/[^a-z0-9]/g, '') === norm,
  )
  if (hit?.ranking && hit.ranking <= 15) return 90 - (hit.ranking - 1) * 4
  if (hit) return 55
  return 50
}

/** Stats Fight Metrics visibles sur la fiche athlète (fallback si JSON:API stat vide). */
export function parseUfcAthletePageStats(html: string): Partial<Fighter['stats']> | undefined {
  const nums = [...html.matchAll(/c-stat-compare__number">([0-9.]+)/g)].map((m) => parseFloat(m[1]))
  if (nums.length < 8) return undefined

  const [slpm, sapm, tdAvg, subAvg, strAcc, strDef, tdAcc, tdDef] = nums
  return {
    slpm,
    sapm,
    tdAvg,
    subAvg,
    strikingAccuracy: Math.round(strAcc),
    strikeDefense: Math.round(strDef),
    takedownAccuracy: Math.round(tdAcc),
    takedownDefense: Math.round(tdDef),
  }
}

/** Parse le bloc « Last fight » sur la fiche athlète UFC.com (données réelles, 0–1 combat). */
export function parseUfcAthleteLastFights(
  html: string,
  athleteName: string,
): FighterRecentBout[] {
  const idx = html.indexOf('c-card-event--past')
  if (idx < 0) return []

  const block = html.slice(idx, idx + 14_000)
  const selfNorm = athleteName.toLowerCase().replace(/[^a-z0-9]/g, '')

  const alts = [...block.matchAll(/alt="([^"]+)"/gi)].map((m) => m[1].trim())
  const names = alts.filter((n) => n.length > 2 && !/flag|logo|ufc/i.test(n))
  const opponent = names.find(
    (n) => n.toLowerCase().replace(/[^a-z0-9]/g, '') !== selfNorm,
  )
  if (!opponent) return []

  const selfWon = /athlete-fight__plaque\s+win/i.test(block)
  const selfLost = /athlete-fight__plaque\s+loss/i.test(block)
  if (!selfWon && !selfLost) return []

  const methodRaw =
    block.match(/c-card-event--athlete-fight__method[^>]*>([\s\S]*?)<\/div>/i)?.[1] ??
    block.match(/c-card-event--athlete-fight__result[^>]*>([\s\S]*?)<\/div>/i)?.[1] ??
    ''
  const methodText = methodRaw.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim()

  const roundMatch = methodText.match(/R(?:ound)?\s*(\d)/i) ?? block.match(/Round\s*(\d)/i)

  return [
    {
      opponentName: opponent,
      result: selfWon ? 'win' : 'loss',
      method: parseMethod(methodText || 'decision'),
      round: roundMatch ? Number(roundMatch[1]) : undefined,
      opponentTier: opponentTierFromStore(opponent),
      monthsAgo: 4,
    },
  ]
}

export async function enrichUfcFighterFromOfficialSite(
  fighter: Fighter,
): Promise<Fighter> {
  const slug = fighter.id.replace(/^ufc-/, '')
  if (!slug) return fighter

  let next = { ...fighter }

  let pageHtml: string | undefined
  try {
    pageHtml = await fetchText(`${UFC_BASE}/athlete/${slug}`)
    const bouts = parseUfcAthleteLastFights(pageHtml, fighter.name)
    if (bouts.length > 0) {
      const merged = [...bouts, ...(fighter.recentBouts ?? [])].slice(0, 5)
      next = { ...next, recentBouts: merged }
    }
    const pageStats = parseUfcAthletePageStats(pageHtml)
    if (pageStats) {
      next = {
        ...next,
        stats: { ...next.stats, ...pageStats },
        source: next.source === 'event-card' ? 'ufc.com' : next.source,
      }
    }
  } catch {
    /* page optionnelle */
  }

  try {
    const node = await fetchUfcAthleteJsonNode(slug)
    if (!node) return next

    const statUrl = node.relationships?.athlete_stat?.links?.related?.href
    const statAttrs = statUrl ? await fetchUfcAthleteStatAttributes(statUrl) : undefined
    const mapped = mapUfcJsonAthlete(node, statAttrs, {
      slug,
      name: fighter.name,
      record: fighter.record,
      wins: fighter.wins,
      losses: fighter.losses,
      draws: fighter.draws,
      weightClass: fighter.weightClass,
      imageUrl: fighter.imageUrl,
    })

    next = {
      ...mapped,
      recentBouts: next.recentBouts ?? mapped.recentBouts,
      ranking: fighter.ranking ?? mapped.ranking,
      nickname: fighter.nickname || mapped.nickname,
      imageUrl: fighter.imageUrl || mapped.imageUrl,
      lastSyncedAt: new Date().toISOString(),
      source: statAttrs ? 'ufc.com' : fighter.source,
    }
  } catch {
    /* json optionnel */
  }

  return next
}
