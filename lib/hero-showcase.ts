import { getEvents } from '@/data/events'
import { getUpcomingEventsByOrg } from '@/data/events-helpers'
import { getFreePreviewFight, getMainFight } from '@/lib/event-helpers'
import { getTrackRecord } from '@/lib/track-record'
import { getFightPageData } from '@/lib/fights'
import { getAllFighters } from '@/lib/rosters'
import { buildPredictionVerdict, fighterShortName } from '@/lib/prediction-verdict'
import type { Fight } from '@/types'
import type { FightPageData } from '@/lib/fights'
import type { FighterScoreProfile } from '@/types/prediction'

/** Co-main gratuit — ne pas exposer le main event sur la homepage. */
const SHOWCASE_FIGHT_ID = 'ufc-freedom-250-f2'

const ADVANTAGE_DIMENSIONS: {
  key: keyof FighterScoreProfile
  label: string
}[] = [
  { key: 'striking', label: 'frappe' },
  { key: 'grappling', label: 'grappling' },
  { key: 'recentForm', label: 'forme récente' },
  { key: 'momentum', label: 'dynamique' },
  { key: 'physical', label: 'physique' },
]

export type HeroCredibilityStats = {
  fightersTracked: number
  statMetrics: number
  organizationsCovered: number
  updateLabel: string
  /** Précision sur pronostics à forte conviction (confiance ≥ 80 %), si échantillon suffisant. */
  highConfidenceAccuracy: number | null
  highConfidenceTotal: number
}

export type HeroFightAdvantage = {
  fighterName: string
  dimension: string
  edge: number
}

export type HeroShowcaseData = {
  showcase: FightPageData
  verdict: ReturnType<typeof buildPredictionVerdict>
  advantages: HeroFightAdvantage[]
  credibility: HeroCredibilityStats
  analysisHref: string
}

function resolveShowcaseFight(): FightPageData | undefined {
  const primary = getFightPageData(SHOWCASE_FIGHT_ID)
  if (primary) return primary

  const ufcEvents = getUpcomingEventsByOrg('ufc')
  const featured = ufcEvents.find((e) => e.predictionsStatus !== 'preparing') ?? ufcEvents[0]
  if (!featured) return undefined

  const free = getFreePreviewFight(featured) ?? getMainFight(featured)
  if (!free) return undefined
  return getFightPageData(free.id)
}

function getFightAdvantages(fight: Fight): HeroFightAdvantage[] {
  const breakdown = fight.model.breakdown
  if (!breakdown) {
    return [
      { fighterName: 'Modèle', dimension: 'probabilités calibrées', edge: 0 },
      { fighterName: 'Stats', dimension: 'comparaison multi-critères', edge: 0 },
      { fighterName: 'Carte', dimension: 'analyse par combat', edge: 0 },
    ]
  }

  const ranked = ADVANTAGE_DIMENSIONS.map(({ key, label }) => {
    const red = breakdown.red[key]
    const blue = breakdown.blue[key]
    const diff = red - blue
    const fighter = diff >= 0 ? fight.redCorner : fight.blueCorner
    return {
      fighterName: fighterShortName(fighter.name),
      dimension: label,
      edge: Math.abs(Math.round(diff * 100)),
    }
  })
    .filter((item) => item.edge > 0)
    .sort((a, b) => b.edge - a.edge)

  if (ranked.length === 0) {
    return [
      { fighterName: 'Modèle', dimension: 'probabilités calibrées', edge: 0 },
      { fighterName: 'Stats', dimension: 'comparaison multi-critères', edge: 0 },
      { fighterName: 'Carte', dimension: 'analyse par combat', edge: 0 },
    ]
  }

  return ranked.slice(0, 3)
}

function getCredibilityStats(): HeroCredibilityStats {
  const track = getTrackRecord(getEvents())
  const strong = track.byConfidence.find((b) => b.label === 'Forte conviction')

  return {
    fightersTracked: getAllFighters().length,
    statMetrics: 32,
    organizationsCovered: 5,
    updateLabel: 'Mise à jour hebdomadaire',
    highConfidenceAccuracy:
      strong && strong.total >= 2 ? strong.accuracy : null,
    highConfidenceTotal: strong?.total ?? 0,
  }
}

export function getHeroShowcaseData(): HeroShowcaseData | null {
  const showcase = resolveShowcaseFight()
  if (!showcase) return null

  const { fight } = showcase

  return {
    showcase,
    verdict: buildPredictionVerdict(fight),
    advantages: getFightAdvantages(fight),
    credibility: getCredibilityStats(),
    analysisHref: `/fight/${SHOWCASE_FIGHT_ID}`,
  }
}

export function formatHeroStatCount(value: number): string {
  if (value >= 1000) {
    const rounded = Math.floor(value / 100) * 100
    return `${rounded.toLocaleString('fr-FR')}+`
  }
  return value.toLocaleString('fr-FR')
}
