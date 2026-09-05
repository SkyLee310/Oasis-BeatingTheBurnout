// ─── Energy ───────────────────────────────────────────────────────────────────
// The single answer to "what is the number". Everything — the dashboard gauge,
// the verdict card, the widget, the ambient colour temperature — comes through
// here, so a chat declined on one screen moves every other screen at once.
//
// Deliberately a transparent weighted sum, not a model: every input is a number
// a student can check against their own week, and HowItWorksPage renders these
// same factors back to them with their own values plugged in.

import type { ZoneKey } from '../ds'
import type { Commitment, EnergyFactor, OasisState } from '../state/types'

// ─── Constants ────────────────────────────────────────────────────────────────
// Each ceiling is the point where a factor is considered fully loaded. They are
// stated here rather than inlined because HowItWorksPage quotes them verbatim.

/** A 40-hour week of study and work — the classic full-time ceiling. */
const ACADEMIC_CEILING_HOURS = 40
/**
 * Academic load is the one factor allowed past its ceiling. Every other signal
 * saturates — there is a limit to how sleep-deprived one week can make you —
 * but hours of work genuinely keep stacking, and a 44h week has to cost more
 * than a 40h one or "just one more commitment" would look free.
 */
const ACADEMIC_OVERSHOOT = 1.5
/** Sleep is scored between a 7.5h target and a 4h floor. */
const SLEEP_TARGET = 7.5
const SLEEP_FLOOR = 4
/** ~18 scheduled blocks a week is about 2.5 a day, every day. */
const DENSITY_CEILING_BLOCKS = 18
/** 20 bpm over your own resting baseline reads as full physiological load. */
const HR_SPAN = 20
/** 10 hours a week door-to-door is a heavy commute. */
const COMMUTE_CEILING_HOURS = 10

/** Weights sum to 100. Each is a factor's cost at its ceiling — only academic
 *  load can go beyond, up to ACADEMIC_OVERSHOOT of it. */
const WEIGHTS = {
  academic: 30,
  sleep: 25,
  density: 20,
  physiological: 15,
  commute: 10,
} as const

/** Above this you are OPTIMAL; below the second you are OVERLOADED. */
export const ZONE_GREEN_AT = 60
export const ZONE_AMBER_AT = 30

/** Ambient colour is fully warm at this energy and fully cold at the one below. */
const TEMP_WARM_AT = 60
const TEMP_COLD_AT = 20

const clamp = (n: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, n))
const clamp01 = (n: number) => clamp(n, 0, 1)

// ─── Derived measures ─────────────────────────────────────────────────────────
// Exported because the commute tab, the load categories and How-it-works all
// need to show the raw figure next to the score it produced.

/** Total estimated effort on the books this week. Rest blocks are 0h. */
export const weekHours = (s: OasisState) =>
  s.commitments.reduce((sum, c) => sum + c.hours, 0)

/** Blocks that occupy the week. Rest is not load, so it does not count here. */
export const weekBlocks = (s: OasisState) =>
  s.commitments.filter(c => c.kind !== 'rest').length

export const avgSleep = (s: OasisState) =>
  s.recovery.sleepHours.length === 0
    ? SLEEP_TARGET
    : s.recovery.sleepHours.reduce((a, b) => a + b, 0) / s.recovery.sleepHours.length

/** Dates that need a campus trip: any day holding a class, minus days the user
 *  has merged away. A deadline you submit online is not a reason to travel. */
export function tripDays(s: OasisState): string[] {
  const days = new Set(s.commitments.filter(c => c.kind === 'class').map(c => c.date))
  return [...days].filter(d => !s.commute.skippedDays.includes(d)).sort()
}

/** Hours on the road this week — both directions, every trip day. */
export const commuteHours = (s: OasisState) =>
  (tripDays(s).length * s.commute.minutesEachWay * 2) / 60

// ─── Factors ──────────────────────────────────────────────────────────────────

const factorZone = (ratio: number): ZoneKey =>
  ratio >= 0.75 ? 'red' : ratio >= 0.5 ? 'amber' : 'green'

const round1 = (n: number) => Math.round(n * 10) / 10

/**
 * The five inputs, each already scaled to the points it cost. Rendering this
 * array *is* the explanation screen — there is no second, prettier version of
 * the formula written anywhere else.
 */
export function energyFactors(s: OasisState): EnergyFactor[] {
  const hours = weekHours(s)
  const blocks = weekBlocks(s)
  const sleep = avgSleep(s)
  const overBaseline = s.recovery.restingHr - s.recovery.hrBaseline
  const travel = commuteHours(s)
  const trips = tripDays(s).length

  const raw = [
    {
      key: 'academic',
      label: 'Academic load',
      weight: WEIGHTS.academic,
      ratio: clamp(hours / ACADEMIC_CEILING_HOURS, 0, ACADEMIC_OVERSHOOT),
      value: `${round1(hours)}h`,
      detail: `${round1(hours)}h of work on the books, against a ${ACADEMIC_CEILING_HOURS}h week`,
    },
    {
      key: 'sleep',
      label: 'Sleep debt',
      weight: WEIGHTS.sleep,
      ratio: clamp01((SLEEP_TARGET - sleep) / (SLEEP_TARGET - SLEEP_FLOOR)),
      value: `${round1(sleep)}h`,
      detail: `Averaging ${round1(sleep)}h a night against a ${SLEEP_TARGET}h target`,
    },
    {
      key: 'density',
      label: 'Calendar density',
      weight: WEIGHTS.density,
      ratio: clamp01(blocks / DENSITY_CEILING_BLOCKS),
      value: `${blocks} blocks`,
      detail: `${blocks} scheduled blocks this week — rest days excluded`,
    },
    {
      key: 'physiological',
      label: 'Physiological strain',
      weight: WEIGHTS.physiological,
      ratio: clamp01(overBaseline / HR_SPAN),
      value: `${s.recovery.restingHr} bpm`,
      detail: `Resting heart rate ${s.recovery.restingHr} bpm, ${overBaseline >= 0 ? '+' : ''}${round1(overBaseline)} on your own baseline`,
    },
    {
      key: 'commute',
      label: 'Commute',
      weight: WEIGHTS.commute,
      ratio: clamp01(travel / COMMUTE_CEILING_HOURS),
      value: `${round1(travel)}h`,
      detail: trips === 0
        ? 'No campus trips scheduled this week'
        : `${trips} trip${trips === 1 ? '' : 's'} to ${s.commute.campus} — ${round1(travel)}h on the road`,
    },
  ]

  return raw.map(f => ({
    ...f,
    cost: f.weight * f.ratio,
    zone: factorZone(f.ratio),
  }))
}

// ─── The number ───────────────────────────────────────────────────────────────

/** Energy remaining, 0–100. The complement of the stress index on the band page. */
export function energyFor(s: OasisState): number {
  const load = energyFactors(s).reduce((sum, f) => sum + f.cost, 0)
  return Math.round(clamp(100 - load, 0, 100))
}

/** Stress and energy are the same measurement read from opposite ends. */
export const stressFor = (s: OasisState) => 100 - energyFor(s)

export function zoneFor(energy: number): ZoneKey {
  if (energy >= ZONE_GREEN_AT) return 'green'
  if (energy >= ZONE_AMBER_AT) return 'amber'
  return 'red'
}

/**
 * Ambient colour temperature, 0 (warm) to 1 (cold). Consumed only as the
 * `--temp` custom property on the app root — see the ambient block in
 * src/index.css. Colour is never the only signal: the number, the ZoneChip
 * label and the mascot expression all still say it in words.
 */
export const tempFor = (energy: number) =>
  clamp01((TEMP_WARM_AT - energy) / (TEMP_WARM_AT - TEMP_COLD_AT))

/**
 * What one commitment is costing, in energy points — the difference between the
 * week with it and the week without. Derived rather than stored, so a task's
 * price always reflects how full the rest of the week already is: the same 2h
 * reading costs more on an overloaded week than a clear one.
 */
export function commitmentCost(s: OasisState, id: string): number {
  const without = { ...s, commitments: s.commitments.filter(c => c.id !== id) }
  return energyFor(without) - energyFor(s)
}

/**
 * What the number would be if these commitments were taken on. Recomputed
 * through the same formula rather than approximated, so the "after" figure on a
 * verdict card can never drift from the one the dashboard shows next.
 */
export function projectEnergy(s: OasisState, candidate: Commitment | Commitment[]): number {
  const added = Array.isArray(candidate) ? candidate : [candidate]
  return energyFor({ ...s, commitments: [...s.commitments, ...added] })
}
