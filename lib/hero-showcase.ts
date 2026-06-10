import { getEvents } from '@/data/events'
import { getUpcomingEventsByOrg } from '@/data/events-helpers'
import { getMainFight } from '@/lib/event-helpers'
import { getFightPageData } from '@/lib/fights'
import { getAllFighters } from '@/lib/rosters'
import { buildPredictionVerdict, fighterShortName } from '@/lib/prediction-verdict'
import type { Fight } from '@/types'
import type { FightPageData } from '@/lib/fights'
import type { FighterScoreProfile } from '@/types/prediction'

const SHOWCASE_FIGHT_ID = 'ufc-freedom-250-f1'

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
  analyzedFights: number
  fightersTracked: number
  statMetrics: number
  updateLabel: string
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

  const main = getMainFight(featured)
  if (!main) return undefined
  return getFightPageData(main.id)
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
  const analyzedFights = getEvents()
    .filter((e) => e.status === 'upcoming' && e.predictionsStatus !== 'preparing')
    .reduce((sum, event) => sum + event.fights.length, 0)

  return {
    analyzedFights: Math.max(analyzedFights, 1),
    fightersTracked: getAllFighters().length,
    statMetrics: 32,
    updateLabel: 'Mise à jour hebdomadaire',
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
    analysisHref: '/ufc-pronostics',
  }
}

export function formatHeroStatCount(value: number): string {
  if (value >= 1000) {
    const rounded = Math.floor(value / 100) * 100
    return `${rounded.toLocaleString('fr-FR')}+`
  }
  return value.toLocaleString('fr-FR')
}
