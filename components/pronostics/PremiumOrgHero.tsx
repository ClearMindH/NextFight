import Link from 'next/link'
import { ArrowUpRight, Shield } from 'lucide-react'
import { OrgBrandLogo } from '@/components/OrgBrandLogo'
import { getOrgBrand } from '@/lib/org-brand'
import type { Organization } from '@/types'
import { cn } from '@/utils/cn'

interface PremiumOrgHeroProps {
  org: Organization
}

export function PremiumOrgHero({ org }: PremiumOrgHeroProps) {
  const brand = getOrgBrand(org.id)

  return (
    <section className="relative overflow-hidden border-b border-white/[0.06]">
      <div className="pointer-events-none absolute inset-0 intel-dashboard-grid opacity-50" />
      <div
        className="pointer-events-none absolute -left-20 top-0 h-72 w-72 rounded-full blur-[100px]"
        style={{ background: brand.accentMuted }}
      />
      <div className="pointer-events-none absolute right-0 top-1/4 h-64 w-64 rounded-full bg-[#3d8bfd]/10 blur-[90px]" />

      <div className="container-content relative section-padding pb-10">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <span
            className={cn(
              'inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.16em] ring-1',
              brand.card.pill,
            )}
          >
            <Shield className="h-3.5 w-3.5" />
            Intelligence prédictive · sans paris
          </span>
          <Link
            href={org.seoPath}
            className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-xs text-muted transition-colors hover:border-white/20 hover:text-foreground"
          >
            Version EN
            <ArrowUpRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        <div className="mt-10 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <OrgBrandLogo orgId={org.id} size="xl" glow="strong" />
            <h1 className="mt-5 max-w-2xl font-display text-xl font-medium tracking-tight text-muted sm:text-2xl">
              Pronostics {org.name} — stats, calibrage multi-dimensions et analyses détaillées
            </h1>
            <p className="mt-4 max-w-xl text-sm leading-relaxed text-muted/90">{org.descriptionFr}</p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Link
              href="/register"
              className="inline-flex rounded-full bg-foreground px-6 py-3 text-sm font-medium text-background transition-transform hover:scale-[1.02]"
            >
              Accéder aux pronostics
            </Link>
            <Link
              href="/pricing"
              className="inline-flex rounded-full border border-white/10 bg-white/[0.04] px-6 py-3 text-sm text-muted hover:text-gold transition-colors"
            >
              Premium · analyses détaillées
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}
