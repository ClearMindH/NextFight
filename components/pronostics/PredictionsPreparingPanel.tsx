'use client'

import { Hammer, Calendar, Swords } from 'lucide-react'
import type { Event } from '@/types'
import { sortFightsByCardOrder } from '@/lib/event-helpers'
import { formatShortDate } from '@/utils/format'

interface PredictionsPreparingPanelProps {
  event: Event
}

export function PredictionsPreparingPanel({ event }: PredictionsPreparingPanelProps) {
  const fights = sortFightsByCardOrder(event)

  return (
    <section
      id={`event-${event.id}`}
      className="scroll-mt-24 border-b border-white/[0.06] bg-[#080808]"
    >
      <div className="container-content section-padding">
        <div className="mx-auto max-w-3xl rounded-2xl border border-amber-500/20 bg-gradient-to-br from-[#141210] to-[#0a0a0a] px-6 py-8 sm:px-10 sm:py-10">
          <div className="flex items-start gap-4">
            <div
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-amber-500/15 text-amber-200/90"
              aria-hidden
            >
              <Hammer className="h-5 w-5" strokeWidth={1.5} />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[10px] font-medium uppercase tracking-[0.22em] text-amber-200/80">
                Pronostics en cours
              </p>
              <h2 className="mt-2 font-display text-xl font-semibold tracking-tight sm:text-2xl">
                {event.name}
              </h2>
              <p className="mt-2 flex items-center gap-2 text-sm text-[#8a8278]">
                <Calendar className="h-3.5 w-3.5 shrink-0" />
                {formatShortDate(event.date)}
                <span className="text-[#5c5c5c]">·</span>
                {event.city}, {event.country}
              </p>
              <p className="mt-4 text-sm leading-relaxed text-[#8a8278]">
                La carte est en ligne : notre équipe finalise les analyses combat par combat.
                Les probabilités et breakdowns seront publiés{' '}
                <span className="text-[#f5f2eb]">semaine par semaine</span>, avant l’événement.
              </p>
            </div>
          </div>

          {fights.length > 0 && (
            <div className="mt-8 border-t border-white/[0.06] pt-6">
              <p className="flex items-center gap-2 text-[10px] font-medium uppercase tracking-[0.18em] text-[#6b6b6b]">
                <Swords className="h-3.5 w-3.5" />
                Carte annoncée ({fights.length} combats)
              </p>
              <ul className="mt-4 space-y-2">
                {fights.map((f) => (
                  <li
                    key={f.id}
                    className="flex flex-wrap items-baseline justify-between gap-2 text-sm text-[#8a8278]"
                  >
                    <span>
                      {f.redCorner.name}{' '}
                      <span className="text-[#5c5c5c]">vs</span> {f.blueCorner.name}
                    </span>
                    <span className="text-xs text-[#5c5c5c]">{f.weightClass}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
