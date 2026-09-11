import { Check } from 'lucide-react'

import type { Pattern } from '../../logic/pattern'
import { MAX_PATTERNS, patternsFor } from '../../logic/pattern'
import { useDispatch, useOasis } from '../../state/store'
import EmotionBlob, { EMOTIONS } from '../avatars/EmotionBlob'

// --- Your pattern -----------------------------------------------------------
// Four cards, pick up to three. Two halves meet on each one: the label is the
// student's own words about themselves, and the figure under it is what Oasis
// has actually seen -- with the sentence that produced it, which is the rule the
// whole app is built on and the thing a "79% match" on its own cannot keep.
//
// Every card shows its figure whether or not it is picked. Selecting is not
// unlocking: it marks the ones the student recognises, and it is changeable at
// any time, with no confirm step, because a self-description you cannot take
// back is a label.

export default function PatternCards() {
  const state = useOasis()
  const dispatch = useDispatch()

  const patterns = patternsFor(state)
  const picked = state.profile.patterns
  const atCap = picked.length >= MAX_PATTERNS

  return (
    <section className="flex flex-col gap-4">
      <div className="flex items-end justify-between gap-3 flex-wrap">
        <div className="flex flex-col gap-1">
          <span className="t-sub text-ink">Your pattern</span>
          <span className="t-micro" style={{ color: 'var(--ink-muted)' }}>
            Which of these is you? Pick up to {MAX_PATTERNS}. The figures are
            what Oasis has seen either way.
          </span>
        </div>
        <span className="t-micro" style={{ color: 'var(--ink-muted)' }}>
          {picked.length}/{MAX_PATTERNS} picked
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {patterns.map(p => (
          <PatternCard
            key={p.key}
            pattern={p}
            selected={picked.includes(p.key)}
            locked={atCap && !picked.includes(p.key)}
            onToggle={() => dispatch({ type: 'togglePattern', pattern: p.key })}
          />
        ))}
      </div>
    </section>
  )
}

/**
 * One card. The blob carries the feeling, the percentage carries the claim and
 * the line under it carries the proof. An empty pattern keeps its card and says
 * it has nothing to read rather than printing a 0% it cannot defend -- which is
 * the state the first card is in before a single request has been answered.
 */
function PatternCard({ pattern, selected, locked, onToggle }: {
  pattern: Pattern
  selected: boolean
  locked: boolean
  onToggle: () => void
}) {
  const { label, pct, receipt, empty, avatar } = pattern

  return (
    <button
      onClick={onToggle}
      aria-pressed={selected}
      aria-disabled={locked || undefined}
      className="focus-ring press flex flex-col gap-3 p-4 text-left"
      style={{
        // The pastel the blob is drawn in, so the grid reads as four different
        // states at a glance -- the reference design's whole idea, in tokens
        // this app already ships.
        background: selected ? EMOTIONS[avatar].fill : 'var(--surface)',
        border: '2px solid var(--ink)',
        borderRadius: 'var(--r-md)',
        boxShadow: selected ? 'var(--shadow-hard-sm)' : 'none',
        opacity: locked ? 0.55 : 1,
        cursor: locked ? 'not-allowed' : 'pointer',
        transition: 'background-color 0.2s var(--ease), box-shadow 0.16s var(--ease)',
      }}
    >
      <div className="flex items-start justify-between gap-2 w-full">
        <EmotionBlob emotion={avatar} size={52} float={false} hideFromScreenReaders />
        {selected && (
          <span
            className="shrink-0 flex items-center justify-center"
            style={{
              width: 24,
              height: 24,
              borderRadius: 'var(--r-sm)',
              background: 'var(--surface)',
              border: '2px solid var(--ink)',
            }}
          >
            <Check size={14} strokeWidth={3} style={{ color: 'var(--ink)' }} />
          </span>
        )}
      </div>

      <span className="t-label text-ink">{label}</span>

      <div className="flex items-baseline gap-2">
        <span className="t-stat text-ink" style={{ fontSize: 26, lineHeight: 1 }}>
          {empty ? '--' : `${pct}%`}
        </span>
        <span className="t-micro" style={{ color: 'var(--ink-2)' }}>
          {empty ? 'nothing to read yet' : 'of what Oasis has seen'}
        </span>
      </div>

      <span className="t-micro" style={{ color: 'var(--ink-muted)', lineHeight: 1.45 }}>
        {receipt}
      </span>
    </button>
  )
}
