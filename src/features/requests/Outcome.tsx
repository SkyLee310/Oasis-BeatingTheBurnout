import { Eye } from 'lucide-react'

import { Initials, SW, Tag } from '../../ds'
import { capacityOf } from '../../logic/group'
import { useOasis } from '../../state/store'
import type { IncomingRequest } from '../../state/types'
import CapacityChip from '../group/CapacityChip'

// ─── Outcome ──────────────────────────────────────────────────────────────────
// What the person who asked sees. Not a receipt for the student — a preview of
// the *other* screen, which is why the eyebrow names them: the only way to trust
// a privacy promise is to be shown the thing being sent.
//
// The hard rule, enforced by construction rather than by care: there is not a
// single digit in this component. Counts are spelled out as words, capacity is
// a word, and no number reaches it as a prop. A figure cannot leak from a
// surface that has nowhere to put one.

export type ResolvedOutcome = 'accepted' | 'declined' | 'negotiated'

/** Small counts, written out. Anything past this is 'several' — still not a digit. */
const COUNT_WORD = [
  'no', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine',
]
const countWord = (n: number) => COUNT_WORD[n] ?? 'several'

const upperFirst = (s: string) => s.charAt(0).toUpperCase() + s.slice(1)

/** What Oasis says on your behalf. Short, factual, and never an apology. */
const LEAD: Record<ResolvedOutcome, string> = {
  declined: 'Declined this one.',
  negotiated: 'Taking part of it.',
  accepted: 'Picked this up.',
}

export default function Outcome({ req, outcome }: {
  req: IncomingRequest
  outcome: ResolvedOutcome
}) {
  const { project } = useOasis()

  const me = project.members.find(m => m.status === 'you')
  const name = me?.name ?? 'You'
  const capacity = me ? capacityOf(project, me.id) : 'green'

  const open = me
    ? project.tasks.filter(t => t.assignee === me.id && !t.done).length
    : 0

  const tail = open === 0
    ? 'Nothing else open on this project right now.'
    : `${upperFirst(countWord(open))} ${open === 1 ? 'task' : 'tasks'} already open this week.`

  return (
    <div className="tile tile-cream" style={{ padding: 20, gap: 14 }}>
      <div className="flex items-center gap-2">
        <Eye size={15} strokeWidth={SW} />
        <Tag>WHAT {req.parsed.asker.toUpperCase()} SEES</Tag>
      </div>

      <div className="flex items-center gap-3">
        <Initials size={38} src={null} initials={name.slice(0, 2).toUpperCase()} />
        <div className="flex flex-col gap-1 min-w-0">
          <span className="t-sub text-ink">{name}</span>
          <CapacityChip zone={capacity} />
        </div>
      </div>

      <p className="t-body max-w-[46ch]" style={{ color: 'var(--ink)' }}>
        {LEAD[outcome]} {tail}
      </p>

      <p className="t-micro" style={{ color: 'var(--ink-2)', lineHeight: 1.55 }}>
        Written by Oasis, not by you — and that is the whole message. No score, no
        sleep, no reasoning. {req.parsed.asker} reads it in the app the next time it
        is open; Oasis sends no push notification.
      </p>
    </div>
  )
}
