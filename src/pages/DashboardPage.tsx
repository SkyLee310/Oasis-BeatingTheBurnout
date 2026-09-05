import { useState } from 'react'
import {
  AlertTriangle, Calendar, ChevronRight, Clock, Heart, Moon,
  Quote, RefreshCw, Shield, TrendingUp, Zap,
} from 'lucide-react'

import {
  CircularGauge, Initials, KIND_STYLE, OasisBlob, SW,
  SleepBars, Sparkline, StatTile, Tag, ZONE_LABEL, type ZoneKey,
} from '../ds'
import { useEnergy, useOasis } from '../state/store'
import { commitmentCost, projectEnergy, zoneFor } from '../logic/energy'
import { dateOf, dayOf, longDate, shortDate } from '../logic/dates'
import { lowerFirst } from '../logic/text'
import DecisionSheet from '../features/decision/DecisionSheet'

// ─── Daily reflections ────────────────────────────────────────────────────────
const DAILY_QUOTES = [
  { quote: "Almost everything will work again if you unplug it for a few minutes, including you.", author: "Anne Lamott" },
  { quote: "Rest is not idle, is not wasteful. Sometimes rest is the most productive thing you can do.", author: "Mark Black" },
  { quote: "You don't have to control your thoughts. You just have to stop letting them control you.", author: "Dan Millman" },
  { quote: "Pace yourself today. You are building a sustainable life, not just finishing a to-do list.", author: "Oasis Wisdom" },
  { quote: "Give yourself permission to pause. Recovery is where strength is quietly rebuilt.", author: "Alex Elle" },
]

// ─── Zone-keyed copy ──────────────────────────────────────────────────────────
// The reading is derived; only its wording is authored. Two lines each, because
// .t-hero breaks on the <br /> and a third line overflows on a phone.
const HEADLINE: Record<ZoneKey, [string, string]> = {
  green: ['You have room', 'to breathe.'],
  amber: ["You're running", 'near capacity.'],
  red:   ["You're past", 'what fits.'],
}

const LEAD: Record<ZoneKey, string> = {
  green: 'Nothing on your plate is outrunning your recovery right now.',
  amber: 'Your week is filling faster than you are clearing it.',
  red:   'This week is asking for more than it can give back.',
}

const WEEKDAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

/** A rolling band trace, held as offsets from the resting figure — so the
 *  waveform follows the store instead of sitting on a frozen 78 bpm. */
const HR_TRACE = [-4, -2, 1, 4, 0, 2, -1, 0, 3, 0, -2, 1]

// ─── Dashboard ────────────────────────────────────────────────────────────────
export default function DashboardPage({ onGoLoad, onGoRecovery, onGoBand }: {
  onGoLoad: () => void; onGoRecovery: () => void; onGoBand: () => void
}) {
  const [showCommit, setShowCommit] = useState(false)
  const [quoteIdx, setQuoteIdx] = useState(0)
  const [isRotating, setIsRotating] = useState(false)

  const state = useOasis()
  const { energy, zone, factors } = useEnergy()

  const currentQuote = DAILY_QUOTES[quoteIdx % DAILY_QUOTES.length]

  const handleNextQuote = () => {
    setIsRotating(true)
    setQuoteIdx(prev => prev + 1)
    setTimeout(() => setIsRotating(false), 300)
  }

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

  // The headline names whichever factor is costing the most right now, so the
  // copy re-aims itself when the week changes shape.
  const top = [...factors].sort((a, b) => b.cost - a.cost)[0]
  const sleepZone = factors.find(f => f.key === 'sleep')?.zone ?? 'green'
  const hrZone = factors.find(f => f.key === 'physiological')?.zone ?? 'green'

  // Today onward, only the things that actually cost something.
  const upcoming = state.commitments
    .filter(c => c.date >= state.today)
    .filter(c => c.kind === 'deadline' || c.kind === 'alert' || c.kind === 'commitment')
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(0, 4)

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
    <div className="flex flex-col gap-10 sm:gap-14 max-w-[1140px] mx-auto pb-4">

      {/* ── Hero ────────────────────────────────────────────────────────────── */}
      <header className="flex flex-col gap-7">
        <div className="flex items-center gap-3">
          <Initials size={44} />
          <div className="flex flex-col">
            <span className="t-eyebrow">{longDate(state.today)}</span>
            <span className="t-label text-ink">Good morning, Maya</span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_auto] items-end gap-8 lg:gap-12">
          <div className="flex flex-col gap-5">
            <Tag tone={zone}><Zap size={13} strokeWidth={SW} /> TODAY&apos;S READING</Tag>
            <h1 className="t-hero text-ink">
              {HEADLINE[zone][0]}<br />{HEADLINE[zone][1]}
            </h1>
            <p className="t-body max-w-[46ch]" style={{ color: 'var(--ink-2)' }}>
              {LEAD[zone]} The biggest drain is{' '}
              <strong style={{ fontWeight: 700 }}>{top.label.toLowerCase()}</strong> —{' '}
              {lowerFirst(top.detail)}.
            </p>
            <div className="flex flex-wrap items-center gap-3 pt-1">
              <button className="btn btn-primary focus-ring" onClick={onGoRecovery}>
                <Shield size={16} strokeWidth={SW} /> Build recovery plan
              </button>
              <button className="btn btn-secondary focus-ring" onClick={onGoLoad}>
                Review this week&apos;s load <ChevronRight size={15} strokeWidth={SW} />
              </button>
            </div>
          </div>

          <div className="flex items-center justify-center gap-2 sm:gap-6">
            <OasisBlob zone={zone} size={124} />
            <CircularGauge
              value={energy} zone={zone}
              label={String(energy)} sublabel="/ 100 ENERGY" size={168}
            />
          </div>
        </div>
      </header>

      {/* ── Bento telemetry ─────────────────────────────────────────────────── */}
      <section className="flex flex-col gap-4">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <h2 className="t-title text-ink">Live biometrics</h2>
          <button className="chip focus-ring" onClick={onGoBand} style={{ minHeight: 34 }}>
            Synced 2m ago · Open device <ChevronRight size={13} strokeWidth={SW} />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <StatTile
            variant="butter" zone={zone}
            icon={<Zap size={14} strokeWidth={SW} />}
            label="Energy index" value={String(energy)} unit="/ 100"
          />
          <StatTile
            variant="blush" zone={hrZone}
            icon={<Heart size={14} strokeWidth={SW} />}
            label="Heart rate" value={String(restingHr)} unit="bpm"
            note={`${overBaseline >= 0 ? '+' : ''}${overBaseline} bpm`}
          >
            <Sparkline values={hrValues} zone={hrZone} height={44} />
          </StatTile>
          <StatTile
            variant="sky" zone={sleepZone}
            icon={<Moon size={14} strokeWidth={SW} />}
            label="Sleep · 7-day" value={avgNight.toFixed(1)} unit="hrs avg" note="Goal 7.5h"
          >
            <SleepBars data={sleepData} height={54} />
          </StatTile>
        </div>
      </section>

      {/* ── Daily reset — the one inverse surface on the page ────────────────── */}
      <section className="panel-ink p-6 sm:p-9 flex flex-col gap-4">
        <div className="flex items-center justify-between gap-3">
          <span className="t-eyebrow inline-flex items-center gap-2">
            <Quote size={13} strokeWidth={SW} /> Daily reset
          </span>
          <button
            onClick={handleNextQuote}
            className="focus-ring inline-flex items-center gap-1.5 t-micro"
            style={{
              color: 'var(--ink)', background: 'var(--highlight)',
              border: '2px solid var(--highlight)', borderRadius: 'var(--r-pill)',
              padding: '5px 13px', cursor: 'pointer', fontWeight: 800,
            }}
            title="Next reflection"
          >
            <RefreshCw size={12} strokeWidth={SW} className={isRotating ? 'animate-spin' : ''} />
            NEXT
          </button>
        </div>
        <p className="t-display max-w-[26ch]" style={{ color: 'var(--on-ink)' }}>
          &ldquo;{currentQuote.quote}&rdquo;
        </p>
        <span className="t-label" style={{ color: 'var(--highlight)' }}>— {currentQuote.author}</span>
      </section>

      {/* ── Pressure + decision rail ────────────────────────────────────────── */}
      <section className={`grid grid-cols-1 gap-6 lg:gap-8 ${pending ? 'lg:grid-cols-[1.6fr_1fr]' : ''}`}>
        <div className="card card-pop p-6 flex flex-col gap-4">
          <div className="flex items-baseline justify-between gap-3 rule-b pb-3">
            <h2 className="t-title text-ink">This week&apos;s pressure</h2>
            <Tag tone={upcoming.length ? zone : 'green'}>{upcoming.length} PENDING</Tag>
          </div>

          {upcoming.length === 0 ? (
            <p className="t-body py-3" style={{ color: 'var(--ink-2)' }}>
              Nothing due between now and Sunday. This is the week to get ahead — or to rest.
            </p>
          ) : (
            <div className="flex flex-col rule-divide">
              {upcoming.map(c => {
                const s = KIND_STYLE[c.kind]
                const cost = commitmentCost(state, c.id)
                return (
                  <div key={c.id} className="flex items-center gap-3.5 py-3.5">
                    <span style={{
                      width: 12, height: 12, borderRadius: 999, background: s.dot,
                      border: '2px solid var(--ink)', flexShrink: 0,
                    }} />
                    <div className="flex flex-col gap-0.5 flex-1 min-w-0">
                      <span className="t-label text-ink truncate" style={{ fontWeight: 700 }}>{c.title}</span>
                      <span className="t-micro" style={{ color: 'var(--ink-muted)' }}>
                        {dayOf(c.date)} {dateOf(c.date)} Sep · {c.time}
                      </span>
                    </div>
                    {cost > 0 && (
                      <span className="t-stat" style={{ fontSize: 15, color: 'var(--ink)' }}>−{cost} pts</span>
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
    </div>
  )
}
