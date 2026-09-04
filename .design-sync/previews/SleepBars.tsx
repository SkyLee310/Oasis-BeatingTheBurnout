import { SleepBars } from 'figma-make-app'
import type { SleepDatum } from 'figma-make-app'

/** A real week: below the 6-hour recovery baseline for four nights running. */
const week: SleepDatum[] = [
  { day: 'Mon', hours: 5.1 },
  { day: 'Tue', hours: 5.8 },
  { day: 'Wed', hours: 4.9, isToday: true },
  { day: 'Thu', hours: 5.4 },
  { day: 'Fri', hours: 6.2 },
  { day: 'Sat', hours: 5.0 },
  { day: 'Sun', hours: 5.4 },
]

/** A recovered week, for contrast: most nights at or above the 7-hour mark. */
const restedWeek: SleepDatum[] = [
  { day: 'Mon', hours: 7.4 },
  { day: 'Tue', hours: 7.1 },
  { day: 'Wed', hours: 6.4, isToday: true },
  { day: 'Thu', hours: 7.8 },
  { day: 'Fri', hours: 7.2 },
  { day: 'Sat', hours: 8.1 },
  { day: 'Sun', hours: 7.6 },
]

/** The full-height form, on the recovery page. Each bar takes its own zone. */
export function TheWeek() {
  return (
    <div style={{ maxWidth: 420 }}>
      <SleepBars data={week} height={96} />
    </div>
  )
}

/** The compact form, nested inside a StatTile on the dashboard. */
export function Compact() {
  return (
    <div style={{ maxWidth: 300 }}>
      <SleepBars data={week} height={54} />
    </div>
  )
}

/**
 * Bar colour comes from the hours, not a prop: 7h and over reads green,
 * 6h amber, below that red. Today additionally gets the hard offset shadow.
 */
export function RestedWeek() {
  return (
    <div style={{ maxWidth: 420 }}>
      <SleepBars data={restedWeek} height={96} />
    </div>
  )
}
