'use client'

import { Star } from 'lucide-react'
import { testimonials } from '@/data/landing'
import { FadeIn } from '@/components/motion/FadeIn'

export function Testimonials() {
  return (
    <section className="section-padding bg-card/20">
      <div className="container-content">
        <FadeIn className="text-center max-w-2xl mx-auto">
          <p className="text-xs font-medium uppercase tracking-[0.2em] text-gold">Testimonials</p>
          <h2 className="mt-3 font-display text-2xl sm:text-3xl font-semibold tracking-tight">
            Trusted by analysts worldwide
          </h2>
        </FadeIn>

        <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {testimonials.map((item, i) => (
            <FadeIn key={item.id} delay={i * 0.06}>
              <article className="h-full rounded-2xl border border-border bg-card p-6">
                <div className="flex gap-0.5">
                  {Array.from({ length: item.rating }).map((_, j) => (
                    <Star key={j} size={14} className="fill-gold text-gold" />
                  ))}
                </div>
                <p className="mt-4 text-sm leading-relaxed text-muted">&ldquo;{item.quote}&rdquo;</p>
                <div className="mt-6 border-t border-border pt-4">
                  <p className="text-sm font-medium">{item.name}</p>
                  <p className="text-xs text-muted">{item.role}</p>
                </div>
              </article>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  )
}
