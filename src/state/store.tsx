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
  Commitment, DailyCheckIn, IncomingRequest,
  MemberStatus, OasisState, ScenarioKey,
} from './types'

const STORAGE_KEY = 'oasis.v1'
/** Bump when a change makes yesterday's stored state wrong rather than merely
 *  incomplete — hydrate() then discards it and reseeds. 2: the demo week moved
 *  onto real 2026 dates, so every stored `date` was off by a day. */
const SCHEMA = 2

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
  | { type: 'setMemberStatus'; memberId: string; status: MemberStatus }
  | { type: 'assignTask'; taskId: string; memberId: string | null }
  | { type: 'toggleTaskDone'; taskId: string }
  | { type: 'toggleCommitmentDone'; id: string }

/** What each sleep answer means in hours. Rough on purpose — a student rating
 *  last night out of three is not reporting to two decimal places. */
const REPORTED_SLEEP: Record<1 | 2 | 3, number> = { 1: 4.5, 2: 6, 3: 7.5 }

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

    case 'setMemberStatus':
      return {
        ...s,
        project: {
          ...s.project,
          members: s.project.members.map(m =>
            m.id === a.memberId ? { ...m, status: a.status } : m),
        },
      }

    case 'assignTask':
      return {
        ...s,
        project: {
          ...s.project,
          tasks: s.project.tasks.map(t =>
            t.id === a.taskId ? { ...t, assignee: a.memberId } : t),
        },
      }

    case 'toggleTaskDone':
      return {
        ...s,
        project: {
          ...s.project,
          tasks: s.project.tasks.map(t =>
            t.id === a.taskId ? { ...t, done: !t.done } : t),
        },
      }

    case 'toggleCommitmentDone':
      return {
        ...s,
        commitments: s.commitments.map(c =>
          c.id === a.id ? { ...c, done: !c.done } : c),
      }
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
