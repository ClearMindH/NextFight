'use client'

import Link from 'next/link'
import type { Event } from '@/types'
import { FeaturedEventFightCard } from '@/components/pronostics/ufc/FeaturedEventFightCard'
import { StripeCheckoutButton } from '@/components/stripe/StripeCheckoutButton'
import { FastLink } from '@/components/navigation/FastLink'
import type { PublicTrackRecord } from '@/lib/public-track-record-format'
import { formatTrackRecordContext } from '@/lib/public-track-record-format'
import {
  FEATURED_UFC_DATE_LABEL,
  FEATURED_UFC_EVENT_LABEL,
} from '@/lib/event-urgency'
import { PREMIUM_MONTHLY_PRICE_LABEL } from '@/lib/stripe-plans'

const ACCENT = '#e8c840'
const BG = '#0a0a0a'

type HomeFeaturedPredictionsProps = {
  event: Event
  trackRecord: PublicTrackRecord
}

export function HomeFeaturedPredictions({ event, trackRecord }: HomeFeaturedPredictionsProps) {
  const lockedCount = event.fights.length - 1

  return (
    <>
      <section className="border-b border-white/[0.06] pt-site-header" style={{ backgroundColor: BG }}>
        <div className="container-content px-4 py-10 sm:px-6 sm:py-12 lg:px-8">
          <div className="mx-auto max-w-4xl">
            <p
              className="text-[11px] font-semibold uppercase tracking-[0.22em]"
              style={{ color: ACCENT }}
            >
              {event.name} · {FEATURED_UFC_DATE_LABEL}
            </p>
            <h1 className="mt-4 font-display text-3xl font-semibold leading-tight tracking-tight text-white sm:text-4xl lg:text-[2.75rem]">
              Pronostic gratuit + carte UFC complète
            </h1>
            <p className="mt-4 max-w-2xl text-sm leading-relaxed text-[#a8a29e] sm:text-base">
              {FEATURED_UFC_EVENT_LABEL} — co-main BSD vs Pimblett en accès libre,{' '}
              {lockedCount} autres analyses en Premium ({PREMIUM_MONTHLY_PRICE_LABEL}/mois).
            </p>

            <div className="mt-8 grid grid-cols-3 gap-3 sm:gap-4">
              {[
                {
                  value: trackRecord.total > 0 ? `${trackRecord.accuracy}%` : '—',
                  label: 'Précision UFC',
                  sub: trackRecord.total > 0 ? `${trackRecord.correct}/${trackRecord.total}` : 'Bilan en cours',
                },
                { value: String(lockedCount), label: 'Analyses carte', sub: 'Premium' },
                { value: PREMIUM_MONTHLY_PRICE_LABEL, label: 'Par mois', sub: 'Toutes cartes UFC' },
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
                  <p className="mt-0.5 text-[10px] text-[#6f6a62]">{stat.sub}</p>
                </div>
              ))}
            </div>

            {trackRecord.total > 0 && (
              <p className="mt-4 text-xs text-[#8a8278]">
                {formatTrackRecordContext(trackRecord)} ·{' '}
                <FastLink href="/resultats" className="text-[#c9b896] hover:text-[#e8c840]">
                  voir le détail →
                </FastLink>
              </p>
            )}

            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
              <a
                href="#combat-gratuit"
                className="inline-flex items-center justify-center rounded-full px-6 py-3 text-sm font-semibold text-[#0a0a0a] transition-opacity hover:opacity-90"
                style={{ backgroundColor: ACCENT }}
              >
                Voir le pronostic gratuit
              </a>
              <Link
                href="/pricing"
                className="inline-flex items-center justify-center rounded-full border border-white/[0.14] px-6 py-3 text-sm font-medium text-white transition-colors hover:border-[#e8c840]/50 hover:text-[#e8c840]"
              >
                Débloquer les {lockedCount} analyses
              </Link>
            </div>
          </div>
        </div>
      </section>

      <FeaturedEventFightCard event={event} />

      <section className="border-b border-white/[0.06] bg-[#080808]">
        <div className="container-content section-padding">
          <div className="mx-auto flex max-w-4xl flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-medium text-white">
                Accédez aux {lockedCount} autres pronostics de cette carte
              </p>
              <p className="mt-1 text-xs text-[#8a8278]">
                Probabilités, facteurs clés et lecture matchup pour chaque combat
              </p>
            </div>
            <StripeCheckoutButton planId="premium_monthly" highlighted className="max-w-xs shrink-0">
              Premium {PREMIUM_MONTHLY_PRICE_LABEL}/mois →
            </StripeCheckoutButton>
          </div>
        </div>
      </section>
    </>
  )
}
