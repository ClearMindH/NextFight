import { describe, expect, it } from 'vitest'
import {
  parseUfcAthleteLastFights,
  parseUfcAthletePageStats,
} from '@/lib/mappers/ufc-athlete-enrichment'

const SNIPPET = `
<div class="c-card-event--past">
  <div class="c-card-event--athlete-fight__matchup">
    <img alt="Belal Muhammad" />
    <img alt="Ian Machado Garry" />
  </div>
  <div class="c-card-event--athlete-fight__plaque win"></div>
  <div class="c-card-event--athlete-fight__method">Decision - Unanimous</div>
</div>
`

describe('parseUfcAthleteLastFights', () => {
  it('parses last fight win vs opponent', () => {
    const bouts = parseUfcAthleteLastFights(SNIPPET, 'Belal Muhammad')
    expect(bouts.length).toBe(1)
    expect(bouts[0].opponentName).toContain('Garry')
    expect(bouts[0].result).toBe('win')
    expect(bouts[0].method).toBe('decision')
  })

  it('returns empty when no past block', () => {
    expect(parseUfcAthleteLastFights('<html></html>', 'Test')).toEqual([])
  })
})

describe('parseUfcAthletePageStats', () => {
  it('reads fight metrics from compare blocks', () => {
    const html = [...Array(8)].map((_, i) => `<div class="c-stat-compare__number">${[4.4, 3.8, 2.1, 0.1, 56, 90, 40, 65][i]}</div>`).join('')
    const stats = parseUfcAthletePageStats(html)
    expect(stats?.slpm).toBe(4.4)
    expect(stats?.strikingAccuracy).toBe(56)
    expect(stats?.takedownDefense).toBe(65)
  })
})
