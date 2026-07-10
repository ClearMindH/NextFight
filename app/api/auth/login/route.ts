import { NextResponse } from 'next/server'
import { applyCustomerEmailCookie } from '@/lib/auth-cookie'
import { isDevCustomerAuthEnabled, verifyDevCustomerPassword } from '@/lib/dev-auth'
import { sendMagicLoginEmail } from '@/lib/email'
import { buildSubscriptionStatus } from '@/lib/premium'
import { getStripe, isStripeConfigured } from '@/lib/stripe'
import { syncSubscriptionsForEmail } from '@/lib/stripe-sync'

export const runtime = 'nodejs'

export async function POST(request: Request) {
  const { email, password, next } = (await request.json()) as {
    email?: string
    password?: string
    next?: string
  }

  const normalized = email?.toLowerCase().trim()
  if (!normalized || !normalized.includes('@')) {
    return NextResponse.json({ error: 'Email invalide' }, { status: 400 })
  }

  if (isDevCustomerAuthEnabled()) {
    if (!password) {
      return NextResponse.json({ error: 'Mot de passe requis' }, { status: 400 })
    }
    if (!verifyDevCustomerPassword(password)) {
      return NextResponse.json({ error: 'Identifiants incorrects' }, { status: 401 })
    }
    const status = await buildSubscriptionStatus(normalized)
    const response = NextResponse.json({ ok: true, redirect: '/account', ...status })
    return applyCustomerEmailCookie(response, normalized)
  }

  if (isStripeConfigured()) {
    try {
      await syncSubscriptionsForEmail(normalized, getStripe())
    } catch (err) {
      console.error('[auth/login] stripe sync failed', err)
    }
  }

  const mail = await sendMagicLoginEmail(normalized, next)
  if (!mail.sent) {
    return NextResponse.json(
      { error: mail.error ?? 'Envoi du lien impossible. Réessayez plus tard.' },
      { status: 503 },
    )
  }

  return NextResponse.json({
    ok: true,
    magicLinkSent: true,
    message: 'Un lien de connexion a été envoyé à votre adresse email.',
  })
}
