import { NextResponse } from 'next/server'
import { clearCustomerEmailCookie } from '@/lib/auth-cookie'

export const runtime = 'nodejs'

export async function POST() {
  const response = NextResponse.json({ ok: true })
  return clearCustomerEmailCookie(response)
}
