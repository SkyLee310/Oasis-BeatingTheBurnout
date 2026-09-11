import { AlertTriangle, Layers } from 'lucide-react'

import { SW } from '../../ds'
import type { ProjectShare } from '../../logic/group'
import { longDate } from '../../logic/dates'
import RequestInbox from '../requests/RequestInbox'
import NewProjectForm from './NewProjectForm'

// --- Every assignment -------------------------------------------------------
// The sentence a single project cannot say. Each group only sees its own sheet,
// so three of them can each hand out an even share and still leave one person
// carrying more than a person has. Until these sat in one place nothing in the
// app could tell -- the page would show 69%, call it a conversation with three
// people, and the student would still be drowning for a reason no screen had a
// word for.
//
// It is also the way in. A list of your projects and a way to open one are the
// same list; a separate row of tabs above it would only say it twice.
//
// The request inbox is on this page rather than on a project, because an ask is
// answered without knowing which project page was last on screen -- the same
// reason record.ts scans every project for a rescued task.

export default function ProjectList({ shares, onOpen }: {
  shares: ProjectShare[]
  onOpen: (id: string) => void
}) {
  const over = shares.filter(s => s.over)

  const line = shares.length === 0
    ? 'Nothing here yet. Start an assignment below, or open an invite link from your group chat.'
    : over.length === 0
      ? `Your share is at or under an even split on all ${shares.length}.`
      : over.length === 1
        ? `You are over an even split on ${over[0].project.course}. The others are holding.`
        : `You are over an even split on ${over.length} of them -- ${over.map(s => s.project.course).join(' and ')}. Each of those groups only sees its own sheet.`

  return (
    <div className="flex flex-col gap-6 max-w-[1100px]">
      <header className="flex flex-col gap-3">
        <span className="t-eyebrow" style={{ color: 'var(--ink-2)' }}>GROUP PROJECTS</span>
        <h1 className="t-hero text-ink">Your assignments</h1>
      </header>

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

        <div className="flex flex-col gap-2">
          {shares.map(({ project, pct, over: isOver }) => (
            <button
              key={project.id}
              onClick={() => onOpen(project.id)}
              className="focus-ring press flex flex-col gap-2 p-3 text-left"
              style={{
                background: 'var(--surface)',
                border: '2px solid var(--ink)',
                borderRadius: 'var(--r-sm)',
                cursor: 'pointer',
              }}
            >
              <div className="flex items-center gap-2 w-full">
                <span className="t-label text-ink flex-1 min-w-0 truncate">{project.name}</span>
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
                {project.course} · due {longDate(project.due)} · {project.members.length} people
              </span>
            </button>
          ))}
        </div>

        <NewProjectForm onCreated={onOpen} />
      </section>

      <RequestInbox />
    </div>
  )
}
