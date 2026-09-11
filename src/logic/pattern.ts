import type { AvatarKey, OasisState, PatternKey } from '../state/types'
import { energyFactors } from './energy'
import { sharesAcrossProjects } from './group'

// --- Your pattern -----------------------------------------------------------
// A personality label the app assigned would be the only claim in Oasis without
// a source, on a product whose entire argument is that every figure has one --
// see HowItWorksPage, which exists for no other reason. So a pattern is two
// halves that meet on the card: the student names it, and Oasis measures it.
//
// Three rules, all of which the rest of the file obeys:
//
//   1. Every percentage ships with the sentence that produced it. The reference
//      design the user brought printed "19k learners" under its figure; that is
//      a reason to trust the app, not a reason to trust the number. The receipt
//      is what goes there instead.
//   2. Nothing is comparative and nothing is a streak, for the same reasons
//      spelled out in logic/record.ts. A pattern is a description, never a
//      score and never a target.
//   3. A pattern Oasis cannot yet see says so. decisions[] and checkIn are
//      empty at seed, so the first card is honestly blank on day one -- and it
//      fills in the moment a request is answered, which is the whole reason the
//      decision log exists.
//
// Two of the four figures are already computed for the energy score. That is
// the argument for these four and against a fifth: 'perfectionism' was cut
// because nothing in state derives it.

export interface Pattern {
  key: PatternKey
  /** The student's words, not a diagnosis. */
  label: string
  /** Which of the eight blobs wears it. */
  avatar: AvatarKey
  /** 0-100. What the app has seen, never a personality score. */
  pct: number
  /** Where pct came from, in one line. */
  receipt: string
  /** True when there is nothing to read yet -- pct is 0 for want of data, not
   *  because the answer is zero, and the card has to say which. */
  empty: boolean
}

/** At most three. Four cards and a cap of three means one is always unpicked,
 *  which is the point: a page that lets you agree with everything has not asked
 *  you anything. */
export const MAX_PATTERNS = 3

const asPct = (ratio: number) => Math.round(ratio * 100)

export function patternsFor(s: OasisState): Pattern[] {
  const factors = energyFactors(s)
  const density = factors.find(f => f.key === 'density')
  const sleep = factors.find(f => f.key === 'sleep')

  // Only answered requests count. A pending ask is not a decision, and counting
  // it as one would tell a student they cannot say no before they have tried.
  const answered = s.decisions
  const taken = answered.filter(d => d.outcome !== 'declined')

  const shares = sharesAcrossProjects(s)
  const over = shares.filter(sh => sh.over)
  const meanShare = shares.length > 0
    ? Math.round(shares.reduce((sum, sh) => sum + sh.pct, 0) / shares.length)
    : 0

  return [
    {
      key: 'cant-say-no',
      label: 'I say yes too often',
      avatar: 'guilty',
      pct: answered.length > 0 ? Math.round((taken.length / answered.length) * 100) : 0,
      receipt: answered.length === 0
        ? 'Oasis has not seen you answer a request yet.'
        : `You took on ${taken.length} of the ${answered.length} asks you have answered.`,
      empty: answered.length === 0,
    },
    {
      key: 'last-minute',
      label: 'Everything lands at once',
      avatar: 'anxious',
      pct: asPct(density?.ratio ?? 0),
      receipt: density?.detail ?? 'Nothing on the calendar yet.',
      empty: s.commitments.length === 0,
    },
    {
      key: 'carries-team',
      label: 'I carry the group',
      avatar: 'overwhelmed',
      pct: meanShare,
      receipt: shares.length === 0
        ? 'No group assignments yet.'
        : over.length === 0
          ? `Your share across ${shares.length} assignments, none of them over an even split.`
          : `${over.length} of ${shares.length} assignments are over an even split for you.`,
      empty: shares.length === 0,
    },
    {
      key: 'sleep-debt',
      label: 'I run on short nights',
      avatar: 'drained',
      pct: asPct(sleep?.ratio ?? 0),
      receipt: sleep?.detail ?? 'No sleep recorded yet.',
      empty: s.recovery.sleepHours.length === 0,
    },
  ]
}

const PREFIX: Record<PatternKey, string> = {
  'cant-say-no': 'You told Oasis you say yes too often. ',
  'last-minute': 'You told Oasis things pile up at the end. ',
  'carries-team': 'You told Oasis you end up carrying the group. ',
  'sleep-debt': 'You told Oasis you run on short nights. ',
}

/**
 * One clause in front of the verdict copy, or '' when nothing is picked. A
 * prefix and nothing more: logic/decision.ts does not import this file, so the
 * answer, its thresholds and its arithmetic are exactly what they were. The
 * first pattern only -- three clauses would bury the verdict under the preamble.
 */
export function patternPrefix(s: OasisState): string {
  const first = s.profile.patterns[0]
  return first ? PREFIX[first] : ''
}
