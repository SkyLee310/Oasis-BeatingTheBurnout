import { useEffect, useState } from 'react'
import { Check, Copy, MessageCircle, X } from 'lucide-react'

import { SW, Tag } from '../../ds'
import { useSheet } from '../shell/useSheet'
import { proposeRebalance, waLink } from '../../logic/group'
import type { GroupProject } from '../../state/types'

// ─── WhatsApp message sheet ───────────────────────────────────────────────────
// A ready-to-send group message laying out the task split diplomatically so you
// don't have to sound confrontational. The student can review or edit the text
// directly before copying it or launching it in WhatsApp.

export default function WhatsAppMessageSheet({
  project,
  onClose,
}: {
  project: GroupProject
  onClose: () => void
}) {
  const [message, setMessage] = useState(() => proposeRebalance(project))
  const [copied, setCopied] = useState(false)

  // Standard modal behavior: Esc out, backdrop click, focus trap
  const ref = useSheet<HTMLDivElement>(onClose, { trap: true })

  useEffect(() => {
    if (!copied) return
    const id = setTimeout(() => setCopied(false), 2000)
    return () => clearTimeout(id)
  }, [copied])

  const copyMessage = async () => {
    try {
      await navigator.clipboard.writeText(message)
      setCopied(true)
    } catch {
      // Handled gracefully if clipboard is blocked
    }
  }

  return (
    <div className="scrim" onMouseDown={e => { if (e.target === e.currentTarget) onClose() }}>
      <div
        ref={ref}
        role="dialog"
        aria-modal="true"
        aria-labelledby="whatsapp-sheet-title"
        tabIndex={-1}
        onMouseDown={e => e.stopPropagation()}
        className="card card-pop p-5 sm:p-6 flex flex-col gap-4 max-w-[540px] w-full max-h-[90vh] overflow-y-auto page-section-enter"
        style={{
          boxShadow: '0 20px 40px rgba(0, 0, 0, 0.35)',
        }}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex flex-col gap-1">
            <Tag tone="green">WHATSAPP DRAFT</Tag>
            <h2 className="t-title text-ink" id="whatsapp-sheet-title">
              WhatsApp group message
            </h2>
          </div>
          <button className="btn-icon focus-ring hit-44" onClick={onClose} aria-label="Close message preview">
            <X size={16} strokeWidth={SW} />
          </button>
        </div>

        <p className="t-body max-w-[54ch]" style={{ color: 'var(--ink-2)' }}>
          Ready-to-send group update. Review or edit anytime before sending.
        </p>

        {/* ── Message draft ─────────────────────────────────────────────────── */}
        <div className="flex flex-col gap-2">
          <label htmlFor="whatsapp-draft-text" className="t-eyebrow" style={{ color: 'var(--ink-muted)' }}>
            MESSAGE PREVIEW
          </label>
          <textarea
            id="whatsapp-draft-text"
            value={message}
            onChange={e => setMessage(e.target.value)}
            rows={7}
            className="t-micro p-3 focus-ring w-full resize-y"
            style={{
              background: 'var(--surface)',
              border: '2px solid var(--ink)',
              borderRadius: 'var(--r-md)',
              color: 'var(--ink)',
              lineHeight: 1.6,
              fontFamily: 'inherit',
            }}
          />
        </div>

        <div className="flex gap-3 flex-wrap">
          <a
            className="btn btn-primary focus-ring"
            href={waLink(message)}
            target="_blank"
            rel="noreferrer"
          >
            <MessageCircle size={16} strokeWidth={SW} /> Send on WhatsApp
          </a>
          <button className="btn btn-secondary focus-ring" onClick={copyMessage}>
            {copied ? (
              <>
                <Check size={16} strokeWidth={SW} /> Copied
              </>
            ) : (
              <>
                <Copy size={16} strokeWidth={SW} /> Copy message
              </>
            )}
          </button>
        </div>

        <p className="t-micro" style={{ color: 'var(--ink-muted)', lineHeight: 1.5 }}>
          Only task assignments and points are shared. Personal energy stays private.
        </p>
      </div>
    </div>
  )
}
