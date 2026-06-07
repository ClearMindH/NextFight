import type { Metadata } from 'next'
import { getCompletedEventsSorted } from '@/data/events-helpers'
import { TrackRecordView } from '@/components/track-record/TrackRecordView'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Bilan des pronostics — Résultats passés | NextFight',
  description:
    'Le bilan transparent de nos pronostics MMA : chaque pronostic figé avant l’événement, comparé au vainqueur réel.',
}

export default function ResultatsPage() {
  const events = getCompletedEventsSorted()
  return <TrackRecordView events={events} />
}
