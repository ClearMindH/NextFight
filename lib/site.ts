/** URL canonique du site (Vercel : NEXT_PUBLIC_SITE_URL). */
export function getSiteUrl(): string {
  const raw = process.env.NEXT_PUBLIC_SITE_URL?.trim()
  if (raw) return raw.replace(/\/$/, '')
  return 'https://nextfightsstats.com'
}

export function getSiteName(): string {
  return process.env.NEXT_PUBLIC_SITE_NAME?.trim() || 'NextFight'
}

export const CONTACT_EMAIL =
  process.env.CONTACT_EMAIL?.trim() || 'contact@nextfightsstats.com'

export const NOREPLY_EMAIL =
  process.env.RESEND_FROM_EMAIL?.trim() || 'noreply@nextfightsstats.com'

/** Production : lien magique par email. Dev : mot de passe ADMIN_SECRET. */
export function isMagicLinkCustomerAuth(): boolean {
  if (process.env.ALLOW_DEV_AUTH === '1') return false
  return process.env.NODE_ENV === 'production'
}
