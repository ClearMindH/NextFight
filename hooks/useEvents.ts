'use client'

import { useEffect, useState } from 'react'
import type { Event } from '@/types'

export function useEvents() {
  const [events, setEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/events', { cache: 'no-store' })
      .then((res) => res.json())
      .then((data: { events: Event[] }) => setEvents(data.events ?? []))
      .catch(() => setEvents([]))
      .finally(() => setLoading(false))
  }, [])

  return { events, loading }
}
