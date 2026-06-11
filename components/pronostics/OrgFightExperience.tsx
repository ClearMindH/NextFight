'use client'

import { FastLink } from '@/components/navigation/FastLink'
import { motion } from 'framer-motion'
import type { Event, Fight, Organization } from '@/types'
import { FighterPortrait } from '@/components/fight/FighterPortrait'
import { RecentResults } from '@/components/fight/RecentResults'
import { PremiumGate } from '@/components/premium/PremiumGate'
import {
  canAccessFightPrediction,
  getFightAccessMessage,
} from '@/lib/fight-access'
import { useSubscription } from '@/hooks/useSubscription'
import { PredictionVerdictBanner } from '@/components/pronostics/PredictionVerdictBanner'
import { PredictionKeyFactors } from '@/components/pronostics/PredictionKeyFactors'
import { PredictionSummary } from '@/components/pronostics/PredictionSummary'
import { PremiumAnalysisUnlock } from '@/components/premium/PremiumAnalysisUnlock'
import { FightExperienceSkeleton } from '@/components/pronostics/FightExperienceSkeleton'
import { formatCountryLabel } from '@/lib/country-flag'
import { formatShortDate, formatPercent } from '@/utils/format'
import { cn } from '@/utils/cn'

interface OrgFightExperienceProps {
  org: Organization
  event: Event
  fight: Fight
  accessLabel?: string
  enforceAccess?: boolean
  /** Page org : aperçu court sans stats. Page combat : détail avec stats si accès. */
  variant?: 'preview' | 'detail'
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
  variant = 'preview',
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
  const isPreview = variant === 'preview'
  const compact = true

  const kpiItems = [
    { label: 'Confiance', value: formatPercent(fight.model.confidence) },
    { label: 'Lecture', value: convictionLabel(favoriteProb) },
  ]

  const predictionBlock = (
    <div className={cn('space-y-4', !compact && 'space-y-6')}>
      <div className="mx-auto max-w-xl">
        <PredictionVerdictBanner fight={fight} variant={isPreview ? 'default' : 'prominent'} />
      </div>

      <div className="mx-auto max-w-3xl">
        <div className="flex h-1.5 overflow-hidden rounded-full bg-white/[0.06] sm:h-2">
          <div className="bg-red-500/80 transition-all" style={{ width: `${redProb}%` }} />
          <div className="bg-blue-500/70 transition-all" style={{ width: `${blueProb}%` }} />
        </div>
        <div className="mt-1.5 flex justify-between text-[11px] tabular-nums text-muted sm:text-xs">
          <span>
            {fight.redCorner.name.split(' ').pop()} {formatPercent(redProb)}
          </span>
          <span>
            {fight.blueCorner.name.split(' ').pop()} {formatPercent(blueProb)}
          </span>
        </div>
      </div>

      <div className="mx-auto grid max-w-3xl grid-cols-2 gap-px overflow-hidden rounded-xl border border-white/[0.08] bg-white/[0.08] sm:rounded-2xl">
        {kpiItems.map((item) => (
          <div key={item.label} className="bg-[#0c1219] px-3 py-2.5 text-center sm:px-4 sm:py-3">
            <p className="text-[9px] uppercase tracking-wider text-muted sm:text-[10px]">
              {item.label}
            </p>
            <p className="mt-0.5 text-xs font-semibold tabular-nums sm:text-sm">{item.value}</p>
          </div>
        ))}
      </div>

      {showPrediction && (
        <RecentResults red={fight.redCorner} blue={fight.blueCorner} compact={compact} />
      )}
    </div>
  )

  return (
    <section id="pronostic" className="scroll-mt-24 border-b border-white/[0.06]">
      <div
        className={cn(
          'container-content px-4 sm:px-6 lg:px-8',
          isPreview ? 'py-5 sm:py-7' : 'section-padding',
        )}
      >
        <div className="max-w-4xl">
          {accessLabel && (
            <p className="text-[10px] font-medium uppercase tracking-[0.18em] text-muted sm:text-[11px]">
              {accessLabel}
            </p>
          )}
          <p className="mt-1.5 text-xs text-muted tabular-nums sm:mt-2 sm:text-sm">
            {formatShortDate(event.date)}
            <span className="mx-2 text-white/20">·</span>
            {event.city}
            {formatCountryLabel(event.country)
              ? `, ${formatCountryLabel(event.country)}`
              : event.country
                ? `, ${event.country}`
                : ''}
          </p>
          <h2 className="mt-2 font-display text-lg font-semibold tracking-tight text-muted sm:text-xl">
            {event.name}
          </h2>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="mt-4 text-center sm:mt-5"
        >
          <p className="text-xs text-muted sm:text-sm">{fight.weightClass}</p>
          <h3 className="mt-1 font-display text-lg font-semibold tracking-tight sm:text-xl lg:text-2xl">
            {fight.redCorner.name}
            <span className="mx-2 font-normal text-muted/80 sm:mx-3">vs</span>
            {fight.blueCorner.name}
          </h3>
        </motion.div>

        <div className="mx-auto mt-4 grid max-w-4xl grid-cols-[1fr_auto_1fr] items-end gap-2 sm:mt-5 sm:gap-4">
          <FighterPortrait
            fighter={fight.redCorner}
            corner="red"
            probability={showPrediction ? redProb : undefined}
            compact={compact}
            className="min-w-0"
          />
          <div className="flex flex-col items-center justify-center self-center px-0.5 pb-8 sm:px-1 sm:pb-10">
            <span className="font-display text-sm font-semibold text-gold/90 sm:text-lg">vs</span>
          </div>
          <FighterPortrait
            fighter={fight.blueCorner}
            corner="blue"
            probability={showPrediction ? blueProb : undefined}
            compact={compact}
            className="min-w-0"
          />
        </div>

        <div className={cn('mt-5 space-y-4 sm:mt-6', !isPreview && 'sm:space-y-6')}>
          {enforceAccess && subLoading && !isPremium ? (
            <FightExperienceSkeleton />
          ) : enforceAccess && !hasAccess ? (
            <>
              <PredictionKeyFactors fight={fight} compact locked hideFooter />
              <PremiumGate
                title="Pronostic Premium"
                description={
                  lockMessage ??
                  'Débloquez les probabilités, la comparaison complète et la justification du modèle pour ce combat.'
                }
                className="min-h-[240px]"
              >
                {predictionBlock}
              </PremiumGate>
              <PremiumAnalysisUnlock />
            </>
          ) : (
            <>
              {predictionBlock}
              {isPreview && <PredictionSummary fight={fight} compact />}
              <PredictionKeyFactors fight={fight} compact />
            </>
          )}
        </div>

        {enforceAccess && !hasAccess && (
          <p className="mt-6 text-center text-sm text-muted">
            <FastLink href={org.seoPathFr} className="hover:text-foreground transition-colors">
              Retour aux pronostics {org.name}
            </FastLink>
          </p>
        )}
      </div>
    </section>
  )
}
