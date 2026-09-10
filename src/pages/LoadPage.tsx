import { useState } from 'react'
import { AlertTriangle, ArrowUpRight, Calendar, Check, CheckCircle, HelpCircle } from 'lucide-react'

import {
  KIND_STYLE, LoadBar, OasisBlob, SW, Tag, WeekCalendar,
  ZoneChip, ZONE_LABEL, zoneAccent, zoneTile,
} from '../ds'
import type { CalDay, EventKind, ZoneKey } from '../ds'
import { useDispatch, useEnergy, useOasis } from '../state/store'
import { seedFor } from '../state/seed'
import { commitmentCost, projectEnergy, zoneFor } from '../logic/energy'
import { addDays, dateOf, shortDate } from '../logic/dates'
import { weekDays, weekLabel } from '../logic/week'
import DayDetail from '../features/schedule/DayDetail'
import AcademicDDLRadar from '../features/schedule/AcademicDDLRadar'

// ─── Schedule & load ──────────────────────────────────────────────────────────
type LoadTab = 'schedule' | 'categories' | 'tasks' | 'commitment'

/** Deferring buys you the weekend. Two days is the window a submission
 *  extension normally allows without penalty. */
const DEFER_DAYS = 2

/** How heavy one task is on its own — a fifth of the whole budget reads red, a
 *  tenth amber. Separate from zoneFor(), which scores a week rather than a task. */
const taskZone = (cost: number): ZoneKey =>
  cost >= 20 ? 'red' : cost >= 10 ? 'amber' : 'green'

export default function LoadPage({ onGoHow }: { onGoHow: () => void }) {
  const state = useOasis()
  const dispatch = useDispatch()
  const { energy, factors } = useEnergy()

  const [tab, setTab] = useState<LoadTab>('schedule')
  // The week is derived, so the selection is held as a date rather than as a
  // CalDay object — otherwise deferring a task would leave the open day detail
  // showing a copy of the week from before the move. Opens on today; null is
  // closed.
  const [selectedDate, setSelectedDate] = useState<number | null>(
    () => dateOf(state.today),
  )
  const [commitPhase, setCommitPhase] = useState<'idle' | 'result'>('idle')
  const [hrs, setHrs] = useState(2)
  const [showAfter, setShowAfter] = useState(false)

  const days = weekDays(state)
  const selectedDay = days.find(d => d.date === selectedDate) ?? null

  // The five factors, heaviest first — the same five the dashboard gauge and
  // the band page read. "Load categories" is this list with a bar on it.
  const categories = [...factors]
    .sort((a, b) => b.ratio - a.ratio)
    .map(f => ({
      key: f.key,
      label: f.label,
      pct: Math.min(100, Math.round(f.ratio * 100)),
      zone: f.zone,
      detail: f.detail,
    }))

  const lead = categories[0]
  const overloaded = categories.filter(c => c.zone === 'red')

  // What a task has actually been moved to, versus where the week started.
  // seedFor is pure, so this is a derivation and not a second source of truth.
  const seeded = new Map(seedFor(state.scenario).commitments.map(c => [c.id, c.date]))

  // Everything with real effort behind it, priciest first. Cost is measured
  // against this week specifically — the same 2h reading is worth more when
  // the rest of the week is already full.
  const tasks = state.commitments
    .filter(c => c.hours > 0 && c.kind !== 'rest')
    .map(c => ({ ...c, cost: commitmentCost(state, c.id), moved: seeded.get(c.id) !== c.date }))
    .sort((a, b) => b.cost - a.cost)
    .slice(0, 5)

  const tabs: { id: LoadTab; label: string }[] = [
    { id: 'schedule', label: 'Weekly schedule' },
    { id: 'categories', label: 'Load categories' },
    { id: 'tasks', label: 'Smart deferral' },
    { id: 'commitment', label: 'Simulator' },
  ]

  // The simulator prices a candidate through the same function the dashboard
  // uses, so "projected" and "what you'd actually see" can never disagree.
  const projected = projectEnergy(state, {
    id: 'sim-candidate', title: `Simulated commitment (+${hrs}h/day)`, kind: 'commitment',
    date: state.today, time: 'daily', hours: hrs * 5, movable: false, origin: 'seed',
  })

  return (
    <div className="flex flex-col gap-7 max-w-[1100px] mx-auto pb-4">
      <header className="flex flex-col gap-4">
        <Tag tone="yellow"><Calendar size={13} strokeWidth={SW} />{weekLabel(state.today)}</Tag>
        <h1 className="t-hero text-ink">Schedule<br />&amp; load</h1>
        <p className="t-body max-w-[52ch]" style={{ color: 'var(--ink-2)' }}>
          Track deadlines, weekly pressure, and flexible tasks.
        </p>
      </header>

      {/* Chip tabs — the selection pattern from the references, in place of the
          kit tab bar, so the active state is a flat yellow flood. */}
      <div className="flex gap-2 flex-wrap" role="tablist">
        {tabs.map(t => (
          <button
            key={t.id}
            role="tab"
            aria-selected={tab === t.id}
            onClick={() => setTab(t.id)}
            className={`chip chip-lg focus-ring hit-44 ${tab === t.id ? 'chip-selected' : ''}`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* ── Weekly schedule ─────────────────────────────────────────────────── */}
      {tab === 'schedule' && (
        <div className="flex flex-col gap-5 page-section-enter">
          <AcademicDDLRadar
            onSelectDate={date => setSelectedDate(date)}
            selectedDate={selectedDay?.date ?? null}
          />

          <div className="card card-pop p-5 sm:p-6 flex flex-col gap-5">
            <div className="flex items-center justify-between flex-wrap gap-3">
              <span className="t-sub text-ink">Interactive schedule</span>
            <div className="flex items-center gap-3 flex-wrap">
              {[
                { label: 'Deadline', kind: 'deadline' as EventKind },
                { label: 'Commitment', kind: 'commitment' as EventKind },
                { label: 'Class', kind: 'class' as EventKind },
                { label: 'Rest', kind: 'rest' as EventKind },
              ].map(l => (
                <div key={l.label} className="flex items-center gap-1.5">
                  <span style={{
                    width: 9, height: 9, borderRadius: 999,
                    background: KIND_STYLE[l.kind].dot, border: '1.5px solid var(--ink)',
                  }} />
                  <span className="t-micro" style={{ color: 'var(--ink-2)' }}>{l.label}</span>
                </div>
              ))}
            </div>
          </div>

          <WeekCalendar
            days={days}
            selectedDate={selectedDay?.date ?? null}
            onDayClick={(d: CalDay) => setSelectedDate(d.date)}
          />

            {selectedDay && selectedDay.events.length > 0 && (
              <DayDetail day={selectedDay} onClose={() => setSelectedDate(null)} />
            )}
          </div>
        </div>
      )}

      {/* ── Load categories ─────────────────────────────────────────────────── */}
      {tab === 'categories' && (
        <div className="flex flex-col gap-6 page-section-enter">
          <div className={`tile ${zoneTile(lead.zone)} card-pop`} style={{ padding: 24, gap: 12 }}>
            <span className="t-eyebrow" style={{ color: 'var(--ink)' }}>Highest load right now</span>
            <div className="flex items-end justify-between gap-4 flex-wrap">
              <h2 className="t-display text-ink">{lead.label}</h2>
              <span className="t-stat text-ink" style={{ fontSize: 52 }}>{lead.pct}%</span>
            </div>
            <div className="track" style={{ height: 18 }}>
              <div className="bar-fill" style={{ height: '100%', width: `${lead.pct}%`, background: zoneAccent(lead.zone) }} />
            </div>
            <p className="t-body max-w-[56ch]" style={{ color: 'var(--ink-2)' }}>{lead.detail}</p>
          </div>

          {/* The same way out as the one under the dashboard gauge. A percentage
              a student cannot interrogate is a percentage they will not act on. */}
          <button
            className="chip focus-ring self-start"
            onClick={onGoHow}
            style={{ minHeight: 44 }}
            aria-label="How is this worked out? The load figures, explained"
          >
            <HelpCircle size={14} strokeWidth={SW} /> How is this worked out?
          </button>

          <div className="card card-pop p-6 flex flex-col gap-5">
            {categories.slice(1).map((c, i) => (
              <div key={c.key} className="flex items-start gap-4">
                {/* The rank is information — it is what makes this a ranked list — so it
                    is muted rather than faint. --ink-faint measured 2.25:1 here. */}
                <span className="t-stat" style={{ fontSize: 18, color: 'var(--ink-muted)', width: 24 }}>{i + 2}</span>
                <div className="flex flex-col gap-2 flex-1 min-w-0">
                  <LoadBar label={c.label} pct={c.pct} zone={c.zone} />
                  <p className="t-micro" style={{ color: 'var(--ink-muted)' }}>{c.detail}</p>
                </div>
              </div>
            ))}
          </div>

          <div
            className="flex gap-3 p-5"
            style={{ background: overloaded.length ? 'var(--blush)' : 'var(--mint)', border: '2px solid var(--ink)', borderRadius: 'var(--r-lg)', boxShadow: 'var(--shadow-hard)' }}
          >
            <AlertTriangle size={20} strokeWidth={SW} className="shrink-0 mt-0.5" style={{ color: 'var(--ink)' }} />
            <p className="t-label" style={{ color: 'var(--ink)', lineHeight: 1.5 }}>
              {overloaded.length === 0
                ? 'All domains healthy. Capacity available.'
                : `High load: ${overloaded.map(c => c.label).join(', ')} in red zone.`}
            </p>
          </div>
        </div>
      )}

      {/* ── Smart deferral ──────────────────────────────────────────────────── */}
      {tab === 'tasks' && (
        <div className="flex flex-col gap-4 page-section-enter">
          {tasks.some(t => t.moved) && (
            <div
              className="flex gap-3 p-4"
              style={{ background: 'var(--mint)', border: '2px solid var(--ink)', borderRadius: 'var(--r-lg)', boxShadow: 'var(--shadow-hard)' }}
              role="status"
            >
              <CheckCircle size={20} strokeWidth={SW} className="shrink-0 mt-0.5" style={{ color: 'var(--ink)' }} />
              <span className="t-label" style={{ color: 'var(--ink)', lineHeight: 1.5 }}>
                {tasks.filter(t => t.moved).map(t => t.title).join(', ')} moved back — you are on{' '}
                {energy} energy, {ZONE_LABEL[zoneFor(energy)].toLowerCase()}.
              </span>
            </div>
          )}

          {tasks.length === 0 && (
            <div className="card p-6">
              <p className="t-body" style={{ color: 'var(--ink-2)' }}>
                No heavy tasks scheduled. All clear.
              </p>
            </div>
          )}

          {tasks.map(t => (
            <div key={t.id} className="card card-pop p-5 flex items-start justify-between gap-4 flex-wrap">
              <div className="flex flex-col items-start gap-1.5 flex-1 min-w-[220px]">
                <span className="t-sub text-ink">{t.title}</span>
                <ZoneChip zone={taskZone(t.cost)} />
                <span className="t-micro" style={{ color: 'var(--ink)', fontWeight: 800 }}>
                  {t.moved ? 'Moved to' : 'Due'} {shortDate(t.date)}
                </span>
                <span className="t-micro" style={{ color: 'var(--ink-muted)' }}>
                  {t.reason ?? `Estimated ${t.hours}h of effort.`}
                </span>
              </div>
              <div className="flex flex-col items-end gap-2.5 shrink-0">
                <span className="t-stat text-ink" style={{ fontSize: 22 }}>
                  −{t.cost}<span className="t-micro"> pts</span>
                </span>
                {t.movable && !t.moved && (
                  <button
                    className="btn btn-accent btn-sm focus-ring hit-44"
                    onClick={() => dispatch({
                      type: 'deferCommitment', id: t.id, toDate: addDays(t.date, DEFER_DAYS),
                    })}
                  >
                    Defer {DEFER_DAYS} days
                  </button>
                )}
                {t.movable && t.moved && <Tag tone="green"><Check size={12} strokeWidth={SW} /> DEFERRED</Tag>}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── Commitment simulator ────────────────────────────────────────────── */}
      {tab === 'commitment' && (
        <div className="flex flex-col gap-4 page-section-enter">
          <div className="card card-pop p-6 flex flex-col gap-5">
            <div className="flex items-center gap-3">
              <OasisBlob zone={zoneFor(showAfter ? projected : energy)} size={64} float={false} />
              <div className="flex flex-col">
                <span className="t-sub text-ink">Simulate new commitment</span>
                <span className="t-micro" style={{ color: 'var(--ink-muted)' }}>
                  Test the consequence before you say yes.
                </span>
              </div>
            </div>

            <div className="flex gap-2 flex-wrap">
              {[1, 2, 3, 4, 5].map(h => (
                <button
                  key={h}
                  onClick={() => setHrs(h)}
                  className={`chip chip-lg focus-ring hit-44 ${hrs === h ? 'chip-selected' : ''}`}
                >
                  {h} {h === 1 ? 'hr/day' : 'hrs/day'}
                </button>
              ))}
            </div>

            <button
              className="btn btn-primary focus-ring self-start"
              onClick={() => { setCommitPhase('result'); setTimeout(() => setShowAfter(true), 600) }}
            >
              Run full impact check <ArrowUpRight size={16} strokeWidth={SW} />
            </button>
          </div>

          {commitPhase === 'result' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="tile tile-butter card-pop">
                <span className="t-eyebrow" style={{ color: 'var(--ink)' }}>Current energy</span>
                <span className="t-stat text-ink" style={{ fontSize: 52 }}>{energy}</span>
                <ZoneChip zone={zoneFor(energy)} />
              </div>
              <div className="tile tile-blush card-pop">
                <span className="t-eyebrow" style={{ color: 'var(--ink)' }}>Projected with +{hrs} {hrs === 1 ? 'hr/day' : 'hrs/day'}</span>
                <span className="t-stat text-ink" style={{ fontSize: 52 }}>{showAfter ? projected : energy}</span>
                <ZoneChip zone={zoneFor(showAfter ? projected : energy)} />
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
