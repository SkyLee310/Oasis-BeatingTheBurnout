import { useState } from 'react'
import { Check, CheckCircle, Copy, Shield, Sparkles } from 'lucide-react'

import { CircularGauge, OasisBlob, SW, Tag } from '../ds'
import type { ZoneKey } from '../ds'

// ─── Recovery ─────────────────────────────────────────────────────────────────
export default function RecoveryPage() {
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
