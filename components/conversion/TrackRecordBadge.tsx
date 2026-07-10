import { FastLink } from '@/components/navigation/FastLink'
import { formatTrackRecordContext, getPublicTrackRecord } from '@/lib/public-track-record'
import { Target } from 'lucide-react'

type TrackRecordBadgeProps = {
  className?: string
  /** Une ligne courte pour le hero mobile. */
  compact?: boolean
}

export function TrackRecordBadge({ className, compact = false }: TrackRecordBadgeProps) {
  const record = getPublicTrackRecord()

  if (record.total === 0) {
    return (
      <FastLink
        href="/resultats"
        className={`inline-flex items-center gap-2 text-sm text-[#c9b896] transition-colors hover:text-[#e8dcc4] ${className ?? ''}`}
      >
        <Target className="h-4 w-4 shrink-0" aria-hidden />
        Consulter le bilan transparent des pronostics passés →
      </FastLink>
    )
  }

  return (
    <FastLink
      href="/resultats"
      className={`group inline-flex flex-wrap items-center gap-x-2 gap-y-1 text-sm transition-colors hover:text-[#e8dcc4] ${className ?? ''}`}
    >
      <Target className="h-4 w-4 shrink-0 text-[#c9b896]" aria-hidden />
      <span className="font-semibold tabular-nums text-[#f5f2eb] group-hover:text-[#fff8ef]">
        {record.accuracy}% UFC
      </span>
      {compact ? (
        <span className="text-[#c9b896]">· détail →</span>
      ) : (
        <>
          <span className="text-[#8a8278]">· {formatTrackRecordContext(record)}</span>
          <span className="text-[#c9b896]">· détail →</span>
        </>
      )}
    </FastLink>
  )
}
