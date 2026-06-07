'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown } from 'lucide-react'
import { faqItems } from '@/data/landing'
import { FadeIn } from '@/components/motion/FadeIn'
import { cn } from '@/utils/cn'

export function FAQ() {
  const [openId, setOpenId] = useState<string | null>(faqItems[0]?.id ?? null)

  return (
    <section className="section-padding">
      <div className="container-content max-w-3xl">
        <FadeIn className="text-center">
          <p className="text-xs font-medium uppercase tracking-[0.2em] text-gold">FAQ</p>
          <h2 className="mt-3 font-display text-2xl sm:text-3xl font-semibold tracking-tight">
            Questions fréquentes
          </h2>
        </FadeIn>

        <div className="mt-10 space-y-2">
          {faqItems.map((item, i) => {
            const open = openId === item.id
            return (
              <FadeIn key={item.id} delay={i * 0.05}>
                <div className="rounded-xl border border-border bg-card overflow-hidden">
                  <button
                    type="button"
                    onClick={() => setOpenId(open ? null : item.id)}
                    className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left text-sm font-medium"
                  >
                    {item.question}
                    <ChevronDown
                      size={18}
                      className={cn('shrink-0 text-muted transition-transform duration-300', open && 'rotate-180')}
                    />
                  </button>
                  <AnimatePresence initial={false}>
                    {open && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                      >
                        <p className="px-5 pb-4 text-sm text-muted leading-relaxed">{item.answer}</p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </FadeIn>
            )
          })}
        </div>
      </div>
    </section>
  )
}
