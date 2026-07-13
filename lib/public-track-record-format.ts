import type { TrackRecordSummary } from '@/lib/track-record'

/** Taux de réussite affiché sur les pages conversion (pronostics UFC archivés). */
export const PUBLIC_UFC_TRACK_RECORD_ACCURACY = 64

export type PublicTrackRecord = TrackRecordSummary & {
  periodLabel: string
}

export function formatTrackRecordHeadline(record: PublicTrackRecord): string {
  if (record.total === 0) {
    return 'Bilan transparent des pronostics passés'
  }
  return `${record.correct}/${record.total} pronostics corrects`
}

export function formatTrackRecordContext(record: PublicTrackRecord): string {
  if (record.total === 0) {
    return 'Le bilan s\'affichera dès qu\'un événement UFC sera terminé et archivé sur le site.'
  }
  return `${record.accuracy}% de précision sur ${formatTrackRecordHeadline(record)} — ${record.periodLabel.toLowerCase()}`
}
