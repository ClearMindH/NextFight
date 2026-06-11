'use client'

import { useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import { X } from 'lucide-react'
import { useSubscription } from '@/hooks/useSubscription'

const STORAGE_KEY = 'nf_ufc_exit_intent_shown'

export function UfcExitIntentModal() {
  const { isPremium } = useSubscription()
  const [open, setOpen] = useState(false)

  const dismiss = useCallback(() => {
    setOpen(false)
    try {
      sessionStorage.setItem(STORAGE_KEY, '1')
    } catch {
      /* ignore */
    }
  }, [])

  useEffect(() => {
    if (isPremium) return
    if (typeof window === 'undefined') return
    if (window.matchMedia('(pointer: coarse)').matches) return

    try {
      if (sessionStorage.getItem(STORAGE_KEY) === '1') return
    } catch {
      return
    }

    const onMouseLeave = (e: MouseEvent) => {
      if (e.clientY > 12) return
      setOpen(true)
    }

    document.addEventListener('mouseleave', onMouseLeave)
    return () => document.removeEventListener('mouseleave', onMouseLeave)
  }, [isPremium])

  if (!open || isPremium) return null

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/75 px-4">
      <div
        role="dialog"
        aria-labelledby="exit-intent-title"
        className="relative w-full max-w-md rounded-2xl border border-[#1f1d1a] bg-[#0c0c0c] p-6 sm:p-8"
      >
        <button
          type="button"
          onClick={dismiss}
          className="absolute right-4 top-4 text-[#8a8278] hover:text-[#f5f2eb]"
          aria-label="Fermer"
        >
          <X size={20} />
        </button>

        <p className="text-xs font-medium uppercase tracking-[0.2em] text-[#c9b896]">
          <span aria-hidden>🥊 </span>Avant de partir —
        </p>
        <h2 id="exit-intent-title" className="mt-3 font-display text-xl font-semibold text-[#f5f2eb]">
          Ne ratez pas UFC Freedom 250
        </h2>
        <p className="mt-3 text-sm leading-relaxed text-[#8a8278]">
          L&apos;analyse Gane vs Pereira est gratuite.
          <br />
          Topuria vs Gaethje est disponible en Premium.
        </p>

        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <Link
            href="/fight/ufc-freedom-250-f2"
            onClick={dismiss}
            className="flex-1 rounded-full border border-white/15 py-3 text-center text-sm font-medium text-[#f5f2eb] hover:border-[#c9b896]/40"
          >
            Voir l&apos;analyse gratuite
          </Link>
          <Link
            href="/pricing"
            onClick={dismiss}
            className="flex-1 rounded-full bg-[#f5f2eb] py-3 text-center text-sm font-semibold text-[#0a0a0a]"
          >
            Passer Premium
          </Link>
        </div>
      </div>
    </div>
  )
}
