import { useEffect, useState } from 'react'
import { Activity, BatteryCharging, Calendar, Heart, Moon } from 'lucide-react'

import {
  CircularGauge, OasisBlob, SW, SleepBars, Sparkline, ZoneChip,
  zoneAccent, zoneTile,
} from '../ds'
import type { ZoneKey } from '../ds'

// ─── Smart Band ───────────────────────────────────────────────────────────────
export default function SmartBandPage() {
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
