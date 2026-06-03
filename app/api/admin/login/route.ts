import { NextResponse } from 'next/server'
import {
  isAdminConfigured,
  setAdminSessionCookie,
  verifyAdminPassword,
} from '@/lib/admin-auth'

export const runtime = 'nodejs'

export async function POST(request: Request) {
  if (!isAdminConfigured()) {
    return NextResponse.json(
      { error: 'ADMIN_SECRET not configured on server' },
      { status: 503 },
    )
  }

  const { password } = (await request.json()) as { password?: string }
  if (!password || !verifyAdminPassword(password)) {
    return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 })
  }

  await setAdminSessionCookie()
  return NextResponse.json({ ok: true })
}
