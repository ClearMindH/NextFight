import { getPredictionKeyFactors } from '@/lib/prediction-factors'
import { buildPredictionVerdict } from '@/lib/prediction-verdict'
import type { Fight } from '@/types'

/** 2–3 lignes max sous le pronostic gratuit pour montrer la qualité d'analyse. */
export function buildPredictionSummaryLines(fight: Fight): string[] {
  const verdict = buildPredictionVerdict(fight)
  const factors = getPredictionKeyFactors(fight)
  const matchup = factors.find((factor) => factor.label === 'Avantage matchup')
  const statFactor = factors.find((factor) => factor.label !== 'Avantage matchup')

  const lines: string[] = []

  if (fight.model.adjustmentNote) {
    const detail = fight.model.adjustmentNote
      .replace(/^Notre lecture du matchup\s*:\s*/i, '')
      .replace(/^Pronostic ajusté\s*:\s*/i, '')
    lines.push(
      verdict.probabilityLine
        ? `${verdict.headline} · ${verdict.probabilityLine}.`
        : `${verdict.headline}.`,
    )
    lines.push(detail)
  } else if (matchup?.detail) {
    lines.push(`${verdict.headline} — ${matchup.detail}`)
  } else {
    lines.push(
      `${verdict.headline}${verdict.probabilityLine ? ` · ${verdict.probabilityLine}` : ''}.`,
    )
  }

  if (statFactor && lines.length < 3) {
    lines.push(
      `Facteur clé : ${statFactor.label} en faveur de ${statFactor.leaderName}. Analyse complète, méthode et niveau de risque en Premium.`,
    )
  } else if (lines.length < 2) {
    lines.push(
      `Modèle statistique multi-critères (confiance ${fight.model.confidence} %). Détail chiffré et justification en Premium.`,
    )
  }

  return lines.slice(0, 3)
}
