import type { ZoneKey } from '../ds'
import type { GroupProject, Member, OasisState, ProjectTask } from '../state/types'

// ─── Group fairness ───────────────────────────────────────────────────────────
// The complaint about university group work is never "we have no task list" —
// it is "I am doing most of it and nobody will say so out loud". So this module
// measures the split in *task weight*, not task count (a five-point model
// implementation is not one slide deck), and turns the result into a message
// somebody can actually paste into the group chat. Naming the imbalance is the
// part students find hard; the arithmetic is the easy half.
//
// Everything here is pure and derived from the project, so the Group page, the
// invite sheet and the join landing all read the same numbers.

// ─── Which project ────────────────────────────────────────────────────────────
// A student is in several group assignments at once, which is the whole reason
// the term feels the way it does. Every function below takes a GroupProject
// rather than reading state, so none of them had to change when one project
// became a list — these two resolvers are the only place that knows.

/** The project the Group page is showing. Falls back to the first rather than
 *  returning null on a stale id, so switching scenarios cannot blank the page. */
export function activeProject(s: OasisState): GroupProject | null {
  if (s.projects.length === 0) return null
  return s.projects.find(p => p.id === s.activeProjectId) ?? s.projects[0]
}

/** Resolve an invite link. The code is the project's identity to anyone outside
 *  the app, so ?join=<code> has to search all of them, not just the open one. */
export function projectByCode(s: OasisState, code: string): GroupProject | null {
  const wanted = code.trim().toUpperCase()
  return s.projects.find(p => p.code.toUpperCase() === wanted) ?? null
}

/** One member's slice of the project, in weight and in percent. */
export interface Share {
  member: Member
  /** Total weight assigned to them, done or not. */
  weight: number
  /** The weight they have already finished. */
  done: number
  /** Their share of all *assigned* weight, 0–100. */
  pct: number
  /** Carrying more than 1.5× an even split. */
  over: boolean
}

export interface Balance {
  shares: Share[]
  /** Weight that has an owner. */
  assigned: number
  /** An even split of the assigned weight, in weight units. */
  fair: number
  /** Tasks nobody has picked up — the other half of the problem. */
  unassigned: ProjectTask[]
  /** Whoever is carrying the most, when that is more than their share. */
  overloaded: Share | null
}

/** Anyone above this multiple of an even split is flagged. */
const OVER_AT = 1.5

const weightOf = (tasks: ProjectTask[]) => tasks.reduce((sum, t) => sum + t.weight, 0)

/**
 * Who is carrying what. Members who have not joined still appear — a teammate
 * who never installed the app is exactly the person the split is hiding behind.
 */
export function balance(project: GroupProject): Balance {
  const { members, tasks } = project

  const unassigned = tasks.filter(t => t.assignee === null)
  const assigned = weightOf(tasks) - weightOf(unassigned)
  const fair = members.length > 0 ? assigned / members.length : 0

  const shares: Share[] = members.map(member => {
    const mine = tasks.filter(t => t.assignee === member.id)
    const weight = weightOf(mine)
    return {
      member,
      weight,
      done: weightOf(mine.filter(t => t.done)),
      pct: assigned > 0 ? Math.round((weight / assigned) * 100) : 0,
      over: fair > 0 && weight > fair * OVER_AT,
    }
  })

  const heaviest = shares.reduce<Share | null>(
    (top, s) => (s.over && (!top || s.weight > top.weight) ? s : top),
    null,
  )

  return { shares, assigned, fair, unassigned, overloaded: heaviest }
}

// ─── The same person, across every project ────────────────────────────────────
// The sentence a single project can never say. Carrying 48% of one assignment is
// a conversation with three people; carrying 48%, 52% and 40% of three at once
// is the thing that actually ends a term, and until now nothing in the app could
// see it, because nothing held more than one project at a time.

export interface ProjectShare {
  project: GroupProject
  /** Your share of that project's assigned weight, 0–100. */
  pct: number
  /** Over 1.5× an even split of it. */
  over: boolean
}

/**
 * Your slice of each project, in state order. Projects you are not a member of
 * are skipped rather than reported as 0% — a project you are not in is not a
 * project you are doing well at.
 */
export function sharesAcrossProjects(s: OasisState): ProjectShare[] {
  const out: ProjectShare[] = []

  for (const project of s.projects) {
    const mine = balance(project).shares.find(sh => sh.member.status === 'you')
    if (!mine) continue
    out.push({ project, pct: mine.pct, over: mine.over })
  }

  return out
}

// ─── Capacity, as a word ──────────────────────────────────────────────────────
// The one rule that makes the privacy claim true rather than aspirational: a
// teammate's capacity is derived from the *shared project object* and nothing
// else. Not their energy score, not their sleep, not their check-in — none of
// which anybody but them can see. Weight they hold, against an even split of
// the whole project.
//
// The denominator is the project's total weight, unclaimed tasks included. That
// is deliberate: an even share is a share of the work that exists, not of the
// work people have already agreed to. It means somebody sitting next to three
// unclaimed tasks still reads as having room to take one, which is exactly the
// nudge the group needs.

/** Carrying this much of an even share, or more, is at capacity. */
const AT_CAPACITY_AT = 1.5
/** Anything at or above an even share is loaded. */
const LOADED_AT = 1

/** The word a teammate sees. Never a number, in any surface, ever. */
export const CAPACITY_LABEL: Record<ZoneKey, string> = {
  green: 'Has room',
  amber: 'Loaded',
  red: 'At capacity',
}

export function capacityOf(project: GroupProject, memberId: string): ZoneKey {
  const { members, tasks } = project
  const total = weightOf(tasks)
  const fair = members.length > 0 ? total / members.length : 0
  if (fair <= 0) return 'green'

  const share = weightOf(tasks.filter(t => t.assignee === memberId)) / fair
  return share >= AT_CAPACITY_AT ? 'red' : share >= LOADED_AT ? 'amber' : 'green'
}

/** The lightest-loaded member who could take work — never the person already over. */
function lightest(b: Balance): Share | null {
  const candidates = b.shares.filter(s => !s.over)
  return candidates.reduce<Share | null>(
    (low, s) => (!low || s.weight < low.weight ? s : low),
    null,
  )
}

/**
 * The message. Written the way a student would actually raise it — states the
 * numbers first so it reads as a fact rather than a complaint, names one
 * specific task to move, and ends with a question so somebody has to answer.
 */
export function proposeRebalance(project: GroupProject): string {
  const b = balance(project)
  const lines: string[] = [`${project.name} — quick check on the split:`]

  for (const s of b.shares) {
    if (s.member.status === 'none') {
      lines.push(`• ${s.member.name} — not on the sheet yet`)
    } else {
      lines.push(`• ${s.member.name} — ${s.weight} of ${b.assigned} points (${s.pct}%)`)
    }
  }

  const over = b.overloaded
  const light = lightest(b)

  if (over) {
    // Hand over the heaviest thing they have not started; finished work cannot move.
    const movable = project.tasks
      .filter(t => t.assignee === over.member.id && !t.done)
      .sort((a, z) => z.weight - a.weight)[0]

    if (movable && light) {
      lines.push(
        '',
        `${over.member.name} is on ${over.pct}% of the work. Can "${movable.title}" move to ${light.member.name}?`,
      )
    } else if (movable) {
      lines.push('', `${over.member.name} is on ${over.pct}%. Can someone take "${movable.title}"?`)
    }
  }

  if (b.unassigned.length > 0) {
    const names = b.unassigned.map(t => `"${t.title}"`).join(', ')
    lines.push(
      '',
      b.unassigned.length === 1
        ? `Still nobody on ${names} — who wants it?`
        : `Still nobody on ${names}. Can we claim these today?`,
    )
  }

  if (!over && b.unassigned.length === 0) {
    lines.push('', 'Split looks even — nothing to move.')
  }

  return lines.join('\n')
}

/** The invite link. Relative to wherever the app is served, so it works on a phone. */
export function joinUrl(code: string): string {
  if (typeof window === 'undefined') return `?join=${code}`
  const { origin, pathname } = window.location
  return `${origin}${pathname}?join=${code}`
}

/** What gets sent into the group chat alongside the link. */
export function inviteMessage(project: GroupProject, url: string): string {
  return [
    `Putting ${project.name} into Oasis so we can all see the split.`,
    "It shows who has what — nobody sees anyone's personal stress score.",
    url,
  ].join('\n')
}

/** WhatsApp deep link. Opens the app on a phone and the web client on desktop. */
export const waLink = (message: string) => `https://wa.me/?text=${encodeURIComponent(message)}`
