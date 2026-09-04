import { useState, useEffect, useCallback, useRef } from 'react'
import { ThemeProvider } from '@figma/astraui'
import {
  Home, Activity, Shield, Settings,
  Heart, Moon, Mic, MicOff, Brain,
  Zap, TrendingUp, AlertTriangle, CheckCircle,
  ChevronRight, X, Calendar, Clock,
  Sparkles, Check, ArrowUpRight, Copy, BatteryCharging,
  Quote, RefreshCw, Send,
} from 'lucide-react'

// ─── Design system ────────────────────────────────────────────────────────────
// Every primitive below is published from src/ds/index.ts. Pages and navigation
// stay in this file; anything reusable belongs in src/ds.
import {
  CALENDAR_WEEK, CircularGauge, Initials, KIND_STYLE, LoadBar, OasisBlob,
  SW, SleepBars, Sparkline, StatTile, Tag, WeekCalendar, ZoneChip,
  zoneAccent, zoneTile,
} from './ds'
import type { CalDay, EventKind, ZoneKey } from './ds'

// ─── App-only types ───────────────────────────────────────────────────────────
type Page = 'dashboard' | 'band' | 'load' | 'recovery'
interface ChatMsg { role: 'user' | 'ai'; text: string }

// ─── Day detail ───────────────────────────────────────────────────────────────
function DayDetail({ day, onClose }: { day: CalDay; onClose: () => void }) {
  return (
    <div className="card card-pop p-5 flex flex-col gap-4 mt-1">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5 flex-wrap">
          <Calendar size={18} strokeWidth={SW} />
          <span className="t-sub text-ink">{day.day}, {day.date} {day.month}</span>
          {day.isToday && <Tag tone="yellow">TODAY</Tag>}
        </div>
        <button className="btn-icon focus-ring" onClick={onClose} aria-label="Close day detail">
          <X size={16} strokeWidth={SW} />
        </button>
      </div>

      <div className="flex flex-col gap-2.5">
        {day.events.map((ev, i) => {
          const s = KIND_STYLE[ev.kind]
          return (
            <div
              key={i}
              className="flex items-start gap-3 p-3.5"
              style={{ background: s.bg, border: '2px solid var(--ink)', borderRadius: 'var(--r-md)' }}
            >
              <span style={{
                width: 10, height: 10, borderRadius: 999, background: s.dot,
                border: '2px solid var(--ink)', flexShrink: 0, marginTop: 5,
              }} />
              <div className="flex flex-col gap-0.5 flex-1">
                <span className="t-label text-ink" style={{ fontSize: 14.5, fontWeight: 700 }}>{ev.title}</span>
                <span className="t-micro" style={{ color: 'var(--ink-2)' }}>{ev.time}</span>
                {ev.energy !== undefined && (
                  <span className="t-micro mt-1" style={{ color: 'var(--ink)', fontWeight: 800 }}>
                    Energy cost: {ev.energy} pts
                  </span>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ─── Commitment impact sheet ──────────────────────────────────────────────────
function CommitmentCheck({ onClose }: { onClose: () => void }) {
  const [phase, setPhase] = useState<'input' | 'result'>('input')
  const [hrs, setHrs] = useState(12)
  const [showAfter, setShowAfter] = useState(false)

  const runCheck = () => {
    setPhase('result')
    setTimeout(() => setShowAfter(true), 600)
  }

  return (
    <div className="card card-pop p-5 flex flex-col gap-5 mt-3">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Sparkles size={18} strokeWidth={SW} />
          <span className="t-sub text-ink">Impact simulation</span>
        </div>
        <button className="btn-icon focus-ring" onClick={onClose} aria-label="Close">
          <X size={16} strokeWidth={SW} />
        </button>
      </div>

      {phase === 'input' ? (
        <>
          <p className="t-body" style={{ color: 'var(--ink-2)' }}>
            How many extra commitment hours per week are you considering?
          </p>
          <div className="flex gap-2 flex-wrap">
            {[4, 8, 12, 16, 20].map(h => (
              <button
                key={h}
                onClick={() => setHrs(h)}
                className={`chip focus-ring ${hrs === h ? 'chip-selected' : ''}`}
              >
                {h} hrs/wk
              </button>
            ))}
          </div>
          <button className="btn btn-primary focus-ring self-start" onClick={runCheck}>
            Simulate energy impact <ChevronRight size={16} strokeWidth={SW} />
          </button>
        </>
      ) : (
        <>
          <div className="grid grid-cols-2 gap-3">
            <div className="tile tile-butter" style={{ padding: 14 }}>
              <span className="t-eyebrow" style={{ color: 'var(--ink)' }}>Current</span>
              <span className="t-stat text-ink" style={{ fontSize: 38 }}>38</span>
              <ZoneChip zone="amber" />
            </div>
            <div className="tile tile-blush" style={{ padding: 14 }}>
              <span className="t-eyebrow" style={{ color: 'var(--ink)' }}>Projected 15 Sep</span>
              <span className="t-stat text-ink" style={{ fontSize: 38 }}>{showAfter ? 22 : 38}</span>
              <ZoneChip zone={showAfter ? 'red' : 'amber'} />
            </div>
          </div>

          <div
            className="flex gap-3 p-4"
            style={{ background: 'var(--blush)', border: '2px solid var(--ink)', borderRadius: 'var(--r-md)' }}
          >
            <AlertTriangle size={20} strokeWidth={SW} className="shrink-0 mt-0.5" style={{ color: 'var(--ink)' }} />
            <p className="t-label" style={{ color: 'var(--ink)', lineHeight: 1.5 }}>
              Adding <strong>{hrs} hrs/week</strong> collides DS A2 with the LinAlg exam on 15 Sep, pulling energy to 22 — inside the burnout threshold.
            </p>
          </div>

          <button
            className="btn btn-secondary focus-ring self-start"
            onClick={() => { setPhase('input'); setShowAfter(false) }}
          >
            Adjust parameters
          </button>
        </>
      )}
    </div>
  )
}

// ─── Daily reflections ────────────────────────────────────────────────────────
const DAILY_QUOTES = [
  { quote: "Almost everything will work again if you unplug it for a few minutes, including you.", author: "Anne Lamott" },
  { quote: "Rest is not idle, is not wasteful. Sometimes rest is the most productive thing you can do.", author: "Mark Black" },
  { quote: "You don't have to control your thoughts. You just have to stop letting them control you.", author: "Dan Millman" },
  { quote: "Pace yourself today. You are building a sustainable life, not just finishing a to-do list.", author: "Oasis Wisdom" },
  { quote: "Give yourself permission to pause. Recovery is where strength is quietly rebuilt.", author: "Alex Elle" },
]

// ─── Dashboard ────────────────────────────────────────────────────────────────
function DashboardPage({ onGoLoad, onGoRecovery }: {
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

// ─── Smart Band ───────────────────────────────────────────────────────────────
function SmartBandPage() {
  const [connected, setConnected] = useState(true)
  const [hr, setHr] = useState(78)
  const [hrHistory, setHrHistory] = useState([72, 75, 78, 80, 77, 78, 81, 78, 76, 80])

  useEffect(() => {
    if (!connected) return
    const iv = setInterval(() => {
      const next = Math.max(60, Math.min(100, hr + Math.round((Math.random() - 0.5) * 6)))
      setHr(next)
      setHrHistory(h => [...h.slice(-13), next])
    }, 2000)
    return () => clearInterval(iv)
  }, [connected, hr])

  const hrZone: ZoneKey = hr > 85 ? 'red' : hr > 75 ? 'amber' : 'green'

  const sleepData = [
    { day: 'Mon', hours: 5.1 }, { day: 'Tue', hours: 5.8 },
    { day: 'Wed', hours: 4.9, isToday: true }, { day: 'Thu', hours: 5.4 },
    { day: 'Fri', hours: 6.2 }, { day: 'Sat', hours: 5.0 }, { day: 'Sun', hours: 5.4 },
  ]

  const factors = [
    { label: 'Autonomic HR', value: '78 bpm', weight: 40, icon: <Heart size={17} strokeWidth={SW} />, zone: 'amber' as ZoneKey },
    { label: 'Sleep quality', value: '5.4 hrs', weight: 35, icon: <Moon size={17} strokeWidth={SW} />, zone: 'red' as ZoneKey },
    { label: 'Calendar density', value: '89%', weight: 25, icon: <Activity size={17} strokeWidth={SW} />, zone: 'red' as ZoneKey },
  ]

  return (
    <div className="flex flex-col gap-10 sm:gap-14 max-w-[1140px] mx-auto pb-4">

      {/* ── Device hero ─────────────────────────────────────────────────────── */}
      <header className="panel-ink p-6 sm:p-9 flex flex-col gap-7">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div className="flex flex-col gap-1.5">
            <span className="t-eyebrow" style={{ color: 'var(--highlight)' }}>Connected device</span>
            <div className="flex items-center gap-2.5">
              <span className="t-display" style={{ color: 'var(--on-ink)', fontSize: 'clamp(1.5rem,4vw,2rem)' }}>
                Xiaomi Smart Band 8 Pro
              </span>
              <BatteryCharging size={19} strokeWidth={SW} style={{ color: 'var(--mint-deep)' }} />
            </div>
            <span className="t-micro" style={{ color: 'rgba(246,242,232,0.65)' }}>
              {connected ? 'Streaming live telemetry every 2 seconds' : 'Last synchronized today at 08:14'}
            </span>
          </div>

          <button
            onClick={() => setConnected(c => !c)}
            role="switch"
            aria-checked={connected}
            aria-label="Toggle band connection"
            className="focus-ring relative shrink-0"
            style={{
              width: 58, height: 32, borderRadius: 'var(--r-pill)',
              background: connected ? 'var(--highlight)' : 'transparent',
              border: '2px solid var(--on-ink)', cursor: 'pointer',
              transition: 'background-color 0.2s var(--ease)',
            }}
          >
            <span
              className="absolute"
              style={{
                top: 3, left: 3, width: 22, height: 22, borderRadius: 999,
                background: connected ? 'var(--ink)' : 'var(--on-ink)',
                transform: connected ? 'translateX(24px)' : 'translateX(0)',
                transition: 'transform 0.2s var(--ease)',
              }}
            />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-[auto_1fr] items-center gap-6 sm:gap-9">
          <div className="flex items-end gap-4">
            <OasisBlob zone={hrZone} size={104} />
            <div className="flex items-baseline gap-2">
              <span className="t-stat" style={{ color: 'var(--on-ink)', fontSize: 'clamp(3rem, 11vw, 5rem)' }}>{hr}</span>
              <span className="t-label" style={{ color: 'rgba(246,242,232,0.65)' }}>bpm</span>
            </div>
          </div>

          <div className="flex flex-col gap-2.5">
            <div className="flex items-center justify-between gap-3">
              <span className="t-eyebrow">Live heart rate</span>
              {connected && (
                <span
                  className="inline-flex w-fit items-center gap-1.5 t-micro"
                  style={{
                    color: 'var(--ink)', background: 'var(--bold-orange)',
                    border: '2px solid var(--on-ink)', borderRadius: 'var(--r-pill)',
                    padding: '3px 11px', fontWeight: 800,
                  }}
                >
                  <span className="w-2 h-2 rounded-full animate-ping" style={{ background: 'var(--ink)' }} /> LIVE
                </span>
              )}
            </div>
            <Sparkline values={hrHistory} zone={hrZone} height={60} />
            <span className="t-micro" style={{ color: 'rgba(246,242,232,0.65)', lineHeight: 1.5 }}>
              Elevated 6 bpm over your 72 bpm resting baseline — contributes +4 to today&apos;s stress score.
            </span>
          </div>
        </div>
      </header>

      {/* ── Sleep architecture ──────────────────────────────────────────────── */}
      <section className="card card-pop p-6 grid grid-cols-1 md:grid-cols-[auto_1fr] items-center gap-7 md:gap-10">
        <CircularGauge value={5.4} max={9} zone="red" label="5.4" sublabel="HRS" size={152} />
        <div className="flex flex-col gap-4">
          <div className="flex items-baseline justify-between gap-3 rule-b pb-3">
            <h2 className="t-title text-ink">Sleep architecture</h2>
            <ZoneChip zone="red" />
          </div>
          <SleepBars data={sleepData} height={96} />
          <p className="t-body max-w-[52ch]" style={{ color: 'var(--ink-2)' }}>
            Below your 6-hour recovery baseline for four nights running. Aim for 7.5 hours
            before Thursday to keep your stress score from climbing further.
          </p>
        </div>
      </section>

      {/* ── Stress index breakdown ──────────────────────────────────────────── */}
      <section className="flex flex-col gap-5">
        <div className="flex flex-col gap-1.5">
          <span className="t-eyebrow">How we score it</span>
          <h2 className="t-display text-ink">The Oasis stress index</h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {factors.map(f => (
            <div key={f.label} className={`tile ${zoneTile(f.zone)} card-pop`}>
              <div className="flex items-center justify-between gap-2">
                <span className="inline-flex items-center gap-2 t-eyebrow" style={{ color: 'var(--ink)' }}>
                  {f.icon} {f.label}
                </span>
                <span className="t-stat text-ink" style={{ fontSize: 18 }}>{f.weight}%</span>
              </div>
              <span className="t-stat text-ink" style={{ fontSize: 32 }}>{f.value}</span>
              <div className="track" style={{ height: 12 }}>
                <div className="bar-fill" style={{ height: '100%', width: `${f.weight}%`, background: zoneAccent(f.zone) }} />
              </div>
              <div className="mt-auto pt-1"><ZoneChip zone={f.zone} /></div>
            </div>
          ))}
        </div>

        <div
          className="flex items-center justify-between gap-4 p-5 sm:p-6"
          style={{ background: 'var(--blush)', border: '2px solid var(--ink)', borderRadius: 'var(--r-xl)', boxShadow: 'var(--shadow-hard)' }}
        >
          <div className="flex flex-col gap-1">
            <span className="t-eyebrow" style={{ color: 'var(--ink)' }}>Calculated stress score</span>
            <span className="t-micro" style={{ color: 'var(--ink-2)' }}>Weighted across all three signals</span>
          </div>
          <span className="t-stat text-ink" style={{ fontSize: 48 }}>
            62<span className="t-label" style={{ color: 'var(--ink-2)' }}> / 100</span>
          </span>
        </div>
      </section>
    </div>
  )
}

// ─── Schedule & load ──────────────────────────────────────────────────────────
type LoadTab = 'schedule' | 'categories' | 'tasks' | 'commitment'

function LoadPage() {
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

// ─── Recovery ─────────────────────────────────────────────────────────────────
function RecoveryPage() {
  const [ticked, setTicked] = useState<Record<string, boolean>>({})
  const [showComm, setShowComm] = useState(false)
  const [copied, setCopied] = useState(false)

  const total = Object.values(ticked).filter(Boolean).length
  const energy = Math.min(20 + total * 3, 48)
  const currentZone: ZoneKey = energy >= 45 ? 'green' : energy >= 30 ? 'amber' : 'red'

  const days = [
    { date: 'Monday 15 Sep', variant: 'mint', items: [
      { id: 'a1', label: 'Restful sleep prior to midnight', gain: '+8' },
      { id: 'a2', label: '20-minute restorative outdoor walk', gain: '+6' },
      { id: 'a3', label: 'Decline non-essential meetings', gain: '+4' },
    ]},
    { date: 'Tuesday 16 Sep', variant: 'sky', items: [
      { id: 'b1', label: 'Dedicated 45-minute digital detox', gain: '+8' },
      { id: 'b2', label: 'Mindful breathing & hydration', gain: '+6' },
      { id: 'b3', label: 'Keep evening buffer free', gain: '+4' },
    ]},
  ]

  const copyTemplate = () => {
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="flex flex-col gap-10 sm:gap-14 max-w-[880px] mx-auto pb-4">

      {/* ── Hero ────────────────────────────────────────────────────────────── */}
      <header className="flex flex-col items-center text-center gap-6 pt-2">
        <Tag tone="yellow"><Shield size={13} strokeWidth={SW} /> RECOVERY PLAN</Tag>
        <div className="flex items-center justify-center gap-2 sm:gap-6">
          <OasisBlob zone={currentZone} size={118} />
          <CircularGauge value={energy} zone={currentZone} label={String(energy)} sublabel="/ 100" size={180} />
        </div>
        <h1 className="t-display text-ink max-w-[20ch]">
          Get back above 45 to leave the fatigue zone.
        </h1>
        <p className="t-body max-w-[46ch]" style={{ color: 'var(--ink-2)' }}>
          Check off small restorative actions below. Each one nudges your autonomic
          recovery up in real time — no single big fix required.
        </p>
        {energy >= 45 && (
          <Tag tone="green"><CheckCircle size={13} strokeWidth={SW} /> BACK IN THE STABLE ZONE</Tag>
        )}
      </header>

      {/* ── Checklists ──────────────────────────────────────────────────────── */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {days.map(d => (
          <div key={d.date} className={`tile tile-${d.variant} card-pop`} style={{ padding: 20, gap: 12 }}>
            <span className="t-eyebrow" style={{ color: 'var(--ink)' }}>{d.date}</span>

            <div className="flex flex-col gap-2.5">
              {d.items.map(item => {
                const done = ticked[item.id]
                return (
                  <button
                    key={item.id}
                    onClick={() => setTicked(p => ({ ...p, [item.id]: !p[item.id] }))}
                    role="checkbox"
                    aria-checked={!!done}
                    className="focus-ring flex items-center gap-3 text-left p-3"
                    style={{
                      background: done ? 'var(--highlight)' : 'var(--surface)',
                      border: '2px solid var(--ink)',
                      borderRadius: 'var(--r-md)',
                      cursor: 'pointer', fontFamily: 'inherit',
                      transition: 'background-color 0.2s var(--ease)',
                    }}
                  >
                    <span style={{
                      width: 26, height: 26, borderRadius: 999, flexShrink: 0,
                      background: done ? 'var(--ink)' : 'transparent',
                      border: '2px solid var(--ink)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      transition: 'background-color 0.2s var(--ease)',
                    }}>
                      {done && <Check size={15} strokeWidth={3} className="tick-in" style={{ color: 'var(--on-ink)' }} />}
                    </span>
                    <span className="t-label flex-1" style={{ color: 'var(--ink)' }}>{item.label}</span>
                    <span className="t-stat" style={{ fontSize: 14, color: 'var(--ink)' }}>{item.gain}</span>
                  </button>
                )
              })}
            </div>
          </div>
        ))}
      </section>

      {/* ── Say-no script ───────────────────────────────────────────────────── */}
      <section className="card card-pop p-6 flex flex-col gap-4">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-2.5">
            <Sparkles size={19} strokeWidth={SW} />
            <span className="t-sub text-ink">Need to say no? Here&apos;s a script.</span>
          </div>
          <button className="btn btn-secondary btn-sm focus-ring" onClick={() => setShowComm(p => !p)}>
            {showComm ? 'Hide' : 'Show'}
          </button>
        </div>

        {showComm && (
          <div
            className="p-4 flex flex-col gap-4"
            style={{ background: 'var(--surface-2)', border: '2px solid var(--ink)', borderRadius: 'var(--r-md)' }}
          >
            <p className="t-body italic" style={{ color: 'var(--ink-2)' }}>
              &ldquo;Hi team, thank you for considering me for this opportunity. After reviewing my academic milestones and project commitments for this semester, I won&apos;t be able to take on extra shifts right now to maintain high quality deliverables.&rdquo;
            </p>
            <button className="btn btn-accent btn-sm focus-ring self-start" onClick={copyTemplate}>
              {copied
                ? <><Check size={14} strokeWidth={SW} /> Copied</>
                : <><Copy size={14} strokeWidth={SW} /> Copy to clipboard</>}
            </button>
          </div>
        )}
      </section>
    </div>
  )
}

// ─── Voice assistant ──────────────────────────────────────────────────────────
const VOICE_PROMPTS = [
  "I'm feeling overwhelmed with my upcoming DS Assignment 2 deadline.",
  "Can you help me rebalance my Thursday schedule so I can sleep earlier?",
  "Should I accept the part-time shift offer this weekend?",
]

function VoiceAssistantPanel({ showHeader = true }: { showHeader?: boolean }) {
  const [messages, setMessages] = useState<ChatMsg[]>([
    { role: 'ai', text: "Hi Maya. I'm monitoring your load trends — your calendar density is elevated. How can I assist your schedule today?" },
  ])
  const [input, setInput] = useState('')
  const [recording, setRecording] = useState(false)
  const [promptIdx, setPromptIdx] = useState(0)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const scrollRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' })
  }, [messages])

  const getAIReply = (msg: string) => {
    const m = msg.toLowerCase()
    if (m.includes('shift') || m.includes('part-time')) {
      return "Based on your 78 bpm elevated heart rate and 5.4h sleep average, taking the 12h retail shift will cause an energy crash around 15 Sep. I recommend politely declining."
    }
    if (m.includes('ds') || m.includes('assignment')) {
      return "I suggest deferring your Ethics reading to Saturday. That frees 4 energy points on Friday so you can complete DS Assignment 2 without sacrificing sleep."
    }
    return "I've analyzed your schedule. You have a 90-minute buffer on Thursday afternoon that you can protect for restorative rest."
  }

  const send = useCallback(() => {
    if (!input.trim()) return
    const userMsg = input.trim()
    setInput('')
    setMessages(prev => [...prev, { role: 'user', text: userMsg }])
    setTimeout(() => {
      setMessages(prev => [...prev, { role: 'ai', text: getAIReply(userMsg) }])
    }, 700)
  }, [input])

  const startVoice = () => {
    if (recording) {
      setRecording(false)
      if (timerRef.current) clearTimeout(timerRef.current)
      return
    }
    setRecording(true)
    const prompt = VOICE_PROMPTS[promptIdx % VOICE_PROMPTS.length]
    let i = 0
    setInput('')
    const tick = () => {
      i++
      setInput(prompt.slice(0, i))
      if (i < prompt.length) {
        timerRef.current = setTimeout(tick, 35)
      } else {
        setRecording(false)
        setPromptIdx(p => p + 1)
      }
    }
    timerRef.current = setTimeout(tick, 250)
  }

  return (
    <div className="flex flex-col h-full" style={{ background: 'var(--surface)' }}>
      {showHeader && (
        <div className="flex items-center gap-2.5 px-5 py-4 rule-b">
          <span
            className="flex items-center justify-center shrink-0"
            style={{ width: 34, height: 34, borderRadius: 999, background: 'var(--highlight)', border: '2px solid var(--ink)' }}
          >
            <Brain size={18} strokeWidth={SW} style={{ color: 'var(--ink)' }} />
          </span>
          <span className="t-sub text-ink">Oasis AI</span>
        </div>
      )}

      {/* Transcript */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto flex flex-col gap-3 px-5 py-5" style={{ background: 'var(--canvas)' }}>
        {messages.map((m, i) => (
          <div key={i} className={`flex items-end gap-2 ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            {m.role === 'ai' && <OasisBlob zone="amber" size={34} float={false} />}
            <div
              className="t-label"
              style={{
                maxWidth: '80%', padding: '11px 15px',
                background: m.role === 'user' ? 'var(--ink)' : 'var(--surface)',
                color: m.role === 'user' ? 'var(--on-ink)' : 'var(--ink)',
                border: '2px solid var(--ink)',
                borderRadius: m.role === 'user'
                  ? 'var(--r-md) var(--r-md) 6px var(--r-md)'
                  : 'var(--r-md) var(--r-md) var(--r-md) 6px',
                boxShadow: 'var(--shadow-hard-sm)',
                lineHeight: 1.5,
              }}
            >
              {m.text}
            </div>
            {m.role === 'user' && <Initials size={28} />}
          </div>
        ))}
      </div>

      {/* Composer */}
      <div className="flex flex-col gap-2.5 px-4 py-4 rule-t" style={{ background: 'var(--surface)' }}>
        <div className="flex items-center gap-2">
          <input
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') send() }}
            placeholder="Ask Oasis AI…"
            aria-label="Message Oasis AI"
            className="focus-ring t-label flex-1 min-w-0"
            style={{
              background: 'var(--surface-2)', color: 'var(--ink)',
              border: '2px solid var(--ink)', borderRadius: 'var(--r-pill)',
              padding: '10px 16px', outline: 'none', fontFamily: 'inherit',
            }}
          />
          <button
            className="btn-icon focus-ring"
            onClick={send}
            aria-label="Send message"
            style={{ background: 'var(--ink)', color: 'var(--on-ink)' }}
          >
            <Send size={16} strokeWidth={SW} />
          </button>
        </div>

        <div className="flex items-center justify-between gap-3">
          <span className="t-micro" style={{ color: 'var(--ink-muted)' }}>
            {recording ? 'Listening…' : 'Tap the mic for voice input'}
          </span>
          <button
            onClick={startVoice}
            aria-label={recording ? 'Stop voice input' : 'Start voice input'}
            className="focus-ring relative flex items-center justify-center"
            style={{
              width: 42, height: 42, borderRadius: 999,
              background: recording ? 'var(--bold-orange)' : 'var(--highlight)',
              border: '2px solid var(--ink)',
              boxShadow: 'var(--shadow-hard-sm)',
              color: 'var(--ink)', cursor: 'pointer',
              transition: 'background-color 0.2s var(--ease)',
            }}
          >
            {recording ? <Mic size={19} strokeWidth={SW} /> : <MicOff size={19} strokeWidth={SW} />}
            {recording && (
              <span
                className="absolute inset-0 rounded-full animate-ping pointer-events-none"
                style={{ background: 'var(--bold-orange)', opacity: 0.35 }}
              />
            )}
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Navigation ───────────────────────────────────────────────────────────────
const NAV_ITEMS: { id: Page; icon: React.ReactNode; label: string; short: string }[] = [
  { id: 'dashboard', icon: <Home size={20} strokeWidth={SW} />, label: 'Dashboard', short: 'Home' },
  { id: 'load', icon: <Calendar size={20} strokeWidth={SW} />, label: 'Schedule & load', short: 'Schedule' },
  { id: 'recovery', icon: <Shield size={20} strokeWidth={SW} />, label: 'Recovery', short: 'Recover' },
  { id: 'band', icon: <Activity size={20} strokeWidth={SW} />, label: 'Smart band', short: 'Band' },
]

function SideRail({ page, onPage }: { page: Page; onPage: (p: Page) => void }) {
  return (
    <aside
      className="hide-mobile flex-col items-center justify-between py-5 px-3 shrink-0"
      style={{ width: 78, background: 'var(--surface)', borderRight: '2px solid var(--ink)' }}
    >
      <div className="flex flex-col items-center gap-3">
        <OasisBlob zone="green" size={40} float={false} />

        <div className="flex flex-col gap-2 mt-2">
          {NAV_ITEMS.map(it => {
            const active = page === it.id
            return (
              <button
                key={it.id}
                onClick={() => onPage(it.id)}
                title={it.label}
                aria-label={it.label}
                aria-current={active ? 'page' : undefined}
                className="focus-ring press flex items-center justify-center"
                style={{
                  width: 46, height: 46, borderRadius: 'var(--r-md)',
                  background: active ? 'var(--highlight)' : 'var(--surface)',
                  border: '2px solid var(--ink)',
                  boxShadow: active ? 'var(--shadow-hard-sm)' : 'none',
                  color: 'var(--ink)', cursor: 'pointer',
                }}
              >
                {it.icon}
              </button>
            )
          })}
        </div>
      </div>

      <div className="flex flex-col items-center gap-3">
        <button className="btn-icon focus-ring" aria-label="Settings" style={{ width: 40, height: 40 }}>
          <Settings size={18} strokeWidth={SW} />
        </button>
        <Initials size={40} />
      </div>
    </aside>
  )
}

function MobileNav({
  page, onPage, onOpenVoice, isVoiceOpen,
}: {
  page: Page
  onPage: (p: Page) => void
  onOpenVoice: () => void
  isVoiceOpen: boolean
}) {
  const renderItem = (it: typeof NAV_ITEMS[number]) => {
    const active = page === it.id
    return (
      <button
        key={it.id}
        onClick={() => onPage(it.id)}
        aria-label={it.label}
        aria-current={active ? 'page' : undefined}
        className="focus-ring flex flex-col items-center justify-center flex-1 gap-1"
        style={{ border: 'none', background: 'none', cursor: 'pointer', padding: '6px 0', fontFamily: 'inherit' }}
      >
        <span
          className="flex items-center justify-center"
          style={{
            width: 40, height: 30, borderRadius: 'var(--r-pill)',
            background: active ? 'var(--highlight)' : 'transparent',
            border: `2px solid ${active ? 'var(--ink)' : 'transparent'}`,
            color: 'var(--ink)',
            transition: 'background-color 0.2s var(--ease)',
          }}
        >
          {it.icon}
        </span>
        <span className="t-micro" style={{ color: 'var(--ink)', fontWeight: active ? 800 : 600, fontSize: 10 }}>
          {it.short}
        </span>
      </button>
    )
  }

  return (
    <nav
      className="flex items-center justify-around show-mobile"
      style={{
        position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 40,
        height: 70, paddingLeft: 8, paddingRight: 8,
        background: 'var(--surface)', borderTop: '2px solid var(--ink)',
      }}
    >
      {NAV_ITEMS.slice(0, 2).map(renderItem)}

      {/* Prominent Oasis AI button */}
      <div className="flex items-center justify-center flex-1" style={{ position: 'relative', height: '100%' }}>
        <button
          onClick={onOpenVoice}
          aria-label="Oasis AI"
          className="focus-ring flex items-center justify-center"
          style={{
            position: 'absolute', top: -20,
            width: 58, height: 58, borderRadius: '50%',
            background: isVoiceOpen ? 'var(--bold-orange)' : 'var(--highlight)',
            border: '2.5px solid var(--ink)',
            boxShadow: 'var(--shadow-hard)',
            color: 'var(--ink)', cursor: 'pointer',
            transition: 'transform 0.16s var(--ease), background-color 0.2s var(--ease)',
          }}
          onMouseDown={e => { e.currentTarget.style.transform = 'translate(2px, 2px)' }}
          onMouseUp={e => { e.currentTarget.style.transform = 'none' }}
          onTouchStart={e => { e.currentTarget.style.transform = 'translate(2px, 2px)' }}
          onTouchEnd={e => { e.currentTarget.style.transform = 'none' }}
        >
          <Mic size={25} strokeWidth={2.5} />
        </button>
      </div>

      {NAV_ITEMS.slice(2).map(renderItem)}
    </nav>
  )
}

// ─── App root ─────────────────────────────────────────────────────────────────
export default function App() {
  const [page, setPage] = useState<Page>('dashboard')
  const [showVoice, setShowVoice] = useState(false)

  const renderPage = () => {
    switch (page) {
      case 'dashboard': return <DashboardPage onGoLoad={() => setPage('load')} onGoRecovery={() => setPage('recovery')} />
      case 'band':      return <SmartBandPage />
      case 'load':      return <LoadPage />
      case 'recovery':  return <RecoveryPage />
    }
  }

  return (
    <ThemeProvider>
      <div className="flex h-full overflow-hidden bg-canvas">
        <SideRail page={page} onPage={setPage} />

        <div className="flex flex-1 overflow-hidden">
          <div className="flex-1 overflow-y-auto px-4 py-6 sm:px-8 sm:py-9" style={{ paddingBottom: 96 }}>
            <div key={page} className="page-section-enter min-h-full">
              {renderPage()}
            </div>
          </div>

          {/* Voice panel — desktop column */}
          <div
            className="hide-mobile flex-col shrink-0"
            style={{ width: 360, minWidth: 320, maxWidth: 400, borderLeft: '2px solid var(--ink)' }}
          >
            <VoiceAssistantPanel />
          </div>

          {/* Voice panel — mobile sheet */}
          {showVoice && (
            <div
              className="show-mobile fixed inset-0 z-50 flex-col voice-backdrop"
              style={{ background: 'rgba(20, 20, 15, 0.45)' }}
              onClick={() => setShowVoice(false)}
            >
              <div
                className="absolute bottom-0 left-0 right-0 voice-sheet-expand"
                style={{
                  height: '82vh', overflow: 'hidden',
                  background: 'var(--surface)',
                  borderTop: '2px solid var(--ink)',
                  borderRadius: 'var(--r-xl) var(--r-xl) 0 0',
                }}
                onClick={e => e.stopPropagation()}
              >
                <div className="flex items-center justify-between px-5 py-4 rule-b">
                  <div className="flex items-center gap-2.5">
                    <span
                      className="flex items-center justify-center shrink-0"
                      style={{ width: 34, height: 34, borderRadius: 999, background: 'var(--highlight)', border: '2px solid var(--ink)' }}
                    >
                      <Brain size={18} strokeWidth={SW} style={{ color: 'var(--ink)' }} />
                    </span>
                    <span className="t-sub text-ink">Oasis AI</span>
                  </div>
                  <button className="btn-icon focus-ring" onClick={() => setShowVoice(false)} aria-label="Close Oasis AI">
                    <X size={17} strokeWidth={SW} />
                  </button>
                </div>
                <div style={{ height: 'calc(82vh - 67px)' }}>
                  <VoiceAssistantPanel showHeader={false} />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <MobileNav
        page={page}
        onPage={setPage}
        onOpenVoice={() => setShowVoice(prev => !prev)}
        isVoiceOpen={showVoice}
      />
    </ThemeProvider>
  )
}
