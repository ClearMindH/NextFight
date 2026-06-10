import { Building2, Calendar, Swords } from 'lucide-react'

const STATS = [
  {
    icon: Building2,
    value: '5 organisations',
    detail: 'UFC · PFL · KSW · ARES · Hexagone',
  },
  {
    icon: Swords,
    value: '+200 combats analysés/an',
    detail: 'Pronostics statistiques par carte',
  },
  {
    icon: Calendar,
    value: 'Depuis 2024',
    detail: 'Modèle affiné événement après événement',
  },
] as const

type PricingCredibilityStatsProps = {
  variant?: 'default' | 'compact'
}

export function PricingCredibilityStats({ variant = 'default' }: PricingCredibilityStatsProps) {
  if (variant === 'compact') {
    return (
      <div className="flex flex-wrap items-center justify-center gap-2">
        {STATS.map(({ icon: Icon, value }) => (
          <span
            key={value}
            className="inline-flex items-center gap-1.5 rounded-full border border-[#c9b896]/20 bg-[#c9b896]/5 px-2.5 py-1 text-[10px] font-medium text-[#d4cdc0]"
          >
            <Icon className="h-3 w-3 shrink-0 text-[#c9b896]" aria-hidden />
            {value}
          </span>
        ))}
      </div>
    )
  }

  return (
    <div className="mx-auto mt-8 grid max-w-3xl gap-4 sm:grid-cols-3 sm:gap-6">
      {STATS.map(({ icon: Icon, value, detail }) => (
        <div key={value} className="text-center">
          <Icon className="mx-auto h-5 w-5 text-[#c9b896]" aria-hidden />
          <p className="mt-3 text-sm font-semibold text-[#f5f2eb]">{value}</p>
          <p className="mt-1 text-[11px] leading-relaxed text-[#6b6b6b]">{detail}</p>
        </div>
      ))}
    </div>
  )
}
