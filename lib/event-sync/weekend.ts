/** Saturday 00:00 UTC through Monday 05:59 UTC (covers Fri night US cards). */
export interface WeekendWindow {
  start: Date
  end: Date
  label: string
}

export function getThisWeekendWindow(now = new Date()): WeekendWindow {
  const d = new Date(now)
  const day = d.getUTCDay()
  let satOffset: number
  if (day === 6) satOffset = 0
  else if (day === 0) satOffset = -1
  else satOffset = 6 - day

  const saturday = new Date(
    Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate() + satOffset),
  )
  const end = new Date(saturday)
  end.setUTCDate(saturday.getUTCDate() + 2)
  end.setUTCHours(5, 59, 59, 999)

  const sunday = new Date(saturday)
  sunday.setUTCDate(saturday.getUTCDate() + 1)

  const fmt = (x: Date) =>
    x.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', timeZone: 'UTC' })

  return {
    start: saturday,
    end,
    label: `${fmt(saturday)} – ${fmt(sunday)}`,
  }
}

export function isDateInWeekend(isoDate: string, window = getThisWeekendWindow()): boolean {
  const t = new Date(isoDate).getTime()
  return t >= window.start.getTime() && t <= window.end.getTime()
}

export function filterEventsInWeekend<T extends { date: string }>(
  events: T[],
  window = getThisWeekendWindow(),
): T[] {
  return events.filter((e) => isDateInWeekend(e.date, window))
}
