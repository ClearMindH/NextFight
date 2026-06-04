'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { ArrowUpRight, Sparkles, Calendar } from 'lucide-react'
import type { Event, Organization } from '@/types'
import { OrgBrandLogo } from '@/components/OrgBrandLogo'
import { getOrgBrand } from '@/lib/org-brand'
import { getFreePreviewFight } from '@/lib/event-helpers'
import { isEventPredictionsPublished } from '@/lib/event-predictions'
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
      whileHover={{ y: -6 }}
      className="h-full"
    >
      <Link
        href={org.seoPathFr}
        className={cn(
          'group relative flex h-full min-h-[300px] flex-col overflow-hidden rounded-[1.35rem]',
          'border bg-gradient-to-br p-[1px] transition-[box-shadow,border-color] duration-500',
          'hover:shadow-2xl',
        )}
        style={{
          borderColor: brand.card.border,
          boxShadow: `0 4px 24px -8px rgba(0,0,0,0.6), 0 0 0 1px ${brand.card.border}`,
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.boxShadow = `0 24px 48px -16px ${brand.card.glow}, 0 0 0 1px ${brand.card.border}`
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.boxShadow = `0 4px 24px -8px rgba(0,0,0,0.6), 0 0 0 1px ${brand.card.border}`
        }}
      >
        <div
          className={cn(
            'relative flex h-full flex-col overflow-hidden rounded-[1.25rem] bg-gradient-to-br px-5 py-5 sm:px-6 sm:py-6',
            brand.card.surface,
          )}
        >
          {/* Mesh glow — coin supérieur */}
          <div
            className={cn(
              'pointer-events-none absolute -right-8 -top-8 h-40 w-40 rounded-full bg-gradient-to-br blur-3xl transition-opacity duration-500',
              brand.card.mesh,
              'opacity-70 group-hover:opacity-100',
            )}
          />
          <div
            className="pointer-events-none absolute -bottom-12 -left-8 h-32 w-32 rounded-full bg-gradient-to-tr from-white/[0.04] to-transparent blur-2xl"
          />

          {/* Grille fine interne */}
          <div
            className="pointer-events-none absolute inset-0 opacity-[0.35]"
            style={{
              backgroundImage:
                'linear-gradient(rgba(255,255,255,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.04) 1px, transparent 1px)',
              backgroundSize: '24px 24px',
            }}
          />

          {/* Header dashboard */}
          <div className="relative flex items-start justify-between gap-3">
            <span
              className={cn(
                'inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-sans font-semibold uppercase tracking-[0.14em] ring-1',
                published ? brand.card.pill : 'bg-amber-500/10 text-amber-200/90 ring-amber-500/25',
              )}
            >
              <Sparkles className="h-3 w-3 opacity-80" />
              {published ? 'Pronostics complets' : 'Carte à venir'}
            </span>
            <span
              className={cn(
                'flex h-9 w-9 shrink-0 items-center justify-center rounded-full',
                'border border-white/10 bg-white/[0.06] text-foreground/80',
                'transition-all duration-300 group-hover:border-white/20 group-hover:bg-white/10 group-hover:text-foreground',
              )}
            >
              <ArrowUpRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </span>
          </div>

          {/* Wordmark */}
          <div className="relative mt-8 flex flex-1 flex-col items-center justify-center py-4">
            <OrgBrandLogo orgId={org.id} size="logo" glow="strong" className="max-w-full" />
          </div>

          {/* Footer — stats type dashboard */}
          <div className="relative mt-auto space-y-3 border-t border-white/[0.06] pt-4">
            <p className="text-center text-[10px] font-sans font-medium uppercase tracking-[0.16em] text-muted/90">
              {org.fullName}
            </p>

            {nextEvent && !published ? (
              <div className="rounded-xl border border-amber-500/15 bg-black/25 px-3 py-2.5 backdrop-blur-sm">
                <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-wider text-amber-200/80">
                  <Calendar className="h-3 w-3 shrink-0" />
                  {formatShortDate(nextEvent.date)}
                </div>
                <p className="mt-1 text-xs leading-relaxed text-muted">
                  {nextEvent.name} — analyses en préparation
                </p>
              </div>
            ) : nextEvent && main ? (
              <div className="rounded-xl border border-white/[0.06] bg-black/25 px-3 py-2.5 backdrop-blur-sm">
                <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-wider text-muted">
                  <Calendar className="h-3 w-3 shrink-0 text-gold/80" />
                  {formatShortDate(nextEvent.date)}
                </div>
                <p className="mt-1 truncate text-xs font-medium text-foreground/90">
                  {main.redCorner.name}{' '}
                  <span className="font-normal text-muted">vs</span> {main.blueCorner.name}
                </p>
                <div className="mt-2.5">
                  <PredictionVerdictBanner
                    fight={main}
                    variant="compact"
                    showProbability
                    className="text-left"
                  />
                </div>
              </div>
            ) : (
              <p className="text-center text-xs leading-relaxed text-muted">
                Analyses, calendrier et probabilités par combat.
              </p>
            )}

            <p className="text-center text-[10px] font-medium uppercase tracking-[0.2em] text-muted/70 transition-colors group-hover:text-gold">
              Ouvrir le hub →
            </p>
          </div>
        </div>
      </Link>
    </motion.div>
  )
}
