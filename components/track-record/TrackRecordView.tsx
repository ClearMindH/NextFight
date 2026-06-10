import { FastLink } from '@/components/navigation/FastLink'
import type { Event, Fight } from '@/types'
import { fighterShortName } from '@/lib/prediction-verdict'
import { getTrackRecord } from '@/lib/track-record'
import { formatEventDate } from '@/utils/format'
import { cn } from '@/utils/cn'

interface TrackRecordViewProps {
  events: Event[]
}

function nameById(fight: Fight, id: string | null): string {
  if (!id) return 'Nul'
  if (fight.redCorner.id === id) return fighterShortName(fight.redCorner.name)
  if (fight.blueCorner.id === id) return fighterShortName(fight.blueCorner.name)
  return '—'
}

function scorableFights(event: Event): Fight[] {
  return event.fights.filter(
    (f) => f.predictionSnapshot && f.result && f.result.winnerId != null,
  )
}

function matchupLabel(fight: Fight): string {
  return `${fighterShortName(fight.redCorner.name)} vs ${fighterShortName(fight.blueCorner.name)}`
}

export function TrackRecordView({ events }: TrackRecordViewProps) {
  const trackRecord = getTrackRecord(events)
  const eventsWithScores = events.filter((e) => scorableFights(e).length > 0)
  const hasData = trackRecord.summary.total > 0
  const strongBucket = trackRecord.byConfidence.find((b) => b.label === 'Forte conviction')
  const markedBucket = trackRecord.byConfidence.find((b) => b.label === 'Favori marqué')

  return (
    <main className="pt-site-header">
      <section className="section-padding border-b border-border">
        <div className="container-content max-w-3xl">
          <p className="text-xs font-medium uppercase tracking-[0.2em] text-gold">Bilan</p>
          <h1 className="mt-3 font-display text-3xl sm:text-4xl font-semibold tracking-tight">
            Résultats passés
          </h1>
          <p className="mt-4 text-muted leading-relaxed">
            Chaque pronostic est <strong className="font-medium text-foreground/90">figé avant
            l&apos;événement</strong>, puis comparé au vainqueur réel. Aucun ajustement a posteriori —
            ce que vous voyez ici est le bilan brut du modèle.
          </p>

          {hasData ? (
            <>
              <div className="mt-8 grid gap-4 sm:grid-cols-3">
                <StatCard
                  value={`${trackRecord.summary.accuracy}%`}
                  label="Précision globale"
                  detail={`${trackRecord.summary.correct} / ${trackRecord.summary.total} combats`}
                />
                {strongBucket && strongBucket.total > 0 && (
                  <StatCard
                    value={`${strongBucket.accuracy}%`}
                    label="Forte conviction"
                    detail={`Confiance ≥ 80 % · ${strongBucket.correct}/${strongBucket.total}`}
                    highlight
                  />
                )}
                {markedBucket && markedBucket.total > 0 && (
                  <StatCard
                    value={`${markedBucket.accuracy}%`}
                    label="Favori marqué"
                    detail={`Confiance 70–79 % · ${markedBucket.correct}/${markedBucket.total}`}
                  />
                )}
              </div>

              <div className="mt-6 rounded-xl border border-border bg-card/40 px-4 py-3 text-sm text-muted">
                <p>
                  Le modèle est le plus fiable quand la confiance est élevée — c&apos;est sur ces
                  combats que Premium apporte le plus de valeur pour préparer votre lecture de carte.
                </p>
                <FastLink
                  href="/pricing"
                  className="mt-2 inline-block text-gold hover:underline underline-offset-4"
                >
                  Voir les analyses Premium →
                </FastLink>
              </div>
            </>
          ) : (
            <div className="mt-8 rounded-2xl border border-border bg-card/50 p-6">
              <p className="text-sm text-muted">
                Le bilan s&apos;affichera ici dès qu&apos;un événement sera terminé et ses résultats
                connus.
              </p>
            </div>
          )}
        </div>
      </section>

      {hasData && (
        <section className="section-padding">
          <div className="container-content max-w-3xl space-y-10">
            {eventsWithScores.map((event) => (
              <div key={event.id}>
                <div className="flex items-baseline justify-between gap-4 border-b border-border pb-3">
                  <h2 className="font-display text-lg font-semibold tracking-tight">
                    {event.name}
                  </h2>
                  <span className="shrink-0 text-xs tabular-nums text-muted">
                    {formatEventDate(event.date)}
                  </span>
                </div>
                <ul className="mt-4 space-y-2">
                  {scorableFights(event).map((fight) => {
                    const predicted = fight.predictionSnapshot!.predictedWinnerId
                    const actual = fight.result!.winnerId
                    const correct = predicted === actual
                    const confidence = Math.round(fight.predictionSnapshot!.confidence)

                    return (
                      <li
                        key={fight.id}
                        className="rounded-xl border border-border bg-card/40 px-4 py-3"
                      >
                        <div className="flex items-start gap-3">
                          <span
                            className={cn(
                              'mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-md border text-xs font-semibold',
                              correct
                                ? 'border-gold/40 bg-gold/10 text-gold'
                                : 'border-red-500/40 bg-red-500/10 text-red-400',
                            )}
                            aria-label={correct ? 'Pronostic correct' : 'Pronostic raté'}
                          >
                            {correct ? '✓' : '✗'}
                          </span>
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-medium text-foreground/95">
                              {matchupLabel(fight)}
                            </p>
                            <p className="mt-1 text-xs text-muted">
                              Pronostic :{' '}
                              <span className="font-medium text-foreground/85">
                                {nameById(fight, predicted)}
                              </span>
                              {' · '}
                              Vainqueur :{' '}
                              <span className="font-medium text-foreground/85">
                                {nameById(fight, actual)}
                              </span>
                              {' · '}
                              Confiance {confidence}%
                            </p>
                          </div>
                        </div>
                      </li>
                    )
                  })}
                </ul>
              </div>
            ))}
          </div>
        </section>
      )}
    </main>
  )
}

function StatCard({
  value,
  label,
  detail,
  highlight,
}: {
  value: string
  label: string
  detail: string
  highlight?: boolean
}) {
  return (
    <div
      className={cn(
        'rounded-xl border px-4 py-4',
        highlight ? 'border-gold/30 bg-gold/5' : 'border-border bg-card/40',
      )}
    >
      <p
        className={cn(
          'font-display text-3xl font-semibold tabular-nums',
          highlight ? 'text-gold' : 'text-foreground',
        )}
      >
        {value}
      </p>
      <p className="mt-1 text-xs font-medium uppercase tracking-wider text-muted">{label}</p>
      <p className="mt-1 text-[11px] text-muted">{detail}</p>
    </div>
  )
}
