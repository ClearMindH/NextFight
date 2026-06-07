import type { Fighter, FightResult } from '@/types'
import type { FighterRecentBout } from '@/types/recent-form'
import { fighterShortName } from '@/lib/prediction-verdict'

/** Délai max (mois) pour qu'un bout récent corresponde au combat de la carte. */
export const RESULT_MATCH_MAX_MONTHS = 6

function nameKey(name: string): string {
  return fighterShortName(name)
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]/g, '')
}

/** Bout le plus récent d'un combattant face à un adversaire donné. */
function findBoutVs(fighter: Fighter, opponent: Fighter): FighterRecentBout | undefined {
  const key = nameKey(opponent.name)
  return (fighter.recentBouts ?? [])
    .filter((b) => nameKey(b.opponentName) === key)
    .sort((a, b) => a.monthsAgo - b.monthsAgo)[0]
}

function winnerFrom(
  bout: FighterRecentBout,
  self: Fighter,
  opponent: Fighter,
): string | null {
  if (bout.result === 'win') return self.id
  if (bout.result === 'loss') return opponent.id
  return null
}

/**
 * Déduit le vainqueur réel d'un combat red vs blue à partir des combats récents
 * (scrapés) des deux combattants. Renvoie null si non résolvable ou incohérent.
 * La méthode/round sont conservés mais ne sont pas destinés à l'affichage.
 */
export function deriveFightResult(
  red: Fighter,
  blue: Fighter,
  maxMonthsAgo: number = RESULT_MATCH_MAX_MONTHS,
): FightResult | null {
  const redBout = findBoutVs(red, blue)
  const blueBout = findBoutVs(blue, red)

  const reference = redBout ?? blueBout
  if (!reference || reference.monthsAgo > maxMonthsAgo) return null

  const fromRed = redBout ? winnerFrom(redBout, red, blue) : undefined
  const fromBlue = blueBout ? winnerFrom(blueBout, blue, red) : undefined

  // Si les deux coins ont une trace, elles doivent concorder.
  if (fromRed !== undefined && fromBlue !== undefined && fromRed !== fromBlue) {
    return null
  }

  const winnerId = fromRed !== undefined ? fromRed : (fromBlue as string | null)

  return {
    winnerId,
    method: reference.method,
    round: reference.round,
    source: 'recent-bouts',
  }
}
