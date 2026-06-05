import { NextResponse } from 'next/server'
import { sendWelcomeSubscriptionEmail } from '@/lib/email'

export const runtime = 'nodejs'

/** Confirmation email après inscription (newsletter ou post-checkout manuel). */
export async function POST(request: Request) {
  let body: { email?: string; plan?: string }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'JSON invalide' }, { status: 400 })
  }

  const email = body.email?.toLowerCase().trim()
  if (!email || !email.includes('@')) {
    return NextResponse.json({ error: 'Email invalide' }, { status: 400 })
  }

  const plan =
    body.plan === 'premium_annual' ? 'premium_annual' : 'premium_monthly'

  const result = await sendWelcomeSubscriptionEmail(email, plan)
  if (!result.sent) {
    return NextResponse.json(
      { error: result.error ?? 'Envoi impossible' },
      { status: 503 },
    )
  }

  return NextResponse.json({ success: true })
}
