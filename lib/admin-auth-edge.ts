/** Edge-safe session check (expiry only). Full HMAC verified in API routes. */
export function isAdminSessionShapeValid(token: string | undefined | null): boolean {
  if (!token) return false
  const [encoded] = token.split('.')
  if (!encoded) return false
  try {
    const binary = atob(encoded.replace(/-/g, '+').replace(/_/g, '/'))
    const bytes = Uint8Array.from(binary, (c) => c.charCodeAt(0))
    const payload = new TextDecoder().decode(bytes)
    if (!payload.startsWith('admin:')) return false
    const expires = Number(payload.split(':')[1])
    return Boolean(expires && Date.now() < expires)
  } catch {
    return false
  }
}
