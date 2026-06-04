'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import type { Event, Fight, Organization } from '@/types'
import { FighterPortrait } from '@/components/fight/FighterPortrait'
import { FightStatsComparison } from '@/components/fight/FightStatsComparison'
import { PremiumGate } from '@/components/premium/PremiumGate'
import {
  canAccessFightPrediction,
  getFightAccessMessage,
} from '@/lib/fight-access'
import { useSubscription } from '@/hooks/useSubscription'
import { PredictionVerdictBanner } from '@/components/pronostics/PredictionVerdictBanner'
import {
  formatShortDate,
  formatPercent,
  formatPredictedRound,
  methodLabels,
} from '@/utils/format'

interface OrgFightExperienceProps {
  org: Organization
  event: Event
  fight: Fight
  accessLabel?: string
  enforceAccess?: boolean
}

function convictionLabel(prob: number): string {
  if (prob >= 62) return 'Favori net'
  if (prob >= 54) return 'Léger favori'
  if (prob >= 46) return 'Équilibré'
  return 'Outsider'
}

export function OrgFightExperience({
  org,
  event,
  fight,
  accessLabel,
  enforceAccess = false,
}: OrgFightExperienceProps) {
  const { isPremium, loading: subLoading } = useSubscription()
  const hasAccess = enforceAccess
    ? canAccessFightPrediction(fight, event, isPremium)
    : true
  const lockMessage = enforceAccess
    ? getFightAccessMessage(fight, event, isPremium)
    : undefined

  const redProb = fight.model.redWinProbability
  const blueProb = 100 - redProb
  const favoriteProb = Math.max(redProb, blueProb)
  const showPrediction = hasAccess || !enforceAccess

  const predictionBlock = (
    <div className="space-y-8">
      <div className="mx-auto max-w-xl">
        <PredictionVerdictBanner fight={fight} variant="prominent" />
      </div>

      <div className="mx-auto max-w-3xl">
        <div className="flex h-2 overflow-hidden rounded-full bg-white/[0.06]">
          <div className="bg-red-500/80 transition-all" style={{ width: `${redProb}%` }} />
          <div className="bg-blue-500/70 transition-all" style={{ width: `${blueProb}%` }} />
        </div>
        <div className="mt-2 flex justify-between text-xs tabular-nums text-muted">
          <span>
            {fight.redCorner.name.split(' ').pop()} {formatPercent(redProb)}
          </span>
          <span>
            {fight.blueCorner.name.split(' ').pop()} {formatPercent(blueProb)}
          </span>
        </div>
      </div>

      <div className="mx-auto grid max-w-3xl grid-cols-2 gap-px overflow-hidden rounded-2xl border border-white/[0.08] bg-white/[0.08] sm:grid-cols-4">
        {[
          { label: 'Méthode', value: methodLabels[fight.model.predictedMethod] },
          {
            label: 'Fin prévue',
            value: formatPredictedRound(
              fight.model.predictedMethod,
              fight.model.predictedRound,
              fight.scheduledRounds,
            ),
          },
          { label: 'Confiance', value: formatPercent(fight.model.confidence) },
          { label: 'Lecture', value: convictionLabel(favoriteProb) },
        ].map((item) => (
          <div key={item.label} className="bg-[#0c1219] px-4 py-4 text-center sm:py-5">
            <p className="text-[10px] uppercase tracking-wider text-muted">{item.label}</p>
            <p className="mt-1 text-sm font-semibold tabular-nums">{item.value}</p>
          </div>
        ))}
      </div>

      <FightStatsComparison red={fight.redCorner} blue={fight.blueCorner} compact />
    </div>
  )

  return (
    <section id="pronostic" className="scroll-mt-24 border-b border-white/[0.06]">
      <div className="container-content section-padding">
        <div className="max-w-4xl">
          {accessLabel && (
            <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-muted">
              {accessLabel}
            </p>
          )}
          <p className="mt-2 text-sm text-muted tabular-nums">
            {formatShortDate(event.date)}
            <span className="mx-2 text-white/20">·</span>
            {event.city}, {event.country}
          </p>
          <h2 className="mt-3 font-display text-xl font-semibold tracking-tight text-muted sm:text-2xl">
            {event.name}
          </h2>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="mt-10 text-center"
        >
          <p className="text-sm text-muted">{fight.weightClass}</p>
          <h3 className="mt-2 font-display text-3xl font-semibold tracking-tight sm:text-4xl">
            {fight.redCorner.name}
            <span className="mx-3 font-normal text-muted/80">vs</span>
            {fight.blueCorner.name}
          </h3>
        </motion.div>

        <div className="mt-10 grid grid-cols-1 items-end gap-8 lg:grid-cols-[1fr_auto_1fr] lg:gap-6 max-w-5xl mx-auto">
          <FighterPortrait
            fighter={fight.redCorner}
            corner="red"
            probability={showPrediction ? redProb : undefined}
            className="lg:justify-self-end"
          />
          <div className="hidden lg:flex flex-col items-center justify-center pb-16">
            <span className="font-display text-2xl font-semibold text-gold/90">vs</span>
          </div>
          <FighterPortrait
            fighter={fight.blueCorner}
            corner="blue"
            probability={showPrediction ? blueProb : undefined}
            className="lg:justify-self-start"
          />
        </div>

        <div className="mt-12">
          {!subLoading && enforceAccess && !hasAccess ? (
            <PremiumGate
              title="Pronostic Premium"
              description={
                lockMessage ??
                'Abonnez-vous pour voir le pronostic complet, les probabilités et les statistiques de ce combat.'
              }
              className="min-h-[320px]"
            >
              {predictionBlock}
            </PremiumGate>
          ) : (
            predictionBlock
          )}
        </div>

        {enforceAccess && !hasAccess && (
          <p className="mt-8 text-center text-sm text-muted">
            <Link href="/pricing" className="text-gold hover:underline underline-offset-4">
              Passer en Premium
            </Link>
            {' · '}
            <Link
              href={org.seoPathFr}
              className="hover:text-foreground transition-colors"
            >
              Retour aux pronostics {org.name}
            </Link>
          </p>
        )}
      </div>
    </section>
  )
}
