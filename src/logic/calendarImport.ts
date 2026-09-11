import type { EventKind } from '../ds'
import type { OasisState } from '../state/types'
import { addDays } from './dates'
import type { CommitmentDraft } from './compose'
import { DEFAULT_HOURS, MAX_HOURS } from './compose'
import { expandInto, parseIcs } from './ics'
import type { IcsEvent } from './ics'
import { weekStart } from './week'

// ─── A calendar, read as a week ───────────────────────────────────────────────
// The bridge between somebody's real calendar and the seven days Oasis reasons
// about. Three judgements happen here, and all three are shown before anything
// is written, because an import that silently rewrites your energy score is a
// magic trick rather than a tool.
//
//   What kind of thing is this?  A lecture, a deadline and a coffee are not the
//                                same weight, and iCalendar has no field saying
//                                which one you are holding.
//   How much effort is it?       Wall-clock length is the only honest start,
//                                capped so one bad event cannot swamp the week.
//   Have I already got it?       Matches are offered pre-unticked rather than
//                                hidden, so a second import cannot double a week.

export const IMPORT_WINDOW_DAYS = 7

/** An obligation with a due date rather than a place to be. */
const DEADLINE_WORDS =
  /\b(due|deadline|submit|submission|assignment|coursework|report|essay|exam|quiz|test|viva|defen[cs]e)\b/i

/** Recovery. Matched only after the two structural tests. */
const REST_WORDS = /\b(gym|rest|nap|break|walk|run|jog|yoga|swim|sleep|recovery|downtime)\b/i

/** A class is a repeating appointment of ordinary length. Above this, a weekly
 *  four-hour block is a job or a retreat, not a lecture. */
const CLASS_MAX_MINUTES = 240

/** No imported event claims more of the week than this. A 26-hour entry is a
 *  mistake; an all-day conference should not read as a day lost. */
const IMPORT_MAX_HOURS = Math.min(8, MAX_HOURS)

function kindOf(ev: IcsEvent): EventKind {
  if (DEADLINE_WORDS.test(ev.summary)) return 'deadline'
  if (ev.rrule && ev.durationMinutes !== null && ev.durationMinutes <= CLASS_MAX_MINUTES) return 'class'
  if (REST_WORDS.test(ev.summary)) return 'rest'
  return 'commitment'
}

function hoursOf(ev: IcsEvent, kind: EventKind): number {
  if (kind === 'rest') return 0
  // An all-day event states no length, so the per-kind default is the only
  // honest reading. Counting 24 hours would black out the week on one entry.
  if (ev.durationMinutes === null) return DEFAULT_HOURS[kind]
  return Math.min(Math.round((ev.durationMinutes / 60) * 2) / 2, IMPORT_MAX_HOURS)
}

/** '9am', '2:30pm', 'all day'. The store prints this; it never parses it back. */
function timeOf(minutes: number | null): string {
  if (minutes === null) return 'all day'
  const h24 = Math.floor(minutes / 60)
  const mins = minutes % 60
  const suffix = h24 < 12 ? 'am' : 'pm'
  const h12 = h24 % 12 === 0 ? 12 : h24 % 12
  return mins === 0 ? `${h12}${suffix}` : `${h12}:${String(mins).padStart(2, '0')}${suffix}`
}

const normalise = (title: string) => title.toLowerCase().replace(/\s+/g, ' ').trim()

/** One occurrence of one calendar event, ready to be ticked or left. */
export interface ImportCandidate {
  /** Unique within one import. Not the commitment id — that is minted on accept. */
  key: string
  draft: CommitmentDraft
  /** Same day, same title as something already on the week. */
  duplicate: boolean
}

/** The mapping half, shared by the file reader and (later) the Google fetcher. */
export function candidatesFromEvents(events: IcsEvent[], s: OasisState): ImportCandidate[] {
  const from = weekStart(s.today)
  const to = addDays(from, IMPORT_WINDOW_DAYS - 1)
  const existing = new Set(s.commitments.map(c => `${c.date}|${normalise(c.title)}`))

  const out: ImportCandidate[] = []

  for (const ev of events) {
    const kind = kindOf(ev)
    const hours = hoursOf(ev, kind)
    const time = timeOf(ev.startMinutes)

    // Events outside the window are dropped here rather than stored invisibly:
    // weekDays() renders one week, so a commitment in November would persist,
    // be counted by nothing and shown nowhere.
    for (const date of expandInto(ev, from, to)) {
      out.push({
        key: `${ev.uid}@${date}`,
        draft: { title: ev.summary, kind, date, time, hours, origin: 'timetable' },
        duplicate: existing.has(`${date}|${normalise(ev.summary)}`),
      })
    }
  }

  return out.sort((a, b) =>
    a.draft.date === b.draft.date
      ? a.draft.time.localeCompare(b.draft.time)
      : a.draft.date.localeCompare(b.draft.date))
}

/** Everything in the file that lands inside the week Oasis is showing. */
export function candidatesFrom(text: string, s: OasisState): ImportCandidate[] {
  return candidatesFromEvents(parseIcs(text), s)
}
