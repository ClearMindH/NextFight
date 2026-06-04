import { resolveEventPredictionsStatus, predictionsStatusLabel } from '@/lib/event-predictions'
import type { Event } from '@/types'
import { cn } from '@/utils/cn'

interface EventPredictionsBadgeProps {
  event: Event
  className?: string
}

export function EventPredictionsBadge({ event, className }: EventPredictionsBadgeProps) {
  const status = resolveEventPredictionsStatus(event)
  const published = status === 'published'

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-medium uppercase tracking-[0.12em]',
        published
          ? 'bg-[#c9b896]/15 text-[#c9b896] ring-1 ring-[#c9b896]/30'
          : 'bg-amber-500/10 text-amber-200/90 ring-1 ring-amber-500/25',
        className,
      )}
    >
      {published ? predictionsStatusLabel(status) : 'En préparation'}
    </span>
  )
}
