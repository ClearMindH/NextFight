import { createHmac, timingSafeEqual } from 'crypto'

export const ADMIN_SESSION_COOKIE = 'nf_admin_session'
const SESSION_TTL_MS = 12 * 60 * 60 * 1000

function getAdminSecret(): string | null {
  return process.env.ADMIN_SECRET?.trim() || process.env.ADMIN_PASSWORD?.trim() || null
}

export function isAdminConfigured(): boolean {
  return Boolean(getAdminSecret())
}

export function verifyAdminPassword(password: string): boolean {
  const secret = getAdminSecret()
  if (!secret) return false
  const a = Buffer.from(password)
  const b = Buffer.from(secret)
  if (a.length !== b.length) return false
  return timingSafeEqual(a, b)
}

export function createAdminSessionToken(): string {
  const secret = getAdminSecret()
  if (!secret) throw new Error('ADMIN_SECRET not configured')
  const expires = Date.now() + SESSION_TTL_MS
  const payload = `admin:${expires}`
  const sig = createHmac('sha256', secret).update(payload).digest('hex')
  return `${Buffer.from(payload).toString('base64url')}.${sig}`
}

export function verifyAdminSessionToken(token: string | undefined | null): boolean {
  if (!token) return false
  const secret = getAdminSecret()
  if (!secret) return false

  const [encoded, sig] = token.split('.')
  if (!encoded || !sig) return false

  let payload: string
  try {
    payload = Buffer.from(encoded, 'base64url').toString('utf8')
  } catch {
    return false
  }

  const expected = createHmac('sha256', secret).update(payload).digest('hex')
  const sigBuf = Buffer.from(sig, 'hex')
  const expBuf = Buffer.from(expected, 'hex')
  if (sigBuf.length !== expBuf.length || !timingSafeEqual(sigBuf, expBuf)) return false

  const [, expiresStr] = payload.split(':')
  const expires = Number(expiresStr)
  if (!expires || Date.now() > expires) return false

  return payload.startsWith('admin:')
}
