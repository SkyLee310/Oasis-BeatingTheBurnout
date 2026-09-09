import { useState } from 'react'
import { Check, ChevronRight, X } from 'lucide-react'

import { SW, Tag } from '../../ds'
import { energyFor } from '../../logic/energy'
import { useDispatch, useOasis } from '../../state/store'
import type { DailyCheckIn } from '../../state/types'

// ─── Daily check ──────────────────────────────────────────────────────────────
// The reason to open the app. Three taps, about ten seconds, and the number
// moves in front of you — a check-in that changed nothing would be a survey.
//
// Everything here is skippable and nothing nags. An app about not overcommitting
// cannot itself become a daily obligation.

type Score = 1 | 2 | 3

const QUESTIONS: {
  key: 'slept' | 'mood' | 'load'
  question: string
  options: Record<Score, string>
}[] = [
  {
    key: 'slept',
    question: 'How did you sleep?',
    options: { 1: 'Barely', 2: 'Patchy', 3: 'Properly' },
  },
  {
    key: 'mood',
    question: 'How are you feeling today?',
    options: { 1: 'Running on empty', 2: 'Getting by', 3: 'Steady' },
  },
  {
    key: 'load',
    question: 'How does today look?',
    options: { 1: 'Too much', 2: 'Full but fine', 3: 'Manageable' },
  },
]

export default function DailyCheck({ onDismiss }: { onDismiss: () => void }) {
  const state = useOasis()
  const dispatch = useDispatch()

  const [step, setStep] = useState(0)
  const [answers, setAnswers] = useState<Partial<Record<'slept' | 'mood' | 'load', Score>>>({})
  // Captured before anything is dispatched, so the "from → to" is real.
  const [before, setBefore] = useState(() => energyFor(state))
  // Set when this card is the one that wrote today's check-in. Without it the
  // card would be testing state.checkIn on every render, and that test goes true
  // the instant the third answer dispatches — taking the card off screen at the
  // one moment it has something to say.
  const [mine, setMine] = useState(false)

  const answeredToday = state.checkIn?.date === state.today

  // The seed can be swapped underneath this card: the demo switcher and Reset
  // both hand back a state with checkIn: null. A finished card has to start over
  // when that happens. Reconciled here rather than with a key on the caller, so
  // the whole rule sits in one place — no check-in for today, ask the question.
  if (mine && !answeredToday) {
    setMine(false)
    setStep(0)
    setAnswers({})
    setBefore(energyFor(state))
  }

  const done = step >= QUESTIONS.length
  const q = QUESTIONS[Math.min(step, QUESTIONS.length - 1)]

  const answer = (score: Score) => {
    const next = { ...answers, [q.key]: score }
    setAnswers(next)

    if (step < QUESTIONS.length - 1) {
      setStep(step + 1)
      return
    }

    const checkIn: DailyCheckIn = {
      date: state.today,
      slept: next.slept ?? 2,
      mood: next.mood ?? 2,
      load: next.load ?? 2,
    }
    dispatch({ type: 'checkIn', checkIn })
    setMine(true)
    setStep(step + 1)
  }

  // Nothing to ask — today was answered before this card was on screen. The
  // dashboard mounts it unconditionally so it survives its own dispatch;
  // deciding there is no question today is this component's job, not its caller's.
  if (answeredToday && !mine) return null

  if (done) {
    const after = energyFor(state)
    const delta = after - before

    return (
      <section className="card card-pop p-5 flex items-center gap-4" aria-live="polite">
        <span
          className="flex items-center justify-center shrink-0"
          style={{
            width: 40, height: 40, borderRadius: 999,
            background: 'var(--mint-deep)', border: '2px solid var(--ink)',
          }}
        >
          <Check size={20} strokeWidth={SW} />
        </span>
        <div className="flex flex-col gap-0.5 flex-1 min-w-0">
          <span className="t-sub text-ink">Logged — thank you</span>
          <span className="t-micro" style={{ color: 'var(--ink-2)', lineHeight: 1.5 }}>
            {delta === 0
              ? `Your energy holds at ${after}. Today reads the way yesterday did.`
              : delta > 0
                ? `Your energy went from ${before} to ${after} — the rest showed up in the number.`
                : `Your energy went from ${before} to ${after}. Short sleep costs more than it feels like.`}
          </span>
        </div>
        <button className="btn-icon focus-ring shrink-0" onClick={onDismiss} aria-label="Close check-in">
          <X size={16} strokeWidth={SW} />
        </button>
      </section>
    )
  }

  return (
    <section className="card card-pop p-5 flex flex-col gap-4">
      <div className="flex items-start justify-between gap-3">
        <div className="flex flex-col gap-1.5">
          <Tag tone="yellow">DAILY CHECK · 10 SECONDS</Tag>
          <h2 className="t-title text-ink">{q.question}</h2>
        </div>
        <button className="btn-icon focus-ring shrink-0" onClick={onDismiss} aria-label="Skip the check-in">
          <X size={16} strokeWidth={SW} />
        </button>
      </div>

      <div className="flex gap-2 flex-wrap" role="group" aria-label={q.question}>
        {([1, 2, 3] as Score[]).map(score => (
          <button
            key={score}
            className="chip chip-lg focus-ring"
            onClick={() => answer(score)}
            style={{ minHeight: 44 }}
          >
            {q.options[score]}
          </button>
        ))}
      </div>

      <div className="flex items-center justify-between gap-3">
        {/* Progress in words as well as pips — the dots alone say nothing aloud. */}
        <span className="t-micro" style={{ color: 'var(--ink-muted)' }}>
          Question {step + 1} of {QUESTIONS.length}
        </span>
        <div className="flex gap-1.5" aria-hidden="true">
          {QUESTIONS.map((_, i) => (
            <span
              key={i}
              style={{
                width: 8, height: 8, borderRadius: 999,
                border: '2px solid var(--ink)',
                background: i <= step ? 'var(--ink)' : 'transparent',
              }}
            />
          ))}
        </div>
      </div>

      <button className="chip focus-ring hit-44 self-start" onClick={onDismiss} style={{ minHeight: 34 }}>
        Not now <ChevronRight size={13} strokeWidth={SW} />
      </button>
    </section>
  )
}
