import { cookies } from 'next/headers'
import {
  ADMIN_SESSION_COOKIE,
  createAdminSessionToken,
  isAdminConfigured,
  verifyAdminPassword,
  verifyAdminSessionToken,
} from '@/lib/admin-auth-core'

export {
  ADMIN_SESSION_COOKIE,
  createAdminSessionToken,
  isAdminConfigured,
  verifyAdminPassword,
  verifyAdminSessionToken,
} from '@/lib/admin-auth-core'

export async function setAdminSessionCookie(): Promise<void> {
  const jar = await cookies()
  jar.set(ADMIN_SESSION_COOKIE, createAdminSessionToken(), {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 12 * 60 * 60,
  })
}

export async function clearAdminSessionCookie(): Promise<void> {
  const jar = await cookies()
  jar.delete(ADMIN_SESSION_COOKIE)
}

export async function isAdminRequest(): Promise<boolean> {
  const jar = await cookies()
  return verifyAdminSessionToken(jar.get(ADMIN_SESSION_COOKIE)?.value)
}
