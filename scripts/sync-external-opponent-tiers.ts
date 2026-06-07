/**
 * Résout les `opponentTier` des adversaires ABSENTS du roster via une source
 * externe (Sherdog/Tapology), avec cache persistant. Remplace les valeurs
 * placeholder (50) par une qualité dérivée du vrai palmarès.
 *
 * Usage :
 *   npm run sync:external-tiers -- --dry            (compte les candidats, sans réseau)
 *   npm run sync:external-tiers -- --limit=40       (borne les requêtes réseau)
 *   npm run sync:external-tiers -- --org=ufc
 */
import { loadRoster, saveRoster, ORG_IDS } from '@/lib/roster-store'
import { resolveOpponentTierFromRoster } from '@/lib/opponent-tier'
import {
  resolveExternalOpponentTier,
  loadOpponentRecordCache,
  saveOpponentRecordCache,
} from '@/lib/external-opponent-tier'
import { normalizeKey } from '@/lib/opponent-record-cache'
import type { OrganizationId } from '@/types'

const argv = process.argv.slice(2)
const dry = argv.includes('--dry')
const limit = Number(argv.find((a) => a.startsWith('--limit='))?.split('=')[1] ?? 80)
const orgArg = argv.find((a) => a.startsWith('--org='))?.split('=')[1] as
  | OrganizationId
  | undefined

const delay = (ms: number) => new Promise((r) => setTimeout(r, ms))

/** Recherche externe fiable seulement avec prénom + nom (désambiguïsation). */
function isResolvableName(name: string): boolean {
  return name.trim().split(/\s+/).filter((t) => t.length > 1).length >= 2
}

async function main(): Promise<void> {
  const orgs = orgArg ? [orgArg] : ORG_IDS
  const cache = loadOpponentRecordCache()

  let candidates = 0
  let skippedAmbiguous = 0
  let networkLookups = 0
  let resolved = 0
  let applied = 0

  for (const orgId of orgs) {
    const roster = loadRoster(orgId)
    let changed = false

    const fighters = [...roster.fighters]
    for (let i = 0; i < fighters.length; i++) {
      const fighter = fighters[i]
      if (!fighter.recentBouts?.length) continue
      let fighterChanged = false

      const recentBouts = []
      for (const bout of fighter.recentBouts) {
        // Géré par le roster ? on n'y touche pas.
        if (resolveOpponentTierFromRoster(bout.opponentName, fighter.weightClass) != null) {
          recentBouts.push(bout)
          continue
        }

        candidates += 1

        // Nom ambigu (un seul mot) → trop risqué à matcher, on laisse le défaut.
        if (!isResolvableName(bout.opponentName)) {
          skippedAmbiguous += 1
          recentBouts.push(bout)
          continue
        }

        if (dry) {
          recentBouts.push(bout)
          continue
        }

        const key = normalizeKey(bout.opponentName)
        const wasCached = cache[key] != null
        if (!wasCached && networkLookups >= limit) {
          recentBouts.push(bout)
          continue
        }

        const tier = await resolveExternalOpponentTier(bout.opponentName, cache)
        if (!wasCached) {
          networkLookups += 1
          await delay(600)
        }

        if (tier != null) {
          resolved += 1
          if (tier !== bout.opponentTier) {
            applied += 1
            fighterChanged = true
            recentBouts.push({ ...bout, opponentTier: tier })
            continue
          }
        }
        recentBouts.push(bout)
      }

      if (fighterChanged) {
        changed = true
        fighters[i] = { ...fighter, recentBouts }
      }
    }

    if (changed && !dry) saveRoster(orgId, { ...roster, fighters })
    console.log(`  ${orgId.toUpperCase()}: ${changed && !dry ? 'mis à jour' : 'inchangé'}`)
  }

  if (!dry) saveOpponentRecordCache(cache)

  console.log(
    `\nCandidats hors roster : ${candidates} · ambigus ignorés (nom seul) : ${skippedAmbiguous}` +
      (dry
        ? ` · résolvables : ${candidates - skippedAmbiguous} (mode --dry).`
        : ` · requêtes réseau : ${networkLookups} · résolus : ${resolved} · appliqués : ${applied}`),
  )
  if (!dry && networkLookups >= limit) {
    console.log(`Limite ${limit} atteinte — relance pour traiter le reste.`)
  }
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
