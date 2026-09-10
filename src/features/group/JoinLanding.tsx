import { useState } from 'react'
import { ArrowRight, Check, Download, Share, Shield, Users } from 'lucide-react'

import { Initials, OasisBlob, SW, Tag } from '../../ds'
import { balance, projectByCode } from '../../logic/group'
import { longDate } from '../../logic/dates'
import { useDispatch, useOasis } from '../../state/store'

// ─── Join landing ─────────────────────────────────────────────────────────────
// What a teammate sees when they open the invite link. This is the whole
// download loop in one screen, and it is real: ?join=<code> against this build
// resolves the project and adds it. Two states, because a prototype that only
// shows the happy path is not showing the loop at all — the honest half is the
// person who does not have Oasis yet and has to install it first.

export default function JoinLanding({ code, onEnter }: { code: string; onEnter: () => void }) {
  const state = useOasis()
  const dispatch = useDispatch()

  // The code is the project's identity to anyone outside the app, so the link
  // resolves against every project the student holds rather than whichever one
  // the Group page happens to have open. Unresolvable reads as expired.
  const project = projectByCode(state, code)

  // The invitee we are standing in for: the first person still waiting on the link.
  const invitee = project?.members.find(m => m.status === 'invited' || m.status === 'none')

  const [installed, setInstalled] = useState(true)
  const [joined, setJoined] = useState(invitee?.status === 'joined')

  const join = () => {
    if (project && invitee) {
      dispatch({
        type: 'setMemberStatus', projectId: project.id, memberId: invitee.id, status: 'joined',
      })
    }
    setJoined(true)
  }

  if (!project) {
    return (
      <Frame>
        <h1 className="t-title text-ink">That link has expired</h1>
        <p className="t-body" style={{ color: 'var(--ink-2)' }}>
          Ask whoever sent it for a fresh one — invite codes are per project.
        </p>
        <button className="btn btn-secondary focus-ring self-start" onClick={onEnter}>
          Open Oasis anyway <ArrowRight size={16} strokeWidth={SW} />
        </button>
      </Frame>
    )
  }

  const b = balance(project)

  if (joined) {
    return (
      <Frame>
        <div className="flex items-center gap-2">
          <Check size={22} strokeWidth={SW} />
          <h1 className="t-title text-ink">You are on the project</h1>
        </div>
        <p className="t-body max-w-[46ch]" style={{ color: 'var(--ink-2)' }}>
          {project.name} is in your Oasis now. Your tasks are counted in your own
          week, and the split updates for everyone.
        </p>
        <button className="btn btn-primary focus-ring self-start" onClick={onEnter}>
          Open the project <ArrowRight size={16} strokeWidth={SW} />
        </button>
      </Frame>
    )
  }

  return (
    <Frame>
      <Tag tone="yellow">SHARED PROJECT</Tag>

      <div className="flex flex-col gap-1">
        <h1 className="t-title text-ink">{project.name}</h1>
        <span className="t-body" style={{ color: 'var(--ink-2)' }}>
          {project.course} · due {longDate(project.due)}
        </span>
      </div>

      {/* ── Who is already on it ──────────────────────────────────────────── */}
      <div className="flex flex-col gap-2">
        <span className="t-eyebrow" style={{ color: 'var(--ink-muted)' }}>
          <Users size={13} strokeWidth={SW} className="inline mr-1" />
          {b.shares.filter(s => s.member.status !== 'none').length} on board
        </span>
        <div className="flex flex-wrap gap-2">
          {project.members.map(m => (
            <span key={m.id} className="flex items-center gap-2 chip">
              <Initials
                size={22}
                initials={m.status === 'you' ? undefined : m.name.slice(0, 2).toUpperCase()}
              />
              {m.name}
            </span>
          ))}
        </div>
      </div>

      {/* ── Have the app, or do not ───────────────────────────────────────── */}
      <div className="flex gap-2 flex-wrap" role="group" aria-label="Do you have Oasis?">
        <button
          className={`chip chip-lg focus-ring hit-44 ${installed ? 'chip-selected' : ''}`}
          aria-pressed={installed}
          onClick={() => setInstalled(true)}
        >
          I have Oasis
        </button>
        <button
          className={`chip chip-lg focus-ring hit-44 ${!installed ? 'chip-selected' : ''}`}
          aria-pressed={!installed}
          onClick={() => setInstalled(false)}
        >
          I do not have it yet
        </button>
      </div>

      {installed ? (
        <button className="btn btn-primary focus-ring self-start" onClick={join}>
          Add this project <ArrowRight size={16} strokeWidth={SW} />
        </button>
      ) : (
        <div className="flex flex-col gap-3">
          <div
            className="flex flex-col gap-2 p-4"
            style={{
              background: 'var(--butter)',
              border: '2px solid var(--ink)',
              borderRadius: 'var(--r-md)',
            }}
          >
            <span className="t-label text-ink">
              <Download size={15} strokeWidth={SW} className="inline mr-1.5" />
              Install Oasis — 10 seconds, no account
            </span>
            <ol className="flex flex-col gap-1 pl-4" style={{ listStyle: 'decimal' }}>
              <li className="t-micro" style={{ color: 'var(--ink)' }}>
                Tap <Share size={12} strokeWidth={SW} className="inline" /> Share in your browser
              </li>
              <li className="t-micro" style={{ color: 'var(--ink)' }}>Choose "Add to Home Screen"</li>
              <li className="t-micro" style={{ color: 'var(--ink)' }}>Open Oasis and this project is waiting</li>
            </ol>
          </div>
          <button className="btn btn-primary focus-ring self-start" onClick={join}>
            Done — add the project <ArrowRight size={16} strokeWidth={SW} />
          </button>
        </div>
      )}

      <p className="t-micro flex items-start gap-2" style={{ color: 'var(--ink-muted)', lineHeight: 1.5 }}>
        <Shield size={14} strokeWidth={SW} className="shrink-0 mt-0.5" />
        You will see who has which task. Nobody on this project — including you —
        can see anyone else's energy score, sleep, or what they turned down.
      </p>
    </Frame>
  )
}

/** The invite arrives cold, outside the app shell, so it brings its own page. */
function Frame({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-full flex items-center justify-center px-4 py-10 bg-canvas">
      <div className="card card-pop p-6 sm:p-8 flex flex-col gap-5 w-full max-w-[520px]">
        <OasisBlob zone="green" size={54} float={false} />
        {children}
      </div>
    </div>
  )
}
