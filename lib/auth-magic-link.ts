import { createHmac, timingSafeEqual } from 'crypto'
import { getSiteUrl } from '@/lib/site'

const TTL_MS = 15 * 60 * 1000

function secret(): string {
  return (
    process.env.MAGIC_LINK_SECRET?.trim() ||
    process.env.UNSUBSCRIBE_SECRET?.trim() ||
    ''
  )
}

function signPayload(email: string, exp: number): string {
  const key = secret()
  return createHmac('sha256', key).update(`${email}|${exp}`).digest('hex')
}

export function createMagicLoginToken(email: string): string | null {
  const key = secret()
  if (!key) return null
  const normalized = email.toLowerCase().trim()
  const exp = Date.now() + TTL_MS
  const sig = signPayload(normalized, exp)
  return Buffer.from(JSON.stringify({ email: normalized, exp, sig })).toString('base64url')
}

export function verifyMagicLoginToken(token: string): string | null {
  const key = secret()
  if (!key || !token) return null
  try {
    const raw = JSON.parse(Buffer.from(token, 'base64url').toString('utf8')) as {
      email?: string
      exp?: number
      sig?: string
    }
    if (!raw.email || !raw.exp || !raw.sig) return null
    if (Date.now() > raw.exp) return null
    const expected = signPayload(raw.email, raw.exp)
    const a = Buffer.from(expected, 'utf8')
    const b = Buffer.from(raw.sig, 'utf8')
    if (a.length !== b.length || !timingSafeEqual(a, b)) return null
    return raw.email
  } catch {
    return null
  }
}

/** Chemin interne sûr après connexion (ex. /pricing). */
export function sanitizeAuthRedirectPath(path: string | null | undefined): string | null {
  const raw = path?.trim()
  if (!raw?.startsWith('/') || raw.startsWith('//')) return null
  return raw
}

export function buildMagicLoginUrl(email: string, next?: string | null): string | null {
  const token = createMagicLoginToken(email)
  if (!token) return null
  const params = new URLSearchParams({ token })
  const safeNext = sanitizeAuthRedirectPath(next)
  if (safeNext) params.set('next', safeNext)
  return `${getSiteUrl()}/api/auth/verify?${params.toString()}`
}
