import { useEffect, useState } from 'react'
import { Inbox, Layers, RotateCcw, X } from 'lucide-react'

import { SW } from '../../ds'
import { useDispatch, useEnergy, useOasis } from '../../state/store'
import type { IncomingRequest, OasisState, ScenarioKey } from '../../state/types'

// ─── Demo switcher ────────────────────────────────────────────────────────────
// Everything downstream of the store is derived, so restaging the whole app is
// one dispatch. That is what makes a five-minute video shootable in one take:
// no hand-faked screens, and every scenario is the real formula on real seed data.
//
// Hidden unless asked for — ?demo=1 or Shift+D. A judge should never see the
// scaffolding unless we are the ones showing it to them.

const SCENARIOS: { key: ScenarioKey; label: string; note: string }[] = [
  { key: 'week1', label: 'Week one', note: 'Empty week — nothing logged yet' },
  { key: 'clear', label: 'All clear', note: 'Room to say yes' },
  { key: 'nearCapacity', label: 'Near capacity', note: 'The week is filling' },
  { key: 'redZone', label: 'Red zone', note: 'Past what fits' },
]

/**
 * A request the demo can drop into whatever week is on screen. The engine has
 * three verdicts and the seed only ever produces two of them — in a full week
 * every ask is expensive, so `accept` is unreachable there by construction. This
 * button is how the third one gets demonstrated: inject the same modest ask into
 * All clear and Oasis says yes to it, on the same formula, on camera.
 *
 * The id is derived from the request count rather than generated, because the
 * reducer is pure — the demo has to replay identically on the second take.
 */
function injectedRequest(s: OasisState): IncomingRequest {
  return {
    id: `demo-${s.requests.length}`,
    raw: [
      'Wei Jun: hey, could you take the demo video for the project?',
      'Wei Jun: whenever suits you before the deadline',
    ].join('\n'),
    parsed: {
      title: 'Demo video',
      asker: 'Wei Jun',
      kind: 'task',
      hoursPerWeek: 3,
      deadline: null,
      urgent: false,
    },
    receivedAt: s.today,
    status: 'pending',
  }
}

/** ?demo=1 — read once, at mount, like every other mode switch in the app. */
export function demoMode(): boolean {
  if (typeof window === 'undefined') return false
  return new URLSearchParams(window.location.search).get('demo') === '1'
}

export default function ScenarioBar({ startOpen = false }: { startOpen?: boolean }) {
  const state = useOasis()
  const dispatch = useDispatch()
  const { energy } = useEnergy()

  const [open, setOpen] = useState(startOpen)

  // Shift+D toggles it, so the bar can be summoned mid-recording without
  // reloading the page and losing whatever state the demo is standing on.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (!e.shiftKey || e.key.toLowerCase() !== 'd') return
      const el = document.activeElement
      const typing = el instanceof HTMLInputElement
        || el instanceof HTMLTextAreaElement
        || (el instanceof HTMLElement && el.isContentEditable)
      if (typing) return
      e.preventDefault()
      setOpen(o => !o)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  if (!open) return null

  return (
    <div
      // Above the mobile nav (70px) and the mic button that overhangs it (20px);
      // back down to the corner once the nav is gone at 768px.
      className={
        'fixed left-1/2 z-50 flex flex-col gap-3 p-4 '
        + 'bottom-[calc(env(safe-area-inset-bottom)+102px)] '
        + 'md:bottom-[max(16px,env(safe-area-inset-bottom))]'
      }
      style={{
        transform: 'translateX(-50%)',
        width: 'min(560px, calc(100vw - 24px))',
        background: 'var(--surface)',
        border: '2px solid var(--ink)',
        borderRadius: 'var(--r-lg)',
        boxShadow: '4px 4px 0 var(--ink)',
      }}
      role="group"
      aria-label="Demo scenario switcher"
    >
      <div className="flex items-center justify-between gap-3">
        <span className="t-eyebrow" style={{ color: 'var(--ink-muted)' }}>
          <Layers size={11} strokeWidth={SW} className="inline mr-1" />
          DEMO · SHIFT+D
        </span>
        <div className="flex items-center gap-2">
          <span className="t-micro" style={{ color: 'var(--ink-muted)' }}>energy {energy}</span>
          <button
            className="btn-icon focus-ring hit-44"
            onClick={() => setOpen(false)}
            aria-label="Hide the demo switcher"
          >
            <X size={15} strokeWidth={SW} />
          </button>
        </div>
      </div>

      <div className="flex gap-2 flex-wrap">
        {SCENARIOS.map(s => (
          <button
            key={s.key}
            className={`chip focus-ring ${state.scenario === s.key ? 'chip-selected' : ''}`}
            aria-pressed={state.scenario === s.key}
            onClick={() => dispatch({ type: 'setScenario', scenario: s.key })}
            style={{ minHeight: 44 }}
          >
            {s.label}
          </button>
        ))}
        <button
          className="chip focus-ring"
          onClick={() => dispatch({ type: 'addRequest', request: injectedRequest(state) })}
          style={{ minHeight: 44 }}
        >
          <Inbox size={13} strokeWidth={SW} /> Send a request
        </button>
        <button
          className="chip focus-ring"
          onClick={() => dispatch({ type: 'reset' })}
          style={{ minHeight: 44 }}
        >
          <RotateCcw size={13} strokeWidth={SW} /> Reset
        </button>
      </div>

      <span className="t-micro" style={{ color: 'var(--ink-2)', lineHeight: 1.5 }} aria-live="polite">
        {SCENARIOS.find(s => s.key === state.scenario)?.note}. Every screen restages
        from this one choice. Send a request to drop an ask into the inbox and watch
        the same formula price it against this week.
      </span>
    </div>
  )
}
