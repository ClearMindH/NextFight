'use client'

import { useCallback, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Loader2, Sparkles } from 'lucide-react'
import type { Fight } from '@/types'
import type { FightAnalysisResponse, FightNarrativeAnalysis } from '@/types/analysis'
import { cn } from '@/utils/cn'

interface FightAnalysisPanelProps {
  fight: Fight
  eventName?: string
  className?: string
}

export function FightAnalysisPanel({ fight, eventName, className }: FightAnalysisPanelProps) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [narrative, setNarrative] = useState<FightNarrativeAnalysis | null>(null)

  const loadAnalysis = useCallback(async () => {
    if (narrative) {
      setOpen((v) => !v)
      return
    }

    setOpen(true)
    setLoading(true)
    setError(null)

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
        code?: string
      }

      if (!res.ok) {
        setError(data.error ?? 'Analyse indisponible pour le moment.')
        return
      }

      setNarrative(data.narrative)
    } catch {
      setError('Network error. Please try again.')
    } finally {
      setLoading(false)
    }
  }, [fight, eventName, narrative])

  return (
    <div className={cn('mt-4 border-t border-border pt-4', className)}>
      <button
        type="button"
        onClick={loadAnalysis}
        disabled={loading}
        className="flex w-full items-center justify-center gap-2 text-xs text-muted hover:text-gold transition-colors disabled:opacity-60"
      >
        {loading ? (
          <Loader2 className="h-3.5 w-3.5 animate-spin" />
        ) : (
          <Sparkles className="h-3.5 w-3.5" />
        )}
        {loading
          ? 'Chargement de l’analyse…'
          : open && narrative
            ? 'Masquer l’analyse'
            : 'Voir l’analyse du combat'}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden"
          >
            {loading && (
              <div className="mt-4 space-y-3">
                <div className="h-3 rounded bg-border animate-pulse w-full" />
                <div className="h-3 rounded bg-border animate-pulse w-11/12" />
                <div className="h-3 rounded bg-border animate-pulse w-4/5" />
              </div>
            )}

            {error && (
              <p className="mt-4 text-sm text-red-400/90" role="alert">
                {error}
              </p>
            )}

            {narrative && !loading && (
              <NarrativeContent
                narrative={narrative}
                redName={fight.redCorner.name}
                blueName={fight.blueCorner.name}
              />
            )}
          </motion.div>
        )}
      </AnimatePresence>

      <p className="mt-3 text-[10px] text-muted/80 text-center">
        Probabilités issues du moteur statistique · texte d’analyse complémentaire
      </p>
    </div>
  )
}

function NarrativeContent({
  narrative,
  redName,
  blueName,
}: {
  narrative: FightNarrativeAnalysis
  redName: string
  blueName: string
}) {
  return (
    <div className="mt-5 space-y-6 text-sm leading-relaxed text-foreground/90">
      <section>
        <h4 className="text-[10px] font-medium uppercase tracking-wider text-gold mb-2">
          Synthèse
        </h4>
        {narrative.analysis.split('\n\n').map((para, i) => (
          <p key={i} className={i > 0 ? 'mt-3' : undefined}>
            {para.trim()}
          </p>
        ))}
      </section>

      <div className="grid sm:grid-cols-2 gap-5">
        <CornerInsights
          title={redName}
          variant="red"
          strengths={narrative.redCorner.strengths}
          weaknesses={narrative.redCorner.weaknesses}
        />
        <CornerInsights
          title={blueName}
          variant="blue"
          strengths={narrative.blueCorner.strengths}
          weaknesses={narrative.blueCorner.weaknesses}
        />
      </div>

      <section>
        <h4 className="text-[10px] font-medium uppercase tracking-wider text-gold mb-2">
          Clés du combat
        </h4>
        <ul className="space-y-2">
          {narrative.fightKeys.map((key) => (
            <li key={key} className="flex gap-2 text-muted">
              <span className="text-gold shrink-0">•</span>
              <span>{key}</span>
            </li>
          ))}
        </ul>
      </section>
    </div>
  )
}

function CornerInsights({
  title,
  variant,
  strengths,
  weaknesses,
}: {
  title: string
  variant: 'red' | 'blue'
  strengths: string[]
  weaknesses: string[]
}) {
  return (
    <div className="rounded-xl border border-border bg-background/40 p-4">
      <p
        className={cn(
          'text-xs font-medium mb-3',
          variant === 'red' ? 'text-red-400/90' : 'text-blue-400/90',
        )}
      >
        {title}
      </p>
      <InsightList label="Forces" items={strengths} positive />
      <InsightList label="Faiblesses" items={weaknesses} className="mt-3" />
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
      <p className="text-[10px] uppercase tracking-wider text-muted mb-1.5">{label}</p>
      <ul className="space-y-1.5">
        {items.map((item) => (
          <li key={item} className="flex gap-2 text-xs text-muted">
            <span className={cn('shrink-0', positive ? 'text-emerald-500/80' : 'text-amber-500/70')}>
              {positive ? '+' : '−'}
            </span>
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}
