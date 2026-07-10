import { loadEventsRaw } from '@/lib/events-store'
import { fighterShortName } from '@/lib/prediction-verdict'
import { getTrackRecordRationale } from '@/lib/track-record-rationale'
import { getFighterFromStore } from '@/lib/roster-store'
import { summarize, type ScoredFight, type TrackRecordSummary } from '@/lib/track-record'
import type { OrganizationId } from '@/types'

export type ArchivedFightRecord = {
  fightId: string
  eventId: string
  eventName: string
  eventDate: string
  organizationId: OrganizationId
  redName: string
  blueName: string
  predictedWinnerId: string
  predictedWinnerName: string
  actualWinnerId: string
  actualWinnerName: string
  confidence: number
  correct: boolean
  predictionWhy: string
  resultWhy: string
  method?: string
  round?: number
}

function nameById(fighterId: string): string {
  const fighter = getFighterFromStore(fighterId)
  if (fighter) return fighterShortName(fighter.name)
  return fighterId.replace(/^ufc-/, '').replace(/-/g, ' ')
}

/** Pronostics UFC figés dans le store avec résultat connu (source de vérité du bilan public). */
export function getArchivedUfcFightRecords(): ArchivedFightRecord[] {
  const store = loadEventsRaw()
  const records: ArchivedFightRecord[] = []

  for (const event of store.events) {
    if (event.organizationId !== 'ufc' || event.status !== 'completed') continue

    for (const fight of event.fights) {
      const snap = fight.predictionSnapshot
      const result = fight.result
      if (!snap || result?.winnerId == null) continue

      const correct = snap.predictedWinnerId === result.winnerId
      const rationale = getTrackRecordRationale(fight.id, correct)

      records.push({
        fightId: fight.id,
        eventId: event.id,
        eventName: event.name,
        eventDate: event.date,
        organizationId: event.organizationId,
        redName: nameById(fight.redId),
        blueName: nameById(fight.blueId),
        predictedWinnerId: snap.predictedWinnerId,
        predictedWinnerName: nameById(snap.predictedWinnerId),
        actualWinnerId: result.winnerId,
        actualWinnerName: nameById(result.winnerId),
        confidence: snap.confidence,
        correct,
        predictionWhy: rationale.predictionWhy,
        resultWhy: rationale.resultWhy,
        method: result.method,
        round: result.round,
      })
    }
  }

  return records.sort(
    (a, b) => new Date(b.eventDate).getTime() - new Date(a.eventDate).getTime(),
  )
}

export function getArchivedUfcScoredFights(): ScoredFight[] {
  return getArchivedUfcFightRecords().map((record) => ({
    fightId: record.fightId,
    eventId: record.eventId,
    organizationId: record.organizationId,
    predictedWinnerId: record.predictedWinnerId,
    actualWinnerId: record.actualWinnerId,
    confidence: record.confidence,
    correct: record.correct,
  }))
}

export function getArchivedUfcTrackRecordSummary(): TrackRecordSummary {
  return summarize(getArchivedUfcScoredFights())
}

export function groupArchivedRecordsByEvent(
  records: ArchivedFightRecord[],
): { eventId: string; eventName: string; eventDate: string; fights: ArchivedFightRecord[] }[] {
  const byEvent = new Map<
    string,
    { eventId: string; eventName: string; eventDate: string; fights: ArchivedFightRecord[] }
  >()

  for (const record of records) {
    const existing = byEvent.get(record.eventId)
    if (existing) {
      existing.fights.push(record)
    } else {
      byEvent.set(record.eventId, {
        eventId: record.eventId,
        eventName: record.eventName,
        eventDate: record.eventDate,
        fights: [record],
      })
    }
  }

  return [...byEvent.values()].sort(
    (a, b) => new Date(b.eventDate).getTime() - new Date(a.eventDate).getTime(),
  )
}
