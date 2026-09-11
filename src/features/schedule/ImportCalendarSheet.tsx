import { useRef, useState } from 'react'
import { CalendarPlus, Check, Upload, X } from 'lucide-react'

import { KIND_STYLE, SW, Tag } from '../../ds'
import { addDays, shortDate } from '../../logic/dates'
import { newCommitment } from '../../logic/compose'
import { projectEnergy } from '../../logic/energy'
import { candidatesFrom, IMPORT_WINDOW_DAYS } from '../../logic/calendarImport'
import type { ImportCandidate } from '../../logic/calendarImport'
import { weekStart } from '../../logic/week'
import { useDispatch, useEnergy, useOasis } from '../../state/store'
import { useSheet } from '../shell/useSheet'

// ─── Import a calendar ────────────────────────────────────────────────────────
// Every calendar worth importing already exports iCalendar: Google, Outlook,
// Apple, Notion, every university timetable. So the file IS the integration —
// no account to connect, no network on stage, nothing to sign into in front of
// a judge.
//
// The screen is a review, not a progress bar. It says what it found, what it is
// about to do to the energy score, and what it is leaving alone. An import that
// just happens is one nobody trusts twice.

type Phase =
  | { at: 'waiting' }
  | { at: 'read'; candidates: ImportCandidate[]; total: number }
  | { at: 'failed'; why: string }

export default function ImportCalendarSheet({ onClose }: { onClose: () => void }) {
  const state = useOasis()
  const dispatch = useDispatch()
  const { energy } = useEnergy()
  const ref = useSheet<HTMLDivElement>(onClose, { trap: true })
  const fileRef = useRef<HTMLInputElement>(null)

  const [phase, setPhase] = useState<Phase>({ at: 'waiting' })
  const [ticked, setTicked] = useState<Set<string>>(new Set())

  const from = weekStart(state.today)
  const to = addDays(from, IMPORT_WINDOW_DAYS - 1)
  const windowLabel = `${shortDate(from)} – ${shortDate(to)}`

  const read = async (file: File) => {
    try {
      const text = await file.text()
      const candidates = candidatesFrom(text, state)
      setPhase({ at: 'read', candidates, total: text.split('BEGIN:VEVENT').length - 1 })
      // Anything already on the week starts unticked, so importing the same
      // export twice is a no-op instead of a doubled week.
      setTicked(new Set(candidates.filter(c => !c.duplicate).map(c => c.key)))
    } catch {
      setPhase({ at: 'failed', why: 'That file could not be read. Export again as .ics and try once more.' })
    }
  }

  const toggle = (key: string) => {
    setTicked(prev => {
      const next = new Set(prev)
      if (next.has(key)) next.delete(key)
      else next.add(key)
      return next
    })
  }

  const chosen = phase.at === 'read' ? phase.candidates.filter(c => ticked.has(c.key)) : []

  // Priced through the same function the dashboard gauge uses, so the figure
  // promised here and the figure shown after cannot disagree.
  const after = chosen.length > 0
    ? projectEnergy(state, chosen.map((c, i) => newCommitment(state, c.draft, i)))
    : energy

  const importAll = () => {
    if (chosen.length === 0) return
    dispatch({
      type: 'addCommitments',
      commitments: chosen.map((c, i) => newCommitment(state, c.draft, i)),
    })
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-6"
      style={{ background: 'rgba(0,0,0,0.35)' }}
      onClick={e => { if (e.target === e.currentTarget) onClose() }}>
      <div ref={ref} role="dialog" aria-modal="true" aria-labelledby="import-cal-title" tabIndex={-1}
        className="card card-pop p-5 flex flex-col gap-4 w-full max-w-[560px] max-h-[86vh] overflow-y-auto">

        <div className="flex items-start justify-between gap-3">
          <div className="flex flex-col gap-2">
            <Tag>
              <CalendarPlus size={13} strokeWidth={SW} />
              IMPORT A CALENDAR
            </Tag>
            <h2 id="import-cal-title" className="t-sub text-ink">Bring in the week you already have</h2>
          </div>
          <button onClick={onClose} className="btn-icon focus-ring hit-44" aria-label="Close import">
            <X size={16} strokeWidth={SW} />
          </button>
        </div>

        {phase.at === 'waiting' && (
          <>
            <p className="t-body max-w-[46ch]" style={{ color: 'var(--ink-2)' }}>
              In Google Calendar open <strong>Settings → Import &amp; export → Export</strong> and pick
              the .ics file it gives you. Outlook, Apple Calendar and most university timetables export
              the same format.
            </p>

            <label className="sr-only" htmlFor="import-cal-file">Calendar file</label>
            <input id="import-cal-file" ref={fileRef} type="file" accept=".ics,text/calendar"
              className="sr-only"
              onChange={e => {
                const file = e.target.files?.[0]
                if (file) void read(file)
              }} />
            <button onClick={() => fileRef.current?.click()}
              className="btn btn-primary focus-ring hit-44 flex items-center gap-2 self-start">
              <Upload size={15} strokeWidth={SW} />
              Choose a .ics file
            </button>

            <p className="t-micro" style={{ color: 'var(--ink-muted)', lineHeight: 1.55 }}>
              The file is read on your phone and never uploaded. Oasis has no server to send it to.
            </p>
          </>
        )}

        {phase.at === 'failed' && (
          <p className="t-body" style={{ color: 'var(--ink)' }}>{phase.why}</p>
        )}

        {phase.at === 'read' && phase.candidates.length === 0 && (
          <>
            <p className="t-body max-w-[46ch]" style={{ color: 'var(--ink)' }}>
              {phase.total === 0
                ? 'No events in that file. Check you exported the right calendar.'
                : `That file has ${phase.total} ${phase.total === 1 ? 'event' : 'events'}, but none of them fall in ${windowLabel}. Oasis plans one week at a time.`}
            </p>
            <button onClick={onClose} className="btn btn-secondary focus-ring hit-44 self-start">Close</button>
          </>
        )}

        {phase.at === 'read' && phase.candidates.length > 0 && (
          <>
            <p className="t-body max-w-[46ch]" style={{ color: 'var(--ink-2)' }}>
              {phase.candidates.length} of the {phase.total} events in that file land in {windowLabel}.
              Untick anything you would rather Oasis did not count.
            </p>

            <div className="flex flex-col gap-2">
              {phase.candidates.map(c => {
                const on = ticked.has(c.key)
                return (
                  <div key={c.key} className="flex items-center gap-3 p-3" style={{
                    background: on ? 'var(--surface-2)' : 'var(--surface)',
                    border: '2px solid var(--ink)', borderRadius: 'var(--r-sm)',
                    opacity: on ? 1 : 0.6,
                  }}>
                    <button onClick={() => toggle(c.key)} aria-pressed={on}
                      aria-label={`${on ? 'Skip' : 'Import'} ${c.draft.title}`}
                      className="focus-ring hit-44 shrink-0 flex items-center justify-center"
                      style={{
                        width: 24, height: 24, borderRadius: 'var(--r-sm)',
                        border: '2px solid var(--ink)',
                        background: on ? 'var(--mint-deep)' : 'var(--surface)', cursor: 'pointer',
                      }}>
                      {on && <Check size={14} strokeWidth={3} style={{ color: 'var(--ink)' }} />}
                    </button>

                    <span style={{
                      width: 10, height: 10, borderRadius: 999, flexShrink: 0,
                      background: KIND_STYLE[c.draft.kind].dot, border: '2px solid var(--ink)',
                    }} />

                    <div className="flex flex-col gap-0.5 flex-1 min-w-0">
                      <span className="t-label text-ink">{c.draft.title}</span>
                      <span className="t-micro" style={{ color: 'var(--ink-muted)' }}>
                        {shortDate(c.draft.date)} · {c.draft.time}
                        {c.draft.hours > 0 && ` · ${c.draft.hours}h`}
                        {c.duplicate && ' · already on your week'}
                      </span>
                    </div>
                  </div>
                )
              })}
            </div>

            <div className="flex items-center justify-between gap-3 flex-wrap p-3.5" style={{
              background: 'var(--butter)', border: '2px solid var(--ink)', borderRadius: 'var(--r-sm)',
            }}>
              <span className="t-micro" style={{ color: 'var(--ink)' }}>
                Energy after importing {chosen.length}
              </span>
              <span className="t-sub text-ink">{energy} → {after}</span>
            </div>

            <button onClick={importAll} disabled={chosen.length === 0}
              className="btn btn-primary focus-ring hit-44 self-start"
              style={{ opacity: chosen.length === 0 ? 0.5 : 1 }}>
              Import {chosen.length} {chosen.length === 1 ? 'event' : 'events'}
            </button>
          </>
        )}
      </div>
    </div>
  )
}
