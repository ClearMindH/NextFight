import { describe, expect, it } from 'vitest'
import {
  formatTrackRecordContext,
  formatTrackRecordHeadline,
  getPublicTrackRecord,
  PUBLIC_UFC_TRACK_RECORD_ACCURACY,
} from '@/lib/public-track-record'
import { getArchivedUfcTrackRecordSummary } from '@/lib/archived-track-record'

describe('public-track-record', () => {
  it('expose un bilan basé uniquement sur les pronostics UFC archivés', () => {
    const record = getPublicTrackRecord()
    const archived = getArchivedUfcTrackRecordSummary()

    expect(record.total).toBe(archived.total)
    expect(record.correct).toBe(archived.correct)

    if (record.total > 0) {
      expect(record.accuracy).toBe(PUBLIC_UFC_TRACK_RECORD_ACCURACY)
      expect(formatTrackRecordHeadline(record)).toMatch(/\d+\/\d+ pronostics corrects/)
      expect(formatTrackRecordContext(record)).toMatch(/70% de précision/)
      expect(formatTrackRecordContext(record)).not.toMatch(/78%/)
      expect(formatTrackRecordContext(record)).not.toMatch(/avant NextFight/)
    }
  })
})
