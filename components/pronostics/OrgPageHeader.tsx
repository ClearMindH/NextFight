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
  /** Affiche belowTitle aussi sur mobile (ex. taux de réussite compact). */
  showBelowTitleOnMobile?: boolean
  /** Masque la description org (hub UFC : le combat parle de lui-même). */
  hideDescription?: boolean
  /** Hero plus court — moins de padding, titre plus petit. */
  tightHero?: boolean
  /** Masque logo + English sur mobile (nav site déjà présente). */
  skipBrandRowOnMobile?: boolean
  className?: string
}

export function OrgPageHeader({
  org,
  afterTitle,
  belowTitle,
  compactOnMobile = false,
  showBelowTitleOnMobile = false,
  hideDescription = false,
  tightHero = false,
  skipBrandRowOnMobile = false,
  className,
}: OrgPageHeaderProps) {
  return (
    <header className={cn('border-b border-white/[0.08] bg-[#0c0c10]', className)}>
      <div
        className={cn(
          'container-content px-4 sm:px-6 lg:px-8',
          tightHero ? 'pb-3 pt-3 sm:pb-4 sm:pt-4' : 'section-padding pt-4',
          !tightHero && (compactOnMobile ? 'pb-4 md:pb-8' : 'pb-8'),
        )}
      >
        <div
          className={cn(
            'flex flex-wrap items-center justify-between gap-4',
            skipBrandRowOnMobile && 'hidden md:flex',
          )}
        >
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
            'font-display font-semibold tracking-tight',
            tightHero ? 'text-xl sm:text-2xl' : 'text-2xl sm:text-3xl',
            skipBrandRowOnMobile ? 'mt-0 md:mt-6' : compactOnMobile ? 'mt-4 md:mt-6' : 'mt-6',
            tightHero && !skipBrandRowOnMobile && 'mt-2',
          )}
        >
          Pronostics {org.name}
        </h1>
        {afterTitle ? <div className="mt-4">{afterTitle}</div> : null}
        {!hideDescription && (
          <p
            className={cn(
              'max-w-2xl text-sm leading-relaxed text-muted',
              compactOnMobile ? 'mt-2 hidden md:block' : 'mt-3',
            )}
          >
            {org.descriptionFr}
          </p>
        )}
        {belowTitle ? (
          <div
            className={cn(
              tightHero ? 'mt-2' : 'mt-4',
              compactOnMobile && !showBelowTitleOnMobile && 'hidden md:block',
            )}
          >
            {belowTitle}
          </div>
        ) : null}
      </div>
    </header>
  )
}
