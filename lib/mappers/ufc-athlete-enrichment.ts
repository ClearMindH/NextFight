import type { UfcAthleteStat, UfcJsonApiAthlete } from '@/lib/mappers/ufc-com'
import { mapUfcJsonAthlete } from '@/lib/mappers/ufc-com'
import { normalizeUfcAthleteSlug } from '@/lib/fighter-id-canonical'
import { dedupeRecentBouts } from '@/lib/recent-bouts'
import { resolveOpponentTier } from '@/lib/opponent-tier'
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

/** Surnom affiché sur la fiche athlète (ex. « All In », « The Golden Boy »). */
/** Portrait officiel (og:image ou image hero). */
export function parseUfcAthletePortraitUrl(html: string): string | undefined {
  const og = html.match(/property="og:image"\s+content="([^"]+)"/i)?.[1]
  if (og && !/silhouette|comingsoon/i.test(og)) {
    return og.replace(/&amp;/g, '&')
  }
  const img = html.match(
    /event_fight_card_upper_body_of_standing_athlete[^"]*"[^>]*src="([^"]+)"/i,
  )?.[1]
  if (img && !/silhouette|comingsoon/i.test(img)) {
    return img.replace(/&amp;/g, '&')
  }
  return undefined
}

export async function fetchUfcAthletePortraitUrl(slug: string): Promise<string | undefined> {
  try {
    const html = await fetchText(`${UFC_BASE}/athlete/${slug}`)
    return parseUfcAthletePortraitUrl(html)
  } catch {
    return undefined
  }
}

export function parseUfcAthleteNickname(html: string): string | undefined {
  const raw =
    html.match(/hero-profile__nickname[^>]*>([^<]+)/i)?.[1] ??
    html.match(/c-hero-athlete__nickname[^>]*>([^<]+)/i)?.[1]
  if (!raw) return undefined

  const cleaned = raw
    .trim()
    .replace(/&quot;/g, '')
    .replace(/&#039;/g, "'")
    .replace(/^["']+|["']+$/g, '')
    .trim()

  return cleaned || undefined
}

export async function fetchUfcAthleteNickname(slug: string): Promise<string | undefined> {
  try {
    const html = await fetchText(`${UFC_BASE}/athlete/${slug}`)
    return parseUfcAthleteNickname(html)
  } catch {
    return undefined
  }
}

/** Ex. « 18-4-0 (W-L-D) » sur la fiche UFC.com */
export function parseUfcAthleteRecord(
  html: string,
): { record: string; wins: number; losses: number; draws: number } | undefined {
  const raw =
    html.match(/hero-profile__division-body[^>]*>\s*([0-9]+-[0-9]+-[0-9]+)/i)?.[1] ??
    html.match(/c-hero-athlete__record[^>]*>\s*([0-9]+-[0-9]+-[0-9]+)/i)?.[1]
  if (!raw) return undefined

  const [w, l, d] = raw.split('-').map(Number)
  if (!Number.isFinite(w) || !Number.isFinite(l)) return undefined
  const draws = Number.isFinite(d) ? d : 0
  return { wins: w, losses: l, draws, record: `${w}-${l}-${draws}` }
}

function parseMethod(raw: string): FightMethod {
  const t = raw.toLowerCase()
  if (/soum|sub/i.test(t)) return 'submission'
  if (/ko|tko|nock/i.test(t)) return 'ko_tko'
  return 'decision'
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

function monthsAgoFromUfcDateLabel(label: string, now = new Date()): number {
  const frMonths: Record<string, number> = {
    jan: 0,
    fév: 1,
    fev: 1,
    mar: 2,
    avr: 3,
    mai: 4,
    juin: 5,
    jun: 5,
    juil: 6,
    jul: 6,
    août: 7,
    aout: 7,
    sep: 8,
    oct: 9,
    nov: 10,
    déc: 11,
    dec: 11,
  }

  const m = label.trim().match(/(\d{1,2})\s+([A-Za-zàâéèêëïîôùûüç.]+)\.?\s+(\d{4})/i)
  if (!m) return 6

  const day = Number(m[1])
  const monKey = m[2].toLowerCase().replace(/\./g, '')
  let month = 0
  for (const [key, value] of Object.entries(frMonths)) {
    if (monKey.startsWith(key)) {
      month = value
      break
    }
  }

  const fightDate = new Date(Number(m[3]), month, day)
  const months = Math.round(
    (now.getTime() - fightDate.getTime()) / (1000 * 60 * 60 * 24 * 30.4),
  )
  return Math.min(36, Math.max(0, months))
}

function opponentNameFromSlug(slug: string): string {
  return slug
    .split('-')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ')
}

/** Un `alt` exploitable est un nom propre court, pas une légende de photo. */
function isCleanNameAlt(alt: string): boolean {
  const trimmed = alt.trim()
  if (trimmed.length < 2 || trimmed.length > 40) return false
  if (/\d/.test(trimmed)) return false
  return !/\b(of|in|at|during|punches|kicks|photo|getty|zuffa|llc|ufc)\b/i.test(trimmed)
}

/**
 * Nom d'adversaire le plus complet et fiable. Le slug UFC encode toujours le nom
 * entier (`stewart-nicoll` → « Stewart Nicoll »), contrairement au texte du lien
 * souvent réduit au nom de famille. On ne préfère l'`alt` que s'il est propre
 * (vraies majuscules/diacritiques) et au moins aussi complet que le slug.
 */
function chooseOpponentName(
  opponentSlug: string,
  altName?: string,
  linkText?: string,
): string {
  const slugName = opponentNameFromSlug(opponentSlug)
  const slugTokens = slugName.split(/\s+/).filter(Boolean).length

  const alt = altName?.trim()
  if (alt && isCleanNameAlt(alt) && alt.split(/\s+/).filter(Boolean).length >= slugTokens) {
    return alt
  }

  // Le slug reste la source la plus fiable dès qu'il porte un prénom + nom.
  if (slugTokens >= 2) return slugName

  // En dernier recours seulement (slug mono-token), le texte du lien.
  const link = linkText?.trim()
  return link && link.length >= slugName.length ? link : slugName
}

/** Historique « athlete-results » sur UFC.com (plusieurs combats réels). */
export function parseUfcAthleteResultsHistory(
  html: string,
  athleteSlug: string,
  athleteWeightClass?: string,
): FighterRecentBout[] {
  const selfSlug = athleteSlug.toLowerCase()
  const blocks = html.split(/<article class="c-card-event--athlete-results"/i)
  const bouts: FighterRecentBout[] = []

  for (const raw of blocks.slice(1)) {
    const redCorner = raw.match(
      /results__red-image\s+(win|loss)[\s\S]*?\/athlete\/([^"?\s#]+)/i,
    )
    const blueCorner = raw.match(
      /results__blue-image\s+(win|loss)[\s\S]*?\/athlete\/([^"?\s#]+)/i,
    )
    if (!redCorner || !blueCorner) continue

    const redSlug = redCorner[2].toLowerCase()
    const blueSlug = blueCorner[2].toLowerCase()
    let selfResult: 'win' | 'loss' | null = null
    let opponentSlug: string | null = null

    if (redSlug === selfSlug) {
      selfResult = redCorner[1].toLowerCase() as 'win' | 'loss'
      opponentSlug = blueSlug
    } else if (blueSlug === selfSlug) {
      selfResult = blueCorner[1].toLowerCase() as 'win' | 'loss'
      opponentSlug = redSlug
    } else {
      continue
    }

    const dateLabel =
      raw.match(/athlete-results__date">([^<]+)/i)?.[1]?.trim() ?? ''
    const methodLabel =
      raw.match(/athlete-results__result-label">M[ée]thode<\/div>\s*<div[^>]*athlete-results__result-text">([^<]+)/i)?.[1]?.trim() ??
      raw.match(/M[ée]thode<\/div>\s*<div[^>]*>([^<]+)/i)?.[1]?.trim() ??
      ''
    const roundText =
      raw.match(/athlete-results__result-label">Round<\/div>\s*<div[^>]*athlete-results__result-text">(\d+)/i)?.[1]

    const opponentAlt = raw.match(
      new RegExp(
        `/athlete/${opponentSlug.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}"[^>]*>[^<]*<[^>]*alt="([^"]+)"`,
        'i',
      ),
    )?.[1]
    const opponentLinkText = raw.match(
      new RegExp(`/athlete/${opponentSlug}[^>]*>([^<]+)</a>`, 'i'),
    )?.[1]
    const opponentName = chooseOpponentName(
      opponentSlug,
      opponentAlt,
      opponentLinkText,
    )

    bouts.push({
      opponentName,
      result: selfResult,
      method: parseMethod(methodLabel || 'decision'),
      round: roundText ? Number(roundText) : undefined,
      opponentTier: resolveOpponentTier(opponentName, athleteWeightClass),
      monthsAgo: monthsAgoFromUfcDateLabel(dateLabel),
    })
  }

  return bouts
}

/** Fallback : bloc « Last fight » (un seul combat). */
function parseUfcAthleteLastFightLegacy(
  html: string,
  athleteName: string,
  athleteWeightClass?: string,
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
      opponentTier: resolveOpponentTier(opponent, athleteWeightClass),
      monthsAgo: 4,
    },
  ]
}

/** Parse l’historique récent UFC.com (0 à 5 combats réels). */
export function parseUfcAthleteLastFights(
  html: string,
  athleteName: string,
  athleteSlug?: string,
  athleteWeightClass?: string,
): FighterRecentBout[] {
  const slug =
    athleteSlug ??
    normalizeUfcAthleteSlug(athleteName.toLowerCase().replace(/\s+/g, '-'), athleteName) ??
    athleteName.toLowerCase().replace(/[^a-z0-9]+/g, '-')

  const fromResults = parseUfcAthleteResultsHistory(html, slug, athleteWeightClass)
  if (fromResults.length > 0) return dedupeRecentBouts(fromResults)

  return dedupeRecentBouts(
    parseUfcAthleteLastFightLegacy(html, athleteName, athleteWeightClass),
  )
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
    const bouts = parseUfcAthleteLastFights(
      pageHtml,
      fighter.name,
      slug,
      fighter.weightClass,
    )
    if (bouts.length > 0) {
      next = { ...next, recentBouts: bouts }
    } else if (fighter.recentBouts?.length) {
      next = { ...next, recentBouts: dedupeRecentBouts(fighter.recentBouts) }
    }
    const pageNick = parseUfcAthleteNickname(pageHtml)
    if (pageNick) next = { ...next, nickname: pageNick }

    const pageRecord = parseUfcAthleteRecord(pageHtml)
    if (pageRecord) {
      next = { ...next, ...pageRecord }
    }

    const pageStats = parseUfcAthletePageStats(pageHtml)
    if (pageStats) {
      next = {
        ...next,
        stats: { ...next.stats, ...pageStats },
        source: next.source === 'event-card' ? 'ufc.com' : next.source,
      }
    }

    const portrait = parseUfcAthletePortraitUrl(pageHtml)
    if (portrait) next = { ...next, imageUrl: portrait }
  } catch {
    /* page optionnelle */
  }

  try {
    const node = await fetchUfcAthleteJsonNode(slug)
    if (!node) return next

    const statUrl = node.relationships?.athlete_stat?.links?.related?.href
    const statAttrs = statUrl ? await fetchUfcAthleteStatAttributes(statUrl) : undefined
    const placeholderRecord =
      fighter.record === '0-0-0' && (fighter.wins ?? 0) + (fighter.losses ?? 0) === 0

    const mapped = mapUfcJsonAthlete(node, statAttrs, {
      slug,
      name: fighter.name,
      record: placeholderRecord ? undefined : fighter.record,
      wins: placeholderRecord ? undefined : fighter.wins,
      losses: placeholderRecord ? undefined : fighter.losses,
      draws: placeholderRecord ? undefined : fighter.draws,
      weightClass: fighter.weightClass,
      imageUrl: fighter.imageUrl,
    })

    next = {
      ...mapped,
      recentBouts: next.recentBouts ?? mapped.recentBouts,
      ranking: fighter.ranking ?? mapped.ranking,
      nickname: next.nickname || mapped.nickname || fighter.nickname,
      imageUrl: next.imageUrl || fighter.imageUrl || mapped.imageUrl,
      lastSyncedAt: new Date().toISOString(),
      source: statAttrs ? 'ufc.com' : fighter.source,
    }
  } catch {
    /* json optionnel */
  }

  return next
}
