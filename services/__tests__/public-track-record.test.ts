import { describe, expect, it } from 'vitest'
import {
  formatTrackRecordContext,
  formatTrackRecordHeadline,
  getPublicTrackRecord,
  LEGACY_TRACK_RECORD_ACCURACY,
} from '@/lib/public-track-record'

describe('public-track-record', () => {
  it('expose un bilan sur 6 mois', () => {
    const record = getPublicTrackRecord()
    expect(record.periodLabel).toBe('Cartes UFC — 6 derniers mois')
    expect(record.legacyAccuracy).toBe(LEGACY_TRACK_RECORD_ACCURACY)
    if (record.total > 0) {
      expect(formatTrackRecordHeadline(record)).toMatch(/\d+\/\d+ pronostics corrects/)
      expect(record.accuracy).toBeGreaterThanOrEqual(0)
      expect(record.accuracy).toBeLessThanOrEqual(100)
      expect(formatTrackRecordContext(record)).toMatch(/78% avant NextFight/)
      expect(formatTrackRecordContext(record)).toMatch(/vérifiable sur le site/)
      expect(formatTrackRecordContext(record)).toMatch(/historique encore limité/)
    }
  })
})
