'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
type AuthMode = 'login' | 'register'

interface CustomerLoginExperienceProps {
  mode: AuthMode
}

const COPY: Record<
  AuthMode,
  {
    eyebrow: string
    title: string
    subtitle: string
    submit: string
    switchHref: string
    switchLabel: string
    aside: string
  }
> = {
  login: {
    eyebrow: 'Espace membre',
    title: 'Connexion',
    subtitle:
      'Accédez à vos pronostics, votre abonnement Premium et les analyses par combat.',
    submit: 'Se connecter',
    switchHref: '/register',
    switchLabel: 'Créer un accès',
    aside:
      'Modèle statistique par affrontement : probabilités, méthode prédite et comparaison des profils.',
  },
  register: {
    eyebrow: 'Accès local',
    title: 'Inscription',
    subtitle:
      'En développement, utilisez l’email de votre compte et le mot de passe administrateur configuré sur le serveur.',
    submit: 'Accéder au compte',
    switchHref: '/login',
    switchLabel: 'Déjà inscrit',
    aside:
      'En production, l’accès membre est activé automatiquement après paiement Stripe.',
  },
}

export function CustomerLoginExperience({ mode }: CustomerLoginExperienceProps) {
  const router = useRouter()
  const copy = COPY[mode]
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    setLoading(true)

    const form = new FormData(e.currentTarget)
    const email = String(form.get('email') ?? '')
    const password = String(form.get('password') ?? '')

    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    })

    const data = (await res.json().catch(() => ({}))) as {
      error?: string
      redirect?: string
    }

    setLoading(false)

    if (!res.ok) {
      setError(data.error ?? 'Connexion impossible')
      return
    }

    router.push(data.redirect ?? '/account')
    router.refresh()
  }

  return (
    <div className="relative w-full min-h-[calc(100vh-3.5rem)] sm:min-h-[calc(100vh-4rem)] bg-[#050505]">
      {/* Fond type cage / tapis — très discret */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.35]"
        aria-hidden
        style={{
          backgroundImage: `
            radial-gradient(ellipse 70% 50% at 50% 0%, rgba(180, 40, 40, 0.12), transparent 55%),
            radial-gradient(ellipse 50% 40% at 100% 100%, rgba(40, 80, 160, 0.08), transparent 50%)
          `,
        }}
      />
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.04]"
        aria-hidden
        style={{
          backgroundImage: `
            linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)
          `,
          backgroundSize: '64px 64px',
        }}
      />

      <div className="relative mx-auto flex h-full max-w-6xl flex-col lg:flex-row">
        {/* Contexte MMA — texte seulement */}
        <section className="flex flex-1 flex-col justify-center px-6 py-12 lg:py-16 lg:pr-12 lg:max-w-md">
          <p className="text-[10px] font-medium uppercase tracking-[0.24em] text-[#8a8278]">
            Pronostics MMA
          </p>
          <h2 className="mt-4 font-display text-2xl sm:text-3xl font-semibold tracking-tight text-[#f5f2eb] leading-snug">
            Analyses par combat,
            <span className="text-[#6b6b6b]"> pas par hasard.</span>
          </h2>
          <p className="mt-5 text-sm text-[#6b6b6b] leading-relaxed">{copy.aside}</p>

          <ul className="mt-8 space-y-3 border-t border-[#1c1c1c] pt-8">
            {['UFC', 'PFL', 'KSW', 'ARES', 'Hexagone MMA'].map((org) => (
              <li
                key={org}
                className="flex items-center gap-3 text-xs uppercase tracking-[0.14em] text-[#5c5c5c]"
              >
                <span className="h-1.5 w-1.5 rounded-full bg-[#c9b896]/80" aria-hidden />
                {org}
              </li>
            ))}
          </ul>
        </section>

        {/* Formulaire */}
        <section className="flex flex-1 items-center justify-center px-6 pb-12 lg:pb-16 lg:pl-4">
          <div className="w-full max-w-[420px]">
            <p className="text-[10px] uppercase tracking-[0.22em] text-[#8a8278]">{copy.eyebrow}</p>
            <h1 className="mt-2 font-display text-3xl font-semibold tracking-tight text-[#f5f2eb]">
              {copy.title}
            </h1>
            <p className="mt-3 text-sm text-[#6b6b6b] leading-relaxed">{copy.subtitle}</p>

            <form
              onSubmit={handleSubmit}
              className="relative mt-8 rounded-2xl border border-[#1c1c1c] bg-[#0a0a0a] overflow-hidden"
            >
              {/* Coins rouge / bleu — rappel octogone discret */}
              <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-red-600/70" aria-hidden />
              <div className="absolute right-0 top-0 bottom-0 w-0.5 bg-blue-600/70" aria-hidden />

              <div className="p-7 sm:p-8">
                <div className="space-y-5">
                  <AuthField
                    label="Email"
                    name="email"
                    type="email"
                    placeholder="vous@exemple.com"
                    autoComplete="email"
                  />
                  <AuthField
                    label="Mot de passe"
                    name="password"
                    type="password"
                    placeholder="••••••••"
                    autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                  />
                </div>

                {error && (
                  <p className="mt-4 text-sm text-red-400/90 text-center">{error}</p>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="mt-6 w-full rounded-xl bg-[#f5f2eb] py-3.5 text-sm font-medium text-[#0a0a0a] transition-colors hover:bg-[#e8e4dc] disabled:opacity-50"
                >
                  {loading ? 'Connexion…' : copy.submit}
                </button>
              </div>
            </form>

            <div className="mt-6 flex flex-wrap items-center justify-between gap-3 text-sm">
              <Link
                href={copy.switchHref}
                className="text-[#8a8278] hover:text-[#c9b896] transition-colors"
              >
                {copy.switchLabel}
              </Link>
              <Link
                href="/pricing"
                className="text-[#5c5c5c] hover:text-[#f5f2eb] text-xs uppercase tracking-[0.12em] transition-colors"
              >
                Offres Premium
              </Link>
            </div>

            <p className="mt-8 text-[11px] text-[#5c5c5c] leading-relaxed">
              Outil informatif — aucun pari proposé. Les marques des promotions appartiennent à
              leurs détenteurs.
            </p>
          </div>
        </section>
      </div>
    </div>
  )
}

function AuthField({
  label,
  name,
  type,
  placeholder,
  autoComplete,
}: {
  label: string
  name: string
  type: string
  placeholder: string
  autoComplete?: string
}) {
  return (
    <label className="block">
      <span className="text-[10px] uppercase tracking-[0.18em] text-[#5c5c5c]">{label}</span>
      <input
        name={name}
        type={type}
        placeholder={placeholder}
        autoComplete={autoComplete}
        required
        className="mt-2 w-full rounded-lg border border-[#262626] bg-[#050505] px-4 py-3 text-sm text-[#f5f2eb] placeholder:text-[#404040] focus:border-[#c9b896]/50 focus:outline-none focus:ring-1 focus:ring-[#c9b896]/20 transition-colors"
      />
    </label>
  )
}
