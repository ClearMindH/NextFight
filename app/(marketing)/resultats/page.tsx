import type { Metadata } from 'next'
import { TrackRecordView } from '@/components/track-record/TrackRecordView'

export const metadata: Metadata = {
  title: 'Bilan des pronostics — Résultats passés | NextFight',
  description:
    'Le bilan transparent de nos pronostics UFC : chaque pronostic figé avant la carte, comparé au vainqueur réel.',
}

export default function ResultatsPage() {
  return <TrackRecordView />
}
