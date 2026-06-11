import { describe, expect, it } from 'vitest'
import { formatTrackRecordHeadline, getPublicTrackRecord } from '@/lib/public-track-record'

describe('public-track-record', () => {
  it('expose un bilan sur 6 mois', () => {
    const record = getPublicTrackRecord()
    expect(record.periodLabel).toBe('6 derniers mois')
    if (record.total > 0) {
      expect(formatTrackRecordHeadline(record)).toMatch(/\d+\/\d+ pronostics corrects/)
      expect(record.accuracy).toBeGreaterThanOrEqual(0)
      expect(record.accuracy).toBeLessThanOrEqual(100)
    }
  })
})
