import Link from 'next/link'
import { ArrowUpRight, Shield } from 'lucide-react'
import type { HeroFightAdvantage, HeroShowcaseData } from '@/lib/hero-showcase'
import { fighterShortName } from '@/lib/prediction-verdict'
import { getCountryFlagEmoji } from '@/lib/country-flag'
import { formatShortDate } from '@/utils/format'
import { cn } from '@/utils/cn'

type HeroFightPreviewProps = {
  data: HeroShowcaseData
}

function AdvantageRow({ item }: { item: HeroFightAdvantage }) {
  if (item.edge === 0) {
    return (
      <li className="flex items-center gap-2 text-[11px] text-[#9a9288]">
        <span className="h-1 w-1 shrink-0 rounded-full bg-[#c9b896]" aria-hidden />
        <span className="capitalize">{item.dimension}</span>
      </li>
    )
  }

  return (
    <li className="flex items-center justify-between gap-2 rounded-lg border border-white/[0.05] bg-white/[0.02] px-2.5 py-1.5 text-[11px]">
      <span className="text-[#c8c0b4]">
        <span className="font-medium text-[#f5f2eb]">{item.fighterName}</span>
        <span className="text-[#8a8278]"> · {item.dimension}</span>
      </span>
      <span className="shrink-0 font-semibold tabular-nums text-[#c9b896]">+{item.edge}</span>
    </li>
  )
}

export function HeroFightPreview({ data }: HeroFightPreviewProps) {
  const { showcase, verdict, advantages, analysisHref } = data
  const { fight, event, organization } = showcase
  const redProb = Math.round(fight.model.redWinProbability)
  const blueProb = 100 - redProb
  const favoriteIsRed = redProb >= blueProb

  return (
    <div className="relative">
      <div
        className="pointer-events-none absolute -inset-4 rounded-[1.75rem] bg-[radial-gradient(ellipse_at_center,rgba(201,162,39,0.12),transparent_70%)]"
        aria-hidden
      />
      <article className="relative overflow-hidden rounded-2xl border border-[#c9b896]/20 bg-gradient-to-b from-[#12100e] to-[#080808] shadow-[0_24px_80px_-32px_rgba(0,0,0,0.9)]">
        <div className="border-b border-white/[0.06] px-4 py-3 sm:px-5">
          <div className="flex items-center justify-between gap-3">
            <div className="min-w-0">
              <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#c9b896]">
                {organization.name} · Co-main gratuit
              </p>
              <p className="mt-1 truncate font-display text-sm font-semibold text-[#f5f2eb] sm:text-base">
                {event.name}
              </p>
            </div>
            <span className="shrink-0 rounded-full border border-white/10 bg-white/[0.03] px-2 py-0.5 text-[10px] text-[#8a8278]">
              {formatShortDate(event.date)}
            </span>
          </div>
        </div>

        <div className="space-y-4 px-4 py-4 sm:px-5 sm:py-5">
          <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2 sm:gap-3">
            <FighterCell
              name={fight.redCorner.name}
              country={fight.redCorner.country}
              record={fight.redCorner.record}
              probability={redProb}
              corner="red"
              favored={favoriteIsRed}
            />
            <span className="font-display text-xs font-medium text-[#5c5c5c]">VS</span>
            <FighterCell
              name={fight.blueCorner.name}
              country={fight.blueCorner.country}
              record={fight.blueCorner.record}
              probability={blueProb}
              corner="blue"
              favored={!favoriteIsRed}
              align="right"
            />
          </div>

          <div className="h-2 overflow-hidden rounded-full bg-white/[0.06]">
            <div className="flex h-full">
              <div
                className="bg-gradient-to-r from-red-600/90 to-red-500/70 transition-all"
                style={{ width: `${redProb}%` }}
              />
              <div
                className="bg-gradient-to-r from-blue-500/70 to-blue-600/90 transition-all"
                style={{ width: `${blueProb}%` }}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 sm:gap-3">
            <MetricPill
              label="Pronostic"
              value={verdict.headline}
              accent
            />
            <MetricPill
              label="Confiance"
              value={`${Math.round(fight.model.confidence)} %`}
              icon={<Shield className="h-3 w-3 text-[#c9b896]" aria-hidden />}
            />
          </div>

          {advantages.length > 0 && (
            <div>
              <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.16em] text-[#6b6560]">
                Avantages clés
              </p>
              <ul className="space-y-1.5">
                {advantages.map((item) => (
                  <AdvantageRow key={`${item.fighterName}-${item.dimension}`} item={item} />
                ))}
              </ul>
            </div>
          )}
        </div>

        <Link
          href={`/fight/${fight.id}`}
          className="flex items-center justify-between border-t border-white/[0.06] px-4 py-3 text-xs font-medium text-[#c9b896] transition-colors hover:bg-white/[0.02] sm:px-5"
        >
          Voir l&apos;analyse complète
          <ArrowUpRight className="h-3.5 w-3.5" aria-hidden />
        </Link>
      </article>

      <Link
        href={analysisHref}
        className="absolute -bottom-3 left-1/2 hidden -translate-x-1/2 rounded-full border border-[#B91C1C]/40 bg-[#1a0a0a] px-3 py-1 text-[10px] font-medium uppercase tracking-wider text-[#e8a0a0] sm:inline-flex"
      >
        Carte UFC de la semaine
      </Link>
    </div>
  )
}

function FighterCell({
  name,
  country,
  record,
  probability,
  corner,
  favored,
  align = 'left',
}: {
  name: string
  country: string
  record: string
  probability: number
  corner: 'red' | 'blue'
  favored: boolean
  align?: 'left' | 'right'
}) {
  const flag = getCountryFlagEmoji(country)

  return (
    <div className={cn('min-w-0', align === 'right' && 'text-right')}>
      <div
        className={cn(
          'flex items-center gap-1.5',
          align === 'right' && 'flex-row-reverse justify-end',
        )}
      >
        <span className="text-base leading-none" aria-hidden>
          {flag}
        </span>
        <p className="truncate font-display text-sm font-semibold text-[#f5f2eb] sm:text-base">
          {fighterShortName(name)}
        </p>
      </div>
      <p className="mt-0.5 text-[10px] tabular-nums text-[#6b6560]">{record}</p>
      <p
        className={cn(
          'mt-1 font-display text-xl font-semibold tabular-nums sm:text-2xl',
          favored ? 'text-[#c9b896]' : 'text-[#8a8278]',
          corner === 'red' && !favored && 'text-red-300/80',
          corner === 'blue' && !favored && 'text-blue-300/80',
        )}
      >
        {probability}%
      </p>
    </div>
  )
}

function MetricPill({
  label,
  value,
  accent,
  icon,
}: {
  label: string
  value: string
  accent?: boolean
  icon?: React.ReactNode
}) {
  return (
    <div
      className={cn(
        'rounded-xl border px-3 py-2.5',
        accent
          ? 'border-[#c9b896]/25 bg-[#c9b896]/[0.06]'
          : 'border-white/[0.06] bg-white/[0.02]',
      )}
    >
      <p className="text-[9px] font-semibold uppercase tracking-[0.14em] text-[#6b6560]">
        {label}
      </p>
      <p className="mt-1 flex items-center gap-1.5 text-xs font-medium text-[#f5f2eb] sm:text-sm">
        {icon}
        <span className="truncate">{value}</span>
      </p>
    </div>
  )
}
