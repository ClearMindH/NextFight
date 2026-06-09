'use client'

import { FastLink } from '@/components/navigation/FastLink'
import { motion } from 'framer-motion'
import { ArrowUpRight, Sparkles, Calendar } from 'lucide-react'
import type { Event, Organization } from '@/types'
import { OrgBrandLogo } from '@/components/OrgBrandLogo'
import { getOrgBrand } from '@/lib/org-brand'
import { getFreePreviewFight } from '@/lib/event-helpers'
import { isEventPredictionsPublished } from '@/lib/event-predictions'
import { FighterMatchupLine } from '@/components/FighterMatchupLine'
import { PredictionVerdictBanner } from '@/components/pronostics/PredictionVerdictBanner'
import { formatShortDate } from '@/utils/format'
import { cn } from '@/utils/cn'

interface PromotionOrgCardProps {
  org: Organization
  nextEvent?: Event
  index?: number
}

export function PromotionOrgCard({ org, nextEvent, index = 0 }: PromotionOrgCardProps) {
  const brand = getOrgBrand(org.id)
  const published = nextEvent ? isEventPredictionsPublished(nextEvent) : false
  const main = nextEvent && published ? getFreePreviewFight(nextEvent) : null

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.45, delay: index * 0.07, ease: [0.22, 1, 0.36, 1] }}
      whileHover={{ y: -4 }}
      className="h-full"
    >
      <FastLink
        href={org.seoPathFr}
        className={cn(
          'group relative flex h-full min-h-[300px] flex-col overflow-hidden rounded-2xl',
          'border transition-all duration-300 hover:shadow-lg',
        )}
        style={{
          borderColor: brand.card.border,
          boxShadow: `0 4px 20px -6px rgba(0,0,0,0.45)`,
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.boxShadow = `0 16px 40px -12px ${brand.card.glow}`
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.boxShadow = `0 4px 20px -6px rgba(0,0,0,0.45)`
        }}
      >
        <div
          className={cn(
            'relative flex h-full flex-col overflow-hidden rounded-[0.9rem] bg-gradient-to-b px-5 py-5 sm:px-5 sm:py-6',
            brand.card.surface,
          )}
        >
          <div
            className={cn(
              'pointer-events-none absolute -right-6 -top-6 h-32 w-32 rounded-full bg-gradient-to-br blur-2xl',
              brand.card.mesh,
              'opacity-50 group-hover:opacity-70',
            )}
          />

          <div className="relative flex items-start justify-between gap-3">
            <span
              className={cn(
                'inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-medium uppercase tracking-[0.12em] ring-1',
                published ? brand.card.pill : 'bg-amber-500/15 text-amber-100 ring-amber-400/30',
              )}
            >
              <Sparkles className="h-3 w-3 opacity-80" />
              {published ? 'Pronostics complets' : 'Carte à venir'}
            </span>
            <span
              className={cn(
                'flex h-8 w-8 shrink-0 items-center justify-center rounded-full',
                'border border-white/15 bg-white/10 text-foreground/90',
                'transition-colors group-hover:bg-white/15',
              )}
            >
              <ArrowUpRight className="h-3.5 w-3.5" />
            </span>
          </div>

          <div className="relative mt-5 flex flex-1 flex-col items-center justify-center py-5">
            <OrgBrandLogo orgId={org.id} size="logo" stacked tone="clean" className="max-w-full" />
          </div>

          <div className="relative mt-auto space-y-3 border-t border-white/10 pt-4">
            {nextEvent && !published ? (
              <div className="rounded-xl border border-white/10 bg-white/[0.06] px-4 py-3">
                <div className="flex items-center gap-1.5 text-[10px] font-medium uppercase tracking-[0.14em] text-amber-100/90">
                  <Calendar className="h-3 w-3 shrink-0" />
                  {formatShortDate(nextEvent.date)}
                </div>
                <p className="mt-2 font-display text-sm font-semibold tracking-tight text-foreground">
                  {nextEvent.name}
                </p>
                <p className="mt-1 text-xs text-muted">Analyses en préparation</p>
              </div>
            ) : nextEvent && main ? (
              <div className="rounded-xl border border-white/10 bg-white/[0.06] px-4 py-3.5">
                <time className="text-[10px] font-medium uppercase tracking-[0.14em] text-muted">
                  {formatShortDate(nextEvent.date)}
                </time>
                <p className="mt-2 font-display text-sm font-semibold leading-snug tracking-tight text-foreground">
                  {nextEvent.name}
                </p>
                <div className="mt-3">
                  <FighterMatchupLine red={main.redCorner} blue={main.blueCorner} variant="elegant" />
                </div>
                <div className="mt-3 border-t border-white/10 pt-3">
                  <PredictionVerdictBanner fight={main} variant="inline" showProbability />
                </div>
              </div>
            ) : (
              <p className="text-center text-xs leading-relaxed text-muted">
                Analyses, calendrier et probabilités par combat.
              </p>
            )}

            <p className="text-center text-[10px] font-medium uppercase tracking-[0.18em] text-muted transition-colors group-hover:text-gold">
              Ouvrir le hub →
            </p>
          </div>
        </div>
      </FastLink>
    </motion.div>
  )
}
