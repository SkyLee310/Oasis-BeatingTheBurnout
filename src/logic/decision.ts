// ─── Decision engine ──────────────────────────────────────────────────────────
// "Should I take this on?" — answered from a chat someone pasted in, offline,
// in one pass, with every input printed back as a sentence they can argue with.
//
// This is a rules engine rather than a model call, and that is a product
// decision, not a shortcut. It cannot fail live in a demo, it ships no key to
// the browser, and a student who disagrees with the verdict can see exactly
// which line produced it. analyzeRequest() is the seam: putting a model behind
// this later means replacing that one function and keeping the Verdict shape.
//
// Nothing here reads the clock or generates an id, so the same chat always
// produces the same verdict — which is what makes the demo repeatable.

import type { ZoneKey } from '../ds'
import type {
  Commitment, IncomingRequest, OasisState, ParsedRequest, RequestKind,
} from '../state/types'
import { energyFor, projectEnergy, zoneFor } from './energy'
import { addDays, nextDow, shortDate } from './dates'
import { lowerFirst, withoutDue } from './text'

// ═══ Parsing ═════════════════════════════════════════════════════════════════

/** 'Farah (Manager): hey Maya, can you…' → speaker 'Farah', the rest as text. */
const SPEAKER = /^\s*(\p{L}[\p{L}\p{M}'. -]{0,28}?)\s*(?:\([^)]*\))?\s*:\s*(.*)$/u

/** Lines from these speakers are the user's own, so they never set the asker. */
const SELF = ['you', 'me', 'i', 'maya']

/** The ask itself, which is also the best raw material for a title. */
const ASKS = [
  /(?:can|could|would|will)\s+(?:you|u)\s+(?:please\s+)?(.+)/i,
  /(?:need|want)\s+(?:you|u)\s+to\s+(.+)/i,
  /are\s+(?:you|u)\s+(?:free|able|around)\s+to\s+(.+)/i,
  /(?:you|u)\s+(?:should|gotta|have to)\s+(.+)/i,
]

/** First match wins, so the more specific kinds are listed before 'task'. */
const KIND_WORDS: { kind: RequestKind; words: string[] }[] = [
  {
    kind: 'group-lead',
    words: ['group project', 'group assignment', 'assignment', 'lead', 'leader',
            'slides', 'report', 'presentation', 'proposal', 'coursework'],
  },
  {
    kind: 'shift',
    words: ['shift', 'cover', 'rostered', 'roster', 'overtime', 'store',
            'cafe', 'café', 'restaurant', 'closing'],
  },
  {
    kind: 'social',
    words: ['dinner', 'birthday', 'party', 'hangout', 'hang out', 'lunch',
            'movie', 'karaoke', 'drinks', 'celebration', 'gathering', 'outing'],
  },
]

/** What a request of each kind costs a week when the chat never says. */
const DEFAULT_HOURS: Record<RequestKind, number> = {
  'group-lead': 8, shift: 6, social: 3, task: 4,
}

const FALLBACK_TITLE: Record<RequestKind, string> = {
  'group-lead': 'Lead a group assignment',
  shift: 'Cover an extra shift',
  social: 'A social commitment',
  task: 'An extra task',
}

const DAYS = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday']

const URGENT = /\b(asap|urgent(?:ly)?|tonight|today|right away|immediately|last minute|by tomorrow)\b/i

/** '5pm-11pm', '9:30am to 4pm' — both ends, so the span is a real duration. */
const TIME_RANGE =
  /\b(\d{1,2})(?::(\d{2}))?\s*(am|pm)\s*(?:-|–|—|to|till|until)\s*(\d{1,2})(?::(\d{2}))?\s*(am|pm)\b/i

/** 'about 8 hours a week', '10 hrs', '5 hours' — an explicit figure wins. */
const HOURS_STATED = /\b(\d{1,2}(?:\.\d)?)\s*(?:h|hr|hrs|hour|hours)\b/i

/** Nobody means a 60-hour side commitment; a bigger number is a typo. */
const MAX_HOURS = 40

const to24 = (h: number, meridiem: string) =>
  (h % 12) + (meridiem.toLowerCase() === 'pm' ? 12 : 0)

/** Words that end a title early — what follows is politeness or reasoning. */
const TITLE_STOP = /\s+(?:,|\band\b|\bbecause\b|\bsince\b|\bplease\b|\bfor me\b|\bthanks\b|\bthx\b)\b.*$/i

/** Longer than this is a sentence, not a title, so the fallback reads better. */
const TITLE_MAX_WORDS = 9

/**
 * A title ending in a bare pronoun points back at a line it cannot carry with
 * it — "Lead it" says nothing on a card — so the per-kind fallback wins.
 */
const DANGLING = /\b(?:it|this|that|them|one|us|me)$/i

/** Chat is lowercase; a title is not, and 'saturday' on a card looks unfinished. */
const DAY_WORD = /\b(?:sun|mon|tues|wednes|thurs|fri|satur)day\b/gi

const capitalize = (w: string) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()

function titleFrom(text: string, kind: RequestKind): string {
  for (const re of ASKS) {
    const m = text.match(re)
    if (!m) continue
    const cleaned = m[1]
      .replace(/[?!.]+\s*$/, '')
      .replace(TITLE_STOP, '')
      .replace(/\s+/g, ' ')
      .trim()
    const words = cleaned.split(' ').filter(Boolean)
    if (words.length === 0 || words.length > TITLE_MAX_WORDS) continue
    const t = words.join(' ').replace(DAY_WORD, capitalize)
    if (DANGLING.test(t)) continue
    return capitalize(t.charAt(0)) + t.slice(1)
  }
  return FALLBACK_TITLE[kind]
}

/**
 * Pull a request out of a pasted conversation. Deliberately forgiving: a chat
 * that names none of this still parses, because a wrong-but-editable guess is
 * more useful than an error — every field is shown before anything is decided.
 */
export function parseChat(raw: string, today: string): ParsedRequest {
  const lines = raw.split('\n').map(l => l.trim()).filter(Boolean)

  const spoken = lines.map(line => {
    const m = line.match(SPEAKER)
    return m ? { speaker: m[1].trim(), text: m[2] } : { speaker: null, text: line }
  })

  // The asker is whoever is doing the asking, so the user's own lines are
  // excluded — otherwise pasting your half of the thread renames them to you.
  const others = spoken.filter(
    l => l.speaker && !SELF.includes(l.speaker.toLowerCase()))
  const asker = others[0]?.speaker ?? 'Someone'

  const body = (others.length > 0 ? others : spoken).map(l => l.text).join(' ')
  const hay = body.toLowerCase()

  const kind = KIND_WORDS.find(k => k.words.some(w => hay.includes(w)))?.kind ?? 'task'

  // Hours: a stated figure beats a clock range, and a clock range beats the
  // per-kind default — in that order, because each is a stronger claim.
  const stated = body.match(HOURS_STATED)
  const range = body.match(TIME_RANGE)
  const hoursPerWeek = stated
    ? Math.min(Number(stated[1]), MAX_HOURS)
    : range
      ? Math.max(
          1,
          (to24(Number(range[4]), range[6]) + Number(range[5] ?? 0) / 60) -
          (to24(Number(range[1]), range[3]) + Number(range[2] ?? 0) / 60),
        )
      : DEFAULT_HOURS[kind]

  // A named weekday beats a relative word, because the weekday is the thing
  // people actually plan around. 'This weekend' resolves to the Saturday.
  const named = DAYS.findIndex(d => hay.includes(d))
  const deadline =
    named >= 0 ? nextDow(today, named)
    : /\bweekend\b/.test(hay) ? nextDow(today, 6)
    : /\btomorrow\b/.test(hay) ? addDays(today, 1)
    : /\b(tonight|today)\b/.test(hay) ? today
    : null

  const askLine = others.find(l => ASKS.some(re => re.test(l.text)))?.text ?? body

  return {
    title: titleFrom(askLine, kind),
    asker,
    kind,
    hoursPerWeek: Math.round(hoursPerWeek * 10) / 10,
    deadline,
    urgent: URGENT.test(body),
  }
}

// ═══ Analysis ════════════════════════════════════════════════════════════════

export type Decision = 'decline' | 'negotiate' | 'accept'

/** One line of "why this verdict". `cost` is what it took off the margin. */
export interface Reason {
  text: string
  cost: number
}

export interface Verdict {
  decision: Decision
  /** Energy now, and what the dashboard would read if this were accepted. */
  before: number
  after: number
  zone: ZoneKey
  /** Projected energy less the penalties below — what the thresholds read. */
  margin: number
  collisions: Commitment[]
  reasons: Reason[]
  /** Written to the schedule on accept, and at half the hours on negotiate. */
  commitment: Commitment
  negotiated: Commitment
}

/**
 * Below the first Oasis says no; below the second it says "not like this".
 * Read against the margin rather than raw energy, so the same hours landing on
 * a bad day are judged more harshly than on a clear one.
 */
const DECLINE_BELOW = 25
const NEGOTIATE_BELOW = 40

/** Each penalty, in margin points. Every one is printed with its own figure. */
const COLLISION_COST = 5
const URGENCY_COST = 4
const SLEEP_DEBT_COST = 5
const STRAIN_COST = 4

/** Sleep under this, or a resting rate this far over baseline, is a warning. */
const SLEEP_SHORT_AT = 6
const STRAIN_OVER_BASELINE = 8

/** A deadline this many days after the request lands is still the same crunch. */
const COLLISION_WINDOW = 1

/** A negotiated version is the same ask at half the hours — the counter-offer
 *  most likely to be accepted, and the one the reply composer writes. */
const NEGOTIATE_FACTOR = 0.5

function candidateFor(
  req: IncomingRequest, today: string, hours: number, suffix = '',
): Commitment {
  return {
    id: `req-${req.id}${suffix}`,
    title: req.parsed.title,
    kind: 'commitment',
    date: req.parsed.deadline ?? today,
    time: 'all day',
    hours,
    movable: false,
    origin: 'chat',
    reason: `Accepted from ${req.parsed.asker}'s chat.`,
  }
}

/**
 * Price a request against the week it would land in. Every number here comes
 * back out in `reasons`, which *is* the "Why this verdict" panel — there is no
 * second, shorter explanation written anywhere else.
 */
export function analyzeRequest(req: IncomingRequest, s: OasisState): Verdict {
  const { parsed } = req
  const lands = parsed.deadline ?? s.today
  const windowEnd = addDays(lands, COLLISION_WINDOW)

  const commitment = candidateFor(req, s.today, parsed.hoursPerWeek)
  const negotiated = candidateFor(
    req, s.today,
    Math.max(1, Math.round(parsed.hoursPerWeek * NEGOTIATE_FACTOR)), '-half',
  )

  const before = energyFor(s)
  const after = projectEnergy(s, commitment)

  // What it lands on top of: anything real on the day itself, plus a deadline
  // in the day after — you are working the night before either way.
  const collisions = s.commitments.filter(c =>
    c.hours > 0 && (
      c.date === lands ||
      (c.kind === 'deadline' && c.date > lands && c.date <= windowEnd)))

  const nights = s.recovery.sleepHours
  const sleepShort = nights.length > 0 &&
    nights.reduce((a, b) => a + b, 0) / nights.length < SLEEP_SHORT_AT
  const strained = s.recovery.restingHr - s.recovery.hrBaseline >= STRAIN_OVER_BASELINE

  const reasons: Reason[] = [{
    text: `${parsed.hoursPerWeek} hours a week on top of what is already booked — energy ${before} down to ${after}.`,
    cost: 0,
  }]

  for (const c of collisions) {
    reasons.push({
      text: `Lands ${shortDate(lands)}, the same stretch as ${c.title} on ${shortDate(c.date)}.`,
      cost: COLLISION_COST,
    })
  }

  if (parsed.urgent) {
    reasons.push({
      text: `${parsed.asker} wants an answer immediately, so there is no room to plan around it.`,
      cost: URGENCY_COST,
    })
  }

  if (sleepShort) {
    reasons.push({
      text: 'You are under six hours of sleep a night — the week has no slack to absorb more.',
      cost: SLEEP_DEBT_COST,
    })
  }

  if (strained) {
    reasons.push({
      text: `Resting heart rate is ${s.recovery.restingHr} bpm, well above your own baseline.`,
      cost: STRAIN_COST,
    })
  }

  const penalty = reasons.reduce((sum, r) => sum + r.cost, 0)
  const margin = Math.max(0, after - penalty)

  const decision: Decision =
    margin < DECLINE_BELOW ? 'decline'
    : margin < NEGOTIATE_BELOW ? 'negotiate'
    : 'accept'

  reasons.push({
    text: penalty === 0
      ? `Nothing else pulls against it, so the margin stands at ${margin} of 100.`
      : `Margin ${margin} of 100 — ${after} projected, less ${penalty} for the above.`,
    cost: 0,
  })

  return {
    decision, before, after, zone: zoneFor(after),
    margin, collisions, reasons, commitment, negotiated,
  }
}

/** The thresholds, so How-it-works can quote them rather than redefine them. */
export const DECISION_THRESHOLDS = {
  decline: DECLINE_BELOW,
  negotiate: NEGOTIATE_BELOW,
}

/** Split in two so the display face can set the second line in the accent. */
const DECISION_HEADLINE: Record<Decision, [string, string]> = {
  decline: ['Say no', 'to this one.'],
  negotiate: ['Take part', 'of it, not all.'],
  accept: ['You have', 'room for this.'],
}

const DECISION_LEAD: Record<Decision, string> = {
  decline: 'Every version of yes here costs more than the week can give back.',
  negotiate: 'A smaller piece of this fits. The whole thing does not.',
  accept: 'This lands in a week with enough slack to carry it.',
}

export const decisionHeadline = (d: Decision) => DECISION_HEADLINE[d]
export const decisionLead = (d: Decision) => DECISION_LEAD[d]

// ═══ The reply ═══════════════════════════════════════════════════════════════

export type Tone = Decision

/** Softest first, so the recommended tone is rarely the last one considered. */
export const TONE_ORDER: Tone[] = ['decline', 'negotiate', 'accept']

const TONE_LABEL: Record<Tone, string> = {
  decline: 'Decline', negotiate: 'Negotiate', accept: 'Accept',
}

export const toneLabel = (t: Tone) => TONE_LABEL[t]

/**
 * The message, ready to send. Written warm and specific rather than assertive:
 * a reply a student will actually paste has to sound like them, name the real
 * reason, and — for anything short of a flat no — offer the next opening. It
 * never quotes an energy score at the asker; that number is nobody else's.
 */
export function replyFor(req: IncomingRequest, v: Verdict, tone: Tone): string {
  const { asker, title } = req.parsed
  const what = lowerFirst(title)
  const clash = v.collisions[0]
  const because = clash
    ? `${withoutDue(clash.title)} is due in the same stretch`
    : 'this week is already full'

  switch (tone) {
    case 'decline':
      return [
        `Hi ${asker} — thanks for thinking of me, and sorry, I have to pass on this one.`,
        `I can't take on ${what} this week: ${because}, and I would end up doing it badly.`,
        'Happy to help next week if it can wait, or to point you at someone who is free.',
      ].join('\n\n')

    case 'negotiate':
      return [
        `Hi ${asker} — I want to help, but I can't take the whole thing on right now.`,
        `I could do about ${v.negotiated.hours} hours instead of ${v.commitment.hours}, because ${because}.`,
        'If that works, tell me which part is most useful and I will take that piece.',
      ].join('\n\n')

    case 'accept':
      return [
        `Hi ${asker} — yes, I can do this.`,
        `Taking on ${what} at around ${v.commitment.hours} hours a week. I have the room for it.`,
        'Send the details over whenever you are ready.',
      ].join('\n\n')
  }
}
