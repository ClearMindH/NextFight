/** Hostnames autorisés pour next/image (optimisation). Les autres URLs passent en <img>. */
const NEXT_IMAGE_HOSTS = new Set([
  'images.unsplash.com',
  'ufc.com',
  'www.ufc.com',
])

export function canUseNextImage(src: string): boolean {
  if (!src) return false
  if (src.startsWith('/')) return true
  try {
    return NEXT_IMAGE_HOSTS.has(new URL(src).hostname)
  } catch {
    return false
  }
}

export function isValidImageSrc(src: string): boolean {
  if (!src.trim()) return false
  if (src.startsWith('/')) return true
  try {
    const u = new URL(src)
    return u.protocol === 'https:' || u.protocol === 'http:'
  } catch {
    return false
  }
}
