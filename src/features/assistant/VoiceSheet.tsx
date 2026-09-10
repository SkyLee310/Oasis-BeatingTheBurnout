import { Brain, X } from 'lucide-react'

import { SW } from '../../ds'
import type { IncomingRequest } from '../../state/types'
import { useSheet } from '../shell/useSheet'
import VoiceAssistantPanel from './VoiceAssistantPanel'

// ─── Voice sheet (mobile) ─────────────────────────────────────────────────────
// The one surface in the app that genuinely covers the screen, so it is the one
// that genuinely traps focus. Lifted out of App.tsx because the trap lives in a
// hook, and a hook cannot be called from inside a conditional branch of a render.

export default function VoiceSheet({ onClose, onOpenDecision }: {
  onClose: () => void
  onOpenDecision?: (req: IncomingRequest) => void
}) {
  const ref = useSheet<HTMLDivElement>(onClose, { trap: true })

  return (
    <div
      className="show-mobile fixed inset-0 z-50 flex-col voice-backdrop"
      style={{ background: 'rgba(20, 20, 15, 0.45)' }}
      onClick={onClose}
    >
      <div
        ref={ref}
        role="dialog"
        aria-modal="true"
        aria-labelledby="voice-sheet-title"
        tabIndex={-1}
        className="absolute bottom-0 left-0 right-0 voice-sheet-expand"
        style={{
          height: '82vh', overflow: 'hidden',
          background: 'var(--surface)',
          borderTop: '2px solid var(--ink)',
          borderRadius: 'var(--r-xl) var(--r-xl) 0 0',
        }}
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-5 py-4 rule-b">
          <div className="flex items-center gap-2.5">
            <span
              className="flex items-center justify-center shrink-0"
              style={{ width: 34, height: 34, borderRadius: 999, background: 'var(--highlight)', border: '2px solid var(--ink)' }}
            >
              <Brain size={18} strokeWidth={SW} style={{ color: 'var(--ink)' }} />
            </span>
            <span className="t-sub text-ink" id="voice-sheet-title">Oasis AI</span>
          </div>
          <button className="btn-icon focus-ring hit-44" onClick={onClose} aria-label="Close Oasis AI">
            <X size={17} strokeWidth={SW} />
          </button>
        </div>
        <div style={{ height: 'calc(82vh - 67px)' }}>
          <VoiceAssistantPanel showHeader={false} onOpenDecision={onOpenDecision} />
        </div>
      </div>
    </div>
  )
}
