'use client'

import type { Fighter, FormMatchupInsight } from '@/types'
import type { FighterRecentBout } from '@/types/recent-form'
import { formatMonthsAgo, methodLabels } from '@/utils/format'
import { cn } from '@/utils/cn'
import { TrendingDown, TrendingUp, Swords } from 'lucide-react'

interface RecentFormPanelProps {
  red: Fighter
  blue: Fighter
  form?: FormMatchupInsight
}

export function RecentFormPanel({ red, blue, form }: RecentFormPanelProps) {
  if (!form) return null

  const totalBouts = form.fighterA.bouts.length + form.fighterB.bouts.length
  if (totalBouts === 0) return null

  const windowLabel =
    form.fighterA.bouts.length === form.fighterB.bouts.length
      ? `${form.fighterA.bouts.length} combat${form.fighterA.bouts.length > 1 ? 's' : ''} récent${form.fighterA.bouts.length > 1 ? 's' : ''}`
      : 'historique partiel'

  return (
    <section className="rounded-3xl border border-white/[0.08] bg-[#0c1219]/80 p-6 sm:p-8 backdrop-blur-md intel-card">
      <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#2dd4bf]/80">
        Forme récente · {windowLabel}
      </p>
      <h2 className="mt-2 font-display text-2xl font-semibold tracking-tight">
        Forces, faiblesses & confrontation
      </h2>
      <p className="mt-2 text-sm text-muted max-w-2xl">
        Le modèle s’appuie uniquement sur les combats récents connus (jusqu’à 5 par combattant), sans
        données inventées. Plus l’historique est complet, plus la forme pèse dans le pronostic.
      </p>

      {form.duelKeys.length > 0 && (
        <div className="mt-6 rounded-xl border border-[#2dd4bf]/20 bg-[#2dd4bf]/5 px-4 py-3">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-[#2dd4bf] mb-2 flex items-center gap-1.5">
            <Swords className="h-3.5 w-3.5" />
            Clés du matchup
          </p>
          <ul className="space-y-1 text-sm text-foreground/90">
            {form.duelKeys.map((key) => (
              <li key={key}>· {key}</li>
            ))}
          </ul>
        </div>
      )}

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <FighterFormColumn
          name={red.name}
          corner="red"
          profile={form.fighterA}
          edgePositive={form.matchupEdge > 0.02}
        />
        <FighterFormColumn
          name={blue.name}
          corner="blue"
          profile={form.fighterB}
          edgePositive={form.matchupEdge < -0.02}
        />
      </div>
    </section>
  )
}

function FighterFormColumn({
  name,
  corner,
  profile,
  edgePositive,
}: {
  name: string
  corner: 'red' | 'blue'
  profile: FormMatchupInsight['fighterA']
  edgePositive?: boolean
}) {
  const accent = corner === 'red' ? 'text-gold' : 'text-[#60a5fa]'

  return (
    <div className="rounded-2xl border border-white/[0.06] bg-black/20 p-4 sm:p-5">
      <div className="flex items-center justify-between gap-2">
        <h3 className={cn('font-semibold', accent)}>{name}</h3>
        {edgePositive && (
          <span className="inline-flex items-center gap-1 text-[10px] uppercase tracking-wide text-[#2dd4bf]">
            <TrendingUp className="h-3 w-3" />
            Edge forme
          </span>
        )}
        {!edgePositive && profile.lossesLast5 >= 3 && (
          <span className="inline-flex items-center gap-1 text-[10px] uppercase tracking-wide text-[#f472b6]">
            <TrendingDown className="h-3 w-3" />
            Forme basse
          </span>
        )}
      </div>

      <p className="mt-2 text-xs text-muted tabular-nums">
        {profile.bouts.length > 0 ? (
          <>
            {profile.winsLast5}V – {profile.lossesLast5}D sur {profile.bouts.length} · Finish{' '}
            {Math.round(profile.finishRateLast5)}% · Score forme{' '}
            {Math.round(profile.recentFormScore * 100)}%
          </>
        ) : (
          <>Historique récent non renseigné</>
        )}
      </p>

      <ul className="mt-4 space-y-2">
        {profile.bouts.length === 0 ? (
          <li className="rounded-lg border border-white/[0.04] bg-white/[0.02] px-3 py-2 text-xs text-muted">
            Aucun combat récent en base pour ce combattant.
          </li>
        ) : (
          profile.bouts.map((bout, index) => (
            <BoutRow
              key={`${bout.opponentName}-${bout.monthsAgo}-${bout.method}-${index}`}
              bout={bout}
            />
          ))
        )}
      </ul>

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <TagList title="Forces" items={profile.strengths} variant="strength" />
        <TagList title="Faiblesses" items={profile.weaknesses} variant="weakness" />
      </div>
    </div>
  )
}

function BoutRow({ bout }: { bout: FighterRecentBout }) {
  const resultColor =
    bout.result === 'win'
      ? 'text-[#2dd4bf]'
      : bout.result === 'loss'
        ? 'text-[#f472b6]'
        : 'text-muted'

  return (
    <li className="flex items-center justify-between gap-2 rounded-lg border border-white/[0.04] bg-white/[0.02] px-3 py-2 text-xs">
      <span
        className="text-muted w-[4.5rem] shrink-0 text-right tabular-nums"
        title={bout.monthsAgo > 0 ? `Il y a ${bout.monthsAgo} mois` : undefined}
      >
        {formatMonthsAgo(bout.monthsAgo)}
      </span>
      <span className="flex-1 truncate text-foreground/90">vs {bout.opponentName}</span>
      <span className={cn('font-semibold uppercase', resultColor)}>
        {bout.result === 'win' ? 'W' : bout.result === 'loss' ? 'L' : 'D'}
      </span>
      <span className="text-muted hidden sm:inline">{methodLabels[bout.method]}</span>
    </li>
  )
}

function TagList({
  title,
  items,
  variant,
}: {
  title: string
  items: string[]
  variant: 'strength' | 'weakness'
}) {
  return (
    <div>
      <p className="text-[10px] font-semibold uppercase tracking-wider text-muted mb-2">{title}</p>
      <ul className="flex flex-wrap gap-1.5">
        {items.map((item) => (
          <li
            key={item}
            className={cn(
              'rounded-full px-2.5 py-1 text-[10px] leading-snug',
              variant === 'strength'
                ? 'bg-[#2dd4bf]/10 text-[#7ee8d8] ring-1 ring-[#2dd4bf]/25'
                : 'bg-[#f472b6]/10 text-[#f9a8c4] ring-1 ring-[#f472b6]/25',
            )}
          >
            {item}
          </li>
        ))}
      </ul>
    </div>
  )
}
