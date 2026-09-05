import { useState } from 'react'
import { Check, CheckCircle, Copy, Shield, Sparkles } from 'lucide-react'

import { CircularGauge, OasisBlob, SW, Tag, ZONE_LABEL } from '../ds'
import { useEnergy, useOasis } from '../state/store'
import { ZONE_GREEN_AT, zoneFor } from '../logic/energy'
import { addDays, planDate } from '../logic/dates'
import { lowerFirst } from '../logic/text'

/** Each action names the energy factor it repays, so the plan is legible as a
 *  response to this week rather than generic wellness advice. `gain` is what
 *  the action is worth in energy points if it lands. */
const ACTIONS: { id: string; label: string; gain: number; factor: string }[] = [
  { id: 'a1', label: 'Sleep before midnight tonight', gain: 8, factor: 'sleep' },
  { id: 'a2', label: '20-minute restorative outdoor walk', gain: 6, factor: 'physiological' },
  { id: 'a3', label: 'Decline one non-essential meeting', gain: 4, factor: 'density' },
  { id: 'b1', label: 'A 45-minute digital detox block', gain: 8, factor: 'physiological' },
  { id: 'b2', label: 'Batch two campus trips into one day', gain: 6, factor: 'commute' },
  { id: 'b3', label: 'Keep one evening buffer free', gain: 4, factor: 'academic' },
]

// ─── Recovery ─────────────────────────────────────────────────────────────────
export default function RecoveryPage() {
  const state = useOasis()
  const { energy, zone, factors } = useEnergy()

  const [ticked, setTicked] = useState<Record<string, boolean>>({})
  const [showComm, setShowComm] = useState(false)
  const [copied, setCopied] = useState(false)

  // Recovery is projected, not banked: this is what the week would read if
  // every ticked action landed. The store keeps holding the real figure until
  // the sleep and heart-rate data actually move.
  const gained = ACTIONS.filter(a => ticked[a.id]).reduce((sum, a) => sum + a.gain, 0)
  const projected = Math.min(100, energy + gained)
  const projectedZone = zoneFor(projected)
  const toGreen = Math.max(0, ZONE_GREEN_AT - energy)

  // Heaviest factor first, so the actions that repay the most sit at the top.
  const rank = new Map(
    [...factors].sort((a, b) => b.cost - a.cost).map((f, i) => [f.key, i]),
  )
  const ordered = [...ACTIONS].sort(
    (a, b) => (rank.get(a.factor) ?? 99) - (rank.get(b.factor) ?? 99),
  )
  const label = (key: string) => factors.find(f => f.key === key)?.label ?? key

  const days = [
    { date: addDays(state.today, 1), variant: 'mint', items: ordered.slice(0, 3) },
    { date: addDays(state.today, 2), variant: 'sky', items: ordered.slice(3) },
  ]

  // The pending ask is what a script is actually for. Falls back to a generic
  // wording when nothing is waiting on an answer.
  const pending = state.requests.find(r => r.status === 'pending')
  const script = pending
    ? `Hi ${pending.parsed.asker}, thanks for thinking of me for ${lowerFirst(pending.parsed.title)}. I have ${state.commitments.filter(c => c.date >= state.today && c.hours > 0).length} pieces of work due this week and I am already at ${energy} out of 100 on my own load tracker, so I can't take this on and do it properly. Happy to help once this week's deadlines clear.`
    : `Hi, thank you for thinking of me. Looking at my deadlines this semester I can't take this on right now without dropping the quality of what I have already committed to. Please do ask me again next month.`

  const copyTemplate = () => {
    navigator.clipboard?.writeText(script).catch(() => {})
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="flex flex-col gap-10 sm:gap-14 max-w-[880px] mx-auto pb-4">

      {/* ── Hero ────────────────────────────────────────────────────────────── */}
      <header className="flex flex-col items-center text-center gap-6 pt-2">
        <Tag tone="yellow"><Shield size={13} strokeWidth={SW} /> RECOVERY PLAN</Tag>
        <div className="flex items-center justify-center gap-2 sm:gap-6">
          <OasisBlob zone={projectedZone} size={118} />
          <CircularGauge
            value={projected} zone={projectedZone}
            label={String(projected)} sublabel="/ 100" size={180}
          />
        </div>
        <h1 className="t-display text-ink max-w-[20ch]">
          {toGreen === 0
            ? 'You are already clear. Keep it there.'
            : `${toGreen} points back gets you out of the fatigue zone.`}
        </h1>
        <p className="t-body max-w-[46ch]" style={{ color: 'var(--ink-2)' }}>
          You are on {energy} right now, {ZONE_LABEL[zone].toLowerCase()}. Each action below is
          worth what it says — tick them to see where the week lands, no single big fix required.
        </p>
        {projected >= ZONE_GREEN_AT && (
          <Tag tone="green">
            <CheckCircle size={13} strokeWidth={SW} /> THAT PLAN CLEARS THE FATIGUE ZONE
          </Tag>
        )}
      </header>

      {/* ── Checklists ──────────────────────────────────────────────────────── */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {days.map(d => (
          <div key={d.date} className={`tile tile-${d.variant} card-pop`} style={{ padding: 20, gap: 12 }}>
            <span className="t-eyebrow" style={{ color: 'var(--ink)' }}>{planDate(d.date)}</span>

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
                    <span className="flex flex-col flex-1 gap-0.5 text-left">
                      <span className="t-label" style={{ color: "var(--ink)" }}>{item.label}</span>
                      <span className="t-micro" style={{ color: "var(--ink-2)" }}>Repays {label(item.factor).toLowerCase()}</span>
                    </span>
                    <span className="t-stat" style={{ fontSize: 14, color: 'var(--ink)' }}>+{item.gain}</span>
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
              &ldquo;{script}&rdquo;
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
