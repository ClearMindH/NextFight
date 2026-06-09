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

  const kpiItems = [
    { label: 'Confiance', value: formatPercent(fight.model.confidence) },
    { label: 'Lecture', value: convictionLabel(favoriteProb) },
  ]

  const predictionBlock = (
    <div className={cn('space-y-6', !isPreview && 'space-y-8')}>
      <div className="mx-auto max-w-xl">
        <PredictionVerdictBanner fight={fight} variant={isPreview ? 'default' : 'prominent'} />
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

      <div
        className={cn(
          'mx-auto grid max-w-3xl grid-cols-2 gap-px overflow-hidden rounded-2xl border border-white/[0.08] bg-white/[0.08]',
        )}
      >
        {kpiItems.map((item) => (
          <div
            key={item.label}
            className={cn('bg-[#0c1219] px-4 text-center', isPreview ? 'py-3' : 'py-4 sm:py-5')}
          >
            <p className="text-[10px] uppercase tracking-wider text-muted">{item.label}</p>
            <p className="mt-1 text-sm font-semibold tabular-nums">{item.value}</p>
          </div>
        ))}
      </div>

      {showPrediction && (
        <RecentResults red={fight.redCorner} blue={fight.blueCorner} />
      )}
    </div>
  )

  return (
    <section id="pronostic" className="scroll-mt-24 border-b border-white/[0.06]">
      <div
        className={cn(
          'container-content section-padding',
          isPreview && 'pb-8 sm:pb-10',
        )}
      >
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
          className={cn('mt-8 text-center', !isPreview && 'mt-10')}
        >
          <p className="text-sm text-muted">{fight.weightClass}</p>
          <h3
            className={cn(
              'mt-2 font-display font-semibold tracking-tight',
              isPreview ? 'text-2xl sm:text-3xl' : 'text-3xl sm:text-4xl',
            )}
          >
            {fight.redCorner.name}
            <span className="mx-3 font-normal text-muted/80">vs</span>
            {fight.blueCorner.name}
          </h3>
        </motion.div>

        <div
          className={cn(
            'mx-auto grid max-w-5xl grid-cols-1 items-end gap-6 lg:grid-cols-[1fr_auto_1fr] lg:gap-6',
            isPreview ? 'mt-6' : 'mt-10 gap-8',
          )}
        >
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

        <div className={cn(isPreview ? 'mt-8' : 'mt-12')}>
          {!subLoading && enforceAccess && !hasAccess ? (
            <PremiumGate
              title="Pronostic Premium"
              description={
                lockMessage ??
                'Abonnez-vous pour voir le pronostic complet, les probabilités et les statistiques de ce combat.'
              }
              className="min-h-[280px]"
            >
              {predictionBlock}
            </PremiumGate>
          ) : (
            predictionBlock
          )}
        </div>

        {enforceAccess && !hasAccess && (
          <p className="mt-8 text-center text-sm text-muted">
            <FastLink href="/pricing" className="text-gold hover:underline underline-offset-4">
              Passer en Premium
            </FastLink>
            {' · '}
            <FastLink href={org.seoPathFr} className="hover:text-foreground transition-colors">
              Retour aux pronostics {org.name}
            </FastLink>
          </p>
        )}
      </div>
    </section>
  )
}
