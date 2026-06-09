import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { FightPageView } from '@/components/fight/FightPageView'
import { getAllFightIds, getFightPageData } from '@/lib/fights'

interface FightPageProps {
  params: Promise<{ id: string }>
}

export const dynamicParams = true

export function generateStaticParams() {
  return getAllFightIds().map((id) => ({ id }))
}

export async function generateMetadata({ params }: FightPageProps): Promise<Metadata> {
  const { id } = await params
  const data = getFightPageData(id)
  if (!data) return { title: 'Fight not found' }

  const { fight, event, organization } = data
  const title = `${fight.redCorner.name} vs ${fight.blueCorner.name}`
  const description = `Pronostic NextFight : ${title} lors de ${event.name}. Probabilités, comparaison des stats et analyse détaillée pour ${organization.fullName}.`

  return {
    title: `${title} | NextFight`,
    description,
    openGraph: { title, description },
  }
}

export default async function FightPage({ params }: FightPageProps) {
  const { id } = await params
  const data = getFightPageData(id)

  if (!data) notFound()

  return <FightPageView data={data} />
}
