import type { Event, Fight, OrganizationId } from '@/types'

export interface ScoredFight {
  fightId: string
  eventId: string
  organizationId: OrganizationId
  predictedWinnerId: string
  actualWinnerId: string
  confidence: number
  correct: boolean
}

export interface TrackRecordSummary {
  /** Combats notés (pronostic figé + vainqueur réel connu, hors nuls). */
  total: number
  correct: number
  /** Précision en % (0–100), 0 si aucun combat noté. */
  accuracy: number
}

export interface ConfidenceBucket extends TrackRecordSummary {
  label: string
  min: number
  max: number
}

type ScorableFight = Pick<Fight, 'id' | 'eventId' | 'predictionSnapshot' | 'result'>
type ScorableEvent = Pick<Event, 'id' | 'organizationId' | 'fights'>

/** Un combat est notable s'il a un pronostic figé et un vainqueur réel (hors nul). */
export function scoreFight(
  fight: ScorableFight,
  organizationId: OrganizationId,
): ScoredFight | null {
  const snap = fight.predictionSnapshot
  const result = fight.result
  if (!snap || !result || result.winnerId == null) return null

  return {
    fightId: fight.id,
    eventId: fight.eventId,
    organizationId,
    predictedWinnerId: snap.predictedWinnerId,
    actualWinnerId: result.winnerId,
    confidence: snap.confidence,
    correct: snap.predictedWinnerId === result.winnerId,
  }
}

export function getScoredFights(events: ScorableEvent[]): ScoredFight[] {
  const out: ScoredFight[] = []
  for (const event of events) {
    for (const fight of event.fights) {
      const scored = scoreFight(fight, event.organizationId)
      if (scored) out.push(scored)
    }
  }
  return out
}

export function summarize(scored: ScoredFight[]): TrackRecordSummary {
  const total = scored.length
  const correct = scored.filter((s) => s.correct).length
  return {
    total,
    correct,
    accuracy: total > 0 ? Math.round((correct / total) * 100) : 0,
  }
}

const CONFIDENCE_BUCKETS: { label: string; min: number; max: number }[] = [
  { label: 'Combats serrés', min: 0, max: 60 },
  { label: 'Léger favori', min: 60, max: 70 },
  { label: 'Favori marqué', min: 70, max: 80 },
  { label: 'Forte conviction', min: 80, max: 101 },
]

export interface TrackRecord {
  summary: TrackRecordSummary
  byOrg: Partial<Record<OrganizationId, TrackRecordSummary>>
  byConfidence: ConfidenceBucket[]
}

export function getTrackRecord(events: ScorableEvent[]): TrackRecord {
  const scored = getScoredFights(events)

  const byOrg: Partial<Record<OrganizationId, TrackRecordSummary>> = {}
  for (const s of scored) {
    const list = scored.filter((x) => x.organizationId === s.organizationId)
    byOrg[s.organizationId] = summarize(list)
  }

  const byConfidence: ConfidenceBucket[] = CONFIDENCE_BUCKETS.map((b) => ({
    ...b,
    ...summarize(scored.filter((s) => s.confidence >= b.min && s.confidence < b.max)),
  }))

  return {
    summary: summarize(scored),
    byOrg,
    byConfidence,
  }
}
