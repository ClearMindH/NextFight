/**
 * Sync KSW roster from https://www.kswmma.com/zawodnicy
 * Uses POST /filters (same as site AJAX).
 *
 * Usage: npm run sync:ksw-roster
 */
import { readFileSync, existsSync } from 'node:fs'
import { join } from 'node:path'
import {
  KSW_FILTERS_URL,
  KSW_ROSTER_URL,
  mapKswHtmlToFighter,
  parseKswFighterCardsHtml,
  parseKswProfileHtml,
  parseLastPage,
  type KswHtmlFighter,
} from '../lib/mappers/ksw-com'
import { saveRoster } from '../lib/roster-store'
import type { Fighter, OrganizationRoster } from '../types'

const KSW_PATH = join(process.cwd(), 'data', 'rosters', 'ksw.json')
const FETCH_TIMEOUT_MS = 45_000
const PROFILE_CONCURRENCY = 8
const PROFILE_DELAY_MS = 150

type CookieJar = Map<string, string>

function applySetCookies(jar: CookieJar, headers: Headers): void {
  const list =
    typeof headers.getSetCookie === 'function'
      ? headers.getSetCookie()
      : headers.get('set-cookie')
        ? [headers.get('set-cookie')!]
        : []

  for (const raw of list) {
    const part = raw.split(';')[0]
    const eq = part.indexOf('=')
    if (eq > 0) jar.set(part.slice(0, eq), part.slice(eq + 1))
  }
}

function cookieHeader(jar: CookieJar): string {
  return [...jar.entries()].map(([k, v]) => `${k}=${v}`).join('; ')
}

function xsrfHeader(jar: CookieJar): string | undefined {
  const token = jar.get('XSRF-TOKEN')
  return token ? decodeURIComponent(token) : undefined
}

async function fetchWithSession(
  url: string,
  jar: CookieJar,
  init: RequestInit = {},
): Promise<Response> {
  const headers = new Headers(init.headers)
  const cookie = cookieHeader(jar)
  if (cookie) headers.set('Cookie', cookie)
  const xsrf = xsrfHeader(jar)
  if (xsrf) headers.set('X-XSRF-TOKEN', xsrf)

  const res = await fetch(url, {
    ...init,
    headers,
    signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
  })
  applySetCookies(jar, res.headers)
  return res
}

function extractCsrf(html: string): string {
  const csrf = html.match(/name="csrf-token"\s+content="([^"]+)"/)?.[1]
  if (!csrf) throw new Error('CSRF token not found on KSW roster page')
  return csrf
}

async function openSession(jar: CookieJar): Promise<string> {
  const res = await fetchWithSession(KSW_ROSTER_URL, jar, {
    headers: {
      'User-Agent': 'NextFight-RosterSync/1.0 (KSW roster)',
      Accept: 'text/html',
    },
  })
  if (!res.ok) throw new Error(`HTTP ${res.status} loading ${KSW_ROSTER_URL}`)
  const html = await res.text()
  return extractCsrf(html)
}

async function queryFightersPage(
  jar: CookieJar,
  csrf: string,
  page: number,
): Promise<string> {
  const res = await fetchWithSession(KSW_FILTERS_URL, jar, {
    method: 'POST',
    headers: {
      'User-Agent': 'NextFight-RosterSync/1.0',
      'Content-Type': 'application/json',
      Accept: 'text/html',
      'X-CSRF-TOKEN': csrf,
      Referer: KSW_ROSTER_URL,
    },
    body: JSON.stringify({
      type: 'player',
      filters: {
        sex: '',
        weight_id: '',
        country: '',
        search: '',
        page,
      },
      lang_id: 2,
    }),
  })

  if (!res.ok) {
    const body = await res.text()
    throw new Error(`HTTP ${res.status} /filters page ${page}: ${body.slice(0, 200)}`)
  }

  return res.text()
}

async function fetchAllListingHtml(jar: CookieJar, csrf: string): Promise<string> {
  const chunks: string[] = []
  let lastPage = 1

  console.log('Fetching KSW fighters from kswmma.com/zawodnicy…')

  for (let page = 1; page <= 50; page++) {
    const html = await queryFightersPage(jar, csrf, page)
    const cards = parseKswFighterCardsHtml(html).length
    if (page === 1) lastPage = parseLastPage(html)

    console.log(`  Page ${page}/${lastPage}: ${cards} fighters`)
    if (cards === 0) break

    chunks.push(html)
    if (page >= lastPage) break
    await new Promise((r) => setTimeout(r, 300))
  }

  return chunks.join('\n')
}

async function enrichProfiles(
  rows: KswHtmlFighter[],
): Promise<Map<string, ReturnType<typeof parseKswProfileHtml>>> {
  const map = new Map<string, ReturnType<typeof parseKswProfileHtml>>()
  let index = 0

  console.log(`Enriching ${rows.length} profiles (Rekord KSW, pays, stats)…`)

  async function worker(): Promise<void> {
    while (index < rows.length) {
      const i = index++
      const row = rows[i]
      try {
        const res = await fetch(row.profileUrl, {
          headers: {
            'User-Agent': 'NextFight-RosterSync/1.0',
            Accept: 'text/html',
          },
          signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
        })
        if (res.ok) map.set(row.slug, parseKswProfileHtml(await res.text()))
      } catch {
        // skip
      }
      await new Promise((r) => setTimeout(r, PROFILE_DELAY_MS))
    }
  }

  await Promise.all(
    Array.from({ length: Math.min(PROFILE_CONCURRENCY, rows.length) }, () => worker()),
  )

  return map
}

function loadExisting(): OrganizationRoster | null {
  if (!existsSync(KSW_PATH)) return null
  return JSON.parse(readFileSync(KSW_PATH, 'utf-8')) as OrganizationRoster
}

function mergeExisting(incoming: Fighter[], existing: OrganizationRoster | null): Fighter[] {
  if (!existing) return incoming
  const prev = new Map(existing.fighters.map((f) => [f.id, f]))
  return incoming.map((f) => {
    const old = prev.get(f.id)
    if (!old) return f
    return {
      ...f,
      nickname: old.nickname,
      imageUrl: f.imageUrl || old.imageUrl,
      ranking: f.ranking ?? old.ranking,
      stats: { ...old.stats, ...f.stats },
      source: 'merged',
    }
  })
}

async function main() {
  const jar: CookieJar = new Map()
  const csrf = await openSession(jar)
  const fullHtml = await fetchAllListingHtml(jar, csrf)

  const bySlug = new Map<string, KswHtmlFighter>()
  for (const row of parseKswFighterCardsHtml(fullHtml)) {
    bySlug.set(row.slug, row)
  }

  if (bySlug.size === 0) {
    throw new Error('No fighters parsed from kswmma.com/zawodnicy')
  }

  const profiles = await enrichProfiles([...bySlug.values()])

  const fighters = [...bySlug.values()]
    .map((row) => mapKswHtmlToFighter(row, 'ksw', profiles.get(row.slug)))
    .sort((a, b) => a.name.localeCompare(b.name))

  const merged = mergeExisting(fighters, loadExisting())

  saveRoster('ksw', {
    meta: {
      organizationId: 'ksw',
      fighterCount: merged.length,
      lastSyncedAt: new Date().toISOString(),
      source: 'kswmma.com',
    },
    fighters: merged,
  })

  console.log(`\nDone. ${merged.length} KSW fighters → ${KSW_PATH}`)
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
