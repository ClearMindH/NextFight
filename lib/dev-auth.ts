/** Connexion email/mot de passe réservée au développement local (pas de base utilisateurs). */
export function isDevCustomerAuthEnabled(): boolean {
  if (process.env.ALLOW_DEV_AUTH === '1') return true
  return process.env.NODE_ENV !== 'production'
}

export function verifyDevCustomerPassword(password: string): boolean {
  const secret = process.env.ADMIN_SECRET?.trim()
  if (!secret) return false
  return password === secret
}
