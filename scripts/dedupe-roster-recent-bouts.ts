/**
 * Supprime les doublons dans recentBouts pour tous les rosters.
 * Usage: npm run dedupe:recent-bouts
 */
import { dedupeRecentBouts } from '../lib/recent-bouts'
import { loadRoster, ORG_IDS, saveRoster } from '../lib/roster-store'

function main() {
  let fixed = 0
  for (const orgId of ORG_IDS) {
    const roster = loadRoster(orgId)
    const fighters = roster.fighters.map((f) => {
      if (!f.recentBouts?.length) return f
      const next = dedupeRecentBouts(f.recentBouts)
      if (next.length !== f.recentBouts.length) fixed += 1
      return { ...f, recentBouts: next }
    })
    saveRoster(orgId, { ...roster, fighters })
  }
  console.log(`Done. ${fixed} fighters cleaned.`)
}

main()
