import { getOrganization } from '@/data/organizations'
import { buildPronosticsMetadata } from '@/lib/seo-pronostics'
import { OrgPronosticsPage } from '@/components/seo/OrgPronosticsPage'
import { notFound } from 'next/navigation'

const org = getOrganization('hexagone')

export const dynamic = 'force-dynamic'

export const metadata = org ? buildPronosticsMetadata(org) : {}

export default function HexagonePronosticsPage() {
  if (!org) return notFound()
  return <OrgPronosticsPage org={org} />
}
