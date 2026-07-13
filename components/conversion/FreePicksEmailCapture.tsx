'use client'

import { useState } from 'react'
import { Mail } from 'lucide-react'
import { cn } from '@/utils/cn'

type FreePicksEmailCaptureProps = {
  className?: string
}

/** Capture email — alerte co-main gratuit avant chaque carte (lien magique). */
export function FreePicksEmailCapture({ className }: FreePicksEmailCaptureProps) {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setMessage(null)
    setError(null)

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, next: '/ufc-pronostics' }),
      })
      const data = (await res.json()) as { message?: string; error?: string }

      if (!res.ok) {
        setError(data.error ?? 'Envoi impossible')
        return
      }

      setMessage(data.message ?? 'Vérifiez votre boîte mail — lien envoyé.')
      setEmail('')
    } catch {
      setError('Erreur réseau')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      className={cn(
        'rounded-2xl border border-white/[0.08] bg-[#0c0c0c] px-5 py-5 sm:px-6',
        className,
      )}
    >
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#e8c840]/10">
          <Mail className="h-4 w-4 text-[#e8c840]" aria-hidden />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-white">
            Recevez le pronostic gratuit avant chaque carte UFC
          </p>
          <p className="mt-1 text-xs leading-relaxed text-[#8a8278]">
            Co-main en accès libre · pas de spam · lien de connexion par email
          </p>

          <form onSubmit={handleSubmit} className="mt-4 flex flex-col gap-2 sm:flex-row">
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="votre@email.com"
              className="min-w-0 flex-1 rounded-full border border-white/[0.12] bg-[#050505] px-4 py-2.5 text-sm text-white placeholder:text-[#5c5c5c] focus:border-[#e8c840]/40 focus:outline-none"
            />
            <button
              type="submit"
              disabled={loading}
              className="shrink-0 rounded-full bg-[#e8c840] px-5 py-2.5 text-sm font-semibold text-[#0a0a0a] transition-opacity hover:opacity-90 disabled:opacity-60"
            >
              {loading ? 'Envoi…' : 'M\'alerter'}
            </button>
          </form>

          {message && <p className="mt-2 text-xs text-[#a8d4a0]">{message}</p>}
          {error && <p className="mt-2 text-xs text-red-400/90">{error}</p>}
        </div>
      </div>
    </div>
  )
}
