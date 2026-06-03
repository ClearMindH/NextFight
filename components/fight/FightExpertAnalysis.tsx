'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Loader2, Sparkles } from 'lucide-react'
import type { Fight } from '@/types'
import type { FightAnalysisResponse, FightNarrativeAnalysis } from '@/types/analysis'
import { PremiumGate } from '@/components/premium/PremiumGate'
import { cn } from '@/utils/cn'

interface FightExpertAnalysisProps {
  fight: Fight
  eventName: string
  isPremium?: boolean
}

export function FightExpertAnalysis({ fight, eventName, isPremium = false }: FightExpertAnalysisProps) {
  const [loading, setLoading] = useState(isPremium)
  const [error, setError] = useState<string | null>(null)
  const [narrative, setNarrative] = useState<FightNarrativeAnalysis | null>(null)

  useEffect(() => {
    if (!isPremium) {
      setLoading(false)
      return
    }

    let cancelled = false

    async function load() {
      try {
        const res = await fetch('/api/predict/analysis', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            fighterAId: fight.redCorner.id,
            fighterBId: fight.blueCorner.id,
            scheduledRounds: fight.scheduledRounds,
            weightClass: fight.weightClass,
            eventName,
          }),
        })

        const data = (await res.json()) as FightAnalysisResponse & {
          error?: string
        }

        if (cancelled) return

        if (!res.ok) {
          setError(data.error ?? 'Analyse indisponible pour le moment.')
          return
        }

        setNarrative(data.narrative)
      } catch {
        if (!cancelled) setError('Analyse indisponible pour le moment.')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    load()
    return () => {
      cancelled = true
    }
  }, [fight, eventName, isPremium])

  if (!isPremium) {
    return (
      <PremiumGate
        title="Analyse détaillée"
        description="Analyse rédigée, forces, faiblesses et clés du combat — réservé aux abonnés Premium."
        blur={false}
      />
    )
  }

  return (
    <section className="rounded-3xl border border-border bg-card/50 overflow-hidden">
      <div className="border-b border-border px-6 sm:px-8 py-5 flex items-center justify-between gap-4">
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.2em] text-gold flex items-center gap-2">
            <Sparkles className="h-3.5 w-3.5" />
            Analyse du combat
          </p>
          <h2 className="mt-2 font-display text-2xl font-semibold tracking-tight">
            Lecture experte
          </h2>
        </div>
        <span className="hidden sm:inline text-[10px] text-muted uppercase tracking-wider">
          Texte éditorial · Stats pour les probabilités
        </span>
      </div>

      <div className="px-6 sm:px-8 py-8">
        {loading && (
          <div className="flex flex-col items-center justify-center py-16 gap-3 text-muted">
            <Loader2 className="h-8 w-8 animate-spin text-gold" />
            <p className="text-sm">Préparation de l&apos;analyse…</p>
          </div>
        )}

        {error && !loading && (
          <div className="rounded-2xl border border-border bg-background/50 p-6 text-center">
            <p className="text-sm text-muted">{error}</p>
          </div>
        )}

        {narrative && !loading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
            className="space-y-10"
          >
            <div className="prose prose-invert max-w-none">
              <h3 className="text-[10px] uppercase tracking-wider text-gold mb-3">Synthèse</h3>
              {narrative.analysis.split('\n\n').map((para, i) => (
                <p
                  key={i}
                  className={cn(
                    'text-sm sm:text-base text-foreground/90 leading-relaxed',
                    i > 0 && 'mt-4',
                  )}
                >
                  {para.trim()}
                </p>
              ))}
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <InsightCard
                title={fight.redCorner.name}
                accent="red"
                strengths={narrative.redCorner.strengths}
                weaknesses={narrative.redCorner.weaknesses}
              />
              <InsightCard
                title={fight.blueCorner.name}
                accent="blue"
                strengths={narrative.blueCorner.strengths}
                weaknesses={narrative.blueCorner.weaknesses}
              />
            </div>

            <div>
              <h3 className="text-[10px] uppercase tracking-wider text-gold mb-4">
                Clés du combat
              </h3>
              <ul className="grid sm:grid-cols-2 gap-3">
                {narrative.fightKeys.map((key, i) => (
                  <li
                    key={key}
                    className="flex gap-3 rounded-xl border border-border bg-background/30 px-4 py-3 text-sm text-muted"
                  >
                    <span className="font-display text-gold tabular-nums text-xs">
                      {String(i + 1).padStart(2, '0')}
                    </span>
                    <span>{key}</span>
                  </li>
                ))}
              </ul>
            </div>
          </motion.div>
        )}
      </div>
    </section>
  )
}

function InsightCard({
  title,
  accent,
  strengths,
  weaknesses,
}: {
  title: string
  accent: 'red' | 'blue'
  strengths: string[]
  weaknesses: string[]
}) {
  return (
    <div className="rounded-2xl border border-border bg-background/30 p-5">
      <p
        className={cn(
          'text-sm font-medium mb-4',
          accent === 'red' ? 'text-red-400/90' : 'text-blue-400/90',
        )}
      >
        {title}
      </p>
      <InsightList label="Forces" items={strengths} positive />
      <InsightList label="Faiblesses" items={weaknesses} className="mt-4" />
    </div>
  )
}

function InsightList({
  label,
  items,
  positive,
  className,
}: {
  label: string
  items: string[]
  positive?: boolean
  className?: string
}) {
  return (
    <div className={className}>
      <p className="text-[10px] uppercase tracking-wider text-muted mb-2">{label}</p>
      <ul className="space-y-2">
        {items.map((item) => (
          <li key={item} className="flex gap-2 text-xs text-muted leading-relaxed">
            <span className={positive ? 'text-emerald-500/80' : 'text-amber-500/70'}>
              {positive ? '↑' : '↓'}
            </span>
            {item}
          </li>
        ))}
      </ul>
    </div>
  )
}
