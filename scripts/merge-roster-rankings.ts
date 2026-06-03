/**
 * Applique les classements des seeds aux JSON roster (sans écraser un top 15 déjà présent).
 * Usage: npm run merge:roster-rankings
 */
import { mergeSeedRanking } from '../lib/roster-seed-rankings'
import { loadRoster, ORG_IDS, saveRoster } from '../lib/roster-store'

function main() {
  let updated = 0
  for (const orgId of ORG_IDS) {
    const roster = loadRoster(orgId)
    const fighters = roster.fighters.map((f) => {
      const next = mergeSeedRanking(f)
      if (next.ranking !== f.ranking) updated += 1
      return next
    })
    saveRoster(orgId, { ...roster, fighters })
    const ranked = fighters.filter((f) => f.ranking != null && f.ranking <= 15).length
    console.log(`  ${orgId}: ${ranked} fighters with division ranking`)
  }
  console.log(`\nDone. ${updated} fighters updated with seed rankings.`)
}

main()
