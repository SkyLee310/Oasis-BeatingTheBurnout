import { useState } from 'react'
import {
  AlertTriangle, Calendar, ChevronRight, Clock, Heart, HelpCircle,
  MessageSquare, Moon, Shield, TrendingUp, Zap,
} from 'lucide-react'

import {
  CircularGauge, Initials, KIND_STYLE, OasisBlob, SW,
  SleepBars, Sparkline, Tag, ZoneChip, ZONE_LABEL,
} from '../ds'
import { useEnergy, useOasis } from '../state/store'
import { commitmentCost, projectEnergy, zoneFor } from '../logic/energy'
import { dateOf, dayOf, longDate, shortDate } from '../logic/dates'
import { lowerFirst } from '../logic/text'
import DailyCheck from '../features/checkin/DailyCheck'
import DecisionSheet from '../features/decision/DecisionSheet'

const WEEKDAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

/** A rolling band trace, held as offsets from the resting figure — so the
 *  waveform follows the store instead of sitting on a frozen 78 bpm. */
const HR_TRACE = [-4, -2, 1, 4, 0, 2, -1, 0, 3, 0, -2, 1]

// ─── Dashboard ────────────────────────────────────────────────────────────────
export default function DashboardPage({ onGoLoad, onGoRecovery, onGoBand, onGoHow }: {
  onGoLoad: () => void; onGoRecovery: () => void; onGoBand: () => void
  onGoHow: () => void
}) {
  const [showCommit, setShowCommit] = useState(false)
  // The other way in. Same sheet, different phase: with no request passed it
  // opens at the intake, which is the only route to it — the rail below only
  // exists when someone has already asked.
  const [showIntake, setShowIntake] = useState(false)
  // Dismissing is local, not stored: skipping today should not skip tomorrow.
  const [checkHidden, setCheckHidden] = useState(false)

  const state = useOasis()
  const { energy, zone, factors } = useEnergy()

  const { restingHr, hrBaseline, sleepHours } = state.recovery
  const hrValues = HR_TRACE.map(d => restingHr + d)
  const overBaseline = restingHr - hrBaseline

  const todayName = dayOf(state.today)
  const sleepData = sleepHours.map((hours, i) => ({
    day: WEEKDAYS[i], hours, isToday: WEEKDAYS[i] === todayName,
  }))
  const avgNight = sleepHours.length
    ? sleepHours.reduce((a, b) => a + b, 0) / sleepHours.length
    : 0

  const top = [...factors].sort((a, b) => b.cost - a.cost)[0]
  const sleepZone = factors.find(f => f.key === 'sleep')?.zone ?? 'green'
  const hrZone = factors.find(f => f.key === 'physiological')?.zone ?? 'green'

  // Only what today should do (chronological schedule & tasks for today)
  const todayTasks = state.commitments
    .filter(c => c.date === state.today)
    .sort((a, b) => {
      const parseTime = (t: string) => {
        const m = t.match(/(\d+)(?::(\d+))?\s*(am|pm)/i)
        if (!m) return 999
        let h = parseInt(m[1], 10)
        if (m[3].toLowerCase() === 'pm' && h < 12) h += 12
        if (m[3].toLowerCase() === 'am' && h === 12) h = 0
        const mins = m[2] ? parseInt(m[2], 10) : 0
        return h * 60 + mins
      }
      return parseTime(a.time) - parseTime(b.time)
    })

  // The open ask. Priced through projectEnergy so the figure quoted here is
  // exactly the one the dashboard will show if it is accepted — one formula,
  // nothing to drift.
  const pending = state.requests.find(r => r.status === 'pending')
  const pendingAfter = pending
    ? projectEnergy(state, {
        id: `candidate-${pending.id}`,
        title: pending.parsed.title,
        kind: 'commitment',
        date: pending.parsed.deadline ?? state.today,
        time: 'all day',
        hours: pending.parsed.hoursPerWeek,
        movable: false,
        origin: 'chat',
      })
    : energy

  return (
    <div className="flex flex-col gap-8 sm:gap-10 max-w-[1140px] mx-auto pb-4">

      {/* ── Daily check ─────────────────────────────────────────────────────── */}
      {!checkHidden && state.checkIn?.date !== state.today && (
        <DailyCheck onDismiss={() => setCheckHidden(true)} />
      )}

      {/* ── Hero ────────────────────────────────────────────────────────────── */}
      <header className="flex flex-col gap-6">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-3">
            <Initials size={44} />
            <div className="flex flex-col">
              <span className="t-eyebrow">{longDate(state.today)}</span>
              <span className="t-label text-ink">Good morning, Maya</span>
            </div>
          </div>
          <Tag tone={zone}><Zap size={13} strokeWidth={SW} /> TODAY&apos;S READING</Tag>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-between gap-6 p-6 card card-pop" style={{ background: 'var(--surface)' }}>
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-1">
              <span className="t-eyebrow" style={{ color: 'var(--ink-muted)' }}>CURRENT STATUS</span>
              <div className="flex items-center gap-2">
                <span className="t-title text-ink font-bold">Energy: {energy}/100</span>
                <Tag tone={zone}>{ZONE_LABEL[zone]}</Tag>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-3 pt-1">
              <button className="btn btn-primary focus-ring" onClick={onGoRecovery}>
                <Shield size={16} strokeWidth={SW} /> Build recovery plan
              </button>
              <button className="btn btn-secondary focus-ring" onClick={onGoLoad}>
                Review load <ChevronRight size={15} strokeWidth={SW} />
              </button>
            </div>
          </div>

          <div className="flex flex-col items-center gap-2">
            <div className="flex items-center justify-center gap-4 sm:gap-6">
              <OasisBlob zone={zone} size={96} />
              <CircularGauge
                value={energy} zone={zone}
                label={String(energy)} sublabel="/ 100 ENERGY" size={144}
              />
            </div>
            <button
              className="chip focus-ring"
              onClick={onGoHow}
              style={{ minHeight: 32 }}
              aria-label="How this energy score is worked out"
            >
              <HelpCircle size={13} strokeWidth={SW} /> How is this worked out?
            </button>
          </div>
        </div>
      </header>

      {/* ── Consolidated live biometrics dashboard ─────────────────────────── */}
      <section className="flex flex-col gap-3">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <h2 className="t-title text-ink">Live biometrics</h2>
          <button className="chip focus-ring" onClick={onGoBand} style={{ minHeight: 34 }}>
            Synced 2m ago · Open band <ChevronRight size={13} strokeWidth={SW} />
          </button>
        </div>

        <div className="card card-pop p-6 grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-[var(--border)] gap-6" style={{ background: 'var(--surface)' }}>
          {/* Energy index */}
          <div className="flex flex-col justify-between gap-3 md:pr-4">
            <div className="flex items-center justify-between gap-2">
              <span className="inline-flex items-center gap-2 t-eyebrow" style={{ color: 'var(--ink)' }}>
                <Zap size={14} strokeWidth={SW} /> Energy index
              </span>
              <ZoneChip zone={zone} />
            </div>
            <div className="flex items-baseline gap-1.5 my-auto">
              <span className="t-stat text-ink" style={{ fontSize: 44 }}>{energy}</span>
              <span className="t-label" style={{ color: 'var(--ink-2)' }}>/ 100</span>
            </div>
            <span className="t-micro" style={{ color: 'var(--ink-2)' }}>
              Top drain: <strong style={{ fontWeight: 700, color: 'var(--ink)' }}>{top.label}</strong>
            </span>
          </div>

          {/* Heart rate */}
          <div className="flex flex-col justify-between gap-3 pt-4 md:pt-0 md:px-4">
            <div className="flex items-center justify-between gap-2">
              <span className="inline-flex items-center gap-2 t-eyebrow" style={{ color: 'var(--ink)' }}>
                <Heart size={14} strokeWidth={SW} /> Heart rate
              </span>
              <span className="t-micro" style={{ color: 'var(--ink-2)' }}>
                {overBaseline >= 0 ? '+' : ''}{overBaseline} bpm vs base
              </span>
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="t-stat text-ink" style={{ fontSize: 44 }}>{restingHr}</span>
              <span className="t-label" style={{ color: 'var(--ink-2)' }}>bpm</span>
            </div>
            <Sparkline values={hrValues} zone={hrZone} height={44} />
            <div className="mt-auto pt-1">
              <ZoneChip zone={hrZone} />
            </div>
          </div>

          {/* Sleep */}
          <div className="flex flex-col justify-between gap-3 pt-4 md:pt-0 md:pl-4">
            <div className="flex items-center justify-between gap-2">
              <span className="inline-flex items-center gap-2 t-eyebrow" style={{ color: 'var(--ink)' }}>
                <Moon size={14} strokeWidth={SW} /> Sleep · 7-day
              </span>
              <span className="t-micro" style={{ color: 'var(--ink-2)' }}>Goal 7.5h</span>
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="t-stat text-ink" style={{ fontSize: 44 }}>{avgNight.toFixed(1)}</span>
              <span className="t-label" style={{ color: 'var(--ink-2)' }}>hrs avg</span>
            </div>
            <SleepBars data={sleepData} height={48} />
            <div className="mt-auto pt-1">
              <ZoneChip zone={sleepZone} />
            </div>
          </div>
        </div>
      </section>

      {/* ── Today's schedule + decision rail ────────────────────────────────── */}
      <section className={`grid grid-cols-1 gap-6 lg:gap-8 ${pending ? 'lg:grid-cols-[1.6fr_1fr]' : ''}`}>
        <div className="card card-pop p-6 flex flex-col gap-4">
          <div className="flex items-baseline justify-between gap-3 rule-b pb-3">
            <div className="flex items-center gap-2.5">
              <h2 className="t-title text-ink">Today&apos;s schedule</h2>
              <span className="t-micro" style={{ color: 'var(--ink-muted)' }}>
                {dayOf(state.today)} {dateOf(state.today)} Sep
              </span>
            </div>
            <Tag tone={todayTasks.length ? 'amber' : 'green'}>
              {todayTasks.length} {todayTasks.length === 1 ? 'TASK' : 'TASKS'}
            </Tag>
          </div>

          {todayTasks.length === 0 ? (
            <p className="t-body py-4" style={{ color: 'var(--ink-2)' }}>
              Nothing scheduled for today. Great time to rest and recharge!
            </p>
          ) : (
            <div className="flex flex-col rule-divide">
              {todayTasks.map(c => {
                const s = KIND_STYLE[c.kind]
                const cost = commitmentCost(state, c.id)
                return (
                  <div key={c.id} className="flex items-center gap-3.5 py-3.5">
                    <span style={{
                      width: 12, height: 12, borderRadius: 999, background: s.dot,
                      border: '2px solid var(--ink)', flexShrink: 0,
                    }} />
                    <div className="flex flex-col gap-0.5 flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="t-label text-ink truncate" style={{ fontWeight: 700 }}>{c.title}</span>
                        <span className="t-micro uppercase font-bold px-2 py-0.5 rounded" style={{
                          fontSize: 10,
                          background: 'var(--surface-muted)',
                          border: '1px solid var(--border)',
                          color: 'var(--ink-2)',
                        }}>
                          {c.kind}
                        </span>
                      </div>
                      <span className="t-micro" style={{ color: 'var(--ink-muted)' }}>
                        Today at {c.time}
                      </span>
                    </div>
                    {cost > 0 ? (
                      <span className="t-stat" style={{ fontSize: 15, color: 'var(--ink)' }}>−{cost} pts</span>
                    ) : (
                      <span className="t-micro font-semibold" style={{ color: 'var(--ink-muted)' }}>Scheduled</span>
                    )}
                  </div>
                )
              })}
            </div>
          )}

          <button className="btn btn-secondary focus-ring self-start mt-1" onClick={onGoLoad}>
            Open full schedule <ChevronRight size={15} strokeWidth={SW} />
          </button>
        </div>

        {pending && (
          <aside className="tile tile-butter card-pop self-start" style={{ padding: 22, gap: 14 }}>
            <div className="flex items-start gap-3">
              <span
                className="flex items-center justify-center shrink-0"
                style={{
                  width: 40, height: 40, borderRadius: 999,
                  background: 'var(--surface)', border: '2px solid var(--ink)',
                }}
              >
                <AlertTriangle size={19} strokeWidth={SW} style={{ color: 'var(--ink)' }} />
              </span>
              <div className="flex flex-col">
                <span className="t-eyebrow" style={{ color: 'var(--ink)' }}>
                  Asked by {pending.parsed.asker}
                </span>
                <span className="t-sub text-ink">{pending.parsed.title}</span>
              </div>
            </div>

            <div className="flex flex-col gap-2">
              {[
                {
                  label: `${pending.parsed.hoursPerWeek} hrs / week workload`,
                  icon: <Clock size={15} strokeWidth={SW} />,
                },
                {
                  label: pending.parsed.deadline
                    ? `Lands ${shortDate(pending.parsed.deadline)}`
                    : 'No deadline given',
                  icon: <Calendar size={15} strokeWidth={SW} />,
                },
                {
                  label: `Would leave you ${ZONE_LABEL[zoneFor(pendingAfter)]}`,
                  icon: <AlertTriangle size={15} strokeWidth={SW} />,
                },
              ].map(r => (
                <div key={r.label} className="flex items-center gap-2.5 t-micro" style={{ color: 'var(--ink)' }}>
                  <span className="flex">{r.icon}</span>
                  <span>{r.label}</span>
                </div>
              ))}
            </div>

            <p className="t-micro" style={{ color: 'var(--ink-2)', lineHeight: 1.55 }}>
              Accepting this takes your energy from {energy} down to {pendingAfter}, in a week
              already carrying {lowerFirst(top.detail)}.
            </p>

            <button className="btn btn-primary focus-ring w-full" onClick={() => setShowCommit(true)}>
              <TrendingUp size={16} strokeWidth={SW} /> Run impact check
            </button>

            {showCommit && <DecisionSheet req={pending} onClose={() => setShowCommit(false)} />}
          </aside>
        )}
      </section>

      {/* ── Share a chat ────────────────────────────────────────────────── */}
      <section className="flex flex-col gap-4">
        <button
          onClick={() => setShowIntake(v => !v)}
          aria-expanded={showIntake}
          className="card focus-ring flex items-center gap-4 p-5 text-left w-full"
          style={{ cursor: 'pointer' }}
        >
          <span
            className="flex items-center justify-center shrink-0"
            style={{
              width: 44, height: 44, borderRadius: 'var(--r-md)',
              background: 'var(--butter)', border: '2px solid var(--ink)',
            }}
          >
            <MessageSquare size={20} strokeWidth={SW} />
          </span>
          <span className="flex flex-col gap-0.5 flex-1 min-w-0">
            <span className="t-sub text-ink">Just been asked to do something?</span>
            <span className="t-micro" style={{ color: 'var(--ink-2)', lineHeight: 1.5 }}>
              Share the chat here and Oasis prices it against your week before you
              answer — then writes the reply for you.
            </span>
          </span>
          <ChevronRight
            size={18} strokeWidth={SW} className="shrink-0"
            style={{
              transform: showIntake ? 'rotate(90deg)' : 'none',
              transition: 'transform 0.16s var(--ease)',
            }}
          />
        </button>

        {showIntake && <DecisionSheet onClose={() => setShowIntake(false)} />}
      </section>
    </div>
  )
}
