import { useEffect, useState } from 'react'
import { Activity, ArrowLeft, BatteryCharging, Clock, Heart, Moon, Zap } from 'lucide-react'

import {
  CircularGauge, OasisBlob, SW, SleepBars, Sparkline, ZoneChip,
  zoneAccent, zoneTile,
} from '../ds'
import type { ZoneKey } from '../ds'
import { useEnergy, useOasis } from '../state/store'
import { avgSleep } from '../logic/energy'

/** The band page shows the same five factors as everything else, so each one
 *  needs a face. Keyed off EnergyFactor.key — see src/logic/energy.ts. */
const FACTOR_ICON: Record<string, React.ReactNode> = {
  academic:      <Zap size={17} strokeWidth={SW} />,
  sleep:         <Moon size={17} strokeWidth={SW} />,
  density:       <Activity size={17} strokeWidth={SW} />,
  physiological: <Heart size={17} strokeWidth={SW} />,
  commute:       <Clock size={17} strokeWidth={SW} />,
}

const WEEKDAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

/** Nights the band would call short of the recovery baseline. */
const RECOVERY_BASELINE_HOURS = 6

// ─── Smart Band ───────────────────────────────────────────────────────────────
export default function SmartBandPage({ onBack }: { onBack: () => void }) {
  const state = useOasis()
  const { energy, factors } = useEnergy()
  const stress = 100 - energy

  const { restingHr, hrBaseline, sleepHours } = state.recovery
  const [connected, setConnected] = useState(true)

  // The band streams; the store holds the resting figure the whole app scores
  // against. Live drift is cosmetic and deliberately does not feed the score —
  // a number that moved every two seconds could not be reasoned about.
  const [hr, setHr] = useState(restingHr)
  const [hrHistory, setHrHistory] = useState(
    [-6, -3, 0, 2, -1, 0, 3, 0, -2, 2].map(d => restingHr + d),
  )

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
  const overBaseline = restingHr - hrBaseline

  const todayName = WEEKDAYS[(new Date(`${state.today}T12:00:00`).getDay() + 6) % 7]
  const sleepData = sleepHours.map((hours, i) => ({
    day: WEEKDAYS[i], hours, isToday: WEEKDAYS[i] === todayName,
  }))
  const nightAvg = avgSleep(state)
  const shortNights = sleepHours.filter(h => h < RECOVERY_BASELINE_HOURS).length
  const sleepFactor = factors.find(f => f.key === 'sleep')
  const sleepZone: ZoneKey = sleepFactor?.zone ?? 'green'

  return (
    <div className="flex flex-col gap-10 sm:gap-14 max-w-[1140px] mx-auto pb-4">
      {/* The band is not in the nav, so without this the only way out is to guess
          that Home is the way back. The other two off-nav pages both have one. */}
      <button className="chip focus-ring hit-44 self-start" onClick={onBack} style={{ minHeight: 34 }}>
        <ArrowLeft size={13} strokeWidth={SW} /> Back
      </button>

      {/* ── Device hero ─────────────────────────────────────────────────────── */}
      <header className="panel-ink p-6 sm:p-9 flex flex-col gap-7">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div className="flex flex-col gap-1.5">
            <span className="t-eyebrow" style={{ color: 'var(--highlight)' }}>Connected device</span>
            <div className="flex items-center gap-2.5">
              <h1 className="t-display" style={{ color: 'var(--on-ink)', fontSize: 'clamp(1.5rem,4vw,2rem)' }}>
                Xiaomi Smart Band 8 Pro
              </h1>
              <BatteryCharging size={19} strokeWidth={SW} style={{ color: 'var(--mint-deep)' }} />
            </div>
            <span className="t-micro" style={{ color: 'color-mix(in srgb, var(--on-ink) 65%, transparent)' }}>
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
              <span className="t-label" style={{ color: 'color-mix(in srgb, var(--on-ink) 65%, transparent)' }}>bpm</span>
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
            <span className="t-micro" style={{ color: 'color-mix(in srgb, var(--on-ink) 65%, transparent)', lineHeight: 1.5 }}>
              Resting {restingHr} bpm against your own {hrBaseline} bpm baseline — {overBaseline >= 0 ? `+${overBaseline}` : overBaseline} bpm,
              worth {Math.round(factors.find(f => f.key === "physiological")?.cost ?? 0)} points of today&apos;s stress score.
            </span>
          </div>
        </div>
      </header>

      {/* ── Sleep architecture ──────────────────────────────────────────────── */}
      <section className="card card-pop p-6 grid grid-cols-1 md:grid-cols-[auto_1fr] items-center gap-7 md:gap-10">
        <CircularGauge
          value={nightAvg} max={9} zone={sleepZone}
          label={nightAvg.toFixed(1)} sublabel="HRS" size={152}
        />
        <div className="flex flex-col gap-4">
          <div className="flex items-baseline justify-between gap-3 rule-b pb-3">
            <h2 className="t-title text-ink">Sleep architecture</h2>
            <ZoneChip zone={sleepZone} />
          </div>
          <SleepBars data={sleepData} height={96} />
          <p className="t-body max-w-[52ch]" style={{ color: 'var(--ink-2)' }}>
            {shortNights === 0
              ? `Every night this week cleared your ${RECOVERY_BASELINE_HOURS}-hour recovery baseline. Keep it there.`
              : `Below your ${RECOVERY_BASELINE_HOURS}-hour recovery baseline on ${shortNights} of the last ${sleepHours.length} nights. Each hour back toward 7.5 returns roughly ${Math.round((sleepFactor?.weight ?? 0) / 3.5)} points.`}
          </p>
        </div>
      </section>

      {/* ── Stress index breakdown ──────────────────────────────────────────── */}
      <section className="flex flex-col gap-5">
        <div className="flex flex-col gap-1.5">
          <span className="t-eyebrow">How we score it</span>
          <h2 className="t-display text-ink">The Oasis stress index</h2>
        </div>

        {/* The same five factors the dashboard gauge and the widget read. The
            percentage is the factor's share of the score; the bar is how much
            of that share this week has actually spent. */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {factors.map(f => (
            <div key={f.key} className={`tile ${zoneTile(f.zone)} card-pop`}>
              <div className="flex items-center justify-between gap-2">
                <span className="inline-flex items-center gap-2 t-eyebrow" style={{ color: 'var(--ink)' }}>
                  {FACTOR_ICON[f.key]} {f.label}
                </span>
                <span className="t-stat text-ink" style={{ fontSize: 18 }}>{f.weight}%</span>
              </div>
              <span className="t-stat text-ink" style={{ fontSize: 32 }}>{f.value}</span>
              <div className="track" style={{ height: 12 }}>
                <div
                  className="bar-fill"
                  style={{
                    height: '100%',
                    width: `${Math.min(100, Math.round(f.ratio * 100))}%`,
                    background: zoneAccent(f.zone),
                  }}
                />
              </div>
              <span className="t-micro" style={{ color: 'var(--ink-2)', lineHeight: 1.45 }}>
                {f.detail}. Cost {Math.round(f.cost)} of {f.weight}.
              </span>
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
            <span className="t-micro" style={{ color: 'var(--ink-2)' }}>
              Weighted across all {factors.length} signals — the inverse of your {energy} energy
            </span>
          </div>
          <span className="t-stat text-ink" style={{ fontSize: 48 }}>
            {stress}<span className="t-label" style={{ color: 'var(--ink-2)' }}> / 100</span>
          </span>
        </div>
      </section>
    </div>
  )
}
