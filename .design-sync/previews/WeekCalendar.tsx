import { useState } from 'react'
import { CALENDAR_WEEK, WeekCalendar } from 'figma-make-app'
import type { CalDay } from 'figma-make-app'

/**
 * The default week. With no `days` prop the component falls back to
 * CALENDAR_WEEK, the reference week shipped with the design system.
 */
export function DefaultWeek() {
  return <WeekCalendar selectedDate={null} onDayClick={() => {}} />
}

/** A day selected. The selected column floods with the highlight yellow. */
export function DaySelected() {
  return <WeekCalendar selectedDate={11} onDayClick={() => {}} />
}

/** Interactive: click a day to move the selection. */
export function Interactive() {
  const [selected, setSelected] = useState<CalDay | null>(null)
  return (
    <WeekCalendar
      selectedDate={selected?.date ?? null}
      onDayClick={day => setSelected(d => (d?.date === day.date ? null : day))}
    />
  )
}

/** A custom, quieter week passed through `days` — two events, no deadlines. */
export function CustomWeek() {
  const calmWeek: CalDay[] = CALENDAR_WEEK.map((d, i) => ({
    ...d,
    events: i === 2
      ? [{ time: '3pm', title: 'Study group — LinAlg', kind: 'class' as const }]
      : i === 5
        ? [{ time: '11am', title: 'Long walk', kind: 'rest' as const }]
        : [],
  }))
  return <WeekCalendar selectedDate={null} onDayClick={() => {}} days={calmWeek} />
}
