import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { ADMIN_SESSION_COOKIE } from '@/lib/admin-auth-core'
import { isAdminSessionShapeValid } from '@/lib/admin-auth-edge'

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const isAdminRoute = pathname.startsWith('/admin')
  const isAdminApi = pathname.startsWith('/api/admin')
  const isLogin = pathname === '/admin/login' || pathname === '/api/admin/login'

  if (!isAdminRoute && !isAdminApi) {
    return NextResponse.next()
  }

  if (isLogin) {
    return NextResponse.next()
  }

  const token = request.cookies.get(ADMIN_SESSION_COOKIE)?.value
  if (!isAdminSessionShapeValid(token)) {
    if (isAdminApi) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    const loginUrl = new URL('/admin/login', request.url)
    loginUrl.searchParams.set('next', pathname)
    return NextResponse.redirect(loginUrl)
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/admin/:path*', '/api/admin/:path*'],
}
