'use client'

import { useState } from 'react'
import { cn } from '@/utils/cn'

export function ContactForm({ className }: { className?: string }) {
  const [status, setStatus] = useState<'idle' | 'loading' | 'ok' | 'error'>('idle')
  const [error, setError] = useState<string | null>(null)

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setStatus('loading')
    setError(null)
    const form = e.currentTarget
    const data = {
      name: (form.elements.namedItem('name') as HTMLInputElement).value,
      email: (form.elements.namedItem('email') as HTMLInputElement).value,
      message: (form.elements.namedItem('message') as HTMLTextAreaElement).value,
    }

    const res = await fetch('/api/contact', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })

    if (!res.ok) {
      const body = await res.json().catch(() => ({}))
      setError(body.error ?? 'Envoi impossible')
      setStatus('error')
      return
    }

    setStatus('ok')
    form.reset()
  }

  if (status === 'ok') {
    return (
      <p className="rounded-xl border border-gold/30 bg-gold/10 px-4 py-3 text-sm text-gold">
        Message envoyé — nous vous répondrons rapidement.
      </p>
    )
  }

  return (
    <form onSubmit={onSubmit} className={cn('space-y-4', className)}>
      <input
        name="name"
        required
        placeholder="Votre prénom"
        className="w-full rounded-xl border border-white/10 bg-[#0c1219] px-4 py-3 text-sm outline-none focus:border-gold/40"
      />
      <input
        name="email"
        type="email"
        required
        placeholder="Votre email"
        className="w-full rounded-xl border border-white/10 bg-[#0c1219] px-4 py-3 text-sm outline-none focus:border-gold/40"
      />
      <textarea
        name="message"
        required
        rows={5}
        placeholder="Votre message"
        className="w-full rounded-xl border border-white/10 bg-[#0c1219] px-4 py-3 text-sm outline-none focus:border-gold/40 resize-y"
      />
      {error && <p className="text-sm text-red-400">{error}</p>}
      <button
        type="submit"
        disabled={status === 'loading'}
        className="w-full rounded-xl bg-gold py-3 text-sm font-semibold text-[#0c0c0c] disabled:opacity-60"
      >
        {status === 'loading' ? 'Envoi…' : 'Envoyer'}
      </button>
    </form>
  )
}
