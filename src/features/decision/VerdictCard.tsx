import { useState } from 'react'
import { AlertTriangle, CalendarClock, ChevronDown, Clock, User } from 'lucide-react'

import { CircularGauge, SW, Tag, ZONE_LABEL, ZoneChip } from '../../ds'
import type { Verdict } from '../../logic/decision'
import { DECISION_THRESHOLDS, decisionHeadline, decisionLead } from '../../logic/decision'
import type { IncomingRequest } from '../../state/types'
import { shortDate } from '../../logic/dates'

// ─── Verdict ──────────────────────────────────────────────────────────────────
// The answer, and — one tap away — every number that produced it. The reasons
// list is not a summary of the logic, it *is* the logic: src/logic/decision.ts
// writes each sentence next to the points it cost, so nothing here can drift
// out of step with the score.

export default function VerdictCard({ req, v }: { req: IncomingRequest; v: Verdict }) {
  const [showWhy, setShowWhy] = useState(false)
  const [head, tail] = decisionHeadline(v.decision)
  const { parsed } = req

  return (
    <div className="flex flex-col gap-6">
      {/* ── What was asked ──────────────────────────────────────────────────── */}
      <div className="flex flex-col gap-3">
        <Tag tone="yellow">WHAT OASIS READ</Tag>
        <h3 className="t-title text-ink">{parsed.title}</h3>
        <div className="flex flex-wrap gap-2">
          <span className="chip"><User size={13} strokeWidth={SW} /> {parsed.asker}</span>
          <span className="chip"><Clock size={13} strokeWidth={SW} /> {parsed.hoursPerWeek} hrs/week</span>
          {parsed.deadline && (
            <span className="chip">
              <CalendarClock size={13} strokeWidth={SW} /> Lands {shortDate(parsed.deadline)}
            </span>
          )}
          {parsed.urgent && <span className="chip chip-selected">Wants an answer now</span>}
        </div>
      </div>

      {/* ── The reading ─────────────────────────────────────────────────────── */}
      <div
        className="grid grid-cols-1 sm:grid-cols-[auto_1fr] items-center gap-6"
        aria-live="polite"
      >
        <div className="flex items-center justify-center gap-3">
          <div className="flex flex-col items-center gap-1">
            <span className="t-eyebrow" style={{ color: 'var(--ink-muted)' }}>NOW</span>
            <span className="t-stat text-ink" style={{ fontSize: 34 }}>{v.before}</span>
          </div>
          <CircularGauge
            value={v.after} zone={v.zone}
            label={String(v.after)} sublabel="IF YOU SAY YES" size={140}
          />
        </div>

        <div className="flex flex-col gap-3">
          <h2 className="t-hero text-ink" style={{ fontSize: 'clamp(28px, 6vw, 40px)' }}>
            {head}<br />{tail}
          </h2>
          <p className="t-body max-w-[42ch]" style={{ color: 'var(--ink-2)' }}>
            {decisionLead(v.decision)}
          </p>
          <div className="flex items-center gap-2 flex-wrap">
            <ZoneChip zone={v.zone} />
            <span className="t-micro" style={{ color: 'var(--ink-muted)' }}>
              {ZONE_LABEL[v.zone]} · margin {v.margin} of 100
            </span>
          </div>
        </div>
      </div>

      {/* ── Collisions ──────────────────────────────────────────────────────── */}
      {v.collisions.length > 0 && (
        <div
          className="flex gap-3 p-4"
          style={{ background: 'var(--blush)', border: '2px solid var(--ink)', borderRadius: 'var(--r-md)' }}
        >
          <AlertTriangle size={20} strokeWidth={SW} className="shrink-0 mt-0.5" style={{ color: 'var(--ink)' }} />
          <div className="flex flex-col gap-1">
            <span className="t-label text-ink">
              {v.collisions.length === 1 ? 'It lands on something' : `It lands on ${v.collisions.length} things`}
            </span>
            {v.collisions.map(c => (
              <span key={c.id} className="t-micro" style={{ color: 'var(--ink)' }}>
                {c.title} · {shortDate(c.date)} · {c.hours} hrs
              </span>
            ))}
          </div>
        </div>
      )}

      {/* ── Why ─────────────────────────────────────────────────────────────── */}
      <div className="flex flex-col gap-3">
        <button
          className="btn btn-secondary focus-ring self-start"
          onClick={() => setShowWhy(w => !w)}
          aria-expanded={showWhy}
          aria-controls="why-verdict"
        >
          Why this verdict
          <ChevronDown
            size={15} strokeWidth={SW}
            style={{ transform: showWhy ? 'rotate(180deg)' : 'none', transition: 'transform 200ms var(--ease)' }}
          />
        </button>

        {showWhy && (
          <div id="why-verdict" className="flex flex-col gap-2">
            {v.reasons.map((r, i) => (
              <div
                key={i}
                className="flex items-start justify-between gap-3 p-3"
                style={{
                  background: 'var(--surface-2)',
                  border: '2px solid var(--ink)',
                  borderRadius: 'var(--r-sm)',
                }}
              >
                <span className="t-micro" style={{ color: 'var(--ink)', lineHeight: 1.5 }}>{r.text}</span>
                {r.cost > 0 && (
                  <span className="t-micro shrink-0" style={{ color: 'var(--ink)', fontWeight: 700 }}>
                    −{r.cost}
                  </span>
                )}
              </div>
            ))}
            <p className="t-micro" style={{ color: 'var(--ink-muted)', lineHeight: 1.5 }}>
              Under {DECISION_THRESHOLDS.decline} Oasis says no; under{' '}
              {DECISION_THRESHOLDS.negotiate} it says take part of it. Nothing here left
              your phone.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
