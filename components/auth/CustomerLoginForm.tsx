'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
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
          <AuthField
            label="Mot de passe"
            name="password"
            type="password"
            placeholder="••••••••"
            autoComplete="current-password"
          />
        </div>
        {error && <p className="mt-3 text-sm text-red-400 text-center">{error}</p>}
        <AuthSubmit>{loading ? 'Connexion…' : submitLabel}</AuthSubmit>
      </form>
    </AuthCard>
  )
}
