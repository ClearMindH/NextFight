import { loadRoster, saveRoster } from '@/lib/roster-store'
import { parseUfcAthleteLastFights } from '@/lib/mappers/ufc-athlete-enrichment'
import type { FighterRecentBout } from '@/types/recent-form'

/**
 * Répare les noms d'adversaires tronqués (nom de famille seul) des `recentBouts`
 * UFC en re-scrapant chaque fiche et en re-parsant avec la logique corrigée
 * (le slug UFC encode toujours le nom complet). Ne touche QUE `recentBouts`.
 *
 * Lancer ensuite : npm run sync:opponent-tiers && npm run sync:external-tiers
 *
 * Options : --dry (aucune écriture) · --limit=N (n combattants max).
 */
const UFC_BASE = 'https://www.ufc.com'
const RATE_LIMIT_MS = 700
const TIMEOUT_MS = 25_000

const args = process.argv.slice(2)
const DRY = args.includes('--dry')
const LIMIT = ((): number | undefined => {
  const a = args.find((x) => x.startsWith('--limit='))
  return a ? Number(a.split('=')[1]) : undefined
})()

const delay = (ms: number) => new Promise((r) => setTimeout(r, ms))

function tokenCount(name: string): number {
  return name.trim().split(/\s+/).filter(Boolean).length
}

function singleTokenCount(bouts: FighterRecentBout[]): number {
  return bouts.filter((b) => tokenCount(b.opponentName) <= 1).length
}

async function fetchPage(slug: string): Promise<string | null> {
  try {
    const res = await fetch(`${UFC_BASE}/athlete/${slug}`, {
      headers: {
        'User-Agent': 'NextFight-Enrichment/1.0',
        Accept: 'text/html,application/json',
      },
      signal: AbortSignal.timeout(TIMEOUT_MS),
    })
    if (!res.ok) return null
    return await res.text()
  } catch {
    return null
  }
}

async function main(): Promise<void> {
  const roster = loadRoster('ufc')
  const candidates = roster.fighters.filter(
    (f) => (f.recentBouts?.length ?? 0) > 0 && singleTokenCount(f.recentBouts!) > 0,
  )
  const targets = LIMIT != null ? candidates.slice(0, LIMIT) : candidates

  console.log(
    `Combattants avec noms tronqués : ${candidates.length}` +
      (LIMIT != null ? ` (traités : ${targets.length})` : '') +
      (DRY ? ' · DRY RUN' : ''),
  )

  let fightersUpdated = 0
  let namesFixedBefore = 0
  let namesFixedAfter = 0
  let pagesMissing = 0

  const byId = new Map(roster.fighters.map((f) => [f.id, f]))

  for (const fighter of targets) {
    const slug = fighter.id.replace(/^ufc-/, '')
    const html = await fetchPage(slug)
    await delay(RATE_LIMIT_MS)
    if (!html) {
      pagesMissing += 1
      continue
    }

    const fresh = parseUfcAthleteLastFights(html, fighter.name, slug, fighter.weightClass)
    if (fresh.length === 0) continue

    const stale = singleTokenCount(fighter.recentBouts!)
    const freshStale = singleTokenCount(fresh)
    // N'écrase que si on réduit réellement le nombre de noms tronqués.
    if (freshStale >= stale) continue

    const target = byId.get(fighter.id)
    if (!target) continue
    target.recentBouts = fresh
    fightersUpdated += 1
    namesFixedBefore += stale
    namesFixedAfter += freshStale
    console.log(
      `  ${fighter.name}: tronqués ${stale} → ${freshStale}` +
        ` · ex. ${fresh.map((b) => b.opponentName).slice(0, 3).join(', ')}`,
    )
  }

  console.log(
    `\nCombattants mis à jour : ${fightersUpdated} · noms tronqués ${namesFixedBefore} → ${namesFixedAfter}` +
      ` · pages indisponibles : ${pagesMissing}`,
  )

  if (!DRY && fightersUpdated > 0) {
    saveRoster('ufc', { ...roster, fighters: [...byId.values()] })
    console.log('Roster UFC sauvegardé.')
  } else if (DRY) {
    console.log('DRY RUN — aucune écriture.')
  }
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
