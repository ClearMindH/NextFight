import { NextResponse } from 'next/server'
import { sendContactEmail } from '@/lib/email'

export const runtime = 'nodejs'

export async function POST(request: Request) {
  let body: { name?: string; email?: string; message?: string }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'JSON invalide' }, { status: 400 })
  }

  const name = body.name?.trim()
  const email = body.email?.toLowerCase().trim()
  const message = body.message?.trim()

  if (!name || !email || !message || !email.includes('@')) {
    return NextResponse.json({ error: 'Champs invalides' }, { status: 400 })
  }

  const result = await sendContactEmail({ name, email, message })
  if (!result.sent) {
    return NextResponse.json(
      { error: result.error ?? 'Envoi impossible' },
      { status: 503 },
    )
  }

  return NextResponse.json({ success: true })
}
