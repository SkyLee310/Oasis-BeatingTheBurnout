import { useState } from 'react'
import {
  AlertTriangle, Calendar, ChevronRight, Clock, Heart, Moon,
  Quote, RefreshCw, Shield, TrendingUp, Zap,
} from 'lucide-react'

import {
  CALENDAR_WEEK, CircularGauge, Initials, KIND_STYLE, OasisBlob,
  SW, SleepBars, Sparkline, StatTile, Tag,
} from '../ds'
import CommitmentCheck from '../features/decision/CommitmentCheck'

// ─── Daily reflections ────────────────────────────────────────────────────────
const DAILY_QUOTES = [
  { quote: "Almost everything will work again if you unplug it for a few minutes, including you.", author: "Anne Lamott" },
  { quote: "Rest is not idle, is not wasteful. Sometimes rest is the most productive thing you can do.", author: "Mark Black" },
  { quote: "You don't have to control your thoughts. You just have to stop letting them control you.", author: "Dan Millman" },
  { quote: "Pace yourself today. You are building a sustainable life, not just finishing a to-do list.", author: "Oasis Wisdom" },
  { quote: "Give yourself permission to pause. Recovery is where strength is quietly rebuilt.", author: "Alex Elle" },
]

// ─── Dashboard ────────────────────────────────────────────────────────────────
export default function DashboardPage({ onGoLoad, onGoRecovery }: {
  onGoLoad: () => void; onGoRecovery: () => void
}) {
  const [showCommit, setShowCommit] = useState(false)
  const [quoteIdx, setQuoteIdx] = useState(0)
  const [isRotating, setIsRotating] = useState(false)

  const currentQuote = DAILY_QUOTES[quoteIdx % DAILY_QUOTES.length]

  const handleNextQuote = () => {
    setIsRotating(true)
    setQuoteIdx(prev => prev + 1)
    setTimeout(() => setIsRotating(false), 300)
  }

  const hrValues = [74, 76, 79, 82, 78, 80, 77, 78, 81, 78, 76, 79]
  const sleepData = [
    { day: 'Mon', hours: 5.1 }, { day: 'Tue', hours: 5.8 },
    { day: 'Wed', hours: 4.9, isToday: true }, { day: 'Thu', hours: 5.4 },
    { day: 'Fri', hours: 6.2 }, { day: 'Sat', hours: 5.0 }, { day: 'Sun', hours: 5.4 },
  ]

  const upcoming = CALENDAR_WEEK
    .filter(d => d.date >= 10)
    .flatMap(d => d.events.map(ev => ({ ...ev, date: d.date, day: d.day })))
    .filter(ev => ev.kind === 'deadline' || ev.kind === 'alert' || ev.kind === 'commitment')
    .slice(0, 4)

  return (
    <div className="flex flex-col gap-10 sm:gap-14 max-w-[1140px] mx-auto pb-4">

      {/* ── Hero ────────────────────────────────────────────────────────────── */}
      <header className="flex flex-col gap-7">
        <div className="flex items-center gap-3">
          <Initials size={44} />
          <div className="flex flex-col">
            <span className="t-eyebrow">Wednesday · 10 Sep 2026</span>
            <span className="t-label text-ink">Good morning, Maya</span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_auto] items-end gap-8 lg:gap-12">
          <div className="flex flex-col gap-5">
            <Tag tone="amber"><Zap size={13} strokeWidth={SW} /> TODAY&apos;S READING</Tag>
            <h1 className="t-hero text-ink">
              You&apos;re running<br />near capacity.
            </h1>
            <p className="t-body max-w-[46ch]" style={{ color: 'var(--ink-2)' }}>
              Sleep is trending low and your calendar is 89% full through Friday.
              Protect this afternoon — a small recovery now prevents a crash on the 15th.
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
            <OasisBlob zone="amber" size={124} />
            <CircularGauge value={38} zone="amber" label="38" sublabel="/ 100 ENERGY" size={168} />
          </div>
        </div>
      </header>

      {/* ── Bento telemetry ─────────────────────────────────────────────────── */}
      <section className="flex flex-col gap-4">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <h2 className="t-title text-ink">Live biometrics</h2>
          <span className="t-micro" style={{ color: 'var(--ink-muted)' }}>Synced from Smart Band · 2m ago</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <StatTile
            variant="butter" zone="amber"
            icon={<Zap size={14} strokeWidth={SW} />}
            label="Energy index" value="38" unit="/ 100"
          />
          <StatTile
            variant="blush" zone="amber"
            icon={<Heart size={14} strokeWidth={SW} />}
            label="Heart rate" value="78" unit="bpm" note="+6 bpm"
          >
            <Sparkline values={hrValues} zone="amber" height={44} />
          </StatTile>
          <StatTile
            variant="sky" zone="red"
            icon={<Moon size={14} strokeWidth={SW} />}
            label="Sleep · 7-day" value="5.4" unit="hrs avg" note="Goal 7.5h"
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
      <section className="grid grid-cols-1 lg:grid-cols-[1.6fr_1fr] gap-6 lg:gap-8">
        <div className="card card-pop p-6 flex flex-col gap-4">
          <div className="flex items-baseline justify-between gap-3 rule-b pb-3">
            <h2 className="t-title text-ink">This week&apos;s pressure</h2>
            <Tag tone="amber">{upcoming.length} PENDING</Tag>
          </div>

          <div className="flex flex-col rule-divide">
            {upcoming.map((ev, i) => {
              const s = KIND_STYLE[ev.kind]
              return (
                <div key={i} className="flex items-center gap-3.5 py-3.5">
                  <span style={{
                    width: 12, height: 12, borderRadius: 999, background: s.dot,
                    border: '2px solid var(--ink)', flexShrink: 0,
                  }} />
                  <div className="flex flex-col gap-0.5 flex-1 min-w-0">
                    <span className="t-label text-ink truncate" style={{ fontWeight: 700 }}>{ev.title}</span>
                    <span className="t-micro" style={{ color: 'var(--ink-muted)' }}>{ev.day} {ev.date} Sep · {ev.time}</span>
                  </div>
                  {ev.energy !== undefined && (
                    <span className="t-stat" style={{ fontSize: 15, color: 'var(--ink)' }}>{ev.energy} pts</span>
                  )}
                </div>
              )
            })}
          </div>

          <button className="btn btn-secondary focus-ring self-start mt-1" onClick={onGoLoad}>
            Open full schedule <ChevronRight size={15} strokeWidth={SW} />
          </button>
        </div>

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
              <span className="t-eyebrow" style={{ color: 'var(--ink)' }}>Decision pending</span>
              <span className="t-sub text-ink">Part-time retail offer</span>
            </div>
          </div>

          <div className="flex flex-col gap-2">
            {[
              { label: '12 hrs / week workload', icon: <Clock size={15} strokeWidth={SW} /> },
              { label: 'Tue · Thu · Sat distribution', icon: <Calendar size={15} strokeWidth={SW} /> },
              { label: 'High crash risk, week of 15 Sep', icon: <AlertTriangle size={15} strokeWidth={SW} /> },
            ].map(r => (
              <div key={r.label} className="flex items-center gap-2.5 t-micro" style={{ color: 'var(--ink)' }}>
                <span className="flex">{r.icon}</span>
                <span>{r.label}</span>
              </div>
            ))}
          </div>

          <p className="t-micro" style={{ color: 'var(--ink-2)', lineHeight: 1.55 }}>
            Accepting this shift pushes your recovery score from 38 down to 22 when DS A2 and LinAlg mid-terms overlap.
          </p>

          <button className="btn btn-primary focus-ring w-full" onClick={() => setShowCommit(true)}>
            <TrendingUp size={16} strokeWidth={SW} /> Run impact check
          </button>

          {showCommit && <CommitmentCheck onClose={() => setShowCommit(false)} />}
        </aside>
      </section>
    </div>
  )
}
