'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useCallback, type ComponentProps } from 'react'

type FastLinkProps = ComponentProps<typeof Link>

function hrefString(href: FastLinkProps['href']): string | null {
  if (typeof href === 'string') return href
  if (typeof href === 'object' && href !== null && 'pathname' in href) {
    return href.pathname ?? null
  }
  return null
}

/** Lien avec prefetch anticipé (survol, focus, pression). */
export function FastLink({ href, onMouseEnter, onPointerDown, onFocus, ...props }: FastLinkProps) {
  const router = useRouter()

  const prefetch = useCallback(() => {
    const path = hrefString(href)
    if (path && path.startsWith('/') && !path.startsWith('/#')) {
      router.prefetch(path)
    }
  }, [href, router])

  return (
    <Link
      href={href}
      prefetch
      onMouseEnter={(e) => {
        prefetch()
        onMouseEnter?.(e)
      }}
      onPointerDown={(e) => {
        prefetch()
        onPointerDown?.(e)
      }}
      onFocus={(e) => {
        prefetch()
        onFocus?.(e)
      }}
      {...props}
    />
  )
}
