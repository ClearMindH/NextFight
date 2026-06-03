'use client'

import Image from 'next/image'
import { getOrgBrand } from '@/lib/org-brand'
import { getOrgLogo } from '@/lib/org-logos'
import { getOrganization } from '@/data/organizations'
import type { OrganizationId } from '@/types'
import { cn } from '@/utils/cn'

const SIZE = {
  xs: { h: 28, maxW: 72 },
  sm: { h: 36, maxW: 96 },
  md: { h: 44, maxW: 120 },
  lg: { h: 56, maxW: 160 },
  xl: { h: 72, maxW: 220 },
  logo: { h: 64, maxW: 200 },
} as const

interface OrgBrandLogoProps {
  orgId: OrganizationId
  size?: keyof typeof SIZE
  className?: string
  /** Intensité du halo / shimmer (cartes promotions) */
  glow?: 'soft' | 'strong'
}

export function OrgBrandLogo({ orgId, size = 'md', className, glow = 'soft' }: OrgBrandLogoProps) {
  const org = getOrganization(orgId)
  const brand = getOrgBrand(orgId)
  const logo = getOrgLogo(orgId)
  if (!org) return null

  const base = SIZE[size]
  const dim =
    orgId === 'ufc'
      ? { h: Math.min(base.h, 52), maxW: Math.max(base.maxW, size === 'logo' ? 180 : base.maxW) }
      : orgId === 'ksw'
        ? { h: base.h, maxW: Math.round(base.maxW * 1.35) }
        : base
  const width = Math.round(dim.maxW)
  const height = dim.h

  return (
    <span
      className={cn(
        'org-logo-shimmer relative inline-flex items-center justify-center',
        glow === 'strong' && 'org-logo-shimmer-strong',
        className,
      )}
      style={
        {
          '--org-glow': brand.accent,
          '--org-glow-muted': brand.accentMuted,
        } as React.CSSProperties
      }
    >
      <span
        className="pointer-events-none absolute inset-0 -z-10 rounded-xl blur-xl opacity-60"
        style={{ background: `radial-gradient(ellipse at center, ${brand.accentMuted}, transparent 70%)` }}
      />
      <span className="relative block overflow-hidden rounded-lg bg-white/[0.02] px-2 py-1 ring-1 ring-white/10">
        <Image
          src={logo.src}
          alt={logo.alt}
          width={width}
          height={height}
          className="h-auto w-auto object-contain object-center drop-shadow-[0_2px_12px_rgba(0,0,0,0.5)]"
          style={{
            maxHeight: height,
            maxWidth: width,
            width: orgId === 'ufc' ? width : 'auto',
            height: 'auto',
          }}
          priority={size === 'xl' || size === 'logo'}
        />
      </span>
    </span>
  )
}
