import { useEffect, useState } from 'react'

import { useSheet } from '../shell/useSheet'
import { Check, Copy, Link2, MessageCircle, X } from 'lucide-react'

import { SW, Tag } from '../../ds'
import { inviteMessage, joinUrl, waLink } from '../../logic/group'
import type { GroupProject, Member } from '../../state/types'

// ─── Invite sheet ─────────────────────────────────────────────────────────────
// The download loop, done honestly. There is no server, so the link is not a
// pretend one: ?join=<code> is a real URL this build answers, which means it can
// be opened on a second phone on camera. The WhatsApp deep link is real too.

export default function InviteSheet({
  project, member, onClose,
}: {
  project: GroupProject
  /** Who is being invited, when the invite came from a specific row. */
  member?: Member
  onClose: () => void
}) {
  const [copied, setCopied] = useState<'link' | 'message' | null>(null)

  // Same contract as every other dismissable surface: Esc out, focus returned.
  const ref = useSheet<HTMLDivElement>(onClose)

  const url = joinUrl(project.code)
  const message = inviteMessage(project, url)

  useEffect(() => {
    if (!copied) return
    const id = setTimeout(() => setCopied(null), 2000)
    return () => clearTimeout(id)
  }, [copied])

  const copy = async (what: 'link' | 'message', text: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(what)
    } catch {
      // Blocked in some embedded previews; both values are selectable on screen.
    }
  }

  return (
    <div
      ref={ref}
      role="dialog"
      aria-labelledby="invite-sheet-title"
      tabIndex={-1}
      className="card card-pop p-5 sm:p-6 flex flex-col gap-5"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex flex-col gap-1">
          <Tag tone="yellow">INVITE</Tag>
          <h3 className="t-title text-ink" id="invite-sheet-title">
            {member ? `Add ${member.name} to the project` : 'Add your teammates'}
          </h3>
        </div>
        <button className="btn-icon focus-ring" onClick={onClose} aria-label="Close invite">
          <X size={16} strokeWidth={SW} />
        </button>
      </div>

      <p className="t-body max-w-[54ch]" style={{ color: 'var(--ink-2)' }}>
        They open the link, and the project lands in their Oasis. If they do not
        have the app yet, the link installs it first and then adds the project.
      </p>

      {/* ── The link itself ───────────────────────────────────────────────── */}
      <div className="flex flex-col gap-2">
        <span className="t-eyebrow" style={{ color: 'var(--ink-muted)' }}>PROJECT LINK</span>
        <div
          className="flex items-center gap-2 p-3"
          style={{
            background: 'var(--surface-2)',
            border: '2px solid var(--ink)',
            borderRadius: 'var(--r-md)',
          }}
        >
          <Link2 size={16} strokeWidth={SW} className="shrink-0" />
          <code
            className="t-micro flex-1 min-w-0"
            style={{ color: 'var(--ink)', overflowWrap: 'anywhere' }}
          >
            {url}
          </code>
        </div>
        <span className="t-micro" style={{ color: 'var(--ink-muted)' }}>
          Join code <strong style={{ color: 'var(--ink)' }}>{project.code}</strong>
        </span>
      </div>

      {/* ── What gets sent ────────────────────────────────────────────────── */}
      <div className="flex flex-col gap-2">
        <span className="t-eyebrow" style={{ color: 'var(--ink-muted)' }}>MESSAGE</span>
        <pre
          className="t-micro p-3 whitespace-pre-wrap"
          style={{
            background: 'var(--surface)',
            border: '2px solid var(--ink)',
            borderRadius: 'var(--r-md)',
            color: 'var(--ink)',
            lineHeight: 1.6,
            fontFamily: 'inherit',
          }}
        >
          {message}
        </pre>
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
        <button className="btn btn-secondary focus-ring" onClick={() => copy('link', url)}>
          {copied === 'link'
            ? <><Check size={16} strokeWidth={SW} /> Copied</>
            : <><Copy size={16} strokeWidth={SW} /> Copy link</>}
        </button>
        <button className="btn btn-secondary focus-ring" onClick={() => copy('message', message)}>
          {copied === 'message'
            ? <><Check size={16} strokeWidth={SW} /> Copied</>
            : <><Copy size={16} strokeWidth={SW} /> Copy message</>}
        </button>
      </div>

      <p className="t-micro" style={{ color: 'var(--ink-muted)', lineHeight: 1.5 }}>
        Teammates see the project split and the deadline. They never see your
        energy score, your sleep, or anything you declined.
      </p>
    </div>
  )
}
