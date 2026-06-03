import { NextResponse } from 'next/server'
import { setCustomerEmailCookie } from '@/lib/auth-cookie'
import { isDevCustomerAuthEnabled, verifyDevCustomerPassword } from '@/lib/dev-auth'
import { buildSubscriptionStatus } from '@/lib/premium'

export const runtime = 'nodejs'

export async function POST(request: Request) {
  if (!isDevCustomerAuthEnabled()) {
    return NextResponse.json(
      { error: 'Connexion email disponible uniquement en développement local.' },
      { status: 403 },
    )
  }

  const { email, password } = (await request.json()) as {
    email?: string
    password?: string
  }

  const normalized = email?.toLowerCase().trim()
  if (!normalized || !password) {
    return NextResponse.json({ error: 'Email et mot de passe requis' }, { status: 400 })
  }

  if (!verifyDevCustomerPassword(password)) {
    return NextResponse.json({ error: 'Identifiants incorrects' }, { status: 401 })
  }

  await setCustomerEmailCookie(normalized)
  const status = await buildSubscriptionStatus(normalized)

  return NextResponse.json({
    ok: true,
    redirect: '/account',
    ...status,
  })
}
