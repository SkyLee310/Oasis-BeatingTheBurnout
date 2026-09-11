// ─── Store ────────────────────────────────────────────────────────────────────
// React context + useReducer, persisted to localStorage. No dependency, because
// the whole app is one user's one week — this is not a data-fetching problem.
//
// The point of a single store: a chat declined on the Home screen has to move
// the number on the schedule, on the group page and in the inbox at the same
// time. Every screen reads from here and derives; nothing holds its own copy.

import {
  createContext, useContext, useEffect, useMemo, useReducer,
  type Dispatch, type ReactNode,
} from 'react'

import { energyFactors, energyFor, tempFor, zoneFor } from '../logic/energy'
import { DEFAULT_SCENARIO, seedFor } from './seed'
import type {
  Commitment, DailyCheckIn, GroupProject, IncomingRequest,
  MemberStatus, OasisState, ProjectTask, ScenarioKey,
} from './types'

const STORAGE_KEY = 'oasis.v1'
/** Bump when a change makes yesterday's stored state wrong rather than merely
 *  incomplete — hydrate() then discards it and reseeds. 2: the demo week moved
 *  onto real 2026 dates, so every stored `date` was off by a day. 3: the track
 *  record arrived, and a stored state from before it has no `record` at all —
 *  spreading it over a fresh seed would keep the seeded history but silently
 *  reset the share toggle, which is the one thing on it a user chose. 4: one
 *  group project became a list of them, so a stored state carries a `project`
 *  key the app no longer reads and lacks the `projects` it now needs. */
const SCHEMA = 4

// ─── Actions ──────────────────────────────────────────────────────────────────

export type Action =
  | { type: 'reset' }
  | { type: 'setScenario'; scenario: ScenarioKey }
  | { type: 'addCommitments'; commitments: Commitment[] }
  | { type: 'removeCommitment'; id: string }
  | { type: 'deferCommitment'; id: string; toDate: string }
  | { type: 'addRequest'; request: IncomingRequest }
  | {
      type: 'resolveRequest'
      id: string
      outcome: 'accepted' | 'declined' | 'negotiated'
      /** Written to the schedule when the request is accepted or negotiated down. */
      commitments?: Commitment[]
      /** Points kept by not taking it on — from projectEnergy(), 0 when accepted. */
      energySaved: number
    }
  | { type: 'checkIn'; checkIn: DailyCheckIn }
  | { type: 'selectProject'; projectId: string }
  // Every project action names its project. It would be shorter to let the
  // reducer assume the open one, but a request answered from the inbox can
  // claim a task in a project the student is not looking at — and a reducer
  // that reads activeProjectId is a reducer whose result depends on which
  // screen was on top, which is exactly what the pure-replay demo cannot have.
  | { type: 'setMemberStatus'; projectId: string; memberId: string; status: MemberStatus }
  | { type: 'assignTask'; projectId: string; taskId: string; memberId: string | null }
  | { type: 'toggleTaskDone'; projectId: string; taskId: string }
  | { type: 'addTask'; projectId: string; task: ProjectTask }
  | { type: 'toggleCommitmentDone'; id: string }
  | { type: 'toggleRecordShare' }

/** What each sleep answer means in hours. Rough on purpose — a student rating
 *  last night out of three is not reporting to two decimal places. */
const REPORTED_SLEEP: Record<1 | 2 | 3, number> = { 1: 4.5, 2: 6, 3: 7.5 }

/** Change one project, leave the rest alone. Every project action goes through
 *  here so the list-of-projects shape stays an implementation detail of the
 *  store rather than something three reducer cases each re-derive. */
function inProject(
  s: OasisState,
  projectId: string,
  change: (p: GroupProject) => GroupProject,
): OasisState {
  return { ...s, projects: s.projects.map(p => (p.id === projectId ? change(p) : p)) }
}

// ─── Reducer ──────────────────────────────────────────────────────────────────
// Pure: no Date.now(), no crypto.randomUUID(). Ids and timestamps are derived
// from what is already in the action or in state, so the same actions always
// replay to the same week — which is what makes the demo repeatable on camera.

export function reducer(s: OasisState, a: Action): OasisState {
  switch (a.type) {
    case 'reset':
      return seedFor(s.scenario)

    case 'setScenario':
      return seedFor(a.scenario)

    case 'addCommitments':
      return { ...s, commitments: [...s.commitments, ...a.commitments] }

    case 'removeCommitment':
      return { ...s, commitments: s.commitments.filter(c => c.id !== a.id) }

    case 'deferCommitment':
      return {
        ...s,
        commitments: s.commitments.map(c =>
          c.id === a.id && c.movable ? { ...c, date: a.toDate } : c),
      }

    case 'addRequest':
      return { ...s, requests: [a.request, ...s.requests] }

    case 'resolveRequest': {
      const req = s.requests.find(r => r.id === a.id)
      if (!req) return s
      return {
        ...s,
        requests: s.requests.map(r =>
          r.id === a.id ? { ...r, status: a.outcome } : r),
        commitments: [...s.commitments, ...(a.commitments ?? [])],
        decisions: [
          {
            id: `d-${a.id}`,
            title: req.parsed.title,
            outcome: a.outcome,
            energySaved: a.energySaved,
            at: s.today,
          },
          ...s.decisions.filter(d => d.id !== `d-${a.id}`),
        ],
      }
    }

    case 'checkIn': {
      // A check-in that does not move anything is a survey, not a feature. The
      // sleep answer overwrites last night's figure — the same number the sleep
      // factor already reads — so the score updates for a reason the user can
      // point at rather than through a hidden sixth term.
      const reported = REPORTED_SLEEP[a.checkIn.slept]
      const sleepHours = s.recovery.sleepHours.length === 0
        ? [reported]
        : [...s.recovery.sleepHours.slice(0, -1), reported]

      return { ...s, checkIn: a.checkIn, recovery: { ...s.recovery, sleepHours } }
    }

    case 'selectProject':
      return { ...s, activeProjectId: a.projectId }

    case 'setMemberStatus':
      return inProject(s, a.projectId, p => ({
        ...p,
        members: p.members.map(m =>
          m.id === a.memberId ? { ...m, status: a.status } : m),
      }))

    case 'assignTask':
      return inProject(s, a.projectId, p => ({
        ...p,
        tasks: p.tasks.map(t =>
          t.id === a.taskId ? { ...t, assignee: a.memberId } : t),
      }))

    case 'toggleTaskDone':
      return inProject(s, a.projectId, p => ({
        ...p,
        tasks: p.tasks.map(t =>
          t.id === a.taskId ? { ...t, done: !t.done } : t),
      }))

    case 'addTask':
      return inProject(s, a.projectId, p => ({ ...p, tasks: [...p.tasks, a.task] }))

    case 'toggleCommitmentDone':
      return {
        ...s,
        commitments: s.commitments.map(c =>
          c.id === a.id ? { ...c, done: !c.done } : c),
      }

    // The only switch in the app that changes what another person can see.
    case 'toggleRecordShare':
      return { ...s, record: { ...s.record, shared: !s.record.shared } }
  }
}

// ─── Persistence ──────────────────────────────────────────────────────────────

/**
 * Stored state is spread *over* a fresh seed rather than used directly, so a
 * build that adds a field still opens cleanly on a browser holding yesterday's
 * shape. Anything unreadable falls back to the seed — never to a blank screen.
 */
function hydrate(scenario: ScenarioKey): OasisState {
  const fresh = seedFor(scenario)
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return fresh
    const parsed = JSON.parse(raw) as { v?: number; state?: Partial<OasisState> }
    if (parsed.v !== SCHEMA || !parsed.state || !Array.isArray(parsed.state.commitments)) {
      return fresh
    }
    return { ...seedFor(parsed.state.scenario ?? scenario), ...parsed.state }
  } catch {
    return fresh
  }
}

function persist(state: OasisState) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ v: SCHEMA, state }))
  } catch {
    // Private browsing, or storage full. The app works fine without it.
  }
}

// ─── Context ──────────────────────────────────────────────────────────────────

const StateCtx = createContext<OasisState | null>(null)
const DispatchCtx = createContext<Dispatch<Action> | null>(null)

export function OasisProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, DEFAULT_SCENARIO, hydrate)

  useEffect(() => { persist(state) }, [state])

  return (
    <StateCtx.Provider value={state}>
      <DispatchCtx.Provider value={dispatch}>{children}</DispatchCtx.Provider>
    </StateCtx.Provider>
  )
}

export function useOasis(): OasisState {
  const s = useContext(StateCtx)
  if (!s) throw new Error('useOasis must be used inside <OasisProvider>')
  return s
}

export function useDispatch(): Dispatch<Action> {
  const d = useContext(DispatchCtx)
  if (!d) throw new Error('useDispatch must be used inside <OasisProvider>')
  return d
}

/**
 * The derived view every screen actually wants. Memoised on the state object,
 * so the five factors are computed once per change rather than once per screen.
 */
export function useEnergy() {
  const s = useOasis()
  return useMemo(() => {
    const energy = energyFor(s)
    return { energy, zone: zoneFor(energy), temp: tempFor(energy), factors: energyFactors(s) }
  }, [s])
}
