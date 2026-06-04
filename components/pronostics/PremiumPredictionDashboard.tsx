'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import {
  ArrowUpRight,
  Calendar,
  MapPin,
  Users,
  Target,
  Zap,
  Scale,
  ChevronRight,
  TrendingUp,
} from 'lucide-react'
import type { Event, Fight, Organization } from '@/types'
import type { FighterScoreProfile } from '@/types/prediction'
import { getOrgBrand } from '@/lib/org-brand'
import { getFreePreviewFight, getMainFight } from '@/lib/event-helpers'
import { useSubscription } from '@/hooks/useSubscription'
import {
  formatShortDate,
  formatPercent,
  formatFighterNickname,
  formatPredictedRound,
  methodLabels,
} from '@/utils/format'
import { cn } from '@/utils/cn'

const DIMENSIONS: { key: keyof Omit<FighterScoreProfile, 'compositeScore'>; label: string; color: string }[] = [
  { key: 'striking', label: 'Striking', color: '#2dd4bf' },
  { key: 'grappling', label: 'Grappling', color: '#a78bfa' },
  { key: 'physical', label: 'Physical', color: '#fbbf24' },
  { key: 'momentum', label: 'Momentum', color: '#f472b6' },
  { key: 'schedule', label: 'Schedule', color: '#60a5fa' },
  { key: 'recentForm', label: 'Forme récente', color: '#34d399' },
]

interface PremiumPredictionDashboardProps {
  org: Organization
  event: Event
  allEvents: Event[]
}

function convictionLabel(prob: number): { text: string; tone: string } {
  if (prob >= 62) return { text: 'Favori net', tone: 'text-[#fbbf24] border-[#fbbf24]/40 bg-[#fbbf24]/10' }
  if (prob >= 54) return { text: 'Léger favori', tone: 'text-[#2dd4bf] border-[#2dd4bf]/40 bg-[#2dd4bf]/10' }
  if (prob >= 46) return { text: 'Équilibré', tone: 'text-white/80 border-white/20 bg-white/5' }
  return { text: 'Underdog value', tone: 'text-[#a78bfa] border-[#a78bfa]/40 bg-[#a78bfa]/10' }
}

function formatCommunity(n: number | undefined): string | null {
  if (n == null || n <= 0) return null
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1000) return `${(n / 1000).toFixed(1)}K`
  return String(n)
}

function WinGauge({ redPct, accent }: { redPct: number; accent: string }) {
  const r = 52
  const cx = 60
  const cy = 58
  const startAngle = Math.PI
  const redAngle = startAngle - (redPct / 100) * Math.PI
  const redX = cx + r * Math.cos(redAngle)
  const redY = cy + r * Math.sin(redAngle)
  const largeArc = redPct > 50 ? 1 : 0

  return (
    <svg viewBox="0 0 120 72" className="mx-auto w-full max-w-[200px]" aria-hidden>
      <path
        d={`M ${cx - r} ${cy} A ${r} ${r} 0 0 1 ${cx + r} ${cy}`}
        fill="none"
        stroke="rgba(255,255,255,0.08)"
        strokeWidth="10"
        strokeLinecap="round"
      />
      <path
        d={`M ${cx - r} ${cy} A ${r} ${r} 0 ${largeArc} 1 ${redX} ${redY}`}
        fill="none"
        stroke={accent}
        strokeWidth="10"
        strokeLinecap="round"
        style={{ filter: `drop-shadow(0 0 8px ${accent})` }}
      />
    </svg>
  )
}

function VerticalConfidenceMeter({ value, accent }: { value: number; accent: string }) {
  const filled = Math.round((value / 100) * 24)
  return (
    <div className="flex items-end gap-[3px] h-16">
      {Array.from({ length: 24 }).map((_, i) => (
        <div
          key={i}
          className="w-[3px] rounded-sm transition-colors"
          style={{
            height: `${40 + (i % 3) * 8}%`,
            backgroundColor: i < filled ? accent : 'rgba(255,255,255,0.06)',
            opacity: i < filled ? 0.4 + (i / 24) * 0.6 : 1,
          }}
        />
      ))}
    </div>
  )
}

function IntelCard({
  children,
  className,
  glow,
}: {
  children: React.ReactNode
  className?: string
  glow?: string
}) {
  return (
    <div
      className={cn(
        'intel-card relative overflow-hidden rounded-2xl border border-white/[0.08] bg-[#0c1219]/80 p-4 sm:p-5 backdrop-blur-md',
        className,
      )}
    >
      {glow && (
        <div
          className="pointer-events-none absolute -right-6 -top-6 h-24 w-24 rounded-full blur-2xl"
          style={{ background: glow }}
        />
      )}
      <div className="relative">{children}</div>
    </div>
  )
}

export function PremiumPredictionDashboard({
  org,
  event,
  allEvents,
}: PremiumPredictionDashboardProps) {
  const { isPremium } = useSubscription()
  const mainFight = getMainFight(event)
  const freeFight = getFreePreviewFight(event)
  const fight = (isPremium ? mainFight : freeFight) ?? mainFight ?? freeFight
  const brand = getOrgBrand(org.id)

  if (!fight) return null
  const redProb = fight.model.redWinProbability
  const blueProb = 100 - redProb
  const favorite = redProb >= blueProb ? fight.redCorner : fight.blueCorner
  const favoriteProb = Math.max(redProb, blueProb)
  const conviction = convictionLabel(favoriteProb)
  const breakdown = fight.model.breakdown

  const communityLabel = formatCommunity(event.communityPredictions)
  const kpis = [
    { label: 'Confiance', value: formatPercent(fight.model.confidence), color: '#fbbf24' },
    { label: 'Méthode', value: methodLabels[fight.model.predictedMethod], color: '#a78bfa' },
    {
      label: 'Fin prévue',
      value: formatPredictedRound(
        fight.model.predictedMethod,
        fight.model.predictedRound,
        fight.scheduledRounds,
      ),
      color: '#2dd4bf',
    },
    { label: 'Rounds prévus', value: String(fight.scheduledRounds), color: '#60a5fa' },
    ...(communityLabel
      ? [{ label: 'Communauté', value: communityLabel, color: '#f472b6' }]
      : []),
  ]

  return (
    <section className="relative overflow-hidden bg-[#060a10]">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_70%_50%_at_50%_0%,rgba(45,212,191,0.06),transparent)]" />

      <div className="container-content relative section-padding">
        <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#2dd4bf]/80">
              {isPremium ? 'Combat à la une' : 'Co-main · pronostic gratuit'}
            </p>
            <h2 className="mt-2 font-display text-2xl font-semibold tracking-tight sm:text-3xl">
              {event.name}
            </h2>
            <div className="mt-2 flex flex-wrap gap-4 text-xs text-muted">
              <span className="inline-flex items-center gap-1.5">
                <Calendar className="h-3.5 w-3.5 text-gold/70" />
                {formatShortDate(event.date)}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <MapPin className="h-3.5 w-3.5 text-gold/70" />
                {event.city}, {event.country}
              </span>
            </div>
          </div>
          <Link
            href={`/fight/${fight.id}`}
            className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-4 py-2.5 text-xs font-medium text-foreground transition-colors hover:border-[#2dd4bf]/40 hover:text-[#2dd4bf]"
          >
            Fiche combat complète
            <ArrowUpRight className="h-4 w-4" />
          </Link>
        </div>

        {/* Bento — 3 colonnes de stats combat */}
        <div className="grid gap-4 lg:grid-cols-12 lg:gap-5">
          {/* Colonne gauche — conviction & communauté */}
          <div className="space-y-4 lg:col-span-3">
            <IntelCard glow={brand.accentMuted}>
              <p className="text-[10px] font-semibold uppercase tracking-wider text-muted">
                Probabilité vainqueur
              </p>
              <div className="mt-3 flex items-start justify-between gap-2">
                <div>
                  <p className="text-4xl font-semibold tabular-nums tracking-tight text-foreground">
                    {formatPercent(favoriteProb)}
                  </p>
                  <p className="mt-1 text-sm font-medium text-foreground/90">{favorite.name}</p>
                </div>
                <span
                  className={cn(
                    'shrink-0 rounded-lg border px-2 py-1 text-[10px] font-semibold uppercase tracking-wide',
                    conviction.tone,
                  )}
                >
                  {conviction.text}
                </span>
              </div>
            </IntelCard>

            <IntelCard>
              <p className="text-[10px] font-semibold uppercase tracking-wider text-muted mb-3">
                Répartition des probabilités
              </p>
              <WinGauge redPct={redProb} accent={brand.accent} />
              <div className="mt-3 grid grid-cols-2 gap-2 text-[11px]">
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full" style={{ background: brand.accent }} />
                  <span className="text-muted">{fight.redCorner.name.split(' ').pop()}</span>
                  <span className="ml-auto tabular-nums text-foreground">{formatPercent(redProb)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-[#60a5fa]" />
                  <span className="text-muted">{fight.blueCorner.name.split(' ').pop()}</span>
                  <span className="ml-auto tabular-nums text-foreground">{formatPercent(blueProb)}</span>
                </div>
              </div>
            </IntelCard>

            <IntelCard>
              <p className="text-[10px] font-semibold uppercase tracking-wider text-muted mb-3">
                Signaux événement
              </p>
              <div className="grid grid-cols-2 gap-3">
                {[
                  ...(communityLabel
                    ? [{ icon: Users, label: 'Pronostics', value: communityLabel }]
                    : []),
                  { icon: Target, label: 'Confiance', value: formatPercent(fight.model.confidence) },
                  { icon: Zap, label: 'Catégorie', value: fight.weightClass.split(' ')[0] },
                  { icon: Scale, label: 'Titre', value: fight.isTitle ? 'Oui' : 'Non' },
                ].map(({ icon: Icon, label, value }) => (
                  <div
                    key={label}
                    className="rounded-xl border border-white/[0.06] bg-black/20 px-3 py-2.5"
                  >
                    <Icon className="h-3.5 w-3.5 text-muted mb-1" />
                    <p className="text-[10px] uppercase tracking-wide text-muted">{label}</p>
                    <p className="text-sm font-semibold tabular-nums">{value}</p>
                  </div>
                ))}
              </div>
            </IntelCard>
          </div>

          {/* Colonne centrale — graphique dimensions (différenciant vs sites de cotes) */}
          <div className="lg:col-span-6">
            <IntelCard className="h-full min-h-[420px]" glow="rgba(45,212,191,0.12)">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/[0.06] pb-4">
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-muted">
                    Analyse comparative · 5 dimensions
                  </p>
                  <p className="mt-1 text-lg font-semibold">
                    {fight.redCorner.name}{' '}
                    <span className="font-normal text-muted">vs</span> {fight.blueCorner.name}
                  </p>
                </div>
                <span className="rounded-lg border border-[#2dd4bf]/30 bg-[#2dd4bf]/10 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-[#2dd4bf]">
                  {fight.weightClass}
                </span>
              </div>

              <div className="mt-4 flex flex-wrap gap-4 border-b border-white/[0.06] pb-4">
                {kpis.map((k) => (
                  <div key={k.label} className="min-w-[72px]">
                    <p className="text-[10px] uppercase tracking-wide text-muted">{k.label}</p>
                    <p className="text-lg font-semibold tabular-nums">{k.value}</p>
                    <div className="mt-1 h-1 w-10 rounded-full" style={{ background: k.color }} />
                  </div>
                ))}
              </div>

              {breakdown ? (
                <div className="mt-6 flex h-48 items-end justify-between gap-2 sm:gap-3">
                  {DIMENSIONS.map((dim, i) => {
                    const redScore = breakdown.red[dim.key]
                    const blueScore = breakdown.blue[dim.key]
                    const redH = (redScore / 100) * 100
                    const blueH = (blueScore / 100) * 100
                    return (
                      <div key={dim.key} className="flex flex-1 flex-col items-center gap-2">
                        <div className="flex w-full max-w-[48px] items-end justify-center gap-0.5 h-40">
                          <motion.div
                            initial={{ height: 0 }}
                            whileInView={{ height: `${redH}%` }}
                            viewport={{ once: true }}
                            transition={{ delay: i * 0.05, duration: 0.5 }}
                            className="w-[42%] rounded-t-sm min-h-[4px]"
                            style={{ background: dim.color, opacity: 0.9 }}
                            title={`${fight.redCorner.name}: ${Math.round(redScore)}`}
                          />
                          <motion.div
                            initial={{ height: 0 }}
                            whileInView={{ height: `${blueH}%` }}
                            viewport={{ once: true }}
                            transition={{ delay: i * 0.05 + 0.08, duration: 0.5 }}
                            className="w-[42%] rounded-t-sm min-h-[4px] bg-[#60a5fa]/80"
                            title={`${fight.blueCorner.name}: ${Math.round(blueScore)}`}
                          />
                        </div>
                        <span className="text-[9px] sm:text-[10px] text-center text-muted uppercase tracking-wide leading-tight">
                          {dim.label}
                        </span>
                      </div>
                    )
                  })}
                </div>
              ) : (
                <p className="mt-8 text-sm text-muted">Breakdown indisponible pour ce combat.</p>
              )}

              <p className="mt-4 text-[10px] text-muted/80 leading-relaxed">
                Contrairement aux sites de cotes (odds aggregator), NextFight expose le{' '}
                <strong className="text-foreground/80">score par dimension</strong> du moteur — pas
                un taux bookmaker.
              </p>
            </IntelCard>
          </div>

          {/* Colonne droite — calibrage & calendrier */}
          <div className="space-y-4 lg:col-span-3">
            <IntelCard glow={brand.accentMuted}>
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-muted">
                    Calibrage statistique
                  </p>
                  <p className="mt-2 text-3xl font-semibold tabular-nums">
                    {formatPercent(fight.model.confidence)}
                  </p>
                  <p className="mt-1 flex items-center gap-1 text-xs text-[#2dd4bf]">
                    <TrendingUp className="h-3.5 w-3.5" />
                    Confiance sur ce matchup
                  </p>
                </div>
                <VerticalConfidenceMeter value={fight.model.confidence} accent="#2dd4bf" />
              </div>
            </IntelCard>

            <IntelCard>
              <p className="text-[10px] font-semibold uppercase tracking-wider text-muted mb-3">
                Scénario probable
              </p>
              <ul className="space-y-2">
                {(['ko_tko', 'submission', 'decision'] as const).map((m) => {
                  const active = fight.model.predictedMethod === m
                  return (
                    <li
                      key={m}
                      className={cn(
                        'flex items-center justify-between rounded-xl border px-3 py-2.5 text-sm transition-colors',
                        active
                          ? 'border-[#a78bfa]/40 bg-[#a78bfa]/10 text-foreground'
                          : 'border-white/[0.04] bg-black/15 text-muted',
                      )}
                    >
                      <span>{methodLabels[m]}</span>
                      {active && (
                        <span className="text-[10px] font-semibold uppercase text-[#a78bfa]">
                          Prédit
                        </span>
                      )}
                    </li>
                  )
                })}
              </ul>
            </IntelCard>

            {allEvents.length > 0 && (
              <IntelCard>
                <p className="text-[10px] font-semibold uppercase tracking-wider text-muted mb-3">
                  Cartes {org.name} suivies
                </p>
                <ul className="space-y-1">
                  {allEvents.slice(0, 4).map((ev) => {
                    const main = getMainFight(ev)
                    const isCurrent = ev.id === event.id
                    return (
                      <li key={ev.id}>
                        <Link
                          href={main ? `/fight/${main.id}` : org.seoPathFr}
                          className={cn(
                            'group flex items-center justify-between gap-2 rounded-xl px-3 py-2.5 text-sm transition-colors',
                            isCurrent
                              ? 'bg-white/[0.06] text-foreground'
                              : 'text-muted hover:bg-white/[0.04] hover:text-foreground',
                          )}
                        >
                          <span className="truncate font-medium">{ev.name}</span>
                          <ChevronRight className="h-4 w-4 shrink-0 opacity-50 group-hover:opacity-100" />
                        </Link>
                      </li>
                    )
                  })}
                </ul>
              </IntelCard>
            )}
          </div>
        </div>

        {/* Matchup strip — remplace l’ancienne PredictionCard */}
        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <MatchupTile
            corner="Red"
            fighter={fight.redCorner.name}
            nickname={fight.redCorner.nickname}
            record={fight.redCorner.record}
            prob={redProb}
            accent={brand.accent}
            align="left"
          />
          <MatchupTile
            corner="Blue"
            fighter={fight.blueCorner.name}
            nickname={fight.blueCorner.nickname}
            record={fight.blueCorner.record}
            prob={blueProb}
            accent="#60a5fa"
            align="right"
          />
        </div>
      </div>
    </section>
  )
}

function MatchupTile({
  corner,
  fighter,
  nickname,
  record,
  prob,
  accent,
  align,
}: {
  corner: string
  fighter: string
  nickname?: string
  record: string
  prob: number
  accent: string
  align: 'left' | 'right'
}) {
  const nick = formatFighterNickname(nickname)
  return (
    <div
      className={cn(
        'intel-card flex items-center justify-between gap-4 rounded-2xl border border-white/[0.08] p-4 sm:p-5',
        align === 'right' && 'sm:flex-row-reverse sm:text-right',
      )}
    >
      <div>
        <p className="text-[10px] uppercase tracking-wider text-muted">{corner} corner</p>
        <p className="mt-1 text-lg font-semibold">{fighter}</p>
        {nick && <p className="mt-1 text-sm italic text-gold/85">&ldquo;{nick}&rdquo;</p>}
        <p className="mt-1.5 text-sm font-semibold tabular-nums text-[#f5f2eb]">{record}</p>
      </div>
      <div className={cn('text-right', align === 'right' && 'sm:text-left')}>
        <p className="text-3xl font-semibold tabular-nums" style={{ color: accent }}>
          {formatPercent(prob)}
        </p>
        <p className="text-[10px] uppercase text-muted">Win prob.</p>
      </div>
    </div>
  )
}
