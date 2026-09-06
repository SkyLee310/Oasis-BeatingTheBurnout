// ─── The week, as the calendar sees it ────────────────────────────────────────
// WeekCalendar falls back to CALENDAR_WEEK when it is given no `days`, and that
// constant is the DS package's own sample data — a 2025 week with its weekday
// labels typed by hand. Rendering it here would mean the schedule tab showed a
// different week from every other screen, and would never move when a task is
// deferred or a request accepted. So the app builds its own days from the store.

import type { CalDay, CalEvent } from '../ds'
import type { OasisState } from '../state/types'
import { commitmentCost } from './energy'
import { addDays, dateOf, dayOf, monthLongOf, monthOf } from './dates'

const DAYS_IN_WEEK = 7

/** Monday of the week containing `iso`. getDay() is Sunday-first; this is not. */
export function weekStart(iso: string) {
  const dow = (new Date(`${iso}T12:00:00`).getDay() + 6) % 7
  return addDays(iso, -dow)
}

/**
 * The Mon-first week around `state.today`, in the shape WeekCalendar wants.
 * Every field is derived: the weekday label comes from the ISO date, so it is
 * always the day that date really falls on, and each event's energy figure is
 * what that commitment actually costs *this* week — the same number the
 * dashboard's pressure list and the deferral tab quote.
 */
export function weekDays(state: OasisState): CalDay[] {
  const start = weekStart(state.today)

  return Array.from({ length: DAYS_IN_WEEK }, (_, i) => {
    const iso = addDays(start, i)
    const events: CalEvent[] = state.commitments
      .filter(c => c.date === iso)
      .map(c => ({
        time: c.time,
        title: c.title,
        kind: c.kind,
        // Rest blocks and open requests cost nothing, and "Energy cost: -0 pts"
        // on a rest block would read as a bug rather than as zero.
        energy: c.hours > 0 ? -commitmentCost(state, c.id) : undefined,
      }))

    return {
      date: dateOf(iso),
      day: dayOf(iso),
      month: monthOf(iso),
      isToday: iso === state.today,
      events,
    }
  })
}

/**
 * 'WEEK OF 7–13 SEPTEMBER' — the schedule hero's eyebrow, pre-uppercased
 * because Tag styles its text but does not transform it. A week that straddles
 * a month names both ('WEEK OF 28 SEPTEMBER – 4 OCTOBER'); dropping the first
 * one there would put the Monday in the wrong month.
 */
export function weekLabel(iso: string) {
  const start = weekStart(iso)
  const end = addDays(start, 6)
  const from = monthLongOf(start).toUpperCase()
  const to = monthLongOf(end).toUpperCase()

  return from === to
    ? `WEEK OF ${dateOf(start)}–${dateOf(end)} ${to}`
    : `WEEK OF ${dateOf(start)} ${from} – ${dateOf(end)} ${to}`
}
