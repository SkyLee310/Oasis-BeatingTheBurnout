import { useState } from 'react'
import { AlertTriangle, ChevronRight, Sparkles, X } from 'lucide-react'

import { SW, ZoneChip } from '../../ds'

// ─── Commitment impact sheet ──────────────────────────────────────────────────
export default function CommitmentCheck({ onClose }: { onClose: () => void }) {
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
