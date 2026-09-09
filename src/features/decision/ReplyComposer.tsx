import { useEffect, useState } from 'react'
import { Check, Copy } from 'lucide-react'

import { SW, Tag } from '../../ds'
import type { Tone, Verdict } from '../../logic/decision'
import { TONE_ORDER, replyFor, toneLabel } from '../../logic/decision'
import type { IncomingRequest } from '../../state/types'

// ─── Reply composer ───────────────────────────────────────────────────────────
// The hard part of saying no is not deciding — it is writing the message. Three
// tones, all editable, because the point is that the student actually sends it,
// and they will only send something that sounds like them.

export default function ReplyComposer({
  req, v, onSend,
}: {
  req: IncomingRequest
  v: Verdict
  onSend: (tone: Tone) => void
}) {
  const [tone, setTone] = useState<Tone>(v.decision)
  const [text, setText] = useState(() => replyFor(req, v, v.decision))
  const [copied, setCopied] = useState(false)

  // Switching tone rewrites the draft: edits belong to the tone they were made
  // in, and silently keeping them would leave the wrong answer in the box.
  const pickTone = (t: Tone) => {
    setTone(t)
    setText(replyFor(req, v, t))
    setCopied(false)
  }

  useEffect(() => {
    if (!copied) return
    const id = setTimeout(() => setCopied(false), 2000)
    return () => clearTimeout(id)
  }, [copied])

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
    } catch {
      // Clipboard is blocked in some embedded previews. The textarea is still
      // selectable, so there is nothing to recover and nothing worth saying.
    }
  }

  const hours = tone === 'negotiate' ? v.negotiated.hours : v.commitment.hours

  return (
    <div className="flex flex-col gap-4">
      <Tag tone="yellow">YOUR REPLY</Tag>

      <div className="flex gap-2 flex-wrap" role="group" aria-label="Reply tone">
        {TONE_ORDER.map(t => (
          <button
            key={t}
            onClick={() => pickTone(t)}
            aria-pressed={tone === t}
            className={`chip chip-lg focus-ring hit-44 ${tone === t ? 'chip-selected' : ''}`}
          >
            {toneLabel(t)}
            {t === v.decision && <span style={{ opacity: 0.6 }}> · suggested</span>}
          </button>
        ))}
      </div>

      <label htmlFor="reply-text" className="sr-only">Your reply to {req.parsed.asker}</label>
      <textarea
        id="reply-text"
        value={text}
        onChange={e => { setText(e.target.value); setCopied(false) }}
        rows={7}
        className="t-body focus-ring w-full p-3"
        style={{
          background: 'var(--surface)',
          color: 'var(--ink)',
          border: '2px solid var(--ink)',
          borderRadius: 'var(--r-md)',
          resize: 'vertical',
          lineHeight: 1.6,
        }}
      />

      <div className="flex gap-3 flex-wrap items-center">
        <button className="btn btn-secondary focus-ring" onClick={copy}>
          {copied
            ? <><Check size={16} strokeWidth={SW} /> Copied</>
            : <><Copy size={16} strokeWidth={SW} /> Copy message</>}
        </button>
        <button className="btn btn-primary focus-ring" onClick={() => onSend(tone)}>
          {tone === 'decline' ? 'Sent — log the decline' : `Sent — book ${hours} hrs`}
        </button>
      </div>

      <p className="t-micro" style={{ color: 'var(--ink-muted)', lineHeight: 1.5 }}>
        {tone === 'decline'
          ? 'Declining keeps your week as it is, and Oasis records what it saved you.'
          : `Oasis puts ${hours} hours on your schedule so the number stays honest.`}
      </p>
    </div>
  )
}
