import { NextResponse } from 'next/server'
import { isAdminRequest } from '@/lib/admin-auth'

export async function requireAdmin(): Promise<NextResponse | null> {
  if (!(await isAdminRequest())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  return null
}
