import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export const CUSTOMER_EMAIL_COOKIE = 'nf_customer_email'

const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax' as const,
  path: '/',
  maxAge: 60 * 60 * 24 * 365,
}

export async function getCustomerEmailFromCookie(): Promise<string | null> {
  const jar = await cookies()
  const value = jar.get(CUSTOMER_EMAIL_COOKIE)?.value
  return value?.toLowerCase().trim() ?? null
}

export async function setCustomerEmailCookie(email: string): Promise<void> {
  const jar = await cookies()
  jar.set(CUSTOMER_EMAIL_COOKIE, email.toLowerCase().trim(), COOKIE_OPTIONS)
}

/** Pose le cookie sur une NextResponse (fiable après fetch client, ex. verify-session). */
export function applyCustomerEmailCookie<T extends NextResponse>(
  response: T,
  email: string,
): T {
  response.cookies.set(CUSTOMER_EMAIL_COOKIE, email.toLowerCase().trim(), COOKIE_OPTIONS)
  return response
}

export function clearCustomerEmailCookie<T extends NextResponse>(response: T): T {
  response.cookies.set(CUSTOMER_EMAIL_COOKIE, '', {
    ...COOKIE_OPTIONS,
    maxAge: 0,
  })
  return response
}
