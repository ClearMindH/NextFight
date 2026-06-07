'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { AnimatePresence, motion } from 'framer-motion'
import { ArrowRight, X } from 'lucide-react'
import {
  isLandingAnnouncementActive,
  LANDING_ANNOUNCEMENT,
} from '@/data/landing-announcement'

const DISMISS_KEY = 'nextfight-landing-announcement-dismissed'

export function LandingAnnouncement() {
  const [open, setOpen] = useState(false)

  useEffect(() => {
    if (!isLandingAnnouncementActive()) return
    try {
      if (sessionStorage.getItem(DISMISS_KEY)) return
    } catch {
      /* sessionStorage indisponible */
    }
    setOpen(true)
  }, [])

  function dismiss(): void {
    try {
      sessionStorage.setItem(DISMISS_KEY, '1')
    } catch {
      /* ignore */
    }
    setOpen(false)
  }

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 sm:p-6">
          <motion.button
            type="button"
            aria-label="Fermer l'annonce"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="absolute inset-0 bg-background/80 backdrop-blur-sm"
            onClick={dismiss}
          />

          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby="landing-announcement-title"
            initial={{ opacity: 0, y: 16, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.98 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
            className="relative w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-2xl shadow-black/50 sm:p-7"
          >
            <button
              type="button"
              onClick={dismiss}
              aria-label="Fermer"
              className="absolute right-4 top-4 rounded-full p-1.5 text-muted transition-colors hover:bg-white/5 hover:text-foreground"
            >
              <X size={18} />
            </button>

            <h2
              id="landing-announcement-title"
              className="pr-8 font-display text-xl font-semibold tracking-tight sm:text-2xl"
            >
              {LANDING_ANNOUNCEMENT.title}
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-muted">
              {LANDING_ANNOUNCEMENT.description}
            </p>

            <div className="mt-6 flex flex-col gap-2.5">
              {LANDING_ANNOUNCEMENT.items.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={dismiss}
                  className="inline-flex items-center justify-between gap-3 rounded-xl border border-border bg-background/50 px-4 py-3 text-sm font-medium text-foreground transition-colors hover:border-gold/35 hover:bg-gold/5"
                >
                  <span>
                    {item.label}
                    <span className="ml-2 text-xs font-normal text-muted">{item.dateLabel}</span>
                  </span>
                  <ArrowRight size={16} className="shrink-0 text-gold" aria-hidden />
                </Link>
              ))}
            </div>

            <button
              type="button"
              onClick={dismiss}
              className="mt-5 w-full rounded-full border border-border py-2.5 text-sm text-muted transition-colors hover:border-gold/30 hover:text-foreground"
            >
              Plus tard
            </button>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
