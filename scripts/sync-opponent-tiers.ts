import { loadRoster, saveRoster, ORG_IDS } from '@/lib/roster-store'
import { resolveOpponentTier } from '@/lib/opponent-tier'

/**
 * Recalcule et persiste la qualité d'adversaire (`opponentTier`) de chaque
 * combat récent à partir des données réelles du roster (classement, palmarès,
 * forme). Remplace les valeurs placeholder (50) par des notes différenciées.
 *
 * Sans réseau : tout est dérivé du roster local.
 */
function bucket(t: number): string {
  if (t < 45) return '<45'
  if (t < 55) return '45–54'
  if (t < 65) return '55–64'
  if (t < 75) return '65–74'
  return '75+'
}

function main(): void {
  const before: Record<string, number> = {}
  const after: Record<string, number> = {}
  let boutsUpdated = 0
  let fightersTouched = 0

  for (const orgId of ORG_IDS) {
    const roster = loadRoster(orgId)
    let changed = false

    const fighters = roster.fighters.map((fighter) => {
      if (!fighter.recentBouts?.length) return fighter
      let fighterChanged = false

      const recentBouts = fighter.recentBouts.map((bout) => {
        before[bucket(bout.opponentTier)] = (before[bucket(bout.opponentTier)] ?? 0) + 1
        const tier = resolveOpponentTier(bout.opponentName, fighter.weightClass)
        after[bucket(tier)] = (after[bucket(tier)] ?? 0) + 1
        if (tier !== bout.opponentTier) {
          boutsUpdated += 1
          fighterChanged = true
          return { ...bout, opponentTier: tier }
        }
        return bout
      })

      if (fighterChanged) {
        changed = true
        fightersTouched += 1
        return { ...fighter, recentBouts }
      }
      return fighter
    })

    if (changed) saveRoster(orgId, { ...roster, fighters })
    console.log(`  ${orgId.toUpperCase()}: ${changed ? 'mis à jour' : 'inchangé'}`)
  }

  console.log(`\nCombattants modifiés : ${fightersTouched} · combats ré-évalués : ${boutsUpdated}`)
  console.log('\nDistribution opponentTier (avant → après) :')
  for (const key of ['<45', '45–54', '55–64', '65–74', '75+']) {
    console.log(`  ${key.padEnd(6)} : ${(before[key] ?? 0).toString().padStart(4)} → ${(after[key] ?? 0).toString().padStart(4)}`)
  }
}

main()
