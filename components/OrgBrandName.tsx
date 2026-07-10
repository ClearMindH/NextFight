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
  logo: 'text-[2.5rem] sm:text-[3rem] xl:text-[3.25rem] leading-none',
} as const

const CLEAN_SIZE_CLASS = {
  xs: 'text-lg',
  sm: 'text-2xl',
  md: 'text-3xl sm:text-4xl',
  lg: 'text-4xl sm:text-5xl',
  xl: 'text-5xl sm:text-6xl',
  logo: 'text-4xl sm:text-[2.75rem] xl:text-[3rem]',
} as const

interface OrgBrandNameProps {
  orgId: OrganizationId
  size?: keyof typeof SIZE_CLASS
  showFullName?: boolean
  /** Typo nette pour cartes (sans skew / ombre logo) */
  tone?: 'brand' | 'clean'
  className?: string
}

export function OrgBrandName({
  orgId,
  size = 'md',
  tone = 'brand',
  className,
}: OrgBrandNameProps) {
  const org = getOrganization(orgId)
  const brand = getOrgBrand(orgId)
  if (!org) return null

  if (tone === 'clean') {
    return (
      <span
        className={cn(
          'font-display font-semibold tracking-tight',
          CLEAN_SIZE_CLASS[size],
          brand.cleanNameClass,
          className,
        )}
      >
        {org.name}
      </span>
    )
  }

  const wordmark = cn('org-wordmark-base inline-block', brand.logoClass, SIZE_CLASS[size], className)

  return (
    <span className={cn(wordmark, brand.nameClass)} style={brand.nameStyle}>
      {org.name}
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
