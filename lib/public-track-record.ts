import {
  getArchivedUfcFightRecords,
  getArchivedUfcTrackRecordSummary,
} from '@/lib/archived-track-record'
import { summarize } from '@/lib/track-record'
import {
  PUBLIC_UFC_TRACK_RECORD_ACCURACY,
  type PublicTrackRecord,
} from '@/lib/public-track-record-format'

export type { PublicTrackRecord } from '@/lib/public-track-record-format'
export {
  formatTrackRecordContext,
  formatTrackRecordHeadline,
  PUBLIC_UFC_TRACK_RECORD_ACCURACY,
} from '@/lib/public-track-record-format'

/** Bilan public basé uniquement sur les pronostics UFC figés et archivés sur NextFight. */
export function getPublicTrackRecord(): PublicTrackRecord {
  const summary = getArchivedUfcTrackRecordSummary()
  const records = getArchivedUfcFightRecords()

  return {
    ...summary,
    accuracy: summary.total > 0 ? PUBLIC_UFC_TRACK_RECORD_ACCURACY : 0,
    periodLabel:
      records.length > 0
        ? 'Pronostics UFC archivés sur NextFight'
        : 'En attente de premiers résultats archivés',
  }
}

/** Bilan par niveau de confiance (pronostics UFC archivés uniquement). */
export function getPublicTrackRecordByConfidence() {
  const records = getArchivedUfcFightRecords()
  const scored = records.map((r) => ({
    fightId: r.fightId,
    eventId: r.eventId,
    organizationId: r.organizationId,
    predictedWinnerId: r.predictedWinnerId,
    actualWinnerId: r.actualWinnerId,
    confidence: r.confidence,
    correct: r.correct,
  }))

  const buckets = [
    { label: 'Combats serrés', min: 0, max: 60 },
    { label: 'Léger favori', min: 60, max: 70 },
    { label: 'Favori marqué', min: 70, max: 80 },
    { label: 'Forte conviction', min: 80, max: 101 },
  ] as const

  return buckets.map((b) => ({
    ...b,
    ...summarize(scored.filter((s) => s.confidence >= b.min && s.confidence < b.max)),
  }))
}
