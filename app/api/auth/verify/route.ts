import { NextResponse } from 'next/server'
import { verifyMagicLoginToken } from '@/lib/auth-magic-link'
import { applyCustomerEmailCookie } from '@/lib/auth-cookie'
import { getSiteUrl } from '@/lib/site'
import { getStripe, isStripeConfigured } from '@/lib/stripe'
import { syncSubscriptionsForEmail } from '@/lib/stripe-sync'

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

  if (isStripeConfigured()) {
    try {
      await syncSubscriptionsForEmail(email, getStripe())
    } catch (err) {
      console.error('[auth/verify] stripe sync failed', err)
    }
  }

  const response = NextResponse.redirect(`${getSiteUrl()}/account`)
  return applyCustomerEmailCookie(response, email)
}
