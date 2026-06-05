import { NextResponse } from 'next/server'
import { verifyMagicLoginToken } from '@/lib/auth-magic-link'
import { setCustomerEmailCookie } from '@/lib/auth-cookie'
import { getSiteUrl } from '@/lib/site'

export const runtime = 'nodejs'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const token = searchParams.get('token')?.trim()

  if (!token) {
    return NextResponse.redirect(`${getSiteUrl()}/login?error=missing_token`)
  }

  const email = verifyMagicLoginToken(token)
  if (!email) {
    return NextResponse.redirect(`${getSiteUrl()}/login?error=invalid_token`)
  }

  await setCustomerEmailCookie(email)
  return NextResponse.redirect(`${getSiteUrl()}/account`)
}
