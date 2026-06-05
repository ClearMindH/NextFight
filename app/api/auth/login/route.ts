import { NextResponse } from 'next/server'
import { setCustomerEmailCookie } from '@/lib/auth-cookie'
import { isDevCustomerAuthEnabled, verifyDevCustomerPassword } from '@/lib/dev-auth'
import { sendMagicLoginEmail } from '@/lib/email'
import { buildSubscriptionStatus } from '@/lib/premium'

export const runtime = 'nodejs'

export async function POST(request: Request) {
  const { email, password } = (await request.json()) as {
    email?: string
    password?: string
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
    await setCustomerEmailCookie(normalized)
    const status = await buildSubscriptionStatus(normalized)
    return NextResponse.json({ ok: true, redirect: '/account', ...status })
  }

  const mail = await sendMagicLoginEmail(normalized)
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
