'use client'

import { FeaturedEventFightCard } from '@/components/pronostics/ufc/FeaturedEventFightCard'
import type { Event } from '@/types'
import type { PublicTrackRecord } from '@/lib/public-track-record-format'
import { formatTrackRecordContext } from '@/lib/public-track-record-format'
import { FEATURED_UFC_DATE_LABEL, FEATURED_UFC_EVENT_LABEL } from '@/lib/event-urgency'
import { PREMIUM_MONTHLY_PRICE_LABEL } from '@/lib/stripe-plans'
import { useSubscription } from '@/hooks/useSubscription'
import { FastLink } from '@/components/navigation/FastLink'
import { StripeCheckoutButton } from '@/components/stripe/StripeCheckoutButton'
import { UfcPronosticsConversion } from '@/components/conversion/UfcPronosticsConversion'
import { cn } from '@/utils/cn'

const ACCENT = '#e8c840'
const BG = '#0a0a0a'

const FINAL_BENEFITS = [
  'Tous les combats de chaque carte UFC du mois',
  'Probabilités, facteurs et justification du modèle',
  'Main events et cartes PPV inclus',
  'Bilan UFC transparent sur le site',
  'Annulation libre à tout moment',
] as const

type UfcPronosticsPageContentProps = {
  event: Event
  trackRecord: PublicTrackRecord
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
            {eventName} · {FEATURED_UFC_DATE_LABEL}
          </p>
          <h1 className="mt-4 font-display text-3xl font-semibold leading-tight tracking-tight text-white sm:text-4xl lg:text-[2.75rem]">
            Les pronostics qui battent les cotes bookmakers
          </h1>
          <p className="mt-4 max-w-2xl text-sm leading-relaxed text-[#a8a29e] sm:text-base">
            Carte par carte · {FEATURED_UFC_EVENT_LABEL} · co-main gratuit, reste de la carte en
            Premium ({PREMIUM_MONTHLY_PRICE_LABEL}/mois).
          </p>

          <div className="mt-8 grid grid-cols-3 gap-3 sm:gap-4">
            {[
              {
                value: trackRecord.total > 0 ? `${trackRecord.accuracy}%` : '—',
                label: 'Précision UFC',
              },
              { value: String(lockedCount), label: 'Analyses carte' },
              { value: PREMIUM_MONTHLY_PRICE_LABEL, label: 'Par mois' },
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
  const cards =
    trackRecord.total > 0
      ? [
          {
            value: `${trackRecord.accuracy}%`,
            label: 'Précision UFC',
            sub: `${trackRecord.correct}/${trackRecord.total} pronostics`,
          },
          {
            value: String(trackRecord.total),
            label: 'Pronostics archivés',
            sub: trackRecord.periodLabel,
          },
          {
            value: `${trackRecord.correct}/${trackRecord.total}`,
            label: 'Corrects',
            sub: 'Figés avant la carte',
          },
        ]
      : [
          {
            value: '—',
            label: 'Précision UFC',
            sub: 'Premiers résultats bientôt',
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
          <p className="mt-2 text-sm text-[#8a8278]">{formatTrackRecordContext(trackRecord)}</p>
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
            Débloquez toutes les cartes UFC du mois
          </h2>
          <p className="mt-2 text-sm text-[#a8a29e]">
            {lockedCount} analyse{lockedCount > 1 ? 's' : ''} Premium sur cette carte + les
            prochaines cartes du mois.
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
            <p className="font-display text-3xl font-semibold tabular-nums text-white">
              {PREMIUM_MONTHLY_PRICE_LABEL}
            </p>
            <p className="text-sm text-[#8a8278]">/mois · toutes les cartes UFC du mois</p>
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

export function UfcPronosticsPageContent({ event, trackRecord }: UfcPronosticsPageContentProps) {
  const { isPremium, loading: subLoading } = useSubscription()
  const confirmedPremium = !subLoading && isPremium
  const lockedCount = event.fights.length - 1

  return (
    <div className="relative z-10 flex flex-col">
      <UfcHero lockedCount={lockedCount} eventName={event.name} trackRecord={trackRecord} />
      <FeaturedEventFightCard event={event} />
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
