/**
 * Sync PFL World Tournament roster from https://pflmma.com/wt-fighter-roster
 * Uses the same AJAX endpoint as the site's infinite scroll (/ajax/query_fighters).
 *
 * Usage: npm run sync:pfl-roster
 */
import { readFileSync, existsSync } from 'node:fs'
import { join } from 'node:path'
import { slugifyId } from '../lib/mappers/ufc-api'
import {
  PFL_QUERY_FIGHTERS_URL,
  PFL_WT_ROSTER_URL,
  mapPflHtmlToFighter,
  parsePflFighterCardsHtml,
  parsePflProfileHtml,
  type PflHtmlFighter,
} from '../lib/mappers/pfl-com'
import { saveRoster } from '../lib/roster-store'
import type { Fighter, OrganizationRoster } from '../types'

const PFL_PATH = join(process.cwd(), 'data', 'rosters', 'pfl.json')
const FETCH_TIMEOUT_MS = 45_000
const PROFILE_CONCURRENCY = 6
const PROFILE_DELAY_MS = 200

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

async function openRosterSession(jar: CookieJar): Promise<{ csrf: string; html: string }> {
  const res = await fetchWithSession(PFL_WT_ROSTER_URL, jar, {
    headers: {
      'User-Agent': 'NextFight-RosterSync/1.0 (PFL WT roster)',
      Accept: 'text/html',
    },
  })
  if (!res.ok) throw new Error(`HTTP ${res.status} loading ${PFL_WT_ROSTER_URL}`)
  const html = await res.text()
  const csrf = html.match(/data-csrf="([^"]+)"/)?.[1]
  if (!csrf) throw new Error('CSRF token not found on PFL roster page')
  return { csrf, html }
}

interface QueryFightersResponse {
  html?: string
  total?: number
  count?: number
}

async function queryFightersPage(
  jar: CookieJar,
  csrf: string,
  page: number,
): Promise<QueryFightersResponse> {
  const form = new FormData()
  form.append('season_type', 'wt')
  form.append('season_year', '2025')
  form.append('weightclass', '')
  form.append('gender', '')
  form.append('query_s', '')
  form.append('page', String(page))

  const res = await fetchWithSession(PFL_QUERY_FIGHTERS_URL, jar, {
    method: 'POST',
    headers: {
      'User-Agent': 'NextFight-RosterSync/1.0',
      Accept: 'application/json',
      'X-CSRF-TOKEN': csrf,
      'X-Requested-With': 'XMLHttpRequest',
      Referer: PFL_WT_ROSTER_URL,
    },
    body: form,
  })

  if (!res.ok) {
    const body = await res.text()
    throw new Error(`HTTP ${res.status} query_fighters page ${page}: ${body.slice(0, 200)}`)
  }

  return (await res.json()) as QueryFightersResponse
}

async function fetchAllRosterHtml(jar: CookieJar, csrf: string, initialHtml: string): Promise<string> {
  const chunks: string[] = [initialHtml]
  let page = 2

  console.log('Fetching PFL WT roster pages (AJAX)…')

  while (page < 200) {
    const data = await queryFightersPage(jar, csrf, page)
    const batch = data.html ?? ''
    const count = data.count ?? 0

    console.log(`  Page ${page}: +${count} cards (html ${batch.length} chars)`)

    if (!batch || count === 0) break
    chunks.push(batch)
    page += 1
    await new Promise((r) => setTimeout(r, 350))
  }

  return chunks.join('\n')
}

async function enrichProfiles(rows: PflHtmlFighter[]): Promise<Map<string, ReturnType<typeof parsePflProfileHtml>>> {
  const map = new Map<string, ReturnType<typeof parsePflProfileHtml>>()
  let index = 0

  console.log(`Enriching ${rows.length} fighter profiles (weight, reach, age)…`)

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
        if (res.ok) {
          const html = await res.text()
          map.set(row.slug, parsePflProfileHtml(html))
        }
      } catch {
        // skip failed profile
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
  if (!existsSync(PFL_PATH)) return null
  return JSON.parse(readFileSync(PFL_PATH, 'utf-8')) as OrganizationRoster
}

function mergeExisting(incoming: Fighter[], existing: OrganizationRoster | null): Fighter[] {
  if (!existing) return incoming
  const prev = new Map(existing.fighters.map((f) => [slugifyId(f.name), f]))
  return incoming.map((f) => {
    const old = prev.get(slugifyId(f.name))
    if (!old) return f
    return {
      ...f,
      nickname: f.nickname || old.nickname,
      imageUrl: f.imageUrl || old.imageUrl,
      weightClass: f.weightClass || old.weightClass,
      ranking: old.ranking,
      stats: { ...old.stats, ...f.stats },
      source: 'merged',
    }
  })
}

async function main() {
  const jar: CookieJar = new Map()
  const { csrf, html: pageHtml } = await openRosterSession(jar)

  const fullHtml = await fetchAllRosterHtml(jar, csrf, pageHtml)
  const rows = parsePflFighterCardsHtml(fullHtml)

  const bySlug = new Map<string, PflHtmlFighter>()
  for (const row of rows) bySlug.set(row.slug, row)

  if (bySlug.size === 0) {
    throw new Error('No fighters parsed from pflmma.com/wt-fighter-roster')
  }

  const profiles = await enrichProfiles([...bySlug.values()])

  const fighters: Fighter[] = [...bySlug.values()]
    .map((row) => mapPflHtmlToFighter(row, 'pfl', profiles.get(row.slug)))
    .sort((a, b) => a.name.localeCompare(b.name))

  const merged = mergeExisting(fighters, loadExisting())

  const roster: OrganizationRoster = {
    meta: {
      organizationId: 'pfl',
      fighterCount: merged.length,
      lastSyncedAt: new Date().toISOString(),
      source: 'pflmma.com',
    },
    fighters: merged,
  }

  saveRoster('pfl', roster)
  console.log(`\nDone. ${merged.length} PFL WT fighters → ${PFL_PATH}`)
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
