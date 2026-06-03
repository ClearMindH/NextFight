const DEFAULT_TIMEOUT_MS = 45_000

export async function fetchText(
  url: string,
  init: RequestInit = {},
): Promise<string> {
  const res = await fetch(url, {
    ...init,
    headers: {
      'User-Agent': 'NextFight-EventSync/1.0',
      Accept: 'text/html,application/json',
      ...(init.headers as Record<string, string>),
    },
    signal: AbortSignal.timeout(DEFAULT_TIMEOUT_MS),
  })
  if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`)
  return res.text()
}

export type CookieJar = Map<string, string>

export function applySetCookies(jar: CookieJar, headers: Headers): void {
  const list =
    typeof headers.getSetCookie === 'function'
      ? headers.getSetCookie()
      : headers.get('set-cookie')
        ? [headers.get('set-cookie')!]
        : []

  for (const raw of list) {
    const part = raw.split(';')[0]
    const eq = part.indexOf('=')
    if (eq > 0) jar.set(part.slice(0, eq), part.slice(eq + 1))
  }
}

export function cookieHeader(jar: CookieJar): string {
  return [...jar.entries()].map(([k, v]) => `${k}=${v}`).join('; ')
}

export function xsrfHeader(jar: CookieJar): string | undefined {
  const token = jar.get('XSRF-TOKEN')
  return token ? decodeURIComponent(token) : undefined
}

export async function fetchWithCookies(
  url: string,
  jar: CookieJar,
  init: RequestInit = {},
): Promise<Response> {
  const headers = new Headers(init.headers)
  const cookie = cookieHeader(jar)
  if (cookie) headers.set('Cookie', cookie)
  const xsrf = xsrfHeader(jar)
  if (xsrf) headers.set('X-XSRF-TOKEN', xsrf)

  const res = await fetch(url, {
    ...init,
    headers,
    signal: AbortSignal.timeout(DEFAULT_TIMEOUT_MS),
  })
  applySetCookies(jar, res.headers)
  return res
}
