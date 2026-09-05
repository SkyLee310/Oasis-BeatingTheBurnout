import { useEffect, useMemo, useState } from 'react'
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

  // Escape closes, the way every other dismissable surface in the app does.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

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
    <div className="card card-pop p-5 sm:p-6 flex flex-col gap-6 mt-3">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Sparkles size={18} strokeWidth={SW} />
          <span className="t-sub text-ink">
            {phase === 'intake' ? 'Share a chat'
              : phase === 'done' ? 'Logged'
              : 'Should you take this on?'}
          </span>
        </div>
        <div className="flex items-center gap-2">
          {phase === 'reply' && (
            <button
              className="btn-icon focus-ring" onClick={() => setPhase('verdict')}
              aria-label="Back to the verdict"
            >
              <ArrowLeft size={16} strokeWidth={SW} />
            </button>
          )}
          <button className="btn-icon focus-ring" onClick={onClose} aria-label="Close">
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
  )
}
