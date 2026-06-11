import { FastLink } from '@/components/navigation/FastLink'
import {
  formatTrackRecordHeadline,
  getPublicTrackRecord,
} from '@/lib/public-track-record'
import { UFC_FREEDOM_250_DATE_LABEL } from '@/lib/event-urgency'
import { Target, Zap } from 'lucide-react'

export function UfcPronosticsHeroBand() {
  const record = getPublicTrackRecord()

  return (
    <div className="border-b border-[#B91C1C]/40 bg-gradient-to-r from-[#1a0808] via-[#140a0a] to-[#0f0a08]">
      <div className="container-content space-y-2 px-4 py-3 sm:space-y-0 sm:px-6 lg:px-8">
        <p className="flex items-start gap-2 text-sm font-medium text-[#fecaca] sm:items-center">
          <Zap className="mt-0.5 h-4 w-4 shrink-0 text-[#f87171] sm:mt-0" aria-hidden />
          <span>
            UFC Freedom 250 — {UFC_FREEDOM_250_DATE_LABEL} · Analyses disponibles maintenant
          </span>
        </p>

        <FastLink
          href="/resultats"
          className="flex items-start gap-2 text-sm text-[#d4cdc0] transition-colors hover:text-[#f5f2eb] sm:ml-6"
        >
          <Target className="mt-0.5 h-4 w-4 shrink-0 text-[#c9b896]" aria-hidden />
          <span>
            {record.total > 0 ? (
              <>
                <span className="font-semibold tabular-nums text-[#f5f2eb]">
                  {record.accuracy}% de pronostics corrects
                </span>
                {' '}
                ({formatTrackRecordHeadline(record)} sur les {record.periodLabel}) —{' '}
                <span className="text-[#c9b896]">voir le détail →</span>
              </>
            ) : (
              <span className="text-[#c9b896]">Bilan transparent des pronostics passés →</span>
            )}
          </span>
        </FastLink>
      </div>
    </div>
  )
}
