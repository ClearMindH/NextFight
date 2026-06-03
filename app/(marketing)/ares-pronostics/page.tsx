import { getOrganization } from '@/data/organizations'
import { buildPronosticsMetadata } from '@/lib/seo-pronostics'
import { OrgPronosticsPage } from '@/components/seo/OrgPronosticsPage'
import { notFound } from 'next/navigation'

const org = getOrganization('ares')

export const dynamic = 'force-dynamic'

export const metadata = org ? buildPronosticsMetadata(org) : {}

export default function AresPronosticsPage() {
  if (!org) return notFound()
  return <OrgPronosticsPage org={org} />
}
