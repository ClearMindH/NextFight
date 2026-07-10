import { NextResponse } from 'next/server'
import { getRoster } from '@/lib/rosters'
import type { OrganizationId } from '@/types'

const validOrgs: OrganizationId[] = ['ufc']

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ orgId: string }> },
) {
  const { orgId } = await params
  if (!validOrgs.includes(orgId as OrganizationId)) {
    return NextResponse.json({ error: 'Unknown organization' }, { status: 404 })
  }
  return NextResponse.json(getRoster(orgId as OrganizationId))
}
