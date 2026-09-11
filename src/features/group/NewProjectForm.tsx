import { useState } from 'react'
import { Plus, X } from 'lucide-react'

import { SW } from '../../ds'
import { newProject } from '../../logic/compose'
import { useDispatch, useOasis } from '../../state/store'

// --- Start an assignment ----------------------------------------------------
// Three fields, because three is what the split needs to mean anything: a name
// to tell it apart, a course so the cross-project sentence can name it, and a
// date so it can sit in the same week as everything else.
//
// No member list here. You are the only member of an assignment you just made,
// and everyone else arrives through the invite link -- which is the loop this
// app already has, and the one a form full of name fields would replace with
// typing.

export default function NewProjectForm({ onCreated }: { onCreated?: (id: string) => void }) {
  const state = useOasis()
  const dispatch = useDispatch()

  const [open, setOpen] = useState(false)
  const [name, setName] = useState('')
  const [course, setCourse] = useState('')
  const [due, setDue] = useState('')

  const ready = name.trim() !== '' && course.trim() !== '' && due !== ''

  const reset = () => {
    setName('')
    setCourse('')
    setDue('')
    setOpen(false)
  }

  const submit = () => {
    if (!ready) return
    const project = newProject(state, { name: name.trim(), course: course.trim(), due })
    dispatch({ type: 'addProject', project })
    reset()
    onCreated?.(project.id)
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="btn btn-secondary focus-ring hit-44 flex items-center gap-2 self-start"
      >
        <Plus size={15} strokeWidth={SW} />
        New assignment
      </button>
    )
  }

  const field = {
    background: 'var(--surface)',
    color: 'var(--ink)',
    border: '2px solid var(--ink)',
    borderRadius: 'var(--r-sm)',
    minHeight: 44,
  } as const

  return (
    <div
      className="flex flex-col gap-3 p-3.5"
      style={{
        background: 'var(--surface-2)',
        border: '2px solid var(--ink)',
        borderRadius: 'var(--r-sm)',
      }}
    >
      <div className="flex items-center justify-between gap-3">
        <span className="t-label text-ink">New assignment</span>
        <button
          onClick={reset}
          className="btn-icon focus-ring hit-44"
          aria-label="Cancel starting an assignment"
        >
          <X size={16} strokeWidth={SW} />
        </button>
      </div>

      <label className="sr-only" htmlFor="new-project-name">Assignment name</label>
      <input
        id="new-project-name"
        value={name}
        onChange={e => setName(e.target.value)}
        onKeyDown={e => { if (e.key === 'Enter') submit() }}
        placeholder="DB Assignment 1 -- group report"
        className="t-body focus-ring w-full p-3"
        style={field}
      />

      <label className="sr-only" htmlFor="new-project-course">Course</label>
      <input
        id="new-project-course"
        value={course}
        onChange={e => setCourse(e.target.value)}
        onKeyDown={e => { if (e.key === 'Enter') submit() }}
        placeholder="Database Systems"
        className="t-body focus-ring w-full p-3"
        style={field}
      />

      <div className="flex flex-col gap-2">
        <label className="t-micro" htmlFor="new-project-due" style={{ color: 'var(--ink-muted)' }}>
          Due
        </label>
        <input
          id="new-project-due"
          type="date"
          value={due}
          onChange={e => setDue(e.target.value)}
          className="t-body focus-ring w-fit p-3"
          style={field}
        />
      </div>

      <button
        onClick={submit}
        disabled={!ready}
        className="btn btn-primary focus-ring hit-44 self-start"
        style={{ opacity: ready ? 1 : 0.5 }}
      >
        Start it
      </button>
    </div>
  )
}
