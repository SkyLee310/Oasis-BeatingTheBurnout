import { addDays } from './dates'
import { tripDays } from './energy'
import type { Commitment, CommuteMode, OasisState } from '../state/types'

// ─── Commute ──────────────────────────────────────────────────────────────────
// Travel is real, unpaid, invisible work. A student with a 40-minute each-way
// bus ride and four class days spends over five hours a week getting to a
// building — and no timetable anywhere shows that as a cost.
//
// So this module does two things: it turns a pasted timetable into real days on
// the calendar, and it finds the trips that are not worth taking. A day holding
// one hour of class costs the same commute as a day holding six.

export const MODE_LABEL: Record<CommuteMode, string> = {
  bus: 'Bus',
  car: 'Drive',
  walk: 'Walk',
  lrt: 'Train / LRT',
}

const DAY_INDEX: Record<string, number> = {
  MON: 0, TUE: 1, WED: 2, THU: 3, FRI: 4, SAT: 5, SUN: 6,
}

/** One line of a timetable, before it becomes a calendar entry. */
export interface ParsedClass {
  /** 0 = Monday, matching WEEK_START. */
  day: number
  /** Minutes from midnight, so overlaps and lengths are plain arithmetic. */
  start: number
  end: number
  code: string
}

export interface ParseResult {
  classes: ParsedClass[]
  /** Lines that did not look like a class, echoed back so nothing vanishes silently. */
  skipped: string[]
}

/** '0900' or '9:00' or '9am' → minutes from midnight. */
function toMinutes(raw: string): number | null {
  const t = raw.trim().toLowerCase()

  const ampm = /^(\d{1,2})(?::(\d{2}))?\s*(am|pm)$/.exec(t)
  if (ampm) {
    let h = Number(ampm[1]) % 12
    if (ampm[3] === 'pm') h += 12
    return h * 60 + Number(ampm[2] ?? 0)
  }

  const compact = /^(\d{3,4})$/.exec(t)
  if (compact) {
    const n = compact[1].padStart(4, '0')
    return Number(n.slice(0, 2)) * 60 + Number(n.slice(2))
  }

  const colon = /^(\d{1,2}):(\d{2})$/.exec(t)
  if (colon) return Number(colon[1]) * 60 + Number(colon[2])

  return null
}

/** Minutes back to the display strings the rest of the app already uses. */
export function clockOf(minutes: number): string {
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  const suffix = h < 12 ? 'am' : 'pm'
  const h12 = h % 12 === 0 ? 12 : h % 12
  return m === 0 ? `${h12}${suffix}` : `${h12}:${String(m).padStart(2, '0')}${suffix}`
}

/**
 * Parse a pasted timetable. Accepts the shape every university portal exports in
 * some variation — `MON 0900-1100 DES2201` — plus the obvious human variants
 * (`Mon 9am-11am DES2201`, commas, extra columns). Anything it cannot read comes
 * back in `skipped` rather than being dropped, because a student needs to know
 * which line did not make it.
 */
export function parseTimetable(text: string): ParseResult {
  const classes: ParsedClass[] = []
  const skipped: string[] = []

  for (const raw of text.split('\n')) {
    const line = raw.trim()
    if (line === '') continue

    const dayMatch = /^([A-Za-z]{3})/.exec(line)
    const day = dayMatch ? DAY_INDEX[dayMatch[1].toUpperCase()] : undefined

    const timeMatch = /(\d{1,2}(?::\d{2})?\s*(?:am|pm)?)\s*(?:-|–|to)\s*(\d{1,2}(?::\d{2})?\s*(?:am|pm)?)/i
      .exec(line)

    const start = timeMatch ? toMinutes(timeMatch[1]) : null
    const end = timeMatch ? toMinutes(timeMatch[2]) : null

    // The course code: the last token carrying both letters and digits.
    const code = line
      .split(/[\s,]+/)
      .filter(tok => /[A-Za-z]/.test(tok) && /\d/.test(tok) && !/[-–:]/.test(tok))
      .pop()

    if (day === undefined || start === null || end === null || end <= start) {
      skipped.push(line)
      continue
    }

    classes.push({ day, start, end, code: code ?? 'Class' })
  }

  classes.sort((a, b) => (a.day === b.day ? a.start - b.start : a.day - b.day))
  return { classes, skipped }
}

/**
 * Parsed lines → commitments on the real week. Ids are derived from the content
 * so importing the same timetable twice cannot produce two of everything, and so
 * the reducer stays free of crypto.randomUUID().
 */
export function toCommitments(classes: ParsedClass[], weekStart: string): Commitment[] {
  return classes.map(c => ({
    id: `tt-${c.day}-${c.start}-${c.code.toLowerCase()}`,
    title: c.code,
    kind: 'class' as const,
    date: addDays(weekStart, c.day),
    time: clockOf(c.start),
    hours: (c.end - c.start) / 60,
    movable: false,
    origin: 'timetable' as const,
  }))
}

/** Three timetables a judge can load in one tap, covering the shapes we parse. */
export const SAMPLE_TIMETABLES: { name: string; text: string }[] = [
  {
    name: 'Four days on campus',
    text: [
      'MON 0900-1100 DES2201',
      'TUE 1400-1500 CSC1024',
      'WED 0900-1200 DES2201',
      'WED 1400-1600 MTH1114',
      'FRI 1000-1300 CSC2103',
    ].join('\n'),
  },
  {
    name: 'One long day',
    text: [
      'Mon 9am-12pm BIS2214',
      'Mon 1pm-4pm BIS2214',
      'Thu 10am-11am ENG1043',
    ].join('\n'),
  },
  {
    name: 'Scattered week',
    text: [
      'MON 1100-1200 PSY1013',
      'TUE 0900-1000 PSY1013',
      'WED 1500-1600 SOC2011',
      'THU 0800-0900 PSY2043',
      'FRI 1600-1700 SOC2011',
    ].join('\n'),
  },
]

// ─── Trips worth skipping ─────────────────────────────────────────────────────

/** One day whose travel outweighs what is actually on campus that day. */
export interface MergeSuggestion {
  date: string
  /** Hours of class that day. */
  classHours: number
  /** Hours on the road for it — both directions. */
  travelHours: number
  /** Where the classes could go instead: the fullest other campus day. */
  moveTo: string | null
  /** What the day's classes are called, for the sentence. */
  titles: string[]
}

/** Below this, the trip costs more than the teaching. */
const THIN_DAY_HOURS = 2

/**
 * Days where the travel is out of proportion to the class. The suggestion is
 * always to *merge* — move the thin day's classes onto a day you are already
 * travelling for — never to skip class, which is not a thing an app should be
 * proposing to a student.
 */
export function mergeSuggestions(s: OasisState): MergeSuggestion[] {
  const days = tripDays(s)
  const travelHours = (s.commute.minutesEachWay * 2) / 60

  const hoursOn = (date: string) =>
    s.commitments
      .filter(c => c.kind === 'class' && c.date === date)
      .reduce((sum, c) => sum + c.hours, 0)

  const heaviest = [...days].sort((a, b) => hoursOn(b) - hoursOn(a))[0] ?? null

  return days
    .filter(date => {
      const hours = hoursOn(date)
      return hours > 0 && hours <= THIN_DAY_HOURS && travelHours >= hours
    })
    .map(date => ({
      date,
      classHours: hoursOn(date),
      travelHours,
      moveTo: heaviest && heaviest !== date ? heaviest : null,
      titles: s.commitments
        .filter(c => c.kind === 'class' && c.date === date)
        .map(c => c.title),
    }))
}
