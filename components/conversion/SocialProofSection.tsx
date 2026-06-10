import { TESTIMONIALS } from '@/data/testimonials'
import { cn } from '@/utils/cn'

type SocialProofSectionProps = {
  className?: string
  compact?: boolean
}

export function SocialProofSection({ className, compact }: SocialProofSectionProps) {
  return (
    <section className={cn('section-padding border-t border-[#1a1816]', className)}>
      <div className="container-content">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-[10px] font-medium uppercase tracking-[0.28em] text-[#8a8278]">
            Communauté
          </p>
          <h2 className="mt-3 font-display text-2xl font-semibold tracking-tight text-[#f5f2eb] sm:text-3xl">
            Ils utilisent NextFight
          </h2>
        </div>

        <ul
          className={cn(
            'mt-10 flex gap-4 overflow-x-auto pb-2 snap-x snap-mandatory scrollbar-thin',
            'md:grid md:grid-cols-3 md:overflow-visible md:pb-0',
            compact && 'md:gap-5',
          )}
        >
          {TESTIMONIALS.map((t) => (
            <li
              key={t.nom}
              className="min-w-[min(100%,18rem)] flex-shrink-0 snap-center rounded-2xl border border-[#1f1d1a] bg-[#0a0a0a] p-6 md:min-w-0"
            >
              <p className="text-sm leading-none text-[#c9b896]" aria-label="5 étoiles sur 5">
                ⭐⭐⭐⭐⭐
              </p>
              <p className="mt-4 text-sm leading-relaxed text-[#c8c0b4]">&ldquo;{t.texte}&rdquo;</p>
              <div className="mt-6 border-t border-[#1f1d1a] pt-4">
                <p className="text-sm font-medium text-[#f5f2eb]">{t.nom}</p>
                <span className="mt-1 inline-block rounded-full border border-[#c9b896]/25 bg-[#c9b896]/10 px-2.5 py-0.5 text-[10px] font-medium uppercase tracking-wider text-[#c9b896]">
                  {t.abonnement}
                </span>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
