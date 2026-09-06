import { useState } from 'react'
import { Bus, Check, ClipboardPaste, MapPin, Route, Shuffle } from 'lucide-react'

import { LoadBar, SW, Tag, ZoneChip } from '../../ds'
import {
  MODE_LABEL, SAMPLE_TIMETABLES, mergeSuggestions, parseTimetable, toCommitments,
} from '../../logic/commute'
import { commuteHours, energyFactors, tripDays } from '../../logic/energy'
import { dayOf, shortDate } from '../../logic/dates'
import { WEEK_START } from '../../state/seed'
import { useDispatch, useOasis } from '../../state/store'
import type { CommuteMode } from '../../state/types'

// ─── Commute ──────────────────────────────────────────────────────────────────
// The third thing Oasis is for: the time it takes to get to school. Nothing else
// a student uses counts this, so nothing else can tell them that Tuesday costs
// 80 minutes of travel for one hour of class.
//
// Two halves. The top half is the number — hours on the road, and the points it
// took off. The bottom half is what to do about it: import the timetable so the
// number is yours rather than ours, then merge the trips that do not pay.

const MODES: CommuteMode[] = ['bus', 'car', 'lrt', 'walk']

/** '6h 10m' — the figure the copy quotes, so it is written once. */
function hm(hours: number): string {
  const total = Math.round(hours * 60)
  const h = Math.floor(total / 60)
  const m = total % 60
  if (h === 0) return `${m}m`
  return m === 0 ? `${h}h` : `${h}h ${m}m`
}

export default function CommutePanel() {
  const state = useOasis()
  const dispatch = useDispatch()

  const [text, setText] = useState('')
  const [imported, setImported] = useState<number | null>(null)

  const days = tripDays(state)
  const hours = commuteHours(state)
  const factor = energyFactors(state).find(f => f.key === 'commute')
  const suggestions = mergeSuggestions(state)

  const importTimetable = () => {
    const { classes } = parseTimetable(text)
    if (classes.length === 0) {
      setImported(0)
      return
    }
    dispatch({ type: 'addCommitments', commitments: toCommitments(classes, WEEK_START) })
    setImported(classes.length)
  }

  const parsed = text.trim() === '' ? null : parseTimetable(text)

  return (
    <div className="flex flex-col gap-6">
      {/* ── The number ────────────────────────────────────────────────────── */}
      <section className="card p-5 flex flex-col gap-4">
        <div className="flex items-start justify-between gap-3 flex-wrap">
          <div className="flex flex-col gap-1">
            <span className="t-eyebrow" style={{ color: 'var(--ink-muted)' }}>THIS WEEK ON THE ROAD</span>
            <div className="flex items-baseline gap-3">
              <span className="t-stat text-ink" style={{ fontSize: 40, lineHeight: 1 }}>{hm(hours)}</span>
              {factor && <ZoneChip zone={factor.zone} />}
            </div>
          </div>
          {factor && (
            <div className="flex flex-col items-end gap-1">
              <span className="t-stat text-ink" style={{ fontSize: 22 }}>−{Math.round(factor.cost)} pts</span>
              <span className="t-micro" style={{ color: 'var(--ink-muted)' }}>off your energy</span>
            </div>
          )}
        </div>

        {factor && (
          <LoadBar
            label="Share of the commute budget"
            pct={Math.round(factor.ratio * 100)}
            zone={factor.zone}
          />
        )}

        <p className="t-body" style={{ color: 'var(--ink-2)' }}>
          {days.length} campus {days.length === 1 ? 'day' : 'days'} ·{' '}
          {state.commute.minutesEachWay} minutes each way by{' '}
          {MODE_LABEL[state.commute.mode].toLowerCase()} to {state.commute.campus}.
          That is {hm(hours)} nobody counts as work, and it comes out of the same
          budget your classes do.
        </p>
      </section>

      {/* ── Trip setup ────────────────────────────────────────────────────── */}
      <section className="card p-5 flex flex-col gap-4">
        <span className="t-sub text-ink">
          <MapPin size={17} strokeWidth={SW} className="inline mr-2" />
          Your trip
        </span>

        <div className="flex flex-col gap-2">
          <label className="t-micro" htmlFor="campus" style={{ color: 'var(--ink-muted)' }}>Campus</label>
          <input
            id="campus"
            value={state.commute.campus}
            onChange={e => dispatch({ type: 'setCommute', patch: { campus: e.target.value } })}
            className="t-body focus-ring"
            style={{
              background: 'var(--surface-2)', color: 'var(--ink)',
              border: '2px solid var(--ink)', borderRadius: 'var(--r-sm)',
              padding: '10px 12px', minHeight: 44,
            }}
          />
        </div>

        <div className="flex flex-col gap-2">
          <span className="t-micro" style={{ color: 'var(--ink-muted)' }}>How you get there</span>
          <div className="flex gap-2 flex-wrap" role="group" aria-label="Travel mode">
            {MODES.map(m => (
              <button
                key={m}
                className={`chip chip-lg focus-ring ${state.commute.mode === m ? 'chip-selected' : ''}`}
                aria-pressed={state.commute.mode === m}
                onClick={() => dispatch({ type: 'setCommute', patch: { mode: m } })}
                style={{ minHeight: 44 }}
              >
                <Bus size={14} strokeWidth={SW} /> {MODE_LABEL[m]}
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <label className="t-micro" htmlFor="minutes" style={{ color: 'var(--ink-muted)' }}>
            Door to door, one way — {state.commute.minutesEachWay} minutes
          </label>
          <input
            id="minutes"
            type="range"
            min={5}
            max={120}
            step={5}
            value={state.commute.minutesEachWay}
            onChange={e =>
              dispatch({ type: 'setCommute', patch: { minutesEachWay: Number(e.target.value) } })
            }
            className="focus-ring"
            style={{ accentColor: 'var(--ink)', minHeight: 44 }}
          />
          <span className="t-micro" style={{ color: 'var(--ink-muted)' }}>
            Both directions, {days.length} days a week — {hm(hours)} in total.
          </span>
        </div>
      </section>

      {/* ── Merge trips ───────────────────────────────────────────────────── */}
      <section className="card p-5 flex flex-col gap-4">
        <div className="flex items-center justify-between gap-3">
          <span className="t-sub text-ink">
            <Shuffle size={17} strokeWidth={SW} className="inline mr-2" />
            Trips worth merging
          </span>
          {state.commute.skippedDays.length > 0 && (
            <span className="t-micro" style={{ color: 'var(--ink-muted)' }}>
              {state.commute.skippedDays.length} merged
            </span>
          )}
        </div>

        {suggestions.length === 0 ? (
          <p className="t-body" style={{ color: 'var(--ink-2)' }}>
            Every campus day is carrying enough class to be worth the trip. Nothing
            to merge.
          </p>
        ) : (
          <div className="flex flex-col gap-3">
            {suggestions.map(s => (
              <div
                key={s.date}
                className="flex flex-col gap-3 p-4"
                style={{
                  background: 'var(--butter)',
                  border: '2px solid var(--ink)',
                  borderRadius: 'var(--r-md)',
                }}
              >
                <span className="t-label text-ink">
                  {dayOf(s.date)}: {hm(s.travelHours)} of travel for {hm(s.classHours)} of class
                </span>
                <span className="t-micro" style={{ color: 'var(--ink)', lineHeight: 1.55 }}>
                  {s.titles.join(' and ')} {s.titles.length === 1 ? 'is' : 'are'} the only
                  {s.titles.length === 1 ? ' thing' : ' things'} on campus that day.
                  {s.moveTo
                    ? ` Ask to join the ${dayOf(s.moveTo)} session and the trip disappears.`
                    : ' A consult or a recording removes the trip entirely.'}
                </span>
                <button
                  className="btn btn-primary focus-ring self-start"
                  onClick={() => dispatch({ type: 'toggleTrip', date: s.date })}
                >
                  <Route size={16} strokeWidth={SW} /> Skip this trip
                </button>
              </div>
            ))}
          </div>
        )}

        {state.commute.skippedDays.length > 0 && (
          <div className="flex flex-col gap-2 pt-1">
            <span className="t-micro" style={{ color: 'var(--ink-muted)' }}>MERGED AWAY</span>
            <div className="flex gap-2 flex-wrap">
              {state.commute.skippedDays.map(d => (
                <button
                  key={d}
                  className="chip focus-ring"
                  onClick={() => dispatch({ type: 'toggleTrip', date: d })}
                  style={{ minHeight: 34 }}
                >
                  <Check size={13} strokeWidth={SW} /> {shortDate(d)} · undo
                </button>
              ))}
            </div>
          </div>
        )}
      </section>

      {/* ── Import a timetable ────────────────────────────────────────────── */}
      <section className="card p-5 flex flex-col gap-4">
        <span className="t-sub text-ink">
          <ClipboardPaste size={17} strokeWidth={SW} className="inline mr-2" />
          Import your timetable
        </span>
        <p className="t-body" style={{ color: 'var(--ink-2)' }}>
          Paste it straight from your student portal. One class per line —
          <code style={{ color: 'var(--ink)' }}> MON 0900-1100 DES2201</code>.
        </p>

        <div className="flex gap-2 flex-wrap">
          {SAMPLE_TIMETABLES.map(t => (
            <button
              key={t.name}
              className="chip focus-ring"
              onClick={() => { setText(t.text); setImported(null) }}
              style={{ minHeight: 34 }}
            >
              {t.name}
            </button>
          ))}
        </div>

        <label className="sr-only" htmlFor="timetable">Timetable text</label>
        <textarea
          id="timetable"
          value={text}
          onChange={e => { setText(e.target.value); setImported(null) }}
          rows={6}
          placeholder={'MON 0900-1100 DES2201\nWED 1400-1600 MTH1114'}
          className="t-body focus-ring"
          style={{
            background: 'var(--surface-2)', color: 'var(--ink)',
            border: '2px solid var(--ink)', borderRadius: 'var(--r-md)',
            padding: 12, resize: 'vertical', lineHeight: 1.6,
          }}
        />

        {parsed && (
          <div className="flex flex-col gap-2" aria-live="polite">
            <span className="t-micro" style={{ color: 'var(--ink-muted)' }}>
              {parsed.classes.length} {parsed.classes.length === 1 ? 'class' : 'classes'} read
              {parsed.skipped.length > 0 &&
                ` · ${parsed.skipped.length} line${parsed.skipped.length === 1 ? '' : 's'} not understood`}
            </span>
            {parsed.skipped.slice(0, 3).map(line => (
              <span key={line} className="t-micro" style={{ color: 'var(--ink-2)' }}>
                Skipped: {line}
              </span>
            ))}
          </div>
        )}

        <div className="flex gap-3 items-center flex-wrap">
          <button
            className="btn btn-primary focus-ring"
            onClick={importTimetable}
            disabled={text.trim() === ''}
            style={{ opacity: text.trim() === '' ? 0.5 : 1 }}
          >
            Add to my week
          </button>
          {imported !== null && (
            <Tag tone={imported > 0 ? 'green' : 'red'}>
              {imported > 0 ? `${imported} ADDED` : 'NOTHING READ — CHECK THE FORMAT'}
            </Tag>
          )}
        </div>
      </section>
    </div>
  )
}
