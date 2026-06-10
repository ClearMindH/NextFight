'use client'

import { useEffect } from 'react'

/** ID projet Clarity (public). Surcharge possible via NEXT_PUBLIC_CLARITY_ID. */
const CLARITY_PROJECT_ID = process.env.NEXT_PUBLIC_CLARITY_ID ?? 'x4ygd5zf70'

type ClarityFn = ((...args: unknown[]) => void) & { q?: unknown[][] }

declare global {
  interface Window {
    clarity?: ClarityFn
  }
}

export function MicrosoftClarity() {
  useEffect(() => {
    if (!CLARITY_PROJECT_ID || window.clarity) return

    const script = document.createElement('script')
    script.async = true
    script.src = `https://www.clarity.ms/tag/${CLARITY_PROJECT_ID}`
    script.onerror = () => {
      // Évite de propager un Event vers l’overlay Next.js ([object Event]).
      console.warn('[Clarity] Script non chargé (bloqueur ou réseau).')
    }

    if (!window.clarity) {
      const queue: unknown[][] = []
      const clarityFn = ((...args: unknown[]) => {
        queue.push(args)
      }) as ClarityFn
      clarityFn.q = queue
      window.clarity = clarityFn
    }

    document.head.appendChild(script)
  }, [])

  return null
}
