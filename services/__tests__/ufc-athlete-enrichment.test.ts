import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import { dedupeRecentBouts } from '@/lib/recent-bouts'
import {
  parseUfcAthleteLastFights,
  parseUfcAthleteNickname,
  parseUfcAthletePageStats,
} from '@/lib/mappers/ufc-athlete-enrichment'

const RESULTS_FIXTURE = readFileSync(
  new URL('../../test-fixtures/ufc-athlete-results-snippet.html', import.meta.url),
  'utf-8',
)

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

  it('parses multiple athlete-results without duplicates', () => {
    const bouts = parseUfcAthleteLastFights(
      RESULTS_FIXTURE,
      'Brendan Allen',
      'brendan-allen',
    )
    expect(bouts.length).toBe(2)
    expect(bouts[0].opponentName).toMatch(/Ridder/i)
    expect(bouts[0].result).toBe('win')
    expect(bouts[0].method).toBe('ko_tko')
    expect(bouts[1].opponentName).toMatch(/Vettori/i)
    expect(dedupeRecentBouts([...bouts, ...bouts]).length).toBe(2)
  })

  it('recovers full opponent name from slug when alt is a caption and link text is last-name only', () => {
    const snippet = `
<article class="c-card-event--athlete-results">
  <div class="c-card-event--athlete-results__red-image win">
    <a href="https://www.ufc.com/athlete/alessandro-costa"><img alt="Alessandro Costa" /></a>
  </div>
  <div class="c-card-event--athlete-results__blue-image loss">
    <a href="https://www.ufc.com/athlete/stewart-nicoll"><img alt="Alessandro Costa of Brazil punches an opponent in 2022 (Photo Getty)" /></a>
  </div>
  <h3 class="c-card-event--athlete-results__headline">
    <a href="https://www.ufc.com/athlete/stewart-nicoll">Nicoll</a>
  </h3>
  <div class="c-card-event--athlete-results__date">15 Mar. 2024</div>
  <div class="c-card-event--athlete-results__result-label">Méthode</div>
  <div class="c-card-event--athlete-results__result-text">Decision - Unanimous</div>
</article>`
    const bouts = parseUfcAthleteLastFights(snippet, 'Alessandro Costa', 'alessandro-costa')
    expect(bouts.length).toBe(1)
    expect(bouts[0].opponentName).toBe('Stewart Nicoll')
    expect(bouts[0].result).toBe('win')
  })
})

describe('parseUfcAthleteNickname', () => {
  it('reads hero profile nickname with HTML entities', () => {
    const html = '<p class="hero-profile__nickname">&quot;All In&quot;</p>'
    expect(parseUfcAthleteNickname(html)).toBe('All In')
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
