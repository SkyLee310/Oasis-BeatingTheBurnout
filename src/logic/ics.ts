// ─── iCalendar, the part a student's week needs ───────────────────────────────
// RFC 5545 is a large specification; this reads a small, deliberate corner of it
// — enough to turn the file Google, Outlook, Apple or a university timetable
// hands you into a list of events with local dates.
//
// It imports nothing, on purpose: every other module in logic/ reaches for the
// store's types, and keeping this one sealed means it can be run and checked
// on its own.
//
// Two things bite everyone who writes one of these:
//   1. Folding. Lines over 75 octets are split and continued with a leading
//      space or tab. Lecture titles fold constantly. Unfold BEFORE splitting
//      into lines or every long SUMMARY arrives truncated.
//   2. Recurrence. A weekly lecture is ONE event with an RRULE, not thirteen
//      events. Ignoring it reads a full timetable as almost empty. See
//      expandInto() in the next task.

export interface IcsEvent {
  uid: string
  summary: string
  /** Local date of the first occurrence, ISO 'YYYY-MM-DD'. */
  startDate: string
  /** Minutes past local midnight, or null when all-day. */
  startMinutes: number | null
  /** Length in minutes, or null when all-day. */
  durationMinutes: number | null
  location: string
  /** Raw rule, e.g. 'FREQ=WEEKLY;BYDAY=MO,WE;UNTIL=20261207T155959Z'. */
  rrule: string | null
  /** Local dates the series explicitly skips. */
  exdates: string[]
}

/** One `NAME;PARAM=VALUE:VALUE` line, taken apart. */
interface Prop {
  name: string
  params: Record<string, string>
  value: string
}

const pad = (n: number) => String(n).padStart(2, '0')
const isoOf = (y: number, m: number, d: number) => `${y}-${pad(m)}-${pad(d)}`

/** Undo folding, then split. Must happen in this order. */
function unfoldLines(text: string): string[] {
  return text
    .replace(/\r\n[ \t]/g, '')
    .replace(/\n[ \t]/g, '')
    .split(/\r?\n/)
    .filter(l => l.trim() !== '')
}

/** TEXT values escape these four. Backslash last. */
function unescapeText(v: string): string {
  return v
    .replace(/\\[nN]/g, '\n')
    .replace(/\\,/g, ',')
    .replace(/\\;/g, ';')
    .replace(/\\\\/g, '\\')
}

/** Value starts at the first colon outside a quoted parameter — a quoted TZID
 *  can itself contain one. */
function parseProp(line: string): Prop | null {
  let quoted = false
  let colon = -1
  for (let i = 0; i < line.length; i++) {
    const ch = line[i]
    if (ch === '"') quoted = !quoted
    else if (ch === ':' && !quoted) { colon = i; break }
  }
  if (colon === -1) return null

  const head = line.slice(0, colon)
  const value = line.slice(colon + 1)

  const parts: string[] = []
  let buf = ''
  quoted = false
  for (const ch of head) {
    if (ch === '"') { quoted = !quoted; continue }
    if (ch === ';' && !quoted) { parts.push(buf); buf = '' } else buf += ch
  }
  parts.push(buf)

  const params: Record<string, string> = {}
  for (const p of parts.slice(1)) {
    const eq = p.indexOf('=')
    if (eq > 0) params[p.slice(0, eq).toUpperCase()] = p.slice(eq + 1)
  }

  return { name: parts[0].toUpperCase(), params, value }
}

interface Moment { date: string; minutes: number | null }

/**
 * One date-time in any of the three exported forms:
 *
 *   VALUE=DATE:20260911                     all-day
 *   20260908T110000Z                        an instant in UTC
 *   TZID=Asia/Kuala_Lumpur:20260910T140000  wall clock in a named zone
 *
 * UTC converts through the viewer's own zone; TZID is taken as written, which is
 * right whenever the viewer is in the calendar's zone — a student importing
 * their own timetable always is. A tzdata table would cost more than the week
 * view can show: nothing downstream does arithmetic on the time, it prints it.
 */
function readMoment(p: Prop): Moment | null {
  const v = p.value.trim()

  const dateOnly = /^(\d{4})(\d{2})(\d{2})$/.exec(v)
  if (dateOnly) return { date: isoOf(+dateOnly[1], +dateOnly[2], +dateOnly[3]), minutes: null }

  const stamp = /^(\d{4})(\d{2})(\d{2})T(\d{2})(\d{2})(\d{2})(Z)?$/.exec(v)
  if (!stamp) return null

  const [, y, mo, d, h, mi, , z] = stamp

  if (z) {
    const at = new Date(Date.UTC(+y, +mo - 1, +d, +h, +mi, 0))
    return {
      date: isoOf(at.getFullYear(), at.getMonth() + 1, at.getDate()),
      minutes: at.getHours() * 60 + at.getMinutes(),
    }
  }

  return { date: isoOf(+y, +mo, +d), minutes: +h * 60 + +mi }
}

/** 'PT1H30M' / 'P1D' → minutes. */
function readDuration(v: string): number | null {
  const m = /^P(?:(\d+)W)?(?:(\d+)D)?(?:T(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?)?$/.exec(v.trim())
  if (!m) return null
  const [, w, d, h, mi] = m
  return (+(w ?? 0) * 7 * 24 * 60) + (+(d ?? 0) * 24 * 60) + (+(h ?? 0) * 60) + +(mi ?? 0)
}

/** Whole days between two ISO dates. Both pinned to midday, clear of DST. */
function daysBetween(from: string, to: string): number {
  const a = new Date(`${from}T12:00:00`).getTime()
  const b = new Date(`${to}T12:00:00`).getTime()
  return Math.round((b - a) / 86400000)
}

/** Every VEVENT. Events without a usable DTSTART are dropped rather than
 *  guessed at — an entry with no start is not a thing in a week. */
export function parseIcs(text: string): IcsEvent[] {
  const out: IcsEvent[] = []
  let inEvent = false
  let props: Prop[] = []

  for (const line of unfoldLines(text)) {
    const upper = line.toUpperCase()
    if (upper === 'BEGIN:VEVENT') { inEvent = true; props = []; continue }
    if (upper === 'END:VEVENT') {
      inEvent = false
      const ev = buildEvent(props)
      if (ev) out.push(ev)
      continue
    }
    if (inEvent) {
      const p = parseProp(line)
      if (p) props.push(p)
    }
  }

  return out
}

function buildEvent(props: Prop[]): IcsEvent | null {
  const find = (name: string) => props.find(p => p.name === name)

  const dtstartProp = find('DTSTART')
  if (!dtstartProp) return null
  const start = readMoment(dtstartProp)
  if (!start) return null

  const allDay = start.minutes === null

  let durationMinutes: number | null = null
  if (start.minutes !== null) {
    const endProp = find('DTEND')
    const end = endProp ? readMoment(endProp) : null

    if (end && end.minutes !== null) {
      durationMinutes = daysBetween(start.date, end.date) * 24 * 60 + (end.minutes - start.minutes)
    } else {
      const durProp = find('DURATION')
      durationMinutes = durProp ? readDuration(durProp.value) : null
    }

    // A zero or negative span means the file disagrees with itself. An hour is
    // the honest default: long enough to notice, short enough not to distort.
    if (durationMinutes === null || durationMinutes <= 0) durationMinutes = 60
  }

  const exdates: string[] = []
  for (const p of props) {
    if (p.name !== 'EXDATE') continue
    // EXDATE may carry several comma-separated values on one line.
    for (const one of p.value.split(',')) {
      const m = readMoment({ ...p, value: one })
      if (m) exdates.push(m.date)
    }
  }

  return {
    uid: find('UID')?.value.trim() ?? `${start.date}-${find('SUMMARY')?.value ?? 'untitled'}`,
    summary: unescapeText(find('SUMMARY')?.value ?? '').trim() || 'Untitled event',
    startDate: start.date,
    startMinutes: start.minutes,
    durationMinutes,
    location: unescapeText(find('LOCATION')?.value ?? '').trim(),
    rrule: find('RRULE')?.value.trim() ?? null,
    exdates,
  }
}
