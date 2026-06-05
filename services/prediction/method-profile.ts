import type { FightMethod, Fighter } from '@/types'
import type { FighterRecentBout } from '@/types/recent-form'
import { estimateFinishingRate } from './features'

export interface FighterMethodProfile {
  koWins: number
  subWins: number
  decWins: number
  koLosses: number
  subLosses: number
  decLosses: number
  totalWins: number
  totalLosses: number
  /** Part des victoires par méthode (0–100) */
  winKoPct: number
  winSubPct: number
  winDecPct: number
  /** Part des défaites par méthode (0–100) */
  lossKoPct: number
  lossSubPct: number
  lossDecPct: number
  /** Fiabilité du profil (combats récents + bilan) */
  dataWeight: number
}

type MethodRatios = { ko: number; sub: number; dec: number }

function countByMethod(
  bouts: FighterRecentBout[],
  result: 'win' | 'loss',
  method: FightMethod,
): number {
  return bouts.filter((b) => b.result === result && b.method === method).length
}

function pct(part: number, total: number, fallback: number): number {
  if (total <= 0) return fallback
  return Math.round((part / total) * 100)
}

function normalizeRatios(r: MethodRatios): MethodRatios {
  const sum = r.ko + r.sub + r.dec
  if (sum <= 0) return { ko: 0.25, sub: 0.2, dec: 0.55 }
  return { ko: r.ko / sum, sub: r.sub / sum, dec: r.dec / sum }
}

function blendRatios(a: MethodRatios, b: MethodRatios, weightB: number): MethodRatios {
  const w = Math.min(1, Math.max(0, weightB))
  return normalizeRatios({
    ko: a.ko * (1 - w) + b.ko * w,
    sub: a.sub * (1 - w) + b.sub * w,
    dec: a.dec * (1 - w) + b.dec * w,
  })
}

function ratiosFromBouts(bouts: FighterRecentBout[], result: 'win' | 'loss'): MethodRatios | null {
  const filtered = bouts.filter((b) => b.result === result)
  if (filtered.length === 0) return null
  return normalizeRatios({
    ko: countByMethod(bouts, result, 'ko_tko'),
    sub: countByMethod(bouts, result, 'submission'),
    dec: countByMethod(bouts, result, 'decision'),
  })
}

function splitFinishWins(
  finishWins: number,
  fighter: Fighter,
): { ko: number; sub: number } {
  if (finishWins <= 0) return { ko: 0, sub: 0 }
  const subAvg = fighter.stats.subAvg ?? 0
  const slpm = fighter.stats.slpm ?? 3.5
  const subBias = Math.min(0.75, Math.max(0.2, subAvg / Math.max(0.5, subAvg + slpm * 0.35)))
  const sub = Math.round(finishWins * subBias)
  return { ko: finishWins - sub, sub }
}

function careerRatiosFromRecord(fighter: Fighter): { win: MethodRatios; loss: MethodRatios } {
  const wins = Math.max(0, fighter.wins ?? 0)
  const losses = Math.max(0, fighter.losses ?? 0)
  const finishRate = estimateFinishingRate(fighter) / 100
  const finishWins = Math.round(wins * finishRate)
  const { ko, sub } = splitFinishWins(finishWins, fighter)
  const dec = Math.max(0, wins - ko - sub)

  const win = normalizeRatios({ ko, sub, dec })
  const loss = normalizeRatios({
    ko: losses * 0.32,
    sub: losses * 0.28,
    dec: losses * 0.4,
  })

  return { win, loss }
}

function countsFromRatios(
  total: number,
  ratios: MethodRatios,
): { ko: number; sub: number; dec: number } {
  if (total <= 0) return { ko: 0, sub: 0, dec: 0 }
  const ko = Math.round(total * ratios.ko)
  const sub = Math.round(total * ratios.sub)
  const dec = Math.max(0, total - ko - sub)
  return { ko, sub, dec }
}

function externalWinRatios(fighter: Fighter): MethodRatios | null {
  const e = fighter.externalMethodCounts
  if (!e || e.wins + e.losses < 2) return null
  return normalizeRatios({ ko: e.koWins, sub: e.subWins, dec: e.decWins })
}

function externalLossRatios(fighter: Fighter): MethodRatios | null {
  const e = fighter.externalMethodCounts
  if (!e || e.wins + e.losses < 2) return null
  return normalizeRatios({ ko: e.koLosses, sub: e.subLosses, dec: e.decLosses })
}

/** Profil victoires/défaites par KO, soumission et décision (récent + carrière + Sherdog/Tapology). */
export function buildFighterMethodProfile(fighter: Fighter): FighterMethodProfile {
  const rosterWins = Math.max(0, fighter.wins ?? 0)
  const rosterLosses = Math.max(0, fighter.losses ?? 0)
  const ext = fighter.externalMethodCounts
  const wins = Math.max(rosterWins, ext?.wins ?? 0)
  const losses = Math.max(rosterLosses, ext?.losses ?? 0)
  const bouts = fighter.recentBouts ?? []
  const career = careerRatiosFromRecord(fighter)
  const sparseRoster = rosterWins + rosterLosses < 5

  const recentWinRatios = ratiosFromBouts(bouts, 'win')
  const recentLossRatios = ratiosFromBouts(bouts, 'loss')
  const recentWeight =
    bouts.length === 0 ? 0 : Math.min(0.75, 0.25 + bouts.length * 0.1)
  const extWin = externalWinRatios(fighter)
  const extLoss = externalLossRatios(fighter)
  const extWeight = sparseRoster && ext ? 0.62 : ext ? 0.35 : 0

  let winRatios = recentWinRatios
    ? blendRatios(career.win, recentWinRatios, recentWeight)
    : career.win
  let lossRatios = recentLossRatios
    ? blendRatios(career.loss, recentLossRatios, recentWeight * 0.85)
    : career.loss

  if (extWin) winRatios = blendRatios(winRatios, extWin, extWeight)
  if (extLoss) lossRatios = blendRatios(lossRatios, extLoss, extWeight)

  const winCounts = countsFromRatios(wins, winRatios)
  const lossCounts = countsFromRatios(losses, lossRatios)

  return {
    koWins: winCounts.ko,
    subWins: winCounts.sub,
    decWins: winCounts.dec,
    koLosses: lossCounts.ko,
    subLosses: lossCounts.sub,
    decLosses: lossCounts.dec,
    totalWins: wins,
    totalLosses: losses,
    winKoPct: pct(winCounts.ko, wins, 20),
    winSubPct: pct(winCounts.sub, wins, 15),
    winDecPct: pct(winCounts.dec, wins, 55),
    lossKoPct: pct(lossCounts.ko, losses, 30),
    lossSubPct: pct(lossCounts.sub, losses, 25),
    lossDecPct: pct(lossCounts.dec, losses, 40),
    dataWeight: Math.min(1, 0.35 + bouts.length * 0.11),
  }
}

export interface MethodScenarioScores {
  ko: number
  submission: number
  decision: number
}

/**
 * Scénarios de fin : finishes du favori × vulnérabilités de l’adversaire,
 * plus tendance décision des deux profils.
 */
export function scoreMethodScenarios(
  favored: FighterMethodProfile,
  underdog: FighterMethodProfile,
  opts: {
    absDelta: number
    strikingEdge: number
    grapplingEdge: number
    avgFinishingRate: number
  },
): MethodScenarioScores {
  const finishScale = 0.65 + opts.avgFinishingRate / 85

  const koThreat =
    (favored.winKoPct / 100) * (underdog.lossKoPct / 100) * 140 * finishScale
  const subThreat =
    (favored.winSubPct / 100) * (underdog.lossSubPct / 100) * 140 * finishScale

  const grind =
    ((favored.winDecPct + underdog.winDecPct) / 2) *
    (1 - opts.avgFinishingRate / 110)

  const closeFight = opts.absDelta < 0.07 ? 14 : 0
  const decisionBase = grind * 0.75 + closeFight

  const chinExposure = (underdog.lossKoPct / 100) * (favored.winKoPct / 100) * 80
  const subExposure = (underdog.lossSubPct / 100) * (favored.winSubPct / 100) * 80

  const ko =
    koThreat +
    chinExposure +
    Math.max(0, opts.strikingEdge) * 55 +
    (favored.winKoPct >= underdog.winKoPct + 8 ? 12 : 0)

  const submission =
    subThreat +
    subExposure +
    Math.max(0, opts.grapplingEdge) * 58 +
    (favored.winSubPct >= underdog.winSubPct + 8 ? 12 : 0)

  let decision = decisionBase + (opts.absDelta < 0.05 && opts.avgFinishingRate < 42 ? 10 : 0)
  if (chinExposure > 18 || subExposure > 18) decision *= 0.82
  if (favored.winDecPct >= 58 && underdog.winDecPct >= 52) decision += 16
  if (opts.avgFinishingRate < 35) decision += 12

  return { ko, submission, decision }
}

export function pickPredictedMethod(scores: MethodScenarioScores): FightMethod {
  const entries: [FightMethod, number][] = [
    ['ko_tko', scores.ko],
    ['submission', scores.submission],
    ['decision', scores.decision],
  ]
  entries.sort((a, b) => b[1] - a[1])
  const [top, topScore] = entries[0]
  const secondScore = entries[1][1]

  if (top === 'decision' && topScore - secondScore < 10 && secondScore > 0) {
    return entries[1][0]
  }

  return top
}
