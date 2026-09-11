import { useState } from 'react'
import { Plus, X } from 'lucide-react'

import { KIND_STYLE, SW } from '../../ds'
import type { EventKind } from '../../ds'
import { addDays, dateOf, dayOf } from '../../logic/dates'
import { DEFAULT_HOURS, MAX_HOURS, newCommitment } from '../../logic/compose'
import { weekStart } from '../../logic/week'
import { useDispatch, useOasis } from '../../state/store'

// ─── Add to this week ─────────────────────────────────────────────────────────
// The schedule was readable and unwritable, which made every number on it an
// argument the student could not answer. Only the seven days the app plans are
// offered: a date picker that accepts March would produce a commitment no
// screen renders.

const KINDS: { kind: EventKind; label: string }[] = [
  { kind: 'deadline', label: 'Deadline' },
  { kind: 'commitment', label: 'Commitment' },
  { kind: 'class', label: 'Class' },
  { kind: 'rest', label: 'Rest' },
]

const DAYS_IN_WEEK = 7

export default function AddCommitmentForm({ onAdded }: { onAdded: (date: string) => void }) {
  const state = useOasis()
  const dispatch = useDispatch()

  const [open, setOpen] = useState(false)
  const [title, setTitle] = useState('')
  const [kind, setKind] = useState<EventKind>('commitment')
  const [date, setDate] = useState(state.today)
  const [hours, setHours] = useState(DEFAULT_HOURS.commitment)
  const [time, setTime] = useState('')

  const start = weekStart(state.today)
  const week = Array.from({ length: DAYS_IN_WEEK }, (_, i) => addDays(start, i))

  const reset = () => {
    setTitle(''); setKind('commitment'); setDate(state.today)
    setHours(DEFAULT_HOURS.commitment); setTime(''); setOpen(false)
  }

  // Switching kind re-defaults the hours: the figure that is right for a
  // deadline is not right for a rest block, and rest costing 3h would read as
  // the app punishing you for recovering.
  const pickKind = (k: EventKind) => { setKind(k); setHours(DEFAULT_HOURS[k]) }

  const submit = () => {
    const clean = title.trim()
    if (!clean) return
    dispatch({
      type: 'addCommitments',
      commitments: [newCommitment(state, {
        title: clean,
        kind,
        date,
        time: time.trim() || 'all day',
        hours: kind === 'rest' ? 0 : hours,
        origin: 'manual',
      })],
    })
    // Jump to the day it landed on. An add that leaves you looking elsewhere is
    // indistinguishable from an add that failed.
    onAdded(date)
    reset()
  }

  if (!open) {
    return (
      <button onClick={() => setOpen(true)}
        className="btn btn-secondary focus-ring hit-44 flex items-center gap-2">
        <Plus size={15} strokeWidth={SW} />
        Add to this week
      </button>
    )
  }

  return (
    <div className="flex flex-col gap-4 p-4 w-full" style={{
      background: 'var(--surface-2)', border: '2px solid var(--ink)', borderRadius: 'var(--r-md)',
    }}>
      <div className="flex items-center justify-between gap-3">
        <span className="t-sub text-ink">Add to this week</span>
        <button onClick={reset} className="btn-icon focus-ring hit-44" aria-label="Cancel adding to the week">
          <X size={16} strokeWidth={SW} />
        </button>
      </div>

      <label className="sr-only" htmlFor="new-commitment-title">What is it</label>
      <input id="new-commitment-title" value={title}
        onChange={e => setTitle(e.target.value)}
        onKeyDown={e => { if (e.key === 'Enter') submit() }}
        placeholder="Statistics problem set"
        className="t-body focus-ring w-full p-3"
        style={{
          background: 'var(--surface)', color: 'var(--ink)',
          border: '2px solid var(--ink)', borderRadius: 'var(--r-sm)', minHeight: 44,
        }} />

      <div className="flex flex-col gap-2">
        <span className="t-micro" style={{ color: 'var(--ink-muted)' }}>Kind</span>
        <div className="flex gap-2 flex-wrap" role="group" aria-label="Kind of commitment">
          {KINDS.map(k => (
            <button key={k.kind} onClick={() => pickKind(k.kind)} aria-pressed={kind === k.kind}
              className={`chip focus-ring hit-44 flex items-center gap-1.5 ${kind === k.kind ? 'chip-selected' : ''}`}>
              <span style={{
                width: 9, height: 9, borderRadius: 999,
                background: KIND_STYLE[k.kind].dot, border: '1.5px solid var(--ink)',
              }} />
              {k.label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <span className="t-micro" style={{ color: 'var(--ink-muted)' }}>Day</span>
        <div className="flex gap-2 flex-wrap" role="group" aria-label="Day of the week">
          {week.map(isoDay => (
            <button key={isoDay} onClick={() => setDate(isoDay)} aria-pressed={date === isoDay}
              className={`chip focus-ring hit-44 ${date === isoDay ? 'chip-selected' : ''}`}>
              {dayOf(isoDay)} {dateOf(isoDay)}
            </button>
          ))}
        </div>
      </div>

      <div className="flex gap-3 flex-wrap">
        <div className="flex flex-col gap-2">
          <label className="t-micro" style={{ color: 'var(--ink-muted)' }} htmlFor="new-commitment-time">Time</label>
          <input id="new-commitment-time" value={time} onChange={e => setTime(e.target.value)}
            placeholder="2pm" className="t-body focus-ring p-3"
            style={{
              background: 'var(--surface)', color: 'var(--ink)', border: '2px solid var(--ink)',
              borderRadius: 'var(--r-sm)', minHeight: 44, width: 120,
            }} />
        </div>

        {/* Rest costs nothing by definition, so asking how many hours it takes
            would invite the student to price their own recovery. */}
        {kind !== 'rest' && (
          <div className="flex flex-col gap-2">
            <label className="t-micro" style={{ color: 'var(--ink-muted)' }} htmlFor="new-commitment-hours">
              Hours of effort
            </label>
            <input id="new-commitment-hours" type="number" min={0} max={MAX_HOURS} step={0.5} value={hours}
              onChange={e => setHours(Math.min(Number(e.target.value) || 0, MAX_HOURS))}
              className="t-body focus-ring p-3"
              style={{
                background: 'var(--surface)', color: 'var(--ink)', border: '2px solid var(--ink)',
                borderRadius: 'var(--r-sm)', minHeight: 44, width: 100,
              }} />
          </div>
        )}
      </div>

      <button onClick={submit} disabled={title.trim() === ''}
        className="btn btn-primary focus-ring hit-44 self-start"
        style={{ opacity: title.trim() === '' ? 0.5 : 1 }}>
        Add it
      </button>
    </div>
  )
}
