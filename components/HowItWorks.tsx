import Link from 'next/link'
import { CalendarDays, BarChart3, Trophy } from 'lucide-react'

const steps = [
  {
    icon: CalendarDays,
    title: 'Trouve ta carte',
    description:
      'UFC, PFL, KSW, ARES, Hexagone MMA — les prochains événements sont réunis au même endroit.',
  },
  {
    icon: BarChart3,
    title: 'Compare les combattants',
    description:
      'Allonge, précision aux frappes, défense, takedowns, séries en cours : les vrais chiffres, mis face à face.',
  },
  {
    icon: Trophy,
    title: 'Vois qui part favori',
    description:
      'Notre modèle calcule une probabilité de victoire pour chaque combat. Le co-main, c’est offert sur toutes les cartes.',
  },
]

export function HowItWorks() {
  return (
    <section className="section-padding border-b border-border">
      <div className="container-content">
        <div className="max-w-2xl">
          <p className="text-xs font-medium uppercase tracking-[0.2em] text-gold">
            Comment ça marche
          </p>
          <h2 className="mt-3 font-display text-2xl sm:text-3xl font-semibold tracking-tight">
            Des données réelles, une décision claire.
          </h2>
          <p className="mt-3 text-sm text-muted leading-relaxed">
            Statistiques réelles, face-à-face des combattants, probabilité de victoire. Tout ce
            qu&apos;il faut pour suivre ou anticiper un combat.
          </p>
        </div>

        <ol className="mt-10 grid gap-5 sm:grid-cols-3">
          {steps.map((step, i) => (
            <li
              key={step.title}
              className="relative rounded-2xl border border-border bg-card p-6"
            >
              <div className="flex items-center gap-3">
                <span className="flex h-9 w-9 items-center justify-center rounded-full border border-gold/40 bg-gold/10 text-sm font-semibold tabular-nums text-gold">
                  {i + 1}
                </span>
                <step.icon className="h-5 w-5 text-gold" aria-hidden />
              </div>
              <h3 className="mt-4 font-display text-lg font-semibold tracking-tight">
                {step.title}
              </h3>
              <p className="mt-2 text-sm text-muted leading-relaxed">{step.description}</p>
            </li>
          ))}
        </ol>

        <div className="mt-8">
          <Link
            href="#promotions"
            className="text-sm font-medium text-gold transition-colors hover:text-foreground"
          >
            Parcourir les organisations →
          </Link>
        </div>
      </div>
    </section>
  )
}
