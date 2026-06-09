'use client'

import { getOrgEventFlag } from '@/lib/org-flag'
import { getOrganization } from '@/data/organizations'
import { OrgBrandName, OrgBrandTagline } from '@/components/OrgBrandName'
import type { OrganizationId } from '@/types'
import { cn } from '@/utils/cn'

const FLAG_SIZE = {
  xs: 'text-lg',
  sm: 'text-xl',
  md: 'text-2xl',
  lg: 'text-3xl',
  xl: 'text-4xl',
  logo: 'text-5xl sm:text-6xl',
} as const

interface OrgBrandLogoProps {
  orgId: OrganizationId
  size?: keyof typeof FLAG_SIZE
  className?: string
  /** Conservé pour compatibilité API — plus d’effet shimmer image. */
  glow?: 'soft' | 'strong'
  /** Affiche le nom complet sous le sigle (menus, cartes). */
  showTagline?: boolean
  /** Empile drapeau + nom verticalement (cartes promotions). */
  stacked?: boolean
  /** Typo nette (pages org, cartes) ou wordmark logo (menus). */
  tone?: 'brand' | 'clean'
}

export function OrgBrandLogo({
  orgId,
  size = 'md',
  className,
  showTagline = false,
  stacked = false,
  tone = 'brand',
}: OrgBrandLogoProps) {
  const org = getOrganization(orgId)
  const { emoji, regionLabel } = getOrgEventFlag(orgId)
  if (!org) return null

  if (stacked) {
    return (
      <span
        className={cn('inline-flex flex-col items-center gap-0 text-center', className)}
        title={regionLabel}
      >
        <OrgBrandName orgId={orgId} size={size} tone={tone} />
        <span
          className="mt-3 h-px w-10 bg-gradient-to-r from-transparent via-white/30 to-transparent"
          aria-hidden
        />
        <span
          className={cn(
            'mt-2.5 flex h-10 w-10 items-center justify-center rounded-full',
            'border border-white/15 bg-white/[0.08]',
          )}
          aria-hidden
        >
          <span className={cn('leading-none', size === 'logo' ? 'text-2xl' : 'text-xl')}>
            {emoji}
          </span>
        </span>
        {showTagline && <OrgBrandTagline orgId={orgId} className="mt-3" />}
      </span>
    )
  }

  return (
    <span className={cn('inline-flex items-center gap-2.5', className)} title={regionLabel}>
      <span className={cn('leading-none', FLAG_SIZE[size])} aria-hidden>
        {emoji}
      </span>
      <span className="min-w-0">
        <OrgBrandName orgId={orgId} size={size} tone={tone} />
        {showTagline && <OrgBrandTagline orgId={orgId} className="mt-1" />}
      </span>
    </span>
  )
}
