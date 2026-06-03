/**
 * Enrichit les combattants des cartes à venir pour calibrer les probabilités.
 * UFC : stats + dernier combat (ufc.com). PFL, KSW, ARES, Hexagone : inférence bilan roster.
 *
 * Usage: npm run sync:enrich-cards
 */
import { readFileSync, existsSync } from 'node:fs'
import { join } from 'node:path'
import { enrichCardFighter } from '../lib/prediction/sync-card-enrichment'
import { getFighterFromStore } from '../lib/roster-store'
import type { EventInput } from '../types/admin'
import type { OrganizationId } from '../types'

const EVENTS_PATH = join(process.cwd(), 'data', 'store', 'events.json')
const UFC_DELAY_MS = 450

function sleep(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms))
}

function collectCardFighterIds(): { orgId: OrganizationId; id: string }[] {
  if (!existsSync(EVENTS_PATH)) return []
  const store = JSON.parse(readFileSync(EVENTS_PATH, 'utf-8')) as { events: EventInput[] }
  const seen = new Set<string>()
  const out: { orgId: OrganizationId; id: string }[] = []

  for (const event of store.events) {
    for (const fight of event.fights) {
      for (const id of [fight.redId, fight.blueId]) {
        const key = `${event.organizationId}:${id}`
        if (seen.has(key)) continue
        seen.add(key)
        out.push({ orgId: event.organizationId, id })
      }
    }
  }
  return out
}

async function main(): Promise<void> {
  const targets = collectCardFighterIds()
  const byOrg = targets.reduce(
    (acc, t) => {
      acc[t.orgId] = (acc[t.orgId] ?? 0) + 1
      return acc
    },
    {} as Record<string, number>,
  )
  console.log(`NextFight — enrich ${targets.length} card fighter(s)`)
  console.log('  By org:', byOrg, '\n')

  const counts: Record<string, { enriched: number; skipped: number; failed: number }> = {}

  for (const { orgId, id } of targets) {
    counts[orgId] ??= { enriched: 0, skipped: 0, failed: 0 }

    const fighter = getFighterFromStore(id)
    if (!fighter) {
      counts[orgId].skipped += 1
      continue
    }

    if (orgId === 'ufc') await sleep(UFC_DELAY_MS)

    try {
      const result = await enrichCardFighter(orgId, fighter)
      if (result.status === 'enriched') {
        counts[orgId].enriched += 1
        console.log(`  ✓ [${orgId}] ${fighter.name} — ${result.detail}`)
      } else {
        counts[orgId].skipped += 1
      }
    } catch (e) {
      counts[orgId].failed += 1
      console.warn(`  ✗ [${orgId}] ${fighter.name}: ${(e as Error).message}`)
    }
  }

  console.log('\nDone.')
  for (const [org, c] of Object.entries(counts)) {
    console.log(`  ${org}: enriched ${c.enriched}, skipped ${c.skipped}, failed ${c.failed}`)
  }
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
