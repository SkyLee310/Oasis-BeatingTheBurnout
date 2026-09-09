import { ArrowLeft, EyeOff, Inbox, Shield, Sigma } from 'lucide-react'

import { LoadBar, SW, Tag, ZONE_LABEL, ZoneChip } from '../ds'
import { DECISION_PENALTIES, DECISION_THRESHOLDS, toneLabel } from '../logic/decision'
import { ZONE_AMBER_AT, ZONE_GREEN_AT, energyFactors } from '../logic/energy'
import { useEnergy, useOasis } from '../state/store'

/**
 * The four things that make the same hours land harder, in the order
 * analyzeRequest() tests them. The wording is deliberately close to the
 * sentences the verdict itself prints, so a student who read one recognises
 * the other — and the point costs are read from the engine, never retyped.
 */
const PENALTIES: { cost: number; label: string; detail: string }[] = [
  {
    cost: DECISION_PENALTIES.collision,
    label: 'It lands on a day that is already spoken for',
    detail: 'Counted once per clash, and a deadline the day after counts too — you are working the night before either way.',
  },
  {
    cost: DECISION_PENALTIES.urgency,
    label: 'They want an answer immediately',
    detail: 'An ask you cannot plan around costs more than the same ask with a week of warning.',
  },
  {
    cost: DECISION_PENALTIES.sleepDebt,
    label: 'You are under six hours of sleep a night',
    detail: 'A week already short on sleep has nothing left to absorb an extra commitment with.',
  },
  {
    cost: DECISION_PENALTIES.strain,
    label: 'Your resting heart rate is well over your own baseline',
    detail: 'Measured against your baseline, not a population average — the bar is you, last month.',
  },
]

/** Below the first figure Oasis says no; below the second, "not like this". */
const LADDER: { tone: 'decline' | 'negotiate' | 'accept'; range: string; meaning: string }[] = [
  {
    tone: 'decline',
    range: `below ${DECISION_THRESHOLDS.decline}`,
    meaning: 'Every version of yes costs more than the week can give back. Oasis writes the no; you send it.',
  },
  {
    tone: 'negotiate',
    range: `${DECISION_THRESHOLDS.decline} to ${DECISION_THRESHOLDS.negotiate - 1}`,
    meaning: 'Half of it fits even though all of it does not, so the reply offers half rather than refusing.',
  },
  {
    tone: 'accept',
    range: `${DECISION_THRESHOLDS.negotiate} and above`,
    meaning: 'There is room. Saying yes here costs something you can afford to spend.',
  },
]

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
        <button className="chip focus-ring hit-44 self-start" onClick={onBack} style={{ minHeight: 34 }}>
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

      {/* ── How an incoming request gets priced ───────────────────────────
          The score above is only half the product. This is the other half:
          what happens to it the moment somebody asks you for something. */}
      <section className="card p-5 flex flex-col gap-5">
        <div className="flex items-baseline justify-between gap-3 rule-b pb-3">
          <span className="t-sub text-ink">
            <Inbox size={17} strokeWidth={SW} className="inline mr-2" />
            How a request gets priced
          </span>
        </div>

        <p className="t-body max-w-[58ch]" style={{ color: 'var(--ink-2)' }}>
          When somebody asks you for something, Oasis does not re-score your week
          from scratch. It works out the energy you would have left if you said
          yes, then takes points off for the things that make those same hours
          land harder. What is left is the <strong style={{ color: 'var(--ink)' }}>margin</strong>.
        </p>

        <div className="flex flex-col rule-divide">
          {PENALTIES.map(p => (
            <div key={p.label} className="flex items-start gap-4 py-3">
              <div className="flex flex-col gap-0.5 flex-1 min-w-0">
                <span className="t-label text-ink">{p.label}</span>
                <span className="t-micro" style={{ color: 'var(--ink-2)', lineHeight: 1.5 }}>
                  {p.detail}
                </span>
              </div>
              <span
                className="t-stat shrink-0"
                style={{ fontSize: 15, color: 'var(--ink)', whiteSpace: 'nowrap' }}
              >
                −{p.cost} pts
              </span>
            </div>
          ))}
        </div>

        <div
          className="flex flex-col gap-1 p-4"
          style={{ background: 'var(--surface-2)', border: '2px solid var(--ink)', borderRadius: 'var(--r-md)' }}
        >
          <span className="t-label text-ink">
            margin = your energy after saying yes − the penalties above
          </span>
          <span className="t-micro" style={{ color: 'var(--ink-2)', lineHeight: 1.5 }}>
            Read against the margin rather than the raw score, so the same four
            hours are judged more harshly on a day that already has something on
            it than on a clear one.
          </span>
        </div>

        {/* Neutral chips on purpose. A verdict is not a health zone, and in this
            app a saturated colour means a health zone and nothing else — tinting
            "Decline" red would quietly claim that declining is a bad state. */}
        <div className="flex flex-col gap-3">
          {LADDER.map(l => (
            <div key={l.tone} className="flex items-start gap-3">
              <span className="shrink-0" style={{ minWidth: 96 }}>
                <Tag>{toneLabel(l.tone)}</Tag>
              </span>
              <div className="flex flex-col gap-0.5 flex-1 min-w-0">
                <span className="t-label text-ink">Margin {l.range}</span>
                <span className="t-micro" style={{ color: 'var(--ink-2)', lineHeight: 1.5 }}>
                  {l.meaning}
                </span>
              </div>
            </div>
          ))}
        </div>

        <span className="t-micro" style={{ color: 'var(--ink-muted)', lineHeight: 1.5 }}>
          There is no language model in this. It is the arithmetic on this page,
          run once — which is why the same request always gets the same verdict,
          and why every verdict can show you the lines it came from.
        </span>
      </section>

      {/* ── Measured vs estimated ─────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <section className="card p-5 flex flex-col gap-3">
          <span className="t-sub text-ink">Measured</span>
          <ul className="flex flex-col gap-2">
            {[
              'Sleep hours and resting heart rate, from your band',
              'Classes, deadlines and shifts you or your timetable put in',
              'Task weights on the group project, and who each one is assigned to',
              'Every request you accepted or declined, and what you accepted it at',
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
              'Hours of effort per commitment, from the kind of thing it is',
              'How much a request will actually take, read from the words in the chat',
              'Your time on the road — which days you travel comes from where your classes are, and the trip length from a figure held in your profile',
            ].map(item => (
              <li key={item} className="t-micro flex items-start gap-2" style={{ color: 'var(--ink-2)', lineHeight: 1.5 }}>
                <span style={{ color: 'var(--ink)' }}>·</span>{item}
              </li>
            ))}
          </ul>
          {/* Said plainly rather than aspirationally. An estimate the prototype
              cannot yet be corrected on is still an estimate, and this is the
              one page in the app that cannot afford to overstate itself. */}
          <span className="t-micro" style={{ color: 'var(--ink-muted)', lineHeight: 1.5 }}>
            Not all of these can be corrected yet. The chat you paste in is
            editable, and any request can be accepted at half its hours instead
            of all of them — but editing a stored estimate directly is on the
            list, not in this build.
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
