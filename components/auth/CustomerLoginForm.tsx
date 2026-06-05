'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { AuthCard, AuthField, AuthLink, AuthSubmit } from '@/components/auth/AuthCard'

interface CustomerLoginFormProps {
  title: string
  subtitle: string
  submitLabel: string
  footer: React.ReactNode
}

export function CustomerLoginForm({
  title,
  subtitle,
  submitLabel,
  footer,
}: CustomerLoginFormProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [error, setError] = useState<string | null>(() => {
    const err = searchParams.get('error')
    if (err === 'invalid_token') return 'Lien expiré ou invalide. Demandez un nouveau lien.'
    if (err === 'missing_token') return 'Lien de connexion incomplet.'
    return null
  })
  const [info, setInfo] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [isProdFlow, setIsProdFlow] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    setInfo(null)
    setLoading(true)

    const form = new FormData(e.currentTarget)
    const email = String(form.get('email') ?? '')
    const password = String(form.get('password') ?? '')

    const body: { email: string; password?: string } = { email }
    if (password) body.password = password

    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })

    const data = (await res.json().catch(() => ({}))) as {
      error?: string
      redirect?: string
      magicLinkSent?: boolean
      message?: string
    }

    setLoading(false)

    if (!res.ok) {
      if (res.status === 400 && data.error?.includes('Mot de passe')) {
        setIsProdFlow(true)
      }
      setError(data.error ?? 'Connexion impossible')
      return
    }

    if (data.magicLinkSent) {
      setIsProdFlow(true)
      setInfo(data.message ?? 'Vérifiez votre boîte mail (et les spams).')
      return
    }

    router.push(data.redirect ?? '/account')
    router.refresh()
  }

  const showPassword = !isProdFlow

  return (
    <AuthCard title={title} subtitle={subtitle} footer={footer}>
      <form onSubmit={handleSubmit}>
        <div className="space-y-4">
          <AuthField
            label="Email"
            name="email"
            type="email"
            placeholder="vous@exemple.com"
            autoComplete="email"
          />
          {showPassword && (
            <AuthField
              label="Mot de passe"
              name="password"
              type="password"
              placeholder="••••••••"
              autoComplete="current-password"
            />
          )}
        </div>
        {info && <p className="mt-3 text-sm text-[#c9b896] text-center">{info}</p>}
        {error && <p className="mt-3 text-sm text-red-400 text-center">{error}</p>}
        <AuthSubmit>
          {loading
            ? 'Envoi…'
            : isProdFlow
              ? 'Renvoyer le lien'
              : submitLabel}
        </AuthSubmit>
        {isProdFlow && (
          <p className="mt-3 text-center text-xs text-muted">
            Connexion sécurisée par lien email — aucun mot de passe requis.
          </p>
        )}
      </form>
    </AuthCard>
  )
}
