import { useState } from 'react'
import {
  AlertTriangle, Check, History, Layers, MessageCircle, Scale, Shield, UserPlus, Users,
} from 'lucide-react'

import { Initials, SW, Tag } from '../ds'
import type { ZoneKey } from '../ds'
import type { ProjectShare, Share } from '../logic/group'
import { activeProject, balance, capacityOf, sharesAcrossProjects } from '../logic/group'
import { longDate } from '../logic/dates'
import { useDispatch, useOasis } from '../state/store'
import type { Member } from '../state/types'
import CapacityChip from '../features/group/CapacityChip'
import InviteSheet from '../features/group/InviteSheet'
import TrackRecordSheet from '../features/record/TrackRecordSheet'
import RequestInbox from '../features/requests/RequestInbox'
import WhatsAppMessageSheet from '../features/group/WhatsAppMessageSheet'
import AddTaskRow from '../features/group/AddTaskRow'

// ─── Group ────────────────────────────────────────────────────────────────────
// Group assignments go wrong in two specific ways: the split is lopsided and
// nobody says it, and half the tasks have no owner. This page shows both as
// numbers, then hands over a message that raises it for you — the same move as
// the Decision Check, applied to a team instead of a request.
//
// A third way, which no single project can ever see: three assignments each
// hand out a perfectly even share, and a fair share of three projects is more
// than one person has. Every group is looking only at its own sheet, so nobody
// is behaving unreasonably and the student is still underwater. That is what
// the top card is for.
//
// Deliberate boundary: everything here is about the *project*. No teammate's
// personal energy score appears anywhere, and the page says so out loud.

const STATUS_COPY: Record<Member['status'], string> = {
  you: 'You',
  joined: 'On Oasis',
  invited: 'Invite sent',
  none: 'Not invited',
}

export default function GroupPage() {
  const state = useOasis()
  const dispatch = useDispatch()

  const project = activeProject(state)
  const across = sharesAcrossProjects(state)

  const [inviting, setInviting] = useState<Member | 'all' | null>(null)
  const [showWhatsApp, setShowWhatsApp] = useState(false)
  const [showRecord, setShowRecord] = useState(false)

  // Hooks first, then the guard. Only reachable with no projects at all —
  // activeProject falls back to the first, so a stale id cannot land here.
  if (!project) {
    return (
      <div className="card p-5 max-w-[560px]">
        <p className="t-body" style={{ color: 'var(--ink-2)' }}>
          No group projects yet. Open an invite link and the split appears here.
        </p>
      </div>
    )
  }

  const b = balance(project)
  const you = b.shares.find(s => s.member.status === 'you')

  return (
    <div className="flex flex-col gap-6 max-w-[1100px]">
      {/* ── Header ────────────────────────────────────────────────────────── */}
      <header className="flex flex-col gap-3">
        <Tag tone="yellow">GROUP PROJECT</Tag>
        <h1 className="t-hero text-ink">{project.name}</h1>
        <div className="flex flex-wrap gap-2">
          <span className="chip">{project.course}</span>
          <span className="chip">Due {longDate(project.due)}</span>
          <span className="chip">
            <Users size={13} strokeWidth={SW} /> {project.members.length} people
          </span>
          {you && <span className="chip chip-selected">You hold {you.pct}%</span>}
        </div>
      </header>

      {/* ── Every project at once ─────────────────────────────────────────── */}
      {across.length > 1 && (
        <AcrossProjects
          shares={across}
          activeId={project.id}
          onSelect={id => dispatch({ type: 'selectProject', projectId: id })}
        />
      )}

      {/* ── The imbalance, named ──────────────────────────────────────────── */}
      {b.overloaded && (
        <div
          className="flex gap-3 p-4"
          style={{ background: 'var(--blush)', border: '2px solid var(--ink)', borderRadius: 'var(--r-md)' }}
        >
          <AlertTriangle size={20} strokeWidth={SW} className="shrink-0 mt-0.5" />
          <div className="flex flex-col gap-1">
            <span className="t-label text-ink">
              {b.overloaded.member.status === 'you'
                ? `You are carrying ${b.overloaded.pct}% of this project`
                : `${b.overloaded.member.name} is carrying ${b.overloaded.pct}% of this project`}
            </span>
            <span className="t-micro" style={{ color: 'var(--ink)', lineHeight: 1.5 }}>
              An even split across {project.members.length} people is{' '}
              {Math.round(100 / project.members.length)}% each. Weight counts effort,
              not task count — a five-point build is not one slide deck.
            </span>
          </div>
        </div>
      )}

      {/* ── What a teammate has asked you for ─────────────────────────────
          On this page rather than only on Home, because the ask and the split
          it would change are the same conversation. */}
      <RequestInbox />

      <div className="grid grid-cols-1 lg:grid-cols-[1.1fr_1fr] gap-6 items-start">
        {/* ── Who is carrying what ────────────────────────────────────────── */}
        <section className="card p-5 flex flex-col gap-4">
          <div className="flex items-center justify-between gap-3">
            <span className="t-sub text-ink">
              <Scale size={17} strokeWidth={SW} className="inline mr-2" />
              The split
            </span>
            <span className="t-micro" style={{ color: 'var(--ink-muted)' }}>
              {b.assigned} points assigned
            </span>
          </div>

          <div className="flex flex-col gap-4">
            {b.shares.map(s => (
              <ShareRow
                key={s.member.id}
                share={s}
                capacity={capacityOf(project, s.member.id)}
                onInvite={() => setInviting(s.member)}
                onOpenRecord={() => setShowRecord(true)}
              />
            ))}
          </div>

          <div className="flex gap-3 flex-wrap pt-1">
            <button className="btn btn-primary focus-ring" onClick={() => setShowWhatsApp(true)}>
              <MessageCircle size={16} strokeWidth={SW} /> WhatsApp group message
            </button>
            <button className="btn btn-secondary focus-ring" onClick={() => setInviting('all')}>
              <UserPlus size={16} strokeWidth={SW} /> Invite
            </button>
          </div>

          <p className="t-micro flex items-start gap-2" style={{ color: 'var(--ink-muted)', lineHeight: 1.5 }}>
            <Shield size={14} strokeWidth={SW} className="shrink-0 mt-0.5" />
            Everyone here sees the project split and whether you have room. Nobody sees
            anyone&apos;s energy score, sleep, or what they turned down — that stays on
            your phone.
          </p>
        </section>

        {/* ── Tasks ───────────────────────────────────────────────────────── */}
        <section className="card p-5 flex flex-col gap-4">
          <div className="flex items-center justify-between gap-3">
            <span className="t-sub text-ink">Tasks</span>
            {b.unassigned.length > 0 && (
              <span className="t-micro" style={{ color: 'var(--ink-muted)' }}>
                {b.unassigned.length} unclaimed
              </span>
            )}
          </div>

          {project.tasks.length === 0 ? (
            <p className="t-body" style={{ color: 'var(--ink-2)' }}>
              No tasks yet. Add them and the split appears.
            </p>
          ) : (
            <div className="flex flex-col gap-2">
              {project.tasks.map(t => (
                <div
                  key={t.id}
                  className="flex items-center gap-3 p-3"
                  style={{
                    background: t.assignee === null ? 'var(--butter)' : 'var(--surface-2)',
                    border: '2px solid var(--ink)',
                    borderRadius: 'var(--r-sm)',
                  }}
                >
                  <button
                    onClick={() =>
                      dispatch({ type: 'toggleTaskDone', projectId: project.id, taskId: t.id })
                    }
                    aria-pressed={t.done}
                    aria-label={`Mark ${t.title} ${t.done ? 'not done' : 'done'}`}
                    className="focus-ring hit-44 shrink-0 flex items-center justify-center"
                    style={{
                      width: 24, height: 24, borderRadius: 'var(--r-sm)',
                      border: '2px solid var(--ink)',
                      background: t.done ? 'var(--mint-deep)' : 'var(--surface)',
                      cursor: 'pointer',
                    }}
                  >
                    {t.done && <Check size={14} strokeWidth={3} style={{ color: 'var(--ink)' }} />}
                  </button>

                  <div className="flex flex-col gap-0.5 flex-1 min-w-0">
                    <span
                      className="t-label text-ink"
                      style={{ textDecoration: t.done ? 'line-through' : 'none' }}
                    >
                      {t.title}
                    </span>
                    <span className="t-micro" style={{ color: 'var(--ink-muted)' }}>
                      weight {t.weight}
                    </span>
                  </div>

                  <label className="sr-only" htmlFor={`assign-${t.id}`}>
                    Who is doing {t.title}
                  </label>
                  <select
                    id={`assign-${t.id}`}
                    value={t.assignee ?? ''}
                    onChange={e =>
                      dispatch({
                        type: 'assignTask',
                        projectId: project.id,
                        taskId: t.id,
                        memberId: e.target.value === '' ? null : e.target.value,
                      })
                    }
                    className="t-micro focus-ring shrink-0"
                    style={{
                      background: 'var(--surface)',
                      color: 'var(--ink)',
                      border: '2px solid var(--ink)',
                      borderRadius: 'var(--r-sm)',
                      padding: '6px 8px',
                      minHeight: 44,
                    }}
                  >
                    <option value="">Nobody</option>
                    {project.members.map(m => (
                      <option key={m.id} value={m.id}>{m.name}</option>
                    ))}
                  </select>
                </div>
              ))}
            </div>
          )}
          <AddTaskRow project={project} />
        </section>
      </div>

      {showWhatsApp && (
        <WhatsAppMessageSheet
          project={project}
          onClose={() => setShowWhatsApp(false)}
        />
      )}

      {showRecord && <TrackRecordSheet onClose={() => setShowRecord(false)} />}

      {inviting && (
        <InviteSheet
          project={project}
          member={inviting === 'all' ? undefined : inviting}
          onClose={() => setInviting(null)}
        />
      )}
    </div>
  )
}

/**
 * One member's bar. Two things are said about every person here and both come
 * from the shared project: their share of the split, as a percentage, and their
 * capacity, as a word. Nothing on this row is derived from anybody's energy
 * score, sleep or check-in — which is what makes the promise under the list
 * literally true rather than a claim.
 *
 * One row has something the others do not: yours opens your track record. There
 * is no equivalent control on a teammate's row, and that absence is the feature
 * — a history you can open about somebody else is a rating system.
 */
function ShareRow({ share, capacity, onInvite, onOpenRecord }: {
  share: Share
  capacity: ZoneKey
  onInvite: () => void
  onOpenRecord: () => void
}) {
  const { member, weight, done, pct, over } = share
  const progress = weight > 0 ? Math.round((done / weight) * 100) : 0

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-3">
        <Initials
          size={32}
          initials={member.status === 'you' ? undefined : member.name.slice(0, 2).toUpperCase()}
        />

        <div className="flex flex-col gap-1 flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="t-label text-ink">{member.name}</span>
            <CapacityChip zone={capacity} />
            {member.status === 'you' && (
              <button
                className="chip focus-ring hit-44"
                onClick={onOpenRecord}
                aria-label="Open your track record"
                style={{ minHeight: 30 }}
              >
                <History size={12} strokeWidth={SW} /> Track record
              </button>
            )}
          </div>
          <span className="t-micro" style={{ color: 'var(--ink-muted)' }}>
            {STATUS_COPY[member.status]}
            {member.status !== 'none' && ` · ${weight} points · ${progress}% done`}
          </span>
        </div>

        {member.status === 'none' ? (
          <button className="chip focus-ring hit-44 shrink-0" onClick={onInvite} style={{ minHeight: 34 }}>
            <UserPlus size={13} strokeWidth={SW} /> Invite
          </button>
        ) : (
          <span className="t-stat shrink-0" style={{ fontSize: 17, color: 'var(--ink)' }}>{pct}%</span>
        )}
      </div>

      <div className="track" style={{ height: 12 }}>
        <div
          className="bar-fill"
          style={{
            height: '100%',
            width: `${pct}%`,
            background: over ? 'var(--blush-deep)' : 'var(--sky-deep)',
          }}
        />
      </div>

      {over && (
        <span className="t-micro" style={{ color: 'var(--ink-2)' }}>Over an even share</span>
      )}
    </div>
  )
}

/**
 * The sentence a single project cannot say. Each group only sees its own sheet,
 * so three of them can each hand out an even share and still leave one person
 * carrying more than a person has. Until these sat in one place nothing in the
 * app could tell — the page would show 69%, call it a conversation with three
 * people, and the student would still be drowning for a reason no screen had a
 * word for.
 *
 * It is also the switcher. A list of your projects and a way to open one are
 * the same list; a separate row of tabs above it would only say it twice.
 */
function AcrossProjects({ shares, activeId, onSelect }: {
  shares: ProjectShare[]
  activeId: string
  onSelect: (id: string) => void
}) {
  const over = shares.filter(s => s.over)

  const line = over.length === 0
    ? `Your share is at or under an even split on all ${shares.length}.`
    : over.length === 1
      ? `You are over an even split on ${over[0].project.course}. The others are holding.`
      : `You are over an even split on ${over.length} of them — ${over.map(s => s.project.course).join(' and ')}. Each of those groups only sees its own sheet.`

  return (
    <section className="card p-5 flex flex-col gap-4">
      <div className="flex items-center justify-between gap-3">
        <span className="t-sub text-ink">
          <Layers size={17} strokeWidth={SW} className="inline mr-2" />
          Across every project
        </span>
        <span className="t-micro" style={{ color: 'var(--ink-muted)' }}>
          {shares.length} running
        </span>
      </div>

      <p className="t-body" style={{ color: 'var(--ink-2)', lineHeight: 1.5 }}>{line}</p>

      <div className="flex flex-col gap-2" role="group" aria-label="Switch project">
        {shares.map(({ project, pct, over: isOver }) => {
          const open = project.id === activeId
          return (
            <button
              key={project.id}
              onClick={() => onSelect(project.id)}
              aria-pressed={open}
              className="focus-ring flex flex-col gap-2 p-3 text-left"
              style={{
                background: open ? 'var(--surface-2)' : 'var(--surface)',
                border: '2px solid var(--ink)',
                borderRadius: 'var(--r-sm)',
                boxShadow: open ? '3px 3px 0 var(--ink)' : 'none',
                cursor: 'pointer',
              }}
            >
              <div className="flex items-center gap-2 w-full">
                <span className="t-label text-ink flex-1 min-w-0 truncate">{project.course}</span>
                {isOver && <AlertTriangle size={13} strokeWidth={SW} className="shrink-0" />}
                <span className="t-stat shrink-0" style={{ fontSize: 15, color: 'var(--ink)' }}>
                  {pct}%
                </span>
              </div>

              <div className="track" style={{ height: 10 }}>
                <div
                  className="bar-fill"
                  style={{
                    height: '100%',
                    width: `${pct}%`,
                    background: isOver ? 'var(--blush-deep)' : 'var(--sky-deep)',
                  }}
                />
              </div>

              <span className="t-micro" style={{ color: 'var(--ink-muted)' }}>
                Due {longDate(project.due)}{open ? ' · open' : ''}
              </span>
            </button>
          )
        })}
      </div>
    </section>
  )
}
