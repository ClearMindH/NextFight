'use client'

import { StripeCheckoutButton } from '@/components/stripe/StripeCheckoutButton'
import { cn } from '@/utils/cn'

const ROWS = [
  { feature: 'Calendrier des combats', free: true, premium: true },
  { feature: 'Pronostic co-main event', free: true, premium: true },
  { feature: 'Tous les combats de la carte', free: false, premium: true },
  { feature: 'Probabilités de victoire', free: false, premium: true },
  { feature: 'Analyse détaillée par combat', free: false, premium: true },
  { feature: 'UFC + PFL + KSW + ARES + Hexagone', free: false, premium: true },
  { feature: 'Accès immédiat, annulation libre', free: false, premium: true },
] as const

function Cell({ ok }: { ok: boolean }) {
  return (
    <span className={cn('text-base', ok ? 'text-[#c9b896]' : 'text-[#4a4a4a]')}>
      {ok ? '✅' : '❌'}
    </span>
  )
}

export function PlanComparisonTable() {
  return (
    <section className="border-t border-[#1a1816]">
      <div className="container-content section-padding">
        <h2 className="text-center font-display text-xl font-semibold tracking-tight text-[#f5f2eb] sm:text-2xl">
          Gratuit vs Premium
        </h2>
        <p className="mx-auto mt-3 max-w-md text-center text-sm text-[#8a8278]">
          Comparez ce que vous obtenez avec chaque offre.
        </p>

        <div className="mx-auto mt-10 max-w-3xl overflow-hidden rounded-2xl border border-[#1f1d1a]">
          <div className="grid grid-cols-[1.4fr_0.7fr_0.9fr] bg-[#0a0a0a] text-[10px] font-semibold uppercase tracking-[0.14em] text-[#8a8278] sm:text-xs">
            <div className="px-4 py-3 sm:px-6">Fonctionnalité</div>
            <div className="px-2 py-3 text-center sm:px-4">Gratuit</div>
            <div className="bg-[#12100c] px-2 py-3 text-center text-[#c9b896] sm:px-4">Premium</div>
          </div>

          {ROWS.map((row, i) => (
            <div
              key={row.feature}
              className={cn(
                'grid grid-cols-[1.4fr_0.7fr_0.9fr] border-t border-[#1a1816]',
                i % 2 === 0 ? 'bg-[#080808]' : 'bg-[#0a0a0a]',
              )}
            >
              <div className="px-4 py-3.5 text-sm text-[#d4cdc0] sm:px-6">{row.feature}</div>
              <div className="flex items-center justify-center px-2 py-3.5 sm:px-4">
                <Cell ok={row.free} />
              </div>
              <div className="flex items-center justify-center bg-[#12100c]/80 px-2 py-3.5 sm:px-4">
                <Cell ok={row.premium} />
              </div>
            </div>
          ))}

          <div className="grid grid-cols-[1.4fr_0.7fr_0.9fr] border-t border-[#1f1d1a] bg-[#12100c]">
            <div className="hidden sm:block" />
            <div className="hidden sm:block" />
            <div className="col-span-3 p-4 sm:col-span-1 sm:col-start-3 sm:p-5">
              <StripeCheckoutButton
                planId="premium_annual"
                highlighted
                className="!w-full !rounded-full !py-3 !text-sm !font-semibold"
              >
                Passer Premium
              </StripeCheckoutButton>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
