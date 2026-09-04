// ─── Calendar types & sample week ─────────────────────────────────────────────
// CALENDAR_WEEK is the reference week WeekCalendar falls back to when no `days`
// prop is supplied. It is sample data, not application state.

export type EventKind = 'deadline' | 'class' | 'commitment' | 'rest' | 'alert'
export interface CalEvent { time: string; title: string; kind: EventKind; energy?: number }
export interface CalDay {
  date: number; day: string; month: string
  isToday?: boolean; events: CalEvent[]
}

export const KIND_STYLE: Record<EventKind, { bg: string; text: string; dot: string }> = {
  deadline:   { bg: 'var(--blush)',  text: 'var(--zone-red-text)',   dot: 'var(--bold-orange)' },
  alert:      { bg: 'var(--blush)',  text: 'var(--zone-red-text)',   dot: 'var(--bold-orange)' },
  commitment: { bg: 'var(--butter)', text: 'var(--zone-amber-text)', dot: 'var(--zone-amber-accent)' },
  class:      { bg: 'var(--sky)',    text: 'var(--ink)',             dot: 'var(--bold-blue)' },
  rest:       { bg: 'var(--mint)',   text: 'var(--zone-green-text)', dot: 'var(--bold-green)' },
}

export const CALENDAR_WEEK: CalDay[] = [
  {
    date: 8, day: 'Mon', month: 'Sep',
    events: [
      { time: '9am', title: 'DS A2 — start today', kind: 'commitment', energy: -12 },
      { time: '3pm', title: 'Study group — LinAlg', kind: 'class' },
    ],
  },
  {
    date: 9, day: 'Tue', month: 'Sep',
    events: [
      { time: '2pm', title: 'Web Systems class', kind: 'class' },
      { time: '5pm', title: 'Part-time interview', kind: 'commitment', energy: -4 },
    ],
  },
  {
    date: 10, day: 'Wed', month: 'Sep', isToday: true,
    events: [
      { time: '9am', title: 'LinAlg Quiz', kind: 'deadline', energy: -8 },
      { time: '1pm', title: 'DS lecture', kind: 'class' },
    ],
  },
  {
    date: 11, day: 'Thu', month: 'Sep',
    events: [
      { time: '11am', title: 'Ethics tutorial', kind: 'class' },
      { time: '11:59pm', title: 'Web Systems Lab due', kind: 'deadline', energy: -6 },
    ],
  },
  {
    date: 12, day: 'Fri', month: 'Sep',
    events: [
      { time: '11:59pm', title: 'DS Assignment 2 due', kind: 'deadline', energy: -12 },
      { time: '5pm', title: 'Part-time shift offer', kind: 'alert' },
    ],
  },
  {
    date: 13, day: 'Sat', month: 'Sep',
    events: [
      { time: 'all day', title: 'Ethics reading (deferred)', kind: 'commitment', energy: -4 },
      { time: 'eve', title: 'Rest + recovery', kind: 'rest' },
    ],
  },
  {
    date: 14, day: 'Sun', month: 'Sep',
    events: [
      { time: 'all day', title: 'Rest day', kind: 'rest' },
    ],
  },
]
