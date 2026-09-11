// ─── Application state ────────────────────────────────────────────────────────
// One shape, one source of truth. Every screen derives from this — nothing is
// hardcoded per-page any more, which is what lets a chat shared on one screen
// move the number on all the others and on the widget.
//
// Dates are ISO 'YYYY-MM-DD' throughout so they sort and compare as strings.
// The demo week is Mon 7 – Sun 13 Sep 2026, anchored on Wed 9 Sep.

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
  /** Where this came from. Written everywhere, branched on nowhere — it exists
   *  so a later screen can say "you added this". 'manual' is the add form;
   *  'timetable' is the calendar importer. */
  origin: 'seed' | 'chat' | 'timetable' | 'group' | 'manual'
  reason?: string
  /** Completed status (e.g. checked off assignment or submitted DDL). */
  done?: boolean
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
// Measured, never edited. The commute panel was cut, but the ten points it
// carries in the energy model were not — a student who spends eighty minutes a
// day on a bus is genuinely more loaded than one who walks, whether or not
// there is a screen for it. energy.ts reads this; nothing writes it.

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

// ─── Track record ─────────────────────────────────────────────────────────────
// A student's own history across finished projects — the thing they would lose
// by leaving, and the only part of Oasis that accumulates.
//
// Read the Steam comparison correctly: Steam shows you your own hours and your
// own achievements. It does not show you what other players thought of you.
// So there is no peer rating here, no leaderboard and no rank. Nothing on this
// type can be filled in by somebody else.

export interface PastProject {
  id: string
  course: string
  title: string
  /** Which semester it belongs to, e.g. 'Sem 2, 2025/26'. */
  term: string
  /** Share of the team's total task weight this student carried, 0-100. */
  weightShare: number
  /** Tasks this student closed. */
  tasksDone: number
  /** Handed in on or before the deadline. */
  onTime: boolean
  /** Tasks in the project altogether, across every member. */
  total: number
}

export interface RecordState {
  /** Off until the student turns it on. Private is the default, not a setting
   *  they have to find — nobody is opted in to being looked at. */
  shared: boolean
  /** Finished projects, newest term first. */
  past: PastProject[]
}

// --- Profile ----------------------------------------------------------------
// The only part of state the student writes about themselves rather than about
// their week. It is private: nothing here is shareable, and the one switch in
// the app that changes what a teammate sees is record.shared, not this.
//
// Both keys below are declared here rather than imported from the art and the
// logic that use them, because this file is the layer underneath both. The Me
// page renders <EmotionBlob emotion={avatar} />, and that line is where the
// compiler checks that AvatarKey still names eight real faces.

/** One of the eight faces in src/features/avatars/EmotionBlob.tsx, or null for
 *  the default photo. */
export type AvatarKey =
  | 'calm' | 'proud' | 'confident' | 'anxious'
  | 'overwhelmed' | 'drained' | 'guilty' | 'frustrated'

/** A habit a student recognises in themselves. Self-declared -- Oasis measures
 *  it, and never assigns it. See src/logic/pattern.ts. */
export type PatternKey = 'cant-say-no' | 'last-minute' | 'carries-team' | 'sleep-debt'

export interface Profile {
  /** Also written onto the 'you' member of every project, because that is the
   *  name teammates read on the shared sheet. store.tsx keeps the two in step. */
  name: string
  /** In their own words. Capped at BIO_MAX characters at the input. */
  bio: string
  avatar: AvatarKey | null
  /** At most MAX_PATTERNS, in the order they were picked. */
  patterns: PatternKey[]
}

/** Long enough for two real sentences, short enough that it stays a self-
 *  description rather than becoming a journal the app would have to hold. */
export const BIO_MAX = 140

// ─── Root ─────────────────────────────────────────────────────────────────────

export interface OasisState {
  today: string
  scenario: ScenarioKey
  /** Who this is. Private, and the only part of state they wrote themselves. */
  profile: Profile
  commitments: Commitment[]
  recovery: Recovery
  requests: IncomingRequest[]
  /** Every group assignment the student is in. A term is never one project, and
   *  the number worth knowing — how much of yourself you have promised across
   *  all of them at once — cannot be stated until they sit in one place. */
  projects: GroupProject[]
  /** Which project the Group page is showing. Resolved through activeProject(),
   *  which falls back to the first project, so a stale id cannot blank a page. */
  activeProjectId: string
  commute: CommuteState
  checkIn: DailyCheckIn | null
  decisions: DecisionLogEntry[]
  record: RecordState
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
