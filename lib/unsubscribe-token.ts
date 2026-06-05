import { createHmac, timingSafeEqual } from 'crypto'

function secret(): string {
  const s = process.env.UNSUBSCRIBE_SECRET?.trim()
  if (!s) return ''
  return s
}

export function createUnsubscribeToken(email: string): string | null {
  const key = secret()
  if (!key) return null
  const normalized = email.toLowerCase().trim()
  return createHmac('sha256', key).update(normalized).digest('hex')
}

export function verifyUnsubscribeToken(email: string, token: string): boolean {
  const expected = createUnsubscribeToken(email)
  if (!expected || !token) return false
  try {
    const a = Buffer.from(expected, 'utf8')
    const b = Buffer.from(token, 'utf8')
    return a.length === b.length && timingSafeEqual(a, b)
  } catch {
    return false
  }
}

export function buildUnsubscribeUrl(email: string): string | null {
  const token = createUnsubscribeToken(email)
  if (!token) return null
  const base = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, '') ?? 'https://nextfightsstats.com'
  const params = new URLSearchParams({ email, token })
  return `${base}/api/unsubscribe?${params.toString()}`
}
