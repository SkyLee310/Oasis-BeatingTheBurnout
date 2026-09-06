import { ArrowLeft, EyeOff, Shield, Sigma } from 'lucide-react'

import { LoadBar, SW, Tag, ZONE_LABEL, ZoneChip } from '../ds'
import { ZONE_AMBER_AT, ZONE_GREEN_AT, energyFactors } from '../logic/energy'
import { useEnergy, useOasis } from '../state/store'

// ─── Where the numbers come from ──────────────────────────────────────────────
// A wellness app that shows a score without showing its working is asking to be
// trusted for no reason. This page is the whole formula, with the reader's own
// values already in it — the same energyFactors() array every other screen
// reads, so there is no second, prettier version of the maths written anywhere.

export default function HowItWorksPage({ onBack }: { onBack: () => void }) {
  const state = useOasis()
  const { energy, zone } = useEnergy()
  const factors = energyFactors(state)

  return (
    <div className="flex flex-col gap-6 max-w-[860px]">
      <header className="flex flex-col gap-3">
        <button className="chip focus-ring self-start" onClick={onBack} style={{ minHeight: 34 }}>
          <ArrowLeft size={13} strokeWidth={SW} /> Back
        </button>
        <Tag tone="yellow">HOW IT WORKS</Tag>
        <h1 className="t-hero text-ink">Where the<br />numbers come from</h1>
        <p className="t-body max-w-[58ch]" style={{ color: 'var(--ink-2)' }}>
          Your energy starts at 100 and five things take points off it. Nothing is
          weighted secretly and nothing is guessed at — every figure below is one
          you can check against your own week.
        </p>
      </header>

      {/* ── The sum, with the reader's own values ─────────────────────────── */}
      <section className="card p-5 flex flex-col gap-5">
        <div className="flex items-baseline justify-between gap-3 rule-b pb-3">
          <span className="t-sub text-ink">
            <Sigma size={17} strokeWidth={SW} className="inline mr-2" />
            Your week, right now
          </span>
          <div className="flex items-center gap-3">
            <span className="t-stat text-ink" style={{ fontSize: 26 }}>{energy}</span>
            <ZoneChip zone={zone} />
          </div>
        </div>

        <div className="flex flex-col gap-5">
          {factors.map(f => (
            <div key={f.key} className="flex flex-col gap-2">
              <div className="flex items-baseline justify-between gap-3 flex-wrap">
                <span className="t-label text-ink">{f.label}</span>
                <span className="t-micro" style={{ color: 'var(--ink-muted)' }}>
                  {f.value} · worth up to {f.weight} pts · took {Math.round(f.cost)}
                </span>
              </div>
              <LoadBar label={`${f.label} load`} pct={Math.round(f.ratio * 100)} zone={f.zone} />
              <span className="t-micro" style={{ color: 'var(--ink-2)', lineHeight: 1.55 }}>
                {f.detail}
              </span>
            </div>
          ))}
        </div>

        <div
          className="flex flex-col gap-1 p-4"
          style={{ background: 'var(--surface-2)', border: '2px solid var(--ink)', borderRadius: 'var(--r-md)' }}
        >
          <span className="t-label text-ink">
            100 − {factors.map(f => Math.round(f.cost)).join(' − ')} = {energy}
          </span>
          <span className="t-micro" style={{ color: 'var(--ink-2)', lineHeight: 1.5 }}>
            The five weights add up to 100, so a completely overloaded week lands
            at zero and a completely clear one at 100. Rounding is the only
            reason the line above may be a point out.
          </span>
        </div>
      </section>

      {/* ── The three zones ───────────────────────────────────────────────── */}
      <section className="card p-5 flex flex-col gap-4">
        <span className="t-sub text-ink">What the three zones mean</span>
        <div className="flex flex-col gap-3">
          {[
            { zone: 'green' as const, range: `${ZONE_GREEN_AT} and above`, meaning: 'There is room. A yes here costs you something you can afford.' },
            { zone: 'amber' as const, range: `${ZONE_AMBER_AT} to ${ZONE_GREEN_AT - 1}`, meaning: 'The week is full. Anything new should replace something, not join it.' },
            { zone: 'red' as const, range: `below ${ZONE_AMBER_AT}`, meaning: 'You are past what the week holds. The next request is the one to decline.' },
          ].map(z => (
            <div key={z.zone} className="flex items-start gap-3">
              <span className="shrink-0" style={{ minWidth: 96 }}>
                <ZoneChip zone={z.zone} />
              </span>
              <div className="flex flex-col gap-0.5 flex-1 min-w-0">
                <span className="t-label text-ink">{ZONE_LABEL[z.zone]} · {z.range}</span>
                <span className="t-micro" style={{ color: 'var(--ink-2)', lineHeight: 1.5 }}>{z.meaning}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Measured vs estimated ─────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <section className="card p-5 flex flex-col gap-3">
          <span className="t-sub text-ink">Measured</span>
          <ul className="flex flex-col gap-2">
            {[
              'Sleep hours and resting heart rate, from your band',
              'Classes, deadlines and shifts you or your timetable put in',
              'Task weights on the group project',
              'The minutes you told us your commute takes',
            ].map(item => (
              <li key={item} className="t-micro flex items-start gap-2" style={{ color: 'var(--ink-2)', lineHeight: 1.5 }}>
                <span style={{ color: 'var(--ink)' }}>·</span>{item}
              </li>
            ))}
          </ul>
        </section>

        <section className="card p-5 flex flex-col gap-3">
          <span className="t-sub text-ink">Estimated</span>
          <ul className="flex flex-col gap-2">
            {[
              'Hours of effort per commitment, until you correct them',
              'How much a request will actually take, read from the chat',
              'Which days you travel — inferred from where your classes are',
            ].map(item => (
              <li key={item} className="t-micro flex items-start gap-2" style={{ color: 'var(--ink-2)', lineHeight: 1.5 }}>
                <span style={{ color: 'var(--ink)' }}>·</span>{item}
              </li>
            ))}
          </ul>
          <span className="t-micro" style={{ color: 'var(--ink-muted)', lineHeight: 1.5 }}>
            Estimates are editable everywhere they appear. Oasis would rather be
            corrected than believed.
          </span>
        </section>
      </div>

      {/* ── What it does not do ───────────────────────────────────────────── */}
      <section
        className="flex flex-col gap-3 p-5"
        style={{ background: 'var(--mint)', border: '2px solid var(--ink)', borderRadius: 'var(--r-lg)' }}
      >
        <span className="t-sub text-ink">
          <EyeOff size={17} strokeWidth={SW} className="inline mr-2" />
          What Oasis never does
        </span>
        <ul className="flex flex-col gap-2">
          {[
            'It does not read your chats in the background. You paste in the one you want checked, and nothing else is seen.',
            'It does not send your data anywhere. The whole week lives in this browser — there is no account and no server to hold it.',
            'It does not show your energy score to your group. Teammates see the project split and nothing else.',
            'It does not diagnose you. It counts hours and sleep; it is not a clinical tool, and it will not tell you what is wrong with you.',
          ].map(line => (
            <li key={line} className="t-micro flex items-start gap-2" style={{ color: 'var(--ink)', lineHeight: 1.55 }}>
              <Shield size={14} strokeWidth={SW} className="shrink-0 mt-0.5" />
              {line}
            </li>
          ))}
        </ul>
      </section>
    </div>
  )
}
