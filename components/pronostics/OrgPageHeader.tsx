import type { ReactNode } from 'react'
import { FastLink } from '@/components/navigation/FastLink'
import { OrgBrandLogo } from '@/components/OrgBrandLogo'
import type { Organization } from '@/types'

interface OrgPageHeaderProps {
  org: Organization
  /** Inséré juste sous le H1 (above-the-fold). */
  afterTitle?: ReactNode
  belowTitle?: ReactNode
}

export function OrgPageHeader({ org, afterTitle, belowTitle }: OrgPageHeaderProps) {
  return (
    <header className="border-b border-white/[0.08] bg-[#0c0c10]">
      <div className="container-content section-padding pb-8 pt-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <OrgBrandLogo orgId={org.id} size="lg" tone="clean" />
          <FastLink
            href={org.seoPath}
            className="text-xs text-muted hover:text-foreground transition-colors"
          >
            English
          </FastLink>
        </div>
        <h1 className="mt-6 font-display text-2xl font-semibold tracking-tight sm:text-3xl">
          Pronostics {org.name}
        </h1>
        {afterTitle ? <div className="mt-4">{afterTitle}</div> : null}
        <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted">{org.descriptionFr}</p>
        {belowTitle ? <div className="mt-4">{belowTitle}</div> : null}
      </div>
    </header>
  )
}
