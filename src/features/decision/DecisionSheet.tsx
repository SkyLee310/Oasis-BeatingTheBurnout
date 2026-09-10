import { useId, useMemo, useState } from 'react'

import { useSheet } from '../shell/useSheet'
import { ArrowLeft, Check, Sparkles, X } from 'lucide-react'

import { SW } from '../../ds'
import type { Tone } from '../../logic/decision'
import { analyzeRequest, parseChat } from '../../logic/decision'
import { projectEnergy } from '../../logic/energy'
import { useDispatch, useOasis } from '../../state/store'
import type { IncomingRequest } from '../../state/types'
import ReplyComposer from './ReplyComposer'
import ShareIntake from './ShareIntake'
import VerdictCard from './VerdictCard'

// ─── Decision sheet ───────────────────────────────────────────────────────────
// The whole flow, in one panel: a chat comes in, Oasis prices it against the
// real week, and the student leaves with a message they can send. Opened either
// from the pending request on Home (which skips straight to the verdict) or
// cold, from "share a chat".
//
// It is a modal, not an inline expander. Three of the four phases ask for a
// decision — read this, then choose, then send — and a surface that owns the
// answer should own the screen while it waits for one. Everything below follows
// from that: a scrim, a focus trap, and aria-modal telling a screen reader the
// same thing the dimmed page behind it tells everybody else.

type Phase = 'intake' | 'verdict' | 'reply' | 'done'

/** What each outcome leaves behind, in the store's own vocabulary. */
const OUTCOME = {
  decline: 'declined', negotiate: 'negotiated', accept: 'accepted',
} as const

export default function DecisionSheet({
  req: seeded, onClose,
}: {
  req?: IncomingRequest
  onClose: () => void
}) {
  const state = useOasis()
  const dispatch = useDispatch()

  const [req, setReq] = useState<IncomingRequest | null>(seeded ?? null)
  const [phase, setPhase] = useState<Phase>(seeded ? 'verdict' : 'intake')
  const [sent, setSent] = useState<Tone | null>(null)

  // Escape closes, focus lands inside on open and returns to the trigger on
  // close, and Tab stays in here while it is open. This one earns the trap: it
  // covers the page behind a scrim, so nothing the keyboard is kept out of is
  // anything the eye can still read. That is the test an inline panel fails.
  const ref = useSheet<HTMLDivElement>(onClose, { trap: true })
  const titleId = useId()

  const v = useMemo(() => (req ? analyzeRequest(req, state) : null), [req, state])

  const read = (raw: string) => {
    // Ids are derived, never random, so replaying the demo gives the same week.
    setReq({
      id: `shared-${state.requests.length}`,
      raw,
      parsed: parseChat(raw, state.today),
      receivedAt: state.today,
      status: 'pending',
    })
    setPhase('verdict')
  }

  /** Points kept by not taking the whole thing on. Zero when it is accepted. */
  const keptBy = (tone: Tone, verdict: NonNullable<typeof v>) =>
    tone === 'accept' ? 0
    : tone === 'negotiate' ? Math.max(0, projectEnergy(state, verdict.negotiated) - verdict.after)
    : Math.max(0, verdict.before - verdict.after)

  const send = (tone: Tone) => {
    if (!req || !v) return

    // A chat shared just now is not in the store yet; one opened from Home is.
    if (!state.requests.some(r => r.id === req.id)) {
      dispatch({ type: 'addRequest', request: req })
    }

    dispatch({
      type: 'resolveRequest',
      id: req.id,
      outcome: OUTCOME[tone],
      commitments:
        tone === 'accept' ? [v.commitment]
        : tone === 'negotiate' ? [v.negotiated]
        : undefined,
      energySaved: keptBy(tone, v),
    })

    setSent(tone)
    setPhase('done')
  }

  return (
    // mousedown rather than click, and only when the press started on the scrim
    // itself: a drag that begins on the text inside and ends out here is a
    // selection, not a dismissal, and closing on it loses the student's work.
    <div className="scrim" onMouseDown={e => { if (e.target === e.currentTarget) onClose() }}>
      <div
        ref={ref}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
        className="card card-pop p-5 sm:p-6 flex flex-col gap-6 w-full"
        style={{ maxWidth: 560, maxHeight: '90vh', overflowY: 'auto' }}
        onMouseDown={e => e.stopPropagation()}
      >
        {/* gap-3, not gap-2: both controls carry a 44px hit area, and at 8px
            apart those two areas would overlap and swallow each other's taps. */}
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Sparkles size={18} strokeWidth={SW} />
            <h2 className="t-sub text-ink" id={titleId}>
              {phase === 'intake' ? 'Share a chat'
                : phase === 'done' ? 'Logged'
                : 'Should you take this on?'}
            </h2>
          </div>
          <div className="flex items-center gap-3">
            {phase === 'reply' && (
              <button
                className="btn-icon focus-ring hit-44" onClick={() => setPhase('verdict')}
                aria-label="Back to the verdict"
              >
                <ArrowLeft size={16} strokeWidth={SW} />
              </button>
            )}
            <button className="btn-icon focus-ring hit-44" onClick={onClose} aria-label="Close">
              <X size={16} strokeWidth={SW} />
            </button>
          </div>
        </div>

        {phase === 'intake' && <ShareIntake onSubmit={read} />}

        {phase === 'verdict' && req && v && (
          <>
            <VerdictCard req={req} v={v} />
            <div className="flex gap-3 flex-wrap">
              <button className="btn btn-primary focus-ring" onClick={() => setPhase('reply')}>
                Write the reply
              </button>
              <button
                className="btn btn-secondary focus-ring"
                onClick={() => { setReq(null); setPhase('intake') }}
              >
                Try another chat
              </button>
            </div>
          </>
        )}

        {phase === 'reply' && req && v && <ReplyComposer req={req} v={v} onSend={send} />}

        {phase === 'done' && v && sent && (
          <div className="flex flex-col gap-4" aria-live="polite">
            <div className="flex items-center gap-2">
              <Check size={20} strokeWidth={SW} />
              <h3 className="t-title text-ink">
                {sent === 'decline' ? 'You said no.'
                  : sent === 'negotiate' ? 'You took part of it.'
                  : 'It is on your schedule.'}
              </h3>
            </div>
            <p className="t-body max-w-[52ch]" style={{ color: 'var(--ink-2)' }}>
              {sent === 'accept'
                ? `${v.commitment.hours} hours added — your week and every screen in Oasis now reflect it.`
                : `Kept ${keptBy(sent, v)} energy points that saying yes in full would have cost. It is logged under your decisions.`}
            </p>
            <button className="btn btn-primary focus-ring self-start" onClick={onClose}>
              Back to your week
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
