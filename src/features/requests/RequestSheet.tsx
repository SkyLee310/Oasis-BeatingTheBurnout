import { useEffect, useRef, useState } from 'react'
import { Check, X } from 'lucide-react'

import { SW } from '../../ds'
import { analyzeRequest } from '../../logic/decision'
import { projectEnergy } from '../../logic/energy'
import { useDispatch, useOasis } from '../../state/store'
import type { IncomingRequest } from '../../state/types'
import VerdictCard from '../decision/VerdictCard'
import { useSheet } from '../shell/useSheet'
import Outcome from './Outcome'
import type { ResolvedOutcome } from './Outcome'

// ─── Request sheet ────────────────────────────────────────────────────────────
// One ask, priced, answered, and closed — without leaving the app and without
// the student writing a word. The body is <VerdictCard>, the same component the
// pasted-chat flow uses, so an inbox request and a shared chat cannot ever
// disagree about what a number means.
//
// Two buttons, not three, even though the engine has three verdicts. A person
// staring at a request from a manager does not want a menu; they want out. The
// third verdict is folded into Accept: on a `negotiate` the button offers half
// the hours and says so on its own face, so the counter-offer is a thing you
// take rather than a thing you have to think of.

/** Which button carries the ink fill — the app's recommendation, stated once. */
const RECOMMENDS_DECLINE = { decline: true, negotiate: false, accept: false }

/** How the answer opens when it is spoken rather than seen. */
const ANSWER_WORD: Record<ResolvedOutcome, string> = {
  declined: 'Declined.',
  negotiated: 'You took part of it.',
  accepted: 'You picked it up.',
}

export default function RequestSheet({ req, onClose }: {
  req: IncomingRequest
  onClose: () => void
}) {
  const state = useOasis()
  const dispatch = useDispatch()
  const ref = useSheet<HTMLDivElement>(onClose, { trap: true })

  // Held locally rather than read back from the store: once resolved, the
  // request leaves the pending list, and the sheet still has to finish showing
  // what happened before it closes.
  const [resolved, setResolved] = useState<ResolvedOutcome | null>(null)

  // The same answer, written for a screen reader. Built at the moment of the tap
  // rather than at render: by the time the answered view draws, the store already
  // holds the accepted commitment, and projecting the landing energy off it a
  // second time would count those hours twice.
  const [said, setSaid] = useState('')

  // Both buttons below unmount the instant an answer lands, which drops focus on
  // <body> inside a dialog that is still open. Hand it to the one control the
  // answered sheet has.
  const doneRef = useRef<HTMLButtonElement>(null)
  useEffect(() => { if (resolved) doneRef.current?.focus() }, [resolved])

  const v = analyzeRequest(req, state)
  const titleId = `req-${req.id}-title`

  // On a negotiate verdict, Accept means accepting the half — the offer the
  // engine already computed. Everywhere else it means the whole ask.
  const negotiating = v.decision === 'negotiate'
  const landing = negotiating ? v.negotiated : v.commitment

  const acceptLabel = negotiating
    ? `Accept ${landing.hours}h of it`
    : v.decision === 'decline'
      ? `Accept anyway (${landing.hours}h)`
      : `Accept (${landing.hours}h)`

  function accept() {
    const outcome: ResolvedOutcome = negotiating ? 'negotiated' : 'accepted'
    const landed = projectEnergy(state, landing)

    dispatch({
      type: 'resolveRequest',
      id: req.id,
      outcome,
      commitments: [landing],
      energySaved: 0,
    })

    // If the ask names a task nobody has claimed, taking it on here is the same
    // act as claiming it on the Group page. Doing both from one tap is what
    // makes the split move when a request is answered.
    //
    // The search runs across every project. A request lands in the inbox with no
    // idea which project page was last open, so matching only that one would
    // quietly drop the claim whenever the ask belonged to a different course.
    for (const project of state.projects) {
      const claimed = project.tasks.find(t =>
        t.assignee === null &&
        t.title.toLowerCase() === req.parsed.title.toLowerCase())
      const me = project.members.find(m => m.status === 'you')
      if (claimed && me) {
        dispatch({ type: 'assignTask', projectId: project.id, taskId: claimed.id, memberId: me.id })
        break
      }
    }

    setResolved(outcome)
    setSaid(
      `${ANSWER_WORD[outcome]} Oasis wrote the reply. Your energy goes from ${v.before} to ${landed}.`,
    )
  }

  function decline() {
    dispatch({
      type: 'resolveRequest',
      id: req.id,
      outcome: 'declined',
      energySaved: v.before - v.after,
    })
    setResolved('declined')
    setSaid(
      `${ANSWER_WORD.declined} Oasis wrote the reply. Your energy stays at ${v.before}.`,
    )
  }

  return (
    <div className="scrim" onMouseDown={e => { if (e.target === e.currentTarget) onClose() }}>
      <div
        ref={ref}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
        className="card card-pop p-5 sm:p-6 flex flex-col gap-5 w-full"
        style={{ maxWidth: 560, maxHeight: '90vh', overflowY: 'auto' }}
        onMouseDown={e => e.stopPropagation()}
      >
        {/* Mounted empty from the moment the sheet opens, because a live region
            that arrives already full is not announced — it has to exist first and
            change afterwards. Nothing outside can do this job either: aria-modal
            hides the dashboard's energy line while the sheet is up, so the number
            moving is only ever spoken from in here. */}
        <span className="sr-only" role="status" aria-live="polite">{said}</span>

        <div className="flex items-start justify-between gap-3">
          <div className="flex flex-col gap-1 min-w-0">
            <h2 id={titleId} className="t-sub text-ink">
              {resolved ? 'Answered' : `${req.parsed.asker} asked you`}
            </h2>
            <span className="t-micro" style={{ color: 'var(--ink-muted)' }}>
              {resolved
                ? 'Sent inside Oasis. Nothing was posted to any chat.'
                : 'Priced against the week you are actually in.'}
            </span>
          </div>
          <button
            className="chip focus-ring hit-44 shrink-0"
            onClick={onClose}
            aria-label="Close"
            style={{ minHeight: 34 }}
          >
            <X size={14} strokeWidth={SW} />
          </button>
        </div>

        {resolved ? (
          <>
            <Outcome req={req} outcome={resolved} />
            <button ref={doneRef} className="btn btn-primary focus-ring" onClick={onClose}>
              Done
            </button>
          </>
        ) : (
          <>
            <VerdictCard req={req} v={v} />

            <div className="flex flex-col sm:flex-row gap-3">
              <button
                className={`btn focus-ring flex-1 ${RECOMMENDS_DECLINE[v.decision] ? 'btn-primary' : 'btn-secondary'}`}
                onClick={decline}
              >
                <X size={16} strokeWidth={SW} /> Decline
              </button>
              <button
                className={`btn focus-ring flex-1 ${RECOMMENDS_DECLINE[v.decision] ? 'btn-secondary' : 'btn-primary'}`}
                onClick={accept}
              >
                <Check size={16} strokeWidth={SW} /> {acceptLabel}
              </button>
            </div>

            <p className="t-micro" style={{ color: 'var(--ink-muted)', lineHeight: 1.55 }}>
              Either way Oasis writes the reply. {req.parsed.asker} sees a word and a
              sentence — never your score, your sleep or any of the reasoning above.
            </p>
          </>
        )}
      </div>
    </div>
  )
}
