import { useState } from 'react'
import {
  ChevronRight, Heart, HelpCircle, Moon, Shield, Zap,
} from 'lucide-react'

import {
  CircularGauge, Initials, KIND_STYLE, OasisBlob, SW,
  SleepBars, Sparkline, Tag, ZoneChip, ZONE_LABEL,
} from '../ds'
import { useEnergy, useOasis } from '../state/store'
import type { ScenarioKey } from '../state/types'
import { commitmentCost } from '../logic/energy'
import { dateOf, dayOf, longDate } from '../logic/dates'
import DailyCheck from '../features/checkin/DailyCheck'
import RequestInbox from '../features/requests/RequestInbox'

const WEEKDAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

/** A rolling band trace, held as offsets from the resting figure — so the
 *  waveform follows the store instead of sitting on a frozen 78 bpm. */
const HR_TRACE = [-4, -2, 1, 4, 0, 2, -1, 0, 3, 0, -2, 1]

// ─── Dashboard ────────────────────────────────────────────────────────────────
export default function DashboardPage({ onGoLoad, onGoRecovery, onGoBand, onGoHow }: {
  onGoLoad: () => void; onGoRecovery: () => void; onGoBand: () => void
  onGoHow: () => void
}) {
  // The fallback way in, for an ask that arrived somewhere Oasis cannot see.
  // The inbox above is the main route; this one takes a pasted chat.
  // Dismissing is local, not stored: skipping today should not skip tomorrow.
  // Held as the scenario it was dismissed under rather than a bare flag, so the
  // demo switcher restages the check along with every other screen: a card
  // dismissed in one week should not stay gone in the next one.
  const [checkHiddenFor, setCheckHiddenFor] = useState<ScenarioKey | null>(null)

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

  return (
    <div className="flex flex-col gap-8 sm:gap-10 max-w-[1140px] mx-auto pb-4">

      {/* Home had no h1 at all: the design opens on a gauge, not a title, so a
          screen-reader user landed in a run of h2s with nothing naming the page.
          It is sr-only and first in the DOM because the two visible candidates
          both fail — the check-in question is conditional and outranks nothing,
          and the greeting sits inside the header, below the check-in card. Giving
          the greeting the h1 would have put the page title second in reading
          order; reordering the DOM to fix that would have split focus order from
          visual order, which is the worse trade. */}
      <h1 className="sr-only">Today on Oasis</h1>

      {/* ── Daily check ─────────────────────────────────────────────────────── */}
      {/* Deliberately not gated on state.checkIn. The third answer writes it, so
          testing it here unmounted the card at the exact moment it had something
          to say, and the "your energy went from x to y" line never rendered.
          DailyCheck decides for itself whether today still has a question in it,
          and renders nothing when it does not. */}
      {checkHiddenFor !== state.scenario && (
        <DailyCheck onDismiss={() => setCheckHiddenFor(state.scenario)} />
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

        <div className="flex flex-col sm:flex-row items-center justify-between gap-6 p-4 sm:p-6 card card-pop" style={{ background: 'var(--surface)' }}>
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-1">
              <span className="t-eyebrow" style={{ color: 'var(--ink-muted)' }}>CURRENT STATUS</span>
              {/* The one energy readout that speaks. Accepting a request from the
                  decision sheet changes this number on a screen the student is not
                  looking at, so the change has to announce itself. Only this line
                  is live: the Energy index card below shows the same number, and a
                  second live region would say it twice. The zone word rides along
                  because the number alone does not tell you if it is bad news. */}
              <div className="flex items-center gap-2" aria-live="polite">
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
            {/* The readout pair, at the size the design asks for. The gap tightens
                on mobile because 124 + 168 plus a roomy gutter is wider than a
                375px phone, and this row must never be the thing that scrolls. */}
            <div className="flex items-center justify-center gap-2 sm:gap-6">
              <OasisBlob zone={zone} size={124} shadow />
              <CircularGauge
                value={energy} zone={zone}
                label={String(energy)} sublabel="/ 100 ENERGY" size={168}
              />
            </div>
            {/* The accessible name leads with the words on the button, then adds
                what it is about. A name that only paraphrases the visible text
                leaves a speech-input user saying what they can see and hitting
                nothing (WCAG 2.5.3). The Schedule button is labelled the same way. */}
            <button
              className="chip focus-ring hit-44"
              onClick={onGoHow}
              style={{ minHeight: 32 }}
              aria-label="How is this worked out? The energy score, explained"
            >
              <HelpCircle size={13} strokeWidth={SW} /> How is this worked out?
            </button>
          </div>
        </div>
      </header>

      {/* ── What is waiting on you ──────────────────────────────────────────
          Immediately under the score, because the score is the thing these get
          priced against. Nothing between them to read first. */}
      <RequestInbox />

      {/* ── Consolidated live biometrics dashboard ─────────────────────────── */}
      <section className="flex flex-col gap-3">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <h2 className="t-title text-ink">Live biometrics</h2>
          <button className="chip focus-ring hit-44" onClick={onGoBand} style={{ minHeight: 34 }}>
            Synced 2m ago · Open band <ChevronRight size={13} strokeWidth={SW} />
          </button>
        </div>

        <div className="card card-pop p-6 grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-[var(--border)]" style={{ background: 'var(--surface)' }}>
          {/* Energy index */}
          <div className="flex flex-col justify-between gap-3 pb-6 md:pb-0 md:pr-6">
            <div className="flex items-center justify-between gap-2">
              <span className="inline-flex items-center gap-2 t-eyebrow" style={{ color: 'var(--ink)' }}>
                <Zap size={14} strokeWidth={SW} /> Energy index
              </span>
              <ZoneChip zone={zone} />
            </div>
            <div className="flex items-center justify-between gap-3 my-auto">
              <div className="flex flex-col gap-1 min-w-0">
                <div className="flex items-baseline gap-1.5">
                  <span className="t-stat text-ink" style={{ fontSize: 44 }}>{energy}</span>
                  <span className="t-label" style={{ color: 'var(--ink-2)' }}>/ 100</span>
                </div>
                <span className="t-micro truncate" style={{ color: 'var(--ink-2)' }}>
                  Top drain: <strong style={{ fontWeight: 700, color: 'var(--ink)' }}>{top.label}</strong>
                </span>
              </div>
              <div className="shrink-0">
                <CircularGauge
                  value={energy}
                  zone={zone}
                  label={String(energy)}
                  sublabel="/ 100"
                  size={64}
                  showChip={false}
                />
              </div>
            </div>
          </div>

          {/* Heart rate */}
          <div className="flex flex-col justify-between gap-3 py-6 md:py-0 md:px-6">
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
          <div className="flex flex-col justify-between gap-3 pt-6 md:pt-0 md:pl-6">
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

      {/* ── Today's schedule ────────────────────────────────────────────────── */}
      <section className="flex flex-col gap-6">
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
              Nothing scheduled for today. This is the day to get ahead — or to rest.
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
      </section>
    </div>
  )
}
