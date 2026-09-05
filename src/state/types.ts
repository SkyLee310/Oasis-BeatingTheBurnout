// ─── Application state ────────────────────────────────────────────────────────
// One shape, one source of truth. Every screen derives from this — nothing is
// hardcoded per-page any more, which is what lets a chat shared on one screen
// move the number on all the others and on the widget.
//
// Dates are ISO 'YYYY-MM-DD' throughout so they sort and compare as strings.
// The demo week is Mon 8 – Sun 14 Sep 2026, anchored on Wed 10 Sep.

import type { EventKind, ZoneKey } from '../ds'

export type Page =
  | 'dashboard' | 'load' | 'group' | 'recovery' | 'band' | 'how'

/** Demo scenarios. The switcher restages the whole app by swapping the seed. */
export type ScenarioKey = 'week1' | 'clear' | 'nearCapacity' | 'redZone'

// ─── Commitments ──────────────────────────────────────────────────────────────

/** Anything that costs time or attention. `kind` reuses the DS calendar kinds
 *  so a commitment list renders through WeekCalendar without translation. */
export interface Commitment {
  id: string
  title: string
  kind: EventKind
  date: string
  /** Display time, e.g. '9am', '11:59pm', 'all day'. */
  time: string
  /** Estimated effort in hours. Rest blocks are 0. */
  hours: number
  /** Whether smart deferral is allowed to move it. */
  movable: boolean
  origin: 'seed' | 'chat' | 'timetable' | 'group'
  reason?: string
}

// ─── Recovery signals ─────────────────────────────────────────────────────────

export interface Recovery {
  /** Last seven nights, Mon-first. */
  sleepHours: number[]
  restingHr: number
  /** This person's own resting baseline, not a population average. */
  hrBaseline: number
}

// ─── Incoming requests (shared from a chat) ───────────────────────────────────

export type RequestKind = 'group-lead' | 'shift' | 'social' | 'task'

/** What parseChat() pulls out of a pasted conversation. */
export interface ParsedRequest {
  title: string
  asker: string
  kind: RequestKind
  hoursPerWeek: number
  /** ISO date the work would land on, when the chat names one. */
  deadline: string | null
  urgent: boolean
}

export interface IncomingRequest {
  id: string
  raw: string
  parsed: ParsedRequest
  receivedAt: string
  status: 'pending' | 'accepted' | 'declined' | 'negotiated'
}

// ─── Group project ────────────────────────────────────────────────────────────

export type MemberStatus = 'you' | 'joined' | 'invited' | 'none'

export interface Member {
  id: string
  name: string
  status: MemberStatus
}

export interface ProjectTask {
  id: string
  title: string
  /** Effort weight 1–5. Fairness is measured in weight, not task count. */
  weight: number
  assignee: string | null
  done: boolean
}

export interface GroupProject {
  id: string
  name: string
  course: string
  due: string
  /** Invite code — the app opens at ?join=<code>. */
  code: string
  members: Member[]
  tasks: ProjectTask[]
}

// ─── Commute ──────────────────────────────────────────────────────────────────

export type CommuteMode = 'bus' | 'car' | 'walk' | 'lrt'

export interface CommuteState {
  campus: string
  mode: CommuteMode
  /** Door to door, one direction. */
  minutesEachWay: number
  /** ISO dates whose trip the user merged away. */
  skippedDays: string[]
}

// ─── Daily check ──────────────────────────────────────────────────────────────

/** Three answers, ten seconds. 1 = worst, 3 = best. */
export interface DailyCheckIn {
  date: string
  slept: 1 | 2 | 3
  mood: 1 | 2 | 3
  load: 1 | 2 | 3
}

// ─── Decision log ─────────────────────────────────────────────────────────────

export interface DecisionLogEntry {
  id: string
  title: string
  outcome: 'accepted' | 'declined' | 'negotiated'
  /** Energy points kept by saying no. 0 when accepted. */
  energySaved: number
  at: string
}

// ─── Root ─────────────────────────────────────────────────────────────────────

export interface OasisState {
  today: string
  scenario: ScenarioKey
  commitments: Commitment[]
  recovery: Recovery
  requests: IncomingRequest[]
  project: GroupProject
  commute: CommuteState
  checkIn: DailyCheckIn | null
  decisions: DecisionLogEntry[]
}

/** A single weighted input to the energy score, ready to render on the
 *  "Where the numbers come from" screen. */
export interface EnergyFactor {
  key: string
  label: string
  /** Share of the total score, in points. */
  weight: number
  /** 0–1, how loaded this factor is right now. */
  ratio: number
  /** weight * ratio — what it actually subtracted. */
  cost: number
  /** A short figure for a tile face, e.g. "33h" or "78 bpm". */
  value: string
  /** A full sentence a student can check against their own week. */
  detail: string
  zone: ZoneKey
}
