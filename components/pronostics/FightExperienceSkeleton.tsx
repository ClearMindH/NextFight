import { cn } from '@/utils/cn'

export function FightExperienceSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn('mx-auto max-w-4xl animate-pulse space-y-5', className)}>
      <div className="h-4 w-40 rounded bg-white/[0.06]" />
      <div className="grid grid-cols-[1fr_auto_1fr] gap-3">
        <div className="h-28 rounded-xl bg-white/[0.04]" />
        <div className="h-6 w-6 self-center rounded bg-white/[0.04]" />
        <div className="h-28 rounded-xl bg-white/[0.04]" />
      </div>
      <div className="h-24 rounded-xl bg-white/[0.04]" />
    </div>
  )
}
