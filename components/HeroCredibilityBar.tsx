import type { HeroCredibilityStats } from '@/lib/hero-showcase'
import { formatHeroStatCount } from '@/lib/hero-showcase'
import { BarChart3, Building2, RefreshCw, Target, Users } from 'lucide-react'

type HeroCredibilityBarProps = {
  stats: HeroCredibilityStats
}

export function HeroCredibilityBar({ stats }: HeroCredibilityBarProps) {
  const items = [
    {
      key: 'fighters',
      display: formatHeroStatCount(stats.fightersTracked),
      label: 'combattants suivis',
      icon: Users,
    },
    {
      key: 'stats',
      display: `${stats.statMetrics}+`,
      label: 'statistiques par combat',
      icon: BarChart3,
    },
    ...(stats.highConfidenceAccuracy != null
      ? [
          {
            key: 'accuracy' as const,
            display: `${stats.highConfidenceAccuracy}%`,
            label: `précision forte conviction (${stats.highConfidenceTotal})`,
            icon: Target,
          },
        ]
      : []),
    {
      key: 'orgs',
      display: String(stats.organizationsCovered),
      label: 'organisations couvertes',
      icon: Building2,
    },
    {
      key: 'update',
      display: stats.updateLabel,
      label: null,
      icon: RefreshCw,
    },
  ]

  return (
    <div className="border-t border-white/[0.06] bg-[#060606]/80">
      <div className="container-content px-4 py-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5 sm:gap-4">
          {items.map(({ key, label, icon: Icon, display }) => (
            <div
              key={key}
              className="flex items-center gap-2.5 rounded-xl border border-white/[0.05] bg-white/[0.02] px-3 py-2.5"
            >
              <Icon className="h-4 w-4 shrink-0 text-[#c9b896]" aria-hidden />
              <div className="min-w-0">
                <p className="font-display text-sm font-semibold tabular-nums text-[#f5f2eb] sm:text-base">
                  {display}
                </p>
                {label ? (
                  <p className="truncate text-[10px] text-[#6b6560]">{label}</p>
                ) : null}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
