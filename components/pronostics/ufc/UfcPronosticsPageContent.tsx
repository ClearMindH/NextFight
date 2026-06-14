'use client'

import Link from 'next/link'
import { Lock } from 'lucide-react'
import type { Event, Fight } from '@/types'
import { getFreePreviewFight, sortFightsByCardOrder } from '@/lib/event-helpers'
import { canAccessFightPrediction, getFightDetailHref } from '@/lib/fight-access'
import { buildPredictionVerdict, fighterShortName } from '@/lib/prediction-verdict'
import type { PublicTrackRecord } from '@/lib/public-track-record'
import { UFC_FREEDOM_250_DATE_LABEL, UFC_FREEDOM_250_EVENT_LABEL } from '@/lib/event-urgency'
import { useSubscription } from '@/hooks/useSubscription'
import { FastLink } from '@/components/navigation/FastLink'
import { FighterMatchupLine } from '@/components/FighterMatchupLine'
import { PredictionKeyFactors } from '@/components/pronostics/PredictionKeyFactors'
import { PredictionSummary } from '@/components/pronostics/PredictionSummary'
import { StripeCheckoutButton } from '@/components/stripe/StripeCheckoutButton'
import { UfcPronosticsConversion } from '@/components/conversion/UfcPronosticsConversion'
import { formatShortDate } from '@/utils/format'
import { cn } from '@/utils/cn'

const ACCENT = '#e8c840'
const BG = '#0a0a0a'

const FINAL_BENEFITS = [
  'Tous les combats de chaque carte UFC',
  'Probabilités, facteurs et justification du modèle',
  'UFC · PFL · KSW · ARES · Hexagone MMA',
  'Bilan transparent vérifiable sur le site',
  'Annulation libre à tout moment',
] as const

type UfcPronosticsPageContentProps = {
  event: Event
  trackRecord: PublicTrackRecord
}

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

function UfcHero({
  lockedCount,
  eventName,
  trackRecord,
}: {
  lockedCount: number
  eventName: string
  trackRecord: PublicTrackRecord
}) {

  return (
    <section className="border-b border-white/[0.06]" style={{ backgroundColor: BG }}>
      <div className="container-content px-4 py-10 sm:px-6 sm:py-14 lg:px-8">
        <div className="mx-auto max-w-4xl">
          <p
            className="text-[11px] font-semibold uppercase tracking-[0.22em]"
            style={{ color: ACCENT }}
          >
            {eventName} · {UFC_FREEDOM_250_DATE_LABEL}
          </p>
          <h1 className="mt-4 font-display text-3xl font-semibold leading-tight tracking-tight text-white sm:text-4xl lg:text-[2.75rem]">
            Les pronostics qui battent les cotes bookmakers
          </h1>
          <p className="mt-4 max-w-2xl text-sm leading-relaxed text-[#a8a29e] sm:text-base">
            Modèle statistique indépendant · {UFC_FREEDOM_250_EVENT_LABEL} · un co-main gratuit,
            le reste en Premium.
          </p>

          <div className="mt-8 grid grid-cols-3 gap-3 sm:gap-4">
            {[
              { value: `${trackRecord.legacyAccuracy}%`, label: 'Historique' },
              { value: String(lockedCount), label: 'Analyses carte' },
              { value: '9,99€', label: 'Par mois' },
            ].map((stat) => (
              <div
                key={stat.label}
                className="rounded-xl border border-white/[0.08] bg-white/[0.03] px-3 py-4 text-center sm:px-4"
              >
                <p className="font-display text-xl font-semibold tabular-nums text-white sm:text-2xl">
                  {stat.value}
                </p>
                <p className="mt-1 text-[10px] uppercase tracking-wider text-[#8a8278] sm:text-[11px]">
                  {stat.label}
                </p>
              </div>
            ))}
          </div>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
            <a
              href="#combat-gratuit"
              className="inline-flex items-center justify-center rounded-full px-6 py-3 text-sm font-semibold text-[#0a0a0a] transition-opacity hover:opacity-90"
              style={{ backgroundColor: ACCENT }}
            >
              Voir le pronostic gratuit
            </a>
            <a
              href="#offre-premium"
              className="inline-flex items-center justify-center rounded-full border border-white/[0.14] px-6 py-3 text-sm font-medium text-white transition-colors hover:border-[#e8c840]/50 hover:text-[#e8c840]"
            >
              Débloquer les {lockedCount} analyses
            </a>
          </div>
        </div>
      </div>
    </section>
  )
}

function UfcResultsSection({ trackRecord }: { trackRecord: PublicTrackRecord }) {
  const cards = [
    { value: `${trackRecord.legacyAccuracy}%`, label: 'Taux historique', sub: 'Avant NextFight' },
    { value: String(trackRecord.total), label: 'Pronostics archivés', sub: trackRecord.periodLabel },
    {
      value: `${trackRecord.correct}/${trackRecord.total}`,
      label: 'Vérifiables sur le site',
      sub: `${trackRecord.accuracy}% de précision`,
    },
  ]

  return (
    <section className="border-b border-white/[0.06] bg-[#080808]">
      <div className="container-content section-padding">
        <div className="mx-auto max-w-4xl">
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em]" style={{ color: ACCENT }}>
            Résultats
          </p>
          <h2 className="mt-2 font-display text-xl font-semibold tracking-tight text-white sm:text-2xl">
            Bilan transparent, pas de promesses vides
          </h2>
          <div className="mt-6 grid gap-3 sm:grid-cols-3 sm:gap-4">
            {cards.map((card) => (
              <div
                key={card.label}
                className="rounded-2xl border border-white/[0.08] bg-[#0a0a0a] px-4 py-5 text-center"
              >
                <p
                  className="font-display text-2xl font-semibold tabular-nums sm:text-3xl"
                  style={{ color: ACCENT }}
                >
                  {card.value}
                </p>
                <p className="mt-2 text-sm font-medium text-white">{card.label}</p>
                <p className="mt-1 text-xs text-[#8a8278]">{card.sub}</p>
              </div>
            ))}
          </div>
          <FastLink
            href="/resultats"
            className="mt-5 inline-flex text-sm font-medium transition-colors hover:text-white"
            style={{ color: ACCENT }}
          >
            Voir le détail des pronostics passés →
          </FastLink>
        </div>
      </div>
    </section>
  )
}

function UfcFinalOffer({ lockedCount }: { lockedCount: number }) {
  return (
    <section
      id="offre-premium"
      className="scroll-mt-24 border-b border-white/[0.06]"
      style={{ backgroundColor: BG }}
    >
      <div className="container-content section-padding">
        <div className="mx-auto max-w-2xl rounded-2xl border border-[#e8c840]/25 bg-gradient-to-b from-[#14120a] to-[#0a0a0a] px-6 py-8 sm:px-8 sm:py-10">
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em]" style={{ color: ACCENT }}>
            Offre Premium
          </p>
          <h2 className="mt-3 font-display text-2xl font-semibold tracking-tight text-white sm:text-3xl">
            Débloquez toute la carte UFC Freedom 250
          </h2>
          <p className="mt-2 text-sm text-[#a8a29e]">
            {lockedCount} analyse{lockedCount > 1 ? 's' : ''} Premium en plus du co-main gratuit.
          </p>

          <ul className="mt-6 space-y-3">
            {FINAL_BENEFITS.map((benefit) => (
              <li key={benefit} className="flex items-start gap-3 text-sm text-[#d4cdc0]">
                <span
                  className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full"
                  style={{ backgroundColor: ACCENT }}
                />
                {benefit}
              </li>
            ))}
          </ul>

          <div className="mt-8 flex flex-wrap items-baseline gap-x-4 gap-y-1">
            <p className="font-display text-3xl font-semibold tabular-nums text-white">9,99€</p>
            <p className="text-sm text-[#8a8278]">/mois</p>
            <span className="text-[#5c5c5c]">·</span>
            <p className="text-sm text-[#a8a29e]">
              ou <span className="font-semibold text-white">79€</span>/an
            </p>
          </div>

          <div className="mt-6">
            <StripeCheckoutButton planId="premium_monthly" highlighted className="max-w-md">
              Débloquer toutes les analyses →
            </StripeCheckoutButton>
          </div>
          <p className="mt-3 text-center text-xs text-[#6f6a62] sm:text-left">
            Paiement sécurisé Stripe · annulation libre
          </p>
        </div>
      </div>
    </section>
  )
}

function LockedFightRow({
  fight,
  event,
  isPremium,
}: {
  fight: Fight
  event: Event
  isPremium: boolean
}) {
  const hasAccess = canAccessFightPrediction(fight, event, isPremium)
  const href = getFightDetailHref(fight, event, isPremium)

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
          <FastLink href={href} className="text-sm font-medium" style={{ color: ACCENT }}>
            Voir le pronostic complet →
          </FastLink>
        </div>
      ) : (
        <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
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
      )}
    </li>
  )
}

function UfcFightCardSection({
  event,
  isPremium,
}: {
  event: Event
  isPremium: boolean
}) {
  const freeFight = getFreePreviewFight(event)
  if (!freeFight) return null

  const lockedFights = sortFightsByCardOrder(event).filter((f) => f.id !== freeFight.id)
  const showFreeAsMain = !isPremium || canAccessFightPrediction(freeFight, event, isPremium)
  const verdict = buildPredictionVerdict(freeFight)

  return (
    <section id="carte-combats" className="border-b border-white/[0.06] bg-[#050505]">
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
                {freeFight.redCorner.name}
                <span className="mx-2 font-normal text-[#6f6a62]">vs</span>
                {freeFight.blueCorner.name}
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
                {isPremium ? 'Reste de la carte' : 'Combats Premium'}
              </h3>
              <ul className="mt-4 space-y-3">
                {lockedFights.map((fight) => (
                  <LockedFightRow
                    key={fight.id}
                    fight={fight}
                    event={event}
                    isPremium={isPremium}
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

export function UfcPronosticsPageContent({ event, trackRecord }: UfcPronosticsPageContentProps) {
  const { isPremium, loading: subLoading } = useSubscription()
  const confirmedPremium = !subLoading && isPremium
  const lockedCount = event.fights.length - 1

  return (
    <div className="relative z-10 flex flex-col">
      <UfcHero lockedCount={lockedCount} eventName={event.name} trackRecord={trackRecord} />
      <UfcFightCardSection event={event} isPremium={confirmedPremium} />
      <UfcResultsSection trackRecord={trackRecord} />
      {!confirmedPremium && <UfcFinalOffer lockedCount={lockedCount} />}
      <div
        id="ufc-pronos-content-end"
        className={cn(!confirmedPremium ? 'hidden' : 'border-b border-white/[0.06] px-4 py-3 md:hidden')}
        aria-hidden
      />
      <UfcPronosticsConversion
        event={event}
        lockedCount={lockedCount}
        scrollAnchorId="ufc-pronos-content-end"
      />
    </div>
  )
}
