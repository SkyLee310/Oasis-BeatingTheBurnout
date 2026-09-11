import { useState } from 'react'
import { Plus, X } from 'lucide-react'

import { SW } from '../../ds'
import { useDispatch } from '../../state/store'
import type { GroupProject } from '../../state/types'

// ─── Add a task ───────────────────────────────────────────────────────────────
// A split you cannot add to is a split you stop trusting the moment the group
// agrees on something new in the chat. Weight is chips rather than a number
// field because the scale is 1-5 and every share on the page is a percentage of
// the total — one absurd figure rewrites everybody else's number.

const WEIGHTS = [1, 2, 3, 4, 5]

export default function AddTaskRow({ project }: { project: GroupProject }) {
  const dispatch = useDispatch()

  const [open, setOpen] = useState(false)
  const [title, setTitle] = useState('')
  const [weight, setWeight] = useState(3)
  const [assignee, setAssignee] = useState('')

  const reset = () => {
    setTitle(''); setWeight(3); setAssignee(''); setOpen(false)
  }

  const submit = () => {
    const clean = title.trim()
    if (!clean) return
    dispatch({
      type: 'addTask',
      projectId: project.id,
      task: {
        // Derived, never random: the reducer stays pure and the demo replays to
        // the same week. Scoped by project so two projects cannot collide.
        id: `${project.id}-t${project.tasks.length}`,
        title: clean,
        weight,
        assignee: assignee === '' ? null : assignee,
        done: false,
      },
    })
    reset()
  }

  if (!open) {
    return (
      <button onClick={() => setOpen(true)}
        className="btn btn-secondary focus-ring hit-44 flex items-center gap-2 self-start">
        <Plus size={15} strokeWidth={SW} />
        Add task
      </button>
    )
  }

  return (
    <div className="flex flex-col gap-3 p-3.5" style={{
      background: 'var(--surface-2)', border: '2px solid var(--ink)', borderRadius: 'var(--r-sm)',
    }}>
      <div className="flex items-center justify-between gap-3">
        <span className="t-label text-ink">New task</span>
        <button onClick={reset} className="btn-icon focus-ring hit-44" aria-label="Cancel adding a task">
          <X size={16} strokeWidth={SW} />
        </button>
      </div>

      <label className="sr-only" htmlFor="new-task-title">Task name</label>
      <input id="new-task-title" value={title}
        onChange={e => setTitle(e.target.value)}
        onKeyDown={e => { if (e.key === 'Enter') submit() }}
        placeholder="Report write-up"
        className="t-body focus-ring w-full p-3"
        style={{
          background: 'var(--surface)', color: 'var(--ink)',
          border: '2px solid var(--ink)', borderRadius: 'var(--r-sm)', minHeight: 44,
        }} />

      <div className="flex flex-col gap-2">
        <span className="t-micro" style={{ color: 'var(--ink-muted)' }}>Weight</span>
        <div className="flex gap-2 flex-wrap" role="group" aria-label="Task weight">
          {WEIGHTS.map(w => (
            <button key={w} onClick={() => setWeight(w)} aria-pressed={weight === w}
              className={`chip focus-ring hit-44 ${weight === w ? 'chip-selected' : ''}`}>
              {w}
            </button>
          ))}
        </div>
      </div>

      <label className="sr-only" htmlFor="new-task-assignee">Who is doing it</label>
      <select id="new-task-assignee" value={assignee} onChange={e => setAssignee(e.target.value)}
        className="t-micro focus-ring"
        style={{
          background: 'var(--surface)', color: 'var(--ink)', border: '2px solid var(--ink)',
          borderRadius: 'var(--r-sm)', padding: '6px 8px', minHeight: 44,
        }}>
        <option value="">Nobody yet</option>
        {project.members.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
      </select>

      <button onClick={submit} disabled={title.trim() === ''}
        className="btn btn-primary focus-ring hit-44 self-start"
        style={{ opacity: title.trim() === '' ? 0.5 : 1 }}>
        Add to the split
      </button>
    </div>
  )
}
