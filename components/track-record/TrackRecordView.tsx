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

export function TrackRecordView({ events }: TrackRecordViewProps) {
  const trackRecord = getTrackRecord(events)
  const eventsWithScores = events.filter((e) => scorableFights(e).length > 0)
  const hasData = trackRecord.summary.total > 0

  return (
    <main className="pt-16">
      <section className="section-padding border-b border-border">
        <div className="container-content max-w-3xl">
          <p className="text-xs font-medium uppercase tracking-[0.2em] text-gold">Bilan</p>
          <h1 className="mt-3 font-display text-3xl sm:text-4xl font-semibold tracking-tight">
            Résultats passés
          </h1>
          <p className="mt-4 text-muted leading-relaxed">
            Chaque pronostic est figé avant l&apos;événement, puis comparé au vainqueur réel. Notre
            bilan, sans filtre.
          </p>

          {hasData ? (
            <div className="mt-8 flex flex-wrap items-end gap-x-8 gap-y-4">
              <div>
                <p className="font-display text-5xl font-semibold tabular-nums text-gold">
                  {trackRecord.summary.accuracy}%
                </p>
                <p className="mt-1 text-xs uppercase tracking-wider text-muted">
                  pronostics corrects
                </p>
              </div>
              <p className="text-sm text-muted">
                {trackRecord.summary.correct} bons pronostics sur {trackRecord.summary.total} combats
                notés
              </p>
            </div>
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
                    return (
                      <li
                        key={fight.id}
                        className="flex items-center gap-3 rounded-xl border border-border bg-card/40 px-4 py-3"
                      >
                        <span
                          className={cn(
                            'flex h-6 w-6 shrink-0 items-center justify-center rounded-md border text-xs font-semibold',
                            correct
                              ? 'border-gold/40 bg-gold/10 text-gold'
                              : 'border-red-500/40 bg-red-500/10 text-red-400',
                          )}
                          aria-label={correct ? 'Pronostic correct' : 'Pronostic raté'}
                        >
                          {correct ? '✓' : '✗'}
                        </span>
                        <span className="min-w-0 flex-1 truncate text-sm">
                          <span className="text-muted">Pronostic : </span>
                          <span className="font-medium">{nameById(fight, predicted)}</span>
                        </span>
                        <span className="shrink-0 text-sm">
                          <span className="text-muted">Vainqueur : </span>
                          <span className="font-medium text-foreground/90">
                            {nameById(fight, actual)}
                          </span>
                        </span>
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
