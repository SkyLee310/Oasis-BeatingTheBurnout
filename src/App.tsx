import { useState, useEffect, useCallback, useRef } from 'react'
import {
  ThemeProvider, SidebarNavigation, SidebarButton, Avatar,
  Button, Badge, Tooltip, ChatBubbles, PromptPane,
  Tabs,
} from '@figma/astraui'
import {
  Home, Activity, BarChart2, Shield, Settings,
  Heart, Moon, Bluetooth, Mic, MicOff, Brain,
  Zap, TrendingUp, AlertTriangle, CheckCircle,
  ChevronRight, Plus, X, Calendar, Clock,
  Sparkles, Check, ArrowUpRight, Copy, BatteryCharging,
  Quote, RefreshCw,
} from 'lucide-react'

// ─── Types ────────────────────────────────────────────────────────────────────
type Page = 'dashboard' | 'band' | 'load' | 'recovery'
type ZoneKey = 'green' | 'amber' | 'red'
interface ChatMsg { role: 'user' | 'ai'; text: string }

// ─── Zone helpers (Apple Health Style) ─────────────────────────────────────────
const ZONE_LABEL: Record<ZoneKey, string> = {
  green: 'OPTIMAL',
  amber: 'NEAR CAPACITY',
  red: 'OVERLOADED',
}

function ZoneChip({ zone, size = 'sm' }: { zone: ZoneKey; size?: 'sm' | 'lg' }) {
  return (
    <span className={`zone-chip zone-${zone} ${size === 'lg' ? 'zone-chip-lg' : ''}`}>
      {ZONE_LABEL[zone]}
    </span>
  )
}

const zoneVar = (zone: ZoneKey, key: 'text' | 'bg') => `var(--zone-${zone}-${key})`
const zoneAccent = (zone: ZoneKey) => `var(--zone-${zone}-accent)`

// ─── Circular Ring Gauge ──────────────────────────────────────────────────────
function CircularGauge({
  value, max = 100, zone, label, sublabel, size = 136,
}: {
  value: number; max?: number; zone: ZoneKey
  label: string; sublabel: string; size?: number
}) {
  const pct = Math.max(0, Math.min(1, value / max))
  const deg = pct * 360
  const fill = zoneAccent(zone)
  const track = 'var(--hairline)'
  const innerSize = Math.round(size * 0.74)

  return (
    <div className="flex flex-col items-center gap-3">
      <div style={{
        width: size, height: size, borderRadius: '50%', flexShrink: 0,
        background: `conic-gradient(${fill} ${deg}deg, ${track} ${deg}deg 360deg)`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        transition: 'background 700ms cubic-bezier(0.16, 1, 0.3, 1)',
        boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.04)',
      }}>
        <div style={{
          width: innerSize, height: innerSize, borderRadius: '50%',
          background: 'var(--canvas-white)',
          display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
        }}>
          <span className="headline-tight text-ink" style={{ fontSize: size * 0.24, lineHeight: 1 }}>
            {label}
          </span>
          <span style={{ fontSize: Math.max(10, size * 0.09), marginTop: 3, color: 'var(--ink-muted-48)', fontWeight: 500 }}>
            {sublabel}
          </span>
        </div>
      </div>
      <ZoneChip zone={zone} size="sm" />
    </div>
  )
}

// ─── Sparkline Component ──────────────────────────────────────────────────────
function Sparkline({
  values, color = 'var(--brand-primary)', height = 54,
}: {
  values: number[]; color?: string; height?: number
}) {
  const min = Math.min(...values)
  const max = Math.max(...values)
  const range = max - min || 1

  return (
    <div style={{
      display: 'flex', alignItems: 'flex-end', gap: 4,
      height, width: '100%',
    }}>
      {values.map((v, i) => {
        const pct = ((v - min) / range) * 75 + 25
        const isLast = i === values.length - 1
        return (
          <div key={i} style={{
            flex: 1, borderRadius: 3,
            height: `${pct}%`,
            background: color,
            opacity: isLast ? 1 : 0.28 + (i / values.length) * 0.52,
            transition: 'height 500ms cubic-bezier(0.16, 1, 0.3, 1)',
          }} />
        )
      })}
    </div>
  )
}

// ─── Sleep Bar Chart ──────────────────────────────────────────────────────────
function SleepBars({ data, height = 76 }: {
  data: { day: string; hours: number; isToday?: boolean }[]
  height?: number
}) {
  const maxH = 9
  const labelH = 18
  const chartH = height - labelH

  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8, width: '100%', height }}>
      {data.map(d => {
        const zone: ZoneKey = d.hours >= 7 ? 'green' : d.hours >= 6 ? 'amber' : 'red'
        const fillPct = (d.hours / maxH) * 100
        const barColor = zoneAccent(zone)
        return (
          <div key={d.day} style={{
            flex: 1, display: 'flex', flexDirection: 'column',
            alignItems: 'center', gap: 4, height,
          }}>
            <div style={{
              flex: 1, width: '100%', borderRadius: 6,
              background: 'var(--hairline)',
              outline: d.isToday ? '1.5px solid var(--brand-primary)' : 'none',
              outlineOffset: d.isToday ? '1px' : 0,
              display: 'flex', flexDirection: 'column', justifyContent: 'flex-end',
              overflow: 'hidden',
              padding: '2px',
            }}>
              <div style={{
                width: '100%',
                height: `${fillPct}%`,
                background: barColor,
                opacity: d.isToday ? 1 : 0.75,
                borderRadius: 4,
                transition: 'height 600ms cubic-bezier(0.16, 1, 0.3, 1)',
              }} />
            </div>
            <span style={{
              fontSize: 11, lineHeight: 1,
              fontWeight: d.isToday ? 600 : 400,
              color: d.isToday ? 'var(--brand-primary)' : 'var(--ink-muted-48)',
            }}>
              {d.day}
            </span>
          </div>
        )
      })}
    </div>
  )
}

// ─── Load Capacity Bar ────────────────────────────────────────────────────────
function LoadBar({ label, pct, zone }: { label: string; pct: number; zone: ZoneKey }) {
  const barColor = zoneAccent(zone)
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <span className="text-[14px] font-medium text-ink">{label}</span>
        <div className="flex items-center gap-2">
          <span className="text-[14px] font-semibold" style={{ color: barColor }}>{pct}%</span>
          <ZoneChip zone={zone} />
        </div>
      </div>
      <div className="rounded-full overflow-hidden" style={{ height: 8, background: 'var(--hairline)' }}>
        <div className="bar-fill rounded-full"
          style={{ height: '100%', width: `${pct}%`, background: barColor }} />
      </div>
    </div>
  )
}

// ─── Calendar Types & Mock Data ───────────────────────────────────────────────
type EventKind = 'deadline' | 'class' | 'commitment' | 'rest' | 'alert'
interface CalEvent { time: string; title: string; kind: EventKind; energy?: number }
interface CalDay {
  date: number; day: string; month: string
  isToday?: boolean; events: CalEvent[]
}

const KIND_STYLE: Record<EventKind, { bg: string; text: string; dot: string }> = {
  deadline:   { bg: 'var(--zone-red-bg)',   text: 'var(--zone-red-text)',   dot: 'var(--zone-red-accent)' },
  alert:      { bg: 'var(--zone-red-bg)',   text: 'var(--zone-red-text)',   dot: 'var(--zone-red-accent)' },
  commitment: { bg: 'var(--zone-amber-bg)', text: 'var(--zone-amber-text)', dot: 'var(--zone-amber-accent)' },
  class:      { bg: 'var(--surface-pearl)', text: 'var(--ink)',             dot: 'var(--brand-primary)' },
  rest:       { bg: 'var(--zone-green-bg)', text: 'var(--zone-green-text)', dot: 'var(--zone-green-accent)' },
}

const CALENDAR_WEEK: CalDay[] = [
  {
    date: 8, day: 'Mon', month: 'Sep',
    events: [
      { time: '9am', title: 'DS A2 — start today', kind: 'commitment', energy: -12 },
      { time: '3pm', title: 'Study group — LinAlg', kind: 'class' },
    ],
  },
  {
    date: 9, day: 'Tue', month: 'Sep',
    events: [
      { time: '2pm', title: 'Web Systems class', kind: 'class' },
      { time: '5pm', title: 'Part-time interview', kind: 'commitment', energy: -4 },
    ],
  },
  {
    date: 10, day: 'Wed', month: 'Sep', isToday: true,
    events: [
      { time: '9am', title: 'LinAlg Quiz', kind: 'deadline', energy: -8 },
      { time: '1pm', title: 'DS lecture', kind: 'class' },
    ],
  },
  {
    date: 11, day: 'Thu', month: 'Sep',
    events: [
      { time: '11am', title: 'Ethics tutorial', kind: 'class' },
      { time: '11:59pm', title: 'Web Systems Lab due', kind: 'deadline', energy: -6 },
    ],
  },
  {
    date: 12, day: 'Fri', month: 'Sep',
    events: [
      { time: '11:59pm', title: 'DS Assignment 2 due', kind: 'deadline', energy: -12 },
      { time: '5pm', title: 'Part-time shift offer', kind: 'alert' },
    ],
  },
  {
    date: 13, day: 'Sat', month: 'Sep',
    events: [
      { time: 'all day', title: 'Ethics reading (deferred)', kind: 'commitment', energy: -4 },
      { time: 'eve', title: 'Rest + recovery', kind: 'rest' },
    ],
  },
  {
    date: 14, day: 'Sun', month: 'Sep',
    events: [
      { time: 'all day', title: 'Rest day', kind: 'rest' },
    ],
  },
]

// ─── Apple-Style Week Calendar Scrubber ───────────────────────────────────────
function WeekCalendar({
  selectedDate,
  onDayClick,
}: {
  selectedDate: number | null
  onDayClick: (day: CalDay) => void
}) {
  return (
    <div className="grid grid-cols-7 gap-2">
      {CALENDAR_WEEK.map(day => {
        const isSelected = selectedDate === day.date
        return (
          <button
            key={day.date}
            onClick={() => onDayClick(day)}
            className="focus-ring flex flex-col items-center justify-between p-2.5 rounded-[14px] transition-all duration-200"
            style={{
              background: isSelected
                ? 'var(--brand-primary)'
                : day.isToday
                ? 'rgba(0, 102, 204, 0.08)'
                : 'var(--canvas-white)',
              border: isSelected
                ? '1px solid var(--brand-primary)'
                : day.isToday
                ? '1px solid rgba(0, 102, 204, 0.3)'
                : '1px solid var(--hairline)',
              minHeight: 90,
              cursor: 'pointer',
              boxShadow: isSelected ? '0 4px 12px rgba(0, 102, 204, 0.25)' : 'none',
            }}
          >
            <span
              className="text-[11px] font-semibold uppercase tracking-wider"
              style={{
                color: isSelected
                  ? '#ffffff'
                  : day.isToday
                  ? 'var(--brand-primary)'
                  : 'var(--ink-muted-48)',
              }}
            >
              {day.day}
            </span>

            <span
              className="text-[20px] font-semibold headline-tight"
              style={{
                color: isSelected
                  ? '#ffffff'
                  : day.isToday
                  ? 'var(--brand-primary)'
                  : '#1d1d1f',
              }}
            >
              {day.date}
            </span>

            {/* Event indicator dots */}
            <div className="flex items-center gap-1 mt-1">
              {day.events.slice(0, 3).map((ev, i) => (
                <div
                  key={i}
                  style={{
                    width: 5,
                    height: 5,
                    borderRadius: 999,
                    background: isSelected ? '#ffffff' : KIND_STYLE[ev.kind].dot,
                    opacity: isSelected ? 0.9 : 1,
                  }}
                />
              ))}
            </div>
          </button>
        )
      })}
    </div>
  )
}

// ─── Day Detail Panel ─────────────────────────────────────────────────────────
function DayDetail({ day, onClose }: { day: CalDay; onClose: () => void }) {
  return (
    <div className="apple-card p-5 flex flex-col gap-4 mt-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Calendar size={18} className="text-[#0066cc]" />
          <span className="text-[17px] font-semibold headline-tight text-[#1d1d1f]">
            {day.day}, {day.date} {day.month}
            {day.isToday && <span className="ml-2"><Badge label="Today" variant="brand" /></span>}
          </span>
        </div>
        <button
          onClick={onClose}
          aria-label="Close day detail"
          className="w-7 h-7 rounded-full flex items-center justify-center text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
        >
          <X size={16} />
        </button>
      </div>

      <div className="flex flex-col gap-2.5">
        {day.events.map((ev, i) => {
          const s = KIND_STYLE[ev.kind]
          return (
            <div
              key={i}
              className="flex items-start gap-3 rounded-[12px] p-3.5"
              style={{ background: s.bg }}
            >
              <div
                style={{
                  width: 8, height: 8, borderRadius: 999,
                  background: s.dot, flexShrink: 0, marginTop: 5,
                }}
              />
              <div className="flex flex-col gap-0.5 flex-1">
                <span className="text-[14px] font-semibold" style={{ color: s.text }}>{ev.title}</span>
                <span className="text-[13px]" style={{ color: s.text, opacity: 0.85 }}>{ev.time}</span>
                {ev.energy !== undefined && (
                  <span className="text-[12px] font-semibold mt-1" style={{ color: s.text }}>
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

// ─── Commitment Impact Modal / Inline Sheet ───────────────────────────────────
function CommitmentCheck({ onClose }: { onClose: () => void }) {
  const [phase, setPhase] = useState<'input' | 'result'>('input')
  const [hrs, setHrs] = useState(12)
  const [showAfter, setShowAfter] = useState(false)

  const runCheck = () => {
    setPhase('result')
    setTimeout(() => setShowAfter(true), 600)
  }

  return (
    <div className="apple-card p-6 flex flex-col gap-5 mt-3 border border-[#0066cc]/20">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles size={18} className="text-[#0066cc]" />
          <span className="text-[17px] font-semibold headline-tight text-[#1d1d1f]">
            Commitment Impact Simulation
          </span>
        </div>
        <button
          onClick={onClose}
          aria-label="Close"
          className="w-7 h-7 rounded-full flex items-center justify-center text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
        >
          <X size={16} />
        </button>
      </div>

      {phase === 'input' ? (
        <>
          <p className="text-[15px] text-[#7a7a7a]">
            How many additional commitment hours per week are you considering?
          </p>
          <div className="flex gap-2.5 flex-wrap">
            {[4, 8, 12, 16, 20].map(h => (
              <button
                key={h}
                onClick={() => setHrs(h)}
                className={`px-4 py-2 rounded-full text-[14px] font-medium transition-all ${
                  hrs === h
                    ? 'bg-[#0066cc] text-white shadow-sm'
                    : 'bg-[#f5f5f7] text-[#1d1d1f] hover:bg-[#e5e5ea]'
                }`}
              >
                {h} hrs/wk
              </button>
            ))}
          </div>
          <button className="apple-btn-primary self-start mt-2" onClick={runCheck}>
            Simulate Energy Impact <ChevronRight size={16} />
          </button>
        </>
      ) : (
        <>
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 rounded-[14px] bg-[#f5f5f7] flex flex-col gap-1">
              <span className="text-[13px] text-[#7a7a7a]">Current Energy</span>
              <span className="text-[32px] font-semibold headline-tight text-[#1d1d1f]">38</span>
              <ZoneChip zone="amber" />
            </div>
            <div className="p-4 rounded-[14px] bg-[#f5f5f7] flex flex-col gap-1">
              <span className="text-[13px] text-[#7a7a7a]">Projected (15 Sep)</span>
              <span
                className="text-[32px] font-semibold headline-tight transition-colors duration-500"
                style={{ color: showAfter ? '#ff3b30' : '#1d1d1f' }}
              >
                {showAfter ? 22 : 38}
              </span>
              <ZoneChip zone={showAfter ? 'red' : 'amber'} />
            </div>
          </div>
          <div className="rounded-[14px] p-4 flex gap-3" style={{ background: '#fde8e8', borderLeft: '3px solid #ff3b30' }}>
            <AlertTriangle size={20} className="text-[#ff3b30] shrink-0 mt-0.5" />
            <p className="text-[14px] text-[#d70015] leading-relaxed">
              Adding <strong>{hrs} hrs/week</strong> causes DS A2 and LinAlg exam to collide directly on 15 Sep, pulling energy into critical burnout threshold (22 pts).
            </p>
          </div>
          <button className="apple-btn-secondary self-start" onClick={() => { setPhase('input'); setShowAfter(false) }}>
            Adjust Parameters
          </button>
        </>
      )}
    </div>
  )
}

// ─── Daily Mindfulness Quotes ──────────────────────────────────────────────────
const DAILY_QUOTES = [
  { quote: "Almost everything will work again if you unplug it for a few minutes, including you.", author: "Anne Lamott" },
  { quote: "Rest is not idle, is not wasteful. Sometimes rest is the most productive thing you can do.", author: "Mark Black" },
  { quote: "You don't have to control your thoughts. You just have to stop letting them control you.", author: "Dan Millman" },
  { quote: "Pace yourself today. You are building a sustainable life, not just finishing a to-do list.", author: "Oasis Wisdom" },
  { quote: "Give yourself permission to pause. Recovery is where strength is quietly rebuilt.", author: "Alex Elle" },
]

// ─── Dashboard Page (Museum Gallery Aesthetic) ─────────────────────────────────
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
    <div className="flex flex-col gap-12 sm:gap-16 max-w-[1140px] mx-auto pb-4">

      {/* ── Editorial Hero ──────────────────────────────────────────────────── */}
      <header className="flex flex-col gap-8">
        <div className="flex items-center gap-3">
          <Avatar type="initial" initials="MC" size="medium" shape="circle" />
          <div className="flex flex-col">
            <span className="eyebrow">Wednesday · 10 Sep 2026</span>
            <span className="text-[15px] font-medium text-ink-2">Good morning, Maya</span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_auto] items-end gap-8 lg:gap-12">
          <div className="flex flex-col gap-5">
            <span className="eyebrow text-brand">Today&apos;s reading — Near capacity</span>
            <h1 className="display-hero headline-display text-ink">
              You&apos;re running<br />near capacity.
            </h1>
            <p className="text-[16px] sm:text-[18px] text-ink-muted leading-relaxed max-w-[46ch]">
              Sleep is trending low and your calendar is 89% full through Friday.
              Protect this afternoon — a small recovery now prevents a crash on the 15th.
            </p>
            <div className="flex flex-wrap items-center gap-3 pt-1">
              <button className="apple-btn-primary" onClick={onGoRecovery}>
                <Shield size={15} /> Build recovery plan
              </button>
              <button className="apple-btn-secondary" onClick={onGoLoad}>
                Review this week&apos;s load <ChevronRight size={14} />
              </button>
            </div>
          </div>

          <div className="flex lg:flex-col items-center justify-center gap-4 lg:pl-8 lg:border-l" style={{ borderColor: 'var(--hairline)' }}>
            <CircularGauge value={38} zone="amber" label="38" sublabel="/ 100 energy" size={168} />
          </div>
        </div>
      </header>

      {/* ── Telemetry strip (inline, hairline-divided — not boxed cards) ─────── */}
      <section className="flex flex-col gap-5">
        <div className="flex items-center justify-between">
          <h2 className="eyebrow">Live biometrics</h2>
          <span className="text-[12px] text-ink-faint">Synced from Smart Band · 2m ago</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x" style={{ borderColor: 'var(--hairline)' }}>
          {/* Energy */}
          <div className="flex flex-col gap-2 py-5 md:py-0 md:pr-8">
            <div className="flex items-center gap-2 text-ink-muted">
              <Zap size={15} style={{ color: 'var(--zone-amber-accent)' }} />
              <span className="text-[13px] font-medium">Energy index</span>
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-[44px] font-semibold headline-display text-ink">38</span>
              <span className="text-[14px] text-ink-faint">/ 100</span>
            </div>
            <ZoneChip zone="amber" size="sm" />
          </div>

          {/* Heart rate */}
          <div className="flex flex-col gap-2 py-5 md:py-0 md:px-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-ink-muted">
                <Heart size={15} style={{ color: 'var(--zone-red-accent)' }} />
                <span className="text-[13px] font-medium">Heart rate</span>
              </div>
              <span className="text-[12px] font-semibold" style={{ color: 'var(--zone-amber-text)' }}>+6 bpm</span>
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-[44px] font-semibold headline-display text-ink">78</span>
              <span className="text-[14px] text-ink-faint">bpm</span>
            </div>
            <Sparkline values={hrValues} color={zoneAccent('amber')} height={40} />
          </div>

          {/* Sleep */}
          <div className="flex flex-col gap-2 py-5 md:py-0 md:pl-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-ink-muted">
                <Moon size={15} className="text-brand" />
                <span className="text-[13px] font-medium">Sleep · 7-day</span>
              </div>
              <span className="text-[12px] font-semibold" style={{ color: 'var(--zone-red-text)' }}>Goal 7.5h</span>
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-[44px] font-semibold headline-display text-ink">5.4</span>
              <span className="text-[14px] text-ink-faint">hrs avg</span>
            </div>
            <SleepBars data={sleepData} height={44} />
          </div>
        </div>
      </section>

      {/* ── Pull-quote ──────────────────────────────────────────────────────── */}
      <section className="flex flex-col gap-3 border-l-2 pl-5 sm:pl-6" style={{ borderColor: 'var(--brand-primary)' }}>
        <div className="flex items-center justify-between">
          <span className="eyebrow text-brand inline-flex items-center gap-2">
            <Quote size={13} /> Daily reset
          </span>
          <button
            onClick={handleNextQuote}
            className="focus-ring text-[12px] text-ink-faint hover:text-brand transition-colors flex items-center gap-1.5 px-2 py-0.5 rounded-full"
            title="Next reflection"
          >
            <RefreshCw size={12} className={isRotating ? 'animate-spin' : ''} />
            <span>Next</span>
          </button>
        </div>
        <p className="text-[20px] sm:text-[26px] headline-display text-ink leading-snug max-w-[38ch]">
          &ldquo;{currentQuote.quote}&rdquo;
        </p>
        <span className="text-[13px] text-ink-muted font-medium">— {currentQuote.author}</span>
      </section>

      {/* ── Asymmetric: this week's pressure + decision rail ─────────────────── */}
      <section className="grid grid-cols-1 lg:grid-cols-[1.6fr_1fr] gap-8 lg:gap-12">
        {/* Wide narrative column */}
        <div className="flex flex-col gap-5">
          <div className="flex items-baseline justify-between hairline-b pb-3">
            <h2 className="text-[22px] headline-display text-ink">This week&apos;s pressure</h2>
            <Badge label={`${upcoming.length} pending`} variant="warning" />
          </div>
          <div className="flex flex-col rule-divide">
            {upcoming.map((ev, i) => {
              const s = KIND_STYLE[ev.kind]
              return (
                <div key={i} className="flex items-center gap-4 py-3.5">
                  <div style={{ width: 9, height: 9, borderRadius: 999, background: s.dot, flexShrink: 0 }} />
                  <div className="flex flex-col gap-0.5 flex-1 min-w-0">
                    <span className="text-[15px] font-semibold text-ink truncate">{ev.title}</span>
                    <span className="text-[12px] text-ink-faint">{ev.day} {ev.date} Sep · {ev.time}</span>
                  </div>
                  {ev.energy !== undefined && (
                    <span className="text-[13px] font-semibold" style={{ color: s.text }}>{ev.energy} pts</span>
                  )}
                </div>
              )
            })}
          </div>
          <button className="apple-btn-secondary self-start" onClick={onGoLoad}>
            Open full schedule <ChevronRight size={14} />
          </button>
        </div>

        {/* Narrow decision rail */}
        <aside className="apple-card p-6 flex flex-col gap-4 self-start" style={{ background: 'var(--surface-pearl)' }}>
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-full flex items-center justify-center shrink-0" style={{ background: 'var(--zone-amber-bg)' }}>
              <AlertTriangle size={18} style={{ color: 'var(--zone-amber-accent)' }} />
            </div>
            <div className="flex flex-col">
              <span className="eyebrow" style={{ color: 'var(--zone-amber-text)' }}>Decision pending</span>
              <span className="text-[17px] font-semibold headline-tight text-ink">Part-time retail offer</span>
            </div>
          </div>

          <div className="flex flex-col gap-2.5">
            {[
              { label: '12 hrs / week workload', icon: <Clock size={15} /> },
              { label: 'Tue · Thu · Sat distribution', icon: <Calendar size={15} /> },
              { label: 'High crash risk, week of 15 Sep', icon: <AlertTriangle size={15} /> },
            ].map(r => (
              <div key={r.label} className="flex items-center gap-2.5 text-[13px] text-ink-2">
                <span className="flex" style={{ color: 'var(--zone-amber-accent)' }}>{r.icon}</span>
                <span>{r.label}</span>
              </div>
            ))}
          </div>

          <p className="text-[13px] text-ink-muted leading-relaxed">
            Accepting this shift pushes your recovery score from 38 down to 22 when DS A2 and LinAlg mid-terms overlap.
          </p>

          <button className="apple-btn-primary w-full" onClick={() => setShowCommit(true)}>
            <TrendingUp size={15} /> Run impact check
          </button>

          {showCommit && (
            <CommitmentCheck onClose={() => setShowCommit(false)} />
          )}
        </aside>
      </section>
    </div>
  )
}

// ─── Smart Band Page (Product Showcase & Live Telemetry) ───────────────────────
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
    { label: 'Autonomic HR', value: '78 bpm', weight: 40, icon: <Heart size={16} />, zone: 'amber' as ZoneKey },
    { label: 'Sleep quality', value: '5.4 hrs', weight: 35, icon: <Moon size={16} />, zone: 'red' as ZoneKey },
    { label: 'Calendar density', value: '89%', weight: 25, icon: <Activity size={16} />, zone: 'red' as ZoneKey },
  ]

  return (
    <div className="flex flex-col gap-12 sm:gap-16 max-w-[1140px] mx-auto pb-4">

      {/* ── Device showcase hero (dark editorial band) ──────────────────────── */}
      <header className="editorial-dark p-7 sm:p-10 flex flex-col gap-8">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div className="flex flex-col gap-1">
            <span className="eyebrow" style={{ color: 'var(--brand-primary-on-dark)' }}>Connected device</span>
            <div className="flex items-center gap-2.5">
              <span className="text-[24px] sm:text-[28px] headline-display text-white">Xiaomi Smart Band 8 Pro</span>
              <BatteryCharging size={18} style={{ color: 'var(--zone-green-accent)' }} />
            </div>
            <span className="text-[13px]" style={{ color: 'rgba(255,255,255,0.6)' }}>
              {connected ? 'Streaming live telemetry every 2 seconds' : 'Last synchronized today at 08:14'}
            </span>
          </div>
          <button
            onClick={() => setConnected(c => !c)}
            role="switch"
            aria-checked={connected}
            aria-label="Toggle band connection"
            className="focus-ring relative w-12 h-7 rounded-full transition-colors duration-200 shrink-0"
            style={{
              background: connected ? 'var(--brand-primary)' : 'rgba(255,255,255,0.22)',
              border: 'none', cursor: 'pointer',
            }}
          >
            <div
              className="absolute top-1 w-5 h-5 rounded-full bg-white transition-transform duration-200 shadow-sm"
              style={{ transform: connected ? 'translateX(24px)' : 'translateX(4px)' }}
            />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-[auto_1fr] items-center gap-8">
          <div className="flex items-baseline gap-2">
            <span className="headline-display text-white" style={{ fontSize: 'clamp(3.5rem, 14vw, 6rem)', lineHeight: 0.9 }}>
              {hr}
            </span>
            <span className="text-[16px]" style={{ color: 'rgba(255,255,255,0.6)' }}>bpm</span>
          </div>
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <span className="eyebrow" style={{ color: 'rgba(255,255,255,0.55)' }}>Live heart rate</span>
              {connected && (
                <span className="inline-flex items-center gap-1.5 text-[11px] font-bold px-2.5 py-1 rounded-full" style={{ color: '#fff', background: 'var(--zone-red-accent)' }}>
                  <span className="w-2 h-2 rounded-full bg-white animate-ping" /> LIVE
                </span>
              )}
            </div>
            <Sparkline values={hrHistory} color={zoneAccent(hrZone)} height={56} />
            <span className="text-[13px]" style={{ color: 'rgba(255,255,255,0.6)' }}>
              Elevated 6 bpm over your 72 bpm resting baseline — contributes +4 to today&apos;s stress score.
            </span>
          </div>
        </div>
      </header>

      {/* ── Sleep architecture (asymmetric) ─────────────────────────────────── */}
      <section className="grid grid-cols-1 md:grid-cols-[auto_1fr] items-center gap-8 md:gap-12">
        <div className="flex flex-col items-center gap-3">
          <CircularGauge value={5.4} max={9} zone="red" label="5.4" sublabel="hrs" size={150} />
        </div>
        <div className="flex flex-col gap-4">
          <div className="flex items-baseline justify-between hairline-b pb-3">
            <h2 className="text-[22px] headline-display text-ink">Sleep architecture</h2>
            <ZoneChip zone="red" />
          </div>
          <SleepBars data={sleepData} height={92} />
          <p className="text-[14px] text-ink-muted leading-relaxed max-w-[52ch]">
            Below your 6-hour recovery baseline for four nights running. Aim for 7.5 hours
            before Thursday to keep your stress score from climbing further.
          </p>
        </div>
      </section>

      {/* ── Stress index formula (explanatory editorial breakdown) ──────────── */}
      <section className="flex flex-col gap-6">
        <div className="flex flex-col gap-1">
          <span className="eyebrow">How we score it</span>
          <h2 className="text-[22px] sm:text-[26px] headline-display text-ink">The Oasis stress index</h2>
        </div>

        <div className="flex flex-col rule-divide">
          {factors.map(f => (
            <div key={f.label} className="grid grid-cols-[1fr_auto] sm:grid-cols-[minmax(0,1.4fr)_1fr_auto] items-center gap-4 py-4">
              <div className="flex items-center gap-3 min-w-0">
                <span className="flex" style={{ color: zoneAccent(f.zone) }}>{f.icon}</span>
                <div className="flex flex-col min-w-0">
                  <span className="text-[15px] font-semibold text-ink truncate">{f.label}</span>
                  <span className="text-[13px] text-ink-faint">{f.value}</span>
                </div>
              </div>
              <div className="hidden sm:flex items-center gap-3">
                <div className="rounded-full overflow-hidden flex-1" style={{ height: 6, background: 'var(--hairline)', minWidth: 80 }}>
                  <div className="bar-fill rounded-full" style={{ height: '100%', width: `${f.weight}%`, background: zoneAccent(f.zone) }} />
                </div>
                <span className="text-[13px] font-semibold text-ink-muted tabular-nums w-10 text-right">{f.weight}%</span>
              </div>
              <ZoneChip zone={f.zone} />
            </div>
          ))}
        </div>

        <div className="flex items-center justify-between p-5 rounded-[18px]" style={{ background: 'var(--zone-red-bg)' }}>
          <div className="flex flex-col">
            <span className="eyebrow" style={{ color: 'var(--zone-red-text)' }}>Calculated stress score</span>
            <span className="text-[13px]" style={{ color: 'var(--zone-red-text)', opacity: 0.85 }}>Weighted across all three signals</span>
          </div>
          <span className="text-[40px] headline-display" style={{ color: 'var(--zone-red-text)' }}>62<span className="text-[18px]"> / 100</span></span>
        </div>
      </section>
    </div>
  )
}

// ─── Combined Schedule & Load Management Page ─────────────────────────────────
function LoadPage() {
  const [selectedDay, setSelectedDay] = useState<CalDay | null>(
    CALENDAR_WEEK.find(d => d.isToday) ?? null
  )
  const [commitPhase, setCommitPhase] = useState<'idle' | 'input' | 'result'>('idle')
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

  return (
    <div className="flex flex-col gap-6 max-w-[1100px] mx-auto">
      <header className="flex flex-col gap-3 border-l-2 pl-5 sm:pl-6" style={{ borderColor: 'var(--brand-primary)' }}>
        <span className="eyebrow">Week of 8–14 September</span>
        <h1 className="display-hero headline-display text-ink" style={{ fontSize: 'clamp(2.25rem, 7vw, 3.75rem)' }}>
          Schedule &amp; load
        </h1>
        <p className="text-[16px] text-ink-muted leading-relaxed max-w-[52ch]">
          Your week timeline, where the pressure is concentrated, and what you can safely move.
        </p>
      </header>

      <Tabs
        defaultTab="schedule"
        tabs={[
          {
            id: 'schedule', label: 'Weekly Schedule',
            content: (
              <div className="flex flex-col gap-5 pt-4">
                <div className="apple-card p-6 flex flex-col gap-5">
                  <div className="flex items-center justify-between flex-wrap gap-3">
                    <div className="flex items-center gap-2.5">
                      <Calendar size={18} className="text-[#0066cc]" />
                      <span className="text-[18px] font-semibold headline-tight text-[#1d1d1f]">Interactive Schedule</span>
                    </div>
                    <div className="flex items-center gap-4 flex-wrap">
                      {[
                        { label: 'Deadline', kind: 'deadline' as EventKind },
                        { label: 'Commitment', kind: 'commitment' as EventKind },
                        { label: 'Class', kind: 'class' as EventKind },
                        { label: 'Rest', kind: 'rest' as EventKind },
                      ].map(l => (
                        <div key={l.label} className="flex items-center gap-1.5">
                          <div style={{ width: 7, height: 7, borderRadius: 999, background: KIND_STYLE[l.kind].dot }} />
                          <span className="text-[12px] text-[#7a7a7a]">{l.label}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <WeekCalendar selectedDate={selectedDay?.date ?? null} onDayClick={setSelectedDay} />

                  {selectedDay && (
                    <DayDetail day={selectedDay} onClose={() => setSelectedDay(null)} />
                  )}
                </div>
              </div>
            ),
          },
          {
            id: 'categories', label: 'Load Categories',
            content: (
              <div className="flex flex-col gap-8 pt-6">
                {/* Lead category — emphasized */}
                {(() => {
                  const lead = categories[0]
                  return (
                    <div className="flex flex-col gap-4">
                      <span className="eyebrow">Highest load right now</span>
                      <div className="flex items-baseline justify-between gap-4">
                        <h3 className="text-[26px] sm:text-[32px] headline-display text-ink">{lead.label}</h3>
                        <span className="text-[40px] headline-display tabular-nums" style={{ color: zoneAccent(lead.zone) }}>{lead.pct}%</span>
                      </div>
                      <div className="rounded-full overflow-hidden" style={{ height: 10, background: 'var(--hairline)' }}>
                        <div className="bar-fill rounded-full" style={{ height: '100%', width: `${lead.pct}%`, background: zoneAccent(lead.zone) }} />
                      </div>
                      <p className="text-[14px] text-ink-muted leading-relaxed max-w-[56ch]">{lead.detail}</p>
                    </div>
                  )
                })()}

                {/* Remaining categories — compact ranked rows */}
                <div className="flex flex-col rule-divide">
                  {categories.slice(1).map((c, i) => (
                    <div key={c.label} className="flex items-center gap-4 py-4">
                      <span className="text-[13px] font-semibold text-ink-faint tabular-nums w-6">{i + 2}</span>
                      <div className="flex flex-col gap-2 flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-3">
                          <span className="text-[15px] font-semibold text-ink truncate">{c.label}</span>
                          <div className="flex items-center gap-2 shrink-0">
                            <span className="text-[14px] font-semibold tabular-nums" style={{ color: zoneAccent(c.zone) }}>{c.pct}%</span>
                            <ZoneChip zone={c.zone} />
                          </div>
                        </div>
                        <div className="rounded-full overflow-hidden" style={{ height: 6, background: 'var(--hairline)' }}>
                          <div className="bar-fill rounded-full" style={{ height: '100%', width: `${c.pct}%`, background: zoneAccent(c.zone) }} />
                        </div>
                        <p className="text-[12px] text-ink-faint">{c.detail}</p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="rounded-[14px] p-4 flex gap-3 border-l-4" style={{ background: 'var(--zone-red-bg)', borderColor: 'var(--zone-red-accent)' }}>
                  <AlertTriangle size={20} className="shrink-0 mt-0.5" style={{ color: 'var(--zone-red-accent)' }} />
                  <p className="text-[14px]" style={{ color: 'var(--zone-red-text)' }}>
                    Two primary domains exceed 85%. Taking on additional obligations will cascade into severe fatigue.
                  </p>
                </div>
              </div>
            ),
          },
          {
            id: 'tasks', label: 'Smart Task Deferral',
            content: (
              <div className="flex flex-col gap-4 pt-4">
                {deferred && (
                  <div className="rounded-[14px] p-4 flex gap-3 bg-[#eaf8ee] border-l-4 border-[#34c759]">
                    <CheckCircle size={20} className="text-[#34c759] shrink-0 mt-0.5" />
                    <span className="text-[14px] text-[#1b8a3e] font-medium">
                      Ethics reading successfully deferred to Saturday — frees 4 vital energy units on Friday.
                    </span>
                  </div>
                )}
                {tasks.map(t => (
                  <div key={t.label} className="apple-card p-5 flex items-start justify-between gap-4">
                    <div className="flex flex-col gap-1 flex-1">
                      <span className="text-[16px] font-semibold headline-tight text-[#1d1d1f]">{t.label}</span>
                      <span className="text-[13px] font-medium" style={{
                        color: t.zone === 'red' ? '#d70015' : t.zone === 'amber' ? '#b25e02' : '#1b8a3e',
                      }}>{t.due}</span>
                      <span className="text-[13px] text-[#7a7a7a] mt-1">{t.reason}</span>
                    </div>
                    <div className="flex flex-col items-end gap-2 shrink-0">
                      <span className="text-[13px] font-semibold text-[#86868b]">{t.cost} pts</span>
                      {t.movable && !deferred && (
                        <button className="apple-btn-secondary py-1.5 px-3.5 text-[13px]" onClick={() => setDeferred(true)}>
                          Defer Task
                        </button>
                      )}
                      {t.movable && deferred && <Badge label="DEFERRED" variant="success" />}
                    </div>
                  </div>
                ))}
              </div>
            ),
          },
          {
            id: 'commitment', label: 'Commitment Simulator',
            content: (
              <div className="flex flex-col gap-4 pt-4">
                <div className="apple-card p-6 flex flex-col gap-5">
                  <span className="text-[18px] font-semibold headline-tight text-[#1d1d1f]">
                    Simulate New Commitment Impact
                  </span>
                  <p className="text-[14px] text-[#7a7a7a]">
                    Test the consequence of accepting new obligations before confirming.
                  </p>
                  <div className="flex gap-2.5 flex-wrap">
                    {[4, 8, 12, 16, 20].map(h => (
                      <button
                        key={h}
                        onClick={() => setHrs(h)}
                        className={`px-4 py-2 rounded-full text-[14px] font-medium transition-all ${
                          hrs === h
                            ? 'bg-[#0066cc] text-white shadow-sm'
                            : 'bg-[#f5f5f7] text-[#1d1d1f] hover:bg-[#e5e5ea]'
                        }`}
                      >
                        {h} hrs/week
                      </button>
                    ))}
                  </div>
                  <button
                    className="apple-btn-primary self-start"
                    onClick={() => { setCommitPhase('result'); setTimeout(() => setShowAfter(true), 600) }}
                  >
                    Run Full Impact Check <ArrowUpRight size={16} />
                  </button>
                </div>

                {commitPhase === 'result' && (
                  <div className="apple-card p-6 flex flex-col gap-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-4 rounded-[14px] bg-[#f5f5f7] flex flex-col gap-1">
                        <span className="text-[13px] text-[#7a7a7a]">Current Energy</span>
                        <span className="text-[36px] font-semibold headline-tight text-[#1d1d1f]">38</span>
                        <ZoneChip zone="amber" />
                      </div>
                      <div className="p-4 rounded-[14px] bg-[#f5f5f7] flex flex-col gap-1">
                        <span className="text-[13px] text-[#7a7a7a]">Projected Energy</span>
                        <span className="text-[36px] font-semibold headline-tight text-[#ff3b30]">
                          {showAfter ? 22 : 38}
                        </span>
                        <ZoneChip zone={showAfter ? 'red' : 'amber'} />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ),
          },
        ]}
      />
    </div>
  )
}

// ─── Recovery Page (Apple Mindfulness & Restoration) ──────────────────────────
function RecoveryPage() {
  const [ticked, setTicked] = useState<Record<string, boolean>>({})
  const [showComm, setShowComm] = useState(false)
  const [copied, setCopied] = useState(false)

  const total = Object.values(ticked).filter(Boolean).length
  const energy = Math.min(20 + total * 3, 48)
  const currentZone: ZoneKey = energy >= 45 ? 'green' : energy >= 30 ? 'amber' : 'red'

  const days = [
    { date: 'Monday 15 Sep', items: [
      { id: 'a1', label: 'Restful sleep prior to midnight', gain: '+8' },
      { id: 'a2', label: '20-minute restorative outdoor walk', gain: '+6' },
      { id: 'a3', label: 'Decline non-essential meetings', gain: '+4' },
    ]},
    { date: 'Tuesday 16 Sep', items: [
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
    <div className="flex flex-col gap-14 sm:gap-20 max-w-[880px] mx-auto pb-4">

      {/* ── Calm centered hero ──────────────────────────────────────────────── */}
      <header className="flex flex-col items-center text-center gap-6 pt-4">
        <span className="eyebrow">Recovery plan</span>
        <CircularGauge value={energy} zone={currentZone} label={String(energy)} sublabel="/ 100" size={188} />
        <div className="flex flex-col items-center gap-4 max-w-[44ch]">
          <h1 className="text-[26px] sm:text-[34px] headline-display text-ink leading-snug">
            Restore your energy above 45 to leave the fatigue zone.
          </h1>
          <p className="text-[15px] text-ink-muted leading-relaxed">
            Check off small restorative actions below. Each one nudges your autonomic
            recovery up in real time — no single big fix required.
          </p>
          {energy >= 45 && (
            <div className="inline-flex items-center gap-2 text-[13px] font-semibold px-3.5 py-1.5 rounded-full" style={{ color: 'var(--zone-green-text)', background: 'var(--zone-green-bg)' }}>
              <CheckCircle size={15} /> You&apos;re back in the stable zone.
            </div>
          )}
        </div>
      </header>

      {/* ── Daily restoration check-ins (light checklist) ───────────────────── */}
      <section className="flex flex-col gap-10">
        {days.map(d => (
          <div key={d.date} className="flex flex-col gap-1">
            <span className="eyebrow hairline-b pb-3 mb-1">{d.date}</span>
            {d.items.map(item => {
              const done = ticked[item.id]
              return (
                <button
                  key={item.id}
                  onClick={() => setTicked(p => ({ ...p, [item.id]: !p[item.id] }))}
                  role="checkbox"
                  aria-checked={!!done}
                  className="focus-ring flex items-center gap-4 text-left py-4 hairline-b transition-colors"
                  style={{ cursor: 'pointer', background: 'none', border: 'none', borderBottom: '1px solid var(--hairline)' }}
                >
                  <div style={{
                    width: 26, height: 26, borderRadius: 999, flexShrink: 0,
                    background: done ? 'var(--zone-green-accent)' : 'transparent',
                    border: `1.5px solid ${done ? 'var(--zone-green-accent)' : 'var(--hairline)'}`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
                  }}>
                    {done && <Check size={15} className="text-white tick-in stroke-[2.5]" />}
                  </div>
                  <span className="text-[16px] font-medium flex-1" style={{ color: done ? 'var(--ink-muted-48)' : 'var(--ink)', textDecoration: done ? 'line-through' : 'none' }}>
                    {item.label}
                  </span>
                  <span className="text-[13px] font-semibold tabular-nums" style={{ color: done ? 'var(--zone-green-text)' : 'var(--ink-muted-30)' }}>
                    {item.gain} pts
                  </span>
                </button>
              )
            })}
          </div>
        ))}
      </section>

      {/* ── Communication assist (quiet card) ───────────────────────────────── */}
      <section className="apple-card p-6 flex flex-col gap-4" style={{ background: 'var(--surface-pearl)' }}>
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <Sparkles size={18} className="text-brand" />
            <span className="text-[16px] font-semibold headline-tight text-ink">
              Need to say no? Here&apos;s a script.
            </span>
          </div>
          <button className="apple-btn-secondary py-1.5 px-4 text-[13px]" onClick={() => setShowComm(p => !p)}>
            {showComm ? 'Hide' : 'Show'}
          </button>
        </div>

        {showComm && (
          <div className="p-4 rounded-[14px] bg-surface flex flex-col gap-3" style={{ border: '1px solid var(--hairline)' }}>
            <p className="text-[15px] text-ink-2 italic leading-relaxed">
              &ldquo;Hi team, thank you for considering me for this opportunity. After reviewing my academic milestones and project commitments for this semester, I won&apos;t be able to take on extra shifts right now to maintain high quality deliverables.&rdquo;
            </p>
            <button className="apple-btn-primary self-start text-[13px] py-1.5 px-3.5" onClick={copyTemplate}>
              {copied ? <><Check size={14} /> Copied</> : <><Copy size={14} /> Copy to clipboard</>}
            </button>
          </div>
        )}
      </section>
    </div>
  )
}

// ─── Voice Prompts Mock ───────────────────────────────────────────────────────
const VOICE_PROMPTS = [
  "I'm feeling overwhelmed with my upcoming DS Assignment 2 deadline.",
  "Can you help me rebalance my Thursday schedule so I can sleep earlier?",
  "Should I accept the part-time shift offer this weekend?",
]

// ─── Voice Assistant Panel (Apple Messages Aesthetic) ─────────────────────────
function VoiceAssistantPanel({ showHeader = true }: { showHeader?: boolean }) {
  const [messages, setMessages] = useState<ChatMsg[]>([
    { role: 'ai', text: "Hi Maya. I'm monitoring your load trends — your calendar density is elevated. How can I assist your schedule today?" },
  ])
  const [input, setInput] = useState('')
  const [recording, setRecording] = useState(false)
  const [promptIdx, setPromptIdx] = useState(0)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const getAIReply = (msg: string) => {
    if (msg.toLowerCase().includes('shift') || msg.toLowerCase().includes('part-time')) {
      return "Based on your 78 bpm elevated heart rate and 5.4h sleep average, taking the 12h retail shift will cause an energy crash around 15 Sep. I recommend politely declining."
    }
    if (msg.toLowerCase().includes('ds') || msg.toLowerCase().includes('assignment')) {
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
    <div className="flex flex-col h-full bg-white">
      {showHeader && (
        <div className="flex items-center gap-2.5 px-6 py-4 border-b border-[#e5e5ea]">
          <Brain size={20} className="text-[#0066cc]" />
          <span className="text-[16px] font-semibold headline-tight text-[#1d1d1f]">Oasis AI</span>
        </div>
      )}

      <PromptPane
        value={input}
        placeholder="Ask Oasis AI about your schedule or workload…"
        onChange={setInput}
        onSend={send}
        className="flex-1"
      >
        {messages.map((m, i) => (
          <ChatBubbles
            key={i}
            type={m.role === 'ai' ? 'ai' : 'user'}
            text={m.text}
            userAvatar={m.role === 'user'
              ? <Avatar type="initial" initials="MC" size="small" shape="circle" />
              : undefined}
          />
        ))}
      </PromptPane>

      <div className="flex items-center justify-between px-5 py-3 border-t border-[#e5e5ea] bg-[#fafafc]">
        <span className="text-[13px] text-[#86868b]">
          {recording ? 'Listening…' : 'Tap microphone for voice input'}
        </span>
        <button
          onClick={startVoice}
          aria-label={recording ? 'Stop voice input' : 'Start voice input'}
          className={`focus-ring relative flex items-center justify-center rounded-full transition-all duration-200 ${
            recording ? 'bg-[#ff3b30] text-white scale-105' : 'bg-[#f5f5f7] text-[#1d1d1f] hover:bg-[#e5e5ea]'
          }`}
          style={{ width: 42, height: 42, border: 'none', cursor: 'pointer' }}
        >
          {recording ? <Mic size={18} /> : <MicOff size={18} className="text-[#86868b]" />}
          {recording && (
            <span className="absolute inset-0 rounded-full bg-[#ff3b30] animate-ping opacity-30 pointer-events-none" />
          )}
        </button>
      </div>
    </div>
  )
}

// ─── Mobile Bottom Nav ────────────────────────────────────────────────────────
function MobileNav({
  page,
  onPage,
  onOpenVoice,
  isVoiceOpen,
}: {
  page: Page
  onPage: (p: Page) => void
  onOpenVoice: () => void
  isVoiceOpen: boolean
}) {
  const leftItems: { id: Page; icon: React.ReactNode; label: string }[] = [
    { id: 'dashboard', icon: <Home size={20} strokeWidth={1.75} />, label: 'Home' },
    { id: 'load',      icon: <Calendar size={20} strokeWidth={1.75} />, label: 'Schedule' },
  ]

  const rightItems: { id: Page; icon: React.ReactNode; label: string }[] = [
    { id: 'recovery',  icon: <Shield size={20} strokeWidth={1.75} />, label: 'Recover' },
    { id: 'band',      icon: <Activity size={20} strokeWidth={1.75} />, label: 'Band' },
  ]

  return (
    <nav
      className="flex items-center justify-around border-t border-[rgba(0,0,0,0.08)] apple-frosted show-mobile"
      style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 40,
        height: 66,
        paddingLeft: 12,
        paddingRight: 12,
        boxShadow: '0 -2px 16px rgba(0, 0, 0, 0.04)',
      }}
    >
      {/* Left side: Home & Schedule */}
      {leftItems.map(it => {
        const isActive = page === it.id
        return (
          <button
            key={it.id}
            onClick={() => onPage(it.id)}
            aria-label={it.label}
            aria-current={isActive ? 'page' : undefined}
            className="focus-ring flex flex-col items-center justify-center flex-1 gap-1"
            style={{
              border: 'none',
              background: 'none',
              cursor: 'pointer',
              padding: '6px 0',
              fontFamily: 'inherit',
              color: isActive ? 'var(--brand-primary)' : 'var(--ink-muted-48)',
              transform: isActive ? 'scale(1.05)' : 'scale(1)',
              transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
            }}
          >
            <div style={{ transform: isActive ? 'translateY(-1px)' : 'none', transition: 'transform 0.2s ease' }}>
              {it.icon}
            </div>
            <span
              className="text-[10px] font-semibold uppercase tracking-wider"
              style={{ fontWeight: isActive ? 700 : 500 }}
            >
              {it.label}
            </span>
          </button>
        )
      })}

      {/* Middle: Prominent Circular Oasis AI Button */}
      <div className="flex items-center justify-center flex-1" style={{ position: 'relative', height: '100%' }}>
        <button
          onClick={onOpenVoice}
          aria-label="Oasis AI"
          className="focus-ring flex items-center justify-center group"
          style={{
            position: 'absolute',
            top: -18,
            width: 56,
            height: 56,
            borderRadius: '50%',
            background: isVoiceOpen
              ? 'linear-gradient(135deg, #ff3b30 0%, #d70015 100%)'
              : 'linear-gradient(135deg, #0071e3 0%, #0066cc 100%)',
            border: '3.5px solid #ffffff',
            color: '#ffffff',
            cursor: 'pointer',
            boxShadow: isVoiceOpen
              ? '0 8px 24px rgba(255, 59, 48, 0.45)'
              : '0 8px 24px rgba(0, 102, 204, 0.4)',
            transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
          }}
          onMouseDown={e => {
            e.currentTarget.style.transform = 'scale(0.92)'
          }}
          onMouseUp={e => {
            e.currentTarget.style.transform = 'scale(1)'
          }}
          onTouchStart={e => {
            e.currentTarget.style.transform = 'scale(0.92)'
          }}
          onTouchEnd={e => {
            e.currentTarget.style.transform = 'scale(1)'
          }}
        >
          <div className="relative flex items-center justify-center">
            <Mic size={24} strokeWidth={2.2} />
            {isVoiceOpen && (
              <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500" />
              </span>
            )}
          </div>
        </button>
      </div>

      {/* Right side: Recover & Band */}
      {rightItems.map(it => {
        const isActive = page === it.id
        return (
          <button
            key={it.id}
            onClick={() => onPage(it.id)}
            aria-label={it.label}
            aria-current={isActive ? 'page' : undefined}
            className="focus-ring flex flex-col items-center justify-center flex-1 gap-1"
            style={{
              border: 'none',
              background: 'none',
              cursor: 'pointer',
              padding: '6px 0',
              fontFamily: 'inherit',
              color: isActive ? 'var(--brand-primary)' : 'var(--ink-muted-48)',
              transform: isActive ? 'scale(1.05)' : 'scale(1)',
              transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
            }}
          >
            <div style={{ transform: isActive ? 'translateY(-1px)' : 'none', transition: 'transform 0.2s ease' }}>
              {it.icon}
            </div>
            <span
              className="text-[10px] font-semibold uppercase tracking-wider"
              style={{ fontWeight: isActive ? 700 : 500 }}
            >
              {it.label}
            </span>
          </button>
        )
      })}
    </nav>
  )
}

// ─── App Root (Apple Architecture) ────────────────────────────────────────────
export default function App() {
  const [page, setPage] = useState<Page>('dashboard')
  const [showVoice, setShowVoice] = useState(false)

  const pageOrder: Page[] = ['dashboard', 'load', 'recovery', 'band']
  const pageIcons: Record<Page, { icon: React.ReactNode; label: string }> = {
    dashboard: { icon: <Home className="size-full" strokeWidth={1.5} />, label: 'Dashboard' },
    load:      { icon: <Calendar className="size-full" strokeWidth={1.5} />, label: 'Schedule & Load' },
    recovery:  { icon: <Shield className="size-full" strokeWidth={1.5} />, label: 'Recovery' },
    band:      { icon: <Activity className="size-full" strokeWidth={1.5} />, label: 'Smart Band' },
  }

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
      <div className="flex h-full overflow-hidden bg-[#f5f5f7]">

        {/* Desktop Sidebar Navigation */}
        <div className="hide-mobile">
          <SidebarNavigation
            footer={
              <>
                <SidebarButton icon={<Settings className="size-full" strokeWidth={1.5} />} />
                <Avatar type="initial" initials="MC" size="medium" shape="circle" />
              </>
            }
          >
            {pageOrder.map(p => (
              <Tooltip key={p} content={pageIcons[p].label} position="right">
                <SidebarButton
                  icon={pageIcons[p].icon}
                  active={page === p}
                  onClick={() => setPage(p)}
                />
              </Tooltip>
            ))}
          </SidebarNavigation>
        </div>

        {/* Content Area + Right Assistant */}
        <div className="flex flex-1 overflow-hidden">
          <div className="flex-1 overflow-y-auto px-4 py-6 sm:px-8 sm:py-8" style={{ paddingBottom: 90 }}>
            <div key={page} className="page-section-enter min-h-full">
              {renderPage()}
            </div>
          </div>

          {/* Voice Panel — Desktop Column */}
          <div
            className="hide-mobile flex-col border-l border-[#e5e5ea] bg-white shadow-sm"
            style={{ width: 360, minWidth: 320, maxWidth: 400 }}
          >
            <VoiceAssistantPanel />
          </div>

          {/* Voice Panel — Mobile Expanding Bottom Sheet */}
          {showVoice && (
            <div
              className="show-mobile fixed inset-0 z-50 flex-col voice-backdrop"
              style={{ background: 'rgba(0, 0, 0, 0.4)' }}
              onClick={() => setShowVoice(false)}
            >
              <div
                className="absolute bottom-0 left-0 right-0 bg-white voice-sheet-expand shadow-2xl"
                style={{
                  height: '80vh',
                  borderRadius: '24px 24px 0 0',
                  boxShadow: '0 -10px 40px rgba(0, 0, 0, 0.15)',
                  overflow: 'hidden',
                }}
                onClick={e => e.stopPropagation()}
              >
                <div className="flex items-center justify-between px-6 py-4 border-b border-[#e5e5ea]">
                  <div className="flex items-center gap-2">
                    <Brain size={20} className="text-[#0066cc]" />
                    <span className="text-[17px] font-semibold headline-tight text-[#1d1d1f]">Oasis AI</span>
                  </div>
                  <button
                    onClick={() => setShowVoice(false)}
                    aria-label="Close Oasis AI"
                    className="w-8 h-8 rounded-full flex items-center justify-center text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
                  >
                    <X size={18} />
                  </button>
                </div>
                <div style={{ height: 'calc(80vh - 60px)' }}>
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
