import { useState } from 'react'
import {
  AlertTriangle, ArrowLeft, Check, History, MessageCircle, Scale, Shield, UserPlus, Users,
} from 'lucide-react'

import { Initials, SW, Tag } from '../../ds'
import MeAvatar from '../me/MeAvatar'
import type { ZoneKey } from '../../ds'
import type { Share } from '../../logic/group'
import { balance, capacityOf } from '../../logic/group'
import { longDate } from '../../logic/dates'
import { useDispatch } from '../../state/store'
import type { GroupProject, Member } from '../../state/types'
import CapacityChip from './CapacityChip'
import InviteSheet from './InviteSheet'
import WhatsAppMessageSheet from './WhatsAppMessageSheet'
import AddTaskRow from './AddTaskRow'

// --- One assignment ---------------------------------------------------------
// Everything about a single project: who is carrying what, what is unclaimed,
// and the two messages that raise it. Split out of GroupPage when the Group tab
// became a list of assignments you open, so the page above can be a list and
// nothing in here had to learn there are several.
//
// Deliberate boundary, unchanged by the split: everything here is about the
// *project*. No teammate's personal energy score appears anywhere, and the page
// says so out loud.

const STATUS_COPY: Record<Member['status'], string> = {
  you: 'You',
  joined: 'On Oasis',
  invited: 'Invite sent',
  none: 'Not invited',
}

export default function ProjectDetail({ project, onBack, onGoMe }: {
  project: GroupProject
  onBack?: () => void
  onGoMe: () => void
}) {
  const dispatch = useDispatch()

  const [inviting, setInviting] = useState<Member | 'all' | null>(null)
  const [showWhatsApp, setShowWhatsApp] = useState(false)

  const b = balance(project)
  const you = b.shares.find(s => s.member.status === 'you')

  return (
    <div className="flex flex-col gap-6 max-w-[1100px]">
      {onBack && (
        <button className="chip focus-ring hit-44 self-start" onClick={onBack}>
          <ArrowLeft size={14} strokeWidth={SW} /> All assignments
        </button>
      )}

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
                onOpenRecord={onGoMe}
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
        {member.status === 'you'
          ? <MeAvatar size={32} />
          : <Initials size={32} initials={member.name.slice(0, 2).toUpperCase()} />}

        <div className="flex flex-col gap-1 flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="t-label text-ink">{member.name}</span>
            <CapacityChip zone={capacity} />
            {member.status === 'you' && (
              <button
                className="chip focus-ring hit-44"
                onClick={onOpenRecord}
                aria-label="Open your own page"
                style={{ minHeight: 30 }}
              >
                <History size={12} strokeWidth={SW} /> Your record
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
