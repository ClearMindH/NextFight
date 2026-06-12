import type { ReactNode } from 'react'
import { FastLink } from '@/components/navigation/FastLink'
import { OrgBrandLogo } from '@/components/OrgBrandLogo'
import type { Organization } from '@/types'
import { cn } from '@/utils/cn'

interface OrgPageHeaderProps {
  org: Organization
  /** Inséré juste sous le H1 (above-the-fold). */
  afterTitle?: ReactNode
  belowTitle?: ReactNode
  /** Mobile : titre seul, description et CTAs repoussés. */
  compactOnMobile?: boolean
  className?: string
}

export function OrgPageHeader({
  org,
  afterTitle,
  belowTitle,
  compactOnMobile = false,
  className,
}: OrgPageHeaderProps) {
  return (
    <header className={cn('border-b border-white/[0.08] bg-[#0c0c10]', className)}>
      <div
        className={cn(
          'container-content section-padding pt-4',
          compactOnMobile ? 'pb-4 md:pb-8' : 'pb-8',
        )}
      >
        <div className="flex flex-wrap items-center justify-between gap-4">
          <OrgBrandLogo orgId={org.id} size="lg" tone="clean" />
          <FastLink
            href={org.seoPath}
            className="text-xs text-muted hover:text-foreground transition-colors"
          >
            English
          </FastLink>
        </div>
        <h1
          className={cn(
            'font-display text-2xl font-semibold tracking-tight sm:text-3xl',
            compactOnMobile ? 'mt-4 md:mt-6' : 'mt-6',
          )}
        >
          Pronostics {org.name}
        </h1>
        {afterTitle ? <div className="mt-4">{afterTitle}</div> : null}
        <p
          className={cn(
            'max-w-2xl text-sm leading-relaxed text-muted',
            compactOnMobile ? 'mt-2 hidden md:block' : 'mt-3',
          )}
        >
          {org.descriptionFr}
        </p>
        {belowTitle ? <div className={cn(compactOnMobile ? 'mt-4 hidden md:block' : 'mt-4')}>{belowTitle}</div> : null}
      </div>
    </header>
  )
}
