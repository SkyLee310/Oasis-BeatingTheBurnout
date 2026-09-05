// ─── Seed data ────────────────────────────────────────────────────────────────
// The demo persona: Maya, Wednesday 9 Sep 2026, mid-semester.
//
// The week itself is derived from CALENDAR_WEEK in src/ds/calendar.ts rather
// than retyped, so the published DS package keeps one copy of those titles and
// times. What the DS cannot know — effort in hours, what is movable, why — is
// attached here by title.
//
// CALENDAR_WEEK's own `date`/`day` labels are NOT reused: they are a 2025 week,
// and this app runs on a real calendar. Only the position in the list is taken —
// index 0 is Monday — and the ISO date is derived from WEEK_START, so every
// weekday the app prints is the weekday that date actually falls on.

import { CALENDAR_WEEK } from '../ds'
import { addDays } from '../logic/dates'
import type {
  Commitment, CommuteState, GroupProject, IncomingRequest,
  OasisState, Recovery, ScenarioKey,
} from './types'

/** Monday of the demo week — which is also the CodeNection prototype week. */
export const WEEK_START = '2026-09-07'
export const TODAY = addDays(WEEK_START, 2)   // Wednesday 9 Sep 2026
const FRIDAY = addDays(WEEK_START, 4)
const SATURDAY = addDays(WEEK_START, 5)

// ─── The week ─────────────────────────────────────────────────────────────────

/** Effort in hours. Anything unlisted costs nothing: rest blocks, and the shift
 *  offer, which is a request until it is accepted. */
const SEED_HOURS: Record<string, number> = {
  'DS A2 — start today': 8,
  'Study group — LinAlg': 2,
  'Web Systems class': 2,
  'Part-time interview': 1.5,
  'LinAlg Quiz': 5,
  'DS lecture': 2,
  'Ethics tutorial': 2,
  'Web Systems Lab due': 2.5,
  'DS Assignment 2 due': 6,
  'Ethics reading (deferred)': 2,
}

/** Only these can be moved by smart deferral. Exams and hard submission
 *  deadlines are not negotiable and must never be offered up. */
const SEED_MOVABLE = new Set(['Ethics reading (deferred)'])

const SEED_REASON: Record<string, string> = {
  'LinAlg Quiz': 'Non-negotiable exam deadline.',
  'DS Assignment 2 due': 'High-weight project — start immediately.',
  'Web Systems Lab due': 'Estimated 2.5h effort.',
  'Ethics reading (deferred)':
    'Submission window allows a 2-day deferral without penalty.',
}

function weekFromCalendar(): Commitment[] {
  return CALENDAR_WEEK.flatMap((day, d) =>
    day.events.map((ev, i) => ({
      id: `seed-${d}-${i}`,
      title: ev.title,
      kind: ev.kind,
      date: addDays(WEEK_START, d),
      time: ev.time,
      hours: SEED_HOURS[ev.title] ?? 0,
      movable: SEED_MOVABLE.has(ev.title),
      origin: 'seed' as const,
      reason: SEED_REASON[ev.title],
    })),
  )
}

// ─── Signals ──────────────────────────────────────────────────────────────────

/** Seven nights, Mon-first. Mean is 5.4h — the figure the recovery copy quotes. */
const RECOVERY: Recovery = {
  sleepHours: [5.1, 5.8, 4.9, 5.4, 6.2, 5.0, 5.4],
  restingHr: 78,
  hrBaseline: 72,
}

const COMMUTE: CommuteState = {
  campus: 'Main campus',
  mode: 'bus',
  minutesEachWay: 40,
  skippedDays: [],
}

// ─── The group assignment ─────────────────────────────────────────────────────
// Deliberately lopsided: Maya holds two of the three heaviest tasks, which is
// what the fairness engine is there to surface.

const PROJECT: GroupProject = {
  id: 'p-ds-a2',
  name: 'DS Assignment 2 — group report',
  course: 'Data Structures',
  due: FRIDAY,
  code: '8FQ2',
  members: [
    { id: 'you', name: 'Maya', status: 'you' },
    { id: 'm2', name: 'Aisyah', status: 'joined' },
    { id: 'm3', name: 'Wei Jun', status: 'invited' },
    { id: 'm4', name: 'Danish', status: 'none' },
  ],
  tasks: [
    { id: 't1', title: 'Data cleaning + preprocessing', weight: 4, assignee: 'you', done: true },
    { id: 't2', title: 'Model implementation', weight: 5, assignee: 'you', done: false },
    { id: 't3', title: 'Literature review', weight: 2, assignee: 'm2', done: true },
    { id: 't4', title: 'Slide deck', weight: 2, assignee: 'm2', done: false },
    { id: 't5', title: 'Report write-up', weight: 4, assignee: null, done: false },
    { id: 't6', title: 'Demo video', weight: 3, assignee: null, done: false },
  ],
}

/** The Friday alert on the calendar, as it actually arrived: in a chat. */
const SHIFT_REQUEST: IncomingRequest = {
  id: 'req-shift',
  raw: [
    'Farah (Manager): hey Maya, can you cover Friday evening this week?',
    'Farah (Manager): 5pm-11pm, and probably Saturday morning too',
    'Farah (Manager): need to know by tonight sorry 🙏',
  ].join('\n'),
  parsed: {
    title: 'Cover Friday evening shift',
    asker: 'Farah',
    kind: 'shift',
    hoursPerWeek: 6,
    deadline: FRIDAY,
    urgent: true,
  },
  receivedAt: TODAY,
  status: 'pending',
}

// ─── Scenarios ────────────────────────────────────────────────────────────────

function base(scenario: ScenarioKey): OasisState {
  return {
    today: TODAY,
    scenario,
    commitments: weekFromCalendar(),
    recovery: { ...RECOVERY, sleepHours: [...RECOVERY.sleepHours] },
    requests: [SHIFT_REQUEST],
    project: {
      ...PROJECT,
      members: PROJECT.members.map(m => ({ ...m })),
      tasks: PROJECT.tasks.map(t => ({ ...t })),
    },
    commute: { ...COMMUTE, skippedDays: [] },
    checkIn: null,
    decisions: [],
  }
}

/**
 * Every scenario is the same week, dialled up or down — so the demo switcher
 * restages the whole app without any screen knowing a scenario exists.
 */
export function seedFor(scenario: ScenarioKey): OasisState {
  const s = base(scenario)

  switch (scenario) {
    // Nothing entered yet. This is what a first-time user actually sees.
    case 'week1':
      return {
        ...s,
        commitments: [],
        requests: [],
        project: { ...s.project, tasks: [], members: s.project.members.slice(0, 1) },
        recovery: { ...s.recovery, sleepHours: [7.2, 7.5, 7.1, 7.4, 7.6, 8.0, 7.8], restingHr: 72 },
      }

    // Deadlines shipped, sleep recovered. The state Oasis is steering toward.
    case 'clear':
      return {
        ...s,
        commitments: s.commitments.filter(c => c.kind === 'class' || c.kind === 'rest'),
        requests: [],
        recovery: { ...s.recovery, sleepHours: [7.4, 7.1, 7.6, 7.2, 7.5, 8.1, 7.9], restingHr: 73 },
      }

    // The shift was accepted and the week never recovered.
    case 'redZone':
      return {
        ...s,
        commitments: [
          ...s.commitments,
          {
            id: 'shift-fri', title: 'Part-time shift (accepted)', kind: 'commitment',
            date: FRIDAY, time: '5pm', hours: 6, movable: false,
            origin: 'chat', reason: 'Accepted from a chat on Wed 9 Sep.',
          },
          {
            id: 'shift-sat', title: 'Part-time shift (accepted)', kind: 'commitment',
            date: SATURDAY, time: '9am', hours: 5, movable: false,
            origin: 'chat', reason: 'Accepted from a chat on Wed 9 Sep.',
          },
        ],
        requests: [{ ...SHIFT_REQUEST, status: 'accepted' }],
        recovery: { ...s.recovery, sleepHours: [5.1, 5.8, 4.9, 4.2, 4.4, 3.9, 4.6], restingHr: 88 },
      }

    // The default: mid-semester, holding, one request still open.
    case 'nearCapacity':
      return s
  }
}

export const DEFAULT_SCENARIO: ScenarioKey = 'nearCapacity'
