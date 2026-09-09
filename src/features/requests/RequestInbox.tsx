import { useState } from 'react'
import { CalendarClock, Clock, Inbox } from 'lucide-react'

import { Initials, SW } from '../../ds'
import { shortDate } from '../../logic/dates'
import { useOasis } from '../../state/store'
import type { IncomingRequest } from '../../state/types'
import RequestSheet from './RequestSheet'

// ─── Request inbox ────────────────────────────────────────────────────────────
// Where an ask arrives. Home and Group both mount this in one line and neither
// of them knows how a request is priced or answered — the inbox owns the open
// sheet, so a row can be tapped from anywhere and behave identically.
//
// Two deliberate refusals in here, both accessibility rather than taste:
//
//   1. The waiting count is a sentence in one live region, not a number in a
//      badge beside a heading. A screen reader reading "Requests" and later "2"
//      has been told nothing; "2 waiting on you" is the whole message in one
//      announcement, which is why aria-atomic is on it.
//   2. Every row is a real <button>. A list row that opens a sheet is a
//      control, and a div with onClick is not reachable, not announced, and
//      not pressable from a keyboard.

export default function RequestInbox() {
  const state = useOasis()
  const [open, setOpen] = useState<IncomingRequest | null>(null)

  const waiting = state.requests.filter(r => r.status === 'pending')

  return (
    <section className="card p-5 flex flex-col gap-4" aria-labelledby="inbox-heading">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <span id="inbox-heading" className="t-sub text-ink">
          <Inbox size={17} strokeWidth={SW} className="inline mr-2" />
          Requests
        </span>

        <span
          role="status"
          aria-atomic="true"
          className="t-micro flex items-center gap-2"
          style={{ color: 'var(--ink-muted)', whiteSpace: 'nowrap' }}
        >
          {waiting.length > 0 && <span className="dot" aria-hidden="true" />}
          {waiting.length === 0
            ? 'Nothing waiting on you'
            : `${waiting.length} waiting on you`}
        </span>
      </div>

      {waiting.length === 0 ? (
        <p className="t-body" style={{ color: 'var(--ink-2)' }}>
          Nothing waiting on you. When a teammate asks you for something in Oasis,
          it lands here and gets priced against your week before you answer.
        </p>
      ) : (
        <div className="flex flex-col gap-2">
          {waiting.map(r => <RequestRow key={r.id} req={r} onOpen={() => setOpen(r)} />)}
        </div>
      )}

      <p className="t-micro" style={{ color: 'var(--ink-muted)', lineHeight: 1.55 }}>
        Oasis sends no push notifications — this is an in-app inbox, and the dot is
        the only nudge you will get.
      </p>

      {open && <RequestSheet req={open} onClose={() => setOpen(null)} />}
    </section>
  )
}

/**
 * One waiting ask. It says who, what, how much and when — everything needed to
 * decide whether to open it — and no verdict. Pricing happens in the sheet on
 * purpose: a decision rendered in a list is a decision made before it was read.
 */
function RequestRow({ req, onOpen }: { req: IncomingRequest; onOpen: () => void }) {
  const { parsed } = req

  return (
    <button
      className="row-btn focus-ring"
      onClick={onOpen}
      aria-label={`Open request from ${parsed.asker}: ${parsed.title}`}
    >
      <Initials size={34} src={null} initials={parsed.asker.slice(0, 2).toUpperCase()} />

      <span className="flex flex-col gap-1 flex-1 min-w-0">
        <span className="flex items-center gap-2 flex-wrap">
          <span className="t-label text-ink">{parsed.asker}</span>
          {parsed.urgent && (
            <span className="chip chip-selected" style={{ whiteSpace: 'nowrap', minWidth: 0 }}>
              Wants an answer now
            </span>
          )}
        </span>

        <span className="t-micro truncate" style={{ color: 'var(--ink)' }}>
          {parsed.title}
        </span>

        <span
          className="t-micro flex items-center gap-3 flex-wrap"
          style={{ color: 'var(--ink-muted)' }}
        >
          <span className="flex items-center gap-1" style={{ whiteSpace: 'nowrap' }}>
            <Clock size={12} strokeWidth={SW} /> {parsed.hoursPerWeek} hrs/week
          </span>
          {parsed.deadline && (
            <span className="flex items-center gap-1" style={{ whiteSpace: 'nowrap' }}>
              <CalendarClock size={12} strokeWidth={SW} /> Lands {shortDate(parsed.deadline)}
            </span>
          )}
        </span>
      </span>

      <span className="dot" aria-hidden="true" />
    </button>
  )
}
