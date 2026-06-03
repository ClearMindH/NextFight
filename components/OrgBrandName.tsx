'use client'

import { getOrganization } from '@/data/organizations'
import { getOrgBrand } from '@/lib/org-brand'
import type { OrganizationId } from '@/types'
import { cn } from '@/utils/cn'

const SIZE_CLASS = {
  xs: 'text-xl leading-none',
  sm: 'text-3xl leading-none',
  md: 'text-4xl sm:text-[2.75rem] leading-none',
  lg: 'text-5xl sm:text-6xl leading-none',
  xl: 'text-6xl sm:text-7xl md:text-[5.25rem] leading-none',
  /** Cartes promotions — taille proche d’un logo */
  logo: 'text-[2.75rem] sm:text-[3.25rem] xl:text-[3.5rem] leading-[0.85]',
} as const

interface OrgBrandNameProps {
  orgId: OrganizationId
  size?: keyof typeof SIZE_CLASS
  /** Nom complet pour Hexagone MMA au lieu du sigle */
  showFullName?: boolean
  className?: string
}

export function OrgBrandName({
  orgId,
  size = 'md',
  showFullName = false,
  className,
}: OrgBrandNameProps) {
  const org = getOrganization(orgId)
  const brand = getOrgBrand(orgId)
  if (!org) return null

  const wordmark = cn('org-wordmark-base inline-block', brand.logoClass, SIZE_CLASS[size], className)

  if (org.id === 'hexagone' && !showFullName) {
    return (
      <span
        className={cn('inline-flex flex-wrap items-baseline justify-center gap-x-2', wordmark)}
        style={brand.nameStyle}
      >
        <span className={brand.nameClass}>Hexagone</span>
        <span
          className="bg-gradient-to-b from-white via-[#e8e8e8] to-[#a3a3a3] bg-clip-text text-transparent"
          style={{ textShadow: '2px 2px 0 #0a0a0a' }}
        >
          MMA
        </span>
      </span>
    )
  }

  const label = showFullName && org.id === 'hexagone' ? 'Hexagone MMA' : org.name

  return (
    <span
      className={cn(wordmark, brand.nameClass)}
      style={brand.nameStyle}
    >
      {label}
    </span>
  )
}

interface OrgBrandTaglineProps {
  orgId: OrganizationId
  className?: string
}

export function OrgBrandTagline({ orgId, className }: OrgBrandTaglineProps) {
  const org = getOrganization(orgId)
  const brand = getOrgBrand(orgId)
  if (!org) return null

  return (
    <span
      className={cn(
        'max-w-[14rem] text-center text-[10px] font-sans font-medium uppercase tracking-[0.18em] sm:text-[11px]',
        brand.taglineClass,
        className,
      )}
    >
      {org.fullName}
    </span>
  )
}
