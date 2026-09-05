import { useState } from 'react'
import { AlertTriangle, ArrowUpRight, Calendar, Check, CheckCircle } from 'lucide-react'

import {
  CALENDAR_WEEK, KIND_STYLE, LoadBar, OasisBlob, SW, Tag, WeekCalendar,
  ZoneChip, zoneAccent, zoneTile,
} from '../ds'
import type { CalDay, EventKind, ZoneKey } from '../ds'
import DayDetail from '../features/schedule/DayDetail'

// ─── Schedule & load ──────────────────────────────────────────────────────────
type LoadTab = 'schedule' | 'categories' | 'tasks' | 'commitment'

export default function LoadPage() {
  const [tab, setTab] = useState<LoadTab>('schedule')
  const [selectedDay, setSelectedDay] = useState<CalDay | null>(
    CALENDAR_WEEK.find(d => d.isToday) ?? null
  )
  const [commitPhase, setCommitPhase] = useState<'idle' | 'result'>('idle')
  const [hrs, setHrs] = useState(12)
  const [showAfter, setShowAfter] = useState(false)
  const [deferred, setDeferred] = useState(false)

  const categories = [
    { label: 'Cognitive & Academics', pct: 91, zone: 'red' as ZoneKey, detail: 'DS Assignment 2 + LinAlg exam prep overlapping' },
    { label: 'Calendar Density', pct: 87, zone: 'red' as ZoneKey, detail: '89% occupied slots — less than 30 mins contiguous break' },
    { label: 'Physical Recovery', pct: 54, zone: 'amber' as ZoneKey, detail: 'Sleep averaging 5.4h — below optimal recovery baseline' },
    { label: 'Life Administration', pct: 42, zone: 'amber' as ZoneKey, detail: 'Admin commitments accumulating from last week' },
    { label: 'Social Engagements', pct: 38, zone: 'green' as ZoneKey, detail: 'Restored to calm, sustainable frequency' },
  ]

  const tasks = [
    { label: 'Linear Algebra Quiz Preparation', due: 'Due Wed 10 Sep', cost: -8, zone: 'red' as ZoneKey, movable: false, reason: 'Non-negotiable exam deadline.' },
    { label: 'DS Assignment 2 Programming', due: 'Due Fri 12 Sep', cost: -12, zone: 'amber' as ZoneKey, movable: false, reason: 'High-weight project — start immediately.' },
    { label: 'Web Systems Laboratory Module', due: 'Due Thu 11 Sep', cost: -6, zone: 'amber' as ZoneKey, movable: false, reason: 'Estimated 2.5h effort.' },
    { label: 'Ethics in Tech Case Reading', due: deferred ? 'Deferred to Sat 13 Sep' : 'Due Fri 12 Sep', cost: -4, zone: 'green' as ZoneKey, movable: true, reason: 'Assignment submission window allows 2-day deferral without penalty.' },
  ]

  const tabs: { id: LoadTab; label: string }[] = [
    { id: 'schedule', label: 'Weekly schedule' },
    { id: 'categories', label: 'Load categories' },
    { id: 'tasks', label: 'Smart deferral' },
    { id: 'commitment', label: 'Simulator' },
  ]

  const lead = categories[0]

  return (
    <div className="flex flex-col gap-7 max-w-[1100px] mx-auto pb-4">
      <header className="flex flex-col gap-4">
        <Tag tone="yellow"><Calendar size={13} strokeWidth={SW} /> WEEK OF 8–14 SEPTEMBER</Tag>
        <h1 className="t-hero text-ink">Schedule<br />&amp; load</h1>
        <p className="t-body max-w-[52ch]" style={{ color: 'var(--ink-2)' }}>
          Your week timeline, where the pressure is concentrated, and what you can safely move.
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
            className={`chip chip-lg focus-ring ${tab === t.id ? 'chip-selected' : ''}`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* ── Weekly schedule ─────────────────────────────────────────────────── */}
      {tab === 'schedule' && (
        <div className="card card-pop p-5 sm:p-6 flex flex-col gap-5 page-section-enter">
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

          <WeekCalendar selectedDate={selectedDay?.date ?? null} onDayClick={setSelectedDay} />

          {selectedDay && <DayDetail day={selectedDay} onClose={() => setSelectedDay(null)} />}
        </div>
      )}

      {/* ── Load categories ─────────────────────────────────────────────────── */}
      {tab === 'categories' && (
        <div className="flex flex-col gap-6 page-section-enter">
          <div className={`tile ${zoneTile(lead.zone)} card-pop`} style={{ padding: 24, gap: 12 }}>
            <span className="t-eyebrow" style={{ color: 'var(--ink)' }}>Highest load right now</span>
            <div className="flex items-end justify-between gap-4 flex-wrap">
              <h3 className="t-display text-ink">{lead.label}</h3>
              <span className="t-stat text-ink" style={{ fontSize: 52 }}>{lead.pct}%</span>
            </div>
            <div className="track" style={{ height: 18 }}>
              <div className="bar-fill" style={{ height: '100%', width: `${lead.pct}%`, background: zoneAccent(lead.zone) }} />
            </div>
            <p className="t-body max-w-[56ch]" style={{ color: 'var(--ink-2)' }}>{lead.detail}</p>
          </div>

          <div className="card card-pop p-6 flex flex-col gap-5">
            {categories.slice(1).map((c, i) => (
              <div key={c.label} className="flex items-start gap-4">
                <span className="t-stat" style={{ fontSize: 18, color: 'var(--ink-faint)', width: 24 }}>{i + 2}</span>
                <div className="flex flex-col gap-2 flex-1 min-w-0">
                  <LoadBar label={c.label} pct={c.pct} zone={c.zone} />
                  <p className="t-micro" style={{ color: 'var(--ink-muted)' }}>{c.detail}</p>
                </div>
              </div>
            ))}
          </div>

          <div
            className="flex gap-3 p-5"
            style={{ background: 'var(--blush)', border: '2px solid var(--ink)', borderRadius: 'var(--r-lg)', boxShadow: 'var(--shadow-hard)' }}
          >
            <AlertTriangle size={20} strokeWidth={SW} className="shrink-0 mt-0.5" style={{ color: 'var(--ink)' }} />
            <p className="t-label" style={{ color: 'var(--ink)', lineHeight: 1.5 }}>
              Two primary domains exceed 85%. Taking on additional obligations will cascade into severe fatigue.
            </p>
          </div>
        </div>
      )}

      {/* ── Smart deferral ──────────────────────────────────────────────────── */}
      {tab === 'tasks' && (
        <div className="flex flex-col gap-4 page-section-enter">
          {deferred && (
            <div
              className="flex gap-3 p-4"
              style={{ background: 'var(--mint)', border: '2px solid var(--ink)', borderRadius: 'var(--r-lg)', boxShadow: 'var(--shadow-hard)' }}
            >
              <CheckCircle size={20} strokeWidth={SW} className="shrink-0 mt-0.5" style={{ color: 'var(--ink)' }} />
              <span className="t-label" style={{ color: 'var(--ink)', lineHeight: 1.5 }}>
                Ethics reading deferred to Saturday — frees 4 energy units on Friday.
              </span>
            </div>
          )}

          {tasks.map(t => (
            <div key={t.label} className="card card-pop p-5 flex items-start justify-between gap-4 flex-wrap">
              <div className="flex flex-col items-start gap-1.5 flex-1 min-w-[220px]">
                <span className="t-sub text-ink">{t.label}</span>
                <ZoneChip zone={t.zone} />
                <span className="t-micro" style={{ color: 'var(--ink)', fontWeight: 800 }}>{t.due}</span>
                <span className="t-micro" style={{ color: 'var(--ink-muted)' }}>{t.reason}</span>
              </div>
              <div className="flex flex-col items-end gap-2.5 shrink-0">
                <span className="t-stat text-ink" style={{ fontSize: 22 }}>
                  {t.cost}<span className="t-micro"> pts</span>
                </span>
                {t.movable && !deferred && (
                  <button className="btn btn-accent btn-sm focus-ring" onClick={() => setDeferred(true)}>
                    Defer task
                  </button>
                )}
                {t.movable && deferred && <Tag tone="green"><Check size={12} strokeWidth={SW} /> DEFERRED</Tag>}
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
              <OasisBlob zone={showAfter ? 'red' : 'amber'} size={64} float={false} />
              <div className="flex flex-col">
                <span className="t-sub text-ink">Simulate new commitment</span>
                <span className="t-micro" style={{ color: 'var(--ink-muted)' }}>
                  Test the consequence before you say yes.
                </span>
              </div>
            </div>

            <div className="flex gap-2 flex-wrap">
              {[4, 8, 12, 16, 20].map(h => (
                <button
                  key={h}
                  onClick={() => setHrs(h)}
                  className={`chip chip-lg focus-ring ${hrs === h ? 'chip-selected' : ''}`}
                >
                  {h} hrs/week
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
                <span className="t-stat text-ink" style={{ fontSize: 52 }}>38</span>
                <ZoneChip zone="amber" />
              </div>
              <div className="tile tile-blush card-pop">
                <span className="t-eyebrow" style={{ color: 'var(--ink)' }}>Projected with +{hrs} hrs</span>
                <span className="t-stat text-ink" style={{ fontSize: 52 }}>{showAfter ? 22 : 38}</span>
                <ZoneChip zone={showAfter ? 'red' : 'amber'} />
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
