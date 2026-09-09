import { useState } from 'react'
import { ChevronRight, MessageCircle, Share2 } from 'lucide-react'

import { SW, Tag } from '../../ds'

// ─── Share intake ─────────────────────────────────────────────────────────────
// Where a chat gets into Oasis. Two doors, because the demo and the judges want
// different things: a phone mock that shows the real gesture (long-press the
// message → Share to Oasis) and a plain textarea a judge can paste into in two
// seconds. Both end at the same place — raw text handed to parseChat().

/** The mock conversation, written the way a manager actually types. */
const MOCK = [
  'hey Maya, can you cover Friday evening this week?',
  '5pm-11pm, and probably Saturday morning too',
  'need to know by tonight sorry 🙏',
]

const MOCK_RAW = MOCK.map(t => `Farah (Manager): ${t}`).join('\n')

/** Three chats a judge can try without typing. Kinds deliberately differ. */
const SAMPLES: { label: string; raw: string }[] = [
  {
    label: 'Group project',
    raw: [
      'Wei Jie: eh the DS2201 group assignment ah',
      'Wei Jie: can you lead it and do the slides? nobody else wants to',
      'Wei Jie: due Monday, probably 8 hours of work a week',
    ].join('\n'),
  },
  { label: 'Extra shift', raw: MOCK_RAW },
  {
    label: 'Birthday dinner',
    raw: [
      'Amirah: heyy are you free to come for dinner on Saturday',
      'Amirah: my birthday thing, around 3 hours, no pressure!',
    ].join('\n'),
  },
]

export default function ShareIntake({ onSubmit }: { onSubmit: (raw: string) => void }) {
  const [text, setText] = useState('')
  const empty = text.trim().length === 0

  return (
    <div className="flex flex-col gap-6">
      <p className="t-body" style={{ color: 'var(--ink-2)' }}>
        Oasis never reads your chats in the background. You choose the one message
        that matters and share it here — everything below happens on this device.
      </p>

      <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,260px)_1fr] gap-6 items-start">
        {/* ── The gesture, as it looks on a phone ─────────────────────────── */}
        <div
          className="flex flex-col gap-2 p-3 mx-auto w-full max-w-[260px]"
          style={{
            background: 'var(--surface-2)',
            border: '2px solid var(--ink)',
            borderRadius: 'var(--r-lg)',
            boxShadow: '4px 4px 0 var(--ink)',
          }}
        >
          <div className="flex items-center gap-2 pb-1">
            <MessageCircle size={14} strokeWidth={SW} />
            <span className="t-micro text-ink" style={{ fontWeight: 700 }}>Farah · Manager</span>
          </div>

          {MOCK.map((t, i) => (
            <div
              key={i}
              className="p-2 self-start"
              style={{
                background: 'var(--surface)',
                border: '2px solid var(--ink)',
                borderRadius: 'var(--r-sm)',
                maxWidth: '92%',
              }}
            >
              <span className="t-micro" style={{ color: 'var(--ink)', lineHeight: 1.45 }}>{t}</span>
            </div>
          ))}

          <button
            className="btn btn-primary focus-ring mt-1 w-full justify-center"
            onClick={() => onSubmit(MOCK_RAW)}
          >
            <Share2 size={15} strokeWidth={SW} /> Share to Oasis
          </button>
          <span className="t-micro text-center" style={{ color: 'var(--ink-muted)' }}>
            Long-press a message → Share
          </span>
        </div>

        {/* ── Or paste it ─────────────────────────────────────────────────── */}
        <div className="flex flex-col gap-3">
          <Tag tone="yellow">OR PASTE THE CHAT</Tag>

          <label htmlFor="share-raw" className="sr-only">Paste the conversation</label>
          <textarea
            id="share-raw"
            value={text}
            onChange={e => setText(e.target.value)}
            rows={6}
            placeholder={'Farah: can you cover Friday evening?\n5pm-11pm, need to know tonight'}
            className="t-body focus-ring w-full p-3"
            style={{
              background: 'var(--surface)',
              color: 'var(--ink)',
              border: '2px solid var(--ink)',
              borderRadius: 'var(--r-md)',
              resize: 'vertical',
              minHeight: 128,
            }}
          />

          {/* These carry the 44px target in the drawing rather than in a .hit-44
              pseudo-element, because the row wraps. At 375px it breaks onto two
              lines 7px apart, and a centred 44px target over a 31px chip would
              hang 6.5px into the row below — two overlapping targets, which hands
              the tap to the wrong sample. A real height keeps the 7.5px gap. */}
          <div className="flex gap-2 flex-wrap">
            {SAMPLES.map(s => (
              <button
                key={s.label}
                className="chip focus-ring"
                style={{ minHeight: 44 }}
                onClick={() => setText(s.raw)}
              >
                {s.label}
              </button>
            ))}
          </div>

          <button
            className="btn btn-primary focus-ring self-start"
            disabled={empty}
            style={empty ? { opacity: 0.45, cursor: 'not-allowed' } : undefined}
            onClick={() => onSubmit(text)}
          >
            Check what it costs <ChevronRight size={16} strokeWidth={SW} />
          </button>
        </div>
      </div>
    </div>
  )
}
