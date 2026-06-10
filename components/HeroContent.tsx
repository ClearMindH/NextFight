'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { ArrowRight, Sparkles } from 'lucide-react'
import type { HeroShowcaseData } from '@/lib/hero-showcase'

type HeroContentProps = {
  data: HeroShowcaseData
}

export function HeroContent({ data }: HeroContentProps) {
  const { showcase } = data

  return (
    <div className="max-w-xl lg:max-w-none">
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45 }}
            className="inline-flex items-center gap-2 rounded-full border border-[#c9b896]/25 bg-[#c9b896]/[0.06] px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-[#c9b896]"
          >
            <Sparkles className="h-3 w-3" aria-hidden />
            Analyses statistiques MMA
          </motion.p>

          <motion.h1
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.05 }}
            className="mt-5 font-display text-[1.75rem] font-semibold leading-[1.12] tracking-tight text-[#f5f2eb] sm:text-4xl lg:text-[2.65rem]"
          >
            Analysez chaque combat MMA avec des statistiques avancées.
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.12 }}
            className="mt-4 text-sm leading-relaxed text-[#8a8278] sm:text-base lg:max-w-lg"
          >
            Probabilités de victoire, comparaisons détaillées et analyses pour l&apos;UFC, PFL,
            KSW, ARES et Hexagone MMA.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mt-7 flex flex-col gap-3 sm:flex-row sm:items-center"
          >
            <Link
              href={data.analysisHref}
              className="inline-flex items-center justify-center gap-2 rounded-full bg-[#f5f2eb] px-6 py-3.5 text-sm font-semibold text-[#0a0a0a] shadow-[0_0_32px_-8px_rgba(245,242,235,0.45)] transition-transform hover:scale-[1.02]"
            >
              Voir l&apos;analyse UFC de cette semaine
              <ArrowRight className="h-4 w-4" aria-hidden />
            </Link>
            <Link
              href="/pricing"
              className="inline-flex items-center justify-center gap-2 rounded-full border border-[#c9b896]/35 bg-[#c9b896]/[0.04] px-6 py-3.5 text-sm font-medium text-[#c9b896] transition-colors hover:border-[#c9b896]/55 hover:bg-[#c9b896]/10"
            >
              Découvrir Premium
            </Link>
          </motion.div>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.28 }}
            className="mt-4 text-xs text-[#5c5c5c]"
          >
            Exemple en direct · {showcase.event.name}
          </motion.p>
    </div>
  )
}
