import { ArrowRight, Zap } from 'lucide-react'

import { OasisBlob, SW, ZONE_LABEL, ZoneChip, type ZoneKey } from '../../ds'
import { dayOf } from '../../logic/dates'
import { useEnergy, useOasis } from '../../state/store'
import type { OasisState } from '../../state/types'

// ─── Widget ───────────────────────────────────────────────────────────────────
// What Oasis looks like when it is not open: one number, one word, and the next
// thing coming at you. This is the honest answer to "would a student keep it on
// their phone" — most days they should not need to open the app at all.
//
// The tile is the same component in the preview and at ?view=widget, so what the
// mock shows is literally what the installed app renders.

/** The one line under the number: what is next, or that nothing is. */
function nextUp(s: OasisState): string {
  const upcoming = s.commitments
    .filter(c => c.date >= s.today)
    .sort((a, b) => (a.date === b.date ? a.time.localeCompare(b.time) : a.date.localeCompare(b.date)))[0]

  if (!upcoming) return 'Nothing booked — the week is yours'
  const when = upcoming.date === s.today ? 'Today' : dayOf(upcoming.date)
  return `${when} ${upcoming.time} · ${upcoming.title}`
}

/** Zone-keyed line. Short enough to read on a lock screen without stopping. */
const WIDGET_LINE: Record<ZoneKey, string> = {
  green: 'Room to say yes',
  amber: 'Protect what is left',
  red: 'Say no to the next thing',
}

export function WidgetTile({
  energy, zone, next, compact = false,
}: {
  energy: number
  zone: ZoneKey
  next: string
  /** Lock-screen size: number and word only. */
  compact?: boolean
}) {
  return (
    <div
      className="flex flex-col gap-2"
      style={{
        padding: compact ? 12 : 16,
        background: 'var(--surface)',
        border: '2px solid var(--ink)',
        borderRadius: 'var(--r-lg)',
        boxShadow: '4px 4px 0 var(--ink)',
      }}
    >
      <div className="flex items-center justify-between gap-2">
        <span className="t-eyebrow" style={{ color: 'var(--ink-muted)' }}>
          <Zap size={11} strokeWidth={SW} className="inline mr-1" />OASIS
        </span>
        <ZoneChip zone={zone} />
      </div>

      <div className="flex items-end gap-2">
        <span className="t-stat text-ink" style={{ fontSize: compact ? 34 : 44, lineHeight: 1 }}>
          {energy}
        </span>
        <span className="t-micro pb-1" style={{ color: 'var(--ink-muted)' }}>/ 100</span>
      </div>

      <span className="t-label text-ink">{WIDGET_LINE[zone]}</span>

      {!compact && (
        <span
          className="t-micro"
          style={{
            color: 'var(--ink-2)',
            lineHeight: 1.4,
            overflow: 'hidden',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
          }}
        >
          {next}
        </span>
      )}
    </div>
  )
}

/**
 * The standalone view the installed app opens to. One tap in — anything more
 * than that and it is not a widget, it is a dashboard.
 */
export default function WidgetView({ onOpen }: { onOpen: () => void }) {
  const state = useOasis()
  const { energy, zone } = useEnergy()

  return (
    <div className="min-h-full flex items-center justify-center px-5 py-10 bg-canvas">
      <div className="flex flex-col gap-5 w-full max-w-[380px]" aria-live="polite">
        <div className="flex items-center gap-3">
          <OasisBlob zone={zone} size={44} float={false} />
          <div className="flex flex-col">
            <span className="t-sub text-ink">Your energy today</span>
            <span className="t-micro" style={{ color: 'var(--ink-muted)' }}>
              {ZONE_LABEL[zone]}
            </span>
          </div>
        </div>

        <WidgetTile energy={energy} zone={zone} next={nextUp(state)} />

        <button className="btn btn-primary focus-ring justify-center" onClick={onOpen}>
          Open Oasis <ArrowRight size={16} strokeWidth={SW} />
        </button>

        <p className="t-micro text-center" style={{ color: 'var(--ink-muted)', lineHeight: 1.5 }}>
          Everything on this screen is worked out on your phone. Nothing is sent
          anywhere.
        </p>
      </div>
    </div>
  )
}
