import { getOrganization } from '@/data/organizations'
import { buildOrgMetadata } from '@/lib/seo'
import { OrgSeoPage } from '@/components/seo/OrgSeoPage'
import { notFound } from 'next/navigation'

const org = getOrganization('ares')!

export const metadata = buildOrgMetadata(org)

export default function AresPredictionsPage() {
  if (!org) return notFound()
  return <OrgSeoPage org={org} />
}
