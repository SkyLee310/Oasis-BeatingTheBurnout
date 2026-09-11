import type { EventKind } from '../ds'
import type { Commitment, OasisState } from '../state/types'

// ─── Composing a commitment ───────────────────────────────────────────────────
// The reducer is pure — no Date.now(), no crypto.randomUUID() — so the same
// actions always replay to the same week and the demo cannot drift on camera.
// The cost is that the dispatcher mints the id, and there are now three of them:
// the assistant, the add form, and the calendar importer. This knows how.

/** Nothing costs more than this in a day. A 26-hour event is a typo, not a Tuesday. */
export const MAX_HOURS = 12

/** Per-kind fallback when no figure is stated. Rest costs 0. */
export const DEFAULT_HOURS: Record<EventKind, number> = {
  deadline: 3, class: 2, commitment: 2, rest: 0, alert: 1,
}

/** Everything about a commitment except its identity. */
export interface CommitmentDraft {
  title: string
  kind: EventKind
  date: string
  /** Display time, e.g. '9am', 'all day'. Never parsed back. */
  time: string
  hours: number
  origin: Commitment['origin']
}

const slug = (title: string) =>
  title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 24) || 'item'

/**
 * A commitment with a derived id.
 *
 * The old id was `${prefix}-${commitments.length}` alone, which collides: add,
 * delete a different one, add again, and the length is back where it started —
 * two commitments then share an id, so commitmentCost() prices the wrong one and
 * removeCommitment deletes both. Folding the title in fixes that without
 * randomness, which the pure reducer forbids.
 *
 * `offset` is for callers writing several at once: an import dispatches one
 * addCommitments with N drafts, each needing a different length to count from.
 */
export function newCommitment(s: OasisState, draft: CommitmentDraft, offset = 0): Commitment {
  return {
    id: `${draft.origin}-${s.commitments.length + offset}-${slug(draft.title)}`,
    title: draft.title,
    kind: draft.kind,
    date: draft.date,
    time: draft.time,
    hours: Math.round(Math.min(draft.hours, MAX_HOURS) * 10) / 10,
    // A deadline is a fixed point; a class is somebody else's timetable. Only
    // what you chose to put in your week can be moved back out of it.
    movable: draft.kind === 'commitment' || draft.kind === 'rest',
    origin: draft.origin,
  }
}
