import type { EventKind } from '../ds'
import { addDays, nextDow, shortDate } from './dates'
import { projectEnergy, zoneFor } from './energy'
import { DEFAULT_HOURS, MAX_HOURS, newCommitment } from './compose'
import type { Commitment, OasisState } from '../state/types'

// ─── Oasis AI, the agent half ─────────────────────────────────────────────────
// The consultant half of the assistant answers questions about the week. This
// half changes it — and it only ever *proposes* the change. Everything below
// returns a plan; the store does not hear about any of it until the student
// presses Confirm.
//
// That is not politeness. An app whose whole argument is "look at what this
// costs before you say yes" cannot be the thing that quietly adds four hours to
// your Thursday. The confirm step is where the cost gets shown, so the confirm
// step is the product.

export type AgentAction =
  | { kind: 'add'; commitment: Commitment }
  | { kind: 'remove'; commitment: Commitment }

const ADD = /^\s*(?:please\s+|can you\s+|could you\s+)?(?:add|schedule|book|block(?:\s+out)?|create|put|pencil in)\b/i
const REMOVE = /^\s*(?:please\s+|can you\s+|could you\s+)?(?:remove|delete|drop|cancel|clear|take off|get rid of)\b/i

const HOURS = /(\d+(?:\.\d+)?)\s*(?:h\b|hr|hrs|hour|hours)/i
const CLOCK = /\b(\d{1,2})(?::(\d{2}))?\s*(am|pm)\b/i

const DAYS = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday']

/** Words that place the work in time. Stripped from the title once read. */
const WHEN = /\b(?:on\s+)?(?:sunday|monday|tuesday|wednesday|thursday|friday|saturday|today|tonight|tomorrow|this weekend|next week)\b/gi

/** Filler around the noun the student actually named. */
const TRIM_LEAD = /^(?:a|an|the|my|some|to|in|new)\s+/i
const TRIM_TAIL = /\s+(?:to|from|off|out of|in)\s+(?:my\s+)?(?:schedule|calendar|week|planner|list|day)\s*$/i

/**
 * What kind of block this is. Ordered by how strong the claim is: a stated
 * deadline beats a timetabled class beats a rest block, and anything
 * unrecognised is a plain commitment — the neutral, movable default.
 */
function kindOf(text: string): EventKind {
  if (/\b(?:deadline|due|submit|submission|assignment|report|essay|hand in)\b/i.test(text)) return 'deadline'
  if (/\b(?:class|lecture|lab|tutorial|seminar|workshop)\b/i.test(text)) return 'class'
  if (/\b(?:rest|nap|break|sleep|gym|walk|run|downtime|recovery)\b/i.test(text)) return 'rest'
  return 'commitment'
}


function dateFrom(text: string, today: string): string {
  const hay = text.toLowerCase()
  const named = DAYS.findIndex(d => hay.includes(d))
  if (named >= 0) return nextDow(today, named)
  if (/\bthis weekend\b/.test(hay)) return nextDow(today, 6)
  if (/\btomorrow\b/.test(hay)) return addDays(today, 1)
  if (/\bnext week\b/.test(hay)) return addDays(today, 7)
  return today
}

function timeFrom(text: string): string {
  const m = text.match(CLOCK)
  if (!m) return 'all day'
  const mins = m[2] ? `:${m[2]}` : ''
  return `${Number(m[1])}${mins}${m[3].toLowerCase()}`
}

const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1)

/** Strip the verb, the figures and the day words, and see what noun is left. */
function titleFrom(rest: string): string {
  const cleaned = rest
    .replace(HOURS, ' ')
    .replace(CLOCK, ' ')
    .replace(WHEN, ' ')
    .replace(/[.,!?]+\s*$/, '')
    .replace(/\s+/g, ' ')
    .trim()
    .replace(TRIM_TAIL, '')
    .replace(TRIM_LEAD, '')
    .trim()
  return cleaned ? capitalize(cleaned) : ''
}

/**
 * The one the student meant. Exact title first, then a substring either way, so
 * "drop the DS report" finds "DS3103 report draft" and "delete report draft"
 * finds it too. Ties go to the earliest in the week: if two things share a
 * name, the one bearing down on you is the one you are trying to clear.
 */
function findCommitment(needle: string, s: OasisState): Commitment | null {
  const n = needle.toLowerCase().trim()
  if (!n) return null
  const pool = [...s.commitments].sort((a, b) => a.date.localeCompare(b.date))
  return pool.find(c => c.title.toLowerCase() === n)
    ?? pool.find(c => c.title.toLowerCase().includes(n))
    ?? pool.find(c => n.includes(c.title.toLowerCase()))
    ?? null
}

/**
 * Read an add-or-remove instruction out of one message. Returns null when the
 * message is not one — which is most of them, and is why this runs before the
 * consultant rather than instead of it.
 */
export function parseAgentIntent(raw: string, s: OasisState): AgentAction | null {
  const text = raw.trim()

  if (REMOVE.test(text)) {
    const rest = text.replace(REMOVE, '').replace(TRIM_LEAD, '').trim()
    const found = findCommitment(titleFrom(rest) || rest, s)
    return found ? { kind: 'remove', commitment: found } : null
  }

  if (!ADD.test(text)) return null

  const rest = text.replace(ADD, '').trim()
  const title = titleFrom(rest)
  if (!title) return null

  const kind = kindOf(rest)
  const stated = rest.match(HOURS)
  const hours = stated
    ? Math.min(Number(stated[1]), MAX_HOURS)
    : DEFAULT_HOURS[kind]

  return {
    kind: 'add',
    commitment: newCommitment(s, {
      title,
      kind,
      date: dateFrom(rest, s.today),
      time: timeFrom(rest),
      hours,
      origin: 'chat',
    }),
  }
}

/**
 * What the assistant says when it hands the plan over. The number is the whole
 * message: this is the same projection the Decision Check runs, quoted rather
 * than restated, so the two surfaces can never disagree about what a task costs.
 */
export function agentPreview(action: AgentAction, s: OasisState, energy: number): string {
  const c = action.commitment

  if (action.kind === 'remove') {
    const freed = c.hours > 0 ? ` That gives you back ${c.hours}h.` : ''
    return `Take "${c.title}" off ${shortDate(c.date)}?${freed} Nothing leaves your week until you confirm.`
  }

  const after = projectEnergy(s, c)
  const drop = energy - after
  const zone = zoneFor(after)
  const when = `${shortDate(c.date)}${c.time === 'all day' ? '' : ` at ${c.time}`}`

  const cost = c.hours === 0
    ? "It costs nothing — rest is the one thing here that does not."
    : drop <= 0
      ? `At ${c.hours}h it does not move your energy off ${energy}.`
      : `${c.hours}h would take your energy ${energy} → ${after} (${zone} zone).`

  const warn = zone === 'red' && drop > 0
    ? " That is the red zone — you would be spending sleep to pay for it."
    : ''

  return `Add "${c.title}" on ${when}? ${cost}${warn}`
}
