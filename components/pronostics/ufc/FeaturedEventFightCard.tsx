'use client'

import Link from 'next/link'
import { Lock } from 'lucide-react'
import type { Event, Fight } from '@/types'
import { getFreePreviewFight, sortFightsByCardOrder } from '@/lib/event-helpers'
import { canAccessFightPrediction, getFightDetailHref } from '@/lib/fight-access'
import { buildPredictionVerdict, fighterShortName } from '@/lib/prediction-verdict'
import { MATCHUP_READ_OVERRIDES } from '@/lib/prediction-adjustment'
import { useSubscription } from '@/hooks/useSubscription'
import { FastLink } from '@/components/navigation/FastLink'
import { FighterMatchupLine } from '@/components/FighterMatchupLine'
import { PredictionKeyFactors } from '@/components/pronostics/PredictionKeyFactors'
import { PredictionSummary } from '@/components/pronostics/PredictionSummary'
import { formatShortDate } from '@/utils/format'
import { cn } from '@/utils/cn'

const ACCENT = '#e8c840'

function fightRoleLabel(fight: Fight): string {
  if (fight.isMainEvent) return 'Main event'
  if (fight.order === 2) return 'Co-main'
  return `Combat ${fight.order}`
}

function ProbabilityBars({
  fight,
  className,
}: {
  fight: Fight
  className?: string
}) {
  const redProb = fight.model.redWinProbability
  const blueProb = 100 - redProb

  return (
    <div className={className}>
      <div className="flex h-2.5 overflow-hidden rounded-full bg-white/[0.08]">
        <div className="bg-red-500 transition-all" style={{ width: `${redProb}%` }} />
        <div className="bg-blue-500 transition-all" style={{ width: `${blueProb}%` }} />
      </div>
      <div className="mt-2 flex justify-between text-sm font-semibold tabular-nums">
        <span className="text-red-400">
          {fighterShortName(fight.redCorner.name)} {redProb}%
        </span>
        <span className="text-blue-400">
          {fighterShortName(fight.blueCorner.name)} {blueProb}%
        </span>
      </div>
    </div>
  )
}

function LockedFightRow({
  fight,
  event,
  isPremium,
  showRationaleTeaser = false,
}: {
  fight: Fight
  event: Event
  isPremium: boolean
  showRationaleTeaser?: boolean
}) {
  const hasAccess = canAccessFightPrediction(fight, event, isPremium)
  const href = getFightDetailHref(fight, event, isPremium)
  const rationale = MATCHUP_READ_OVERRIDES[fight.id]

  return (
    <li className="rounded-xl border border-white/[0.08] bg-[#0c0c0c] px-4 py-4 sm:px-5">
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-[10px] font-medium uppercase tracking-[0.14em] text-[#8a8278]">
          {fightRoleLabel(fight)}
        </span>
        <span className="text-[10px] text-[#5c5c5c]">·</span>
        <span className="text-xs text-[#6b6b6b]">{fight.weightClass}</span>
      </div>
      <div className="mt-3">
        <FighterMatchupLine red={fight.redCorner} blue={fight.blueCorner} variant="elegant" />
      </div>

      {hasAccess ? (
        <div className="mt-4 space-y-3">
          <ProbabilityBars fight={fight} />
          {rationale && (
            <p className="text-xs leading-relaxed text-[#8a8278]">{rationale}</p>
          )}
          <FastLink href={href} className="text-sm font-medium" style={{ color: ACCENT }}>
            Voir le pronostic complet →
          </FastLink>
        </div>
      ) : (
        <div className="mt-4 space-y-3">
          {showRationaleTeaser && rationale && (
            <p className="text-xs leading-relaxed text-[#6f6a62]">
              <span className="font-medium text-[#8a8278]">Pourquoi ce combat compte · </span>
              <span className="blur-[4px] select-none">{rationale.slice(0, 80)}…</span>
            </p>
          )}
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="flex items-center gap-2 text-xs text-[#8a8278]">
              <Lock className="h-3.5 w-3.5" aria-hidden />
              Analyse Premium · probabilités et facteurs verrouillés
            </p>
            <Link
              href="/pricing"
              className="inline-flex shrink-0 items-center justify-center rounded-full border border-[#e8c840]/40 px-4 py-2 text-xs font-semibold transition-colors hover:bg-[#e8c840]/10"
              style={{ color: ACCENT }}
            >
              Débloquer
            </Link>
          </div>
        </div>
      )}
    </li>
  )
}

type FeaturedEventFightCardProps = {
  event: Event
  className?: string
  showRationaleTeaser?: boolean
}

export function FeaturedEventFightCard({
  event,
  className,
  showRationaleTeaser = false,
}: FeaturedEventFightCardProps) {
  const { isPremium, loading: subLoading } = useSubscription()
  const confirmedPremium = !subLoading && isPremium
  const freeFight = getFreePreviewFight(event)
  if (!freeFight) return null

  const lockedFights = sortFightsByCardOrder(event).filter((f) => f.id !== freeFight.id)
  const showFreeAsMain =
    !confirmedPremium || canAccessFightPrediction(freeFight, event, confirmedPremium)
  const verdict = buildPredictionVerdict(freeFight)
  const freeRationale = MATCHUP_READ_OVERRIDES[freeFight.id]

  return (
    <section id="carte-combats" className={cn('border-b border-white/[0.06] bg-[#050505]', className)}>
      <div className="container-content section-padding">
        <div className="mx-auto max-w-4xl">
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em]" style={{ color: ACCENT }}>
            Carte combats
          </p>
          <h2 className="mt-2 font-display text-xl font-semibold tracking-tight text-white sm:text-2xl">
            {event.name}
          </h2>
          <p className="mt-1 text-sm text-[#8a8278]">
            {formatShortDate(event.date)} · {event.city}
          </p>

          {showFreeAsMain && (
            <article
              id="combat-gratuit"
              className="scroll-mt-24 mt-6 rounded-2xl border border-[#e8c840]/30 bg-gradient-to-b from-[#12100a] to-[#0a0a0a] p-5 sm:p-6"
            >
              <div className="flex flex-wrap items-center gap-2">
                <span
                  className="rounded-full px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider"
                  style={{ backgroundColor: `${ACCENT}22`, color: ACCENT }}
                >
                  Pronostic gratuit
                </span>
                <span className="text-xs text-[#8a8278]">{freeFight.weightClass}</span>
              </div>

              <h3 className="mt-4 font-display text-lg font-semibold text-white sm:text-xl">
                {fighterShortName(freeFight.redCorner.name)}
                <span className="mx-2 font-normal text-[#6f6a62]">vs</span>
                {fighterShortName(freeFight.blueCorner.name)}
              </h3>

              <div className="mt-4">
                <FighterMatchupLine
                  red={freeFight.redCorner}
                  blue={freeFight.blueCorner}
                  variant="elegant"
                />
              </div>

              <ProbabilityBars fight={freeFight} className="mt-5" />

              <div className="mt-5 rounded-xl border border-white/[0.08] bg-black/30 px-4 py-3 text-center">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-[#8a8278]">
                  Pronostic
                </p>
                <p className="mt-1 text-base font-semibold text-white sm:text-lg">
                  {verdict.headline}
                </p>
                {verdict.probabilityLine && (
                  <p className="mt-1 text-sm font-semibold tabular-nums" style={{ color: ACCENT }}>
                    {verdict.probabilityLine}
                  </p>
                )}
              </div>

              {freeRationale && (
                <p className="mt-4 rounded-xl border border-white/[0.06] bg-white/[0.02] px-4 py-3 text-sm leading-relaxed text-[#c8c0b4]">
                  <span className="font-medium text-[#e8c840]">Pourquoi · </span>
                  {freeRationale}
                </p>
              )}

              <div className="mt-5 space-y-4">
                <PredictionSummary fight={freeFight} compact />
                <PredictionKeyFactors fight={freeFight} compact />
              </div>

              <FastLink
                href={`/fight/${freeFight.id}`}
                className="mt-5 inline-flex text-sm font-semibold transition-opacity hover:opacity-80"
                style={{ color: ACCENT }}
              >
                Voir l&apos;analyse complète du co-main →
              </FastLink>
            </article>
          )}

          {lockedFights.length > 0 && (
            <div className="mt-8">
              <h3 className="text-sm font-semibold uppercase tracking-wider text-[#8a8278]">
                {confirmedPremium ? 'Reste de la carte' : 'Combats Premium'}
              </h3>
              <ul className="mt-4 space-y-3">
                {lockedFights.map((fight) => (
                  <LockedFightRow
                    key={fight.id}
                    fight={fight}
                    event={event}
                    isPremium={confirmedPremium}
                    showRationaleTeaser={showRationaleTeaser}
                  />
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
