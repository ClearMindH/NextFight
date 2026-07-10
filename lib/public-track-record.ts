import { getCompletedEventsByOrg } from '@/data/events-helpers'
import { getScoredFights, summarize, type TrackRecordSummary } from '@/lib/track-record'

const SIX_MONTHS_MS = 1000 * 60 * 60 * 24 * 30 * 6

/** Bilan historique avant la mise en ligne du site (pronostics hors plateforme). */
export const LEGACY_TRACK_RECORD_ACCURACY = 78

export type PublicTrackRecord = TrackRecordSummary & {
  periodLabel: string
  legacyAccuracy: number
}

/** Bilan public affiché sur les pages conversion (6 derniers mois). */
export function getPublicTrackRecord(now: Date = new Date()): PublicTrackRecord {
  const cutoff = now.getTime() - SIX_MONTHS_MS
  const events = getCompletedEventsByOrg('ufc').filter(
    (event) => new Date(event.date).getTime() >= cutoff,
  )
  const scored = getScoredFights(events)
  const summary = summarize(scored)

  return {
    ...summary,
    periodLabel: 'Cartes UFC — 6 derniers mois',
    legacyAccuracy: LEGACY_TRACK_RECORD_ACCURACY,
  }
}

export function formatTrackRecordHeadline(record: PublicTrackRecord): string {
  if (record.total === 0) {
    return 'Bilan transparent des pronostics passés'
  }
  return `${record.correct}/${record.total} pronostics corrects`
}

/** Sous-texte conversion : historique hors site vs bilan vérifiable sur NextFight. */
export function formatTrackRecordContext(record: PublicTrackRecord): string {
  if (record.total === 0) {
    return `${record.legacyAccuracy}% de réussite sur notre historique de pronostics avant NextFight.`
  }
  return `${record.legacyAccuracy}% avant NextFight · ${record.accuracy}% vérifiable sur le site (${formatTrackRecordHeadline(record)} — historique encore limité aux derniers événements archivés)`
}
