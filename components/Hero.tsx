import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { getHeroShowcaseData } from '@/lib/hero-showcase'
import { HeroCredibilityBar } from '@/components/HeroCredibilityBar'
import { HeroContent } from '@/components/HeroContent'
import { HeroFightPreview } from '@/components/HeroFightPreview'
import { HeroPreviewAside } from '@/components/HeroPreviewAside'

export function Hero() {
  const data = getHeroShowcaseData()

  if (!data) {
    return (
      <section className="border-b border-white/[0.06] bg-[#050505] pt-site-header">
        <div className="container-content section-padding text-center">
          <h1 className="font-display text-3xl font-semibold tracking-tight text-[#f5f2eb]">
            Analysez chaque combat MMA avec des statistiques avancées.
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-sm text-[#8a8278]">
            Probabilités de victoire, comparaisons détaillées et analyses pour l&apos;UFC, PFL,
            KSW, ARES et Hexagone MMA.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link
              href="/ufc-pronostics"
              className="inline-flex items-center gap-2 rounded-full bg-[#f5f2eb] px-6 py-3 text-sm font-semibold text-[#0a0a0a]"
            >
              Voir l&apos;analyse UFC de cette semaine
              <ArrowRight className="h-4 w-4" aria-hidden />
            </Link>
            <Link
              href="/pricing"
              className="inline-flex items-center gap-2 rounded-full border border-[#c9b896]/35 px-6 py-3 text-sm font-medium text-[#c9b896]"
            >
              Découvrir Premium
            </Link>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="relative overflow-hidden border-b border-white/[0.06] bg-[#050505]">
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_70%_50%_at_15%_0%,rgba(201,162,39,0.1),transparent_55%)]"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:56px_56px] [mask-image:radial-gradient(ellipse_80%_70%_at_50%_0%,black_20%,transparent_75%)]"
        aria-hidden
      />

      <div className="container-content relative px-4 pb-10 pt-28 sm:px-6 sm:pb-12 sm:pt-32 lg:px-8 lg:pb-14">
        <div className="grid items-center gap-10 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)] lg:gap-12 xl:gap-16">
          <HeroContent data={data} />
          <HeroPreviewAside>
            <HeroFightPreview data={data} />
          </HeroPreviewAside>
        </div>
      </div>

      <HeroCredibilityBar stats={data.credibility} />
    </section>
  )
}
