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
  ChevronRight, Plus, X, Waves, Calendar, Clock,
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
  const [selectedDay, setSelectedDay] = useState<CalDay | null>(
    CALENDAR_WEEK.find(d => d.isToday) ?? null
  )
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
    <div className="flex flex-col gap-6 max-w-[1100px] mx-auto">

      {/* ── Welcome & Quote of the Day Card ─────────────────────────────────── */}
      <div className="apple-card p-5 sm:p-6 flex flex-col gap-4">
        {/* Top Header: Avatar + Single-Line Greeting */}
        <div className="flex items-center gap-3">
          <Avatar type="initial" initials="MC" size="medium" shape="circle" />
          <div className="flex flex-col min-w-0">
            <span className="text-[11px] font-semibold text-[#86868b] uppercase tracking-wider">
              Wednesday, 10 Sep 2026
            </span>
            <h1 className="text-[18px] sm:text-[24px] font-semibold headline-tight text-[#1d1d1f] truncate whitespace-nowrap">
              Good morning, Maya
            </h1>
          </div>
        </div>

        {/* Divider */}
        <div style={{ height: 1, background: 'var(--hairline)' }} />

        {/* Quote of the Day Section */}
        <div className="flex items-start gap-3 bg-[#fafafc] rounded-[14px] p-3.5 sm:p-4 border border-[var(--hairline)]">
          <div className="w-8 h-8 rounded-full bg-[#0066cc]/10 text-[#0066cc] flex items-center justify-center shrink-0 mt-0.5">
            <Quote size={15} />
          </div>
          <div className="flex flex-col flex-1 min-w-0 gap-1">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-[#0066cc]">
                Quote of the Day
              </span>
              <button
                onClick={handleNextQuote}
                className="text-[11px] text-[#86868b] hover:text-[#0066cc] transition-colors flex items-center gap-1.5 focus-ring px-2 py-0.5 rounded-full hover:bg-white"
                title="Next inspirational quote"
              >
                <RefreshCw size={11} className={isRotating ? 'animate-spin' : ''} />
                <span>Next Quote</span>
              </button>
            </div>
            <p className="text-[14px] sm:text-[15px] text-[#1d1d1f] italic font-normal leading-relaxed">
              "{currentQuote.quote}"
            </p>
            <span className="text-[12px] text-[#86868b] font-medium self-end">
              — {currentQuote.author}
            </span>
          </div>
        </div>
      </div>

      {/* ── Unified Biometric Telemetry Dashboard (Visual-First) ─────────── */}
      <div className="apple-card p-5 sm:p-6 flex flex-col gap-5">
        <div className="flex items-center justify-between flex-wrap gap-2 border-b border-[var(--hairline)] pb-3.5">
          <div className="flex items-center gap-2">
            <Activity size={18} className="text-[#0066cc]" />
            <span className="text-[17px] font-semibold headline-tight text-[#1d1d1f]">
              Biometric Telemetry
            </span>
          </div>
          <span className="text-[11px] font-semibold text-[#86868b] uppercase tracking-wider">
            Live Health Overview
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 divide-y md:divide-y-0 md:divide-x divide-[var(--hairline)]">
          {/* Metric 1: Energy Gauge Visual */}
          <div className="flex flex-col items-center justify-between gap-3 pt-2 md:pt-0">
            <div className="flex items-center gap-2">
              <Zap size={16} className="text-[#ff9500]" />
              <span className="text-[14px] font-semibold text-[#1d1d1f]">Energy Index</span>
            </div>
            <CircularGauge value={38} zone="amber" label="38" sublabel="/ 100" size={130} />
          </div>

          {/* Metric 2: Heart Rate Trend Visual */}
          <div className="flex flex-col justify-between gap-3 pt-4 md:pt-0 md:px-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Heart size={16} className="text-[#ff3b30]" />
                <span className="text-[14px] font-semibold text-[#1d1d1f]">Heart Rate</span>
              </div>
              <div className="flex items-baseline gap-1">
                <span className="text-[26px] font-semibold headline-tight text-[#1d1d1f]">78</span>
                <span className="text-[12px] text-[#86868b]">bpm</span>
              </div>
            </div>
            <div className="flex flex-col gap-1.5 mt-1">
              <div className="flex items-center justify-between text-[11px] text-[#86868b] font-medium">
                <span>Baseline: 72 bpm</span>
                <span className="text-[#ff9500] font-semibold">+6 bpm</span>
              </div>
              <Sparkline values={hrValues} color="#ff9500" height={58} />
            </div>
            <div className="flex justify-end">
              <ZoneChip zone="amber" size="sm" />
            </div>
          </div>

          {/* Metric 3: Sleep Distribution Visual */}
          <div className="flex flex-col justify-between gap-3 pt-4 md:pt-0 md:pl-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Moon size={16} className="text-[#0066cc]" />
                <span className="text-[14px] font-semibold text-[#1d1d1f]">Sleep Duration</span>
              </div>
              <div className="flex items-baseline gap-1">
                <span className="text-[26px] font-semibold headline-tight text-[#1d1d1f]">5.4</span>
                <span className="text-[12px] text-[#86868b]">hrs avg</span>
              </div>
            </div>
            <div className="flex flex-col gap-1.5 mt-1">
              <div className="flex items-center justify-between text-[11px] text-[#86868b] font-medium">
                <span>7-Day Pattern</span>
                <span className="text-[#ff3b30] font-semibold">Goal: 7.5h</span>
              </div>
              <SleepBars data={sleepData} height={66} />
            </div>
            <div className="flex justify-end">
              <ZoneChip zone="red" size="sm" />
            </div>
          </div>
        </div>
      </div>

      {/* ── Commitments & Pending Decisions ─────────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Upcoming Commitments */}
        <div className="apple-card p-6 flex flex-col gap-4 justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[17px] font-semibold headline-tight text-[#1d1d1f]">Upcoming Deadlines</span>
            <Badge label={`${upcoming.length} Pending`} variant="warning" />
          </div>
          <div className="flex flex-col gap-2.5">
            {upcoming.map((ev, i) => {
              const s = KIND_STYLE[ev.kind]
              return (
                <div key={i} className="flex items-start gap-3 rounded-[12px] p-3.5" style={{ background: s.bg }}>
                  <div style={{ width: 8, height: 8, borderRadius: 999, background: s.dot, flexShrink: 0, marginTop: 4 }} />
                  <div className="flex flex-col gap-0.5 flex-1">
                    <span className="text-[14px] font-semibold" style={{ color: s.text }}>{ev.title}</span>
                    <span className="text-[12px]" style={{ color: s.text, opacity: 0.85 }}>{ev.day} {ev.date} Sep · {ev.time}</span>
                  </div>
                  {ev.energy !== undefined && (
                    <span className="text-[12px] font-semibold" style={{ color: s.text }}>{ev.energy} pts</span>
                  )}
                </div>
              )
            })}
          </div>
          <button className="apple-btn-secondary self-start" onClick={onGoLoad}>
            View Schedule & Load <ChevronRight size={14} />
          </button>
        </div>

        {/* Decision Pending Card */}
        <div className="apple-card p-6 flex flex-col gap-4 justify-between" style={{ background: 'linear-gradient(180deg, #fffdfa 0%, #ffffff 100%)', borderColor: '#ff9500]/30' }}>
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-full bg-[#fef4e5] flex items-center justify-center shrink-0">
              <AlertTriangle size={18} className="text-[#ff9500]" />
            </div>
            <div className="flex flex-col">
              <span className="text-[12px] font-semibold uppercase tracking-wider text-[#b25e02]">Decision Pending</span>
              <span className="text-[18px] font-semibold headline-tight text-[#1d1d1f]">Part-time Retail Offer</span>
            </div>
          </div>

          <div className="flex flex-col gap-2">
            {[
              { label: '12 hrs / week workload', icon: <Clock size={16} /> },
              { label: 'Tue · Thu · Sat distribution', icon: <Calendar size={16} /> },
              { label: 'High crash risk for 15 Sep week', icon: <AlertTriangle size={16} /> },
            ].map(r => (
              <div key={r.label} className="flex items-center gap-2.5 text-[14px] text-[#1d1d1f]">
                <span className="text-[#ff9500] flex">{r.icon}</span>
                <span>{r.label}</span>
              </div>
            ))}
          </div>

          <p className="text-[13px] text-[#7a7a7a] leading-relaxed">
            Accepting this shift pushes your recovery score from 38 down to 22 when DS A2 and LinAlg mid-terms overlap.
          </p>

          <div className="flex gap-3 flex-wrap">
            <button className="apple-btn-primary" onClick={() => setShowCommit(true)}>
              <TrendingUp size={15} /> Run Impact Check
            </button>
            <button className="apple-btn-secondary" onClick={onGoRecovery}>
              Recovery Plan
            </button>
          </div>

          {showCommit && (
            <CommitmentCheck onClose={() => setShowCommit(false)} />
          )}
        </div>
      </div>
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

  return (
    <div className="flex flex-col gap-6 max-w-[1100px] mx-auto">
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div className="flex flex-col gap-1">
          <h1 className="text-[28px] sm:text-[36px] font-semibold headline-tight text-[#1d1d1f]">
            Smart Band
          </h1>
          <p className="text-[15px] text-[#7a7a7a]">
            Continuous real-time biometric telemetry and burnout prediction
          </p>
        </div>
        <Badge label={connected ? 'Connected · Live' : 'Disconnected'} variant={connected ? 'success' : 'default'} />
      </div>

      {/* Device Connection Showcase */}
      <div className="apple-card p-6 flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-[#f5f5f7] flex items-center justify-center text-[#0066cc]">
            <Waves size={24} />
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <span className="text-[17px] font-semibold headline-tight text-[#1d1d1f]">Xiaomi Smart Band 8 Pro</span>
              <BatteryCharging size={16} className="text-[#34c759]" />
            </div>
            <span className="text-[13px] text-[#86868b]">
              {connected ? 'Syncing live telemetry every 2s' : 'Last synchronized: Today, 08:14'}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setConnected(c => !c)}
            role="switch"
            aria-checked={connected}
            aria-label="Toggle band connection"
            className="focus-ring relative w-12 h-7 rounded-full transition-colors duration-200"
            style={{
              background: connected ? 'var(--brand-primary)' : '#e5e5ea',
              border: 'none', cursor: 'pointer',
            }}
          >
            <div
              className="absolute top-1 w-5 h-5 rounded-full bg-white transition-transform duration-200 shadow-sm"
              style={{ transform: connected ? 'translateX(24px)' : 'translateX(4px)' }}
            />
          </button>
        </div>
      </div>

      {/* Biometric Rings Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Real-time HR */}
        <div className="apple-card p-6 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <span className="text-[17px] font-semibold headline-tight text-[#1d1d1f]">Heart Rate Monitoring</span>
            {connected && <span className="inline-flex items-center gap-1.5 text-[12px] font-bold text-[#ff3b30] bg-[#fde8e8] px-2.5 py-1 rounded-full"><span className="w-2 h-2 rounded-full bg-[#ff3b30] animate-ping" /> LIVE</span>}
          </div>
          <div className="flex items-end gap-6 flex-wrap">
            <CircularGauge value={hr} max={120} zone={hrZone} label={String(hr)} sublabel="bpm" size={130} />
            <div className="flex flex-col gap-2 flex-1 min-w-[140px]">
              <span className="text-[12px] text-[#86868b] uppercase tracking-wider font-semibold">Live Trend</span>
              <Sparkline values={hrHistory} color="#ff3b30" height={64} />
            </div>
          </div>
          <div className="p-3.5 rounded-[12px] bg-[#f5f5f7]">
            <span className="text-[13px] text-[#7a7a7a]">
              Elevated 6 bpm over your resting baseline (72 bpm). Contributes +4 points to current stress score.
            </span>
          </div>
        </div>

        {/* Sleep Breakdown */}
        <div className="apple-card p-6 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <span className="text-[17px] font-semibold headline-tight text-[#1d1d1f]">Sleep Architecture</span>
            <ZoneChip zone="red" />
          </div>
          <div className="flex items-end gap-6 flex-wrap">
            <CircularGauge value={5.4} max={9} zone="red" label="5.4" sublabel="hrs" size={130} />
            <div className="flex flex-col gap-2 flex-1 min-w-[140px]">
              <span className="text-[12px] text-[#86868b] uppercase tracking-wider font-semibold">Daily Durations</span>
              <SleepBars data={sleepData} height={80} />
            </div>
          </div>
          <div className="p-3.5 rounded-[12px] bg-[#f5f5f7]">
            <span className="text-[13px] text-[#7a7a7a]">
              Below 6h recovery baseline for 4 nights. Recommend targeting 7.5h before Thursday.
            </span>
          </div>
        </div>
      </div>

      {/* Stress Formula Breakdown */}
      <div className="apple-card p-6 flex flex-col gap-5">
        <span className="text-[18px] font-semibold headline-tight text-[#1d1d1f]">Oasis Stress Index Formula</span>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { label: 'Autonomic HR', value: '78 bpm', weight: '40%', icon: <Heart size={18} />, zone: 'amber' as ZoneKey },
            { label: 'Sleep Quality', value: '5.4 hrs', weight: '35%', icon: <Moon size={18} />, zone: 'red' as ZoneKey },
            { label: 'Calendar Density', value: '89%', weight: '25%', icon: <Activity size={18} />, zone: 'red' as ZoneKey },
          ].map(f => (
            <div key={f.label} className="rounded-[14px] p-4 bg-[#f5f5f7] flex flex-col gap-2.5">
              <div className="flex items-center gap-2 text-[#7a7a7a]">
                {f.icon}
                <span className="text-[13px] font-medium">{f.label}</span>
              </div>
              <span className="text-[20px] font-semibold headline-tight text-[#1d1d1f]">{f.value}</span>
              <div className="flex items-center justify-between">
                <span className="text-[12px] text-[#86868b]">{f.weight} model weight</span>
                <ZoneChip zone={f.zone} />
              </div>
            </div>
          ))}
        </div>
        <div className="flex items-center justify-between p-4 rounded-[14px] bg-[#fde8e8]">
          <span className="text-[15px] font-semibold text-[#d70015]">Calculated Stress Score</span>
          <span className="text-[28px] font-semibold headline-tight text-[#d70015]">62 / 100</span>
        </div>
      </div>
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
      <div className="flex flex-col gap-1">
        <h1 className="text-[28px] sm:text-[36px] font-semibold headline-tight text-[#1d1d1f]">
          Schedule & Load
        </h1>
        <p className="text-[15px] text-[#7a7a7a]">
          Weekly calendar timeline, workload breakdown, and smart commitment management
        </p>
      </div>

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
              <div className="flex flex-col gap-4 pt-4">
                {categories.map(c => (
                  <div key={c.label} className="apple-card p-5 flex flex-col gap-3">
                    <LoadBar label={c.label} pct={c.pct} zone={c.zone} />
                    <p className="text-[13px] text-[#7a7a7a]">{c.detail}</p>
                  </div>
                ))}
                <div className="rounded-[14px] p-4 flex gap-3 bg-[#fde8e8] border-l-4 border-[#ff3b30]">
                  <AlertTriangle size={20} className="text-[#ff3b30] shrink-0 mt-0.5" />
                  <p className="text-[14px] text-[#d70015]">
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
    <div className="flex flex-col gap-6 max-w-[1100px] mx-auto">
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div className="flex flex-col gap-1">
          <h1 className="text-[28px] sm:text-[36px] font-semibold headline-tight text-[#1d1d1f]">
            Recovery Plan
          </h1>
          <p className="text-[15px] text-[#7a7a7a]">
            Target threshold: restore live energy above 45 pts to exit fatigue zone
          </p>
        </div>
        <ZoneChip zone={currentZone} size="lg" />
      </div>

      {/* Live Recovery Metric */}
      <div className="apple-card p-6 flex items-center justify-between flex-wrap gap-6">
        <div className="flex items-center gap-6 flex-wrap">
          <CircularGauge value={energy} zone={currentZone} label={String(energy)} sublabel="/ 100" size={136} />
          <div className="flex flex-col gap-1.5 max-w-sm">
            <span className="text-[17px] font-semibold headline-tight text-[#1d1d1f]">Live Energy Rebound</span>
            <p className="text-[13px] text-[#7a7a7a] leading-relaxed">
              Check off your daily restorative actions below to track your autonomic recovery in real-time.
            </p>
            {energy >= 45 && (
              <div className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-[#1b8a3e] bg-[#eaf8ee] px-3 py-1 rounded-full mt-1">
                <CheckCircle size={15} /> Exit condition fulfilled — returned to stable zone.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Daily Restoration Check-ins */}
      {days.map(d => (
        <div key={d.date} className="flex flex-col gap-3">
          <span className="text-[12px] font-semibold uppercase tracking-wider text-[#86868b] px-1">
            {d.date}
          </span>
          <div className="flex flex-col gap-2.5">
            {d.items.map(item => {
              const done = ticked[item.id]
              return (
                <button
                  key={item.id}
                  onClick={() => setTicked(p => ({ ...p, [item.id]: !p[item.id] }))}
                  role="checkbox"
                  aria-checked={!!done}
                  className="apple-card p-4 flex items-center gap-3.5 text-left transition-all duration-200"
                  style={{
                    background: done ? '#eaf8ee' : 'var(--canvas-white)',
                    borderColor: done ? 'rgba(52, 199, 89, 0.4)' : 'var(--hairline)',
                    cursor: 'pointer',
                  }}
                >
                  <div style={{
                    width: 24, height: 24, borderRadius: 999, flexShrink: 0,
                    background: done ? '#34c759' : 'transparent',
                    border: `1.5px solid ${done ? '#34c759' : 'var(--hairline)'}`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
                  }}>
                    {done && <Check size={14} className="text-white tick-in stroke-[2.5]" />}
                  </div>
                  <span className="text-[15px] font-medium flex-1" style={{ color: done ? '#1b8a3e' : '#1d1d1f' }}>
                    {item.label}
                  </span>
                  <span className="text-[13px] font-semibold" style={{ color: done ? '#1b8a3e' : '#86868b' }}>
                    {item.gain} pts
                  </span>
                </button>
              )
            })}
          </div>
        </div>
      ))}

      {/* Communication Assistant Card */}
      <div className="apple-card p-6 flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles size={18} className="text-[#0066cc]" />
            <span className="text-[17px] font-semibold headline-tight text-[#1d1d1f]">
              Communication Assist: Decline Template
            </span>
          </div>
          <button className="apple-btn-secondary py-1 px-3 text-[13px]" onClick={() => setShowComm(p => !p)}>
            {showComm ? 'Hide' : 'Expand'}
          </button>
        </div>

        {showComm && (
          <div className="p-4 rounded-[14px] bg-[#f5f5f7] flex flex-col gap-3">
            <p className="text-[14px] text-[#1d1d1f] italic leading-relaxed">
              "Hi team, thank you for considering me for this opportunity. After reviewing my academic milestones and project commitments for this semester, I won't be able to take on extra shifts right now to maintain high quality deliverables."
            </p>
            <button className="apple-btn-primary self-start text-[13px] py-1.5 px-3.5" onClick={copyTemplate}>
              {copied ? <><Check size={14} /> Copied</> : <><Copy size={14} /> Copy to Clipboard</>}
            </button>
          </div>
        )}
      </div>
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
