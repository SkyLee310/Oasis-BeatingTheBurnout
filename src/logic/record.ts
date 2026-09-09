import type { OasisState, PastProject } from '../state/types'

// ─── Track record ─────────────────────────────────────────────────────────────
// The mentor asked for a performance review system "like Steam history". Read
// correctly, that is not a rating system at all: Steam shows you your own hours
// and your own achievements, and it never shows you what other players thought
// of you. So this module reads one person's finished projects and says what
// they did. It has no access to another member's record and no concept of a
// rank, because neither exists in the app.
//
// Two rules the rest of the file is built to obey:
//
//   1. Nothing here can be lost. Every achievement is a count of something that
//      happened. A count cannot break the way a streak breaks, so stopping for
//      a semester costs a student nothing.
//   2. Nothing here is comparative. No percentile, no "better than", no league.
//      The only thing a number is measured against is the same student's own
//      history.
//
// Everything is pure and derived from state, so the sheet, the summary line and
// the share toggle all read the same figures.

/** One thing that has already happened. Never a target, never a streak. */
export interface Achievement {
  id: string
  label: string
  /** Where it came from, in one line — the same rule as every other number. */
  detail: string
}

export interface TrackRecord {
  projects: PastProject[]
  /** Of the tasks she closed, the share that went in on time. 0–100. */
  onTimeRate: number
  /** Mean share of each team's weight she carried. 0–100. */
  weightShare: number
  achievements: Achievement[]
}

/** Carrying more than this much of one team is worth saying out loud. */
const HEAVY_SHARE = 40

const sum = (ns: number[]) => ns.reduce((a, b) => a + b, 0)

/**
 * Achievements from finished projects. Pure, positive-only, and additive: each
 * one is a tally that can only ever go up, so there is no state in which the
 * app tells a student they have lost something.
 *
 * Deliberately absent: anything consecutive, anything with a target, and
 * anything phrased as a comparison. Those are the mechanics that turn a
 * wellbeing app into a source of guilt, which is the failure mode this whole
 * product was built against.
 */
export function achievementsFor(history: PastProject[]): Achievement[] {
  const out: Achievement[] = []

  const onTime = history.filter(p => p.onTime)
  if (onTime.length >= 2) {
    out.push({
      id: 'a-on-time',
      label: `Zero late hand-ins across ${onTime.length} projects`,
      detail: `${onTime.map(p => p.course).join(", ")} — all in on or before the deadline.`,
    })
  }

  const heaviest = history.reduce<PastProject | null>(
    (top, p) => (!top || p.weightShare > top.weightShare ? p : top),
    null,
  )
  if (heaviest && heaviest.weightShare > HEAVY_SHARE) {
    out.push({
      id: 'a-heavy',
      label: `Carried over ${HEAVY_SHARE}% of a team's weight`,
      detail: `${heaviest.weightShare}% of ${heaviest.course}, which is the most you have held.`,
    })
  }

  const closed = sum(history.map(p => p.tasksDone))
  if (closed > 0) {
    out.push({
      id: 'a-closed',
      label: `${closed} tasks closed`,
      detail: `Counted across every project you have finished.`,
    })
  }

  const terms = new Set(history.map(p => p.term))
  if (terms.size >= 2) {
    out.push({
      id: 'a-terms',
      label: `${terms.size} terms of finished projects`,
      detail: `${[...terms].join(", ")}.`,
    })
  }

  return out
}

/**
 * The one achievement that is not history yet: a task nobody had claimed, that
 * you now hold. It is matched by title against the decision log, which is only
 * ever written when a request is answered — so this appears the moment an ask
 * from the inbox is accepted, and never for work that was assigned to you in
 * the first place.
 */
function rescuedFor(state: OasisState): Achievement[] {
  const me = state.project.members.find(m => m.status === 'you')
  if (!me) return []

  const taken = state.decisions.filter(d => d.outcome !== 'declined')
  const mine = state.project.tasks.filter(t =>
    t.assignee === me.id &&
    taken.some(d => d.title.toLowerCase() === t.title.toLowerCase()))

  if (mine.length === 0) return []

  return [{
    id: 'a-rescued',
    label: mine.length === 1
      ? 'Picked up an abandoned task'
      : `Picked up ${mine.length} abandoned tasks`,
    detail: `${mine.map(t => t.title).join(", ")} — nobody had claimed it when you said yes.`,
  }]
}

/**
 * The whole record, in the order the sheet reads it. The live achievement comes
 * first because it is the newest thing that happened; the rest are stable, so
 * the list does not reshuffle under a returning user.
 */
export function recordFor(state: OasisState): TrackRecord {
  const projects = state.record.past

  const closed = sum(projects.map(p => p.tasksDone))
  const closedOnTime = sum(projects.map(p => (p.onTime ? p.tasksDone : 0)))

  return {
    projects,
    onTimeRate: closed > 0 ? Math.round((closedOnTime / closed) * 100) : 0,
    weightShare: projects.length > 0
      ? Math.round(sum(projects.map(p => p.weightShare)) / projects.length)
      : 0,
    achievements: [...rescuedFor(state), ...achievementsFor(projects)],
  }
}
