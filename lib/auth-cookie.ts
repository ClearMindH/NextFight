import { cookies } from 'next/headers'

export const CUSTOMER_EMAIL_COOKIE = 'nf_customer_email'

export async function getCustomerEmailFromCookie(): Promise<string | null> {
  const jar = await cookies()
  const value = jar.get(CUSTOMER_EMAIL_COOKIE)?.value
  return value?.toLowerCase().trim() ?? null
}

export async function setCustomerEmailCookie(email: string): Promise<void> {
  const jar = await cookies()
  jar.set(CUSTOMER_EMAIL_COOKIE, email.toLowerCase().trim(), {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 365,
  })
}
