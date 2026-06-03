'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Suspense } from 'react'
import { Lock } from 'lucide-react'

function AdminLoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const res = await fetch('/api/admin/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password }),
    })

    setLoading(false)

    const data = (await res.json().catch(() => ({}))) as { error?: string }

    if (!res.ok) {
      if (res.status === 503) {
        setError(
          data.error ??
            'ADMIN_SECRET manquant. Ajoutez-le dans .env.local puis redémarrez npm run dev.',
        )
        return
      }
      setError(data.error === 'Invalid credentials' ? 'Mot de passe incorrect' : (data.error ?? 'Mot de passe incorrect'))
      return
    }

    const next = searchParams.get('next') || '/admin'
    router.push(next)
    router.refresh()
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-background">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-sm rounded-2xl border border-border bg-card p-8"
      >
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gold/10 text-gold mx-auto">
          <Lock size={22} />
        </div>
        <h1 className="mt-6 font-display text-2xl font-semibold text-center tracking-tight">
          Admin NextFight
        </h1>
        <p className="mt-2 text-sm text-muted text-center">Accès réservé aux administrateurs</p>

        <input
          type="password"
          required
          placeholder="Mot de passe admin"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="mt-6 w-full rounded-lg border border-border bg-background px-4 py-3 text-sm focus:border-gold/50 focus:outline-none"
        />

        {error && <p className="mt-3 text-sm text-red-400 text-center">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="mt-6 w-full rounded-full bg-foreground text-background py-3 text-sm font-medium disabled:opacity-60"
        >
          {loading ? 'Connexion…' : 'Se connecter'}
        </button>
      </form>
    </div>
  )
}

export default function AdminLoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-background" />}>
      <AdminLoginForm />
    </Suspense>
  )
}
