import type { Metadata } from 'next'
import { getCompletedEventsByOrg } from '@/data/events-helpers'
import { TrackRecordView } from '@/components/track-record/TrackRecordView'

export const metadata: Metadata = {
  title: 'Bilan des pronostics — Résultats passés | NextFight',
  description:
    'Le bilan transparent de nos pronostics UFC : chaque pronostic figé avant la carte, comparé au vainqueur réel.',
}

export default function ResultatsPage() {
  const events = getCompletedEventsByOrg('ufc')
  return <TrackRecordView events={events} />
}
